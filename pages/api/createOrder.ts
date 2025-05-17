import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { name, price, link } = req.body;

  const orderId = 'order_' + Date.now();

  const response = await axios.post(
    'https://sandbox.cashfree.com/pg/orders',
    {
      order_id: orderId,
      order_amount: price,
      order_currency: 'INR',
      customer_details: {
        customer_id: 'user_' + Date.now(),
        customer_email: 'test@example.com',
        customer_phone: '9999999999',
      },
      order_meta: {
        return_url: `https://study-material-store-seven.vercel.app/success?link=${encodeURIComponent(link)}`
      },
    },
    {
      headers: {
        'x-api-version': '2022-09-01',
        'Content-Type': 'application/json',
        'x-client-id': process.env.CASHFREE_APP_ID!,
        'x-client-secret': process.env.CASHFREE_SECRET_KEY!,
      },
    }
  );

  res.status(200).json({ paymentLink: response.data.payment_link });
}
