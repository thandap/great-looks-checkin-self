import { useEffect, useState } from 'react';
import NavBar from '../components/NavBar';

export default function Admin() {
  const [checkins, setCheckins] = useState([]);

  const fetchCheckins = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/checkins`);
      const data = await res.json();
      setCheckins(data);
    } catch (err) {
      console.error('Error fetching check-ins:', err);
    }
  };

  const markServed = async (id) => {
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/checkins/${id}`, {
        method: 'PUT',
      });
      fetchCheckins();
    } catch (err) {
      console.error('Error updating check-in:', err);
    }
  };

  useEffect(() => {
    fetchCheckins();
  }, []);

  return (
    <>
      <NavBar />
      <main className="min-h-screen bg-gray-50 p-6" role="main">
        <section className="max-w-4xl mx-auto" aria-labelledby="admin-heading">
          <h1 id="admin-heading" className="text-3xl font-bold text-gray-800 mb-6">
            Waiting Queue
          </h1>

          {checkins.length === 0 ? (
            <p className="text-gray-500">No customers waiting.</p>
          ) : (
           <ul className="space-y-4">
  {checkins.map(({ id, name, phone, service, stylist, created_at }) => {
    const waitMinutes = Math.floor((Date.now() - new Date(created_at)) / 60000);

    return (
      <li
        key={id}
        className="bg-white shadow-md rounded-lg p-4 flex flex-col sm:flex-row sm:justify-between sm:items-center"
        aria-label={`Check-in for ${name}`}
      >
        <div>
          <p className="text-lg font-semibold text-gray-800">{name}</p>
          <p className="text-gray-600">📞 {phone} | 💇 {service} | ✂️ {stylist}</p>
          <p className="text-sm text-gray-500 mt-1">⏳ Wait: {waitMinutes} min</p>
        </div>

        <div className="flex flex-col gap-2 sm:mt-0 sm:ml-4 sm:flex-row">
          <button
            onClick={() => markServed(id)}
            className="px-4 py-2 bg-[#8F9779] text-white rounded hover:bg-[#7b8569] transition"
          >
            Mark as Served
          </button>

          {/* 🔒 Placeholder: Invoice & Payment (Future Phase) */}
          <div className="flex gap-2">
            <button
              disabled
              title="Coming soon"
              className="px-3 py-1 bg-indigo-500 text-white text-sm rounded opacity-60 cursor-not-allowed"
            >
              🧾 Invoice
            </button>
            <button
              disabled
              title="Coming soon"
              className="px-3 py-1 bg-green-600 text-white text-sm rounded opacity-60 cursor-not-allowed"
            >
              💳 Pay
            </button>
          </div>
        </div>
      </li>
    );
  })}
</ul>
          )}
        </section>
      </main>
    </>
  );
}
