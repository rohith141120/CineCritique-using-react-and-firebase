import React, { useEffect, useState } from "react";
import { db } from "../firebase/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import { useAuth } from "../components/contexts/AuthContext";
import { useNavigate } from "react-router-dom"; // Import useNavigate for redirection
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../styles/Reviews.css";

const API_KEY = " Replace with your TMDB API key";
const BASE_URL = "https://api.themoviedb.org/3";

const Reviews = () => {
  const { currentUser } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate(); // Hook for navigation

  // Fetch reviews from Firestore
  useEffect(() => {
    const fetchReviews = async () => {
      if (!currentUser || !currentUser.email) {
        console.log("User or user.email is missing:", currentUser);
        setLoading(false);
        return;
      }
      try {
        const reviewsRef = collection(db, `users/${currentUser.email}/reviews`);
        const reviewsSnapshot = await getDocs(reviewsRef);

        const reviewsData = [];
        for (const doc of reviewsSnapshot.docs) {
          const review = doc.data();
          const movieDetails = await fetchMovieDetails(review.movieId); // Fetch movie details
          reviewsData.push({ ...review, id: doc.id, movieDetails });
        }

        setReviews(reviewsData);
      } catch (err) {
        console.error("Error fetching reviews:", err);
        setError("Failed to fetch reviews. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, [currentUser]);

  // Fetch movie details from TMDB API
  const fetchMovieDetails = async (movieId) => {
    try {
      const response = await fetch(`${BASE_URL}/movie/${movieId}?api_key=${API_KEY}&language=en-US`);
      if (!response.ok) {
        throw new Error("Failed to fetch movie details");
      }
      const data = await response.json();
      return data;
    } catch (err) {
      console.error("Error fetching movie details:", err);
      return null;
    }
  };

  // Handle click on movie card to redirect to movie details
  const handleCardClick = (movieId) => {
    if (movieId) {
      navigate(`/movie/${movieId}`);
    }
  };

  if (loading) return <div className="loading">Loading reviews...</div>;
  if (error) return <div className="error">Error: {error}</div>;

  return (
    <div className="reviews-page">
      <ToastContainer position="bottom-right" autoClose={3000} />
      <h1 className="text-center mb-4">Your Reviews</h1>
      {reviews.length === 0 ? (
        <p className="no-reviews text-center">You haven't reviewed any movies yet.</p>
      ) : (
        <div className="reviews-list">
          {reviews.map((review) => (
            <div
              key={review.id}
              className="review-card"
              onClick={() => handleCardClick(review.movieId)} // Redirect on card click
              style={{ cursor: "pointer" }} // Indicate clickable area
            >
              {review.movieDetails ? (
                <div className="review-card-content">
                  <div className="review-card-image">
                    <img
                      src={
                        review.movieDetails.poster_path
                          ? `https://image.tmdb.org/t/p/w300${review.movieDetails.poster_path}`
                          : "https://via.placeholder.com/300x450"
                      }
                      alt={review.movieDetails.title}
                      className="movie-poster"
                    />
                  </div>
                  <div className="review-card-details">
                    <h2 className="review-card-title">{review.movieDetails.title}</h2>
                    <p className="review-text">{review.review}</p>
                    <p className="review-date">
                      Reviewed on: {new Date(review.timestamp?.toDate()).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ) : (
                <p>Movie details not available.</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Reviews;
