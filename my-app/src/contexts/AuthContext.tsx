import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';
import type { User } from '../types/auth';

interface AuthContextType {
  currentUser: User | null;
  isAuthenticated: boolean;
  login: (user: User) => void;
  logout: () => void;
  hasPermission: (permission: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    try {
        const storedUser = localStorage.getItem('user');
        if (!storedUser) return null;
        
        const parsedUser = JSON.parse(storedUser);
        
        return parsedUser;
    } catch (e) {
        console.error("Failed to parse user from local storage", e);
        localStorage.removeItem('user'); // Clear corrupted data
        return null;
    }
  });

  const login = (user: User) => {
    localStorage.setItem('user', JSON.stringify(user));
    setCurrentUser(user);
  };

  const logout = () => {
    localStorage.removeItem('user');
    // Token removal usually happens here or in the caller. 
    // Since LoginPage sets it, we should probably clear it here to be safe and consistent.
    localStorage.removeItem('token');
    setCurrentUser(null);
  };

  const hasPermission = (permission: string) => {
    if (!currentUser) return false;
    
    const roleName = typeof currentUser.role === 'object' ? currentUser.role.name : currentUser.role;
    // Admins implicitly have all permissions
    if (roleName?.toLowerCase() === 'admin') return true;

    if (typeof currentUser.role === 'object' && currentUser.role.permissions) {
      const perms = currentUser.role.permissions;
      
      // Legacy seed format fallback
      if (perms.all === true) return true;

      // Check granular JSON permissions array format
      for (const group of Object.values(perms)) {
        if (Array.isArray(group) && group.includes(permission)) {
          return true;
        }
      }
    }
    
    return false;
  };

  return (
    <AuthContext.Provider value={{ currentUser, isAuthenticated: !!currentUser, login, logout, hasPermission }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
