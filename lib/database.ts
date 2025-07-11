
export interface User {
  id: string;
  robloxUsername: string;
  discordUsername: string;
  password: string;
  isAdmin: boolean;
  permission: 'User' | 'Honours Committee' | 'Admin';
  createdAt: Date;
}

export interface Nomination {
  id: string;
  nominatorId: string;
  nomineeRobloxUsername: string;
  fields: ('Parliamentary and Public Service' | 'Military' | 'Diplomatic' | 'Private Sector')[];
  description: string;
  status: 'pending' | 'under_review' | 'approved' | 'rejected';
  createdAt: Date;
  reviewComments?: ReviewComment[];
}

export interface ReviewComment {
  id: string;
  nominationId: string;
  userId: string;
  username: string;
  comment: string;
  createdAt: Date;
}

export interface Honour {
  id: string;
  robloxUsername: string;
  discordUsername: string;
  title: string;
  field: 'Parliamentary and Public Service' | 'Military' | 'Diplomatic' | 'Private Sector';
  awardedAt: Date;
}

interface DatabaseState {
  users: User[];
  nominations: Nomination[];
  reviewComments: ReviewComment[];
  honours: Honour[];
}

const STORAGE_KEY = 'britannia_honours_db';

const getInitialData = (): DatabaseState => ({
  users: [
    {
      id: '1',
      robloxUsername: 'AdminUser',
      discordUsername: 'admin#1234',
      password: 'admin123',
      isAdmin: true,
      permission: 'Admin',
      createdAt: new Date('2024-01-01')
    },
    {
      id: '2',
      robloxUsername: 'CommitteeUser',
      discordUsername: 'committee#5678',
      password: 'committee123',
      isAdmin: false,
      permission: 'Honours Committee',
      createdAt: new Date('2024-01-02')
    }
  ],
  nominations: [
    {
      id: '1',
      nominatorId: '1',
      nomineeRobloxUsername: 'JohnDoe123',
      fields: ['Military', 'Diplomatic'],
      description: 'Outstanding service in military operations and diplomatic missions for Project Britannia.',
      status: 'pending',
      createdAt: new Date('2024-01-15'),
      reviewComments: []
    }
  ],
  reviewComments: [],
  honours: [
    {
      id: '1',
      robloxUsername: 'JaneSmith456',
      discordUsername: 'jane#5678',
      title: 'Order of Project Britannia',
      field: 'Parliamentary and Public Service',
      awardedAt: new Date('2024-01-10')
    },
    {
      id: '2',
      robloxUsername: 'BobWilson789',
      discordUsername: 'bob#9012',
      title: 'Military Cross',
      field: 'Military',
      awardedAt: new Date('2024-01-08')
    }
  ]
});

const loadDatabase = (): DatabaseState => {
  if (typeof window === 'undefined') {
    return getInitialData();
  }
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      // Convert date strings back to Date objects
      parsed.users.forEach((user: any) => {
        user.createdAt = new Date(user.createdAt);
      });
      parsed.nominations.forEach((nomination: any) => {
        nomination.createdAt = new Date(nomination.createdAt);
        if (nomination.reviewComments) {
          nomination.reviewComments.forEach((comment: any) => {
            comment.createdAt = new Date(comment.createdAt);
          });
        }
      });
      parsed.reviewComments.forEach((comment: any) => {
        comment.createdAt = new Date(comment.createdAt);
      });
      parsed.honours.forEach((honour: any) => {
        honour.awardedAt = new Date(honour.awardedAt);
      });
      return parsed;
    }
  } catch (error) {
    console.error('Error loading database:', error);
  }
  
  return getInitialData();
};

const saveDatabase = (data: DatabaseState): void => {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('Error saving database:', error);
    }
  }
};

let database = loadDatabase();

export const DatabaseService = {
  // User operations
  createUser: (userData: Omit<User, 'id' | 'createdAt'>): User => {
    const user: User = {
      ...userData,
      id: Date.now().toString(),
      createdAt: new Date()
    };
    database.users.push(user);
    saveDatabase(database);
    return user;
  },

  findUserByCredentials: (robloxUsername: string, password: string): User | null => {
    return database.users.find(u => u.robloxUsername === robloxUsername && u.password === password) || null;
  },

  findUserById: (id: string): User | null => {
    return database.users.find(u => u.id === id) || null;
  },

  getAllUsers: (): User[] => {
    return database.users;
  },

  updateUserPermission: (userId: string, permission: 'User' | 'Honours Committee' | 'Admin'): boolean => {
    const user = database.users.find(u => u.id === userId);
    if (user) {
      user.permission = permission;
      user.isAdmin = permission === 'Admin';
      saveDatabase(database);
      return true;
    }
    return false;
  },

  // Nomination operations
  createNomination: (nominationData: Omit<Nomination, 'id' | 'createdAt'>): Nomination => {
    const nomination: Nomination = {
      ...nominationData,
      id: Date.now().toString(),
      createdAt: new Date()
    };
    database.nominations.push(nomination);
    saveDatabase(database);
    return nomination;
  },

  getAllNominations: (): Nomination[] => {
    return database.nominations;
  },

  getNominationsByField: (field: string): Nomination[] => {
    return database.nominations.filter(n => n.fields.includes(field as any));
  },

  updateNominationStatus: (id: string, status: 'under_review' | 'approved' | 'rejected'): boolean => {
    const nomination = database.nominations.find(n => n.id === id);
    if (nomination) {
      nomination.status = status;
      saveDatabase(database);
      return true;
    }
    return false;
  },

  getNominationsUnderReview: (): Nomination[] => {
    return database.nominations.filter(n => n.status === 'under_review');
  },

  // Review comment operations
  addReviewComment: (nominationId: string, userId: string, username: string, comment: string): ReviewComment => {
    const reviewComment: ReviewComment = {
      id: Date.now().toString(),
      nominationId,
      userId,
      username,
      comment,
      createdAt: new Date()
    };
    database.reviewComments.push(reviewComment);

    // Add to nomination's comments array
    const nomination = database.nominations.find(n => n.id === nominationId);
    if (nomination) {
      if (!nomination.reviewComments) nomination.reviewComments = [];
      nomination.reviewComments.push(reviewComment);
    }

    saveDatabase(database);
    return reviewComment;
  },

  getReviewComments: (nominationId: string): ReviewComment[] => {
    return database.reviewComments.filter(c => c.nominationId === nominationId);
  },

  // Honour operations
  createHonour: (honourData: Omit<Honour, 'id' | 'awardedAt'>): Honour => {
    const honour: Honour = {
      ...honourData,
      id: Date.now().toString(),
      awardedAt: new Date()
    };
    database.honours.push(honour);
    saveDatabase(database);
    return honour;
  },

  getHonoursByUser: (robloxUsername: string): Honour[] => {
    return database.honours.filter(h => h.robloxUsername.toLowerCase() === robloxUsername.toLowerCase());
  },

  getAllHonours: (): Honour[] => {
    return database.honours;
  },

  searchHonours: (query: string): Honour[] => {
    const lowerQuery = query.toLowerCase();
    return database.honours.filter(h => 
      h.robloxUsername.toLowerCase().includes(lowerQuery) ||
      h.discordUsername.toLowerCase().includes(lowerQuery)
    );
  },

  // Refresh database from storage
  refreshDatabase: (): void => {
    database = loadDatabase();
  }
};
