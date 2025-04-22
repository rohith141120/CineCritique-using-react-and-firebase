import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../firebase/firebase";
import Sidebar from "./Sidebar";
import { FaBars, FaSearch } from "react-icons/fa";
import { useAuth } from "../components/contexts/AuthContext";
import "../styles/Navbar.css";

const Navbar = () => {
  const { currentUser, userAvatar } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [isUserSidebarOpen, setIsUserSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    setIsSidebarOpen(false);
    setIsUserSidebarOpen(false);
  }, [location]);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
    setIsUserSidebarOpen(false);
  };

  const toggleSearch = () => {
    setIsSearchOpen(!isSearchOpen);
    if (!isSearchOpen) setQuery("");
  };

  const toggleUserSidebar = () => {
    setIsUserSidebarOpen(!isUserSidebarOpen);
    setIsSidebarOpen(false);
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      setIsUserSidebarOpen(false);
      setIsSidebarOpen(false);
      navigate("/signin");
    } catch (error) {
      console.error("Sign-Out Error:", error.message);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query)}`);
      setIsSearchOpen(false);
      setQuery("");
    }
  };

  useEffect(() => {
    const handleResize = () => {
      const newIsMobile = window.innerWidth <= 768;
      setIsMobile(newIsMobile);
      if (newIsMobile) {
        setIsSidebarOpen(false);
        setIsUserSidebarOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <>
      <nav className="navbar">
        <div className="left-section">
          <Link to="/" className="logo">
            <img src={require("../assets/logo-nav.png")} alt="Logo" className="logo-img" />
          </Link>
        </div>

        {/* Desktop Search Bar */}
        {!isMobile && (
          <div className="center-section">
            <form className="desktop-search-form" onSubmit={handleSearch}>
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
          </div>
        )}

        {/* Desktop Right Section */}
        {!isMobile && (
          <div className="right-section">
            {currentUser ? (
              <div className="user-info" onClick={toggleUserSidebar}>
                {userAvatar ? (
                  <img src={userAvatar} alt="User Avatar" className="user-avatar" />
                ) : (
                  <div className="user-avatar default">
                    {currentUser?.displayName?.charAt(0).toUpperCase() || "U"}
                  </div>
                )}
                <span className="username">{currentUser.displayName || "User"}</span>
              </div>
            ) : (
              <Link to="/signin" className="btn btn-outline-light">
                Sign In
              </Link>
            )}
          </div>
        )}

        {/* Mobile View */}
        {isMobile && (
          <div className="mobile-icons">
            {currentUser ? (
              <>
                <FaSearch
                  className="search-icon"
                  onClick={toggleSearch}
                  aria-label="Toggle search"
                />
                <FaBars className="menu-icon" onClick={toggleSidebar} aria-label="Open menu" />
              </>
            ) : (
              <>
                <FaSearch
                  className="search-icon"
                  onClick={toggleSearch}
                  aria-label="Toggle search"
                />
                <FaBars className="menu-icon" onClick={toggleSidebar} aria-label="Open menu" />
              </>
            )}
          </div>
        )}
      </nav>

      {/* Mobile Search Bar */}
      {isMobile && isSearchOpen && (
        <div className="search-bar">
          <form onSubmit={handleSearch}>
            <input
              type="text"
              placeholder="Search movies, actors, directors..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              autoFocus
            />
            <button type="submit" aria-label="Search">
              <FaSearch />
            </button>
          </form>
        </div>
      )}

      <Sidebar
        isOpen={isSidebarOpen}
        toggleSidebar={toggleSidebar}
        handleSignOut={handleSignOut}
        user={currentUser}
      />

      <div className={`user-sidebar ${isUserSidebarOpen ? "open" : ""}`}>
        <div className="sidebar-user">
          {userAvatar ? (
            <img src={userAvatar} alt="User Avatar" />
          ) : (
            <div className="avatar-icon default">
              {currentUser?.displayName?.charAt(0).toUpperCase() || "U"}
            </div>
          )}
          <h4>{currentUser?.displayName || "User"}</h4>
        </div>
        <ul>
          <li><Link to="/profile">Profile</Link></li>
          <li><Link to="/films">Films</Link></li>
          <li><Link to="/lists">Lists</Link></li>
          <li><Link to="/reviews">Reviews</Link></li>
          <li><Link to="/watchlist">Watchlist</Link></li>
          <li><Link to="/members">Members</Link></li>
          {currentUser && <li><button onClick={handleSignOut}>Sign Out</button></li>}
        </ul>
      </div>
    </>
  );
};

export default Navbar;