import axios from 'axios';

// Production configuration
const CASHFREE_CONFIG = {
  API_URL: 'https://api.cashfree.com/pg/orders',
  API_VERSION: '2023-08-01', // Latest as of 2024
  TIMEOUT: 15000 // 15 seconds
};

const validateRequest = (body) => {
  const errors = [];
  
  if (!body.amount || isNaN(body.amount) || Number(body.amount) <= 0) {
    errors.push('Invalid amount');
  }
  
  if (!body.customerEmail || !/^\S+@\S+\.\S+$/.test(body.customerEmail)) {
    errors.push('Invalid email');
  }
  
  if (!body.customerPhone || !/^[6-9]\d{9}$/.test(body.customerPhone)) {
    errors.push('Invalid Indian phone number');
  }
  
  return errors;
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  // Validate request
  const validationErrors = validateRequest(req.body);
  if (validationErrors.length > 0) {
    return res.status(400).json({ 
      message: 'Validation failed',
      errors: validationErrors 
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

  // Prepare order data
  const orderData = {
    order_id: `ORDER_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`,
    order_amount: Number(amount).toFixed(2),
    order_currency: 'INR',
    customer_details: {
      customer_id: customerEmail.replace(/@.+$/, ''), // Use email prefix as ID
      customer_name: customerName.trim(),
      customer_email: customerEmail,
      customer_phone: customerPhone,
    },
    order_meta: {
      return_url: `${process.env.NEXT_PUBLIC_BASE_URL}/payment-success?order_id={order_id}`,
      notify_url: `${process.env.NEXT_PUBLIC_BASE_URL}/api/payment-webhook`,
    },
    order_note: productName ? `Purchase: ${productName.substring(0, 100)}` : undefined,
    order_tags: productId ? { product_id: productId } : undefined
  };

  try {
    const response = await axios.post(
      CASHFREE_CONFIG.API_URL,
      orderData,
      {
        headers: {
          'x-api-version': CASHFREE_CONFIG.API_VERSION,
          'Content-Type': 'application/json',
          'x-client-id': process.env.CASHFREE_APP_ID,
          'x-client-secret': process.env.CASHFREE_SECRET_KEY,
        },
        timeout: CASHFREE_CONFIG.TIMEOUT
      }
    );

    // Log successful order creation (without sensitive data)
    console.log('Order created successfully:', {
      orderId: response.data.order_id,
      amount: response.data.order_amount,
      paymentLink: Boolean(response.data.payment_link) // Just log if exists
    });

    return res.status(200).json({
      success: true,
      paymentLink: response.data.payment_link,
      orderId: response.data.order_id
    });

  } catch (error) {
    // Detailed error logging
    console.error('Cashfree API Error:', {
      status: error.response?.status,
      code: error.code,
      message: error.message,
      responseData: error.response?.data,
      requestData: {
        amount: orderData.order_amount,
        customerId: orderData.customer_details.customer_id
      }
    });

    const statusCode = error.response?.status || 500;
    const errorMessage = error.response?.data?.message || 'Payment processing failed';

    return res.status(statusCode).json({
      success: false,
      message: errorMessage,
      details: statusCode === 500 ? undefined : error.response?.data
    });
  }
}
