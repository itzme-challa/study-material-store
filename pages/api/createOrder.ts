import type { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";

const CASHFREE_APP_ID = process.env.CASHFREE_APP_ID!;
const CASHFREE_SECRET_KEY = process.env.CASHFREE_SECRET_KEY!;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST")
    return res.status(405).json({ error: "Only POST requests allowed" });

  const { productName, amount, link } = req.body;

  try {
    // STEP 1: Get access token
    const tokenRes = await axios.post(
      "https://api.cashfree.com/pg/auth/token",
      {},
      {
        headers: {
          "Content-Type": "application/json",
          "x-client-id": CASHFREE_APP_ID,
          "x-client-secret": CASHFREE_SECRET_KEY,
        },
      }
    );

    const accessToken = tokenRes.data.data.token;

    // STEP 2: Create order
    const orderId = `order_${Date.now()}`;

    const orderRes = await axios.post(
      "https://api.cashfree.com/pg/orders",
      {
        order_id: orderId,
        order_amount: amount,
        order_currency: "INR",
        customer_details: {
          customer_id: orderId,
          customer_name: productName,
          customer_email: "test@example.com",
          customer_phone: "9999999999",
        },
        order_meta: {
          return_url: `https://study-material-store-seven.vercel.app/success?link=${encodeURIComponent(
            link
          )}&order_id={order_id}`,
        },
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
          "x-api-version": "2022-09-01",
        },
      }
    );

    const sessionId = orderRes.data.payment_session_id;

    if (!sessionId) {
      console.error("Missing session ID:", orderRes.data);
      return res.status(500).json({ error: "Payment session not found" });
    }

    const paymentLink = `https://payments.cashfree.com/pg/checkout?payment_session_id=${sessionId}`;
    res.status(200).json({ paymentLink });
  } catch (err: any) {
    console.error("Error creating order:", err);
    res.status(500).json({ error: "Something went wrong", details: err.message });
  }
}
