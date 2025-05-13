import { useState, useEffect } from 'react';
import NavBar from '../components/NavBar';

export default function Admin() {
  const [checkins, setCheckins] = useState([]);

  useEffect(() => {
    fetchCheckins();
  }, []);

  const fetchCheckins = async () => {
    try {
      const response = await fetch('http://localhost:5000/checkins');
      const data = await response.json();
      setCheckins(data);
    } catch (error) {
      console.error('Error fetching check-ins', error);
    }
  };

  const handleMarkServed = async (id) => {
    try {
      await fetch(`http://localhost:5000/checkins/${id}`, {
        method: 'PUT'
      });
      // Reload the list after marking served
      fetchCheckins();
    } catch (error) {
      console.error('Error marking check-in as served', error);
    }
  };

  return (
    <>
      <NavBar />
      <div style={{ padding: '20px' }}>
        <h1>Waiting Queue</h1>
        {checkins.length === 0 ? (
          <p>No current check-ins.</p>
        ) : (
          <table border="1" cellPadding="10" style={{ margin: 'auto' }}>
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
              {checkins.map((checkin) => (
                <tr key={checkin.id}>
                  <td>{checkin.name}</td>
                  <td>{checkin.phone}</td>
                  <td>{checkin.service}</td>
                  <td>{checkin.stylist}</td>
                  <td>
                    <button onClick={() => handleMarkServed(checkin.id)}>
                      Mark Served
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
