import React, { useState } from "react";

import { useNavigate } from "react-router-dom";
import Layout from "./Layout";




const LoginPage = () => {
  const navigate = useNavigate();
  const googleAuth = () => {
    window.open(`${process.env.REACT_APP_API_URL}/api/users/google`, "_self");
  
    } ;
  
  const CLIENT_ID = "Ov23liDt1cBCD2aFlRUl";
  
  function loginWithGithub() {
    window.location.assign("https://github.com/login/oauth/authorize?client_id=" + CLIENT_ID);
  }
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      console.log("Données envoyées :", { email, password });
      const response = await fetch("http://localhost:5000/api/users/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        // Store token and role in localStorage or use context/state management
        localStorage.setItem("token", data.token);
        localStorage.setItem("role", data.user.role);  // Storing role

        alert("Login successful!");

        // Navigate to the appropriate dashboard based on the role
        const role = data.user.role;
        if (role === "admin") {
          navigate("/admin-dashboard");
        } else if (role === "student") {
          navigate("/student-dashboard");
        } else if (role === "tutor") {
          navigate("/tutor-dashboard");
        } else {
          navigate("/home"); // Fallback in case of an undefined role
        }
      } else {
        alert(data.message || "Login failed!");
      }
    } catch (error) {
      console.error("Error logging in:", error);
      alert("Something went wrong!");
    }
  };

  return (
    <Layout>
      <div className="login">
        <div className="container sm:px-10">
          <div className="block xl:grid grid-cols-2 gap-4">
            {/* Login Info */}
            <div className="hidden xl:flex flex-col min-h-screen bg-blue-600 p-10 text-white">
              <div className="my-auto">
                <img alt="Illustration" className="-intro-x w-1/2 -mt-16" src="/assets/images/illustration.svg" />
                <h2 className="-intro-x text-4xl font-medium leading-tight mt-10">
                  A few more clicks to <br /> sign in to your account.
                </h2>
                <p className="-intro-x mt-5 text-lg text-opacity-70">
                  Manage all your e-commerce accounts in one place.
                </p>
              </div>
            </div>

            {/* Login Form */}
            <div className="h-screen xl:h-auto flex py-5 xl:py-0 my-10 xl:my-0">
              <div className="my-auto mx-auto xl:ml-20 bg-white px-5 sm:px-8 py-8 rounded-md shadow-md w-full sm:w-3/4 lg:w-2/4 xl:w-auto">
                <h2 className="intro-x font-bold text-2xl xl:text-3xl text-center xl:text-left">Sign In</h2>
                <p className="intro-x mt-2 text-slate-400 xl:hidden text-center">
                  A few more clicks to sign in to your account.
                </p>
                <form onSubmit={handleLogin}>
                  <div className="intro-x mt-8">
                    <input
                      type="email"
                      className="intro-x login__input form-control py-3 px-4 block"
                      placeholder="Email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                    <input
                      type="password"
                      className="intro-x login__input form-control py-3 px-4 block mt-4"
                      placeholder="Password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                  <div className="intro-x flex text-xs sm:text-sm mt-4">
                    <label className="flex items-center mr-auto">
                      <input type="checkbox" className="form-check-input border mr-2" />
                      Remember me
                    </label>
                    <button onClick={() => navigate("/forgot-password")}>Forgot Password?</button>
                    </div>
                  <div className="intro-x mt-5 text-center">
                    <button type="submit" className="btn btn-primary py-3 px-4 w-full">Login</button>
                    <button
                      type="button"
                      className="btn btn-outline-secondary py-3 px-4 w-full mt-3"
                      onClick={() => navigate("/register")}
                    >
                      Register
                    </button>
                  </div>
                  <hr className="intro-x mt-5 xl:mt-8 w-full xl:w-32 mx-auto" />
  <div className="intro-x mt-5 xl:mt-8 text-center xl:text-left">
  <button className="btn btn-outline-primary py-3 px-4 w-full xl:w-32 align-top" onClick={googleAuth}>
      <i className="fab fa-google mr-2"></i> Connect with Google
    </button>
   
 <button className="btn btn-outline-primary py-3 px-4 w-full xl:w-32 align-top" onClick={() => {loginWithGithub()}}>
      <i className="fab fa-github mr-2"></i> Connect with GitHub
    </button>
  </div>
                </form>
                <p className="intro-x mt-10 text-slate-600 text-center">
                  By signing up, you agree to our <a className="text-primary" href="/">Terms & Conditions</a> and <a className="text-primary" href="/">Privacy Policy</a>.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default LoginPage;
