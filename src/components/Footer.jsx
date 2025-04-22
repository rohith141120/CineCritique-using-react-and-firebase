import React from "react";
import { Container, Row, Col } from "react-bootstrap";
import { FaTwitter, FaFacebookF, FaInstagram, FaYoutube, FaTiktok } from "react-icons/fa";
import "../styles/Footer.css";

const Footer = () => {
  return (
    <footer className="footer">
      <Container>
        <Row className="justify-content-between align-items-center">
          <Col md={8} className="footer-links">
            <a href="/about">About</a>
            <a href="/news">News</a>
            <a href="/pro">Pro</a>
            <a href="/apps">Apps</a>
            <a href="/podcast">Podcast</a>
            <a href="/year-in-review">Year In Review</a>
            <a href="/gift-guide">Gift Guide</a>
            <a href="/help">Help</a>
            <a href="/terms">Terms</a>
            <a href="/api">API</a>
            <a href="/contact">Contact</a>
          </Col>
          <Col md={4} className="footer-social text-md-end text-center">
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer">
              <FaTwitter />
            </a>
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer">
              <FaFacebookF />
            </a>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer">
              <FaInstagram />
            </a>
            <a href="https://youtube.com" target="_blank" rel="noopener noreferrer">
              <FaYoutube />
            </a>
            <a href="https://tiktok.com" target="_blank" rel="noopener noreferrer">
              <FaTiktok />
            </a>
          </Col>
        </Row>
        <Row>
          <Col className="footer-copyright text-center">
            <p>
              © Clonnerboxd Limited. Made by JanalsCoding. Film data from TMDb. Inspired by Letterboxd
            </p>
          </Col>
        </Row>
      </Container>
    </footer>
  );
};

export default Footer;