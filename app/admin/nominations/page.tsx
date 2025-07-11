
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
  const [actionStatus, setActionStatus] = useState<{ [key: string]: 'reviewing' | 'rejecting' | 'done' }>( {});

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
        headers: {
          'Content-Type': 'application/json',
        },
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
        headers: {
          'Content-Type': 'application/json',
        },
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
                <div className="relative">
                  <div onClick={() => {
                    const options = ['all', 'Parliamentary and Public Service', 'Military', 'Diplomatic', 'Private Sector'];
                    const currentIndex = options.indexOf(selectedField);
                    const nextIndex = (currentIndex + 1) % options.length;
                    setSelectedField(options[nextIndex]);
                  }} className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer">
                    {selectedField === 'all' ? 'All Fields' : selectedField}
                  </div>
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 flex items-center justify-center">
                    <i className="ri-arrow-down-s-line text-gray-400"></i>
                  </div>
                </div>
              </div>
            </div>

            <div className="text-sm text-gray-600">
              Showing {filteredNominations.length} of {nominations.length} nominations
            </div>
          </div>

          {filteredNominations.length === 0 ? (
            <div className="bg-white rounded-lg shadow-lg p-12 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-6 mx-auto">
                <i className="ri-file-list-line text-2xl text-gray-400"></i>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">No Nominations Found</h3>
              <p className="text-gray-600">No nominations match your current filter.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {filteredNominations.map((nomination) => (
                <div key={nomination.id} className="bg-white rounded-lg shadow-lg p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center mb-3">
                        <h3 className="text-xl font-semibold text-gray-800 mr-4">
                          Nomination for {nomination.nomineeRobloxUsername}
                        </h3>
                        <div className={`inline-block px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(nomination.status)}`}>
                          {nomination.status === 'under_review' ? 'Under Review' : nomination.status.charAt(0).toUpperCase() + nomination.status.slice(1)}
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2 mb-4">
                        {nomination.fields.map((field, index) => (
                          <div key={index} className="flex items-center bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm">
                            <div className="w-4 h-4 flex items-center justify-center mr-2">
                              <i className={`${getFieldIcon(field)} text-xs`}></i>
                            </div>
                            {field}
                          </div>
                        ))}
                      </div>

                      <div className="bg-gray-50 rounded-lg p-4 mb-4">
                        <h4 className="font-medium text-gray-800 mb-2">Contribution Description:</h4>
                        <p className="text-gray-700 text-sm leading-relaxed">{nomination.description}</p>
                      </div>
                    </div>

                    <div className="text-right ml-6">
                      <div className="text-sm text-gray-500 mb-2">Submitted</div>
                      <div className="font-medium text-gray-800">{formatDate(nomination.createdAt)}</div>
                    </div>
                  </div>

                  {nomination.status === 'pending' && (
                    <div className="flex items-center space-x-4 pt-4 border-t">
                      <button
                        onClick={() => handleSendForReview(nomination)}
                        disabled={!!actionStatus[nomination.id]}
                        className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-6 py-2 rounded-lg transition-colors whitespace-nowrap flex items-center"
                      >
                        {actionStatus[nomination.id] === 'reviewing' ? (
                          <>
                            <i className="ri-loader-4-line animate-spin mr-2"></i>
                            Sending for Review...
                          </>
                        ) : actionStatus[nomination.id] === 'done' ? (
                          <>
                            <i className="ri-check-line mr-2"></i>
                            Sent for Review
                          </>
                        ) : (
                          <>
                            <i className="ri-send-plane-line mr-2"></i>
                            Send for Review
                          </>
                        )}
                      </button>

                      <button
                        onClick={() => handleFailReview(nomination)}
                        disabled={!!actionStatus[nomination.id]}
                        className="bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white px-6 py-2 rounded-lg transition-colors whitespace-nowrap flex items-center"
                      >
                        {actionStatus[nomination.id] === 'rejecting' ? (
                          <>
                            <i className="ri-loader-4-line animate-spin mr-2"></i>
                            Failing Review...
                          </>
                        ) : actionStatus[nomination.id] === 'done' ? (
                          <>
                            <i className="ri-close-line mr-2"></i>
                            Failed Review
                          </>
                        ) : (
                          <>
                            <i className="ri-close-line mr-2"></i>
                            Fail Review
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
