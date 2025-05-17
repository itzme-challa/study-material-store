const handleBuy = async () => {
  const res = await fetch("/api/createOrder", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      productName: product.name,
      amount: product.price,
      link: product.link,
    }),
  });

  const data = await res.json();
  if (data.paymentLink) {
    window.location.href = data.paymentLink;
  } else {
    alert("Payment initiation failed.");
  }
};
