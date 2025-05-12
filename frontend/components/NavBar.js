// frontend/components/NavBar.js
import Link from 'next/link';

export default function NavBar() {
  return (
    <nav style={{ backgroundColor: '#1a1a1a', padding: '10px 0', textAlign: 'center' }}>
      <Link href="/" style={{ margin: '0 15px', color: '#FFD700', textDecoration: 'none', fontWeight: 'bold' }}>Home</Link>
      <Link href="/about" style={{ margin: '0 15px', color: '#FFD700', textDecoration: 'none', fontWeight: 'bold' }}>About</Link>
      <Link href="/services" style={{ margin: '0 15px', color: '#FFD700', textDecoration: 'none', fontWeight: 'bold' }}>Services</Link>
      <Link href="/contact" style={{ margin: '0 15px', color: '#FFD700', textDecoration: 'none', fontWeight: 'bold' }}>Contact</Link>
      <Link href="/checkin" style={{ margin: '0 15px', color: '#FFD700', textDecoration: 'none', fontWeight: 'bold' }}>Check In</Link>
    </nav>
  );
}
