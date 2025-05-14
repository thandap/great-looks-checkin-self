import { useEffect, useState } from 'react';
import NavBar from '../components/NavBar';

export default function Admin() {
  const [checkins, setCheckins] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchCheckins = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/checkins`);
      const data = await res.json();
      if (Array.isArray(data)) {
        setCheckins(data);
      } else {
        console.error('Unexpected response:', data);
        setCheckins([]);
      }
    } catch (err) {
      console.error('Failed to fetch check-ins', err);
      setCheckins([]);
    }
    setLoading(false);
  };

  const markServed = async (id) => {
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/checkins/${id}`, { method: 'PUT' });
      fetchCheckins(); // Refresh after update
    } catch (err) {
      console.error('Failed to mark as served', err);
    }
  };

  useEffect(() => {
    fetchCheckins();
  }, []);

  return (
    <>
      <NavBar />
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <h1>Waiting Queue</h1>
        {loading ? (
          <p>Loading...</p>
        ) : checkins.length === 0 ? (
          <p>No customers waiting.</p>
        ) : (
          <table border="1" style={{ margin: '0 auto' }}>
            <thead>
              <tr>
                <th>Name</th>
                <th>Phone</th>
                <th>Service</th>
                <th>Stylist</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {checkins.map((c) => (
                <tr key={c.id}>
                  <td>{c.name}</td>
                  <td>{c.phone}</td>
                  <td>{c.service}</td>
                  <td>{c.stylist}</td>
                  <td>
                    <button onClick={() => markServed(c.id)}>Mark Served</button>
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
