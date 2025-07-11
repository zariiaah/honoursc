
'use client';

import Link from 'next/link';
import { AuthService } from '@/lib/auth';
import { useState, useEffect } from 'react';
import { User } from '@/lib/database';

export default function Header() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const currentUser = AuthService.getCurrentUser();
    setUser(currentUser);
    setIsLoading(false);
  }, []);

  const handleLogout = () => {
    AuthService.logout();
    setUser(null);
    window.location.href = '/';
  };

  if (isLoading) {
    return (
      <header className="bg-blue-900 text-white shadow-lg">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-2xl font-bold">
              Project Britannia Honours
            </Link>
            <div className="animate-pulse bg-blue-800 h-8 w-32 rounded"></div>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="bg-blue-900 text-white shadow-lg">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold hover:text-blue-200 transition-colors">
            Project Britannia Honours
          </Link>
          
          <nav className="flex items-center space-x-6">
            <Link href="/honours-archive" className="hover:text-blue-200 transition-colors">
              Honours Archive
            </Link>
            
            {user ? (
              <>
                <Link href="/nominate" className="hover:text-blue-200 transition-colors">
                  Submit Nomination
                </Link>
                {AuthService.hasPermission('Honours Committee') && (
                  <Link href="/honours-review" className="hover:text-blue-200 transition-colors">
                    Honours Review
                  </Link>
                )}
                {user.isAdmin && (
                  <Link href="/admin" className="hover:text-blue-200 transition-colors">
                    Admin Panel
                  </Link>
                )}
                <div className="flex items-center space-x-4">
                  <span className="text-sm">Welcome, {user.robloxUsername}</span>
                  <button 
                    onClick={handleLogout}
                    className="bg-red-600 hover:bg-red-700 px-3 py-1 rounded text-sm transition-colors whitespace-nowrap"
                  >
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-4">
                <Link href="/login" className="hover:text-blue-200 transition-colors">
                  Login
                </Link>
                <Link 
                  href="/register" 
                  className="bg-blue-700 hover:bg-blue-600 px-4 py-2 rounded transition-colors whitespace-nowrap"
                >
                  Register
                </Link>
              </div>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}
