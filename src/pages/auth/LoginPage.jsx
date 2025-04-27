import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Loader from "../components/loader";
import { Toaster, toast } from 'sonner';
import Layout from "./Layout";

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
    <div>
      <title>FlowPi</title>
      <meta charSet="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
      <meta name="author" content="Webestica.com" />
      <meta name="description" content="Eduport- LMS, Education and Course Theme" />
      <link rel="shortcut icon" href="assets/images/favicon.ico" />
      <link rel="preconnect" href="https://fonts.googleapis.com/" />
      <link rel="preconnect" href="https://fonts.gstatic.com/" crossOrigin />
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Heebo:wght@400;500;700&family=Roboto:wght@400;500;700&display=swap" />
      <link rel="stylesheet" type="text/css" href="assets/vendor/font-awesome/css/all.min.css" />
      <link rel="stylesheet" type="text/css" href="assets/vendor/bootstrap-icons/bootstrap-icons.css" />
      <link rel="stylesheet" type="text/css" href="assets/css/style.css" />

      <main>
        <section className="p-0 d-flex align-items-center position-relative overflow-hidden">
          <div className="container-fluid">
            <div className="row">
              {/* Left Column - Background Images */}
              <div className="col-12 col-lg-6 p-0 position-relative vh-100">
                <div 
                  className="position-absolute w-100 h-100"
                  style={{
                    backgroundImage: `url(${currentBg})`,
                    backgroundSize: '700px',
                    backgroundPosition: 'top center',
                    backgroundRepeat: 'no-repeat',
                    transition: 'background-image 1s ease-in-out',
                    zIndex: 0
                  }}
                />
                </div>
              <div className="col-12 col-lg-6 m-auto">
                <div className="row my-5">
                  <div className="col-sm-10 col-xl-8 m-auto">
                    <span className="mb-0 fs-1">👋</span>
                    <h1 className="fs-2">Login into FlowPi!</h1>
                    <p className="lead mb-4">Nice to see you! Please log in with your account.</p>
                    <form onSubmit={handleLogin}>
                      <div className="mb-4">
                        <label htmlFor="exampleInputEmail1" className="form-label">Email address *</label>
                        <div className="input-group input-group-lg">
                          <span className="input-group-text bg-light rounded-start border-0 text-secondary px-3"><i className="bi bi-envelope-fill" /></span>
                          <input type="email" className="form-control border-0 bg-light rounded-end ps-1" placeholder="E-mail" id="exampleInputEmail1" value={email} onChange={(e) => setEmail(e.target.value)} required />
                        </div>
                      </div>
                      <div className="mb-4">
                        <label htmlFor="inputPassword5" className="form-label">Password *</label>
                        <div className="input-group input-group-lg">
                          <span className="input-group-text bg-light rounded-start border-0 text-secondary px-3"><i className="fas fa-lock" /></span>
                          <input type="password" className="form-control border-0 bg-light rounded-end ps-1" placeholder="password" id="inputPassword5" value={password} onChange={(e) => setPassword(e.target.value)} required />
                        </div>
                        <div id="passwordHelpBlock" className="form-text">
                          Your password must be 8 characters at least
                        </div>
                      </div>
                      <div className="mb-4 d-flex justify-content-between">
                        <div className="form-check">
                          <input type="checkbox" className="form-check-input" id="exampleCheck1" />
                          <label className="form-check-label" htmlFor="exampleCheck1">Remember me</label>
                        </div>
                        <div className="text-primary-hover">
                          <button
                            type="button"
                            className="btn btn-link text-secondary p-0"
                            onClick={() => navigate("/forgot-password")}
                          >
                            <u>Forgot password?</u>
                          </button>
                        </div>
                      </div>
                      <div className="align-items-center mt-0">
                        <div className="d-grid">
                          <button className="btn btn-primary mb-0" type="submit" >Login</button>
                        </div>
                      </div>
                      <div className="align-items-center mt-0">
                        <span>Don't have an account? </span>
                        <br></br>
                        <div className="d-grid">
                          <button
                            type="button"
                            className="btn btn-secondary mb-0"
                            onClick={() => navigate("/register")}
                          >
                            Sign up here
                          </button>
                        </div>
                      </div>
                    </form>
                    <div className="row">
                      <div className="position-relative my-4">
                        <hr />
                        <p className="small position-absolute top-50 start-50 translate-middle bg-body px-5">Or</p>
                      </div>
                      <div className="col-xxl-6 d-grid">
                        <button className="btn bg-google mb-2 mb-xxl-0" onClick={googleAuth}><i className="fab fa-fw fa-google text-white me-2"></i>Login with Google</button>
                      </div>
                      <div className="col-xxl-6 d-grid">
                        <button className="btn bg-facebook mb-0" onClick={handleGitHubLogin}><i className="fab fa-fw fa-github me-2"></i>Login with GitHub</button>
                      </div>
                    </div>
                  </div>
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
