import React, { useState } from "react";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth, db } from "../firebase/firebase";
import { doc, setDoc } from "firebase/firestore";
import { useNavigate, Link } from "react-router-dom";
import "../styles/SignUp.css";

const SignUp = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleSignUp = async (e) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      // Create auth user
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Update auth profile
      await updateProfile(userCredential.user, { displayName: username });

      // Create Firestore user document using email as the ID
      const emailSafe = email.replace(/\./g, ','); // Replace dots with commas to make it a valid document ID
      await setDoc(doc(db, "users", emailSafe), {
        username: username,
        bio: "",
        isPublic: true, // Default to public profile
        email: email,
        createdAt: new Date(),
        uid: userCredential.user.uid // Store UID for reference
      });

      alert("Successfully signed up!");
      navigate("/signin");
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <h2>Create an Account on MovieReview</h2>
        {error && <p className="error-message">{error}</p>}
        <form onSubmit={handleSignUp} className="signup-form">
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
          <button type="submit" className="signup-btn">
            Sign Up
          </button>
        </form>
        <p className="auth-link">
          Already have an account? <Link to="/signin">Sign in</Link>
        </p>
      </div>
    </div>
  );
};

export default SignUp;