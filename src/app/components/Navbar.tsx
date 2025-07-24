'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="bg-gray-100 px-4 py-3 shadow flex justify-between items-center">
      <h1 className="text-lg font-bold">Food Tracker</h1>
      <div className="flex gap-4">
        <Link
          href="/view"
          className={`font-medium ${
            pathname === '/view' || pathname === 'view' ? 'text-blue-600 underline' : ''
          }`}
        >
          View Food
        </Link>
        <Link
          href="/add"
          className={`font-medium ${
            pathname === '/add' || pathname === '/add' ? 'text-blue-600 underline' : ''
          }`}
        >
          Add Food
        </Link>
      </div>
    </nav>
  );
}
