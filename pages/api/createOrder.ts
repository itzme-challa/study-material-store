import type { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end();

  const { name, price, link } = req.body;

  const orderId = "order_" + Date.now();
  const callbackUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/success?link=${encodeURIComponent(link)}`;

  try {
    const response = await axios.post(
      "https://api.cashfree.com/pg/orders",
      {
        customer_details: {
          customer_id: orderId,
          customer_email: "test@example.com",
          customer_phone: "9999999999",
        },
        order_id: orderId,
        order_amount: price,
        order_currency: "INR",
        order_note: name,
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

    res.status(200).json({ paymentLink: response.data.payment_link });
  } catch (err) {
    res.status(500).json({ error: "Order creation failed" });
  }
}
