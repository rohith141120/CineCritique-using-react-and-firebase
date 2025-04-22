// src/components/MobileViewFilm.jsx
import React from "react";
import "../styles/MobileViewFilm.css";

const MobileViewFilm = ({ movies, handleMovieClick }) => {
  return (
    <div className="mobile-movie-grid">
      {movies.map((movie) => (
        <div key={movie.id} className="mobile-movie-card" onClick={() => handleMovieClick(movie.id)}>
          <div className="mobile-film-image-container">
            <img
              src={
                movie.poster_path
                  ? `https://image.tmdb.org/t/p/w500/${movie.poster_path}`
                  : "https://via.placeholder.com/300x450"
              }
              alt={movie.title}
              className="mobile-film-poster"
            />
          </div>
          <div className="mobile-film-details">
            <h3 className="mobile-film-title">{movie.title}</h3>
            <p className="mobile-film-year">{movie.release_date?.split("-")[0]}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default MobileViewFilm;