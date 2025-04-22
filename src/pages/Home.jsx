import React, { useState, useEffect } from "react";
import { Container, Row, Col } from "react-bootstrap";
import Slider from "react-slick";
import { useNavigate } from "react-router-dom";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import "../styles/Home.css";
import ranbir from "../assets/home/ranbir.jpg";
import { FiHeart, FiStar, FiEye, FiEdit, FiCalendar, FiList } from "react-icons/fi";

const API_KEY = "64f3c8e0bda17ae6c7d84fab6cef88b1";
const BASE_URL = "https://api.themoviedb.org/3";

const Home = () => {
  const [popularMovies, setPopularMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPopularMovies = async () => {
      try {
        const response = await fetch(
          `${BASE_URL}/movie/popular?api_key=${API_KEY}&language=en-US&page=1`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch popular movies");
        }
        const data = await response.json();
        setPopularMovies(data.results);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPopularMovies();
  }, []);

  const carouselSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 5,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
    responsive: [
      {
        breakpoint: 1200,
        settings: {
          slidesToShow: 4,
          slidesToScroll: 1,
        },
      },
      {
        breakpoint: 900,
        settings: {
          slidesToShow: 3,
          slidesToScroll: 1,
        },
      },
      {
        breakpoint: 600,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1,
        },
      },
      {
        breakpoint: 400,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
        },
      },
    ],
  };

  if (loading) return (
    <div className="loading-screen">
      <div className="spinner"></div>
      <p>Loading popular movies...</p>
    </div>
  );
  
  if (error) return (
    <div className="error-screen">
      <div className="error-icon">⚠️</div>
      <h3>Error loading content</h3>
      <p>{error}</p>
      <button className="retry-btn" onClick={() => window.location.reload()}>Retry</button>
    </div>
  );

  return (
    <div className="letterboxd-premium">
      {/* Hero Section with Ranbir Image */}
      <div className="hero-section">
        <div className="hero-overlay"></div>
        <img src={ranbir} alt="Ranbir" className="hero-image" />
        <div className="hero-content">
          <h1>Welcome to CINE CRITIQUE</h1>
          <p>Your personal movie diary and social network for film lovers</p>
        </div>
      </div>

      <Container className="main-content">
        {/* Feature Tiles Section */}
        <section className="features-section">
          <h2 className="section-title">CINE CRITIQUE LETS YOU...</h2>
          <Row className="feature-tiles">
            {[
              { icon: <FiEye size={32} />, text: "Keep track of every film you've ever watched (or just start from the day you join)" },
              { icon: <FiHeart size={32} />, text: "Show some love for your favorite films, lists and reviews with a 'like'" },
              { icon: <FiEdit size={32} />, text: "Write and share reviews, and follow friends and other members to read theirs" },
              { icon: <FiStar size={32} />, text: "Rate each film on a five-star scale (with halves) to record and share your reaction" },
              { icon: <FiCalendar size={32} />, text: "Keep a diary of your film watching (and upgrade to PRO for comprehensive stats)" },
              { icon: <FiList size={32} />, text: "Compile and share lists of films on any topic and keep a watchlist of films to see" },
            ].map((tile, index) => (
              <Col key={index} lg={4} md={6} className="mb-4">
                <div className="feature-tile">
                  <div className="tile-icon">{tile.icon}</div>
                  <p className="tile-text">{tile.text}</p>
                </div>
              </Col>
            ))}
          </Row>
        </section>

        {/* Popular Movies Carousel */}
        <section className="carousel-section">
          <div className="section-header">
            <h2 className="section-title">Popular Movies</h2>
            <button className="view-all-btn" onClick={() => navigate('/movies')}>View All</button>
          </div>
          
          {popularMovies.length > 0 ? (
            <Slider {...carouselSettings}>
              {popularMovies.map((movie) => (
                <div key={movie.id} className="carousel-item">
                  <div className="movie-card" onClick={() => navigate(`/movie/${movie.id}`)}>
                    <div className="movie-poster">
                      <img
                        src={
                          movie.poster_path
                            ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
                            : "https://via.placeholder.com/500x750"
                        }
                        alt={movie.title}
                        className="poster-image"
                      />
                      <div className="movie-overlay">
                        <div className="movie-rating">
                          <FiStar className="star-icon" />
                          <span>{movie.vote_average.toFixed(1)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="movie-info">
                      <h3 className="movie-title">{movie.title}</h3>
                      <p className="movie-date">{new Date(movie.release_date).getFullYear()}</p>
                    </div>
                  </div>
                </div>
              ))}
            </Slider>
          ) : (
            <div className="no-movies">
              <p>No popular movies available at the moment.</p>
            </div>
          )}
        </section>
      </Container>
    </div>
  );
};

export default Home;