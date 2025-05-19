import Link from 'next/link';

export default function NavBar() {
  return (
    <nav className="bg-black text-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold tracking-wide text-yellow-400 hover:text-white transition">
          Great Looks
        </Link>
        <div className="flex flex-wrap gap-x-6 gap-y-2 text-lg justify-center">
          <Link href="/" className="hover:text-yellow-400 border-b-2 border-transparent hover:border-yellow-400 pb-1 transition">Home</Link>
          <Link href="/checkin" className="hover:text-yellow-400 border-b-2 border-transparent hover:border-yellow-400 pb-1 transition">Check In</Link>
          <Link href="/services" className="hover:text-yellow-400 border-b-2 border-transparent hover:border-yellow-400 pb-1 transition">Services</Link>
          <Link href="/about" className="hover:text-yellow-400 border-b-2 border-transparent hover:border-yellow-400 pb-1 transition">About</Link>
          <Link href="/contact" className="hover:text-yellow-400 border-b-2 border-transparent hover:border-yellow-400 pb-1 transition">Contact</Link>
          <Link href="/admin" className="hover:text-yellow-400 border-b-2 border-transparent hover:border-yellow-400 pb-1 transition">Admin</Link>
        </div>
      </div>
    </nav>
  );
}
