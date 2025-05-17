import axios from 'axios';
import crypto from 'crypto';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { productId, amount, customerName, customerEmail, customerPhone } = req.body;

    // Validate input
    if (!productId || !amount || !customerName || !customerEmail || !customerPhone) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    if (!/^[6-9]\d{9}$/.test(customerPhone)) {
      return res.status(400).json({ error: 'Invalid phone number' });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail)) {
      return res.status(400).json({ error: 'Invalid email address' });
    }

    const orderId = `ORDER_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

    const orderData = {
      order_id: orderId,
      order_amount: amount,
      order_currency: 'INR',
      order_note: `Purchase of ${productId}`,
      customer_details: {
        customer_id: customerEmail,
        customer_name: customerName,
        customer_email: customerEmail,
        customer_phone: `91${customerPhone}`,
      },
      order_meta: {
        return_url: `${baseUrl}/payment-success?order_id=${orderId}&product_id=${productId}`,
        notify_url: `${baseUrl}/api/payment-webhook`,
      },
    };

    const response = await axios.post(`${process.env.CASHFREE_API_URL}/orders`, orderData, {
      headers: {
        'x-client-id': process.env.CASHFREE_APP_ID,
        'x-client-secret': process.env.CASHFREE_SECRET_KEY,
        'x-api-version': '2022-09-01',
        'Content-Type': 'application/json',
      },
    });

    res.status(200).json({
      order_id: orderId,
      payment_link: response.data.payment_link,
    });
  } catch (error) {
    console.error('Order creation error:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to create order' });
  }
}
