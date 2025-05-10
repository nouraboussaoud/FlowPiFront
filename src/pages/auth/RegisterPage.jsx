import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "./Layout";
import { Eye, EyeOff } from "lucide-react"; // Install with `npm install lucide-react`


import {nanoid} from "nanoid";
import Loader from "../components/loader";
import { toast } from "sonner";

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
  const [role, setRole] = useState(""); // Default role
  const [profilePic, setProfilePic] = useState(null); // To store the selected file
  const [loading, setLoading] = useState(false);
  
  const backgroundImages = [
    "/assets/images/2885174.jpg",
    "/assets/images/image3.png",
    "/assets/images/Data_security_05.jpg",
  ];
  const currentBg = useAnimatedBackground(backgroundImages, 5000);

  // Password suggestion functionality
  const [suggestedPassword, setSuggestedPassword] = useState("");
  const [showSuggestion, setShowSuggestion] = useState(false);
  const passwordRef = useRef(null);
  const [showPassword, setShowPassword] = useState(false);

  const nanoidPassword = () => {
    return nanoid();
  };
  const generatedPassword = nanoid();
  
  const handleFocus = () => {
    const newPassword = nanoidPassword();
    setSuggestedPassword(newPassword);
    setShowSuggestion(true);
  };

  const useSuggestedPassword = () => {
    setPassword(generatedPassword);
    setShowSuggestion(false);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    
    setLoading(true);
    const formData = new FormData();
    formData.append("name", name);
    formData.append("email", email);
    formData.append("password", password);
    formData.append("role", role);
    if (profilePic) formData.append("profilePic", profilePic);

    try {
      const response = await fetch("http://localhost:5000/api/users/register", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("Registration successful! Please check your email to verify your account.");
        navigate("/login");
      } else {
        toast.error("Registration failed!");
      }
    } catch (error) {
      console.error("Error registering:", error);
    }
    setLoading(false);
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
                    <h1 className="fs-2">Sign up for FlowPi!</h1>
                    <p className="lead mb-4">Nice to see you! Please sign up with your account.</p>
                    <form onSubmit={handleRegister}>
                      <div className="mb-4">
                        <label htmlFor="exampleInputName" className="form-label">Full Name *</label>
                        <div className="input-group input-group-lg">
                          <span className="input-group-text bg-light rounded-start border-0 text-secondary px-3"><i className="bi bi-person-fill" /></span>
                          <input type="text" className="form-control border-0 bg-light rounded-end ps-1" placeholder="Full Name" id="exampleInputName" value={name} onChange={(e) => setName(e.target.value)} required />
                        </div>
                      </div>
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
                          <span className="input-group-text bg-light rounded-start border-0 text-secondary px-3"><i className="bi bi-lock-fill" /></span>
                          <input 
                            type={showPassword ? "text" : "password"} 
                            className="form-control border-0 bg-light ps-1" 
                            placeholder="*********" 
                            id="inputPassword5" 
                            value={password} 
                            onChange={(e) => setPassword(e.target.value)} 
                            onFocus={handleFocus}
                            ref={passwordRef}
                            required 
                          />
                          <button 
                            type="button" 
                            className="input-group-text bg-light rounded-end border-0 text-secondary px-3"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                          </button>
                        </div>
                        <div className="form-text">
                          Your password must be 8 characters at least
                        </div>
                        {showSuggestion && (
                          <div className="mt-2">
                            <p className="small mb-0">Suggested secure password:</p>
                            <div className="d-flex align-items-center">
                              <code className="me-2">{generatedPassword}</code>
                              <button 
                                type="button" 
                                className="btn btn-sm btn-outline-success" 
                                onClick={useSuggestedPassword}
                              >
                                Use this
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="mb-4">
                        <label htmlFor="exampleInputRole" className="form-label">Role *</label>
                        <div className="input-group input-group-lg">
                          <span className="input-group-text bg-light rounded-start border-0 text-secondary px-3"><i className="bi bi-person-badge" /></span>
                          <select 
                            className="form-select border-0 bg-light rounded-end ps-1" 
                            id="exampleInputRole" 
                            value={role} 
                            onChange={(e) => setRole(e.target.value)}
                            required
                          >
                            <option value="">Select a role</option>
                            <option value="student">Student</option>
                            <option value="tutor">Tutor</option>
                            <option value="admin">Admin</option>
                          </select>
                        </div>
                      </div>
                      <div className="mb-4">
                        <label htmlFor="profilePicInput" className="form-label">Profile Picture</label>
                        <input 
                          type="file" 
                          className="form-control" 
                          id="profilePicInput" 
                          onChange={(e) => setProfilePic(e.target.files[0])} 
                        />
                      </div>
                      <div className="align-items-center mt-0">
                        <div className="d-grid">
                          {loading ? (
                            <div className="d-flex justify-content-center">
                              <Loader />
                            </div>
                          ) : (
                            <button className="btn btn-primary mb-0" type="submit">Sign Up</button>
                          )}
                        </div>
                      </div>
                    </form>
                    <div className="row">
                      <div className="position-relative my-4">
                        <hr />
                        <p className="small position-absolute top-50 start-50 translate-middle bg-body px-5">Or</p>
                      </div>
                      <div className="col-xxl-6 d-grid">
                        <button className="btn bg-google mb-2 mb-xxl-0"><i className="fab fa-fw fa-google text-white me-2"></i>Sign up with Google</button>
                      </div>
                      <div className="col-xxl-6 d-grid">
                        <button className="btn bg-facebook mb-0"><i className="fab fa-fw fa-github me-2"></i>Sign up with GitHub</button>
                      </div>
                    </div>
                    <div className="mt-4 text-center">
                      <span>Already have an account?</span>
                      <br />
                      <div className="d-grid mt-2">
                        <button
                          type="button"
                          className="btn btn-secondary mb-0"
                          onClick={() => navigate("/login")}
                        >
                          Sign in here
                        </button>
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

export default RegisterPage;
