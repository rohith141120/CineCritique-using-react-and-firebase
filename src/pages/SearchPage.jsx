import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { FaSearch } from "react-icons/fa";
import "../styles/SearchPage.css";

const SearchPage = () => {
  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showAllResults, setShowAllResults] = useState(false); // For "SHOW RESULTS FOR ALL" toggle
  const location = useLocation();
  const navigate = useNavigate(); // Hook for navigation

  // Fetch search results from TMDB API
  const fetchSearchResults = async (query) => {
    if (!query) {
      setSearchResults([]);
      return;
    }

    setIsLoading(true);
    const apiKey = "64f3c8e0bda17ae6c7d84fab6cef88b1"; // Replace with env variable in production
    const url = `https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&query=${query}${
      showAllResults ? "&include_adult=true" : ""
    }`;

    try {
      const response = await fetch(url);
      const data = await response.json();
      if (data.results && Array.isArray(data.results)) {
        // Fetch additional details for each movie (e.g., director, alternative titles)
        const detailedResults = await Promise.all(
          data.results.map(async (movie) => {
            const detailsUrl = `https://api.themoviedb.org/3/movie/${movie.id}?api_key=${apiKey}`;
            const creditsUrl = `https://api.themoviedb.org/3/movie/${movie.id}/credits?api_key=${apiKey}`;
            const altTitlesUrl = `https://api.themoviedb.org/3/movie/${movie.id}/alternative_titles?api_key=${apiKey}`;

            const [detailsResp, creditsResp, altTitlesResp] = await Promise.all([
              fetch(detailsUrl),
              fetch(creditsUrl),
              fetch(altTitlesUrl),
            ]);

            const details = await detailsResp.json();
            const credits = await creditsResp.json();
            const altTitles = await altTitlesResp.json();

            return {
              ...movie,
              director: credits.crew.find((person) => person.job === "Director")?.name || "Unknown",
              alternative_titles: altTitles.titles?.map((title) => title.title) || [],
            };
          })
        );
        setSearchResults(detailedResults);
      } else {
        setSearchResults([]);
      }
    } catch (error) {
      console.error("Error fetching search results:", error);
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle search input change
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const queryParam = searchParams.get("q");
    if (queryParam) {
      setQuery(queryParam);
      fetchSearchResults(queryParam);
    }
  }, [location.search, showAllResults]);

  // Handle search submission
  const handleSearch = (e) => {
    e.preventDefault();
    navigate(`/search?q=${query}`);
  };

  // Toggle "Show All Results" (including adult content)
  const toggleShowAllResults = () => {
    setShowAllResults(!showAllResults);
    fetchSearchResults(query); // Refetch with new setting
  };

  // Handle clicking on a movie poster
  const handleMovieClick = (movieId) => {
    navigate(`/movie/${movieId}`); // Navigate to the MovieDetails page
  };

  return (
    <div className="search-page">
      {/* Search Header */}
      <div className="search-header">
        <h2>SHOWING MATCHES FOR "{query}"</h2>
      </div>

      {/* Search Form with Toggle */}
      <div className="search-form-container">
        <form onSubmit={handleSearch} className="search-form">
          <input
            type="text"
            placeholder="Search movies, actors, directors..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button type="submit" aria-label="Search">
            <FaSearch />
          </button>
        </form>
        <div className="show-all-toggle">
          <a href="#" onClick={(e) => { e.preventDefault(); toggleShowAllResults(); }}>
            SHOW RESULTS FOR ALL
          </a>
        </div>
      </div>

      {/* Display Loading State */}
      {isLoading && <div className="loading">Loading...</div>}

      {/* Display Search Results */}
      {!isLoading && searchResults.length > 0 && (
        <div className="search-results">
          {searchResults.map((movie) => (
            <div
              key={movie.id}
              className="search-result-item"
              onClick={() => handleMovieClick(movie.id)} // Add click handler
              style={{ cursor: "pointer" }} // Change cursor to pointer
            >
              <img
                src={
                  movie.poster_path
                    ? `https://image.tmdb.org/t/p/w185/${movie.poster_path}`
                    : "https://via.placeholder.com/92x138"
                }
                alt={movie.title}
                onError={(e) => (e.target.src = "https://via.placeholder.com/92x138")}
              />
              <div className="movie-details">
                <h3>{movie.title} ({new Date(movie.release_date).getFullYear() || "N/A"})</h3>
                <p className="director">Directed by {movie.director}</p>
                {movie.alternative_titles && movie.alternative_titles.length > 0 && (
                  <p className="alternative-titles">
                    Alternative titles: {movie.alternative_titles.slice(0, 3).join(", ")}
                    {movie.alternative_titles.length > 3 ? " ...more" : ""}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Display No Results Message */}
      {!isLoading && query && searchResults.length === 0 && (
        <div className="no-results">No results found.</div>
      )}
    </div>
  );
};

export default SearchPage;