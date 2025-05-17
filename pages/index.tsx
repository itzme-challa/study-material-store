import { useState } from "react";

const products = [
  {
    name: "Chemistry Med Easy",
    price: 10,
    link: "https://t.me/Material_eduhubkmrbot?start=chemistry-med-easy",
  },
  {
    name: "PW 6 Years JEE PYQs Chemistry",
    price: 2,
    link: "https://t.me/Material_eduhubkmrbot?start=pw-6years-jee-pyqs-chemistry",
  },
  {
    name: "Disha 144 JEE Mains Physics",
    price: 100,
    link: "https://t.me/Material_eduhubkmrbot?start=disha-144-jee-mains-physics",
  },
];

export default function Home() {
  const [loading, setLoading] = useState(false);

  const handleBuy = async (product: any) => {
    setLoading(true);
    const res = await fetch("/api/createOrder", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(product),
    });

    const data = await res.json();
    window.location.href = data.paymentLink;
  };

  return (
    <div className="p-4 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Study Material Store</h1>
      {products.map((p, idx) => (
        <div key={idx} className="border p-4 mb-4 rounded shadow">
          <h2 className="text-lg font-semibold">{p.name}</h2>
          <p>Price: ₹{p.price}</p>
          <button
            className="bg-blue-600 text-white px-4 py-2 mt-2 rounded"
            onClick={() => handleBuy(p)}
            disabled={loading}
          >
            {loading ? "Redirecting..." : "Buy Now"}
          </button>
        </div>
      ))}
    </div>
  );
}
