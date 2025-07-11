interface User {
  id: string;
  robloxUsername: string;
  discordUsername: string;
  password: string;
  isAdmin: boolean;
  permission: 'User' | 'Honours Committee' | 'Admin';
  createdAt: Date;
}

export class AuthService {
  private static currentUser: User | null = null;

  static async login(
    robloxUsername: string,
    password: string
  ): Promise<{ success: boolean; user?: User; error?: string }> {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ robloxUsername, password }),
      });

      if (response.ok) {
        const user = await response.json();
        this.currentUser = {
          ...user,
          createdAt: new Date(user.createdAt),
        };
        if (typeof window !== 'undefined') {
          localStorage.setItem('currentUserId', user.id);
        }
        return { success: true, user: this.currentUser };
      } else {
        const error = await response.json();
        return { success: false, error: error.message || 'Login failed' };
      }
    } catch {
      return { success: false, error: 'Network error' };
    }
  }

  static logout(): void {
    this.currentUser = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('currentUserId');
    }
  }

  static getCurrentUser(): User | null {
    if (this.currentUser) return this.currentUser;

    if (typeof window !== 'undefined') {
      const userId = localStorage.getItem('currentUserId');
      if (userId) {
        // Fetch user from backend if needed
        return null;
      }
    }

    return null;
  }

  static isAuthenticated(): boolean {
    return this.getCurrentUser() !== null;
  }

  static isAdmin(): boolean {
    return this.getCurrentUser()?.isAdmin || false;
  }

  static async register(
    robloxUsername: string,
    discordUsername: string,
    password: string
  ): Promise<{ success: boolean; user?: User; error?: string }> {
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ robloxUsername, discordUsername, password }),
      });

      if (response.ok) {
        const user = await response.json();
        this.currentUser = {
          ...user,
          createdAt: new Date(user.createdAt),
        };
        if (typeof window !== 'undefined') {
          localStorage.setItem('currentUserId', user.id);
        }
        return { success: true, user: this.currentUser };
      } else {
        const error = await response.json();
        return { success: false, error: error.message || 'Registration failed' };
      }
    } catch {
      return { success: false, error: 'Network error' };
    }
  }

  static hasPermission(requiredPermission: 'User' | 'Honours Committee' | 'Admin'): boolean {
    const user = this.getCurrentUser();
    if (!user) return false;

    const levels = { User: 1, 'Honours Committee': 2, Admin: 3 };
    return levels[user.permission] >= levels[requiredPermission];
  }
}

// ✅ Named exports for convenience in other modules
export const getCurrentUser = () => AuthService.getCurrentUser();
export const isAuthenticated = () => AuthService.isAuthenticated();
export const isAdmin = () => AuthService.isAdmin();
export const hasPermission = (perm: 'User' | 'Honours Committee' | 'Admin') =>
  AuthService.hasPermission(perm);