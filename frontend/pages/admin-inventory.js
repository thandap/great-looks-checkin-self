import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import NavBar from '../components/NavBar';

const Html5QrcodeScanner = dynamic(() => import('html5-qrcode'), { ssr: false });

export default function AdminInventory() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({ name: '', stock: 0, cost: '', price: '', barcode: '' });
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [showScanner, setShowScanner] = useState(false);

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

  const fetchProductDetailsByBarcode = async (barcode) => {
    if (!barcode) return;
    try {
      const res = await fetch(`https://api.upcitemdb.com/prod/trial/lookup?upc=${barcode}`, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
     });
      const data = await res.json();
      if (data && data.items && data.items.length > 0) {
        const item = data.items[0];
        setForm((prev) => ({
          ...prev,
          name: item.title || prev.name,
          price: item.offers?.[0]?.price || prev.price
        }));
        setSuccess('Product info loaded from barcode');
      } else {
        setSuccess(null);
        setError('No info found for this barcode');
      }
    } catch (err) {
      console.error('Barcode lookup failed:', err);
      setError('Failed to fetch product info');
    }
  };

  const startBarcodeScanner = async () => {
    if (!window.Html5QrcodeScanner && typeof window !== 'undefined') {
      const { Html5Qrcode } = await import('html5-qrcode');
      const html5QrCode = new Html5Qrcode("reader");
      const config = { fps: 10, qrbox: 250 };

      html5QrCode.start(
        { facingMode: "environment" },
        config,
        async (decodedText) => {
          html5QrCode.stop();
          setForm((prev) => ({ ...prev, barcode: decodedText }));
          setShowScanner(false);
          await fetchProductDetailsByBarcode(decodedText);
        },
        (errorMessage) => {
          console.warn(errorMessage);
        }
      ).catch((err) => console.error("Error starting scanner", err));
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
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'x-admin-token': token
        },
        body: JSON.stringify({ ...form, is_active: true })
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Failed to save');

      setForm({ name: '', stock: 0, cost: '', price: '', barcode: '' });
      setEditingId(null);
      setError(null);
      setSuccess('Item saved successfully');
      fetchInventory();
    } catch (err) {
      console.error('Error saving inventory item:', err);
      setSuccess(null);
      setError(err.message || 'Save failed');
    }
  };

  const startEdit = (item) => {
    setEditingId(item.id);
    setForm({ name: item.name, stock: item.stock, cost: item.cost, price: item.price, barcode: item.barcode || '' });
    setError(null);
    setSuccess(null);
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

          {error && <p className="text-red-600 mb-2">❌ {error}</p>}
          {success && <p className="text-green-600 mb-2">✅ {success}</p>}

          <form onSubmit={handleSubmit} className="bg-white p-4 rounded shadow space-y-4 mb-6">
            <div className="grid grid-cols-2 gap-4">
              <label className="flex flex-col">
                <span className="text-sm text-gray-700 mb-1">Item Name</span>
                <input name="name" placeholder="e.g., Shampoo" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="border p-2 rounded" required />
              </label>
              <label className="flex flex-col">
                <span className="text-sm text-gray-700 mb-1">Stock</span>
                <input name="stock" type="number" min="0" placeholder="e.g., 12" value={form.stock} onChange={e => setForm({ ...form, stock: parseInt(e.target.value) || 0 })} className="border p-2 rounded" required />
              </label>
              <label className="flex flex-col">
                <span className="text-sm text-gray-700 mb-1">Cost ($)</span>
                <input name="cost" type="number" step="0.01" placeholder="e.g., 3.50" value={form.cost} onChange={e => setForm({ ...form, cost: e.target.value })} className="border p-2 rounded" />
              </label>
              <label className="flex flex-col">
                <span className="text-sm text-gray-700 mb-1">Price ($)</span>
                <input name="price" type="number" step="0.01" placeholder="e.g., 8.99" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} className="border p-2 rounded" />
              </label>
              <label className="flex flex-col col-span-2">
                <span className="text-sm text-gray-700 mb-1">Barcode</span>
                <input
                  name="barcode"
                  type="text"
                  placeholder="Scan or enter barcode"
                  value={form.barcode}
                  onChange={async e => {
                    const barcode = e.target.value;
                    setForm(prev => ({ ...prev, barcode }));
                    if (barcode.length >= 6) {
                      await fetchProductDetailsByBarcode(barcode);
                    }
                  }}
                  className="border p-2 rounded"
                />
                <button type="button" onClick={() => { setShowScanner(true); startBarcodeScanner(); }} className="mt-2 w-fit bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700">
                  Scan with Camera
                </button>
              </label>
            </div>
            {showScanner && <div id="reader" className="mt-4 border p-4" />}
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
                <th className="border px-4 py-2 text-right">Barcode</th>
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
                  <td className="px-4 py-2 text-right">{item.barcode || '-'}</td>
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
