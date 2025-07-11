'use client';

import { useState, useEffect } from 'react';
import { AuthService } from '@/lib/auth';
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
  reviewComments?: any[];
}

export default function ManageNominations() {
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [nominations, setNominations] = useState<Nomination[]>([]);
  const [selectedField, setSelectedField] = useState<string>('all');
  const [filteredNominations, setFilteredNominations] = useState<Nomination[]>([]);
  const [actionStatus, setActionStatus] = useState<{ [key: string]: 'reviewing' | 'rejecting' | 'done' }>({});

  useEffect(() => {
    const user = AuthService.getCurrentUser();
    if (user && user.isAdmin) {
      setIsAuthorized(true);
      loadNominations();
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (selectedField === 'all') {
      setFilteredNominations(nominations);
    } else {
      setFilteredNominations(nominations.filter(n => n.fields.includes(selectedField as any)));
    }
  }, [nominations, selectedField]);

  const loadNominations = async () => {
    try {
      const response = await fetch('/api/nominations');
      if (response.ok) {
        const data = await response.json();
        const nominationsWithDates = data.map((nomination: any) => ({
          ...nomination,
          createdAt: new Date(nomination.createdAt)
        }));
        setNominations(nominationsWithDates);
      }
    } catch (error) {
      console.error('Error loading nominations:', error);
    }
  };

  const handleSendForReview = async (nomination: Nomination) => {
    setActionStatus(prev => ({ ...prev, [nomination.id]: 'reviewing' }));

    try {
      const response = await fetch(`/api/nominations/${nomination.id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'under_review' }),
      });

      if (response.ok) {
        setActionStatus(prev => ({ ...prev, [nomination.id]: 'done' }));
        setTimeout(() => {
          setActionStatus(prev => {
            const newStatus = { ...prev };
            delete newStatus[nomination.id];
            return newStatus;
          });
          loadNominations();
        }, 1000);
      }
    } catch (error) {
      console.error('Error updating nomination status:', error);
      setActionStatus(prev => {
        const newStatus = { ...prev };
        delete newStatus[nomination.id];
        return newStatus;
      });
    }
  };

  const handleFailReview = async (nomination: Nomination) => {
    setActionStatus(prev => ({ ...prev, [nomination.id]: 'rejecting' }));

    try {
      const response = await fetch(`/api/nominations/${nomination.id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'rejected' }),
      });

      if (response.ok) {
        setActionStatus(prev => ({ ...prev, [nomination.id]: 'done' }));
        setTimeout(() => {
          setActionStatus(prev => {
            const newStatus = { ...prev };
            delete newStatus[nomination.id];
            return newStatus;
          });
          loadNominations();
        }, 1000);
      }
    } catch (error) {
      console.error('Error updating nomination status:', error);
      setActionStatus(prev => {
        const newStatus = { ...prev };
        delete newStatus[nomination.id];
        return newStatus;
      });
    }
  };

  const getFieldIcon = (field: string) => {
    switch (field) {
      case 'Parliamentary and Public Service': return 'ri-government-line';
      case 'Military': return 'ri-shield-line';
      case 'Diplomatic': return 'ri-global-line';
      case 'Private Sector': return 'ri-briefcase-line';
      default: return 'ri-award-line';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'under_review': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'approved': return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
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
            <Link href="/" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors whitespace-nowrap">
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
              <h1 className="text-4xl font-bold text-gray-800 mb-2">Manage Nominations</h1>
              <p className="text-lg text-gray-600">Review and process honour nominations</p>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-800">Filter by Field</h2>
              <div className="relative">
                <div
                  onClick={() => {
                    const options = ['all', 'Parliamentary and Public Service', 'Military', 'Diplomatic', 'Private Sector'];
                    const currentIndex = options.indexOf(selectedField);
                    const nextIndex = (currentIndex + 1) % options.length;
                    setSelectedField(options[nextIndex]);
                  }}
                  className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                >
                  {selectedField === 'all' ? 'All Fields' : selectedField}
                </div>
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 flex items-center justify-center">
                  <i className="ri-arrow-down-s-line text-gray-400"></i>
                </div>
              </div>
            </div>

            <div className="text-sm text-gray-600">
              Showing {filteredNominations.length} of {nominations.length} nominations
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              {filteredNominations.length === 0 ? (
                <div className="col-span-full text-center text-gray-500">
                  No nominations found for the selected field.
                </div>
              ) : (
                filteredNominations.map((nomination) => (
                  <div key={nomination.id} className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm flex flex-col justify-between">
                    <div>
                      <div className="flex items-center space-x-3 mb-2">
                        <i className={`${getFieldIcon(nomination.fields[0])} text-2xl text-blue-600`}></i>
                        <h3 className="text-lg font-semibold text-gray-800">
                          {nomination.nomineeRobloxUsername}
                        </h3>
                      </div>
                      <p className="text-gray-600 mb-4">{nomination.description}</p>
                      <div className="flex flex-wrap gap-2 mb-4">
                        {nomination.fields.map((field) => (
                          <span
                            key={field}
                            className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800"
                          >
                            {field}
                          </span>
                        ))}
                      </div>
                      <div className="text-xs text-gray-500">
                        Nominated on {formatDate(nomination.createdAt)}
                      </div>
                    </div>

                    <div className="mt-4 flex items-center justify-between">
                      <span
                        className={`inline-block px-3 py-1 text-xs font-semibold rounded border ${getStatusColor(nomination.status)}`}
                      >
                        {nomination.status.replace('_', ' ').toUpperCase()}
                      </span>

                      <div className="space-x-2">
                        {nomination.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleSendForReview(nomination)}
                              disabled={actionStatus[nomination.id] === 'reviewing'}
                              className={`inline-flex items-center px-3 py-1.5 text-xs font-medium rounded bg-green-600 text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed`}
                            >
                              {actionStatus[nomination.id] === 'reviewing' ? (
                                <>
                                  <i className="ri-loader-4-line ri-spin mr-1"></i> Sending...
                                </>
                              ) : (
                                'Send for Review'
                              )}
                            </button>

                            <button
                              onClick={() => handleFailReview(nomination)}
                              disabled={actionStatus[nomination.id] === 'rejecting'}
                              className={`inline-flex items-center px-3 py-1.5 text-xs font-medium rounded bg-red-600 text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed`}
                            >
                              {actionStatus[nomination.id] === 'rejecting' ? (
                                <>
                                  <i className="ri-loader-4-line ri-spin mr-1"></i> Rejecting...
                                </>
                              ) : (
                                'Reject'
                              )}
                            </button>
                          </>
                        )}
                        {(nomination.status === 'under_review' || nomination.status === 'approved' || nomination.status === 'rejected') && (
                          <Link
                            href={`/admin/nominations/${nomination.id}`}
                            className="inline-flex items-center px-3 py-1.5 text-xs font-medium rounded bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            View Details
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}