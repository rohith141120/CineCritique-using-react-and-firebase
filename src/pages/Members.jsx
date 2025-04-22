import React, { useEffect, useState } from "react";
import { db } from "../firebase/firebase";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { Link } from "react-router-dom";
import { FaSearch, FaUserFriends } from "react-icons/fa";
import "../styles/Members.css";

const Members = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const usersQuery = query(collection(db, "users"), orderBy("username"));
        const usersSnapshot = await getDocs(usersQuery);

        const usersData = usersSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data()
        }));
        
        setUsers(usersData);
        setFilteredUsers(usersData);
      } catch (err) {
        setError("Failed to fetch users");
        console.error("Error fetching users:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  useEffect(() => {
    if (searchTerm) {
      const filtered = users.filter(user =>
        user.username.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredUsers(filtered);
    } else {
      setFilteredUsers(users);
    }
  }, [searchTerm, users]);

  if (loading) return (
    <div className="loading-screen">
      <div className="spinner"></div>
      <p>Loading community members...</p>
    </div>
  );

  if (error) return (
    <div className="error-screen">
      <div className="error-icon">⚠️</div>
      <h3>Error loading members</h3>
      <p>{error}</p>
      <button className="retry-btn" onClick={() => window.location.reload()}>Try Again</button>
    </div>
  );

  return (
    <div className="members-container">
      <div className="members-header">
        <h1>
          <FaUserFriends className="header-icon" />
          Community Members
        </h1>
        <p className="subtitle">Connect with fellow film enthusiasts</p>
        
        <div className="search-container">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search members..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
      </div>

      {filteredUsers.length === 0 ? (
        <div className="no-results">
          <p>No members found matching your search</p>
        </div>
      ) : (
        <div className="members-grid">
          {filteredUsers.map((user) => (
            <Link to={`/members/${user.id}`} key={user.id} className="member-card">
              <div className="avatar-container">
                {user.avatar ? (
                  <img src={user.avatar} alt={`${user.username}'s avatar`} className="avatar" />
                ) : (
                  <div className="avatar default">
                    {user.username?.charAt(0).toUpperCase() || "U"}
                  </div>
                )}
              </div>
              
              <div className="member-info">
                <h3>{user.username || "Anonymous"}</h3>
                <p className="bio">{user.bio || "Film enthusiast"}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default Members;