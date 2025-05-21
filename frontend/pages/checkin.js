import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import NavBar from '../components/NavBar';

export default function CheckIn() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    service: '',
    stylist: '',
    time: ''
  });
  const [stylists, setStylists] = useState([]);
  const [submitted, setSubmitted] = useState(false);
  const [estimatedWait, setEstimatedWait] = useState(null);

  useEffect(() => {
    // Fetch stylists from backend
    const fetchStylists = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/stylists`);
        const data = await res.json();
        setStylists(data);
      } catch (err) {
        console.error('Failed to load stylists:', err);
      }
    };
    fetchStylists();
  }, []);

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

      // ✅ Fetch waiting queue and filter by stylist
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/checkins`);
      const checkins = await res.json();
      const waitingForSameStylist = checkins.filter(
        (c) => c.stylist === formData.stylist
      );

      const avgMinutes = 15;
      setEstimatedWait(waitingForSameStylist.length * avgMinutes);

      setSubmitted(true);
    } catch (error) {
      console.error('Check-in failed', error);
    }
  };

  return (
    <>
      <NavBar />
      <main className="min-h-screen bg-[#FDFBF9] flex items-center justify-center px-4" role="main">
        <section className="bg-white shadow-2xl rounded-2xl p-8 max-w-md w-full" aria-labelledby="checkin-heading">
          <h1 id="checkin-heading" className="text-3xl font-serif text-center text-black mb-6">
            Check In Online
          </h1>

          {!submitted ? (
            <form onSubmit={handleSubmit} className="space-y-5" aria-label="Check-in form">
              <div>
                <label htmlFor="name" className="block mb-1 font-medium text-gray-700">Name</label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#8F9779]"
                />
              </div>

              <div>
                <label htmlFor="phone" className="block mb-1 font-medium text-gray-700">Phone</label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#8F9779]"
                />
              </div>

              <div>
                <label htmlFor="service" className="block mb-1 font-medium text-gray-700">Service</label>
                <input
                  id="service"
                  name="service"
                  type="text"
                  required
                  value={formData.service}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#8F9779]"
                />
              </div>

              <div>
                <label htmlFor="stylist" className="block mb-1 font-medium text-gray-700">Preferred Stylist</label>
                <select
                  id="stylist"
                  name="stylist"
                  value={formData.stylist}
                  onChange={handleChange}
                  required
                  className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#8F9779]"
                >
                  <option value="">Select Stylist</option>
                  {stylists.map(({ id, name }) => (
                    <option key={id} value={name}>{name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="time" className="block mb-1 font-medium text-gray-700">Preferred Time</label>
                <input
                  id="time"
                  name="time"
                  type="datetime-local"
                  value={formData.time}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#8F9779]"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-[#8F9779] text-white py-2 rounded-md hover:bg-[#7b8569] transition"
              >
                Check In
              </button>
            </form>
          ) : (
            <>
              <h2 className="text-center text-green-600 text-xl font-medium" role="status">
                ✅ Thank you! Your check-in has been received.
              </h2>
              {estimatedWait !== null && (
                <p className="text-center text-gray-700 mt-2">
                  ⏳ Estimated wait time for {formData.stylist}: ~{estimatedWait} minutes.
                </p>
              )}
            </>
          )}
        </section>
      </main>
    </>
  );
}
