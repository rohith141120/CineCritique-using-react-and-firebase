import React, { useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useNavigate,
  useLocation,
} from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "./firebase/firebase";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Profile from "./components/Profile";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import SignOut from "./pages/SignOut";
import ForgotPassword from "./pages/ForgotPassword"; // Ensure this path is correct
import Home from "./pages/Home";
import MovieDetails from "./pages/MovieDetails";
import Lists from "./pages/Lists/Lists";
import UserList from "./pages/Lists/UserList";
import CreateList from "./pages/Lists/CreateList";
import Members from "./pages/Members";
import PublicProfile from "./pages/PublicProfile";
import Reviews from "./pages/Reviews";
import SearchPage from "./pages/SearchPage";
import Watchlist from "./pages/Watchlist";
import Cast from "./pages/Cast";
import Films from "./pages/Films";
import { AuthProvider, useAuth } from "./components/contexts/AuthContext";

const AppContent = () => {
  const { currentUser, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handlePopState = () => {
      if (location.pathname === "/profile") {
        if (currentUser) {
          signOut(auth)
            .then(() => {
              navigate("/signin");
            })
            .catch((error) => console.error("Error signing out on back:", error));
        }
      }
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [location, currentUser, navigate]);

  if (loading) {
    return (
      <div
        style={{
          backgroundColor: "#1f2020",
          minHeight: "100vh",
          color: "#fff",
          textAlign: "center",
          padding: "20px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
        }}
      >
        Loading...
        <Footer />
      </div>
    );
  }

  return (
    <div
      style={{
        backgroundColor: "#1f2020",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Navbar />
      <div style={{ flex: "1 0 auto" }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/movie/:id" element={<MovieDetails />} />
          <Route path="/cast/:id" element={<Cast />} />
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/signout" element={<SignOut />} />
          <Route path="/forgotpassword" element={<ForgotPassword />} /> {/* Fixed route */}
          <Route
            path="/profile"
            element={
              currentUser ? (
                <Profile email={currentUser.email} />
              ) : (
                <div
                  style={{
                    backgroundColor: "#1f2020",
                    minHeight: "100vh",
                    color: "#fff",
                    textAlign: "center",
                    padding: "20px",
                  }}
                >
                  You must be logged in to view your profile.
                </div>
              )
            }
          />
          <Route path="/lists" element={<Lists user={currentUser} />} />
          <Route
            path="/userlists/:listId"
            element={<UserList user={currentUser} />}
          />
          <Route
            path="/create-list"
            element={<CreateList user={currentUser} />}
          />
          <Route path="/members" element={<Members />} />
          <Route path="/members/:userId" element={<PublicProfile />} />
          <Route path="/reviews" element={<Reviews />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/watchlist" element={<Watchlist />} />
          <Route path="/films" element={<Films />} />
          <Route
            path="*"
            element={
              <div
                style={{
                  backgroundColor: "#1f2020",
                  minHeight: "100vh",
                  color: "#fff",
                  textAlign: "center",
                  padding: "20px",
                }}
              >
                404 - Page Not Found
              </div>
            }
          />
        </Routes>
      </div>
      <Footer />
    </div>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
};

export default App;