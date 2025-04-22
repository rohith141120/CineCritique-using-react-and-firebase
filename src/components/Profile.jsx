import React, { useState, useEffect } from "react";
import { db } from "../firebase/firebase";
import { doc, getDoc, setDoc, updateDoc, collection, getDocs } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../components/contexts/AuthContext";
import "../styles/Profile.css";

import avatar1 from "../assets/avatars/avatar1.jpg";
import avatar2 from "../assets/avatars/avatar2.jpg";
import avatar3 from "../assets/avatars/avatar3.jpg";
import avatar4 from "../assets/avatars/avatar4.jpg";
import avatar5 from "../assets/avatars/avatar5.jpeg";
import avatar6 from "../assets/avatars/avatar6.jpg";
import avatar7 from "../assets/avatars/avatar7.jpg";

const availableAvatars = [avatar1, avatar2, avatar3, avatar4, avatar5, avatar6, avatar7];

const Profile = () => {
  const { currentUser, loading: authLoading } = useAuth();
  const [userData, setUserData] = useState({
    username: "Anonymous",
    bio: "No bio yet",
    avatar: availableAvatars[0],
  });
  const [showEditForm, setShowEditForm] = useState(false);
  const [editUsername, setEditUsername] = useState("");
  const [editBio, setEditBio] = useState("");
  const [editAvatar, setEditAvatar] = useState(availableAvatars[0]);
  const [lists, setLists] = useState({
    liked: [],
    watched: [],
    watchlist: [],
    reviews: [],
    lists: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const userId = currentUser?.email;

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        if (!currentUser || !userId) {
          throw new Error("User not authenticated or email missing");
        }

        const emailRef = doc(db, "users", userId);
        const userDoc = await getDoc(emailRef);

        if (!userDoc.exists()) {
          const defaultData = {
            username: currentUser?.displayName || "Anonymous",
            bio: "No bio yet",
            avatar: availableAvatars[0],
            uid: currentUser?.uid,
            email: currentUser?.email,
          };
          await setDoc(emailRef, defaultData);
          setUserData(defaultData);
          setEditUsername(defaultData.username);
          setEditBio(defaultData.bio);
          setEditAvatar(defaultData.avatar);
        } else {
          const data = userDoc.data();
          const fetchedAvatar = availableAvatars.includes(data.avatar)
            ? data.avatar
            : availableAvatars[0];
          setUserData({
            username: data.username || currentUser?.displayName || "Anonymous",
            bio: data.bio || "No bio yet",
            avatar: fetchedAvatar,
          });
          setEditUsername(data.username || currentUser?.displayName || "Anonymous");
          setEditBio(data.bio || "No bio yet");
          setEditAvatar(fetchedAvatar);
        }

        const [likedSnap, watchedSnap, watchlistSnap, reviewsSnap, listsSnap] = await Promise.all([
          getDocs(collection(db, `users/${userId}/liked`)).catch(() => ({ docs: [] })),
          getDocs(collection(db, `users/${userId}/watched`)).catch(() => ({ docs: [] })),
          getDocs(collection(db, `users/${userId}/watchlist`)).catch(() => ({ docs: [] })),
          getDocs(collection(db, `users/${userId}/reviews`)).catch(() => ({ docs: [] })),
          getDocs(collection(db, `users/${userId}/lists`)).catch(() => ({ docs: [] })),
        ]);

        setLists({
          liked: likedSnap.docs.map((doc) => doc.data()),
          watched: watchedSnap.docs.map((doc) => doc.data()),
          watchlist: watchlistSnap.docs.map((doc) => doc.data()),
          reviews: reviewsSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() })),
          lists: listsSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() })),
        });
      } catch (err) {
        setError(err.message);
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    if (!authLoading && userId) {
      fetchData();
    }
  }, [userId, authLoading, currentUser]);

  const handleUpdateProfile = async () => {
    try {
      await updateDoc(doc(db, "users", userId), {
        username: editUsername,
        bio: editBio,
        avatar: editAvatar,
      });
      setUserData({ username: editUsername, bio: editBio, avatar: editAvatar });
      setShowEditForm(false);
    } catch (err) {
      setError("Failed to update profile");
      console.error("Update error:", err);
    }
  };

  const handleMovieClick = (movieId) => {
    navigate(`/movie/${movieId}`);
  };

  const handleListClick = (listId) => {
    navigate(`/userlists/${listId}`);
  };

  const renderMovieGrid = (movies, title) => {
    if (movies.length === 0) return <p className="no-content">No {title.toLowerCase()} yet.</p>;
    return (
      <div className="movie-grid">
        {movies.slice(0, 8).map((movie, index) => (
          <div key={index} className="movie-card" onClick={() => handleMovieClick(movie.movieId)}>
            <img
              src={`https://image.tmdb.org/t/p/w300${movie.poster_path}`}
              alt={movie.title || "Movie Poster"}
              className="movie-poster"
            />
            <div className="movie-overlay">
              <h3>{movie.title || "Untitled"}</h3>
              <p>{movie.release_date?.slice(0, 4) || "N/A"}</p>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderReviews = () => {
    if (lists.reviews.length === 0) {
      return (
        <div className="reviews-section">
          <h2>All Reviews (0)</h2>
          <p className="no-content">No reviews yet.</p>
        </div>
      );
    }
    return (
      <div className="reviews-section">
        <h2>All Reviews ({lists.reviews.length})</h2>
        <div className="reviews-grid">
          {lists.reviews.map((review, index) => (
            <div key={review.id || index} className="review-card" onClick={() => handleMovieClick(review.movieId)}>
              <img
                src={`https://image.tmdb.org/t/p/w200${review.poster_path}`}
                alt={review.title || "Review Poster"}
                className="review-poster"
              />
              <div className="review-content">
                <h3>{review.title || "Untitled"}</h3>
                <p><span className="label">By:</span> {userData.username || "Anonymous"}</p>
                <p><span className="label">Rating:</span> {review.rating ? `${review.rating} / 5` : "Not rated"}</p>
                <p><span className="label">Comment:</span> {review.review || "No comment"}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderLists = () => {
    if (lists.lists.length === 0) {
      return (
        <div className="lists-section">
          <h2>Your Lists (0)</h2>
          <p className="no-content">No lists yet.</p>
        </div>
      );
    }
    return (
      <div className="lists-section">
        <h2>Your Lists ({lists.lists.length})</h2>
        <div className="lists-grid">
          {lists.lists.slice(0, 4).map((list, index) => (
            <div key={list.id || index} className="list-card" onClick={() => handleListClick(list.id)}>
              <div className="list-content">
                <h3>{list.name || "Untitled List"}</h3>
                <p>{list.movies.length} movies</p>
              </div>
            </div>
          ))}
        </div>
        {lists.lists.length > 4 && (
          <button className="see-all" onClick={() => navigate("/lists")}>
            See All
          </button>
        )}
      </div>
    );
  };

  if (authLoading || loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="profile-container">
      <div className="profile-header">
        <div className="avatar-username">
          <img src={userData.avatar} alt="User Avatar" className="profile-avatar" />
          <div className="user-info">
            <h1>{userData.username}</h1>
            <span className="member-since">Member since {new Date(currentUser?.metadata?.creationTime).getFullYear()}</span>
          </div>
        </div>
        <button className="edit-button" onClick={() => setShowEditForm(!showEditForm)}>
          {showEditForm ? "Cancel" : "Edit Profile"}
        </button>
      </div>

      {showEditForm && (
        <div className="edit-form">
          <div className="avatar-selection">
            <h3>Select Avatar</h3>
            <div className="avatar-grid">
              {availableAvatars.map((avatar, index) => (
                <img
                  key={index}
                  src={avatar}
                  alt={`Avatar ${index + 1}`}
                  className={`avatar-option ${editAvatar === avatar ? "selected" : ""}`}
                  onClick={() => setEditAvatar(avatar)}
                />
              ))}
            </div>
          </div>
          <input
            type="text"
            value={editUsername}
            onChange={(e) => setEditUsername(e.target.value)}
            placeholder="Username"
          />
          <textarea
            value={editBio}
            onChange={(e) => setEditBio(e.target.value)}
            placeholder="Tell us about yourself..."
          />
          <button className="save-button" onClick={handleUpdateProfile}>
            Save Changes
          </button>
        </div>
      )}

      <div className="bio-section">
        <p>{userData.bio}</p>
      </div>

      <div className="sections-container">
        <div className="section">
          <div className="section-header">
            <h2>Liked Movies ({lists.liked.length})</h2>
            {lists.liked.length > 8 && (
              <button className="see-all" onClick={() => navigate("/liked")}>
                See All
              </button>
            )}
          </div>
          {renderMovieGrid(lists.liked, "Liked Movies")}
        </div>

        <div className="section">
          <div className="section-header">
            <h2>Watched ({lists.watched.length})</h2>
            {lists.watched.length > 8 && (
              <button className="see-all" onClick={() => navigate("/watched")}>
                See All
              </button>
            )}
          </div>
          {renderMovieGrid(lists.watched, "Watched")}
        </div>

        <div className="section">
          <div className="section-header">
            <h2>Watchlist ({lists.watchlist.length})</h2>
            {lists.watchlist.length > 8 && (
              <button className="see-all" onClick={() => navigate("/watchlist")}>
                See All
              </button>
            )}
          </div>
          {renderMovieGrid(lists.watchlist, "Watchlist")}
        </div>

        <div className="section">{renderReviews()}</div>
        <div className="section">{renderLists()}</div>
      </div>
    </div>
  );
};

export default Profile;