import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState, useEffect, useRef } from 'react';

export default function NavBar() {
  const router = useRouter();
  const [adminOpen, setAdminOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const adminRef = useRef(null);

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    setIsAdmin(!!token);

    const handleClickOutside = (e) => {
      if (adminRef.current && !adminRef.current.contains(e.target)) {
        setAdminOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    setIsAdmin(false);
    router.push('/');
  };

  const navItems = [
    { name: 'Home', path: '/' },
    { name: 'Check In', path: '/checkin' },
    { name: 'Services', path: '/services' },
    { name: 'About', path: '/about' },
    { name: 'Contact', path: '/contact' }
  ];

  return (
    <nav className="bg-black text-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        <Link href="/" className="text-3xl font-extrabold tracking-tight text-yellow-400">
          Great Looks
        </Link>
        <div className="flex gap-6 text-lg items-center">
          {navItems.map((item) => (
            <Link
              key={item.name}
              href={item.path}
              className={`pb-1 border-b-2 transition duration-200 ${
                router.pathname === item.path
                  ? 'text-yellow-400 border-yellow-400'
                  : 'border-transparent hover:text-yellow-300 hover:border-yellow-300'
              }`}
            >
              {item.name}
            </Link>
          ))}

          <div className="relative" ref={adminRef}>
            <button
              onClick={() => setAdminOpen(prev => !prev)}
              className="pb-1 border-b-2 border-transparent hover:border-yellow-300 focus:outline-none"
            >
              Admin
            </button>
            <div
              className={`absolute right-0 bg-black mt-2 shadow-lg rounded p-2 space-y-1 z-10 min-w-[160px] transition-opacity duration-200 ${
                adminOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
              }`}
            >
              {isAdmin ? (
                <>
                  <Link href="/admin" className="block text-sm hover:text-yellow-300 px-2 py-1">
                    Admin Panel
                  </Link>
                  <Link href="/admin-dashboard" className="block text-sm hover:text-yellow-300 px-2 py-1">
                    Analytics Dashboard
                  </Link>
                  <Link href="/admin-services" className="block text-sm hover:text-yellow-300 px-2 py-1">
                    Manage Services
                  </Link>
                  <Link href="/admin-inventory" className="block text-sm hover:text-yellow-300 px-2 py-1">
                    Manage Inventory
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left text-sm hover:text-red-400 px-2 py-1"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <Link href="/admin-login" className="block text-sm hover:text-yellow-300 px-2 py-1">
                  Admin Login
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
