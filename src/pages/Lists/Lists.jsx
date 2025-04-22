import React, { useState, useEffect } from "react";
import { db } from "../../firebase/firebase";
import { collection, getDocs, query, doc, deleteDoc } from "firebase/firestore";
import { Container, Row, Col, Card, Button, Image, Toast } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import "../../styles/Lists.css";

const Lists = ({ user }) => {
  const [lists, setLists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showToast, setShowToast] = useState(false);
  const navigate = useNavigate();

  // Fetch lists from Firestore
  useEffect(() => {
    const fetchLists = async () => {
      if (!user || !user.email) {
        console.log("User or user.email is missing:", user);
        setLoading(false);
        return;
      }
      console.log("Fetching lists for user:", user.email);
      try {
        setLoading(true);
        const listsQuery = query(collection(db, `users/${user.email}/lists`));
        const querySnapshot = await getDocs(listsQuery);
        const userLists = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        console.log("Fetched lists:", userLists);
        setLists(userLists);
      } catch (error) {
        console.error("Error fetching lists:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchLists();
  }, [user]);

  // Delete a list
  const handleDeleteList = async (listId) => {
    if (window.confirm("Are you sure you want to delete this list?")) {
      try {
        await deleteDoc(doc(db, `users/${user.email}/lists`, listId));
        setLists(lists.filter((list) => list.id !== listId));
        alert("List deleted successfully!");
      } catch (error) {
        console.error("Error deleting list:", error);
        alert("Failed to delete list.");
      }
    }
  };

  // Render loading state with a placeholder to prevent layout shift
  if (loading) {
    return (
      <Container className="letterboxd-dark p-4" style={{ minHeight: "80vh" }}>
        <h1 className="mb-4 text-white text-center display-4 fw-bold">Your Lists</h1>
        <Row className="g-3 mb-4">
          {[...Array(3)].map((_, index) => (
            <Col xs={12} sm={6} md={4} lg={3} key={index}>
              <Card className="bg-dark border-99aabb text-white h-100 shadow-md">
                <Card.Body className="p-0">
                  <Row className="g-2 p-2">
                    {[...Array(4)].map((_, i) => (
                      <Col xs={3} key={i}>
                        <div
                          style={{
                            width: "100%",
                            height: "60px",
                            backgroundColor: "#333",
                            borderRadius: "8px",
                          }}
                        />
                      </Col>
                    ))}
                  </Row>
                  <div className="p-3">
                    <div
                      style={{
                        width: "70%",
                        height: "20px",
                        backgroundColor: "#444",
                        marginBottom: "10px",
                      }}
                    />
                    <div
                      style={{
                        width: "40%",
                        height: "15px",
                        backgroundColor: "#555",
                        marginBottom: "10px",
                      }}
                    />
                    <div
                      style={{
                        width: "100%",
                        height: "40px",
                        backgroundColor: "#555",
                        marginBottom: "10px",
                      }}
                    />
                    <div className="d-flex gap-2">
                      <Button variant="primary" disabled>
                        View List
                      </Button>
                      <Button variant="danger" disabled>
                        Delete List
                      </Button>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      </Container>
    );
  }

  // Render if no user
  if (!user) {
    return (
      <Container className="letterboxd-dark p-4" style={{ minHeight: "80vh" }}>
        <h1 className="mb-4 text-white text-center display-4 fw-bold">Your Lists</h1>
        <p className="text-muted fs-4 mb-3 text-center">
          Please sign in to view your lists.
        </p>
      </Container>
    );
  }

  return (
    <Container className="letterboxd-dark p-4" style={{ minHeight: "80vh" }}>
      <h1 className="mb-4 text-white text-center display-4 fw-bold">Your Lists</h1>

      {/* Toast Notification with fixed positioning */}
      <Toast
        onClose={() => setShowToast(false)}
        show={showToast}
        delay={3000}
        autohide
        className="toast-notification"
        style={{
          position: "fixed",
          top: "20px",
          right: "20px",
          zIndex: 1000,
        }}
      >
        <Toast.Body>List created successfully!</Toast.Body>
      </Toast>

      {lists.length === 0 ? (
        <div className="text-center mb-4">
          <p className="text-muted fs-4 mb-3">You have no lists yet.</p>
          <Button
            variant="success"
            onClick={() => navigate("/create-list")}
            className="create-list-btn py-2 px-3 fs-5"
          >
            Create New List
          </Button>
        </div>
      ) : (
        <>
          <Row className="g-3 mb-4">
            {lists.map((list) => (
              <Col xs={12} sm={6} md={4} lg={3} key={list.id}>
                <Card className="bg-dark border-99aabb text-white h-100 shadow-md hover-shadow">
                  <Card.Body className="p-0">
                    <Row className="g-2 p-2">
                      {list.movies.slice(0, 4).map((movie, index) => (
                        <Col xs={3} key={index} className="position-relative">
                          <div className="movie-card-container">
                            {movie.poster && (
                              <Image
                                src={movie.poster}
                                alt={movie.name || "Movie Poster"}
                                className="movie-card-img"
                                style={{
                                  width: "100%",
                                  height: "auto",
                                  objectFit: "cover",
                                  borderRadius: "8px",
                                }}
                              />
                            )}
                          </div>
                        </Col>
                      ))}
                    </Row>
                    <div className="p-3">
                      <Card.Title className="text-white mb-2 fs-4 fw-bold">
                        {list.name}
                      </Card.Title>
                      <p className="text-muted mb-2 fs-6">
                        {list.movies.length} films
                      </p>
                      <p className="text-white fs-6">
                        {list.description || "No description"}
                      </p>
                      <div className="d-flex gap-2">
                        <Button
                          variant="primary"
                          className="view-list-btn"
                          onClick={() => navigate(`/userlists/${list.id}`)}
                        >
                          View List
                        </Button>
                        <Button
                          variant="danger"
                          className="delete-list-btn"
                          onClick={() => handleDeleteList(list.id)}
                        >
                          Delete List
                        </Button>
                      </div>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
          <div className="text-center">
            <Button
              variant="success"
              onClick={() => navigate("/create-list")}
              className="create-list-btn py-2 px-3 fs-5"
            >
              Create New List
            </Button>
          </div>
        </>
      )}
    </Container>
  );
};

export default Lists;