import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../components/contexts/AuthContext";
import "../styles/Sidebar.css";

const Sidebar = ({ isOpen, toggleSidebar, handleSignOut, user }) => {
  const { userAvatar } = useAuth();

  return (
    <div className={`sidebar ${isOpen ? "open" : ""}`}>
      <button className="close-btn" onClick={toggleSidebar}>
        ×
      </button>

      {user && (
        <>
          <div className="sidebar-user">
            {userAvatar ? (
              <img src={userAvatar} alt="User Avatar" className="sidebar-avatar" />
            ) : (
              <div className="avatar">
                {user.displayName?.charAt(0).toUpperCase() || "U"}
              </div>
            )}
            <p>{user.displayName || "User"}</p>
          </div>

          <ul>
            <li>
              <Link to="/profile" onClick={toggleSidebar}>
                Profile
              </Link>
            </li>
            <li>
              <Link to="/films" onClick={toggleSidebar}>
                Films
              </Link>
            </li>
            <li>
              <Link to="/lists" onClick={toggleSidebar}>
                Lists
              </Link>
            </li>
            <li>
              <Link to="/reviews" onClick={toggleSidebar}>
                Reviews
              </Link>
            </li>
            <li>
              <Link to="/watchlist" onClick={toggleSidebar}>
                Watchlist
              </Link>
            </li>
            <li>
              <Link to="/members" className="members-link" onClick={toggleSidebar}>
                Members
              </Link>
            </li>
            <li>
              <button className="sign-out-btn" onClick={handleSignOut}>
                Sign Out
              </button>
            </li>
          </ul>
        </>
      )}
    </div>
  );
};

export default Sidebar;