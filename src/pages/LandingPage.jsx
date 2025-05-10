import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Button } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGraduationCap, faChartLine, faUsers, faLaptopCode, faMobileAlt, faShieldAlt } from '@fortawesome/free-solid-svg-icons';
import './LandingPage.css';

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="landing-page">
      {/* Navigation */}
      <nav className="landing-nav">
        <Container>
          <div className="nav-content">
            <div className="logo">
              <span className="logo-icon">F</span>
              <span className="logo-text">FlowPi</span>
            </div>
            <div className="nav-buttons">
              <Button 
                variant="outline-light" 
                className="nav-btn"
                onClick={() => navigate('/login')}
              >
                Login
              </Button>
              <Button 
                variant="light" 
                className="nav-btn"
                onClick={() => navigate('/register')}
              >
                Register
              </Button>
            </div>
          </div>
        </Container>
      </nav>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-overlay"></div>
        <Container>
          <Row className="align-items-center">
            <Col lg={6} className="hero-content">
              <h1 className="hero-title">Transform Your Learning Experience</h1>
              <p className="hero-subtitle">
                FlowPi centralizes project management with AI-driven assessments and collaboration tools for students, tutors, and administrators.
              </p>
              <div className="hero-buttons">
                <Button 
                  variant="primary" 
                  size="lg" 
                  className="hero-btn"
                  onClick={() => navigate('/register')}
                >
                  Get Started
                </Button>
                <Button 
                  variant="outline-light" 
                  size="lg"
                  className="hero-btn"
                  onClick={() => navigate('/login')}
                >
                  Sign In
                </Button>
              </div>
            </Col>
            <Col lg={6} className="hero-image-container">
              <div className="hero-image">
                <img 
                  src="/assets/images/hero-illustration.png" 
                  alt="Learning Platform" 
                  onError={(e) => {
                    e.target.src = "https://cdn.pixabay.com/photo/2018/09/24/08/31/pixel-cells-3699334_1280.png";
                  }}
                />
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <Container>
          <div className="section-header">
            <h2 className="section-title">Powerful Features</h2>
            <p className="section-subtitle">Everything you need to succeed in your educational journey</p>
          </div>
          <Row className="features-grid">
            <Col lg={4} md={6} className="feature-card">
              <div className="feature-icon">
                <FontAwesomeIcon icon={faGraduationCap} />
              </div>
              <h3>Interactive Learning</h3>
              <p>Manage projects with AI-generated quizzes and tailored resources to boost student engagement.</p>
            </Col>
            <Col lg={4} md={6} className="feature-card">
              <div className="feature-icon">
                <FontAwesomeIcon icon={faChartLine} />
              </div>
              <h3>Progress Tracking</h3>
              <p>Track project milestones and contributions using real-time analytics and Git log integration.</p>
            </Col>
            <Col lg={4} md={6} className="feature-card">
              <div className="feature-icon">
                <FontAwesomeIcon icon={faUsers} />
              </div>
              <h3>Team Collaboration</h3>
              <p>Build teams based on skills with messaging and shared resources for effective group work.</p>
            </Col>
            <Col lg={4} md={6} className="feature-card">
              <div className="feature-icon">
                <FontAwesomeIcon icon={faLaptopCode} />
              </div>
              <h3>Smart Assignments</h3>
              <p>Distribute tasks and assess submissions with AI-powered grading and plagiarism checks.</p>
            </Col>
            <Col lg={4} md={6} className="feature-card">
              <div className="feature-icon">
                <FontAwesomeIcon icon={faMobileAlt} />
              </div>
              <h3>Mobile Friendly</h3>
              <p>Access dashboards and collaboration tools on any device for convenient project management.</p>
            </Col>
            <Col lg={4} md={6} className="feature-card">
              <div className="feature-icon">
                <FontAwesomeIcon icon={faShieldAlt} />
              </div>
              <h3>Secure Platform</h3>
              <p>Safeguard data with JWT authentication and encryption for academic integrity.</p>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Testimonials Section */}
      <section className="testimonials-section">
        <Container>
          <div className="section-header light">
            <h2 className="section-title">What Our Users Say</h2>
            <p className="section-subtitle">Join thousands of satisfied students and educators</p>
          </div>
          <Row className="testimonials-grid">
            <Col lg={4} md={6} className="testimonial-card">
              <div className="testimonial-content">
                <p>"FlowPi has completely transformed how I manage my courses. The intuitive interface and powerful features make teaching a joy."</p>
                <div className="testimonial-author">
                  <div className="author-info">
                    <h4>Sarah Johnson</h4>
                    <p>Professor, Computer Science</p>
                  </div>
                </div>
              </div>
            </Col>
            <Col lg={4} md={6} className="testimonial-card">
              <div className="testimonial-content">
                <p>"As a student, I love how FlowPi helps me stay organized. The progress tracking and team collaboration features are game-changers."</p>
                <div className="testimonial-author">
                  <div className="author-info">
                    <h4>Michael Chen</h4>
                    <p>Student, Engineering</p>
                  </div>
                </div>
              </div>
            </Col>
            <Col lg={4} md={6} className="testimonial-card">
              <div className="testimonial-content">
                <p>"Managing our institution's educational resources has never been easier. FlowPi provides all the tools we need in one platform."</p>
                <div className="testimonial-author">
                  <div className="author-info">
                    <h4>David Rodriguez</h4>
                    <p>Administrator, University of Technology</p>
                  </div>
                </div>
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Call to Action */}
      <section className="cta-section">
        <Container className="text-center">
          <div className="cta-content">
            <h2>Ready to Transform Your Learning Experience?</h2>
            <p>Join FlowPi today and discover a better way to learn, teach, and collaborate</p>
            <Button 
              variant="light" 
              size="lg" 
              className="cta-button"
              onClick={() => navigate('/register')}
            >
              Get Started for Free
            </Button>
          </div>
        </Container>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <Container>
          <Row>
            <Col lg={4} md={6}>
              <div className="footer-brand">
                <div className="logo">
                  <span className="logo-icon">F</span>
                  <span className="logo-text">FlowPi</span>
                </div>
                <p>A next-generation learning management system designed to enhance the educational experience for everyone.</p>
              </div>
            </Col>
            <Col lg={2} md={6}>
              <div className="footer-links">
                <h5>Platform</h5>
                <ul>
                  <li><a href="#features">Features</a></li>
                  <li><a href="#pricing">Pricing</a></li>
                  <li><a href="#faq">FAQ</a></li>
                </ul>
              </div>
            </Col>
            <Col lg={2} md={6}>
              <div className="footer-links">
                <h5>Company</h5>
                <ul>
                  <li><a href="#about">About Us</a></li>
                  <li><a href="#careers">Careers</a></li>
                  <li><a href="#contact">Contact</a></li>
                </ul>
              </div>
            </Col>
            <Col lg={4} md={6}>
              <div className="footer-newsletter">
                <h5>Stay Updated</h5>
                <p>Subscribe to our newsletter for the latest updates and features</p>
                <div className="social-icons">
                  <a href="#" className="social-icon"><i className="fab fa-facebook-f"></i></a>
                  <a href="#" className="social-icon"><i className="fab fa-twitter"></i></a>
                  <a href="#" className="social-icon"><i className="fab fa-linkedin-in"></i></a>
                  <a href="#" className="social-icon"><i className="fab fa-instagram"></i></a>
                </div>
              </div>
            </Col>
          </Row>
          <div className="footer-bottom">
            <p>&copy; {new Date().getFullYear()} FlowPi. All rights reserved.</p>
            <div className="footer-bottom-links">
              <a href="#privacy">Privacy Policy</a>
              <a href="#terms">Terms of Service</a>
            </div>
          </div>
        </Container>
      </footer>
    </div>
  );
};

export default LandingPage;