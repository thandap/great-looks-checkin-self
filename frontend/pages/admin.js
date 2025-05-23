import { useEffect, useState } from 'react';
import NavBar from '../components/NavBar';

export default function AdminPanel() {
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

  const markNowServing = async (id) => {
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/checkins/${id}/now-serving`, { method: 'PUT' });
    fetchCheckins();
  };

  const markServed = async (id) => {
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/checkins/${id}`, { method: 'PUT' });
    fetchCheckins();
  };

  useEffect(() => {
    fetchCheckins();
  }, []);

  const waiting = Array.isArray(checkins) ? checkins.filter(c => c.status === 'Waiting') : [];
  const nowServing = Array.isArray(checkins) ? checkins.filter(c => c.status === 'Now Serving') : [];

  return (
    <>
      <NavBar />
      <main className="min-h-screen bg-gray-50 p-6" role="main">
        <section className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h2 className="text-2xl font-semibold text-yellow-700 mb-4">⏳ Waiting Queue</h2>
            {waiting.length === 0 ? (
              <p className="text-gray-500 mb-6">No customers waiting.</p>
            ) : (
              <ul className="space-y-4 mb-8">
                {waiting.map(item => (
                  <li key={item.id} className="bg-white p-4 rounded shadow">
                    <p className="font-semibold text-lg">{item.name}</p>
                    <p className="text-gray-600 text-sm">📞 {item.phone} | 💇 {item.service} | ✂️ {item.stylist}</p>
                    <p className="text-sm text-gray-600">
                      ⏳ Wait: {Math.floor((Date.now() - new Date(item.created_at)) / 60000)} min
                    </p>
                    <button
                      onClick={() => markNowServing(item.id)}
                      className="mt-2 px-4 py-1 bg-yellow-400 text-white rounded hover:bg-yellow-500"
                    >
                      Serve Now
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-green-700 mb-4">✅ Now Serving</h2>
            {nowServing.length === 0 ? (
              <p className="text-gray-500">No one is currently being served.</p>
            ) : (
              <ul className="space-y-4">
                {nowServing.map(item => (
                  <li key={item.id} className="bg-green-100 border border-green-400 p-4 rounded shadow">
                    <p className="font-semibold text-lg">{item.name}</p>
                    <p className="text-gray-600 text-sm">📞 {item.phone} | 💇 {item.service} | ✂️ {item.stylist}</p>
                    <p className="text-sm text-gray-600">
                      🕒 Checked in {Math.floor((Date.now() - new Date(item.created_at)) / 60000)} min ago
                    </p>
                    <button
                      onClick={() => markServed(item.id)}
                      className="mt-2 px-4 py-1 bg-[#8F9779] text-white rounded hover:bg-[#7b8569]"
                    >
                      Mark as Served
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      </main>
    </>
  );
}
