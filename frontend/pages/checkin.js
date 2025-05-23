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
  const [positionInLine, setPositionInLine] = useState(null);
  const [errors, setErrors] = useState({ phone: '' });
  const [loading, setLoading] = useState(false);

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

  const validatePhone = (phone) => {
    const phonePattern = /^\d{10}$/;
    return phonePattern.test(phone);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (name === 'phone') {
      setErrors(prev => ({ ...prev, phone: validatePhone(value) ? '' : 'Phone number must be 10 digits' }));
    }
  };

  const handleServiceCheck = (e) => {
    const { value, checked } = e.target;
    if (checked) {
      const serviceObj = services.find(s => s.name === value);
      setSelectedServices(prev => [...prev, serviceObj]);
    } else {
      setSelectedServices(prev => prev.filter(s => s.name !== value));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validatePhone(formData.phone)) {
      setErrors(prev => ({ ...prev, phone: 'Phone number must be 10 digits' }));
      return;
    }
    try {
      setLoading(true);
      const finalForm = {
        ...formData,
        service: selectedServices.map(s => s.name).join(', '),
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
      setPositionInLine(waitingAhead.length + 1); 
      setSubmitted(true);
    } catch (error) {
      console.error('Check-in failed:', error);
    } finally {
      setLoading(false);
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
              <div>
                <input name="phone" required placeholder="Phone (10 digits)" value={formData.phone} onChange={handleChange} className="w-full border rounded-md px-4 py-2" />
                {errors.phone && <p className="text-sm text-red-600 mt-1">{errors.phone}</p>}
              </div>
              <div>
                {services.map(({ id, name, price, duration }) => (
                  <label key={id} className="block text-sm">
                    <input type="checkbox" value={name} checked={selectedServices.some(s => s.name === name)} onChange={handleServiceCheck} className="mr-2" />
                    {name} - ${typeof price === 'number' ? price.toFixed(2) : '—'} ({duration || '--'} min)
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
              <button type="submit" disabled={loading} className={`w-full py-2 rounded-md text-white ${loading ? 'bg-gray-400' : 'bg-[#8F9779] hover:bg-[#7b8569]'}`}>
                {loading ? 'Checking In...' : 'Check In'}
              </button>
            </form>
          ) : (
            <>
              <h2 className="text-center text-green-600 text-xl font-medium" role="status">
                ✅ Thank you, {formData.name}!
              </h2>
              <div className="text-center text-gray-700 mt-2 space-y-2">
                <p>✂️ Stylist: <strong>{formData.stylist}</strong></p>
                <p>🕒 Estimated Wait: <strong>{estimatedWait} minutes</strong></p>
                <p>🎟️ You are approximately <strong>#{positionInLine}</strong> in line.</p>
              </div>
            </>
          )}
        </section>
      </main>
    </>
  );
}
