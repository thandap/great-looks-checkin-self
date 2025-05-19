import { useEffect, useState } from 'react';
import NavBar from '../components/NavBar';

export default function Admin() {
  const [checkins, setCheckins] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchCheckins = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/checkins`);
      const data = await res.json();
      setCheckins(data);
    } catch (err) {
      console.error('Error fetching check-ins:', err);
    } finally {
      setLoading(false);
    }
  };

  const markAsServed = async (id) => {
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/checkins/${id}`, {
        method: 'PUT',
      });
      setCheckins(checkins.filter((c) => c.id !== id));
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
      <div className="p-8">
        <h1 className="text-3xl font-bold mb-4 text-center">Waiting Queue</h1>

        {loading ? (
          <p className="text-center">Loading...</p>
        ) : checkins.length === 0 ? (
          <p className="text-center text-gray-500">No customers waiting.</p>
        ) : (
          <table className="min-w-full bg-white shadow-md rounded-md overflow-hidden">
            <thead className="bg-gray-100">
              <tr>
                <th className="py-2 px-4">Name</th>
                <th className="py-2 px-4">Phone</th>
                <th className="py-2 px-4">Service</th>
                <th className="py-2 px-4">Stylist</th>
                <th className="py-2 px-4">Time</th>
                <th className="py-2 px-4">Action</th>
              </tr>
            </thead>
            <tbody>
              {checkins.map((c) => (
                <tr key={c.id} className="border-t">
                  <td className="py-2 px-4">{c.name}</td>
                  <td className="py-2 px-4">{c.phone}</td>
                  <td className="py-2 px-4">{c.service}</td>
                  <td className="py-2 px-4">{c.stylist}</td>
                  <td className="py-2 px-4">{new Date(c.time).toLocaleString()}</td>
                  <td className="py-2 px-4">
                    <button
                      onClick={() => markAsServed(c.id)}
                      className="bg-green-500 hover:bg-green-600 text-white py-1 px-3 rounded"
                    >
                      Served
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
