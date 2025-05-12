import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Container, Row, Col, Form, Button, Card } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope, faLock, faUser, faImage } from '@fortawesome/free-solid-svg-icons';
import { Eye, EyeOff } from "lucide-react";
import { Toaster, toast } from 'sonner';
import { nanoid } from "nanoid";
import Loader from "../components/loader";
import './LoginPage.css';

// Custom loading animation component to match the design
const LoadingDots = () => (
  <div className="d-flex align-items-center justify-content-center">
    <div className="loading-dot" style={{ backgroundColor: '#ff6b6b' }}></div>
    <div className="loading-dot" style={{ backgroundColor: '#4dabf7' }}></div>
    <div className="loading-dot" style={{ backgroundColor: '#37b24d' }}></div>
  </div>
);

// Add this new component for a more visual loading animation
const LoadingSpinner = () => (
  <div className="loading-overlay">
    <div className="loading-spinner"></div>
    <p className="loading-text">Creating your account...</p>
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

const RegisterPage = () => {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("student");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [profilePic, setProfilePic] = useState(null);
  const [profilePicPreview, setProfilePicPreview] = useState(null);
  const [profilePicError, setProfilePicError] = useState("");
  
  const backgroundImages = [
    "/assets/images/2885174.jpg",
    "/assets/images/image3.png",
    "/assets/images/Data_security_05.jpg",
  ];
  const currentBg = useAnimatedBackground(backgroundImages, 5000);
  
  // For password suggestion
  const [suggestedPassword, setSuggestedPassword] = useState("");
  const [showSuggestion, setShowSuggestion] = useState(false);
  const passwordRef = useRef(null);
  const generatedPassword = nanoid();

  const handleFocus = () => {
    setSuggestedPassword(nanoid());
    setShowSuggestion(true);
  };

  const useSuggestedPassword = () => {
    setPassword(generatedPassword);
    setShowSuggestion(false);
  };

  const handleProfilePicChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    const validTypes = ["image/jpeg", "image/png"];
    if (!validTypes.includes(file.type)) {
      setProfilePicError("Only JPEG or PNG images are allowed");
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      setProfilePicError("Image must be less than 5MB");
      return;
    }

    setProfilePic(file);
    setProfilePicError("");
    
    // Create preview URL
    const previewUrl = URL.createObjectURL(file);
    setProfilePicPreview(previewUrl);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    
    setLoading(true);
    const formData = new FormData();
    formData.append("name", name);
    formData.append("email", email);
    formData.append("password", password);
    formData.append("role", role);
    
    // Add profile picture to form data if available
    if (profilePic) {
      formData.append("profilePic", profilePic);
    }

    try {
      const response = await fetch("http://localhost:5000/api/users/register", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("Registration successful! Please check your email to verify your account.", {
          position: "top-center",
          duration: 4000
        });
        navigate("/login");
      } else {
        toast.error(data.message || "Registration failed!", {
          position: "top-center",
          duration: 4000
        });
      }
    } catch (error) {
      console.error("Error registering:", error);
      toast.error("Registration failed. Please try again.", {
        position: "top-center",
        duration: 4000
      });
    }
    setLoading(false);
  };

  // GitHub auth
  const handleGitHubLogin = () => {
    window.location.href = "http://localhost:5000/api/users/auth/github";
  };

  // Google auth
  const handleGoogleLogin = () => {
    window.location.href = `${process.env.REACT_APP_API_URL}/api/users/google`;
  };

  // Add CSS for loading dots and profile picture
  useEffect(() => {
    const style = document.createElement('style');
    style.innerHTML = `
      .loading-dot {
        width: 10px;
        height: 10px;
        border-radius: 50%;
        margin: 0 5px;
        animation: pulse 1.5s infinite ease-in-out;
      }
      
      .loading-dot:nth-child(1) {
        animation-delay: 0s;
      }
      
      .loading-dot:nth-child(2) {
        animation-delay: 0.2s;
      }
      
      .loading-dot:nth-child(3) {
        animation-delay: 0.4s;
      }
      
      @keyframes pulse {
        0%, 100% {
          transform: scale(0.8);
          opacity: 0.8;
        }
        50% {
          transform: scale(1.2);
          opacity: 1;
        }
      }

      .profile-pic-preview {
        width: 70px;
        height: 70px;
        border-radius: 50%;
        object-fit: cover;
        border: 2px solid #e0e7ff;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      }

      .profile-pic-placeholder {
        width: 70px;
        height: 70px;
        border-radius: 50%;
        background-color: #e0e7ff;
        color: #4f46e5;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1.5rem;
        font-weight: bold;
        border: 2px solid #e0e7ff;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      }

      .profile-pic-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        margin-bottom: 1rem;
      }

      .profile-pic-label {
        cursor: pointer;
        margin-top: 0.5rem;
        font-size: 0.8rem;
        color: #4f46e5;
      }

      .profile-pic-input {
        display: none;
      }
      
      /* Fix scrolling issue */
      .register-card-body {
        max-height: 85vh;
        overflow-y: auto;
        padding: 1.5rem 2rem;
      }
      
      /* Match login page label style */
      .form-label {
        font-weight: 500;
        color: #374151;
        font-size: 0.9rem;
      }
      
      /* Compact form for registration */
      .compact-form .form-group {
        margin-bottom: 0.75rem;
      }
      
      .compact-form .input-group {
        margin-bottom: 0;
      }
      
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
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  // Clean up object URLs when component unmounts
  useEffect(() => {
    return () => {
      if (profilePicPreview) {
        URL.revokeObjectURL(profilePicPreview);
      }
    };
  }, [profilePicPreview]);

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
          
          {/* Right side - register form */}
          <Col lg={6} className="d-flex align-items-center justify-content-center">
            <Card className="login-card shadow-lg border-0">
              <Card.Body className="register-card-body">
                <div className="text-center mb-3">
                  <h2 className="welcome-text fw-bold">Create Account</h2>
                  <p className="text-muted">Sign up to get started with FlowPi</p>
                </div>
                
                {/* Profile Picture Upload */}
                <div className="profile-pic-container">
                  {profilePicPreview ? (
                    <img 
                      src={profilePicPreview} 
                      alt="Profile Preview" 
                      className="profile-pic-preview"
                    />
                  ) : (
                    <div className="profile-pic-placeholder">
                      <FontAwesomeIcon icon={faUser} />
                    </div>
                  )}
                  <label htmlFor="profile-pic-input" className="profile-pic-label">
                    {profilePicPreview ? "Change Photo" : "Upload Photo"}
                  </label>
                  <input 
                    type="file" 
                    id="profile-pic-input" 
                    className="profile-pic-input" 
                    accept="image/jpeg,image/png"
                    onChange={handleProfilePicChange}
                  />
                  {profilePicError && (
                    <small className="text-danger">{profilePicError}</small>
                  )}
                </div>
                
                <Form onSubmit={handleRegister} className="compact-form">
                  <Form.Group className="mb-3">
                    <Form.Label>Full Name</Form.Label>
                    <div className="input-group">
                      <span className="input-group-text"><FontAwesomeIcon icon={faUser} /></span>
                      <Form.Control 
                        type="text" 
                        placeholder="Enter your full name" 
                        value={name} 
                        onChange={(e) => setName(e.target.value)} 
                        required 
                      />
                    </div>
                  </Form.Group>
                  
                  <Form.Group className="mb-3">
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
                  
                  <Form.Group className="mb-3">
                    <Form.Label>Password</Form.Label>
                    <div className="input-group">
                      <span className="input-group-text"><FontAwesomeIcon icon={faLock} /></span>
                      <Form.Control 
                        type={showPassword ? "text" : "password"} 
                        placeholder="Create a password" 
                        value={password} 
                        onChange={(e) => setPassword(e.target.value)} 
                        onFocus={handleFocus}
                        ref={passwordRef}
                        required 
                      />
                      <Button 
                        variant="outline-secondary"
                        onClick={() => setShowPassword(!showPassword)}
                        className="border-start-0 password-toggle-btn"
                      >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </Button>
                    </div>
                    {showSuggestion && (
                      <div className="mt-1 p-1 bg-light rounded small">
                        <small>Suggested: <strong>{generatedPassword}</strong></small>
                        <Button 
                          variant="link" 
                          size="sm" 
                          className="p-0 ms-1"
                          onClick={useSuggestedPassword}
                        >
                          Use this
                        </Button>
                      </div>
                    )}
                  </Form.Group>
                  
                  <Form.Group className="mb-3">
                    <Form.Label>Role</Form.Label>
                    <Form.Select 
                      value={role} 
                      onChange={(e) => setRole(e.target.value)}
                      required
                    >
                      <option value="student">Student</option>
                      <option value="tutor">Tutor</option>
                    </Form.Select>
                  </Form.Group>
                  
                  <Button 
                    variant="primary" 
                    type="submit" 
                    className="w-100 mb-3 py-2 fw-medium"
                    disabled={loading}
                  >
                    {loading ? <LoadingDots /> : "Create Account"}
                  </Button>
                  
                  <div className="text-center my-3">
                    <span className="divider">or continue with</span>
                  </div>
                  
                  <Row className="social-buttons mb-3 g-2">
                    <Col>
                      <Button variant="outline-danger" className="w-100 d-flex align-items-center justify-content-center" onClick={handleGoogleLogin}>
                        <i className="fab fa-google me-2"></i>Google
                      </Button>
                    </Col>
                    <Col>
                      <Button variant="outline-dark" className="w-100 d-flex align-items-center justify-content-center" onClick={handleGitHubLogin}>
                        <i className="fab fa-github me-2"></i>GitHub
                      </Button>
                    </Col>
                  </Row>
                  
                  <div className="text-center">
                    <p className="mb-0">Already have an account? <Button 
                      variant="link" 
                      className="p-0 signup-link" 
                      onClick={() => navigate("/login")}
                    >
                      Sign in
                    </Button></p>
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

export default RegisterPage;
