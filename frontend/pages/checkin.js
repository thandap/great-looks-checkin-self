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
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <h1>Check In Online</h1>
        {!submitted ? (
          <form onSubmit={handleSubmit} style={{ display: 'inline-block', textAlign: 'left' }}>
            <label>Name:<br /><input type="text" name="name" value={formData.name} onChange={handleChange} required /></label><br /><br />
            <label>Phone:<br /><input type="text" name="phone" value={formData.phone} onChange={handleChange} required /></label><br /><br />
            <label>Service:<br /><input type="text" name="service" value={formData.service} onChange={handleChange} required /></label><br /><br />
            <label>Preferred Stylist:<br /><input type="text" name="stylist" value={formData.stylist} onChange={handleChange} /></label><br /><br />
            <label>Preferred Time:<br /><input type="text" name="time" value={formData.time} onChange={handleChange} /></label><br /><br />
            <button type="submit">Check In</button>
          </form>
        ) : (
          <h3>Thank you! Your check-in has been received.</h3>
        )}
      </div>
    </>
  );
}
