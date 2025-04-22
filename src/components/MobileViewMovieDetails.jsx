import React from "react";
import { useNavigate } from "react-router-dom";
import "../styles/MobileViewMovieDetails.css";

const MobileViewMovieDetails = ({
  movie,
  credits,
  providers,
  userActions,
  handleUserAction,
  handleReviewChange,
  handleRatingChange,
}) => {
  const navigate = useNavigate();
  const director = credits?.crew.find((person) => person.job === "Director");
  const topCast = credits?.cast.slice(0, 8) || [];

  const renderStars = () => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span
          key={i}
          className={`star ${i <= userActions.rating ? "filled" : ""}`}
          onClick={() => handleRatingChange(i)}
        >
          ★
        </span>
      );
    }
    return stars;
  };

  return (
    <div className="mobile-movie-details">
      <div
        className="mobile-backdrop"
        style={{
          backgroundImage: movie?.backdrop_path
            ? `url(https://image.tmdb.org/t/p/original${movie.backdrop_path})`
            : "none",
        }}
      >
        <div className="mobile-poster-container">
          <img
            src={
              movie?.poster_path
                ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
                : "https://via.placeholder.com/200x300"
            }
            alt={movie?.title || "Movie Poster"}
            className="mobile-poster"
          />
        </div>
      </div>

      <div className="mobile-movie-info">
        <h1 className="mobile-movie-title">{movie?.title || "Untitled"}</h1>
        <p className="mobile-release-year">
          {movie?.release_date
            ? `${new Date(movie.release_date).getFullYear()} • Directed by `
            : "Directed by "}
          {director?.name || "Unknown"}
        </p>
        <p className="mobile-overview">{movie?.overview || "No overview available"}</p>

        <div className="mobile-user-actions">
          <button
            className={`mobile-action-button ${userActions.liked ? "active" : ""}`}
            onClick={() => handleUserAction("liked", !userActions.liked)}
          >
            {userActions.liked ? "❤️ Liked" : "🤍 Like"}
          </button>
          <button
            className={`mobile-action-button ${userActions.watched ? "active" : ""}`}
            onClick={() => handleUserAction("watched", !userActions.watched)}
          >
            {userActions.watched ? "✅ Watched" : "👁️ Watch"}
          </button>
          <button
            className={`mobile-action-button ${userActions.watchlist ? "active" : ""}`}
            onClick={() => handleUserAction("watchlist", !userActions.watchlist)}
          >
            {userActions.watchlist ? "📚 In Watchlist" : "➕ Watchlist"}
          </button>
          <button
            className="mobile-action-button"
            onClick={() => handleUserAction("list", true)}
          >
            📋 List
          </button>
          <button
            className="mobile-action-button"
            onClick={() => handleUserAction("trailer", true)}
          >
            🎥 Trailer
          </button>
        </div>

        <div className="mobile-platforms-section">
          <h2 className="mobile-section-title">Available On</h2>
          <div className="mobile-platforms-list">
            {providers?.flatrate?.map((provider) => (
              <span key={provider.provider_id} className="mobile-platform-item">
                <img
                  src={`https://image.tmdb.org/t/p/w45${provider.logo_path}`}
                  alt={provider.provider_name}
                  title={provider.provider_name}
                />
              </span>
            )) || <span className="mobile-no-platforms">Not available on streaming platforms</span>}
          </div>
        </div>

        <div className="mobile-rating-section">
          <h2 className="mobile-section-title">Rate This Movie</h2>
          <div className="mobile-star-rating">{renderStars()}</div>
        </div>

        <div className="mobile-review-section">
          <h2 className="mobile-section-title">Your Review</h2>
          <textarea
            className="mobile-review-input"
            placeholder="Write your review..."
            value={userActions.review}
            onChange={handleReviewChange}
          />
          <button
            className="mobile-submit-review"
            onClick={() => handleUserAction("review", userActions.review)}
          >
            Submit Review
          </button>
        </div>

        {topCast.length > 0 && (
          <div className="mobile-cast-section">
            <h2 className="mobile-section-title">Cast</h2>
            <div className="mobile-cast-list">
              {topCast.map((actor) => (
                <div
                  key={actor.id}
                  className="mobile-cast-item"
                  onClick={() => navigate(`/cast/${actor.id}`)}
                  style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: "10px" }}
                >
                  <img
                    src={
                      actor.profile_path
                        ? `https://image.tmdb.org/t/p/w45${actor.profile_path}`
                        : "https://via.placeholder.com/45x45"
                    }
                    alt={actor.name}
                    className="mobile-cast-image"
                    style={{ borderRadius: "50%", width: "45px", height: "45px" }}
                  />
                  <span>{actor.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MobileViewMovieDetails;