'use client'; // The Navbar now needs to be a Client Component

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function Navbar() {
  const { isLoggedIn, logout, user } = useAuth(); // Get state and functions from context

  return (
    <nav className="bg-white shadow-lg w-full z-10">
      <div className="container mx-auto px-6 py-4 flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold text-gray-800">
          🌊 Ocean Guardian
        </Link>

        <div className="hidden md:flex space-x-8 items-center">
          <Link href="/about" className="text-gray-600">About</Link>
          {isLoggedIn && (
            <>
              <Link href={user?.role === 'official' ? "/guardian/dashboard" : "/dashboard"} className="text-gray-600">
                Dashboard
              </Link>
              <Link href="/report" className="text-gray-600">Report a Hazard</Link>
            </>
          )}
        </div>

        <div>
          {isLoggedIn ? (
            <button onClick={logout} className="py-2 px-5 bg-red-500 text-white font-semibold rounded-lg">
              Logout
            </button>
          ) : (
            <Link href="/login" className="py-2 px-5 bg-blue-500 text-white font-semibold rounded-lg">
              Login
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}