import { useEffect, useState, useRef } from 'react';
import dynamic from 'next/dynamic';
import NavBar from '../components/NavBar';

export default function AdminInventory() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({ name: '', stock: 0, cost: '', price: '', barcode: '' });
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [showScanner, setShowScanner] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState('name');
  const [sortAsc, setSortAsc] = useState(true);
  const itemsPerPage = 10;
  const qrCodeRef = useRef(null);

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    const token = localStorage.getItem('adminToken');
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/inventory`, {
        headers: { 'x-admin-token': token }
      });
      const data = await res.json();
      setItems(Array.isArray(data) ? data.map(item => ({ ...item, barcode: item.barcode || '' })) : []);
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
        setError('No info found for this barcode — please enter details manually.');
      }
    } catch (err) {
      console.error('Barcode lookup failed:', err);
      setError('Failed to fetch product info');
    }
  };

  const startBarcodeScanner = async () => {
    if (typeof window !== 'undefined') {
      const { Html5Qrcode } = await import('html5-qrcode');
      const html5QrCode = new Html5Qrcode("reader");
      qrCodeRef.current = html5QrCode;

      const config = { fps: 10, qrbox: 250 };

      html5QrCode.start(
        { facingMode: "environment" },
        config,
        async (decodedText) => {
          await html5QrCode.stop();
          setForm((prev) => ({ ...prev, barcode: decodedText }));
          setShowScanner(false);
          qrCodeRef.current = null;
          await fetchProductDetailsByBarcode(decodedText);
        },
        (errorMessage) => {
          console.warn(errorMessage);
        }
      ).catch((err) => console.error("Error starting scanner", err));
    }
  };

  const stopScanner = async () => {
    if (qrCodeRef.current) {
      try {
        await qrCodeRef.current.stop();
        qrCodeRef.current.clear();
        qrCodeRef.current = null;
      } catch (err) {
        console.error('Error stopping scanner:', err);
      }
    }
    setShowScanner(false);
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  const sortedItems = [...items].sort((a, b) => {
    const aVal = a[sortField];
    const bVal = b[sortField];
    if (typeof aVal === 'string') {
      return sortAsc ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
    }
    return sortAsc ? aVal - bVal : bVal - aVal;
  });

  const filteredItems = sortedItems.filter(item =>
    (item.name && item.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (item.barcode && item.barcode.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const paginatedItems = filteredItems.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('adminToken');
    const method = editingId ? 'PUT' : 'POST';
    const url = editingId
      ? `${process.env.NEXT_PUBLIC_API_URL}/admin/inventory/${editingId}`
      : `${process.env.NEXT_PUBLIC_API_URL}/admin/inventory`;

    try {
      const payload = editingId
        ? { name: form.name, stock: form.stock, cost: form.cost, price: form.price, barcode: form.barcode, is_active: true }
        : { name: form.name, stock: form.stock, cost: form.cost, price: form.price, barcode: form.barcode };

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'x-admin-token': token
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || 'Failed to save');
      }

      setForm({ name: '', stock: 0, cost: '', price: '', barcode: '' });
      setEditingId(null);
      setError(null);
      setSuccess(editingId ? 'Item updated successfully' : 'Item added successfully');
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

  const exportToCSV = () => {
    const headers = ['Name', 'Stock', 'Cost', 'Price', 'Barcode'];
    const rows = items.map(item => [item.name, item.stock, item.cost, item.price, item.barcode || '']);
    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'inventory.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <>
      <NavBar />
      <main className="min-h-screen bg-gray-50 p-6">
        <section className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-3xl font-bold text-gray-800">📦 Inventory Management</h1>
            <button onClick={exportToCSV} className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600">Export CSV</button>
          </div>

          {error && <p className="text-red-600 mb-2">❌ {error}</p>}
          {success && <p className="text-green-600 mb-2">✅ {success}</p>}

          <input
            type="text"
            placeholder="Search items..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="mb-4 border px-3 py-2 rounded w-full"
          />

          <form onSubmit={handleSubmit} className="bg-white p-4 rounded shadow space-y-4 mb-6">
            <div className="grid grid-cols-2 gap-4">
              <label className="flex flex-col">
                <span className="text-sm text-gray-700 mb-1">Item Name</span>
                <input name="name" placeholder="e.g., Shampoo" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="border p-2 rounded" required />
              </label>
              <label className="flex flex-col">
                <span className="text-sm text-gray-700 mb-1">Stock</span>
                <input name="stock" type="number" placeholder="e.g., 12" value={form.stock} onChange={e => setForm({ ...form, stock: parseInt(e.target.value) })} className="border p-2 rounded" required />
              </label>
              <label className="flex flex-col">
                <span className="text-sm text-gray-700 mb-1">Cost</span>
                <input name="cost" type="number" placeholder="e.g., 3.50" value={form.cost} onChange={e => setForm({ ...form, cost: e.target.value })} className="border p-2 rounded" />
              </label>
              <label className="flex flex-col">
                <span className="text-sm text-gray-700 mb-1">Price</span>
                <input name="price" type="number" placeholder="e.g., 6.00" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} className="border p-2 rounded" />
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
                <div className="mt-2 flex gap-2">
                  <button type="button" onClick={() => { setShowScanner(true); startBarcodeScanner(); }} className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700">
                    Scan with Camera
                  </button>
                  {showScanner && (
                    <button type="button" onClick={stopScanner} className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600">
                      Stop Scanner
                    </button>
                  )}
                </div>
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
                {['name', 'stock', 'cost', 'price', 'barcode'].map(field => (
                  <th
                    key={field}
                    className="border px-4 py-2 cursor-pointer text-left"
                    onClick={() => handleSort(field)}
                  >
                    {field.charAt(0).toUpperCase() + field.slice(1)} {sortField === field ? (sortAsc ? '▲' : '▼') : ''}
                  </th>
                ))}
                <th className="border px-4 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedItems.map(item => (
                <tr key={item.id} className="border-t">
                  <td className="px-4 py-2">{item.name}</td>
                  <td className={`px-4 py-2 text-right ${item.stock <= 5 ? 'text-red-600 font-semibold' : ''}`}>{item.stock}</td>
                  <td className="px-4 py-2 text-right">${item.cost}</td>
                  <td className="px-4 py-2 text-right">${item.price}</td>
                  <td className="px-4 py-2 text-right">{item.barcode || '-'}</td>
                  <td className="border px-4 py-2 text-center space-x-2">
                    <button onClick={() => startEdit(item)} className="bg-blue-500 text-white px-3 py-1 rounded">Edit</button>
                    <button onClick={() => handleDelete(item.id)} className="bg-red-500 text-white px-3 py-1 rounded">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

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
