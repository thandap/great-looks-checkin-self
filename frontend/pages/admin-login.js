import { useState } from 'react';
import { useRouter } from 'next/router';
import NavBar from '../components/NavBar';

export default function AdminLogin() {
  const [token, setToken] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (token.trim().length < 6) {
      setError('Token must be at least 6 characters');
      return;
    }
    localStorage.setItem('adminToken', token);
    router.push('/admin');
  };

  return (
    <>
      <NavBar />
      <main className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
        <section className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
          <h1 className="text-2xl font-semibold mb-4 text-center">Admin Login</h1>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="password"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="Enter admin token"
              className="w-full border px-4 py-2 rounded"
            />
            {error && <p className="text-sm text-red-600">{error}</p>}
            <button type="submit" className="w-full bg-black text-white py-2 rounded hover:bg-gray-800">
              Login
            </button>
          </form>
        </section>
      </main>
    </>
  );
}
