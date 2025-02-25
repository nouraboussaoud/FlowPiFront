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
    <div>
      <title>Eduport - LMS, Education and Course Theme</title>
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
              <div className="col-12 col-lg-6 d-md-flex align-items-center justify-content-center bg-primary bg-opacity-10 vh-lg-100">
                <div className="p-3 p-lg-5">
                  <div className="text-center">
                    <h2 className="fw-bold">Welcome to our largest community</h2>
                    <p className="mb-0 h6 fw-light">Let's learn something new today!</p>
                  </div>
                  <img src="assets/images/element/02.svg" className="mt-5" alt="" />
                  <div className="d-sm-flex mt-5 align-items-center justify-content-center">
                    <ul className="avatar-group mb-2 mb-sm-0">
                      <li className="avatar avatar-sm"><img className="avatar-img rounded-circle" src="assets/images/avatar/01.jpg" alt="avatar" /></li>
                      <li className="avatar avatar-sm"><img className="avatar-img rounded-circle" src="assets/images/avatar/02.jpg" alt="avatar" /></li>
                      <li className="avatar avatar-sm"><img className="avatar-img rounded-circle" src="assets/images/avatar/03.jpg" alt="avatar" /></li>
                      <li className="avatar avatar-sm"><img className="avatar-img rounded-circle" src="assets/images/avatar/04.jpg" alt="avatar" /></li>
                    </ul>
                    <p className="mb-0 h6 fw-light ms-0 ms-sm-3">4k+ Students joined us, now it's your turn.</p>
                  </div>
                </div>
              </div>
              <div className="col-12 col-lg-6 d-flex justify-content-center">
                <div className="row my-5">
                  <div className="col-sm-10 col-xl-12 m-auto">
                    <span className="mb-0 fs-1">🤔</span>
                    <h1 className="fs-2">Forgot Password?</h1>
                    <h5 className="fw-light mb-4">To receive a new password, enter your email address below.</h5>
                    <form onSubmit={handleForgotPassword}>
                      <div className="mb-4">
                        <label htmlFor="exampleInputEmail1" className="form-label">Email address *</label>
                        <div className="input-group input-group-lg">
                          <span className="input-group-text bg-light rounded-start border-0 text-secondary px-3"><i className="bi bi-envelope-fill" /></span>
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
                      <div className="align-items-center">
                        <div className="d-grid">
                          <button className="btn btn-primary mb-0" type="submit">Reset password</button>
                        </div>
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
        </section>
      </main>
      <div className="back-top"><i className="bi bi-arrow-up-short position-absolute top-50 start-50 translate-middle" /></div>
    </div>
  );
};

export default ForgotPasswordPage;
