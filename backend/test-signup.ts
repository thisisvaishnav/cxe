import { prisma } from "./src/db.js";
import { updateRedisBalance, connectRedis } from "./src/utils/engine-client.js";
import bcrypt from "bcryptjs";

async function main() {
  try {
    console.log("Connecting Redis...");
    await connectRedis();
    console.log("Redis connected.");

    const username = "testuser_" + Date.now();
    const password = "password123";
    const hashedPassword = await bcrypt.hash(password, 10);

    console.log("Creating user in Prisma...");
    const user = await prisma.user.create({
      data: {
        username,
        password: hashedPassword,
        balance: {
          create: {
            usd: 50000.0,
          },
        },
      },
      include: {
        balance: true,
      },
    });
    console.log("User created:", user);

    console.log("Updating Redis balance...");
    await updateRedisBalance(user.id.toString(), 50000.0);
    console.log("Redis balance updated successfully.");
  } catch (error) {
    console.error("Signup simulation failed:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
