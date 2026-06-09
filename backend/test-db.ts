import { prisma } from "./src/db.js";

async function main() {
  try {
    console.log("Testing connection...");
    const users = await prisma.user.findMany();
    console.log("Users:", users);
  } catch (error) {
    console.error("Connection failed:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
