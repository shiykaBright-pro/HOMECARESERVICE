import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyCe6M4XJ9qsYcwxnS4Xd9tEuXRqigEOkHo",
  authDomain: "homecareservice-83a26.firebaseapp.com",
  projectId: "homecareservice-83a26",
  storageBucket: "homecareservice-83a26.firebasestorage.app",
  messagingSenderId: "121737816597",
  appId: "1:121737816597:web:47b3b236c39497dbe5fc1c"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Configure provider
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

export default app;

