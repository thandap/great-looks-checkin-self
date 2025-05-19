// pages/testtailwind.js
import NavBar from '../components/NavBar';

export default function TestTailwind() {
  return (
    <>
      <NavBar />
      <div className="p-8 space-y-6">
        <div className="bg-blue-600 text-white p-4 rounded shadow-md">
          🔷 Tailwind Blue Box – Rounded, Padded, Shadowed
        </div>
        <div className="bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 text-white font-semibold text-xl p-6 rounded-lg">
          🌈 Gradient Background – Typography + Padding
        </div>
        <div className="flex space-x-4">
          <button className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded transition">
            Confirm
          </button>
          <button className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded transition">
            Cancel
          </button>
        </div>
        <div className="border-l-4 border-yellow-400 bg-yellow-100 p-4 text-yellow-800">
          ⚠️ Warning Message Box with border
        </div>
      </div>
    </>
  );
}
