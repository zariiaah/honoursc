
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

  static async login(robloxUsername: string, password: string): Promise<{ success: boolean; user?: User; error?: string }> {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ robloxUsername, password }),
      });

      if (response.ok) {
        const user = await response.json();
        this.currentUser = {
          ...user,
          createdAt: new Date(user.createdAt)
        };
        if (typeof window !== 'undefined') {
          localStorage.setItem('currentUserId', user.id);
        }
        return { success: true, user: this.currentUser };
      } else {
        const error = await response.json();
        return { success: false, error: error.message || 'Login failed' };
      }
    } catch (error) {
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
    if (this.currentUser) {
      return this.currentUser;
    }
    
    if (typeof window !== 'undefined') {
      const userId = localStorage.getItem('currentUserId');
      if (userId) {
        // In a real app, you'd make an API call to verify the stored user ID
        // For now, we'll return null to force re-login
        return null;
      }
    }
    
    return null;
  }

  static isAuthenticated(): boolean {
    return this.getCurrentUser() !== null;
  }

  static isAdmin(): boolean {
    const user = this.getCurrentUser();
    return user?.isAdmin || false;
  }

  static async register(robloxUsername: string, discordUsername: string, password: string): Promise<{ success: boolean; user?: User; error?: string }> {
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ robloxUsername, discordUsername, password }),
      });

      if (response.ok) {
        const user = await response.json();
        this.currentUser = {
          ...user,
          createdAt: new Date(user.createdAt)
        };
        if (typeof window !== 'undefined') {
          localStorage.setItem('currentUserId', user.id);
        }
        return { success: true, user: this.currentUser };
      } else {
        const error = await response.json();
        return { success: false, error: error.message || 'Registration failed' };
      }
    } catch (error) {
      return { success: false, error: 'Network error' };
    }
  }

  static hasPermission(requiredPermission: 'User' | 'Honours Committee' | 'Admin'): boolean {
    const user = this.getCurrentUser();
    if (!user) return false;
    
    const permissionLevels = { 'User': 1, 'Honours Committee': 2, 'Admin': 3 };
    return permissionLevels[user.permission] >= permissionLevels[requiredPermission];
  }
}
