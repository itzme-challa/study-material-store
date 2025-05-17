import type { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";

const CASHFREE_APP_ID = process.env.CASHFREE_APP_ID!;
const CASHFREE_SECRET_KEY = process.env.CASHFREE_SECRET_KEY!;
const CASHFREE_BASE_URL = "https://api.cashfree.com/pg"; // live mode

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method Not Allowed" });

  const { productName, amount, link } = req.body;

  try {
    // Get Access Token
    const tokenRes = await axios.post(
      `${CASHFREE_BASE_URL}/auth/token`,
      {},
      {
        headers: {
          "Content-Type": "application/json",
          "x-client-id": CASHFREE_APP_ID,
          "x-client-secret": CASHFREE_SECRET_KEY,
        },
      }
    );

    const accessToken = tokenRes.data?.data?.token;
    if (!accessToken) return res.status(500).json({ error: "Failed to get access token" });

    // Create order
    const orderId = `order_${Date.now()}`;
    const orderRes = await axios.post(
      `${CASHFREE_BASE_URL}/orders`,
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

    const sessionId = orderRes.data?.payment_session_id;

    if (!sessionId) {
      console.error("Unexpected response from Cashfree:", orderRes.data);
      return res.status(500).json({ error: "Payment session ID not found" });
    }

    const paymentLink = `https://payments.cashfree.com/pg/checkout?payment_session_id=${sessionId}`;

    return res.status(200).json({ paymentLink });
  } catch (err) {
    console.error("Error creating order:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
