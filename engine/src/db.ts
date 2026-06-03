// engine/src/db.ts

import { PrismaClient } from "../../backend/generated/prisma/client.ts";

// Initialize the Prisma client to connect to your PostgreSQL database
const prisma = new PrismaClient();

export const db = {
  /**
   * Fetches all user balances from the database.
   * This is only called ONCE when the engine starts up.
   */
  getAllBalances: async () => {
    try {
      // Assuming you have a 'Balance' model in your prisma.schema
      const balances = await prisma.balance.findMany();
      return balances;
    } catch (error) {
      console.error("Failed to fetch balances from DB:", error);
      throw error;
    }
  },

  /**
   * Fetches all orders that haven't been filled yet.
   */
  getActiveOrders: async () => {
    try {
      // Assuming you track order status, and 'OPEN' means not fully filled
      const openOrders = await prisma.order.findMany({
        where: {
          status: "OPEN", // Only grab orders that need to be in the live order book
        },
      });
      return openOrders;
    } catch (error) {
      console.error("Failed to fetch active orders from DB:", error);
      throw error;
    }
  },
};
