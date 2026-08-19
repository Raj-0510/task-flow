import "dotenv/config";
import express from "express";
import cors from "cors";
import morgan from "morgan";
import fs from "fs";
import path from "path";
import authRoutes from "./authRoutes";
import dashboardRoutes from "./dashboardRoutes";
import projectRoutes from "./projectRoutes";
import taskRoutes from "./taskRoutes";
import adminRoutes from "./adminRoutes";
import stripeRoutes from "./stripeRoutes";


const app = express();

app.use(cors());

// // Stripe webhook needs raw body for signature verification — must be before express.json()
app.use("/api/stripe/webhook", express.raw({ type: "application/json" }));

app.use(express.json());
// Create a write stream (in append mode) for Morgan logs
const accessLogStream = fs.createWriteStream(path.resolve(process.cwd(), "logs", "morgan.log"), { flags: "a" });

// Log to console
app.use(morgan('combined'));
// Also log to file
app.use(morgan('combined', { stream: accessLogStream }));

app.get("/", (req, res) => {
  res.send("Backend working ✅");
});

// Public health endpoint
app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "ok", uptime: process.uptime(), timestamp: Date.now() });
});

app.use("/api/auth", authRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/stripe", stripeRoutes);
app.use("/api", taskRoutes);

import { seedDemoAccount } from "./seedDemo";

const PORT = process.env.PORT || 3000;
app.listen(PORT, async () => {
  await seedDemoAccount();
  console.log("Server running on " + PORT + " 🚀");
});
