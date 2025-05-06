import React, { useState,useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Loader from "../components/loader";
import { Toaster, toast } from 'sonner';
import Layout from "./Layout";
import './style/LoginPage.css';

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
    // Rediriger vers l'authentification Google
    window.open(`${process.env.REACT_APP_API_URL}/api/users/google`, "_self");
  };
  
  const CLIENT_ID = "Ov23liDt1cBCD2aFlRUl"; // Your GitHub OAuth App Client ID
  const REDIRECT_URI = "http://localhost:5000/api/users/auth/github/callback"; // Change to your callback URL

  // Function to redirect to GitHub OAuth login
  const handleGitHubLogin = () => {
    window.location.href = "http://localhost:5000/api/users/auth/github";
  };

  // Function to handle login (for email and password flow if needed)
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
      
        toast.success("Welcome " + data.user.name); 
        const role = data.user.role;
        if (role === "admin") {
          navigate("/admin-dashboard");
        } else if (role === "student") {
          navigate("/student-dashboard");
        } else if (role === "tutor") {
          navigate("/tutor-dashboard");
        } else {
          navigate("/home");
        }
      } else {
        // Handle specific error responses based on the message from the server
        if (data.message === "Invalid email or password") {
          toast.error("Invalid email or password");
        } else if (data.message === "Please verify your email to activate your account") {
          toast.error("Please verify your email to activate your account");
        } else if (data.message === "Your account is banned") {
          toast.error("Your account is banned");
        } else {
          toast.error("An unexpected error occurred");
        }
        localStorage.clear();
      }
    } catch (error) {
      console.error("Error logging in:", error);
      toast.error("An error occurred, please try again later");
      localStorage.clear();
    }
  };

  return (
    <div className="login-page-container">
      <title>FlowPi</title>
      <meta charSet="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
      
      <main>
        <section className="login-section">
          <div className="container-fluid h-100">
            <div className="row g-0 h-100">
              {/* Left Column - Background Images (hidden on mobile) */}
              <div className="col-lg-6 d-none d-lg-flex login-bg-container">
                <div 
                  className="login-bg-image"
                  style={{
                    backgroundImage: `url(${currentBg})`,
                    transition: 'background-image 1s ease-in-out',
                  }}
                />
              </div>
              
              {/* Right Column - Login Form */}
              <div className="col-12 col-lg-6 d-flex align-items-center login-form-container">
                <div className="login-form-wrapper mx-auto">
                  <div className="login-header">
                    <span className="login-emoji">👋</span>
                    <h1 className="login-title">Login into FlowPi!</h1>
                    <p className="login-subtitle">Nice to see you! Please log in with your account.</p>
                  </div>
                  
                  <form onSubmit={handleLogin} className="login-form">
                    <div className="form-group mb-4">
                      <label htmlFor="exampleInputEmail1" className="form-label">Email address *</label>
                      <div className="input-group input-group-lg">
                        <span className="input-group-text bg-light rounded-start border-0 text-secondary px-3">
                          <i className="bi bi-envelope-fill" />
                        </span>
                        <input 
                          type="email" 
                          className="form-control border-0 bg-light rounded-end ps-1" 
                          placeholder="E-mail" 
                          id="exampleInputEmail1" 
                          value={email} 
                          onChange={(e) => setEmail(e.target.value)} 
                          required 
                        />
                      </div>
                    </div>
                    
                    <div className="form-group mb-4">
                      <label htmlFor="inputPassword5" className="form-label">Password *</label>
                      <div className="input-group input-group-lg">
                        <span className="input-group-text bg-light rounded-start border-0 text-secondary px-3">
                          <i className="fas fa-lock" />
                        </span>
                        <input 
                          type="password" 
                          className="form-control border-0 bg-light rounded-end ps-1" 
                          placeholder="password" 
                          id="inputPassword5" 
                          value={password} 
                          onChange={(e) => setPassword(e.target.value)} 
                          required 
                        />
                      </div>
                      <div id="passwordHelpBlock" className="form-text">
                        Your password must be 8 characters at least
                      </div>
                    </div>
                    
                    <div className="form-options d-flex justify-content-between mb-4">
                      <div className="form-check">
                        <input type="checkbox" className="form-check-input" id="exampleCheck1" />
                        <label className="form-check-label" htmlFor="exampleCheck1">Remember me</label>
                      </div>
                      <button
                        type="button"
                        className="btn btn-link text-secondary p-0 forgot-password-btn"
                        onClick={() => navigate("/forgot-password")}
                      >
                        <u>Forgot password?</u>
                      </button>
                    </div>
                    
                    <div className="d-grid gap-3">
                      <button className="btn btn-primary btn-login" type="submit">Login</button>
                      
                      <div className="signup-prompt" style={{ textAlign: "center" }}>
                        <span>Don't have an account? </span>
                        <br></br>
                        <br></br>
                        <button
                          type="button"
                          className="btn btn-secondary btn-signup"
                          onClick={() => navigate("/register")}
                        >
                          Sign up here
                        </button>
                      </div>
                    </div>
                    
                    <div className="social-login-separator">
                      <hr />
                      <span className="separator-text">Or</span>
                    </div>
                    
                    <div className="row g-2 social-login-buttons">
                      <div className="col-md-6">
                        <button className="btn btn-google w-100" onClick={googleAuth}>
                          <i className="fab fa-fw fa-google text-white me-2"></i>
                          Login with Google
                        </button>
                      </div>
                      <div className="col-md-6">
                        <button className="btn btn-github w-100" onClick={handleGitHubLogin}>
                          <i className="fab fa-fw fa-github me-2"></i>
                          Login with GitHub
                        </button>
                      </div>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default LoginPage;