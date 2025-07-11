
'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/Header';

interface Honour {
  id: string;
  robloxUsername: string;
  discordUsername: string;
  title: string;
  field: 'Parliamentary and Public Service' | 'Military' | 'Diplomatic' | 'Private Sector';
  awardedAt: Date;
  description?: string;
}

interface UserHonours {
  robloxUsername: string;
  discordUsername: string;
  honours: Honour[];
}

export default function HonoursArchive() {
  const [searchQuery, setSearchQuery] = useState('');
  const [userHonours, setUserHonours] = useState<UserHonours[]>([]);
  const [filteredUserHonours, setFilteredUserHonours] = useState<UserHonours[]>([]);
  const [selectedField, setSelectedField] = useState<string>('all');
  const [selectedUser, setSelectedUser] = useState<UserHonours | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadHonours();
  }, []);

  const loadHonours = async () => {
    try {
      const response = await fetch('/api/honours');
      if (response.ok) {
        const allHonours = await response.json();

        // Convert date strings back to Date objects and group honours by user
        const honoursMap = new Map<string, UserHonours>();

        allHonours.forEach((honour: any) => {
          const honourWithDate = {
            ...honour,
            awardedAt: new Date(honour.awardedAt)
          };

          const key = honour.robloxUsername.toLowerCase();
          if (!honoursMap.has(key)) {
            honoursMap.set(key, {
              robloxUsername: honour.robloxUsername,
              discordUsername: honour.discordUsername,
              honours: []
            });
          }
          honoursMap.get(key)!.honours.push(honourWithDate);
        });

        const groupedHonours = Array.from(honoursMap.values());
        setUserHonours(groupedHonours);
        setFilteredUserHonours(groupedHonours);
      }
    } catch (error) {
      console.error('Error loading honours:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let filtered = userHonours;

    if (searchQuery.trim()) {
      const lowerQuery = searchQuery.toLowerCase();
      filtered = userHonours.filter(user => 
        user.robloxUsername.toLowerCase().includes(lowerQuery) ||
        user.discordUsername.toLowerCase().includes(lowerQuery)
      );
    }

    if (selectedField !== 'all') {
      filtered = filtered.filter(user => 
        user.honours.some(honour => honour.field === selectedField)
      );
    }

    setFilteredUserHonours(filtered);
  }, [searchQuery, selectedField, userHonours]);

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
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

  const getFieldColor = (field: string) => {
    switch (field) {
      case 'Parliamentary and Public Service':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Military':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'Diplomatic':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'Private Sector':
        return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const handleUserClick = (user: UserHonours) => {
    setSelectedUser(user);
  };

  const closePopup = () => {
    setSelectedUser(null);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <Header />
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded mb-4"></div>
              <div className="h-12 bg-gray-200 rounded mb-8"></div>
              <div className="grid gap-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-32 bg-gray-200 rounded"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Header />
      
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-800 mb-4">Honours Archive</h1>
            <p className="text-lg text-gray-600">Search and explore all awarded honours by recipient</p>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="flex-1">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search by ROBLOX or Discord username..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 flex items-center justify-center">
                    <i className="ri-search-line text-gray-400"></i>
                  </div>
                </div>
              </div>
              
              <div className="relative">
                <div className="relative">
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 flex items-center justify-center">
                    <i className="ri-filter-line text-gray-400"></i>
                  </div>
                  <div className="appearance-none bg-white border border-gray-300 rounded-lg pl-10 pr-8 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer">
                    <div onClick={() => {
                      const options = ['all', 'Parliamentary and Public Service', 'Military', 'Diplomatic', 'Private Sector'];
                      const currentIndex = options.indexOf(selectedField);
                      const nextIndex = (currentIndex + 1) % options.length;
                      setSelectedField(options[nextIndex]);
                    }}>
                      {selectedField === 'all' ? 'All Fields' : selectedField}
                    </div>
                  </div>
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 flex items-center justify-center">
                    <i className="ri-arrow-down-s-line text-gray-400"></i>
                  </div>
                </div>
              </div>
            </div>

            <div className="text-sm text-gray-600 mb-4">
              Showing {filteredUserHonours.length} recipients with {filteredUserHonours.reduce((sum, user) => sum + user.honours.length, 0)} total honours
            </div>
          </div>

          {filteredUserHonours.length === 0 ? (
            <div className="bg-white rounded-lg shadow-lg p-12 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-6 mx-auto">
                <i className="ri-search-line text-2xl text-gray-400"></i>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">No Recipients Found</h3>
              <p className="text-gray-600">
                {searchQuery ? 'Try adjusting your search terms' : 'No honours have been awarded yet'}
              </p>
            </div>
          ) : (
            <div className="grid gap-4">
              {filteredUserHonours.map((user, index) => (
                <div 
                  key={index} 
                  className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow cursor-pointer"
                  onClick={() => handleUserClick(user)}
                >
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
                      </div>
                    </div>
                    <div className="flex items-center">
                      <div className="bg-gray-100 px-3 py-1 rounded-full mr-3">
                        <span className="text-sm font-medium text-gray-700">
                          {user.honours.length} {user.honours.length === 1 ? 'Honour' : 'Honours'}
                        </span>
                      </div>
                      <div className="w-6 h-6 flex items-center justify-center">
                        <i className="ri-arrow-right-s-line text-gray-400"></i>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Popup Modal */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mr-4">
                  <i className="ri-user-line text-white text-xl"></i>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">{selectedUser.robloxUsername}</h2>
                  <p className="text-gray-600 flex items-center">
                    <i className="ri-discord-line mr-1"></i>
                    {selectedUser.discordUsername}
                  </p>
                </div>
              </div>
              <button
                onClick={closePopup}
                className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
              >
                <i className="ri-close-line text-xl"></i>
              </button>
            </div>

            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-800">Honours Received</h3>
                <div className="bg-blue-100 px-3 py-1 rounded-full">
                  <span className="text-sm font-medium text-blue-700">
                    {selectedUser.honours.length} Total
                  </span>
                </div>
              </div>

              <div className="space-y-4">
                {selectedUser.honours.map((honour) => (
                  <div key={honour.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-3 ${getFieldColor(honour.field)}`}>
                          <i className={`${getFieldIcon(honour.field)}`}></i>
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-800">{honour.title}</h4>
                          <div className={`inline-block px-2 py-1 rounded-full text-xs font-medium border mt-1 ${getFieldColor(honour.field)}`}>
                            {honour.field}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center text-gray-500 text-sm">
                          <i className="ri-calendar-line mr-1"></i>
                          <span>{formatDate(honour.awardedAt)}</span>
                        </div>
                      </div>
                    </div>
                    {honour.description && (
                      <p className="text-gray-600 text-sm bg-gray-50 p-3 rounded border">
                        {honour.description}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
