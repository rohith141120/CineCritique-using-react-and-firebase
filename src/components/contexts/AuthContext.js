import React, { createContext, useContext, useEffect, useState } from "react";
import { auth, db } from "../../firebase/firebase";
import { onAuthStateChanged, deleteUser } from "firebase/auth";
import { doc, onSnapshot, deleteDoc, collection, getDocs } from "firebase/firestore";

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [userAvatar, setUserAvatar] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      if (!user) {
        setUserAvatar(null);
        setLoading(false);
      }
    });

    let unsubscribeFirestore = () => {};
    if (currentUser && currentUser.email) { // Ensure currentUser and email exist
      const userRef = doc(db, "users", currentUser.email); // Use email as document ID
      unsubscribeFirestore = onSnapshot(
        userRef,
        (docSnap) => {
          if (docSnap.exists()) {
            const data = docSnap.data();
            setUserAvatar(data.avatar || null);
          } else {
            setUserAvatar(null); // If document doesn't exist, reset avatar
          }
          setLoading(false);
        },
        (err) => {
          console.error("Firestore listener error:", err);
          setUserAvatar(null);
          setLoading(false);
        }
      );
    }

    return () => {
      unsubscribeAuth();
      unsubscribeFirestore();
    };
  }, [currentUser]);

  const deleteUserAccount = async () => {
    try {
      if (currentUser) {
        const userId = currentUser.email; // Use email as document ID
        const userDoc = doc(db, "users", userId);
        await deleteDoc(userDoc);

        const subcollections = ["liked", "watched", "watchlist", "reviews"];
        for (const subcollection of subcollections) {
          const subcollectionRef = collection(db, `users/${userId}/${subcollection}`);
          const subcollectionSnap = await getDocs(subcollectionRef);
          subcollectionSnap.docs.forEach(async (doc) => {
            await deleteDoc(doc.ref);
          });
        }

        await deleteUser(currentUser);
        console.log("User account and data deleted successfully");
        setUserAvatar(null);
      }
    } catch (err) {
      console.error("Error deleting user account and data:", err);
    }
  };

  const value = {
    currentUser,
    userAvatar,
    deleteUserAccount,
    loading,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}