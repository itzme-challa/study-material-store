const handlePayment = async () => {
  setIsProcessing(true);
  
  try {
    // Validate form data first
    if (!formData.name || !formData.email || !formData.phone) {
      throw new Error('Please fill all fields');
    }

    const response = await fetch('/api/create-order', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        productId: product.id,
        amount: product.price,
        customerName: formData.name,
        customerEmail: formData.email,
        customerPhone: formData.phone,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Payment failed');
    }

    // Redirect to Cashfree payment page
    window.location.href = data.payment_link;

  } catch (error) {
    toast.error(`Payment Error: ${error.message}`);
    console.error('Checkout Error:', error);
  } finally {
    setIsProcessing(false);
  }
};
