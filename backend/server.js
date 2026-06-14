import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import paymentRoutes from "./routes/paymentRoutes.js";

const app = express();

app.use(cors());

// ✅ CRITICAL: /webhook must get raw Buffer BEFORE express.json() touches it
app.use((req, res, next) => {
  if (req.originalUrl === "/api/payment/webhook") {
    express.raw({ type: "*/*" })(req, res, next);
  } else {
    express.json()(req, res, next);
  }
});

app.use("/api/payment", paymentRoutes);

app.get("/", (req, res) => {
  res.json({
    status: "running",
    service: "Atlantis Protocol Razorpay Backend",
    version: "1.0.0",
    timestamp: new Date().toISOString()
  });
});

app.use((req, res) => {
  res.status(404).json({ error: "Endpoint not found", path: req.path });
});

app.use((err, req, res, next) => {
  console.error("❌ Server error:", err);
  res.status(500).json({ error: "Internal server error", message: err.message });
});

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`\n${"=".repeat(60)}`);
  console.log(`✅ IARRD Payment Backend Running`);
  console.log(`📌 Port: ${PORT}`);
  console.log(`🔑 Razorpay Key ID: ${process.env.RAZORPAY_KEY_ID ? "✅ Loaded" : "❌ Missing"}`);
  console.log(`🔐 Razorpay Secret: ${process.env.RAZORPAY_KEY_SECRET ? "✅ Loaded" : "❌ Missing"}`);
  console.log(`🔔 Webhook Secret: ${process.env.RAZORPAY_WEBHOOK_SECRET ? "✅ Loaded" : "❌ Missing"}`);
  console.log(`${"=".repeat(60)}\n`);
});

process.on("SIGTERM", () => {
  server.close(() => process.exit(0));
});