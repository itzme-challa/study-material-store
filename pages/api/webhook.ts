import type { NextApiRequest, NextApiResponse } from "next";
import crypto from "crypto";

const SECRET_KEY = process.env.CASHFREE_SECRET_KEY!;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end();

  const signature = req.headers["x-webhook-signature"] as string;
  const rawBody = JSON.stringify(req.body);
  const expectedSignature = crypto
    .createHmac("sha256", SECRET_KEY)
    .update(rawBody)
    .digest("base64");

  if (signature !== expectedSignature) {
    console.error("Invalid webhook signature");
    return res.status(401).json({ error: "Invalid signature" });
  }

  const event = req.body?.event;

  if (event === "ORDER.PAID") {
    const orderId = req.body?.data?.order?.order_id;
    const amount = req.body?.data?.order?.order_amount;
    const paymentId = req.body?.data?.payment?.payment_id;

    // TODO: Save order info to DB, Firebase, Google Sheet, etc.
    console.log("✅ Payment received:", { orderId, amount, paymentId });

    return res.status(200).json({ message: "Success" });
  }

  // Optional: handle failed, expired events
  console.log("Unhandled event:", event);
  return res.status(200).json({ message: "Ignored" });
}
