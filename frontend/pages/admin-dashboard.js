import { useEffect, useState } from 'react';
import NavBar from '../components/NavBar';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      window.location.href = '/admin-login';
      return;
    }

    fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/stats`, {
      headers: {
        'x-admin-token': token
      }
    })
      .then(res => res.ok ? res.json() : Promise.reject('Failed to load'))
      .then(setStats)
      .catch(err => setError(err));
  }, []);

  return (
    <>
      <NavBar />
      <main className="min-h-screen bg-gray-50 p-6">
        <section className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-800 mb-6">📊 Admin Dashboard</h1>

          {error && <p className="text-red-600">Error loading dashboard.</p>}

          {stats ? (
            <div className="space-y-6">
              <div className="bg-white p-4 rounded shadow">
                <h2 className="text-xl font-semibold mb-2">Today's Summary</h2>
                <p>Total Check-ins: <strong>{stats.totalCheckins}</strong></p>
                <p>Online: <strong>{stats.onlineCheckins}</strong> | Walk-in: <strong>{stats.walkinCheckins}</strong></p>
              </div>

              <div className="bg-white p-4 rounded shadow">
                <h2 className="text-xl font-semibold mb-2">Top Services</h2>
                <ul className="list-disc pl-5">
                  {stats.topServices.map((s, i) => (
                    <li key={i}>{s.service} – {s.count}</li>
                  ))}
                </ul>
              </div>

              <div className="bg-white p-4 rounded shadow">
                <h2 className="text-xl font-semibold mb-2">Top Stylists</h2>
                <ul className="list-disc pl-5">
                  {stats.topStylists.map((s, i) => (
                    <li key={i}>{s.stylist} – {s.count}</li>
                  ))}
                </ul>
              </div>
            </div>
          ) : (
            !error && <p>Loading...</p>
          )}
        </section>
      </main>
    </>
  );
}
