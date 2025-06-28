import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut as firebaseSignOut,
  updateProfile,
  User as FirebaseUser,
  onAuthStateChanged,
  updatePassword,
  updateProfile as firebaseUpdateProfile,
  EmailAuthProvider,
  reauthenticateWithCredential
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, googleProvider, db } from '../config/firebase';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: 'admin' | 'member';
  createdAt?: any;
  lastLogin?: any;
}

export class AuthService {
  // Mock authentication for demo purposes
  private mockUsers = [
    {
      id: '1',
      name: 'Demo User',
      email: 'demo@example.com',
      avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150',
      role: 'admin' as const
    },
    {
      id: '2',
      name: 'Sarah Johnson',
      email: 'sarah@example.com',
      avatar: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=150',
      role: 'member' as const
    },
    {
      id: '3',
      name: 'أحمد محمد',
      email: 'ahmed@example.com',
      avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150',
      role: 'member' as const
    }
  ];

  // Sign up with email and password (Firebase implementation)
  async signUp(email: string, password: string, name: string): Promise<User> {
    try {
      // Create user with Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;
      // Update display name
      await updateProfile(firebaseUser, { displayName: name });
      // Create user document in Firestore
      const isAdmin = (firebaseUser.email || email) === 'therealone639@gmail.com';
      const userDoc = {
        id: firebaseUser.uid,
        name: name,
        email: firebaseUser.email || email,
        avatar: firebaseUser.photoURL || '',
        role: isAdmin ? 'admin' : 'member',
        createdAt: serverTimestamp(),
        lastLogin: serverTimestamp()
      };
      await setDoc(doc(db, 'users', firebaseUser.uid), userDoc);
      // Return user object
      return {
        ...userDoc,
        createdAt: new Date(),
        lastLogin: new Date()
      };
    } catch (error: any) {
      throw new Error(error.message || 'Failed to create account');
    }
  }

  // Sign in with email and password (Firebase implementation)
  async signIn(email: string, password: string): Promise<User> {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;
      // Fetch user document from Firestore
      const userDocRef = doc(db, 'users', firebaseUser.uid);
      const userDocSnap = await getDoc(userDocRef);
      let userData: User;
      if (userDocSnap.exists()) {
        const data = userDocSnap.data();
        userData = {
          ...data,
          role: (data.email === 'therealone639@gmail.com') ? 'admin' : 'member',
        } as User;
      } else {
        // Fallback if user doc doesn't exist
        userData = {
          id: firebaseUser.uid,
          name: firebaseUser.displayName || '',
          email: firebaseUser.email || email,
          avatar: firebaseUser.photoURL || '',
          role: (firebaseUser.email === 'therealone639@gmail.com') ? 'admin' : 'member',
          createdAt: new Date(),
          lastLogin: new Date()
        } as User;
      }
      return userData;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to sign in');
    }
  }

  // Sign in with Google (Firebase implementation)
  async signInWithGoogle(): Promise<User> {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const firebaseUser = result.user;
      // Create or update user document in Firestore
      const isAdmin = (firebaseUser.email || '') === 'therealone639@gmail.com';
      const userDoc = {
        id: firebaseUser.uid,
        name: firebaseUser.displayName || '',
        email: firebaseUser.email || '',
        avatar: firebaseUser.photoURL || '',
        role: isAdmin ? 'admin' : 'member',
        createdAt: serverTimestamp(),
        lastLogin: serverTimestamp()
      };
      await setDoc(doc(db, 'users', firebaseUser.uid), userDoc, { merge: true });
      return {
        id: userDoc.id,
        name: userDoc.name,
        email: userDoc.email,
        avatar: userDoc.avatar,
        role: userDoc.role,
        createdAt: new Date(),
        lastLogin: new Date()
      } as User;
    } catch (error: any) {
      throw new Error('Google sign-in failed: ' + (error.message || 'Unknown error'));
    }
  }

  // Sign out (Firebase implementation)
  async signOut(): Promise<void> {
    try {
      await firebaseSignOut(auth);
    } catch (error: any) {
      throw new Error('Failed to sign out: ' + (error.message || 'Unknown error'));
    }
  }

  // Get current user data using Firebase Auth
  async getCurrentUserData(): Promise<User | null> {
    return new Promise((resolve) => {
      onAuthStateChanged(auth, async (firebaseUser) => {
        if (firebaseUser) {
          // Fetch user document from Firestore
          const userDocRef = doc(db, 'users', firebaseUser.uid);
          const userDocSnap = await getDoc(userDocRef);
          if (userDocSnap.exists()) {
            const data = userDocSnap.data();
            resolve({
              ...data,
              role: data.role === 'admin' ? 'admin' : 'member',
            } as User);
          } else {
            resolve({
              id: firebaseUser.uid,
              name: firebaseUser.displayName || '',
              email: firebaseUser.email || '',
              avatar: firebaseUser.photoURL || '',
              role: 'member' as const,
              createdAt: new Date(),
              lastLogin: new Date()
            });
          }
        } else {
          resolve(null);
        }
      });
    });
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return !!localStorage.getItem('currentUser');
  }

  // Update user profile (name, avatar)
  async updateProfile(name: string, avatar: string): Promise<void> {
    if (!auth.currentUser) throw new Error('No user is currently signed in');
    await firebaseUpdateProfile(auth.currentUser, { displayName: name, photoURL: avatar });
    // Optionally update Firestore user document as well
    await setDoc(doc(db, 'users', auth.currentUser.uid), {
      name,
      avatar
    }, { merge: true });
  }

  // Change user password with re-authentication
  async changePassword(oldPassword: string, newPassword: string): Promise<void> {
    if (!auth.currentUser || !auth.currentUser.email) throw new Error('No user is currently signed in');
    // Re-authenticate
    const credential = EmailAuthProvider.credential(auth.currentUser.email, oldPassword);
    await reauthenticateWithCredential(auth.currentUser, credential);
    // Update password
    await updatePassword(auth.currentUser, newPassword);
  }
}

export const authService = new AuthService();