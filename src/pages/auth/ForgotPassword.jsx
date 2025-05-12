// ForgotPasswordPage.js

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Container, Row, Col, Form, Button, Card } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope } from '@fortawesome/free-solid-svg-icons';
import { toast, Toaster } from "sonner";
import Loader from "../components/loader";
import './LoginPage.css';

// Custom loading animation component
const LoadingSpinner = () => (
  <div className="loading-overlay">
    <div className="loading-spinner"></div>
    <p className="loading-text">Sending reset link...</p>
  </div>
);

const useAnimatedBackground = (images, duration = 5000) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % images.length);
    }, duration);
    return () => clearInterval(interval);
  }, [images.length, duration]);
  
  return images[currentIndex];
};

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("");
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  
  const backgroundImages = [
    "/assets/images/2885174.jpg",
    "/assets/images/image3.png",
    "/assets/images/Data_security_05.jpg",
  ];
  const currentBg = useAnimatedBackground(backgroundImages, 5000);

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch("http://localhost:5000/api/users/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("A password reset link has been sent to your email.", {
          position: "top-center",
          duration: 4000
        });
      } else {
        toast.error(data.message || "Failed to send reset link.", {
          position: "top-center",
          duration: 4000
        });
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Something went wrong. Please try again later.", {
        position: "top-center",
        duration: 4000
      });
    } finally {
      setLoading(false);
    }
  };

  // Add CSS for loading animation
  useEffect(() => {
    const style = document.createElement('style');
    style.innerHTML = `
      /* Enhanced loading animation */
      .loading-overlay {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: rgba(255, 255, 255, 0.9);
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        z-index: 1000;
        border-radius: 0.5rem;
      }
      
      .loading-spinner {
        width: 50px;
        height: 50px;
        border: 4px solid rgba(79, 70, 229, 0.2);
        border-radius: 50%;
        border-top-color: #4f46e5;
        animation: spin 1s linear infinite;
      }
      
      .loading-text {
        margin-top: 1rem;
        font-weight: 500;
        color: #4f46e5;
      }
      
      @keyframes spin {
        to { transform: rotate(360deg); }
      }
      
      /* Match login page label style */
      .form-label {
        font-weight: 500;
        color: #374151;
        font-size: 0.9rem;
      }
      
      /* Custom back to login button styling */
      .back-to-login-btn {
        border-color: #e5e7eb;
        color: #6b7280;
        transition: all 0.2s ease;
      }
      
      .back-to-login-btn:hover {
        background-color: #f3f4f6;
        border-color: #d1d5db;
        color: #374151;
        transform: translateY(-2px);
      }
      
      /* Dark mode support */
      [data-theme="dark"] .back-to-login-btn {
        border-color: #374151;
        color: #d1d5db;
      }
      
      [data-theme="dark"] .back-to-login-btn:hover {
        background-color: #1f2937;
        border-color: #4b5563;
        color: #f9fafb;
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  return (
    <div className="login-page">
      <Container fluid>
        <Row className="vh-100">
          {/* Left side - animated background */}
          <Col lg={6} className="d-none d-lg-block p-0 position-relative">
            <div 
              className="bg-image"
              style={{
                backgroundImage: `url(${currentBg})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                height: '100%',
                transition: 'background-image 1s ease-in-out'
              }}
            >
              <div className="overlay"></div>
              <div className="brand-wrapper">
                <h1 className="brand-name">FlowPi</h1>
                <p className="brand-tagline">Transform Your Learning Experience</p>
              </div>
            </div>
          </Col>
          
          {/* Right side - forgot password form */}
          <Col lg={6} className="d-flex align-items-center justify-content-center">
            <Card className="login-card shadow-lg border-0">
              <Card.Body className="p-4 p-lg-5 position-relative">
                {loading && <LoadingSpinner />}
                <div className="text-center mb-4">
                  <h2 className="welcome-text fw-bold">Forgot Password?</h2>
                  <p className="text-muted">Enter your email to receive a password reset link</p>
                </div>
                
                <Form onSubmit={handleForgotPassword}>
                  <Form.Group className="mb-4">
                    <Form.Label>Email address</Form.Label>
                    <div className="input-group">
                      <span className="input-group-text"><FontAwesomeIcon icon={faEnvelope} /></span>
                      <Form.Control 
                        type="email" 
                        placeholder="Enter your email" 
                        value={email} 
                        onChange={(e) => setEmail(e.target.value)} 
                        required 
                      />
                    </div>
                  </Form.Group>
                  
                  <Button 
                    variant="primary" 
                    type="submit" 
                    className="w-100 mb-4 py-2 fw-medium"
                    disabled={loading}
                  >
                    Send Reset Link
                  </Button>
                  
                  <div className="text-center">
                    <Button 
                      variant="outline-secondary" 
                      className="w-100 py-2 back-to-login-btn"
                      onClick={() => navigate("/login")}
                    >
                      Back to Login
                    </Button>
                  </div>
                </Form>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
      {/* Remove any duplicate Toaster components */}
    </div>
  );
};

export default ForgotPasswordPage;
