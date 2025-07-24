"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

import bcrypt from 'bcryptjs';

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState("");

  

  const isEmailValid = (email: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);

    if (value === "") {
      setEmailError("");
    } else if (!isEmailValid(value)) {
      setEmailError("Invalid email format");
    } else {
      setEmailError("");
    }
  };

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    if (!isEmailValid(email)) {
      alert("Please enter a valid email address.");
      return;
    }

    //Hash password
     const hashedPassword = await bcrypt.hash(password, 10);
    
    const { data, error } = await supabase
      .from("users")
      .insert([{ name: name, email: email, password: hashedPassword }])
      .select();

    // const data = await res.json();
    setLoading(false);

    if (data) {
      alert("Registration successful. Please log in.");
      router.push("/login");
    } else {
      alert(error || "Failed to register.");
    }
  }

  return (
    <div className="flex flex-col max-w-md mx-auto p-6 justify-center h-screen">
      <form onSubmit={handleRegister}>
        <h1 className="text-2xl font-bold mb-4">Create an Account</h1>

        <div>Name</div>

        <input
          className="w-full mb-2 border p-2 rounded"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        <div>Email</div>

        <div className="mb-2">
          <input
            className="w-full  border p-2 rounded"
            type="email"
            value={email}
            onChange={handleEmailChange}
            required
          />

          {emailError && (
            <div className="text-red-600 text-sm">{emailError}</div>
          )}
        </div>

        <div>Password</div>

        <input
          className="w-full mb-4 border p-2 rounded"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button
          type="submit"
          className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700"
          disabled={loading}
        >
          {loading ? "Creating account..." : "Register"}
        </button>
      </form>
      {/* Register Redirect Button */}
      <div className="mt-4 text-center">
        <button
          className="text-sm text-blue-600 hover:underline"
          onClick={() => router.push("/login")}
        >
          Have an account? Login
        </button>
      </div>
    </div>
  );
}
