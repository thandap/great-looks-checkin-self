import { useEffect, useState } from 'react';
import NavBar from '../components/NavBar';

export default function AdminServices() {
  const [services, setServices] = useState([]);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', price: '', duration: '' });
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const filteredServices = services.filter(service =>
    service.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const paginatedServices = filteredServices.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(filteredServices.length / itemsPerPage);

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      window.location.href = '/admin-login';
      return;
    }

    fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/services`, {
      headers: {
        'x-admin-token': token
      }
    })
      .then(res => {
        if (!res.ok) throw new Error('Failed to load services');
        return res.json();
      })
      .then(data => {
        if (!Array.isArray(data)) throw new Error('Unexpected response format');
        setServices(data);
      })
      .catch(err => {
        console.error('Error loading services:', err);
        setError(err.message);
      });
  }, []);

  const handleEdit = (service) => {
    setEditing(service.id);
    setForm({ name: service.name, price: service.price, duration: service.duration });
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = async (id) => {
    if (form.price === '' || form.duration === '') {
      alert('Price and duration cannot be empty');
      return;
    }
    try {
      const token = localStorage.getItem('adminToken');
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/services/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-token': token
        },
        body: JSON.stringify(form),
      });
      const updated = services.map(s =>
        s.id === id ? { ...s, name: form.name, price: form.price, duration: form.duration } : s
      );
      setServices(updated);
      setEditing(null);
      setForm({ name: '', price: '', duration: '' });
    } catch (err) {
      console.error('Failed to update service:', err);
    }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    if (form.name.trim() === '' || form.price === '' || form.duration === '') {
      alert('All fields are required');
      return;
    }
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/services`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-token': token
        },
        body: JSON.stringify(form),
      });
      const newService = await res.json();
      setServices([...services, newService]);
      setForm({ name: '', price: '', duration: '' });
    } catch (err) {
      console.error('Failed to add service:', err);
    }
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this service?");
    if (!confirmDelete) return;
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/services/${id}`, {
        method: 'DELETE',
        headers: {
          'x-admin-token': token
        }
      });
      if (!res.ok) throw new Error('Delete failed');
      setServices(prev => prev.filter(s => s.id !== id));
    } catch (err) {
      console.error('Failed to delete service:', err);
    }
  };

  return (
    <>
      <NavBar />
      <main className="min-h-screen bg-gray-50 p-4 sm:p-6">
        <section className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-800 mb-6">Manage Services</h1>

          <form onSubmit={handleAdd} className="bg-white p-4 rounded shadow space-y-4 mb-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <input
                type="text"
                name="name"
                placeholder="Service Name"
                value={form.name}
                onChange={handleChange}
                className="border px-3 py-2 rounded"
              />
              <input
                type="number"
                name="price"
                placeholder="Price"
                value={form.price}
                onChange={handleChange}
                className="border px-3 py-2 rounded"
              />
              <input
                type="number"
                name="duration"
                placeholder="Duration (min)"
                value={form.duration}
                onChange={handleChange}
                className="border px-3 py-2 rounded"
              />
            </div>
            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
              Add Service
            </button>
          </form>

          <input
            type="text"
            placeholder="Search services..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="mb-4 border px-3 py-2 rounded w-full"
          />

          {error ? (
            <p className="text-red-600">{error}</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full table-auto border border-gray-300 whitespace-nowrap">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border px-4 py-2">Service</th>
                    <th className="border px-4 py-2">Price ($)</th>
                    <th className="border px-4 py-2">Duration (min)</th>
                    <th className="border px-4 py-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedServices.map(service => (
                    <tr key={service.id}>
                      <td className="border px-4 py-2">
                        {editing === service.id ? (
                          <input name="name" type="text" value={form.name} onChange={handleChange} className="w-full border px-2" />
                        ) : (
                          service.name
                        )}
                      </td>
                      <td className="border px-4 py-2">
                        {editing === service.id ? (
                          <input name="price" type="number" value={form.price} onChange={handleChange} className="w-full border px-2" />
                        ) : (
                          `$${Number(service.price).toFixed(2)}`
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
                          <>
                            <button onClick={() => handleEdit(service)} className="bg-blue-500 text-white px-3 py-1 rounded">Edit</button>
                            <button onClick={() => handleDelete(service.id)} className="bg-red-500 text-white px-3 py-1 rounded ml-2">Delete</button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {totalPages > 1 && (
            <div className="flex justify-center mt-4 gap-2">
              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i + 1}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`px-3 py-1 rounded border ${currentPage === i + 1 ? 'bg-blue-600 text-white' : 'bg-white text-blue-600'}`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          )}
        </section>
      </main>
    </>
  );
}
