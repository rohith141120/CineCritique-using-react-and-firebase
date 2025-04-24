import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { db } from "../firebase/firebase";
import { doc, getDoc, setDoc, collection, deleteDoc, getDocs, query } from "firebase/firestore";
import { useAuth } from "../components/contexts/AuthContext";
import MobileViewMovieDetails from "../components/MobileViewMovieDetails";
import DesktopViewMovieDetails from "../components/DesktopViewMovieDetails";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../styles/MovieDetails.css";
import { Modal, Button, Form } from "react-bootstrap";

const API_KEY = "your-tmdb-api-key";
const BASE_URL = "https://api.themoviedb.org/3";

const MovieDetails = () => {
  const { id } = useParams();
  const { currentUser } = useAuth();
  const [movie, setMovie] = useState(null);
  const [credits, setCredits] = useState(null);
  const [videos, setVideos] = useState([]);
  const [providers, setProviders] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userActions, setUserActions] = useState({
    liked: false,
    watched: false,
    watchlist: false,
    review: "",
    rating: 0,
  });
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 820);
  const [showListModal, setShowListModal] = useState(false);
  const [userLists, setUserLists] = useState([]);
  const [selectedList, setSelectedList] = useState("");
  const [newListName, setNewListName] = useState("");
  const [showTrailerModal, setShowTrailerModal] = useState(false);
  const [trailerKey, setTrailerKey] = useState("");

  const navigate = useNavigate();

  // Fetch movie details, credits, videos, and providers from TMDB
  useEffect(() => {
    const fetchMovieDetails = async () => {
      try {
        const [movieRes, creditsRes, videosRes, providersRes] = await Promise.all([
          fetch(`${BASE_URL}/movie/${id}?api_key=${API_KEY}&language=en-US`),
          fetch(`${BASE_URL}/movie/${id}/credits?api_key=${API_KEY}&language=en-US`),
          fetch(`${BASE_URL}/movie/${id}/videos?api_key=${API_KEY}&language=en-US`),
          fetch(`${BASE_URL}/movie/${id}/watch/providers?api_key=${API_KEY}`),
        ]);

        if (!movieRes.ok || !creditsRes.ok || !videosRes.ok || !providersRes.ok) {
          throw new Error("Failed to fetch movie details, videos, or providers");
        }

        const [movieData, creditsData, videosData, providersData] = await Promise.all([
          movieRes.json(),
          creditsRes.json(),
          videosRes.json(),
          providersRes.json(),
        ]);

        setMovie(movieData);
        setCredits(creditsData);
        setVideos(videosData.results);
        setProviders(providersData.results.US); // US providers, adjust as needed
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchMovieDetails();
  }, [id]);

  // Fetch user's actions (liked, watched, watchlist, review, rating) from Firestore
  useEffect(() => {
    const fetchUserActions = async () => {
      if (!currentUser || !currentUser.email) {
        console.log("User or user.email is missing:", currentUser);
        return;
      }

      try {
        // Fetch Liked Status
        const likedRef = query(collection(db, `users/${currentUser.email}/liked`));
        const likedSnapshot = await getDocs(likedRef);
        const likedMovies = likedSnapshot.docs.map((doc) => doc.id);
        const isLiked = likedMovies.includes(id);

        // Fetch Watched Status
        const watchedRef = query(collection(db, `users/${currentUser.email}/watched`));
        const watchedSnapshot = await getDocs(watchedRef);
        const watchedMovies = watchedSnapshot.docs.map((doc) => doc.id);
        const isWatched = watchedMovies.includes(id);

        // Fetch Watchlist Status
        const watchlistRef = query(collection(db, `users/${currentUser.email}/watchlist`));
        const watchlistSnapshot = await getDocs(watchlistRef);
        const watchlistMovies = watchlistSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        const isInWatchlist = watchlistMovies.some((movie) => movie.movieId === id);

        // Fetch Review and Rating
        const reviewsRef = collection(db, `users/${currentUser.email}/reviews`);
        const reviewDocRef = doc(reviewsRef, id);
        const reviewDoc = await getDoc(reviewDocRef);
        let review = "";
        let rating = 0;
        if (reviewDoc.exists()) {
          const reviewData = reviewDoc.data();
          review = reviewData.review || "";
          rating = reviewData.rating || 0;
        }

        // Update state with all user actions
        setUserActions({
          liked: isLiked,
          watched: isWatched,
          watchlist: isInWatchlist,
          review: review,
          rating: rating,
        });
      } catch (err) {
        console.error("Error fetching user actions:", err);
      }
    };

    fetchUserActions();
  }, [currentUser, id]);

  // Fetch user's lists for the "Add to List" modal
  useEffect(() => {
    const fetchUserLists = async () => {
      if (!currentUser || !showListModal) return;
      try {
        const listsQuery = query(collection(db, `users/${currentUser.email}/lists`));
        const querySnapshot = await getDocs(listsQuery);
        const userListsData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setUserLists(userListsData);
      } catch (error) {
        console.error("Error fetching lists:", error);
      }
    };
    fetchUserLists();
  }, [currentUser, showListModal]);

  // Handle user actions (liked, watched, watchlist, review, rating, list, trailer)
  const handleUserAction = async (action, value) => {
    if (!currentUser && action !== "trailer") {
      alert("Please log in to perform this action.");
      navigate("/signin");
      return;
    }

    try {
      if (action === "review" || action === "rating") {
        if (action === "review" && !value.trim()) {
          toast.error("Please write a review before submitting.");
          return;
        }

        const reviewRef = doc(collection(db, `users/${currentUser.email}/reviews`), id);
        await setDoc(
          reviewRef,
          {
            movieId: id,
            title: movie.title,
            poster_path: movie.poster_path,
            review: userActions.review,
            rating: userActions.rating,
            timestamp: new Date(),
          },
          { merge: true }
        );

        if (action === "review") {
          toast.success("Review submitted successfully!");
          // Keep the review in the textarea since we're showing it as the user's review
        } else {
          toast.success("Rating submitted successfully!");
        }
      } else if (action === "list") {
        setShowListModal(true);
      } else if (action === "trailer") {
        const trailer = videos.find((video) => video.type === "Trailer" && video.site === "YouTube");
        if (trailer) {
          setTrailerKey(trailer.key);
          setShowTrailerModal(true);
        } else {
          toast.info("No trailer available for this movie.");
        }
      } else if (action === "liked" || action === "watched" || action === "watchlist") {
        const collectionRef = collection(db, `users/${currentUser.email}/${action}`);
        const movieRef = doc(collectionRef, id);

        if (value) {
          // Add to the collection
          await setDoc(movieRef, {
            movieId: id,
            title: movie.title,
            poster_path: movie.poster_path,
            release_date: movie.release_date,
            timestamp: new Date(),
          });
          setUserActions((prev) => ({ ...prev, [action]: true }));
          toast.success(`Movie ${action === "liked" ? "liked" : action === "watched" ? "marked as watched" : "added to watchlist"} successfully!`);
        } else {
          // Remove from the collection
          await deleteDoc(movieRef);
          setUserActions((prev) => ({ ...prev, [action]: false }));
          toast.success(`Movie ${action === "liked" ? "unliked" : action === "watched" ? "unmarked as watched" : "removed from watchlist"} successfully!`);
        }
      }
    } catch (err) {
      console.error(`Error updating user action (${action}):`, err);
      toast.error("Failed to submit action. Please try again.");
    }
  };

  const handleRatingChange = (newRating) => {
    setUserActions((prev) => ({ ...prev, rating: newRating }));
    handleUserAction("rating", newRating);
  };

  const handleAddToList = async () => {
    if (!selectedList && !newListName) {
      toast.error("Please select a list or enter a new list name.");
      return;
    }

    try {
      if (selectedList) {
        const listRef = doc(db, `users/${currentUser.email}/lists`, selectedList);
        const listDoc = await getDoc(listRef);
        if (listDoc.exists()) {
          const listData = listDoc.data();
          const updatedMovies = [
            ...listData.movies,
            {
              id: movie.id,
              name: movie.title,
              year: movie.release_date?.split("-")[0] || "N/A",
              director: credits?.crew.find((person) => person.job === "Director")?.name || "N/A",
              poster: movie.poster_path ? `https://image.tmdb.org/t/p/w200${movie.poster_path}` : null,
            },
          ];
          await setDoc(listRef, { movies: updatedMovies }, { merge: true });
          toast.success(`Added to ${listData.name} successfully!`);
        }
      } else if (newListName) {
        const listId = Date.now().toString();
        const listRef = doc(db, `users/${currentUser.email}/lists`, listId);
        await setDoc(listRef, {
          name: newListName,
          description: "",
          isRanked: false,
          isPublic: true,
          movies: [
            {
              id: movie.id,
              name: movie.title,
              year: movie.release_date?.split("-")[0] || "N/A",
              director: credits?.crew.find((person) => person.job === "Director")?.name || "N/A",
              poster: movie.poster_path ? `https://image.tmdb.org/t/p/w200${movie.poster_path}` : null,
            },
          ],
          createdAt: new Date().toISOString(),
        });
        toast.success(`Created and added to ${newListName} successfully!`);
      }
      setShowListModal(false);
      setSelectedList("");
      setNewListName("");
    } catch (error) {
      console.error("Error adding to list:", error);
      toast.error("Failed to add to list. Please try again.");
    }
  };

  const handleReviewChange = (e) => {
    setUserActions((prev) => ({ ...prev, review: e.target.value }));
  };

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 820);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  if (loading) return <div className="loading">Loading movie details...</div>;
  if (error) return <div className="error">Error: {error}</div>;

  return (
    <>
      <ToastContainer position="bottom-right" autoClose={3000} />
      {isMobile ? (
        <MobileViewMovieDetails
          movie={movie}
          credits={credits}
          providers={providers}
          userActions={userActions}
          handleUserAction={handleUserAction}
          handleReviewChange={handleReviewChange}
          handleRatingChange={handleRatingChange}
        />
      ) : (
        <DesktopViewMovieDetails
          movie={movie}
          credits={credits}
          providers={providers}
          userActions={userActions}
          handleUserAction={handleUserAction}
          handleReviewChange={handleReviewChange}
          handleRatingChange={handleRatingChange}
        />
      )}
      <Modal show={showListModal} onHide={() => setShowListModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Add to List</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group>
              <Form.Label>Select an Existing List</Form.Label>
              <Form.Control
                as="select"
                value={selectedList}
                onChange={(e) => setSelectedList(e.target.value)}
              >
                <option value="">-- Select a list --</option>
                {userLists.map((list) => (
                  <option key={list.id} value={list.id}>{list.name}</option>
                ))}
              </Form.Control>
            </Form.Group>
            <Form.Group className="mt-3">
              <Form.Label>Or Create a New List</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter new list name"
                value={newListName}
                onChange={(e) => setNewListName(e.target.value)}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowListModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleAddToList}>
            Add to List
          </Button>
        </Modal.Footer>
      </Modal>
      <Modal show={showTrailerModal} onHide={() => setShowTrailerModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>{movie?.title} - Trailer</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {trailerKey && (
            <iframe
              width="100%"
              height="400"
              src={`https://www.youtube.com/embed/${trailerKey}`}
              title="Movie Trailer"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowTrailerModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default MovieDetails;
