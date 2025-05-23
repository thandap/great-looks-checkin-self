import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import NavBar from '../components/NavBar';

export default function CheckIn() {
  const router = useRouter();
  const [formData, setFormData] = useState({ name: '', phone: '', stylist: '', time: '' });
  const [stylists, setStylists] = useState([]);
  const [services, setServices] = useState([]);
  const [selectedServices, setSelectedServices] = useState([]);
  const [availableTimes, setAvailableTimes] = useState([]);
  const [submitted, setSubmitted] = useState(false);
  const [estimatedWait, setEstimatedWait] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [stylistsRes, servicesRes] = await Promise.all([
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/stylists`),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/services`)
        ]);
        setStylists(await stylistsRes.json());
        setServices(await servicesRes.json());
      } catch (err) {
        console.error('Failed to load stylists/services:', err);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (!formData.stylist) return;
    const fetchTimes = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/availability?stylist=${formData.stylist}`);
        setAvailableTimes(await res.json());
      } catch (err) {
        console.error('Failed to load availability:', err);
      }
    };
    fetchTimes();
  }, [formData.stylist]);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleServiceCheck = (e) => {
    const { value, checked } = e.target;
    setSelectedServices(prev => checked ? [...prev, value] : prev.filter(s => s !== value));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const finalForm = {
        ...formData,
        service: selectedServices.join(', '),
        checkInMethod: 'online'
      };

      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/checkin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(finalForm)
      });

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/checkins`);
      const checkins = await res.json();

      const waitingAhead = checkins.filter(c =>
        c.stylist === formData.stylist &&
        c.status === 'Waiting' &&
        new Date(c.created_at) < new Date()
      );

      setEstimatedWait(waitingAhead.length * 15);
      setSubmitted(true);
    } catch (error) {
      console.error('Check-in failed:', error);
    }
  };

  return (
    <>
      <NavBar />
      <main className="min-h-screen bg-[#FDFBF9] flex items-center justify-center px-4">
        <section className="bg-white shadow-2xl rounded-2xl p-8 max-w-md w-full">
          <h1 className="text-3xl font-serif text-center text-black mb-6">Check In Online</h1>
          {!submitted ? (
            <form onSubmit={handleSubmit} className="space-y-5">
              <input name="name" required placeholder="Name" value={formData.name} onChange={handleChange} className="w-full border rounded-md px-4 py-2" />
              <input name="phone" required placeholder="Phone" value={formData.phone} onChange={handleChange} className="w-full border rounded-md px-4 py-2" />
              <div>
                {services.map(({ id, name }) => (
                  <label key={id} className="block">
                    <input type="checkbox" value={name} checked={selectedServices.includes(name)} onChange={handleServiceCheck} className="mr-2" />
                    {name}
                  </label>
                ))}
              </div>
              <select name="stylist" required value={formData.stylist} onChange={handleChange} className="w-full border rounded-md px-4 py-2">
                <option value="">Select Stylist</option>
                {stylists.map(({ id, name }) => <option key={id} value={name}>{name}</option>)}
              </select>
              <select name="time" required value={formData.time} onChange={handleChange} className="w-full border rounded-md px-4 py-2">
                <option value="">Select Time</option>
                {Array.isArray(availableTimes) && availableTimes.map((t, idx) => <option key={idx} value={t}>{t}</option>)}
              </select>
              <button type="submit" className="w-full bg-[#8F9779] text-white py-2 rounded-md">Check In</button>
            </form>
          ) : (
            <>
              <h2 className="text-center text-green-600 text-xl font-medium">✅ Thank you! Your check-in has been received.</h2>
              <p className="text-center text-gray-700 mt-2">🕒 Your wait time is approx {estimatedWait} minutes.</p>
            </>
          )}
        </section>
      </main>
    </>
  );
}