
'use client';

import { useState, useEffect } from 'react';
import { AuthService } from '@/lib/auth';
import { DatabaseService, Nomination, Honour } from '@/lib/database';
import Header from '@/components/Header';
import Link from 'next/link';

interface Nomination {
  id: string;
  nominatorId: string;
  nomineeRobloxUsername: string;
  fields: ('Parliamentary and Public Service' | 'Military' | 'Diplomatic' | 'Private Sector')[];
  description: string;
  status: 'pending' | 'under_review' | 'approved' | 'rejected';
  createdAt: Date;
}

interface Honour {
  id: string;
  robloxUsername: string;
  discordUsername: string;
  title: string;
  field: 'Parliamentary and Public Service' | 'Military' | 'Diplomatic' | 'Private Sector';
  awardedAt: Date;
}

export default function AdminPanel() {
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [nominations, setNominations] = useState<Nomination[]>([]);
  const [honours, setHonours] = useState<Honour[]>([]);
  const [selectedField, setSelectedField] = useState<string>('all');
  const [filteredNominations, setFilteredNominations] = useState<Nomination[]>([]);
  const [actionStatus, setActionStatus] = useState<{[key: string]: 'reviewing' | 'rejecting' | 'done'}>({});

  useEffect(() => {
    const user = AuthService.getCurrentUser();
    if (user && user.isAdmin) {
      setIsAuthorized(true);
      loadData();
    }
    setIsLoading(false);
  }, []);

  const loadData = async () => {
    try {
      const [nominationsResponse, honoursResponse] = await Promise.all([
        fetch('/api/nominations'),
        fetch('/api/honours')
      ]);

      if (nominationsResponse.ok) {
        const nominationsData = await nominationsResponse.json();
        setNominations(nominationsData);
      }

      if (honoursResponse.ok) {
        const honoursData = await honoursResponse.json();
        setHonours(honoursData);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  useEffect(() => {
    if (selectedField === 'all') {
      setFilteredNominations(nominations);
    } else {
      setFilteredNominations(nominations.filter(n => n.fields.includes(selectedField as any)));
    }
  }, [nominations, selectedField]);

  const loadNominations = () => {
    const allNominations = DatabaseService.getAllNominations();
    setNominations(allNominations);
  };

  const handleSendForReview = async (nomination: Nomination) => {
    setActionStatus(prev => ({...prev, [nomination.id]: 'reviewing'}));

    DatabaseService.updateNominationStatus(nomination.id, 'under_review');

    setActionStatus(prev => ({...prev, [nomination.id]: 'done'}));
    setTimeout(() => {
      setActionStatus(prev => {
        const newStatus = {...prev};
        delete newStatus[nomination.id];
        return newStatus;
      });
      loadNominations();
    }, 1000);
  };

  const handleFailReview = async (nomination: Nomination) => {
    setActionStatus(prev => ({...prev, [nomination.id]: 'rejecting'}));

    DatabaseService.updateNominationStatus(nomination.id, 'rejected');

    setActionStatus(prev => ({...prev, [nomination.id]: 'done'}));
    setTimeout(() => {
      setActionStatus(prev => {
        const newStatus = {...prev};
        delete newStatus[nomination.id];
        return newStatus;
      });
      loadNominations();
    }, 1000);
  };

  const getHonourTitle = (field: string): string => {
    switch (field) {
      case 'Parliamentary and Public Service':
        return 'Order of Project Britannia';
      case 'Military':
        return 'Military Cross';
      case 'Diplomatic':
        return 'Diplomatic Service Order';
      case 'Private Sector':
        return 'Order of Merit';
      default:
        return 'Special Recognition';
    }
  };

  const getFieldIcon = (field: string) => {
    switch (field) {
      case 'Parliamentary and Public Service':
        return 'ri-government-line';
      case 'Military':
        return 'ri-shield-line';
      case 'Diplomatic':
        return 'ri-global-line';
      case 'Private Sector':
        return 'ri-briefcase-line';
      default:
        return 'ri-award-line';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'under_review':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'approved':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
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
              {[1, 2, 3].map(i => (
                <div key={i} className="h-32 bg-gray-200 rounded"></div>
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
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-800 mb-4">Admin Panel</h1>
            <p className="text-lg text-gray-600">Manage nominations and user permissions</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <Link href="/admin/nominations" className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                  <i className="ri-file-list-line text-2xl text-blue-600"></i>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-800">Manage Nominations</h3>
                  <p className="text-gray-600">Review and process nominations</p>
                </div>
              </div>
            </Link>

            <Link href="/admin/users" className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mr-4">
                  <i className="ri-user-settings-line text-2xl text-green-600"></i>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-800">User Permissions</h3>
                  <p className="text-gray-600">Manage user access levels</p>
                </div>
              </div>
            </Link>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{nominations.filter(n => n.status === 'pending').length}</div>
                <div className="text-sm text-gray-600">Pending Nominations</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-yellow-600">{nominations.filter(n => n.status === 'under_review').length}</div>
                <div className="text-sm text-gray-600">Under Review</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{honours.length}</div>
                <div className="text-sm text-gray-600">Total Honours</div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
