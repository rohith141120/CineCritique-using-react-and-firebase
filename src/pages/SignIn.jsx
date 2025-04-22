import React, { useState, useEffect } from "react";
import { signInWithEmailAndPassword, signInWithPopup, onAuthStateChanged } from "firebase/auth";
import { auth, googleProvider } from "../firebase/firebase";
import { useNavigate, Link } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import googleLogo from "../assets/google-logo.png";
import "../styles/SignIn.css";

const SignIn = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // Delay the redirect to ensure the toast is visible
        setTimeout(() => {
          navigate("/");
        }, 3000); // Delay matches the toast duration (3 seconds)
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  const handleSignIn = async (e) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      
      toast.success("User logged in successfully", {
        position: "top-center",
        autoClose: 3000, // 3 seconds
        hideProgressBar: false,
      });
      
      // Redirect is handled by onAuthStateChanged with delay
    } catch (error) {
      let errorMessage;
      
      switch (error.code) {
        case "auth/invalid-email":
          errorMessage = "Please enter a valid email address";
          break;
        case "auth/user-disabled":
          errorMessage = "This account has been disabled";
          break;
        case "auth/user-not-found":
          errorMessage = "No account found with this email";
          break;
        case "auth/wrong-password":
          errorMessage = "Incorrect password";
          break;
        case "auth/too-many-requests":
          errorMessage = "Too many attempts. Try again later or reset your password";
          break;
        default:
          errorMessage = "Login failed. Please try again";
          console.error("Login error:", error);
      }

      setError(errorMessage);
      toast.error(errorMessage, {
        position: "top-center",
        autoClose: 3000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setIsLoading(true);

    try {
      await signInWithPopup(auth, googleProvider);
      toast.success("User logged in successfully", {
        position: "top-center",
        autoClose: 3000, // 3 seconds
        hideProgressBar: false,
      });
    } catch (error) {
      console.error("Google sign-in error:", error);
      setError("Failed to sign in with Google");
      toast.error("Google login failed. Please try again", {
        position: "top-center",
        autoClose: 3000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <ToastContainer
        position="top-center"
        autoClose={3000}
        newestOnTop
        closeOnClick
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
      <div className="auth-box">
        <h2>Sign In to CineCritique</h2>
        
        <button 
          onClick={handleGoogleSignIn} 
          className="google-btn"
          disabled={isLoading}
        >
          <img src={googleLogo} alt="Google Logo" className="google-logo" />
          {isLoading ? "Signing in..." : "Sign in with Google"}
        </button>
        
        <div className="separator">or</div>
        
        <form onSubmit={handleSignIn} className="signin-form">
          <input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value.trim())}
            required
            autoComplete="email"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
          />
          
          <button 
            type="submit" 
            className="signin-btn"
            disabled={isLoading}
          >
            {isLoading ? "Signing in..." : "Sign In"}
          </button>
        </form>
        
        <div className="auth-links">
          <p>
            Don't have an account? <Link to="/signup">Sign up</Link>
          </p>
          <p>
            <Link to="/ForgotPassword">Forgot password?</Link>
          </p>
        </div>
        
        {error && <p className="error-message">{error}</p>}
      </div>
    </div>
  );
};

export default SignIn;