import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { db, doc, setDoc } from '../../firebase/firebase';
import { useNavigate } from 'react-router-dom';
import { Toast, ToastContainer } from 'react-bootstrap';
import "../../styles/CreateList.css";

const CreateList = ({ user }) => {
  const [listName, setListName] = useState('');
  const [description, setDescription] = useState('');
  const [isRanked, setIsRanked] = useState(false);
  const [isPublic, setIsPublic] = useState(true);
  const [movieQuery, setMovieQuery] = useState('');
  const [movieResults, setMovieResults] = useState([]);
  const [selectedMovies, setSelectedMovies] = useState([]);
  const [viewMode, setViewMode] = useState('list');
  const [error, setError] = useState(null);
  const [showToast, setShowToast] = useState(false);
  const navigate = useNavigate();

  const TMDB_API_KEY = '64f3c8e0bda17ae6c7d84fab6cef88b1';

  // Fetch movie/series data from TMDB
  useEffect(() => {
    if (movieQuery.trim() === '') {
      setMovieResults([]);
      return;
    }

    const fetchMovies = async () => {
      try {
        const response = await axios.get(
          `https://api.themoviedb.org/3/search/multi?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(movieQuery)}`
        );
        const results = response.data.results
          .filter(item => item.media_type === 'movie' || item.media_type === 'tv')
          .map(async (item) => {
            const detailsResponse = await axios.get(
              `https://api.themoviedb.org/3/${item.media_type}/${item.id}?api_key=${TMDB_API_KEY}&append_to_response=credits`
            );
            const director = detailsResponse.data.credits.crew.find(
              (crew) => crew.job === 'Director'
            )?.name || 'N/A';

            return {
              id: item.id,
              name: item.title || item.name,
              year: item.release_date?.split('-')[0] || item.first_air_date?.split('-')[0] || 'N/A',
              director: director,
              poster: item.poster_path ? `https://image.tmdb.org/t/p/w200${item.poster_path}` : null,
            };
          });

        const resolvedResults = await Promise.all(results);
        setMovieResults(resolvedResults.slice(0, 5));
      } catch (error) {
        console.error('Error fetching movies:', error);
      }
    };

    fetchMovies();
  }, [movieQuery]);

  const handleAddMovie = (movie) => {
    setSelectedMovies(prev => [...prev, movie].sort((a, b) => 
      isRanked ? (prev.indexOf(a) - prev.indexOf(b)) : 0
    ));
    setMovieQuery('');
    setMovieResults([]);
  };

  const handleRemoveMovie = (movieId) => {
    setSelectedMovies(prev => prev.filter(movie => movie.id !== movieId));
  };

  const handleSaveList = async () => {
    if (!listName.trim()) {
      setError('List name is required.');
      return;
    }

    if (!user) {
      setError('You must be logged in to save a list.');
      return;
    }

    try {
      const userEmail = user.email; // Use email instead of UID
      const listId = Date.now().toString();

      const listData = {
        name: listName || "Untitled List", // Ensure no undefined values
        description: description || "", // Provide default empty string
        isRanked: isRanked || false,
        isPublic: isPublic || true,
        movies: selectedMovies.map(movie => ({
          id: movie.id,
          name: movie.name || "Unknown Title",
          year: movie.year || "N/A",
          director: movie.director || "N/A",
          poster: movie.poster || null,
        })),
        createdAt: new Date().toISOString(),
      };

      // Use user.email as the document ID in the users collection
      await setDoc(doc(db, `users/${userEmail}/lists/${listId}`), listData);

      setError(null);
      setShowToast(true);

      setTimeout(() => {
        navigate("/lists");
      }, 2000);
    } catch (error) {
      console.error('Error saving list:', error);
      setError(`Failed to save list: ${error.message}`);
    }
  };

  return (
    <div className="container mt-5 create-list-container">
      <h2>New List</h2>
      {error && <div className="alert alert-danger">{error}</div>}

      <ToastContainer className="position-fixed top-50 start-50 translate-middle">
        <Toast
          onClose={() => setShowToast(false)}
          show={showToast}
          delay={2000}
          autohide
          bg="success"
        >
          <Toast.Body className="text-center fw-bold">List was successfully created!</Toast.Body>
        </Toast>
      </ToastContainer>

      <div className="row">
        <div className="col-md-6 col-12">
          <div className="form-group mb-3">
            <label htmlFor="listName">Name</label>
            <input
              type="text"
              className="form-control"
              id="listName"
              value={listName}
              onChange={(e) => setListName(e.target.value)}
              placeholder="Enter list name"
            />
          </div>
        </div>
        <div className="col-md-6 col-12">
          <div className="form-group mb-3">
            <label htmlFor="description">Description</label>
            <textarea
              className="form-control"
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Share your thoughts and intentions for this list"
              rows="3"
            />
          </div>
        </div>
      </div>

      <div className="form-group mb-3">
        <label>
          <input
            type="checkbox"
            checked={isRanked}
            onChange={(e) => setIsRanked(e.target.checked)}
          />{' '}
          Ranked list
        </label>
        <small className="text-muted d-block">Show position for each film.</small>
      </div>

      <div className="form-group mb-3">
        <label>
          <input
            type="checkbox"
            checked={isPublic}
            onChange={(e) => setIsPublic(e.target.checked)}
          />{' '}
          Public list
        </label>
        <small className="text-muted d-block">Make this list visible to others.</small>
      </div>

      <div className="mb-3">
        <label htmlFor="movieInput">Add a Film</label>
        <input
          type="text"
          className="form-control"
          id="movieInput"
          placeholder="Enter name of film..."
          value={movieQuery}
          onChange={(e) => setMovieQuery(e.target.value)}
        />
      </div>

      {movieResults.length > 0 && (
        <div className="movie-results mb-3">
          {movieResults.map(movie => (
            <div
              key={movie.id}
              className="movie-result"
              onClick={() => handleAddMovie(movie)}
            >
              {movie.poster && (
                <img
                  src={movie.poster}
                  alt={movie.name}
                  className="movie-result-poster"
                />
              )}
              <div className="movie-details">
                <strong>{movie.name}</strong> ({movie.year}) - Directed by {movie.director}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mb-3">
        <button
          className={`btn ${viewMode === 'list' ? 'btn-primary' : 'btn-outline-primary'} me-2`}
          onClick={() => setViewMode('list')}
        >
          List View
        </button>
        <button
          className={`btn ${viewMode === 'poster' ? 'btn-primary' : 'btn-outline-primary'}`}
          onClick={() => setViewMode('poster')}
        >
          Poster View
        </button>
      </div>

      <div className="movie-list">
        {selectedMovies.length === 0 ? (
          <div className="empty-list text-center p-4">
            Your list is empty.
          </div>
        ) : (
          <div className={viewMode === 'list' ? 'list-view' : 'poster-view'}>
            {selectedMovies.map((movie, index) => (
              viewMode === 'list' ? (
                <div key={movie.id} className="movie-item">
                  {movie.poster && (
                    <img
                      src={movie.poster}
                      alt={movie.name}
                      className="movie-poster"
                    />
                  )}
                  <div className="movie-details">
                    <strong>{movie.name}</strong> ({movie.year})
                    <p className="director-name">Directed by {movie.director}</p>
                  </div>
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => handleRemoveMovie(movie.id)}
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <div key={movie.id} className="poster-item">
                  {movie.poster ? (
                    <img
                      src={movie.poster}
                      alt={movie.name}
                      className="poster-img"
                    />
                  ) : (
                    <div className="no-poster">No Poster Available</div>
                  )}
                  <div className="poster-overlay">
                    <div className="movie-info">
                      <strong>{movie.name}</strong> ({movie.year})
                    </div>
                    <button
                      className="remove-btn"
                      onClick={() => handleRemoveMovie(movie.id)}
                    >
                      ✕
                    </button>
                  </div>
                </div>
              )
            ))}
          </div>
        )}
      </div>

      <div className="d-flex justify-content-end mt-3">
        <button className="btn btn-secondary me-2">Cancel</button>
        <button className="btn btn-success" onClick={handleSaveList}>Save</button>
      </div>
    </div>
  );
};

export default CreateList;