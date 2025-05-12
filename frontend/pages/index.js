import NavBar from '../components/NavBar';
// frontend/pages/index.js
export default function Home() {
  return (
    <>
	<NavBar />
    <div style={{ textAlign: 'center', fontFamily: 'Poppins, sans-serif', backgroundColor: '#1a1a1a', color: '#fff', height: '100vh' }}>
      <h1 style={{ paddingTop: '100px', fontSize: '3rem' }}>Welcome to Great Looks Salon & Spa</h1>
      <p style={{ fontSize: '1.5rem', marginTop: '20px' }}>Haircuts, Massage, Eyebrow Threading for Men, Women & Children</p>
      <a href="/checkin" style={{ display: 'inline-block', marginTop: '40px', padding: '12px 24px', backgroundColor: '#FFD700', color: '#000', textDecoration: 'none', fontWeight: 'bold', borderRadius: '8px' }}>
        Check In Online
      </a>
    </div>
    </>	
  );
}
