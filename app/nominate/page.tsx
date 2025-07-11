
'use client';

import { useState, useEffect } from 'react';
import { AuthService } from '@/lib/auth';
import { DatabaseService } from '@/lib/database';
import Header from '@/components/Header';
import Link from 'next/link';

export default function Nominate() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState({
    nomineeRobloxUsername: '',
    fields: [] as string[],
    description: ''
  });
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [submitMessage, setSubmitMessage] = useState('');

  useEffect(() => {
    const user = AuthService.getCurrentUser();
    setIsAuthenticated(!!user);
    setIsLoading(false);
  }, []);

  const handleFieldChange = (field: string, checked: boolean) => {
    if (checked) {
      setFormData(prev => ({
        ...prev,
        fields: [...prev.fields, field]
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        fields: prev.fields.filter(f => f !== field)
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitStatus('idle');

    const user = AuthService.getCurrentUser();
    if (!user) {
      setSubmitStatus('error');
      setSubmitMessage('You must be logged in to submit nominations');
      return;
    }

    if (formData.fields.length === 0) {
      setSubmitStatus('error');
      setSubmitMessage('Please select at least one field');
      return;
    }

    if (formData.description.length > 500) {
      setSubmitStatus('error');
      setSubmitMessage('Description must be 500 characters or less');
      return;
    }

    setSubmitStatus('submitting');

    try {
      const response = await fetch('/api/nominations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nominatorId: user.id,
          nomineeRobloxUsername: formData.nomineeRobloxUsername,
          fields: formData.fields,
          description: formData.description,
          status: 'pending'
        }),
      });

      if (response.ok) {
        setSubmitStatus('success');
        setSubmitMessage('Nomination submitted successfully! It will be reviewed by administrators.');
        setFormData({
          nomineeRobloxUsername: '',
          fields: [],
          description: ''
        });
      } else {
        throw new Error('Failed to submit nomination');
      }
    } catch (error) {
      console.error('Error submitting nomination:', error);
      setSubmitStatus('error');
      setSubmitMessage('Failed to submit nomination. Please try again.');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <Header />
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-8">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded mb-4"></div>
              <div className="h-4 bg-gray-200 rounded mb-8"></div>
              <div className="space-y-4">
                <div className="h-12 bg-gray-200 rounded"></div>
                <div className="h-32 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <Header />
        <main className="container mx-auto px-4 py-12">
          <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-6 mx-auto">
              <i className="ri-lock-line text-2xl text-red-600"></i>
            </div>
            <h1 className="text-3xl font-bold text-gray-800 mb-4">Authentication Required</h1>
            <p className="text-gray-600 mb-8">You must be logged in to submit nominations.</p>
            <div className="space-x-4">
              <Link 
                href="/login"
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors whitespace-nowrap"
              >
                Login
              </Link>
              <Link 
                href="/register"
                className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg transition-colors whitespace-nowrap"
              >
                Register
              </Link>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Header />
      
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Submit Nomination</h1>
            <p className="text-gray-600">Nominate a deserving member for recognition</p>
          </div>

          <form id="nomination-form" onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="nomineeRobloxUsername" className="block text-sm font-medium text-gray-700 mb-2">
                Who are you recommending to receive an honour? (You may nominate yourself)
              </label>
              <input
                type="text"
                id="nomineeRobloxUsername"
                name="nomineeRobloxUsername"
                value={formData.nomineeRobloxUsername}
                onChange={(e) => setFormData({...formData, nomineeRobloxUsername: e.target.value})}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                placeholder="Enter ROBLOX username"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                What field(s) are you recommending the nominee for?
              </label>
              <div className="space-y-3">
                {[
                  'Parliamentary and Public Service',
                  'Military',
                  'Diplomatic',
                  'Private Sector'
                ].map((field) => (
                  <label key={field} className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      name="fields"
                      value={field}
                      checked={formData.fields.includes(field)}
                      onChange={(e) => handleFieldChange(field, e.target.checked)}
                      className="mr-3 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">{field}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Please describe the nominee's contributions to Project Britannia and why you think they are deserving of an honour.
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                required
                maxLength={500}
                rows={6}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm resize-vertical"
                placeholder="Describe their contributions and achievements..."
              />
              <div className="text-right text-xs text-gray-500 mt-1">
                {formData.description.length}/500 characters
              </div>
            </div>

            {submitStatus === 'success' && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md text-sm">
                {submitMessage}
              </div>
            )}

            {submitStatus === 'error' && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
                {submitMessage}
              </div>
            )}

            <button
              type="submit"
              disabled={submitStatus === 'submitting'}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white py-3 px-4 rounded-md font-medium transition-colors whitespace-nowrap flex items-center justify-center"
            >
              {submitStatus === 'submitting' ? (
                <>
                  <i className="ri-loader-4-line animate-spin mr-2"></i>
                  Submitting...
                </>
              ) : (
                'Submit Nomination'
              )}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
