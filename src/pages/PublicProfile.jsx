import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { db } from "../firebase/firebase";
import { doc, onSnapshot, collection } from "firebase/firestore";
import "../styles/PublicProfile.css";

const PublicProfile = () => {
  const { userId } = useParams();
  const [userData, setUserData] = useState({});
  const [activities, setActivities] = useState({
    liked: [],
    watched: [],
    reviews: [],
    lists: [],
  });
  const [selectedList, setSelectedList] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let unsubscribeUser = null;
    let unsubscribeLiked = null;
    let unsubscribeWatched = null;
    let unsubscribeReviews = null;
    let unsubscribeLists = null;

    const fetchData = async () => {
      try {
        setLoading(true);

        unsubscribeUser = onSnapshot(doc(db, "users", userId), (userDoc) => {
          if (!userDoc.exists()) {
            throw new Error("User not found");
          }
          setUserData(userDoc.data());
        }, (err) => {
          setError(err.message);
          console.error("Error fetching user data:", err);
        });

        unsubscribeLiked = onSnapshot(collection(db, `users/${userId}/liked`), (snap) => {
          const likedData = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
          setActivities((prev) => ({ ...prev, liked: likedData }));
        });

        unsubscribeWatched = onSnapshot(collection(db, `users/${userId}/watched`), (snap) => {
          const watchedData = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
          setActivities((prev) => ({ ...prev, watched: watchedData }));
        });

        unsubscribeReviews = onSnapshot(collection(db, `users/${userId}/reviews`), (snap) => {
          const reviewsData = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
          setActivities((prev) => ({ ...prev, reviews: reviewsData }));
        });

        unsubscribeLists = onSnapshot(collection(db, `users/${userId}/lists`), (snap) => {
          const listsData = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
          setActivities((prev) => ({ ...prev, lists: listsData }));
        }, (err) => {
          console.error("Error fetching lists:", err);
          setError("Failed to fetch lists: " + err.message);
        });
      } catch (err) {
        setError(err.message);
        console.error("Error setting up listeners:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    return () => {
      if (unsubscribeUser) unsubscribeUser();
      if (unsubscribeLiked) unsubscribeLiked();
      if (unsubscribeWatched) unsubscribeWatched();
      if (unsubscribeReviews) unsubscribeReviews();
      if (unsubscribeLists) unsubscribeLists();
    };
  }, [userId]);

  const handleListClick = (list) => {
    setSelectedList(list);
  };

  const handleBackToLists = () => {
    setSelectedList(null);
  };

  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="public-profile">
      {/* Compact Header */}
      <div className="compact-header">
        <div className="avatar-large">
          {userData.username?.charAt(0).toUpperCase() || "U"}
        </div>
        <div className="header-info">
          <h1>{userData.username || "Anonymous"}</h1>
          <p className="bio">{userData.bio || "No bio available"}</p>
        </div>
      </div>

      <div className="activities-container">
        {/* Liked Movies */}
        <div className="activity-section">
          <h2>Liked Movies ({activities.liked.length})</h2>
          <div className="activity-grid">
            {activities.liked.map((movie) => (
              <div key={movie.id} className="activity-card">
                <img
                  src={`https://image.tmdb.org/t/p/w200${movie.poster_path || ''}`}
                  alt={movie.title || "Movie Poster"}
                  className="activity-poster"
                  onError={(e) => (e.target.src = "https://via.placeholder.com/150?text=No+Image")}
                />
                <h3>{movie.title || "Untitled"}</h3>
              </div>
            ))}
          </div>
        </div>

        {/* Watched Movies */}
        <div className="activity-section">
          <h2>Watched Movies ({activities.watched.length})</h2>
          <div className="activity-grid">
            {activities.watched.map((movie) => (
              <div key={movie.id} className="activity-card">
                <img
                  src={`https://image.tmdb.org/t/p/w200${movie.poster_path || ''}`}
                  alt={movie.title || "Movie Poster"}
                  className="activity-poster"
                  onError={(e) => (e.target.src = "https://via.placeholder.com/150?text=No+Image")}
                />
                <h3>{movie.title || "Untitled"}</h3>
              </div>
            ))}
          </div>
        </div>

        {/* Reviews */}
        <div className="activity-section">
          <h2>Reviews ({activities.reviews.length})</h2>
          <div className="reviews-grid">
            {activities.reviews.map((review) => (
              <div key={review.id} className="review-card">
                <img
                  src={`https://image.tmdb.org/t/p/w200${review.poster_path || ''}`}
                  alt={review.title || "Movie Poster"}
                  className="review-poster"
                  onError={(e) => (e.target.src = "https://via.placeholder.com/150?text=No+Image")}
                />
                <div className="review-content">
                  <h3>{review.title || "Untitled"}</h3>
                  <p>{review.review || "No review available"}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Lists */}
        <div className="activity-section">
          <h2>Lists ({activities.lists.length})</h2>
          {selectedList ? (
            <div className="selected-list">
              <button onClick={handleBackToLists} className="back-button">
                Back to All Lists
              </button>
              <h3>{selectedList.name || selectedList.title || `List ${selectedList.id}`}</h3>
              {selectedList.movies && selectedList.movies.length > 0 ? (
                <div className="list-items-grid">
                  {selectedList.movies.map((movie, index) => (
                    <div key={index} className="list-item-card">
                      <img
                        src={movie.poster || "https://via.placeholder.com/150?text=No+Image"}
                        alt={movie.name || "Movie Poster"}
                        className="list-item-poster"
                        onError={(e) => (e.target.src = "https://via.placeholder.com/150?text=No+Image")}
                      />
                      <p>{movie.name || "Untitled"}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p>No movies in this list</p>
              )}
            </div>
          ) : (
            <div className="lists-grid">
              {activities.lists.length > 0 ? (
                activities.lists.map((list) => (
                  <div
                    key={list.id}
                    className="list-card"
                    onClick={() => handleListClick(list)}
                  >
                    <h3>{list.name || list.title || `List ${list.id}`}</h3>
                    <p>{list.movies ? `${list.movies.length} movies` : "No movies"}</p>
                  </div>
                ))
              ) : (
                <p>No lists available for this user</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PublicProfile;