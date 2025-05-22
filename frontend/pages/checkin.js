import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import NavBar from '../components/NavBar';

export default function CheckIn() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    stylist: '',
    time: ''
  });
  const [stylists, setStylists] = useState([]);
  const [services, setServices] = useState([]);
  const [selectedServices, setSelectedServices] = useState([]);
  const [availableTimes, setAvailableTimes] = useState([]);
  const [submitted, setSubmitted] = useState(false);
  const [estimatedWait, setEstimatedWait] = useState(null);

  // Initial data fetch
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

  // Fetch available times once stylist is chosen
  useEffect(() => {
    if (!formData.stylist) return;
    const fetchTimes = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/availability?stylist=${formData.stylist}`);
        const data = await res.json();
        setAvailableTimes(data);
      } catch (err) {
        console.error('Failed to load availability:', err);
      }
    };
    
    fetchTimes();
  }, [formData.stylist]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleServiceCheck = (e) => {
    const { value, checked } = e.target;
    if (checked) {
      setSelectedServices(prev => [...prev, value]);
    } else {
      setSelectedServices(prev => prev.filter(s => s !== value));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const finalForm = {
        ...formData,
        service: selectedServices.join(', ')
      };

      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/checkin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(finalForm)
      });

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/checkins`);
      const checkins = await res.json();
      const waiting = checkins.filter(c => c.stylist === formData.stylist);
      setEstimatedWait(waiting.length * 15);

      setSubmitted(true);
    } catch (error) {
      console.error('Check-in failed:', error);
    }
  };

  return (
    <>
      <NavBar />
      <main className="min-h-screen bg-[#FDFBF9] flex items-center justify-center px-4">
        <section className="bg-white shadow-2xl rounded-2xl p-8 max-w-md w-full" aria-labelledby="checkin-heading">
          <h1 id="checkin-heading" className="text-3xl font-serif text-center text-black mb-6">
            Check In Online
          </h1>

          {!submitted ? (
            <form onSubmit={handleSubmit} className="space-y-5" aria-label="Check-in form">
              <div>
                <label htmlFor="name" className="block font-medium text-gray-700">Name</label>
                <input id="name" name="name" required type="text" value={formData.name} onChange={handleChange}
                  className="w-full border rounded-md px-4 py-2 focus:ring-2 focus:ring-[#8F9779]" />
              </div>

              <div>
                <label htmlFor="phone" className="block font-medium text-gray-700">Phone</label>
                <input id="phone" name="phone" required type="tel" value={formData.phone} onChange={handleChange}
                  className="w-full border rounded-md px-4 py-2 focus:ring-2 focus:ring-[#8F9779]" />
              </div>

              <div>
                <p className="block font-medium text-gray-700 mb-1">Select Services</p>
                {services.map(({ id, name }) => (
                  <label key={id} className="block text-sm">
                    <input
                      type="checkbox"
                      value={name}
                      checked={selectedServices.includes(name)}
                      onChange={handleServiceCheck}
                      className="mr-2"
                    />
                    {name}
                  </label>
                ))}
              </div>

              <div>
                <label htmlFor="stylist" className="block font-medium text-gray-700">Preferred Stylist</label>
                <select id="stylist" name="stylist" required value={formData.stylist} onChange={handleChange}
                  className="w-full border rounded-md px-4 py-2 focus:ring-2 focus:ring-[#8F9779]">
                  <option value="">Select Stylist</option>
                  {stylists.map(({ id, name }) => (
                    <option key={id} value={name}>{name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="time" className="block font-medium text-gray-700">Available Time</label>
                           {!Array.isArray(availableTimes) ? (
  <p className="text-sm text-red-500">❌ Error loading available times</p>
) : null}
                <select id="time" name="time" required value={formData.time} onChange={handleChange}
                  className="w-full border rounded-md px-4 py-2 focus:ring-2 focus:ring-[#8F9779]">
                  <option value="">Select Time</option>
                 {Array.isArray(availableTimes) && availableTimes.map((t, idx) => (
  <option key={idx} value={t}>{t}</option>
))}
               
                </select>
              </div>

              <button type="submit"
                className="w-full bg-[#8F9779] text-white py-2 rounded-md hover:bg-[#7b8569] transition">
                Check In
              </button>
            </form>
          ) : (
            <>
              <h2 className="text-center text-green-600 text-xl font-medium" role="status">
                ✅ Thank you! Your check-in has been received.
              </h2>
            
                <p className="text-center text-gray-700 mt-2">
      🕒        Your appointment with {formData.stylist} is booked at {formData.time}.
              </p>
             
            </>
          )}
        </section>
      </main>
    </>
  );
}
