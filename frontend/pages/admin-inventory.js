import { useEffect, useState } from 'react';
import NavBar from '../components/NavBar';

export default function AdminInventory() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({ name: '', stock: 0, cost: '', price: '' });
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState(null);

  const fetchInventory = async () => {
    const token = localStorage.getItem('adminToken');
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/inventory`, {
        headers: { 'x-admin-token': token }
      });
      const data = await res.json();
      setItems(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error loading inventory:', err);
      setError('Failed to load inventory');
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('adminToken');
    const method = editingId ? 'PUT' : 'POST';
    const url = editingId
      ? `${process.env.NEXT_PUBLIC_API_URL}/admin/inventory/${editingId}`
      : `${process.env.NEXT_PUBLIC_API_URL}/admin/inventory`;

    try {
      await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'x-admin-token': token
        },
        body: JSON.stringify({ ...form, is_active: true })
      });
      setForm({ name: '', stock: 0, cost: '', price: '' });
      setEditingId(null);
      fetchInventory();
    } catch (err) {
      console.error('Error saving inventory item:', err);
    }
  };

  const startEdit = (item) => {
    setEditingId(item.id);
    setForm({ name: item.name, stock: item.stock, cost: item.cost, price: item.price });
  };

  const handleDelete = async (id) => {
    const token = localStorage.getItem('adminToken');
    if (!confirm('Delete this inventory item?')) return;
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/inventory/${id}`, {
        method: 'DELETE',
        headers: { 'x-admin-token': token }
      });
      fetchInventory();
    } catch (err) {
      console.error('Error deleting item:', err);
    }
  };

  return (
    <>
      <NavBar />
      <main className="min-h-screen bg-gray-50 p-6">
        <section className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-6 text-gray-800">📦 Inventory Management</h1>

          {error && <p className="text-red-600">{error}</p>}

          <form onSubmit={handleSubmit} className="bg-white p-4 rounded shadow space-y-4 mb-6">
            <div className="grid grid-cols-2 gap-4">
              <input name="name" placeholder="Item name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="border p-2 rounded" required />
              <input name="stock" type="number" placeholder="Stock" value={form.stock} onChange={e => setForm({ ...form, stock: parseInt(e.target.value) })} className="border p-2 rounded" required />
              <input name="cost" type="number" placeholder="Cost" value={form.cost} onChange={e => setForm({ ...form, cost: e.target.value })} className="border p-2 rounded" />
              <input name="price" type="number" placeholder="Price" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} className="border p-2 rounded" />
            </div>
            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
              {editingId ? 'Update Item' : 'Add Item'}
            </button>
          </form>

          <table className="w-full table-auto border">
            <thead>
              <tr className="bg-gray-100">
                <th className="border px-4 py-2 text-left">Name</th>
                <th className="border px-4 py-2 text-right">Stock</th>
                <th className="border px-4 py-2 text-right">Cost</th>
                <th className="border px-4 py-2 text-right">Price</th>
                <th className="border px-4 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map(item => (
                <tr key={item.id} className="border-t">
                  <td className="px-4 py-2">{item.name}</td>
                  <td className="px-4 py-2 text-right">{item.stock}</td>
                  <td className="px-4 py-2 text-right">${item.cost}</td>
                  <td className="px-4 py-2 text-right">${item.price}</td>
                  <td className="px-4 py-2 text-center space-x-2">
                    <button onClick={() => startEdit(item)} className="text-blue-600 hover:underline">Edit</button>
                    <button onClick={() => handleDelete(item.id)} className="text-red-600 hover:underline">Delete</button>
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
