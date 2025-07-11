
'use client';

import { useState, useEffect } from 'react';
import { AuthService } from '@/lib/auth';
import { DatabaseService, User } from '@/lib/database';
import Header from '@/components/Header';
import Link from 'next/link';

interface User {
  id: string;
  robloxUsername: string;
  discordUsername: string;
  password: string;
  isAdmin: boolean;
  permission: 'User' | 'Honours Committee' | 'Admin';
  createdAt: Date;
}

export default function ManageUsers() {
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [users, setUsers] = useState<User[]>([]);
  const [updateStatus, setUpdateStatus] = useState<{ [key: string]: 'updating' | 'done' }>({});

  useEffect(() => {
    const currentUser = AuthService.getCurrentUser();
    if (currentUser && currentUser.isAdmin) {
      setIsAuthorized(true);
      loadUsers();
    }
    setIsLoading(false);
  }, []);

  const loadUsers = async () => {
    try {
      const response = await fetch('/api/users');
      if (response.ok) {
        const data = await response.json();
        const usersWithDates = data.map((user: any) => ({
          ...user,
          createdAt: new Date(user.createdAt),
        }));
        setUsers(usersWithDates);
      }
    } catch (error) {
      console.error('Error loading users:', error);
    }
  };

  const handlePermissionChange = async (userId: string, newPermission: 'User' | 'Honours Committee' | 'Admin') => {
    setUpdateStatus((prev) => ({ ...prev, [userId]: 'updating' }));

    try {
      const response = await fetch(`/api/users/${userId}/permission`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ permission: newPermission }),
      });

      if (response.ok) {
        setUpdateStatus((prev) => ({ ...prev, [userId]: 'done' }));
        setTimeout(() => {
          setUpdateStatus((prev) => {
            const newStatus = { ...prev };
            delete newStatus[userId];
            return newStatus;
          });
          loadUsers();
        }, 1000);
      }
    } catch (error) {
      console.error('Error updating user permission:', error);
      setUpdateStatus((prev) => {
        const newStatus = { ...prev };
        delete newStatus[userId];
        return newStatus;
      });
    }
  };

  const getPermissionColor = (permission: string) => {
    switch (permission) {
      case 'Admin':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'Honours Committee':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'User':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <Header />
        <div className="container mx-auto px-4 py-12">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded mb-8"></div>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-24 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <Header />
        <main className="container mx-auto px-4 py-12">
          <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-6 mx-auto">
              <i className="ri-shield-cross-line text-2xl text-red-600"></i>
            </div>
            <h1 className="text-3xl font-bold text-gray-800 mb-4">Access Denied</h1>
            <p className="text-gray-600 mb-8">You need administrator privileges to access this page.</p>
            <Link
              href="/"
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors whitespace-nowrap"
            >
              Return Home
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Header />

      <main className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center mb-8">
            <Link href="/admin" className="text-blue-600 hover:text-blue-800 mr-4">
              <i className="ri-arrow-left-line text-xl"></i>
            </Link>
            <div>
              <h1 className="text-4xl font-bold text-gray-800 mb-2">User Permissions</h1>
              <p className="text-lg text-gray-600">Manage user access levels and permissions</p>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
            <div className="text-sm text-gray-600 mb-4">
              Managing {users.length} registered users
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-red-600">{users.filter((u) => u.permission === 'Admin').length}</div>
                <div className="text-sm text-gray-600">Administrators</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{users.filter((u) => u.permission === 'Honours Committee').length}</div>
                <div className="text-sm text-gray-600">Committee Members</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-gray-600">{users.filter((u) => u.permission === 'User').length}</div>
                <div className="text-sm text-gray-600">Regular Users</div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {users.map((user) => (
              <div key={user.id} className="bg-white rounded-lg shadow-lg p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mr-4">
                      <i className="ri-user-line text-white text-xl"></i>
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-800">{user.robloxUsername}</h3>
                      <p className="text-gray-600 flex items-center">
                        <i className="ri-discord-line mr-1"></i>
                        {user.discordUsername}
                      </p>
                      <p className="text-sm text-gray-500">Joined {formatDate(user.createdAt)}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    <div className={`inline-block px-3 py-1 rounded-full text-xs font-medium border ${getPermissionColor(user.permission)}`}>
                      {user.permission}
                    </div>

                    <div className="relative">
                      <div className="flex space-x-2">
                        {['User', 'Honours Committee', 'Admin'].map((permission) => (
                          <button
                            key={permission}
                            onClick={() => handlePermissionChange(user.id, permission as any)}
                            disabled={user.permission === permission || !!updateStatus[user.id]}
                            className={`px-3 py-1 rounded text-xs transition-colors whitespace-nowrap ${
                              user.permission === permission
                                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                : 'bg-blue-100 hover:bg-blue-200 text-blue-700 cursor-pointer'
                            }`}
                          >
                            {updateStatus[user.id] === 'updating' && user.permission !== permission ? (
                              <i className="ri-loader-4-line animate-spin"></i>
                            ) : updateStatus[user.id] === 'done' ? (
                              <i className="ri-check-line"></i>
                            ) : (
                              permission
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
