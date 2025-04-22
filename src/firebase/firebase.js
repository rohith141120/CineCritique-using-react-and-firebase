import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore, doc, setDoc, getDoc, updateDoc, collection, getDocs, deleteDoc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyA46sLLI3bR7MW57rXprYebuxjE68YOb3k",
  authDomain: "letterboxd-clone-6156b.firebaseapp.com",
  projectId: "letterboxd-clone-6156b",
  storageBucket: "letterboxd-clone-6156b.appspot.com",
  messagingSenderId: "227110378588",
  appId: "1:227110378588:web:538fde9e3fe31e39f41a99",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();
const db = getFirestore(app);

export { auth, googleProvider, db, doc, setDoc, getDoc, updateDoc, collection, getDocs, deleteDoc };