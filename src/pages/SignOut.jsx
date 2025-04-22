import React from "react";
import { signOut } from "firebase/auth";
import { auth } from "../firebase/firebase";
import { useNavigate } from "react-router-dom";
import "../styles/SignOut.css"; // Style file

const SignOut = () => {
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      navigate("/signin");
      window.location.reload(); // ✅ Refresh to ensure logout
    } catch (error) {
      console.error("Sign-Out Error:", error.message);
    }
  };

  return (
    <div className="signout-container">
      <h2>Are you sure you want to sign out?</h2>
      <button onClick={handleSignOut} className="signout-btn">Sign Out</button>
    </div>
  );
};

export default SignOut;
