import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getAnalytics } from 'firebase/analytics';

// Note: In a production app, these should be environment variables
const firebaseConfig = {
  apiKey: "AIzaSyB4X-X1BY8N8KRIDfCoqx87PRjNZ9naTck",
  authDomain: "the-system-b91ab.firebaseapp.com",
  projectId: "the-system-b91ab",
  storageBucket: "the-system-b91ab.appspot.com",
  messagingSenderId: "742792790410",
  appId: "1:742792790410:web:88b6463ab4c311968c0873",
  measurementId: "G-4KVLHQR6W0"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Analytics if in browser
let analytics;
if (typeof window !== 'undefined') {
  analytics = getAnalytics(app);
}

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Google Auth Provider
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);

export default app; 