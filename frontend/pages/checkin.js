import { useState } from 'react';
import { useRouter } from 'next/router';
import NavBar from '../components/NavBar';

export default function CheckIn() {
  const router = useRouter();   // ✅ MUST be inside the component

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    service: '',
    stylist: '',
    time: ''
  });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/checkin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      setSubmitted(true);
      router.push('/');    // ✅ redirect after submit
    } catch (error) {
      console.error('Check-in failed', error);
    }
  };

  return (
   <>
  <NavBar />
  <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
    <div className="bg-white shadow-2xl rounded-2xl p-8 max-w-md w-full">
      <h1 className="text-3xl font-serif text-center text-black mb-6">Check In Online</h1>

      {!submitted ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-1 font-medium text-gray-700">Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-gold-400"
            />
          </div>

          <div>
            <label className="block mb-1 font-medium text-gray-700">Phone</label>
            <input
              type="text"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-gold-400"
            />
          </div>

          <div>
            <label className="block mb-1 font-medium text-gray-700">Service</label>
            <input
              type="text"
              name="service"
              value={formData.service}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-gold-400"
            />
          </div>

         <div>
  <label className="block mb-1 font-medium text-gray-700">Preferred Stylist</label>
  <select
    name="stylist"
    value={formData.stylist}
    onChange={handleChange}
    className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-400"
  >
    <option value="">Select Stylist</option>
    <option value="Jameel">Jameel</option>
    <option value="Mike">Mike</option>
    <option value="Anna">Anna</option>
  </select>
</div>

<div>
  <label className="block mb-1 font-medium text-gray-700">Preferred Time</label>
  <input
    type="datetime-local"
    name="time"
    value={formData.time}
    onChange={handleChange}
    className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-400"
  />
</div>

          <button
            type="submit"
            className="w-full bg-gold-400 text-white py-2 rounded-md hover:bg-yellow-500 transition"
          >
            Check In
          </button>
        </form>
      ) : (
        <h3 className="text-center text-green-600 text-xl font-medium">✅ Thank you! Your check-in has been received.</h3>
      )}
    </div>
  </div>
</>

  );
}
