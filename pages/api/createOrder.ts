import type { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end();

  const { name, price, link } = req.body;

  if (!name || !price || !link) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const orderId = "order_" + Date.now();
  const callbackUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/success?link=${encodeURIComponent(link)}`;

  try {
    const response = await axios.post(
      "https://api.cashfree.com/pg/orders",
      {
        order_id: orderId,
        order_amount: Number(price),
        order_currency: "INR",
        customer_details: {
          customer_id: orderId,
          customer_name: name,
          customer_email: "test@example.com",
          customer_phone: "9999999999",
        },
        order_meta: {
          return_url: callbackUrl + "&order_id={order_id}",
        },
      },
      {
        headers: {
          accept: "application/json",
          "x-api-version": "2022-09-01",
          "content-type": "application/json",
          "x-client-id": process.env.CASHFREE_APP_ID!,
          "x-client-secret": process.env.CASHFREE_SECRET_KEY!,
        },
      }
    );

    const sessionId = response.data.payment_session_id;

    if (sessionId) {
      // ✅ Correct checkout link
      const paymentLink = `https://payments.cashfree.com/pg/checkout?payment_session_id=${sessionId}`;
      res.status(200).json({ paymentLink });
    } else {
      console.error("No session_id:", response.data);
      res.status(500).json({ error: "Session ID not found", data: response.data });
    }
  } catch (err: any) {
    console.error("Cashfree Error:", err?.response?.data || err.message);
    res.status(500).json({ error: "Order creation failed", message: err.message });
  }
}
