import NavBar from '../components/NavBar';
import Link from 'next/link';

export default function Home() {
  return (
    <>
      <NavBar />
      <main className="flex items-center justify-center min-h-[calc(100vh-80px)] bg-gradient-to-br from-[#EDE6DB] via-white to-[#FDFBF9] px-4 sm:px-6">
        <div className="text-center max-w-2xl">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-[#333] mb-6 font-serif leading-tight drop-shadow">
            Welcome to <span className="text-[#8F9779]">Great Looks</span> Salon & Barber Studio
          </h1>
          <p className="text-base sm:text-lg text-gray-700 mb-8">
            Check in online and skip the wait. Our expert stylists are ready to help you look your best!
          </p>
          <Link href="/checkin">
            <button className="bg-[#8F9779] text-white px-6 py-3 rounded-full text-base sm:text-lg font-medium hover:bg-[#7b8569] transition w-full sm:w-auto">
              ✂️ Check In Now
            </button>
          </Link>
        </div>
      </main>
    </>
  );
}
