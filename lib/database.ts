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

export const db = {
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
        createdAt: row.created_at,
      };
    } finally {
      client.release();
    }
  },

  findUserByRobloxUsername: async (robloxUsername: string): Promise<User | null> => {
    const client = await pool.connect();
    try {
      const result = await client.query(
        'SELECT * FROM users WHERE roblox_username = $1',
        [robloxUsername]
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
        createdAt: row.created_at,
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
        createdAt: row.created_at,
      };
    } finally {
      client.release();
    }
  },

  getAllUsers: async (): Promise<User[]> => {
    const client = await pool.connect();
    try {
      const result = await client.query('SELECT * FROM users ORDER BY created_at DESC');
      return result.rows.map((row) => ({
        id: row.id.toString(),
        robloxUsername: row.roblox_username,
        discordUsername: row.discord_username,
        password: row.password,
        isAdmin: row.is_admin,
        permission: row.permission,
        createdAt: row.created_at,
      }));
    } finally {
      client.release();
    }
  },

  updateUserPermission: async (
    userId: string,
    permission: 'User' | 'Honours Committee' | 'Admin'
  ): Promise<boolean> => {
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
};

// Export db as DatabaseService to match imports expecting DatabaseService
export const DatabaseService = db;