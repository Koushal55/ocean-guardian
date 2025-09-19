'use client';

import { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { jwtDecode } from 'jwt-decode';

interface User {
  id: string;
  name: string;
  role: 'citizen' | 'official';
}

interface AuthContextType {
  isLoggedIn: boolean;
  user: User | null;
  login: (token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      const decodedUser = jwtDecode<User>(token);
      setUser(decodedUser);
    }
  }, []);

  const login = (token: string) => {
    localStorage.setItem('token', token);
    const decodedUser = jwtDecode<User>(token);
    setUser(decodedUser);

    if (decodedUser.role === 'official') {
      router.push('/guardian/dashboard');
    } else {
      router.push('/dashboard');
    }
  };

  // --- THIS IS THE FIX ---
  const logout = () => {
    // 1. Remove the token from storage
    localStorage.removeItem('token');
    
    // 2. Force a full redirect and page reload to the homepage.
    // This bypasses the Next.js cache and guarantees a fresh page.
    window.location.href = '/'; 
  };
  // -------------------------

  return (
    <AuthContext.Provider value={{ isLoggedIn: !!user, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};