import React, { useState, useEffect } from "react";
import { db } from "../firebase/firebase";
import { collection, getDocs, query, doc, deleteDoc } from "firebase/firestore";
import { Container, Toast } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../components/contexts/AuthContext";
import "../styles/Watchlist.css";

const Watchlist = () => {
  const { currentUser } = useAuth();
  const [watchlist, setWatchlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showToast, setShowToast] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 820);
  const [hoveredMovie, setHoveredMovie] = useState(null);
  const navigate = useNavigate();

  // Fetch watchlist from Firestore
  useEffect(() => {
    const fetchWatchlist = async () => {
      if (!currentUser || !currentUser.email) {
        console.log("User or user.email is missing:", currentUser);
        setLoading(false);
        return;
      }
      try {
        const watchlistQuery = query(collection(db, `users/${currentUser.email}/watchlist`));
        const querySnapshot = await getDocs(watchlistQuery);
        const watchlistData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setWatchlist(watchlistData);
      } catch (error) {
        console.error("Error fetching watchlist:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchWatchlist();
  }, [currentUser]);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 820);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Remove a movie from watchlist
  const handleRemoveFromWatchlist = async (movieId) => {
    if (!currentUser || !currentUser.email) {
      console.log("User or user.email is missing for deletion:", currentUser);
      return;
    }
    if (window.confirm("Are you sure you want to remove this movie from your watchlist?")) {
      try {
        await deleteDoc(doc(db, `users/${currentUser.email}/watchlist`, movieId));
        setWatchlist(watchlist.filter((movie) => movie.id !== movieId));
        setShowToast(true);
      } catch (error) {
        console.error("Error removing from watchlist:", error);
        alert("Failed to remove movie from watchlist.");
      }
    }
  };

  if (loading) return <div className="loading">Loading watchlist...</div>;

  return (
    <Container className="letterboxd-dark p-4">
      <h1 className="mb-4 text-white text-center display-4 fw-bold animate__animated animate__fadeIn">
        Your Watchlist
      </h1>

      {/* Toast Notification */}
      <Toast
        onClose={() => setShowToast(false)}
        show={showToast}
        delay={3000}
        autohide
        className="toast-notification position-fixed bottom-0 end-0 m-3"
      >
        <Toast.Body>Movie removed from watchlist successfully!</Toast.Body>
      </Toast>

      {!currentUser ? (
        <div className="text-center mb-4">
          <p className="text-muted fs-4 mb-3 animate__animated animate__fadeIn">
            Please sign in to view your watchlist.
          </p>
          <button
            className="signin-btn"
            onClick={() => navigate("/signin")}
          >
            Sign In
          </button>
        </div>
      ) : watchlist.length === 0 ? (
        <div className="text-center mb-4">
          <p className="text-muted fs-4 mb-3 animate__animated animate__fadeIn">
            Your watchlist is empty.
          </p>
          <button
            className="browse-btn"
            onClick={() => navigate("/")}
          >
            Browse Movies
          </button>
        </div>
      ) : isMobile ? (
        // Mobile View (3 cards per row)
        <div className="mobile-watchlist-grid">
          {watchlist.map((movie) => (
            <div key={movie.id} className="mobile-watchlist-card">
              <div className="mobile-watchlist-image-container">
                <img
                  src={
                    movie.poster_path
                      ? `https://image.tmdb.org/t/p/w500/${movie.poster_path}`
                      : "https://via.placeholder.com/300x450"
                  }
                  alt={movie.title}
                  className="mobile-watchlist-poster"
                />
                <button
                  className="remove-btn"
                  onClick={() => handleRemoveFromWatchlist(movie.id)}
                >
                  ×
                </button>
              </div>
              <div className="mobile-watchlist-details">
                <h3 className="mobile-watchlist-title">{movie.title}</h3>
                <p className="mobile-watchlist-year">{movie.release_date?.split("-")[0]}</p>
                <button
                  className="view-details-btn"
                  onClick={() => navigate(`/movie/${movie.movieId}`)}
                >
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        // Desktop View (4 cards per row)
        <div className="desktop-watchlist-grid">
          {watchlist.map((movie) => (
            <div
              key={movie.id}
              className={`desktop-watchlist-card ${hoveredMovie === movie.id ? "hovered" : ""}`}
              onMouseEnter={() => setHoveredMovie(movie.id)}
              onMouseLeave={() => setHoveredMovie(null)}
            >
              <div className="desktop-watchlist-image-container">
                <img
                  src={
                    movie.poster_path
                      ? `https://image.tmdb.org/t/p/w500/${movie.poster_path}`
                      : "https://via.placeholder.com/300x450"
                  }
                  alt={movie.title}
                  className="desktop-watchlist-poster"
                />
                <button
                  className="remove-btn"
                  onClick={() => handleRemoveFromWatchlist(movie.id)}
                >
                  ×
                </button>
              </div>
              <div className="desktop-watchlist-details">
                <h3 className="desktop-watchlist-title">{movie.title}</h3>
                <p className="desktop-watchlist-year">{movie.release_date?.split("-")[0]}</p>
                <button
                  className="view-details-btn"
                  onClick={() => navigate(`/movie/${movie.movieId}`)}
                >
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </Container>
  );
};

export default Watchlist;