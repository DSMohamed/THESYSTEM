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
  reauthenticateWithCredential,
  deleteUser
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp, collection, getDocs, deleteDoc, updateDoc, query, orderBy, where } from 'firebase/firestore';
import { auth, googleProvider, db } from '../config/firebase';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: 'admin' | 'member';
  createdAt?: any;
  lastLogin?: any;
  isActive?: boolean;
  loginCount?: number;
}

export interface UserStats {
  totalUsers: number;
  activeUsers: number;
  adminUsers: number;
  newUsersThisWeek: number;
  totalLogins: number;
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
        lastLogin: serverTimestamp(),
        isActive: true,
        loginCount: 1
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
        
        // Determine role: admin ONLY if password has suffix OR if email matches admin email
        // Regular password login should NOT grant admin privileges, even if user was previously admin
        const shouldBeAdmin = isAdminPassword || (data.email === 'therealone639@gmail.com');
        
        userData = {
          ...data,
          role: shouldBeAdmin ? 'admin' : 'member',
        } as User;
        
        // Always update the role in database based on current login method
        await setDoc(userDocRef, { 
          ...data, 
          role: shouldBeAdmin ? 'admin' : 'member',
          lastLogin: serverTimestamp(),
          isActive: true,
          loginCount: (data.loginCount || 0) + 1
        }, { merge: true });
        
        userData.role = shouldBeAdmin ? 'admin' : 'member';
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
          lastLogin: new Date(),
          isActive: true,
          loginCount: 1
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
      // Google sign-in only grants admin for specific email
      const isAdmin = (firebaseUser.email || '') === 'therealone639@gmail.com';
      
      const userDocRef = doc(db, 'users', firebaseUser.uid);
      const userDocSnap = await getDoc(userDocRef);
      
      const userDoc = {
        id: firebaseUser.uid,
        name: firebaseUser.displayName || '',
        email: firebaseUser.email || '',
        avatar: firebaseUser.photoURL || '',
        role: isAdmin ? 'admin' : 'member',
        lastLogin: serverTimestamp(),
        isActive: true,
        loginCount: userDocSnap.exists() ? (userDocSnap.data().loginCount || 0) + 1 : 1
      };
      
      if (!userDocSnap.exists()) {
        userDoc.createdAt = serverTimestamp();
      }
      
      await setDoc(userDocRef, userDoc, { merge: true });
      
      return {
        id: userDoc.id,
        name: userDoc.name,
        email: userDoc.email,
        avatar: userDoc.avatar,
        role: userDoc.role,
        createdAt: new Date(),
        lastLogin: new Date(),
        isActive: userDoc.isActive,
        loginCount: userDoc.loginCount
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
              lastLogin: new Date(),
              isActive: true,
              loginCount: 1
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
    
    // Update user role in Firestore based on new password
    const shouldBeAdmin = isNewPasswordAdmin || (auth.currentUser.email === 'therealone639@gmail.com');
    await setDoc(doc(db, 'users', auth.currentUser.uid), {
      role: shouldBeAdmin ? 'admin' : 'member'
    }, { merge: true });
  }

  // ADMIN FUNCTIONS

  // Get all users (admin only)
  async getAllUsers(): Promise<User[]> {
    try {
      const usersCollection = collection(db, 'users');
      const usersQuery = query(usersCollection, orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(usersQuery);
      
      const users: User[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        users.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          lastLogin: data.lastLogin?.toDate() || new Date()
        } as User);
      });
      
      return users;
    } catch (error: any) {
      throw new Error('Failed to fetch users: ' + error.message);
    }
  }

  // Get user statistics (admin only)
  async getUserStats(): Promise<UserStats> {
    try {
      const users = await this.getAllUsers();
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      
      const stats: UserStats = {
        totalUsers: users.length,
        activeUsers: users.filter(u => u.isActive).length,
        adminUsers: users.filter(u => u.role === 'admin').length,
        newUsersThisWeek: users.filter(u => 
          u.createdAt && new Date(u.createdAt) >= weekAgo
        ).length,
        totalLogins: users.reduce((sum, u) => sum + (u.loginCount || 0), 0)
      };
      
      return stats;
    } catch (error: any) {
      throw new Error('Failed to get user stats: ' + error.message);
    }
  }

  // Delete user (admin only)
  async deleteUser(userId: string): Promise<void> {
    try {
      // Delete user document from Firestore
      await deleteDoc(doc(db, 'users', userId));
      
      // Note: Deleting from Firebase Auth requires the user to be currently signed in
      // In a real app, you'd need Firebase Admin SDK for this
      console.log(`User ${userId} deleted from Firestore`);
    } catch (error: any) {
      throw new Error('Failed to delete user: ' + error.message);
    }
  }

  // Update user role (admin only)
  async updateUserRole(userId: string, newRole: 'admin' | 'member'): Promise<void> {
    try {
      const userDocRef = doc(db, 'users', userId);
      await updateDoc(userDocRef, {
        role: newRole
      });
    } catch (error: any) {
      throw new Error('Failed to update user role: ' + error.message);
    }
  }

  // Toggle user active status (admin only)
  async toggleUserStatus(userId: string, isActive: boolean): Promise<void> {
    try {
      const userDocRef = doc(db, 'users', userId);
      await updateDoc(userDocRef, {
        isActive: isActive
      });
    } catch (error: any) {
      throw new Error('Failed to update user status: ' + error.message);
    }
  }

  // Update user profile (admin only)
  async updateUserProfile(userId: string, updates: Partial<User>): Promise<void> {
    try {
      const userDocRef = doc(db, 'users', userId);
      await updateDoc(userDocRef, updates);
    } catch (error: any) {
      throw new Error('Failed to update user profile: ' + error.message);
    }
  }

  // Search users (admin only)
  async searchUsers(searchTerm: string): Promise<User[]> {
    try {
      const users = await this.getAllUsers();
      const lowercaseSearch = searchTerm.toLowerCase();
      
      return users.filter(user => 
        user.name.toLowerCase().includes(lowercaseSearch) ||
        user.email.toLowerCase().includes(lowercaseSearch)
      );
    } catch (error: any) {
      throw new Error('Failed to search users: ' + error.message);
    }
  }

  // Get users by role (admin only)
  async getUsersByRole(role: 'admin' | 'member'): Promise<User[]> {
    try {
      const usersCollection = collection(db, 'users');
      const usersQuery = query(usersCollection, where('role', '==', role));
      const querySnapshot = await getDocs(usersQuery);
      
      const users: User[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        users.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          lastLogin: data.lastLogin?.toDate() || new Date()
        } as User);
      });
      
      return users;
    } catch (error: any) {
      throw new Error('Failed to fetch users by role: ' + error.message);
    }
  }
}

export const authService = new AuthService();