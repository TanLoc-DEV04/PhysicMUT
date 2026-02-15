import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';
import type { User } from '../types/auth';

interface AuthContextType {
  currentUser: User | null;
  isAuthenticated: boolean;
  login: (user: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    try {
        const storedUser = localStorage.getItem('user');
        if (!storedUser) return null;
        
        const parsedUser = JSON.parse(storedUser);
        
        // Normalize role if it's an object (legacy data handling)
        if (parsedUser && typeof parsedUser.role === 'object') {
             parsedUser.role = (parsedUser.role as any).name?.toLowerCase() || 'student';
             // Ideally update localStorage too, but state is enough for runtime safety
        }
        
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

  return (
    <AuthContext.Provider value={{ currentUser, isAuthenticated: !!currentUser, login, logout }}>
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
