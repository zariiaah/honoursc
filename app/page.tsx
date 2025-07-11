
'use client';

import Header from '@/components/Header';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Header />
      
      <main className="container mx-auto px-4 py-12">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-blue-900 mb-6">
            Honours Committee
          </h1>
          <p className="text-xl text-gray-700 max-w-3xl mx-auto leading-relaxed">
            Recognising outstanding contributions to our community in Parliamentary and Public Service, 
            Military excellence, Diplomatic achievements, and Private Sector innovation.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          <div className="bg-white rounded-lg shadow-lg p-8 hover:shadow-xl transition-shadow">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-6 mx-auto">
              <i className="ri-user-add-line text-2xl text-blue-600"></i>
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-4 text-center">Submit Nomination</h3>
            <p className="text-gray-600 mb-6 text-center">
              Nominate deserving members for recognition in various fields of service.
            </p>
            <Link 
              href="/nominate"
              className="block w-full bg-blue-600 hover:bg-blue-700 text-white text-center py-3 rounded-lg transition-colors whitespace-nowrap"
            >
              Submit Nomination
            </Link>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-8 hover:shadow-xl transition-shadow">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6 mx-auto">
              <i className="ri-award-line text-2xl text-green-600"></i>
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-4 text-center">Honours Archive</h3>
            <p className="text-gray-600 mb-6 text-center">
              Search and view all awarded honours and recipients in our community.
            </p>
            <Link 
              href="/honours-archive"
              className="block w-full bg-green-600 hover:bg-green-700 text-white text-center py-3 rounded-lg transition-colors whitespace-nowrap"
            >
              View Archive
            </Link>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-8 hover:shadow-xl transition-shadow">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-6 mx-auto">
              <i className="ri-team-line text-2xl text-purple-600"></i>
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-4 text-center">Register Now</h3>
            <p className="text-gray-600 mb-6 text-center">
              Register to participate in the honours system and nominate members.
            </p>
            <Link 
              href="/register"
              className="block w-full bg-purple-600 hover:bg-purple-700 text-white text-center py-3 rounded-lg transition-colors whitespace-nowrap"
            >
              Register Now
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">Fields of Recognition</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center p-6 bg-blue-50 rounded-lg">
              <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mb-4 mx-auto">
                <i className="ri-government-line text-white text-xl"></i>
              </div>
              <h4 className="font-semibold text-gray-800 mb-2">Parliamentary & Public Service</h4>
              <p className="text-sm text-gray-600">Leadership and service in governance</p>
            </div>

            <div className="text-center p-6 bg-red-50 rounded-lg">
              <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center mb-4 mx-auto">
                <i className="ri-shield-line text-white text-xl"></i>
              </div>
              <h4 className="font-semibold text-gray-800 mb-2">Military</h4>
              <p className="text-sm text-gray-600">Outstanding military service and valor</p>
            </div>

            <div className="text-center p-6 bg-green-50 rounded-lg">
              <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center mb-4 mx-auto">
                <i className="ri-global-line text-white text-xl"></i>
              </div>
              <h4 className="font-semibold text-gray-800 mb-2">Diplomatic</h4>
              <p className="text-sm text-gray-600">Excellence in diplomatic relations</p>
            </div>

            <div className="text-center p-6 bg-yellow-50 rounded-lg">
              <div className="w-12 h-12 bg-yellow-600 rounded-full flex items-center justify-center mb-4 mx-auto">
                <i className="ri-briefcase-line text-white text-xl"></i>
              </div>
              <h4 className="font-semibold text-gray-800 mb-2">Private Sector</h4>
              <p className="text-sm text-gray-600">Innovation and business excellence</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
