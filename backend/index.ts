import express from "express";
const app = express();
import bcrypt from "bcrypt";
import { createClient } from "redis";

import { PrismaClient } from "./generated/prisma";
import dotenv from "dotenv";
dotenv.config();

const client = await createClient()
  .on("error", (err) => console.log("Redis Client Error", err))
  .connect();

app.post("/signup", async (req, res) => {
  // take user from req.body
  // now check wedther user alredy exist or not
  // now if user not exist the hash the password
  // after hasing password and having uniqe username push it to prima to create a new user
  // the send success response
  //
  try {
    const { username, password } = req.body;

    const checkuser = await prisma.user.findUniqe({
      where: { username: username },
    });

    if (checkuser) {
      return res.status(409).json({
        message: "User already exists",
      });
    }
    const hasedpass = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        username,
        password: hasedpass,
      },
    });
    res.status(201).json({
      message: "User is create succesfully",
      userId: user.Id,
    });
  } catch (error) {
    res.status(500).json({
      message: "Internal server error",
    });
  }
});

app.post("/signin", async (req, res) => {
  // take useranme and password as an import
  // check does user exist
  // then decript then decript the password
  // then ? i don't know I guess
  try {
    const { username, password } = req.body;

    const user = await prisma.user.findUnique({
      where: {
        username,
      },
    });

    if (!user) {
      return res.status(401).json({
        message: "Invalid username or password",
      });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      return res.status(401).json({
        message: "Invalid username or password",
      });
    }

    const token = jwt.sign(
      {
        userId: user.id,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      },
    );

    res.json({
      token,
    });
  } catch (error) {
    res.status(500).json({
      message: "Internal server error",
    });
  }
});

app.post("/order", async (req, res) => {
  // Validate request
  // VARIFY THE USER FROM JWT
  // Verify user balance
  // Create order in DB
  // Send order to matching engine
  // Matching engine fills against opposite orders
  // Update balances
  // Return filled quantity and average price
  try {
    const { market, price, qty, type, side } = req.body;

    const order = await prisma.order.create({
      data: {
        userId: req.user.userId,
        market,
        price,
        qty,
        type,
        side,
      },
    });

    res.json({
      orderId: order.id,
      filledQty: order.filledQty,
      TotalPrice: 0,
    });
  } catch (err) {
    res.status(400).json({
      message: "Invalid order",
    });
  }
});
