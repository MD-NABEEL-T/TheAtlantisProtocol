import dotenv from "dotenv";
dotenv.config();

import Razorpay from "razorpay";
import crypto from "crypto";

// ✅ CRITICAL FIX: Validate env vars on startup
if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
  console.error("❌ FATAL ERROR: RAZORPAY_KEY_ID or RAZORPAY_KEY_SECRET missing in .env");
  console.error("   Payment module will not work. Server starting anyway for diagnostics.");
  // DO NOT process.exit(1) here - let server start for debugging
}

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

export const createOrder = async (req, res) => {
  try {
    // ✅ FIX: Changed from 1 * 100 to 99 * 100
    const options = {
      amount: 99 * 100,  // ₹99.00 = 9900 paise
      currency: "INR",
      receipt: `atlantis_${Date.now()}`
    };

    console.log("📦 Creating Razorpay order for ₹99 — Atlantis Protocol...");
    const order = await razorpay.orders.create(options);
    console.log(`✅ Order created: ${order.id}`);

    
    res.status(200).json({
      success: true,
      order,
      key: process.env.RAZORPAY_KEY_ID
    });

  } catch (error) {
    console.error("❌ Order creation failed:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to create payment order: " + error.message
    });
  }
};

export const verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    } = req.body;

    // ✅ FIX: Validate all required fields
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      console.warn("⚠️  Missing payment verification fields:", {
        order_id: !!razorpay_order_id,
        payment_id: !!razorpay_payment_id,
        signature: !!razorpay_signature
      });
      return res.status(400).json({
        success: false,
        message: "Missing required payment fields"
      });
    }

    // ✅ Generate signature from backend secret
    const generatedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(
        razorpay_order_id + "|" + razorpay_payment_id
      )
      .digest("hex");

    // ✅ Compare signatures securely
    const isValid = generatedSignature === razorpay_signature;
    
    console.log(`🔐 Signature verification: ${isValid ? "✅ PASSED" : "❌ FAILED"}`);
    console.log(`   Order: ${razorpay_order_id}`);
    console.log(`   Payment: ${razorpay_payment_id}`);

    if (isValid) {
      res.status(200).json({
        success: true,
        message: "Payment verified successfully"
      });
    } else {
      console.warn("⚠️  Signature mismatch detected - possible tampering attempt");
      res.status(400).json({
        success: false,
        message: "Invalid payment signature"
      });
    }

  } catch (error) {
    console.error("❌ Payment verification error:", error.message);
    res.status(500).json({
      success: false,
      message: "Payment verification failed: " + error.message
    });
  }
};

const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxUy18wkPzVpJj4_gVgj-bkbBZxDXYIutWWnI89-Ke0uVJfR25thW5HsA3LWolOVoYt/exec";

export const handleWebhook = async (req, res) => {
  try {
    const signature = req.headers["x-razorpay-signature"];
    
    // req.body is now a raw Buffer thanks to server.js fix
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET)
      .update(req.body)
      .digest("hex");

    if (expectedSignature !== signature) {
      console.warn("⚠️ Webhook signature mismatch");
      return res.status(400).json({ success: false });
    }

    const payload = JSON.parse(req.body.toString());
    console.log("📨 Webhook event received:", payload.event);

    if (payload.event === "payment.captured") {
      const payment = payload.payload.payment.entity;
      console.log("✅ Webhook: payment captured");
      console.log("   Order ID:", payment.order_id);
      console.log("   Payment ID:", payment.id);

      // Tell Apps Script to flip PENDING -> PAID + send confirmation email
      const sheetRes = await fetch(GOOGLE_SCRIPT_URL, {
        method: "POST",
        headers: { "Content-Type": "text/plain" },
        body: JSON.stringify({
          action: "updatePayment",
          razorpayOrderId: payment.order_id,
          razorpayPaymentId: payment.id
        })
      });

      console.log("📊 Sheet update triggered, status:", sheetRes.status);
    }

    // Always return 200 to Razorpay so it doesn't keep retrying
    res.status(200).json({ success: true });

  } catch (err) {
    console.error("❌ Webhook error:", err.message);
    // Still return 200 so Razorpay doesn't retry on code bugs
    res.status(200).json({ success: true });
  }
};