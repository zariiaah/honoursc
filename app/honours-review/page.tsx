
'use client';

import { useState, useEffect } from 'react';
import { AuthService } from '@/lib/auth';
import { DatabaseService, Nomination, ReviewComment } from '@/lib/database';
import Header from '@/components/Header';
import Link from 'next/link';

interface ReviewComment {
  id: string;
  nominationId: string;
  userId: string;
  username: string;
  comment: string;
  createdAt: Date;
}

interface Nomination {
  id: string;
  nominatorId: string;
  nomineeRobloxUsername: string;
  fields: ('Parliamentary and Public Service' | 'Military' | 'Diplomatic' | 'Private Sector')[];
  description: string;
  status: 'pending' | 'under_review' | 'approved' | 'rejected';
  createdAt: Date;
  reviewComments?: ReviewComment[];
}

export default function HonoursReview() {
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [nominations, setNominations] = useState<Nomination[]>([]);
  const [selectedField, setSelectedField] = useState<string>('all');
  const [filteredNominations, setFilteredNominations] = useState<Nomination[]>([]);
  const [newComment, setNewComment] = useState<{ [key: string]: string }>([]);
  const [submitStatus, setSubmitStatus] = useState<{ [key: string]: 'submitting' | 'done' }>( {});

  useEffect(() => {
    const user = AuthService.getCurrentUser();
    if (user && AuthService.hasPermission('Honours Committee')) {
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
      const underReviewNominations = DatabaseService.getNominationsUnderReview();
      const nominationsWithDates = underReviewNominations.map((nomination: any) => ({
        ...nomination,
        createdAt: new Date(nomination.createdAt),
        reviewComments: nomination.reviewComments?.map((comment: any) => ({
          ...comment,
          createdAt: new Date(comment.createdAt)
        })) || []
      }));
      setNominations(nominationsWithDates);
    } catch (error) {
      console.error('Error loading nominations:', error);
    }
  };

  const handleAddComment = async (nominationId: string) => {
    const comment = newComment[nominationId]?.trim();
    if (!comment) return;

    const user = AuthService.getCurrentUser();
    if (!user) return;

    setSubmitStatus(prev => ({ ...prev, [nominationId]: 'submitting' }));

    try {
      await DatabaseService.addReviewComment(nominationId, user.id, user.robloxUsername, comment);

      setNewComment(prev => ({ ...prev, [nominationId]: '' }));
      setSubmitStatus(prev => ({ ...prev, [nominationId]: 'done' }));

      setTimeout(() => {
        setSubmitStatus(prev => {
          const newStatus = { ...prev };
          delete newStatus[nominationId];
          return newStatus;
        });
        loadNominations();
      }, 1000);
    } catch (error) {
      console.error('Error adding comment:', error);
      setSubmitStatus(prev => {
        const newStatus = { ...prev };
        delete newStatus[nominationId];
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

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
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
            <p className="text-gray-600 mb-8">You need Honours Committee privileges to access this page.</p>
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
            <h1 className="text-4xl font-bold text-gray-800 mb-4">Honours Review</h1>
            <p className="text-lg text-gray-600">Review nominations and provide committee feedback</p>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-800">Filter by Field</h2>
              <div className="relative">
                <div className="relative">
                  <div
                    onClick={() => {
                      const options = [
                        'all',
                        'Parliamentary and Public Service',
                        'Military',
                        'Diplomatic',
                        'Private Sector'
                      ];
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
            </div>

            <div className="text-sm text-gray-600">
              Showing {filteredNominations.length} nominations under review
            </div>
          </div>

          {filteredNominations.length === 0 ? (
            <div className="bg-white rounded-lg shadow-lg p-12 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-6 mx-auto">
                <i className="ri-file-list-line text-2xl text-gray-400"></i>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">No Nominations Under Review</h3>
              <p className="text-gray-600">No nominations are currently awaiting committee review.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {filteredNominations.map(nomination => (
                <div key={nomination.id} className="bg-white rounded-lg shadow-lg p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center mb-3">
                        <h3 className="text-xl font-semibold text-gray-800 mr-4">
                          Nomination for {nomination.nomineeRobloxUsername}
                        </h3>
                        <div className="inline-block px-3 py-1 rounded-full text-xs font-medium border bg-blue-100 text-blue-800 border-blue-200">
                          Under Review
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

                      {/* Review Comments Section */}
                      {nomination.reviewComments && nomination.reviewComments.length > 0 && (
                        <div className="bg-blue-50 rounded-lg p-4 mb-4">
                          <h4 className="font-medium text-gray-800 mb-3">Committee Comments:</h4>
                          <div className="space-y-3">
                            {nomination.reviewComments.map(comment => (
                              <div key={comment.id} className="bg-white rounded p-3 border-l-4 border-blue-500">
                                <div className="flex items-center justify-between mb-2">
                                  <span className="font-medium text-sm text-gray-800">{comment.username}</span>
                                  <span className="text-xs text-gray-500">{formatDate(comment.createdAt)}</span>
                                </div>
                                <p className="text-sm text-gray-700">{comment.comment}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Add Comment Section */}
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h4 className="font-medium text-gray-800 mb-3">Add Your Review Comment:</h4>
                        <div className="flex space-x-3">
                          <textarea
                            value={newComment[nomination.id] || ''}
                            onChange={e => setNewComment(prev => ({ ...prev, [nomination.id]: e.target.value }))}
                            placeholder="Share your thoughts on this nomination..."
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm resize-vertical"
                            rows={3}
                            maxLength={500}
                          />
                          <button
                            onClick={() => handleAddComment(nomination.id)}
                            disabled={!newComment[nomination.id]?.trim() || !!submitStatus[nomination.id]}
                            className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-4 py-2 rounded-lg transition-colors whitespace-nowrap self-start"
                          >
                            {submitStatus[nomination.id] === 'submitting' ? (
                              <i className="ri-loader-4-line animate-spin"></i>
                            ) : submitStatus[nomination.id] === 'done' ? (
                              <i className="ri-check-line"></i>
                            ) : (
                              'Add Comment'
                            )}
                          </button>
                        </div>
                        <div className="text-right text-xs text-gray-500 mt-1">
                          {(newComment[nomination.id] || '').length}/500 characters
                        </div>
                      </div>
                    </div>

                    <div className="text-right ml-6">
                      <div className="text-sm text-gray-500 mb-2">Submitted</div>
                      <div className="font-medium text-gray-800">{formatDate(nomination.createdAt)}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
