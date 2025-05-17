import axios from 'axios';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  // Validate required fields
  const requiredFields = ['amount', 'customerName', 'customerEmail', 'customerPhone'];
  const missingFields = requiredFields.filter(field => !req.body[field]);

  if (missingFields.length > 0) {
    return res.status(400).json({
      message: 'Missing required fields',
      missingFields
    });
  }

  const {
    productId = '',
    productName = '',
    amount,
    customerName,
    customerEmail,
    customerPhone,
  } = req.body;

  // Validate amount is numeric and positive
  if (isNaN(amount) {
    return res.status(400).json({ message: 'Amount must be a number' });
  }

  const orderData = {
    order_id: `ORDER_${Date.now()}_${Math.floor(Math.random() * 1000)}`, // More unique ID
    order_amount: Number(amount).toFixed(2),
    order_currency: 'INR',
    customer_details: {
      customer_id: customerEmail,
      customer_name: customerName,
      customer_email: customerEmail,
      customer_phone: customerPhone,
    },
    order_meta: {
      return_url: `${process.env.NEXT_PUBLIC_BASE_URL}/payment-success?order_id={order_id}&product_id=${productId}`,
      notify_url: `${process.env.NEXT_PUBLIC_BASE_URL}/api/payment-webhook`,
    },
    order_note: productName ? `Purchase of ${productName}` : undefined
  };

  try {
    const response = await axios.post(
      `${process.env.CASHFREE_API_URL || 'https://sandbox.cashfree.com/pg/orders'}`,
      orderData,
      {
        headers: {
          'x-api-version': '2023-08-01', // Updated to latest version
          'Content-Type': 'application/json',
          'x-client-id': process.env.CASHFREE_APP_ID,
          'x-client-secret': process.env.CASHFREE_SECRET_KEY,
        },
        timeout: 10000 // 10 second timeout
      }
    );

    return res.status(200).json({
      paymentLink: response.data.payment_link,
      orderId: response.data.order_id
    });
  } catch (error) {
    console.error('Cashfree API Error:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status
    });

    return res.status(error.response?.status || 500).json({
      message: 'Failed to create order',
      error: error.response?.data || error.message,
      details: error.response?.data?.message || 'Unknown error occurred'
    });
  }
}
