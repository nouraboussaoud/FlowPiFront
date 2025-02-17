// ForgotPasswordPage.js

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleForgotPassword = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("http://localhost:5000/api/users/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage("A password reset link has been sent to your email.");
      } else {
        setMessage(data.message || "Failed to send reset link.");
      }
    } catch (error) {
      console.error("Error:", error);
      setMessage("Something went wrong. Please try again later.");
    }
  };

  return (
    <div className="forgot-password-page">
      <div className="container sm:px-10">
        <div className="block xl:grid grid-cols-2 gap-4">
          <div className="xl:flex flex-col min-h-screen bg-blue-600 p-10 text-white">
            <div className="my-auto">
              <h2 className="-intro-x text-4xl font-medium leading-tight mt-10">
                Forgot your password?
              </h2>
              <p className="-intro-x mt-5 text-lg text-opacity-70">
                Enter your email address and we'll send you a link to reset your password.
              </p>
            </div>
          </div>

          <div className="h-screen xl:h-auto flex py-5 xl:py-0 my-10 xl:my-0">
            <div className="my-auto mx-auto xl:ml-20 bg-white px-5 sm:px-8 py-8 rounded-md shadow-md w-full sm:w-3/4 lg:w-2/4 xl:w-auto">
              <h2 className="intro-x font-bold text-2xl xl:text-3xl text-center xl:text-left">Forgot Password</h2>
              <form onSubmit={handleForgotPassword}>
                <div className="intro-x mt-8">
                  <input
                    type="email"
                    className="intro-x login__input form-control py-3 px-4 block"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="intro-x mt-5 text-center">
                  <button type="submit" className="btn btn-primary py-3 px-4 w-full">
                    Send Reset Link
                  </button>
                </div>
                {message && (
                  <div className="intro-x mt-4 text-center text-red-600">{message}</div>
                )}
              </form>
              <div className="intro-x mt-5 text-center">
                <button
                  className="btn btn-outline-secondary py-3 px-4 w-full mt-3"
                  onClick={() => navigate("/login")}
                >
                  Back to Login
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
