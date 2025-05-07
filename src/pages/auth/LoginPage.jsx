import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Toaster, toast } from 'sonner';
import "./style/LoginPage.css"; // Import your CSS file for styles



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
    <div className="login-page">
      <Toaster richColors />
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
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    transition: 'background-image 1s ease-in-out',
                  }}
                />
              </div>
              
              {/* Right Column - Login Form */}
              <div className="col-12 col-lg-6 d-flex align-items-center justify-content-center login-form-container">
                <div className="login-form-wrapper">
                  <div className="login-header text-center text-lg-start">
                    <span className="login-emoji">👋</span>
                    <h1 className="login-title">Login into FlowPi!</h1>
                    <p className="login-subtitle">Nice to see you! Please log in with your account.</p>
                  </div>
                  
                  <form onSubmit={handleLogin} className="login-form">
                    <div className="form-group mb-3">
                      <label htmlFor="exampleInputEmail1" className="form-label">Email address *</label>
                      <div className="input-group">
                        <span className="input-group-text bg-light border-end-0">
                          <i className="bi bi-envelope-fill" />
                        </span>
                        <input 
                          type="email" 
                          className="form-control border-start-0" 
                          placeholder="E-mail" 
                          id="exampleInputEmail1" 
                          value={email} 
                          onChange={(e) => setEmail(e.target.value)} 
                          required 
                        />
                      </div>
                    </div>
                    
                    <div className="form-group mb-3">
                      <label htmlFor="inputPassword5" className="form-label">Password *</label>
                      <div className="input-group">
                        <span className="input-group-text bg-light border-end-0">
                          <i className="fas fa-lock" />
                        </span>
                        <input 
                          type="password" 
                          className="form-control border-start-0" 
                          placeholder="Password" 
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
                    
                    <div className="d-flex justify-content-between mb-3">
                      <div className="form-check">
                        <input type="checkbox" className="form-check-input" id="exampleCheck1" />
                        <label className="form-check-label" htmlFor="exampleCheck1">Remember me</label>
                      </div>
                      <button
                        type="button"
                        className="btn btn-link p-0 text-decoration-none"
                        onClick={() => navigate("/forgot-password")}
                      >
                        Forgot password?
                      </button>
                    </div>
                    
                    <div className="d-grid mb-3">
                      <button className="btn btn-primary btn-login" type="submit">Login</button>
                    </div>
                    
                    <div className="text-center mb-3">
                      <span>Don't have an account? </span>
                      <button
                        type="button"
                        className="btn btn-link p-0 text-decoration-none"
                        onClick={() => navigate("/register")}
                      >
                        Sign up here
                      </button>
                    </div>
                    
                    <div className="position-relative my-4">
                      <hr />
                      <span className="position-absolute top-50 start-50 translate-middle bg-white px-2">Or</span>
                    </div>
                    
                    <div className="row g-2">
                      <div className="col-12">
                        <button className="btn btn-google w-100" onClick={googleAuth}>
                          <i className="fab fa-google me-2"></i>
                          Login with Google
                        </button>
                      </div>
                      <div className="col-12">
                        <button className="btn btn-github w-100 mt-2" onClick={handleGitHubLogin}>
                          <i className="fab fa-github me-2"></i>
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