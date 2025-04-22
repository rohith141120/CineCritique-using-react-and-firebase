import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Container, Row, Col } from "react-bootstrap";
import { FaFacebook, FaTwitter, FaInstagram, FaImdb, FaBirthdayCake, FaStar, FaFilm } from "react-icons/fa";
import { GiDeathSkull } from "react-icons/gi";
import { motion } from "framer-motion";
import "../styles/Cast.css";

const API_KEY = "64f3c8e0bda17ae6c7d84fab6cef88b1";
const BASE_URL = "https://api.themoviedb.org/3";

const Cast = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [castData, setCastData] = useState(null);
  const [creditsLoading, setCreditsLoading] = useState(true);
  const [creditsError, setCreditsError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [castResponse, creditsResponse, externalIdsResponse] = await Promise.all([
          fetch(`${BASE_URL}/person/${id}?api_key=${API_KEY}&language=en-US`),
          fetch(`${BASE_URL}/person/${id}/movie_credits?api_key=${API_KEY}&language=en-US`),
          fetch(`${BASE_URL}/person/${id}/external_ids?api_key=${API_KEY}`)
        ]);

        if (!castResponse.ok) throw new Error(`Failed to fetch cast details: ${castResponse.status}`);
        if (!creditsResponse.ok) throw new Error(`Failed to fetch cast credits: ${creditsResponse.status}`);
        if (!externalIdsResponse.ok) throw new Error(`Failed to fetch external IDs: ${externalIdsResponse.status}`);

        const [castData, creditsData, externalIds] = await Promise.all([
          castResponse.json(),
          creditsResponse.json(),
          externalIdsResponse.json()
        ]);

        setCastData({
          ...castData,
          credits: creditsData.cast.sort((a, b) => b.popularity - a.popularity),
          external_ids: externalIds
        });
      } catch (err) {
        setCreditsError(err.message);
      } finally {
        setCreditsLoading(false);
      }
    };

    fetchData();
  }, [id]);

  if (creditsLoading) return (
    <div className="loading-screen">
      <div className="spinner"></div>
      <p>Loading cast details...</p>
    </div>
  );
  
  if (creditsError) return (
    <div className="error-screen">
      <div className="error-icon">⚠️</div>
      <h3>Error loading content</h3>
      <p>{creditsError}</p>
      <button className="retry-btn" onClick={() => window.location.reload()}>Retry</button>
    </div>
  );
  
  if (!castData) return (
    <div className="no-data">
      <h3>No data available for this cast member</h3>
      <button className="back-btn" onClick={() => navigate(-1)}>Go Back</button>
    </div>
  );

  const formatDate = (dateString) => {
    if (!dateString) return "Unknown";
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  return (
    <div className="cast-page">
      {/* Hero Section */}
      <div className="cast-hero" style={{
        backgroundImage: castData.profile_path 
          ? `linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), url(https://image.tmdb.org/t/p/original${castData.profile_path})`
          : 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)'
      }}>
        <Container>
          <Row className="align-items-center">
            <Col lg={4} className="text-center">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="cast-image-container"
              >
                <img
                  src={
                    castData.profile_path
                      ? `https://image.tmdb.org/t/p/w500${castData.profile_path}`
                      : "https://via.placeholder.com/500x750?text=No+Image"
                  }
                  alt={castData.name}
                  className="cast-image"
                />
              </motion.div>
            </Col>
            <Col lg={8} className="cast-info">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <h1 className="cast-name">{castData.name}</h1>
                <div className="cast-meta">
                  {castData.birthday && (
                    <div className="meta-item">
                      <FaBirthdayCake className="meta-icon" />
                      <span>{formatDate(castData.birthday)}</span>
                      {castData.deathday && (
                        <>
                          <span className="meta-divider">—</span>
                          <GiDeathSkull className="meta-icon" />
                          <span>{formatDate(castData.deathday)}</span>
                        </>
                      )}
                    </div>
                  )}
                  {castData.place_of_birth && (
                    <div className="meta-item">
                      <span>{castData.place_of_birth}</span>
                    </div>
                  )}
                </div>
                
                <div className="social-links">
                  {castData.external_ids?.imdb_id && (
                    <a 
                      href={`https://www.imdb.com/name/${castData.external_ids.imdb_id}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="social-link"
                    >
                      <FaImdb />
                    </a>
                  )}
                  {castData.external_ids?.facebook_id && (
                    <a 
                      href={`https://facebook.com/${castData.external_ids.facebook_id}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="social-link"
                    >
                      <FaFacebook />
                    </a>
                  )}
                  {castData.external_ids?.twitter_id && (
                    <a 
                      href={`https://twitter.com/${castData.external_ids.twitter_id}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="social-link"
                    >
                      <FaTwitter />
                    </a>
                  )}
                  {castData.external_ids?.instagram_id && (
                    <a 
                      href={`https://instagram.com/${castData.external_ids.instagram_id}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="social-link"
                    >
                      <FaInstagram />
                    </a>
                  )}
                </div>
              </motion.div>
            </Col>
          </Row>
        </Container>
      </div>

      <Container className="cast-details">
        <Row>
          <Col lg={4} className="sidebar">
            <motion.div 
              className="sidebar-section"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <h3 className="sidebar-title">Personal Info</h3>
              <div className="info-item">
                <strong>Known For</strong>
                <span>{castData.known_for_department || 'Acting'}</span>
              </div>
              <div className="info-item">
                <strong>Credits</strong>
                <span>{castData.credits?.length || 0}</span>
              </div>
              {castData.gender && (
                <div className="info-item">
                  <strong>Gender</strong>
                  <span>{castData.gender === 1 ? 'Female' : 'Male'}</span>
                </div>
              )}
              {castData.popularity && (
                <div className="info-item">
                  <strong>Popularity</strong>
                  <span>
                    <FaStar className="star-icon" />
                    {castData.popularity.toFixed(1)}
                  </span>
                </div>
              )}
            </motion.div>
          </Col>

          <Col lg={8} className="main-content">
            {/* Biography Section */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="biography-section"
            >
              <h2 className="section-title">
                <FaFilm className="section-icon" />
                Biography
              </h2>
              <div className="biography-content">
                {castData.biography ? (
                  <>
                    <p>{castData.biography}</p>
                    <div className="source-note">
                      <small>Biography from TMDb, may not be complete.</small>
                    </div>
                  </>
                ) : (
                  <p className="no-bio">No biography available for {castData.name}.</p>
                )}
              </div>
            </motion.section>

            {/* Known For Section */}
            {castData.credits?.length > 0 && (
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="known-for-section"
              >
                <h2 className="section-title">
                  <FaStar className="section-icon" />
                  Known For
                </h2>
                <Row className="movie-grid">
                  {castData.credits.slice(0, 4).map((movie) => (
                    <Col key={movie.id} xs={6} sm={4} md={3} className="movie-col">
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="movie-card"
                        onClick={() => navigate(`/movie/${movie.id}`)}
                      >
                        <div className="movie-poster">
                          <img
                            src={
                              movie.poster_path
                                ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
                                : "https://via.placeholder.com/500x750?text=No+Poster"
                            }
                            alt={movie.title}
                            className="poster-image"
                          />
                          {movie.vote_average > 0 && (
                            <div className="movie-rating">
                              <FaStar className="rating-icon" />
                              <span>{movie.vote_average.toFixed(1)}</span>
                            </div>
                          )}
                        </div>
                        <div className="movie-info">
                          <h4 className="movie-title">{movie.title}</h4>
                          <p className="movie-year">
                            {movie.release_date ? new Date(movie.release_date).getFullYear() : 'N/A'}
                          </p>
                          <p className="movie-character">
                            {movie.character || 'Unknown role'}
                          </p>
                        </div>
                      </motion.div>
                    </Col>
                  ))}
                </Row>
              </motion.section>
            )}

            {/* All Credits Section */}
            {castData.credits?.length > 0 && (
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.5 }}
                className="all-credits-section"
              >
                <h2 className="section-title">
                  <FaFilm className="section-icon" />
                  Acting Credits ({castData.credits.length})
                </h2>
                <div className="credits-list">
                  {castData.credits.map((movie) => (
                    <motion.div
                      key={movie.id}
                      whileHover={{ x: 5 }}
                      className="credit-item"
                      onClick={() => navigate(`/movie/${movie.id}`)}
                    >
                      <div className="credit-year">
                        {movie.release_date ? new Date(movie.release_date).getFullYear() : 'N/A'}
                      </div>
                      <div className="credit-details">
                        <h4 className="credit-title">{movie.title}</h4>
                        <p className="credit-character">
                          as {movie.character || 'Unknown character'}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.section>
            )}
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default Cast;