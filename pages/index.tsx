import { useState } from 'react';

const products = [
  { name: 'Chemistry Med Easy', price: 10, link: 'https://t.me/Material_eduhubkmrbot?start=chemistry-med-easy' },
  { name: 'PW 6 Years JEE PYQs Chemistry', price: 2, link: 'https://t.me/Material_eduhubkmrbot?start=pw-6years-jee-pyqs-chemistry' },
  { name: 'Disha 144 JEE Mains Physics', price: 100, link: 'https://t.me/Material_eduhubkmrbot?start=disha-144-jee-mains-physics' },
];

export default function Home() {
  const [selected, setSelected] = useState(products[0]);

  const buyNow = async () => {
    const res = await fetch('/api/createOrder', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(selected),
    });
    const data = await res.json();
    window.location.href = data.paymentLink;
  };

  return (
    <div style={{ padding: 40 }}>
      <h1>Study Material Store</h1>
      <select onChange={e => setSelected(products[+e.target.value])}>
        {products.map((p, i) => (
          <option key={i} value={i}>
            {p.name} - ₹{p.price}
          </option>
        ))}
      </select>
      <br /><br />
      <button onClick={buyNow}>Buy Now</button>
    </div>
  );
}
