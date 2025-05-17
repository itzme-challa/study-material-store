import type { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";

const CASHFREE_APP_ID = process.env.CASHFREE_APP_ID!;
const CASHFREE_SECRET_KEY = process.env.CASHFREE_SECRET_KEY!;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Only POST requests allowed" });
  }

  const { productName, amount, link } = req.body;

  if (!productName || !amount || !link) {
    return res.status(400).json({ error: "Missing required fields." });
  }

  try {
    // 1. Get Access Token (production)
    const tokenRes = await axios.post(
      "https://api.cashfree.com/pg/auth/token",
      {},
      {
        headers: {
          "x-client-id": CASHFREE_APP_ID,
          "x-client-secret": CASHFREE_SECRET_KEY,
          "Content-Type": "application/json"
        },
      }
    );

    const accessToken = tokenRes.data.data.token;

    // 2. Create order
    const orderId = `order_${Date.now()}`;
    const returnUrl = `https://study-material-store-seven.vercel.app/success?link=${encodeURIComponent(
      link
    )}&order_id=${orderId}`;

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
          return_url: returnUrl,
        },
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
          "x-api-version": "2022-09-01",
        },
      }
    );

    const sessionId = orderRes.data.payment_session_id;
    const paymentLink = `https://payments.cashfree.com/pg/checkout?payment_session_id=${sessionId}`;

    return res.status(200).json({ paymentLink });
  } catch (error: any) {
    console.error("Error creating order:", error.response?.data || error.message);
    return res.status(500).json({
      error: "Failed to create Cashfree order",
      details: error.response?.data || error.message,
    });
  }
}
