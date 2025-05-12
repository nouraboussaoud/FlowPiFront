import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Container, Row, Col, Form, Button, Card } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope, faLock, faGoogle, faGithub } from '@fortawesome/free-solid-svg-icons';
import Loader from "../components/loader";
import { Toaster, toast } from 'sonner';
import './LoginPage.css';

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


const LoginPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const backgroundImages = [
    "/assets/images/2885174.jpg",
    "/assets/images/image3.png",
    "/assets/images/Data_security_05.jpg",
  ];
  const currentBg = useAnimatedBackground(backgroundImages,5000);

  const googleAuth = () => {
    // Clear any existing auth data before starting new auth flow
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    // Add other items you store during auth
   
    
    window.open(`${process.env.REACT_APP_API_URL}/api/users/google`, "_self");
  };
  
  const CLIENT_ID = "Ov23liDt1cBCD2aFlRUl"; // Your GitHub OAuth App Client ID
  const REDIRECT_URI = "http://localhost:5000/api/users/auth/github/callback"; // Change to your callback URL

  // Function to redirect to GitHub OAuth login
  const handleGitHubLogin = () => {
    window.location.href = "http://localhost:5000/api/users/auth/github";
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("http://localhost:5000/api/users/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("role", data.user.role);
        localStorage.setItem("userId", data.user._id);
        localStorage.setItem("name", data.user.name);
        localStorage.setItem("profilePic", data.user.profilePic);
      
        toast.success("Welcome " + data.user.name, {
          position: "top-center",
          duration: 4000
        }); 
        const role = data.user.role;
        if (role === "admin") {
          navigate("/admin-dashboard");
        } else if (data.user.role === "student") {
          navigate("/student-dashboard");
        } else if (data.user.role === "tutor") {
          navigate("/tutor-dashboard");
        } else {
          navigate("/home");
        }
      } else {
        // Handle specific error responses based on the message from the server
        if (data.message === "Invalid email or password") {
          toast.error("Invalid email or password", {
            position: "top-center",
            duration: 4000
          });
        } else if (data.message === "Please verify your email to activate your account") {
          toast.error("Please verify your email to activate your account", {
            position: "top-center",
            duration: 4000
          });
        } else if (data.message === "Your account is banned") {
          toast.error("Your account is banned", {
            position: "top-center",
            duration: 4000
          });
        } else {
          toast.error("An unexpected error occurred", {
            position: "top-center",
            duration: 4000
          });
        }
        localStorage.clear();
      }
    } catch (error) {
      console.error("Error logging in:", error);
      toast.error("An error occurred, please try again later", {
        position: "top-center",
        duration: 4000
      });
      localStorage.clear();
    }
  };

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
          
          {/* Right side - login form */}
          <Col lg={6} className="d-flex align-items-center justify-content-center">
            <Card className="login-card shadow-lg border-0">
              <Card.Body className="p-4 p-lg-5">
                <div className="text-center mb-4">
                  <h2 className="welcome-text fw-bold">Welcome Back</h2>
                  <p className="text-muted">Sign in to continue to FlowPi</p>
                </div>
                
                <Form onSubmit={handleLogin}>
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
                    <div className="d-flex justify-content-between">
                      <Form.Label>Password</Form.Label>
                      <Button 
                        variant="link" 
                        className="p-0 forgot-password" 
                        onClick={() => navigate("/forgot-password")}
                      >
                        Forgot password?
                      </Button>
                    </div>
                    <div className="input-group">
                      <span className="input-group-text"><FontAwesomeIcon icon={faLock} /></span>
                      <Form.Control 
                        type="password" 
                        placeholder="Enter your password" 
                        value={password} 
                        onChange={(e) => setPassword(e.target.value)} 
                        required 
                      />
                    </div>
                  </Form.Group>
                  
                  <Form.Group className="mb-4">
                    <Form.Check 
                      type="checkbox" 
                      label="Remember me" 
                      id="rememberMe" 
                    />
                  </Form.Group>
                  
                  <Button variant="primary" type="submit" className="w-100 mb-3 py-2 fw-medium">
                    Sign In
                  </Button>
                  
                  <div className="text-center my-3">
                    <span className="divider">or continue with</span>
                  </div>
                  
                  <Row className="social-buttons mb-4 g-2">
                    <Col>
                      <Button variant="outline-danger" className="w-100 d-flex align-items-center justify-content-center" onClick={googleAuth}>
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
                    <p>Don't have an account? <Button 
                      variant="link" 
                      className="p-0 signup-link" 
                      onClick={() => navigate("/register")}
                    >
                      Sign up
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

export default LoginPage;
