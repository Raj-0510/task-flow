import bcrypt from "bcrypt";
import { prisma } from "./db";

export async function seedDemoAccount() {
  try {
    const demoEmail = "demo@taskflow.com";
    const existing = await prisma.user.findUnique({ where: { email: demoEmail } });
    if (!existing) {
      const hash = await bcrypt.hash("demo123", 10);
      await prisma.user.create({
        data: {
          email: demoEmail,
          password: hash,
          name: "Demo User",
          role: "USER"
        }
      });
      console.log("✅ Demo account created: demo@taskflow.com / demo123");
    }
  } catch (error) {
    console.error("Failed to seed demo account:", error);
  }
}
