import express from "express";
import Redis from "ioredis";
import { v4 as uuidv4 } from "uuid";
import { z } from "zod";
import { requireAuth } from "./utils/auth.js";

const app = express();
app.use(express.json());

const REDIS_URL = "redis://localhost:6379";
const INSTANCE_RESPONSE_QUEUE = "response-queue-backend-1";
const ENGINE_INTAKE_QUEUE = "backend-to-engine-broker";

const redisPublisher = new Redis(REDIS_URL);
const redisSubscriber = new Redis(REDIS_URL);

redisPublisher.on("error", (err) =>
  console.error("[!] Redis Publisher Error:", err.message),
);
redisSubscriber.on("error", (err) =>
  console.error("[!] Redis Subscriber Error:", err.message),
);

const pendingRequests = new Map<string, express.Response>();

// --- Zod Validation Schema ---
// We use strings for price/quantity to prevent floating-point precision loss
const OrderSchema = z
  .object({
    market: z.string().min(3),
    side: z.enum(["BUY", "SELL"]),
    orderType: z.enum(["LIMIT", "MARKET"]),
    price: z.string().optional(),
    quantity: z.string().min(1),
  })
  .refine(
    (data) => {
      // Custom validation: LIMIT orders must have a price
      if (data.orderType === "LIMIT" && !data.price) {
        return false;
      }
      return true;
    },
    {
      message: "Limit orders must include a valid price",
      path: ["price"],
    },
  );

app.post("/api/v1/orders", requireAuth, async (req, res) => {
  try {
    const validatedData = OrderSchema.parse(req.body);

    // 2. Extract userId from request (populated by requireAuth middleware)
    const userId = req.userId;
    if (!userId) {
      res.status(401).json({ error: "Missing authenticated user" });
      return;
    }
    // 3. Generate Correlation ID
    const correlationId = uuidv4();

    // 4. Construct Message Envelope
    const messageEnvelope = {
      type: "PLACE_ORDER",
      correlationId: correlationId,
      replyTo: INSTANCE_RESPONSE_QUEUE,
      data: {
        userId,
        ...validatedData,
      },
    };

    // 5. Suspend the request
    pendingRequests.set(correlationId, res);

    // 6. Push to Engine Intake Queue
    await redisPublisher.lpush(
      ENGINE_INTAKE_QUEUE,
      JSON.stringify(messageEnvelope),
    );

    console.log(`[>>] Order sent to engine. CorrelationId: ${correlationId}`);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res
        .status(400)
        .json({ error: "Validation failed", details: error.errors });
      return;
    }
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// --- The Redis Background Listener ---
async function startRedisListener() {
  console.log(
    `[*] Listening for engine replies on: ${INSTANCE_RESPONSE_QUEUE}`,
  );

  while (true) {
    try {
      // BRPOP blocks until a message is received
      const response = await redisSubscriber.brpop(INSTANCE_RESPONSE_QUEUE, 0);

      if (response) {
        const [queueName, messageString] = response;
        const engineReply = JSON.parse(messageString);

        console.log(
          `[<<] Engine replied for CorrelationId: ${engineReply.correlationId}`,
        );

        // Match the correlation ID and send the HTTP response
        const pendingRes = pendingRequests.get(engineReply.correlationId);

        if (pendingRes) {
          pendingRes.json(engineReply.payload);
          pendingRequests.delete(engineReply.correlationId); // Free up memory
        }
      }
    } catch (error) {
      console.error("[!] Redis listener error:", error);
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }
}

// --- Boot Sequence ---
startRedisListener();

app.listen(3000, () => {
  console.log("🚀 API Gateway live on http://localhost:3000");
});
