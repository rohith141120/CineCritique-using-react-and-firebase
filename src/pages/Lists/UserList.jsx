import React, { useState, useEffect } from "react";
import { db } from "../../firebase/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { Container, Row, Col, Image, Button, Toast } from "react-bootstrap";
import { useParams, useNavigate } from "react-router-dom";
import axios from 'axios';
import "../../styles/UserList.css";

const UserList = ({ user }) => { // Changed from userId to user
  const { listId } = useParams();
  const [list, setList] = useState(null);
  const [movieQuery, setMovieQuery] = useState('');
  const [movieResults, setMovieResults] = useState([]);
  const [showToast, setShowToast] = useState(false);
  const navigate = useNavigate();

  const TMDB_API_KEY = 'your-tmdb-api-key';

  // Fetch list details from Firestore
  useEffect(() => {
    const fetchList = async () => {
      if (!user || !user.email || !listId) return;
      try {
        const listRef = doc(db, `users/${user.email}/lists`, listId);
        const listSnap = await getDoc(listRef);
        if (listSnap.exists()) {
          const data = listSnap.data();
          setList({
            id: listSnap.id,
            name: data.name || "Untitled List",
            description: data.description || "No description",
            movies: data.movies || [],
          });
        } else {
          setList({ id: listId, name: "List Not Found", description: "", movies: [] });
        }
      } catch (error) {
        console.error("Error fetching list:", error);
        setList({ id: listId, name: "Error Loading List", description: "", movies: [] });
      }
    };
    fetchList();
  }, [user, listId]);

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

  // Handle adding a movie to the list
  const handleAddMovie = async (movie) => {
    try {
      const updatedMovies = [...list.movies, movie];
      await updateDoc(doc(db, `users/${user.email}/lists`, listId), {
        movies: updatedMovies,
      });
      setList({ ...list, movies: updatedMovies });
      setShowToast(true);
    } catch (error) {
      console.error("Error adding movie:", error);
    }
  };

  // Handle removing a movie from the list
  const handleRemoveMovie = async (movieId) => {
    try {
      const updatedMovies = list.movies.filter((movie) => movie.id !== movieId);
      await updateDoc(doc(db, `users/${user.email}/lists`, listId), {
        movies: updatedMovies,
      });
      setList({ ...list, movies: updatedMovies });
      setShowToast(true);
    } catch (error) {
      console.error("Error removing movie:", error);
    }
  };

  // Handle clicking on a movie poster to navigate to MovieDetails
  const handleMovieClick = (movieId) => {
    navigate(`/movie/${movieId}`);
  };

  if (!user) {
    return (
      <Container className="letterboxd-dark p-4">
        <p className="text-white text-center fs-4">Please sign in to view this list.</p>
      </Container>
    );
  }

  if (!list) {
    return (
      <Container className="letterboxd-dark p-4">
        <p className="text-white text-center fs-4">Loading...</p>
      </Container>
    );
  }

  return (
    <Container className="letterboxd-dark p-4">
      <h1 className="mb-4 text-white text-center display-4 fw-bold animate__animated animate__fadeIn">{list.name}</h1>
      <p className="text-muted text-center fs-5 mb-4">{list.description}</p>
      <p className="text-muted text-center fs-6 mb-4">{list.movies.length} films</p>

      {/* Toast Notification */}
      <Toast
        onClose={() => setShowToast(false)}
        show={showToast}
        delay={2000}
        autohide
        className="toast-notification"
      >
        <Toast.Body>List updated successfully!</Toast.Body>
      </Toast>

      {/* Add Movie Section */}
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

      {/* Movie Search Results */}
      {movieResults.length > 0 && (
        <div className="movie-results mb-3">
          {movieResults.map(movie => (
            <div
              key={movie.id}
              className="movie-result d-flex align-items-center p-2 border-bottom"
              onClick={() => handleAddMovie(movie)}
              style={{ cursor: 'pointer' }}
            >
              {movie.poster && <img src={movie.poster} alt={movie.name} className="movie-poster me-2" />}
              <div>
                <strong>{movie.name}</strong> ({movie.year}) - Directed by {movie.director}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Movie List */}
      <Row className="g-3">
        {list.movies.map((movie, index) => (
          <Col xs={6} sm={4} md={3} lg={2} key={index}>
            <div className="movie-card-container animate__animated animate__fadeInUp">
              {movie.poster ? (
                <Image
                  src={movie.poster}
                  alt={movie.name}
                  className="movie-card-img"
                  style={{ width: "100%", height: "auto", cursor: "pointer" }}
                  onClick={() => handleMovieClick(movie.id)}
                />
              ) : (
                <div className="no-poster" onClick={() => handleMovieClick(movie.id)}>
                  No Poster
                </div>
              )}
              <div className="movie-card-overlay">
                <h5 className="fs-6 fw-bold">{movie.name}</h5>
                <p className="fs-7">{movie.year} | {movie.director}</p>
                <Button
                  variant="danger"
                  className="remove-btn"
                  onClick={() => handleRemoveMovie(movie.id)}
                >
                  Remove
                </Button>
              </div>
            </div>
          </Col>
        ))}
      </Row>
    </Container>
  );
};

export default UserList;
