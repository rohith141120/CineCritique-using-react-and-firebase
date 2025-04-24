import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Films.css";
import MobileViewFilm from "../components/MobileViewFilm";
import DesktopViewFilm from "../components/DesktopViewFilm";

const Films = () => {
  const [movies, setMovies] = useState([]);
  const [genres, setGenres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPlatform, setSelectedPlatform] = useState("all");
  const [selectedYear, setSelectedYear] = useState("all");
  const [selectedGenre, setSelectedGenre] = useState("all");
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 820);

  const API_KEY = "your-tmdb-api-key";
  const BASE_URL = "https://api.themoviedb.org/3";
  const GENRES_URL = `${BASE_URL}/genre/movie/list?api_key=${API_KEY}&language=en-US`;

  const platformConfig = {
    all: "",
    netflix: 8,
    prime: 119,
    hbo: 384,
    hotstar: 307,
  };

  const yearOptions = [
    "all",
    "upcoming",
    ...Array.from({ length: 26 }, (_, i) => 2025 - i),
  ];

  const navigate = useNavigate();

  // Fetch movies and genres
  useEffect(() => {
    const fetchMoviesAndGenres = async () => {
      try {
        // Fetch genres
        const genresRes = await fetch(GENRES_URL);
        if (!genresRes.ok) throw new Error("Failed to fetch genres");
        const genresData = await genresRes.json();
        setGenres(genresData.genres);

        // Build API URL based on filters
        let url = `${BASE_URL}/discover/movie?api_key=${API_KEY}&language=en-US&sort_by=popularity.desc&page=1`;

        if (selectedPlatform !== "all") {
          const providerId = platformConfig[selectedPlatform];
          if (providerId) {
            url += `&with_watch_providers=${providerId}`;
          }
        }

        if (selectedYear !== "all") {
          if (selectedYear === "upcoming") {
            url = `${BASE_URL}/movie/upcoming?api_key=${API_KEY}&language=en-US®ion=US&page=1`;
          } else {
            url += `&primary_release_year=${selectedYear}`;
          }
        }

        if (selectedGenre !== "all") {
          url += `&with_genres=${selectedGenre}`;
        }

        // Fetch movies
        const moviesRes = await fetch(url);
        if (!moviesRes.ok) throw new Error("Failed to fetch movies");
        const moviesData = await moviesRes.json();
        setMovies(moviesData.results || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchMoviesAndGenres();
  }, [selectedPlatform, selectedYear, selectedGenre]);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 820);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Safe event handlers
  const handlePlatformChange = (platform) => {
    setSelectedPlatform(platform || "all");
  };

  const handleYearChange = (year) => {
    setSelectedYear(year || "all");
  };

  const handleGenreChange = (e) => {
    const genre = e?.target?.value || "all";
    setSelectedGenre(genre);
  };

  const handleMovieClick = (movieId) => {
    navigate(`/movie/${movieId}`);
  };

  const platformOptions = ["all", "netflix", "prime", "hbo", "hotstar"];

  return (
    <div className="films-container">
      <h2 className="films-title">Stream Movies</h2>

      {/* Filter Section */}
      <div className="filter-section">
        {/* Platform Filter */}
        <div className="filter-group">
          <h3 className="filter-label">Platform</h3>
          <div className="sub-filter-platform">
            {platformOptions.map((platform) => (
              <button
                key={platform}
                className={selectedPlatform === platform ? "active" : ""}
                onClick={() => handlePlatformChange(platform)}
              >
                <img
                  src={`/icons/${platform}.svg`}
                  alt={platform}
                  className="platform-icon"
                />
                {platform === "all" ? "All Platforms" : platform.charAt(0).toUpperCase() + platform.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Year Filter */}
        <div className="filter-group">
          <h3 className="filter-label">Year</h3>
          <select
            className="year-select"
            value={selectedYear}
            onChange={(e) => handleYearChange(e.target.value)}
          >
            {yearOptions.map((year) => (
              <option key={year} value={year}>
                {year === "all" ? "All Years" : year === "upcoming" ? "Upcoming" : year}
              </option>
            ))}
          </select>
        </div>

        {/* Genre Filter */}
        <div className="filter-group">
          <h3 className="filter-label">Genre</h3>
          <select
            className="genre-select"
            value={selectedGenre}
            onChange={handleGenreChange}
          >
            <option value="all">All Genres</option>
            {genres.map((genre) => (
              <option key={genre.id} value={genre.id}>
                {genre.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Movies Display Section */}
      {loading ? (
        <div className="loading-screen">
          <div className="loader"></div>
          <p>Finding perfect matches...</p>
        </div>
      ) : error ? (
        <div className="error-message">
          ⚠️ {error}
        </div>
      ) : movies.length === 0 ? (
        <div className="no-results">
          🎬 No movies found - Try different filters
        </div>
      ) : isMobile ? (
        <MobileViewFilm movies={movies} handleMovieClick={handleMovieClick} />
      ) : (
        <DesktopViewFilm movies={movies} handleMovieClick={handleMovieClick} />
      )}
    </div>
  );
};

export default Films;
