// src/components/DesktopViewFilm.jsx
import React, { useState } from "react";
import "../styles/DesktopViewFilm.css";

const DesktopViewFilm = ({ movies, handleMovieClick }) => {
  const [hoveredMovie, setHoveredMovie] = useState(null);

  return (
    <div className="desktop-movie-grid">
      {movies.map((movie) => (
        <div
          key={movie.id}
          className={`desktop-movie-card ${hoveredMovie === movie.id ? "hovered" : ""}`}
          onMouseEnter={() => setHoveredMovie(movie.id)}
          onMouseLeave={() => setHoveredMovie(null)}
          onClick={() => handleMovieClick(movie.id)}
        >
          <div className="desktop-film-image-container">
            <img
              src={
                movie.poster_path
                  ? `https://image.tmdb.org/t/p/w500/${movie.poster_path}`
                  : "https://via.placeholder.com/300x450"
              }
              alt={movie.title}
              className="desktop-film-poster"
            />
          </div>
          {hoveredMovie === movie.id && (
            <div className="desktop-film-details">
              <h3 className="desktop-film-title">{movie.title}</h3>
              <p className="desktop-film-runtime">{movie.runtime} mins</p>
              <p className="desktop-film-year">{movie.release_date?.split("-")[0]}</p>
              <p className="desktop-film-platform">Available on: Netflix, Prime</p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default DesktopViewFilm;