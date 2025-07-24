'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

import bcrypt from 'bcryptjs';
import { jwtDecode } from 'jwt-decode';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();


    const {data: user} = await supabase
            .from('users')
            .select('*')
            .eq('email', email)
            .single();

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (isPasswordValid) {
      localStorage.setItem('userId', user.userId);
      router.push('/view');
    } else {
      alert(error || 'Login failed');
    }
  }

  return (
    <div className="flex flex-col max-w-md mx-auto p-6 justify-center h-screen">
      <div className="text-2xl font-bold mb-4">Login</div>

      <form onSubmit={handleLogin} className="flex flex-col space-y-3">
        <input
          type="email"
          placeholder="Email"
          className="border p-2 rounded"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Password"
          className="border p-2 rounded"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button type="submit" className="bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
          Login
        </button>
      </form>

      {/* Register Redirect Button */}
      <div className="mt-4 text-center">
        <button
          className="text-sm text-blue-600 hover:underline"
          onClick={() => router.push('/register')}
        >
          Don’t have an account? Register
        </button>
      </div>
    </div>
  );
}
