import { useEffect, useState } from 'react';
import NavBar from '../components/NavBar';

export default function AdminServices() {
  const [services, setServices] = useState([]);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ price: '', duration: '' });

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/services`)
      .then(res => res.json())
      .then(setServices)
      .catch(err => console.error('Error loading services:', err));
  }, []);

  const handleEdit = (service) => {
    setEditing(service.id);
    setForm({ price: service.price, duration: service.duration });
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = async (id) => {
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/services/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const updated = services.map(s =>
        s.id === id ? { ...s, price: form.price, duration: form.duration } : s
      );
      setServices(updated);
      setEditing(null);
    } catch (err) {
      console.error('Failed to update service:', err);
    }
  };

  return (
    <>
      <NavBar />
      <main className="min-h-screen bg-gray-50 p-6">
        <section className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-800 mb-6">Manage Services</h1>
          <table className="w-full table-auto border border-gray-300">
            <thead>
              <tr className="bg-gray-100">
                <th className="border px-4 py-2">Service</th>
                <th className="border px-4 py-2">Price ($)</th>
                <th className="border px-4 py-2">Duration (min)</th>
                <th className="border px-4 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {services.map(service => (
                <tr key={service.id}>
                  <td className="border px-4 py-2">{service.name}</td>
                  <td className="border px-4 py-2">
                    {editing === service.id ? (
                      <input name="price" type="number" value={form.price} onChange={handleChange} className="w-full border px-2" />
                    ) : (
                      `$${service.price}`
                    )}
                  </td>
                  <td className="border px-4 py-2">
                    {editing === service.id ? (
                      <input name="duration" type="number" value={form.duration} onChange={handleChange} className="w-full border px-2" />
                    ) : (
                      `${service.duration} min`
                    )}
                  </td>
                  <td className="border px-4 py-2 text-center">
                    {editing === service.id ? (
                      <button onClick={() => handleSave(service.id)} className="bg-green-500 text-white px-3 py-1 rounded">Save</button>
                    ) : (
                      <button onClick={() => handleEdit(service)} className="bg-blue-500 text-white px-3 py-1 rounded">Edit</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </main>
    </>
  );
}
