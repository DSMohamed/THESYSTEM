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
          // ✅ CRITICAL: Check if user still exists in database and is active
          const isUserValid = await authService.validateUserExists(userData.id);
          
          if (isUserValid) {
            setUser(userData);
            setUsers([userData]);
          } else {
            // User was deleted or deactivated - force sign out
            console.log('User no longer exists or is inactive - signing out');
            await authService.signOut();
            setUser(null);
            setUsers([]);
            setError('Your account has been deactivated or removed. Please contact an administrator.');
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        // If there's an error checking user validity, sign them out for security
        await authService.signOut();
        setUser(null);
        setUsers([]);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();

    // Set up periodic validation check (every 30 seconds)
    const validationInterval = setInterval(async () => {
      if (user) {
        try {
          const isUserValid = await authService.validateUserExists(user.id);
          if (!isUserValid) {
            console.log('User validation failed - signing out');
            await authService.signOut();
            setUser(null);
            setUsers([]);
            setError('Your account has been deactivated or removed. Please contact an administrator.');
          }
        } catch (error) {
          console.error('User validation error:', error);
        }
      }
    }, 30000); // Check every 30 seconds

    return () => clearInterval(validationInterval);
  }, [user?.id]);

  const signUp = async (email: string, password: string, name: string): Promise<void> => {
    try {
      setError(null);
      setIsLoading(true);
      const userData = await authService.signUp(email, password, name);
      
      // Validate the new user
      const isUserValid = await authService.validateUserExists(userData.id);
      if (isUserValid) {
        setUser(userData);
        setUsers([userData]);
      } else {
        throw new Error('Account creation failed - please try again');
      }
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
      
      // ✅ CRITICAL: Validate user exists and is active after sign in
      const isUserValid = await authService.validateUserExists(userData.id);
      if (isUserValid) {
        setUser(userData);
        setUsers([userData]);
      } else {
        // User exists in Firebase Auth but not in database or is inactive
        await authService.signOut();
        throw new Error('Account has been deactivated or removed. Please contact an administrator.');
      }
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
      
      // Validate the user
      const isUserValid = await authService.validateUserExists(userData.id);
      if (isUserValid) {
        setUser(userData);
        setUsers([userData]);
      } else {
        await authService.signOut();
        throw new Error('Account has been deactivated or removed. Please contact an administrator.');
      }
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
    // Since we only have one user now, this function doesn't need to do anything
    // but we keep it for compatibility
    console.log('Switch user called for:', userId);
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