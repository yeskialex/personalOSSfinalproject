import { createContext, useState, useEffect } from "react";
import { auth } from "../firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [trainer, setTrainer] = useState(null);
  const [loading, setLoading] = useState(true);

  // Keep user logged in on refresh
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // The user object from onAuthStateChanged doesn't have the custom name
        // we want to display. We'll rely on the name being set correctly
        // during login/signup and persisted. For display purposes, we can
        // still derive it from the email if needed, but it's better to
        // handle this consistently at the source.
        setTrainer(user);
      } else {
        setTrainer(user);
      }
      setLoading(false)
    });

    return unsubscribe;
  }, []);

  // Convert trainerName → valid email for Firebase
  const formatEmail = (trainerName) =>
    trainerName.trim().toLowerCase().replace(/\s+/g, "") + "@trainer.com";

  // SIGN UP
  const signup = async (trainerName, password) => {
    try {
      const email = formatEmail(trainerName);
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      // Manually construct the user object to include our desired display name
      const name = trainerName.charAt(0).toUpperCase() + trainerName.slice(1);
      setTrainer({
        ...userCredential.user,
        // This 'name' is for display purposes in our app, not a property on the Firebase user object
        name: name
      });
      return true;
    } catch (error) {
      alert(error.message);
      return false;
    }
  };

  // LOGIN
  const login = async (trainerName, password) => {
    try {
      const email = formatEmail(trainerName);
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      // Manually construct the user object to include our desired display name
      const name = trainerName.charAt(0).toUpperCase() + trainerName.slice(1);
      setTrainer({
        ...userCredential.user,
        // This 'name' is for display purposes in our app, not a property on the Firebase user object
        name: name
      });
      return true;
    } catch (error) {
      alert("Invalid trainer name or password");
      return false;
    }
  };

  // LOGOUT
  const logout = async () => {
    await signOut(auth);
    setTrainer(null);
  };

  return (
    <AuthContext.Provider value={{ trainer, login, signup, logout }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
