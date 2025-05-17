import axios from 'axios';
import crypto from 'crypto';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Validate environment variables
  if (!process.env.CASHFREE_APP_ID || !process.env.CASHFREE_SECRET_KEY) {
    console.error('Cashfree credentials not configured');
    return res.status(500).json({ error: 'Payment gateway not configured' });
  }

  try {
    const { productId, amount, customerName, customerEmail, customerPhone } = req.body;

    // Strict validation
    if (!productId || !amount || !customerName || !customerEmail || !customerPhone) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    if (!/^[6-9]\d{9}$/.test(customerPhone)) {
      return res.status(400).json({ error: 'Invalid Indian phone number' });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail)) {
      return res.status(400).json({ error: 'Invalid email address' });
    }

    const orderId = `ORDER_${Date.now()}_${crypto.randomBytes(2).toString('hex')}`;
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

    const orderData = {
      order_id: orderId,
      order_amount: parseFloat(amount).toFixed(2),
      order_currency: 'INR',
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
      order_note: `Purchase of ${productId}`,
    };

    const cashfreeResponse = await axios.post(
      'https://api.cashfree.com/pg/orders',
      orderData,
      {
        headers: {
          'x-client-id': process.env.CASHFREE_APP_ID,
          'x-client-secret': process.env.CASHFREE_SECRET_KEY,
          'x-api-version': '2022-09-01',
          'Content-Type': 'application/json',
        },
        timeout: 10000, // 10 second timeout
      }
    );

    if (!cashfreeResponse.data.payment_link) {
      throw new Error('No payment link received from Cashfree');
    }

    return res.status(200).json({
      order_id: orderId,
      payment_link: cashfreeResponse.data.payment_link,
    });

  } catch (error) {
    console.error('Cashfree API Error:', {
      message: error.message,
      response: error.response?.data,
      stack: error.stack,
    });

    const errorMessage = error.response?.data?.message || 
                        error.message || 
                        'Payment initiation failed';

    return res.status(500).json({ 
      error: errorMessage,
      details: error.response?.data?.details || null,
    });
  }
}
