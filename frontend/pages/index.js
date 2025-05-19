import NavBar from '../components/NavBar';
import Link from 'next/link';

export default function Home() {
  return (
    <>
      <NavBar />
      <main className="flex items-center justify-center min-h-[calc(100vh-80px)] bg-gradient-to-br from-yellow-100 via-white to-gray-100 px-6">
        <div className="text-center max-w-2xl">
          <h1 className="text-5xl font-extrabold text-gray-800 mb-6 font-serif leading-tight drop-shadow">
            Welcome to <span className="text-yellow-500">Great Looks</span> Salon & Barber Studio
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            Check in online and skip the wait. Our expert stylists are ready to help you look your best!
          </p>
          <Link href="/checkin">
            <button className="bg-yellow-400 text-white px-6 py-3 rounded-full text-lg font-medium hover:bg-yellow-500 transition">
              ✂️ Check In Now
            </button>
          </Link>
        </div>
      </main>
    </>
  );
}


