import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import NavBar from '../components/NavBar';

function StylistNotes({ item }) {
  const [note, setNote] = useState('');
  const [noteType, setNoteType] = useState('stylist');
  const [createdBy, setCreatedBy] = useState('Admin');
  const [loading, setLoading] = useState(true);
  const [previousNote, setPreviousNote] = useState('');
  const [noteTimestamp, setNoteTimestamp] = useState(null);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const fetchNote = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/stylist-notes/${item.phone}/${item.stylist}`);
        const data = await res.json();
        if (Array.isArray(data)) {
          setHistory(data);
          const latest = data.find(n => n.note_type === noteType);
          if (latest) {
            setNote(latest.note_text);
            setPreviousNote(latest.note_text);
            setNoteTimestamp(latest.created_at);
          } else {
            setNote('');
            setPreviousNote('');
            setNoteTimestamp(null);
          }
        }
      } catch (err) {
        console.error('Error loading stylist note:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchNote();
  }, [item.phone, item.stylist, noteType]);

  const handleBlur = async () => {
    const clean = note.trim();
    if (!clean || clean === previousNote) return;
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/checkins/${item.id}/stylist-notes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-token': localStorage.getItem('adminToken')
        },
        body: JSON.stringify({ notes: clean, note_type: noteType, created_by: createdBy })
      });
      if (res.ok) {
        setPreviousNote(clean);
        const responseData = await res.json();
        setNoteTimestamp(responseData.created_at);
      }
    } catch (err) {
      console.error('Error saving stylist note:', err);
    }
  };

  return (
    <div className="mt-2">
      <div className="flex items-center gap-4 mb-2">
        <select
          value={noteType}
          onChange={(e) => setNoteType(e.target.value)}
          className="text-sm border rounded p-1"
        >
          <option value="stylist">Stylist Note</option>
          <option value="admin">Admin Note</option>
        </select>
        <input
          type="text"
          value={createdBy}
          onChange={e => setCreatedBy(e.target.value)}
          placeholder="Your name"
          className="text-sm border rounded p-1 w-32"
        />
      </div>
      <textarea
        value={note}
        disabled={loading}
        className="w-full border mt-1 rounded p-2 text-sm focus:bg-white bg-gray-50 transition-colors"
        placeholder={`Enter ${noteType} note here...`}
        onChange={e => setNote(e.target.value)}
        onBlur={handleBlur}
      ></textarea>
      {noteTimestamp && (
        <p className="text-xs text-gray-400">Last updated: {new Date(noteTimestamp).toLocaleString()}</p>
      )}
      {history.length > 0 && (
        <div className="mt-3 text-sm">
          <p className="font-semibold mb-1 text-gray-700">📜 Note History:</p>
          <ul className="space-y-1">
            {history.map((entry, idx) => (
              <li key={idx} className={`p-2 rounded border-l-4 ${entry.note_type === 'admin' ? 'bg-red-50 border-red-400' : 'bg-green-50 border-green-400'}`}>
                <div className="text-xs text-gray-500 mb-1">
                  <strong>{entry.note_type.toUpperCase()}</strong> by {entry.created_by || 'Unknown'} at {new Date(entry.created_at).toLocaleString()}
                </div>
                <div className="text-gray-800">{entry.note_text}</div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default function Admin() {
  const router = useRouter();
  const [checkins, setCheckins] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      router.push('/admin-login');
    }
  }, [router]);

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

  const waiting = checkins.filter(c => c.status === 'Waiting');
  const nowServing = checkins.filter(c => c.status === 'Now Serving');

  return (
    <>
      <NavBar />
      <main className="min-h-screen bg-gray-50 p-6" role="main">
        <section className="max-w-4xl mx-auto" aria-labelledby="admin-heading">
          <h1 id="admin-heading" className="text-3xl font-bold text-gray-800 mb-6">Admin Panel</h1>

          {/* Waiting Queue */}
          <h2 className="text-2xl font-semibold text-yellow-700 mb-4">⏳ Waiting Queue</h2>
          {waiting.length === 0 ? (
            <p className="text-gray-500 mb-6">No customers waiting.</p>
          ) : (
            <ul className="space-y-4 mb-8">
              {waiting.map(item => (
                <li key={item.id} className="bg-white p-4 rounded shadow">
                  <p className="font-semibold text-lg">{item.name}</p>
                  <p className="text-gray-600 text-sm">📞 {item.phone} | 💇 {item.service} | ✂️ {item.stylist}</p>
                  {item.notes && (
                    <p className="text-sm bg-yellow-50 border-l-4 border-yellow-400 p-2 mt-1 rounded">
                      📝 <strong>Notes:</strong> <em>{item.notes}</em>
                    </p>
                  )}
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

          {/* Now Serving */}
          <h2 className="text-2xl font-semibold text-green-700 mb-4">✅ Now Serving</h2>
          {nowServing.length === 0 ? (
            <p className="text-gray-500">No one is currently being served.</p>
          ) : (
            <ul className="space-y-4">
              {nowServing.map(item => (
                <li key={item.id} className="bg-green-100 border border-green-400 p-4 rounded shadow">
                  <p className="font-semibold text-lg">{item.name}</p>
                  <p className="text-gray-600 text-sm">📞 {item.phone} | 💇 {item.service} | ✂️ {item.stylist}</p>
                  {item.notes && (
                    <p className="text-sm bg-yellow-50 border-l-4 border-yellow-400 p-2 mt-1 rounded">
                      📝 <strong>Notes:</strong> <em>{item.notes}</em>
                    </p>
                  )}
                  <StylistNotes item={item} />
                  <p className="text-sm text-gray-600">
                    ⏳ Wait: {Math.floor((Date.now() - new Date(item.created_at)) / 60000)} min
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
        </section>
      </main>
    </>
  );
}
