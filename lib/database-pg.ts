import pool from './db';

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

export const DatabaseService = {
  // User operations
  createUser: async (userData: Omit<User, 'id' | 'createdAt'>): Promise<User> => {
    const client = await pool.connect();
    try {
      const result = await client.query(
        'INSERT INTO users (roblox_username, discord_username, password, is_admin, permission) VALUES ($1, $2, $3, $4, $5) RETURNING *',
        [userData.robloxUsername, userData.discordUsername, userData.password, userData.isAdmin, userData.permission]
      );
      const row = result.rows[0];
      return {
        id: row.id.toString(),
        robloxUsername: row.roblox_username,
        discordUsername: row.discord_username,
        password: row.password,
        isAdmin: row.is_admin,
        permission: row.permission,
        createdAt: row.created_at
      };
    } finally {
      client.release();
    }
  },

  findUserByCredentials: async (robloxUsername: string, password: string): Promise<User | null> => {
    const client = await pool.connect();
    try {
      const result = await client.query(
        'SELECT * FROM users WHERE roblox_username = $1 AND password = $2',
        [robloxUsername, password]
      );
      if (result.rows.length === 0) return null;
      
      const row = result.rows[0];
      return {
        id: row.id.toString(),
        robloxUsername: row.roblox_username,
        discordUsername: row.discord_username,
        password: row.password,
        isAdmin: row.is_admin,
        permission: row.permission,
        createdAt: row.created_at
      };
    } finally {
      client.release();
    }
  },

  findUserById: async (id: string): Promise<User | null> => {
    const client = await pool.connect();
    try {
      const result = await client.query('SELECT * FROM users WHERE id = $1', [parseInt(id)]);
      if (result.rows.length === 0) return null;
      
      const row = result.rows[0];
      return {
        id: row.id.toString(),
        robloxUsername: row.roblox_username,
        discordUsername: row.discord_username,
        password: row.password,
        isAdmin: row.is_admin,
        permission: row.permission,
        createdAt: row.created_at
      };
    } finally {
      client.release();
    }
  },

  getAllUsers: async (): Promise<User[]> => {
    const client = await pool.connect();
    try {
      const result = await client.query('SELECT * FROM users ORDER BY created_at DESC');
      return result.rows.map(row => ({
        id: row.id.toString(),
        robloxUsername: row.roblox_username,
        discordUsername: row.discord_username,
        password: row.password,
        isAdmin: row.is_admin,
        permission: row.permission,
        createdAt: row.created_at
      }));
    } finally {
      client.release();
    }
  },

  updateUserPermission: async (userId: string, permission: 'User' | 'Honours Committee' | 'Admin'): Promise<boolean> => {
    const client = await pool.connect();
    try {
      const result = await client.query(
        'UPDATE users SET permission = $1, is_admin = $2 WHERE id = $3',
        [permission, permission === 'Admin', parseInt(userId)]
      );
      return result.rowCount > 0;
    } finally {
      client.release();
    }
  },

  // Nomination operations
  createNomination: async (nominationData: Omit<Nomination, 'id' | 'createdAt'>): Promise<Nomination> => {
    const client = await pool.connect();
    try {
      const result = await client.query(
        'INSERT INTO nominations (nominator_id, nominee_roblox_username, fields, description, status) VALUES ($1, $2, $3, $4, $5) RETURNING *',
        [parseInt(nominationData.nominatorId), nominationData.nomineeRobloxUsername, nominationData.fields, nominationData.description, nominationData.status]
      );
      const row = result.rows[0];
      return {
        id: row.id.toString(),
        nominatorId: row.nominator_id.toString(),
        nomineeRobloxUsername: row.nominee_roblox_username,
        fields: row.fields,
        description: row.description,
        status: row.status,
        createdAt: row.created_at
      };
    } finally {
      client.release();
    }
  },

  getAllNominations: async (): Promise<Nomination[]> => {
    const client = await pool.connect();
    try {
      const result = await client.query('SELECT * FROM nominations ORDER BY created_at DESC');
      return result.rows.map(row => ({
        id: row.id.toString(),
        nominatorId: row.nominator_id.toString(),
        nomineeRobloxUsername: row.nominee_roblox_username,
        fields: row.fields,
        description: row.description,
        status: row.status,
        createdAt: row.created_at
      }));
    } finally {
      client.release();
    }
  },

  updateNominationStatus: async (id: string, status: 'under_review' | 'approved' | 'rejected'): Promise<boolean> => {
    const client = await pool.connect();
    try {
      const result = await client.query(
        'UPDATE nominations SET status = $1 WHERE id = $2',
        [status, parseInt(id)]
      );
      return result.rowCount > 0;
    } finally {
      client.release();
    }
  },

  getNominationsUnderReview: async (): Promise<Nomination[]> => {
    const client = await pool.connect();
    try {
      const result = await client.query('SELECT * FROM nominations WHERE status = $1 ORDER BY created_at DESC', ['under_review']);
      const nominations = result.rows.map(row => ({
        id: row.id.toString(),
        nominatorId: row.nominator_id.toString(),
        nomineeRobloxUsername: row.nominee_roblox_username,
        fields: row.fields,
        description: row.description,
        status: row.status,
        createdAt: row.created_at
      }));

      // Get review comments for each nomination
      for (const nomination of nominations) {
        const comments = await DatabaseService.getReviewComments(nomination.id);
        nomination.reviewComments = comments;
      }

      return nominations;
    } finally {
      client.release();
    }
  },

  // Review comment operations
  addReviewComment: async (nominationId: string, userId: string, username: string, comment: string): Promise<ReviewComment> => {
    const client = await pool.connect();
    try {
      const result = await client.query(
        'INSERT INTO review_comments (nomination_id, user_id, username, comment) VALUES ($1, $2, $3, $4) RETURNING *',
        [parseInt(nominationId), parseInt(userId), username, comment]
      );
      const row = result.rows[0];
      return {
        id: row.id.toString(),
        nominationId: row.nomination_id.toString(),
        userId: row.user_id.toString(),
        username: row.username,
        comment: row.comment,
        createdAt: row.created_at
      };
    } finally {
      client.release();
    }
  },

  getReviewComments: async (nominationId: string): Promise<ReviewComment[]> => {
    const client = await pool.connect();
    try {
      const result = await client.query(
        'SELECT * FROM review_comments WHERE nomination_id = $1 ORDER BY created_at ASC',
        [parseInt(nominationId)]
      );
      return result.rows.map(row => ({
        id: row.id.toString(),
        nominationId: row.nomination_id.toString(),
        userId: row.user_id.toString(),
        username: row.username,
        comment: row.comment,
        createdAt: row.created_at
      }));
    } finally {
      client.release();
    }
  },

  // Honour operations
  createHonour: async (honourData: Omit<Honour, 'id' | 'awardedAt'>): Promise<Honour> => {
    const client = await pool.connect();
    try {
      const result = await client.query(
        'INSERT INTO honours (roblox_username, discord_username, title, field) VALUES ($1, $2, $3, $4) RETURNING *',
        [honourData.robloxUsername, honourData.discordUsername, honourData.title, honourData.field]
      );
      const row = result.rows[0];
      return {
        id: row.id.toString(),
        robloxUsername: row.roblox_username,
        discordUsername: row.discord_username,
        title: row.title,
        field: row.field,
        awardedAt: row.awarded_at
      };
    } finally {
      client.release();
    }
  },

  getHonoursByUser: async (robloxUsername: string): Promise<Honour[]> => {
    const client = await pool.connect();
    try {
      const result = await client.query(
        'SELECT * FROM honours WHERE LOWER(roblox_username) = LOWER($1) ORDER BY awarded_at DESC',
        [robloxUsername]
      );
      return result.rows.map(row => ({
        id: row.id.toString(),
        robloxUsername: row.roblox_username,
        discordUsername: row.discord_username,
        title: row.title,
        field: row.field,
        awardedAt: row.awarded_at
      }));
    } finally {
      client.release();
    }
  },

  getAllHonours: async (): Promise<Honour[]> => {
    const client = await pool.connect();
    try {
      const result = await client.query('SELECT * FROM honours ORDER BY awarded_at DESC');
      return result.rows.map(row => ({
        id: row.id.toString(),
        robloxUsername: row.roblox_username,
        discordUsername: row.discord_username,
        title: row.title,
        field: row.field,
        awardedAt: row.awarded_at
      }));
    } finally {
      client.release();
    }
  },

  searchHonours: async (query: string): Promise<Honour[]> => {
    const client = await pool.connect();
    try {
      const result = await client.query(
        'SELECT * FROM honours WHERE LOWER(roblox_username) LIKE LOWER($1) OR LOWER(discord_username) LIKE LOWER($1) ORDER BY awarded_at DESC',
        [`%${query}%`]
      );
      return result.rows.map(row => ({
        id: row.id.toString(),
        robloxUsername: row.roblox_username,
        discordUsername: row.discord_username,
        title: row.title,
        field: row.field,
        awardedAt: row.awarded_at
      }));
    } finally {
      client.release();
    }
  }
};