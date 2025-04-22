import React, { useState } from "react";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../firebase/firebase";
import { useNavigate, Link } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../styles/ForgotPassword.css";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      await sendPasswordResetEmail(auth, email);
      toast.success("Password reset email sent! Check your inbox.", {
        position: "top-center",
        autoClose: 3000,
      });
      setTimeout(() => {
        navigate("/signin");
      }, 3000);
    } catch (error) {
      let errorMessage;
      switch (error.code) {
        case "auth/invalid-email":
          errorMessage = "Please enter a valid email address";
          break;
        case "auth/user-not-found":
          errorMessage = "No account found with this email";
          break;
        case "auth/too-many-requests":
          errorMessage = "Too many requests. Try again later";
          break;
        default:
          errorMessage = "Failed to send reset email. Please try again";
          console.error("Reset password error:", error);
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
        <h2>Reset Your Password</h2>
        <p>Enter your email address to receive a password reset link.</p>

        <form onSubmit={handleResetPassword} className="forgot-password-form">
          <input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value.trim())}
            required
            autoComplete="email"
          />
          <button type="submit" className="reset-btn" disabled={isLoading}>
            {isLoading ? "Sending..." : "Send Reset Link"}
          </button>
        </form>

        <div className="auth-links">
          <p>
            Remember your password? <Link to="/signin">Sign in</Link>
          </p>
          <p>
            Don't have an account? <Link to="/signup">Sign up</Link>
          </p>
        </div>

        {error && <p className="error-message">{error}</p>}
      </div>
    </div>
  );
};

export default ForgotPassword;