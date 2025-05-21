import Link from 'next/link';
import { useRouter } from 'next/router';

export default function NavBar() {
  const router = useRouter();

  const navItems = [
    { name: 'Home', path: '/' },
    { name: 'Check In', path: '/checkin' },
    { name: 'Services', path: '/services' },
    { name: 'About', path: '/about' },
    { name: 'Contact', path: '/contact' },
    { name: 'Admin', path: '/admin' }
  ];

  return (
    <nav className="bg-black text-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        <Link href="/" className="text-3xl font-extrabold tracking-tight text-yellow-400">
          Great Looks
        </Link>
        <div className="flex gap-6 text-lg">
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
        </div>
      </div>
    </nav>
  );
}
