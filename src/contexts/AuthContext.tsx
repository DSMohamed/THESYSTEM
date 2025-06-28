import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService, User } from '../services/authService';

interface AuthContextType {
  user: User | null;
  users: User[];
  isAuthenticated: boolean;
  isLoading: boolean;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  switchUser: (userId: string) => void;
  error: string | null;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock additional users for demo
const mockAdditionalUsers: User[] = [
  {
    id: '2',
    name: 'Sarah Johnson',
    email: 'sarah@example.com',
    avatar: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=150',
    role: 'member'
  },
  {
    id: '3',
    name: 'فاطمة علي',
    email: 'fatima@example.com',
    avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150',
    role: 'member'
  }
];

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initializeAuth = async () => {
      setIsLoading(true);
      try {
        const userData = await authService.getCurrentUserData();
        if (userData) {
          setUser(userData);
          setUsers([userData, ...mockAdditionalUsers]);
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const signUp = async (email: string, password: string, name: string): Promise<void> => {
    try {
      setError(null);
      setIsLoading(true);
      const userData = await authService.signUp(email, password, name);
      setUser(userData);
      setUsers([userData, ...mockAdditionalUsers]);
    } catch (error: any) {
      setError(error.message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signIn = async (email: string, password: string): Promise<void> => {
    try {
      setError(null);
      setIsLoading(true);
      const userData = await authService.signIn(email, password);
      setUser(userData);
      setUsers([userData, ...mockAdditionalUsers]);
    } catch (error: any) {
      setError(error.message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signInWithGoogle = async (): Promise<void> => {
    try {
      setError(null);
      setIsLoading(true);
      const userData = await authService.signInWithGoogle();
      setUser(userData);
      setUsers([userData, ...mockAdditionalUsers]);
    } catch (error: any) {
      setError(error.message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async (): Promise<void> => {
    try {
      setError(null);
      await authService.signOut();
      setUser(null);
      setUsers([]);
    } catch (error: any) {
      setError(error.message);
    }
  };

  const switchUser = (userId: string) => {
    const foundUser = users.find(u => u.id === userId);
    if (foundUser) {
      setUser(foundUser);
      localStorage.setItem('currentUser', JSON.stringify(foundUser));
    }
  };

  const clearError = () => {
    setError(null);
  };

  return (
    <AuthContext.Provider value={{
      user,
      users,
      isAuthenticated: !!user,
      isLoading,
      signUp,
      signIn,
      signInWithGoogle,
      signOut,
      switchUser,
      error,
      clearError
    }}>
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