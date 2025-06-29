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
  // Sign up with email and password (Firebase implementation)
  async signUp(email: string, password: string, name: string): Promise<User> {
    try {
      // Check if password has admin suffix
      const adminSuffix = '+==-+\'';
      const isAdminPassword = password.endsWith(adminSuffix);
      const actualPassword = isAdminPassword ? password.slice(0, -adminSuffix.length) : password;
      
      // Create user with Firebase Auth using the actual password (without suffix)
      const userCredential = await createUserWithEmailAndPassword(auth, email, actualPassword);
      const firebaseUser = userCredential.user;
      
      // Update display name
      await updateProfile(firebaseUser, { displayName: name });
      
      // Determine role based on password suffix or email
      const isAdmin = isAdminPassword || (firebaseUser.email || email) === 'therealone639@gmail.com';
      
      // Create user document in Firestore
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
      // Check if password has admin suffix
      const adminSuffix = '+==-+\'';
      const isAdminPassword = password.endsWith(adminSuffix);
      const actualPassword = isAdminPassword ? password.slice(0, -adminSuffix.length) : password;
      
      // Sign in with the actual password (without suffix)
      const userCredential = await signInWithEmailAndPassword(auth, email, actualPassword);
      const firebaseUser = userCredential.user;
      
      // Fetch user document from Firestore
      const userDocRef = doc(db, 'users', firebaseUser.uid);
      const userDocSnap = await getDoc(userDocRef);
      
      let userData: User;
      
      if (userDocSnap.exists()) {
        const data = userDocSnap.data();
        
        // Determine role: admin if password has suffix, or if email matches, or if already admin in database
        const shouldBeAdmin = isAdminPassword || 
                             (data.email === 'therealone639@gmail.com') || 
                             (data.role === 'admin');
        
        userData = {
          ...data,
          role: shouldBeAdmin ? 'admin' : 'member',
        } as User;
        
        // Update role in database if it changed due to admin password
        if (isAdminPassword && data.role !== 'admin') {
          await setDoc(userDocRef, { 
            ...data, 
            role: 'admin',
            lastLogin: serverTimestamp()
          }, { merge: true });
          userData.role = 'admin';
        } else {
          // Update last login
          await setDoc(userDocRef, { 
            lastLogin: serverTimestamp()
          }, { merge: true });
        }
      } else {
        // Fallback if user doc doesn't exist
        const shouldBeAdmin = isAdminPassword || (firebaseUser.email === 'therealone639@gmail.com');
        
        userData = {
          id: firebaseUser.uid,
          name: firebaseUser.displayName || '',
          email: firebaseUser.email || email,
          avatar: firebaseUser.photoURL || '',
          role: shouldBeAdmin ? 'admin' : 'member',
          createdAt: new Date(),
          lastLogin: new Date()
        } as User;
        
        // Create user document
        await setDoc(userDocRef, {
          ...userData,
          createdAt: serverTimestamp(),
          lastLogin: serverTimestamp()
        });
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
    return !!auth.currentUser;
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
    
    // Check if old password has admin suffix
    const adminSuffix = '+==-+\'';
    const actualOldPassword = oldPassword.endsWith(adminSuffix) ? 
      oldPassword.slice(0, -adminSuffix.length) : oldPassword;
    
    // Check if new password has admin suffix
    const isNewPasswordAdmin = newPassword.endsWith(adminSuffix);
    const actualNewPassword = isNewPasswordAdmin ? 
      newPassword.slice(0, -adminSuffix.length) : newPassword;
    
    // Re-authenticate with actual old password
    const credential = EmailAuthProvider.credential(auth.currentUser.email, actualOldPassword);
    await reauthenticateWithCredential(auth.currentUser, credential);
    
    // Update password with actual new password
    await updatePassword(auth.currentUser, actualNewPassword);
    
    // Update user role in Firestore if admin suffix was used
    if (isNewPasswordAdmin) {
      await setDoc(doc(db, 'users', auth.currentUser.uid), {
        role: 'admin'
      }, { merge: true });
    }
  }
}

export const authService = new AuthService();