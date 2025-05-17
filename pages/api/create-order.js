import axios from 'axios';

// Validation helper
const validateRequest = (body) => {
  const errors = {};
  
  // Amount validation
  if (!body.amount || isNaN(body.amount)) {
    errors.amount = "Amount must be a number";
  } else if (Number(body.amount) <= 0) {
    errors.amount = "Amount must be greater than 0";
  }

  // Email validation
  if (!body.customerEmail) {
    errors.customerEmail = "Email is required";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.customerEmail)) {
    errors.customerEmail = "Invalid email format";
  }

  // Phone validation (Indian numbers)
  if (!body.customerPhone) {
    errors.customerPhone = "Phone number is required";
  } else if (!/^[6-9]\d{9}$/.test(body.customerPhone)) {
    errors.customerPhone = "Invalid Indian phone number (10 digits, starts with 6-9)";
  }

  // Name validation
  if (!body.customerName || body.customerName.trim().length < 2) {
    errors.customerName = "Name must be at least 2 characters";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      success: false,
      message: 'Only POST requests allowed' 
    });
  }

  // Validate request body
  const { isValid, errors } = validateRequest(req.body);
  if (!isValid) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors
    });
  }

  // Extract and sanitize input
  const {
    productId = '',
    productName = '',
    amount,
    customerName,
    customerEmail,
    customerPhone,
  } = req.body;

  // Prepare order payload
  const orderPayload = {
    order_id: `ORDER_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
    order_amount: Number(amount).toFixed(2),
    order_currency: 'INR',
    customer_details: {
      customer_id: `cust_${customerEmail.split('@')[0]}_${Date.now()}`,
      customer_name: customerName.trim(),
      customer_email: customerEmail,
      customer_phone: customerPhone,
    },
    order_meta: {
      return_url: `${process.env.NEXT_PUBLIC_BASE_URL}/payment/status?order_id={order_id}`,
      notify_url: `${process.env.NEXT_PUBLIC_BASE_URL}/api/payment-webhook`,
    },
    order_note: productName ? `Purchase: ${productName.substring(0, 50)}` : undefined
  };

  try {
    const response = await axios.post(
      'https://api.cashfree.com/pg/orders',
      orderPayload,
      {
        headers: {
          'x-api-version': '2023-08-01',
          'Content-Type': 'application/json',
          'x-client-id': process.env.CASHFREE_APP_ID,
          'x-client-secret': process.env.CASHFREE_SECRET_KEY,
        },
        timeout: 10000
      }
    );

    return res.status(200).json({
      success: true,
      paymentLink: response.data.payment_link,
      orderId: response.data.order_id
    });

  } catch (error) {
    console.error('Cashfree API Error:', {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });

    return res.status(error.response?.status || 500).json({
      success: false,
      message: error.response?.data?.message || 'Payment processing failed',
      details: process.env.NODE_ENV === 'development' ? error.response?.data : undefined
    });
  }
}
