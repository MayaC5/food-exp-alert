'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const res = await fetch('/api/register', {
      method: 'POST',
      body: JSON.stringify({ email, name, password }),
    });

    const data = await res.json();
    setLoading(false);

    if (res.ok) {
      alert('Registration successful. Please log in.');
      router.push('/login');
    } else {
      alert(data.error || 'Failed to register.');
    }
  }

  return (
    <form onSubmit={handleRegister} className="max-w-md mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Create an Account</h1>

      <input
        className="w-full mb-2 border p-2 rounded"
        type="text"
        placeholder="Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
      />

      <input
        className="w-full mb-2 border p-2 rounded"
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />

      <input
        className="w-full mb-4 border p-2 rounded"
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />

      <button
        type="submit"
        className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700"
        disabled={loading}
      >
        {loading ? 'Creating account...' : 'Register'}
      </button>
    </form>
  );
}
