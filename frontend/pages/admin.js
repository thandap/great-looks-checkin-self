import { useEffect, useState } from 'react';
import NavBar from '../components/NavBar';

function StylistNotes({ item }) {
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(true);
  const [previousNote, setPreviousNote] = useState('');
  const [noteTimestamp, setNoteTimestamp] = useState(null);

  useEffect(() => {
    const fetchNote = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/stylist-notes/${item.phone}/${item.stylist}`);
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          const stylistNote = data.find(n => n.note_type === 'stylist');
          if (stylistNote) {
            setNote(stylistNote.note_text);
            setPreviousNote(stylistNote.note_text);
            setNoteTimestamp(stylistNote.created_at);
          }
        }
      } catch (err) {
        console.error('Error loading stylist note:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchNote();
  }, [item.phone, item.stylist]);

  const handleBlur = async () => {
    const clean = note.trim();
    if (!clean || clean === previousNote) return;
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/checkins/${item.id}/stylist-notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes: clean })
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
      <textarea
        value={note}
        disabled={loading}
        className="w-full border mt-1 rounded p-2 text-sm focus:bg-white bg-gray-50 transition-colors"
        placeholder="Stylist notes (tools used, preferences, etc.)"
        onChange={e => setNote(e.target.value)}
        onBlur={handleBlur}
      ></textarea>
      {noteTimestamp && (
        <p className="text-xs text-gray-400">Last updated: {new Date(noteTimestamp).toLocaleString()}</p>
      )}
    </div>
  );
}

export default function Admin() {
  const [checkins, setCheckins] = useState([]);

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
