import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "./Layout";

const RegisterPage = () => {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState(""); // Default role
  const [profilePic, setProfilePic] = useState(null); // To store the selected file

  const handleRegister = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("name", name);
    formData.append("email", email);
    formData.append("password", password);
    formData.append("role", role);
    if (profilePic) formData.append("profilePic", profilePic); // File upload

    try {
      const response = await fetch("http://localhost:5000/api/users/register", {
        method: "POST",
        body: formData, // Send as FormData
      });

      const data = await response.json();

      if (response.ok) {
        alert("Registration successful! Please check your email for verification.");
        navigate("/login");
      } else {
        alert(data.message || "Registration failed!");
      }
    } catch (error) {
      console.error("Error registering:", error);
      alert("Something went wrong!");
    }
  };

  return (
    <Layout>
      <div>
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
                          <li className="avatar avatar-sm">
                            <img className="avatar-img rounded-circle" src="assets/images/avatar/01.jpg" alt="avatar" />
                          </li>
                          <li className="avatar avatar-sm">
                            <img className="avatar-img rounded-circle" src="assets/images/avatar/02.jpg" alt="avatar" />
                          </li>
                          <li className="avatar avatar-sm">
                            <img className="avatar-img rounded-circle" src="assets/images/avatar/03.jpg" alt="avatar" />
                          </li>
                          <li className="avatar avatar-sm">
                            <img className="avatar-img rounded-circle" src="assets/images/avatar/04.jpg" alt="avatar" />
                          </li>
                        </ul>
                        <p className="mb-0 h6 fw-light ms-0 ms-sm-3">4k+ Students joined us, now it's your turn.</p>
                      </div>
                    </div>
                  </div>
                  <div className="col-12 col-lg-6 m-auto">
                    <div className="row my-5">
                      <div className="col-sm-10 col-xl-8 m-auto">
                        <img src="assets/images/element/03.svg" className="h-40px mb-2" alt="" />
                        <h2>Sign up for your account!</h2>
                        <p className="lead mb-4">Nice to see you! Please Sign up with your account.</p>
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
                              <span className="input-group-text bg-light rounded-start border-0 text-secondary px-3"><i className="fas fa-lock" /></span>
                              <input type="password" className="form-control border-0 bg-light rounded-end ps-1" placeholder="password" id="inputPassword5" value={password} onChange={(e) => setPassword(e.target.value)} required />
                            </div>
                          </div>
                          <div className="mb-4">
                            <label htmlFor="inputRole" className="form-label">Role *</label>
                            <div className="input-group input-group-lg">
                              <span className="input-group-text bg-light rounded-start border-0 text-secondary px-3"><i className="bi bi-person-badge-fill" /></span>
                              <select className="form-control border-0 bg-light rounded-end ps-1" id="inputRole" value={role} onChange={(e) => setRole(e.target.value)} required>
                                <option value="">Select Role</option>
                                <option value="student">Student</option>
                                <option value="tutor">Tutor</option>
                              </select>
                            </div>
                          </div>
                          <div className="mb-4">
                            <label htmlFor="inputProfilePic" className="form-label">Profile Picture</label>
                            <div className="input-group input-group-lg">
                              <span className="input-group-text bg-light rounded-start border-0 text-secondary px-3"><i className="bi bi-image-fill" /></span>
                              <input type="file" className="form-control border-0 bg-light rounded-end ps-1" id="inputProfilePic" onChange={(e) => setProfilePic(e.target.files[0])} />
                            </div>
                          </div>
                          <div className="align-items-center mt-0">
                            <div className="d-grid">
                              <button className="btn btn-primary mb-0" type="submit">Register</button>
                            </div>
                          </div>
                        </form>
                        <div className="row">
                          <div className="position-relative my-4">
                            <hr />
                            <p className="small position-absolute top-50 start-50 translate-middle bg-body px-5">Or</p>
                          </div>
                          <div className="col-xxl-6 d-grid">
                            <button className="btn bg-google mb-2 mb-xxl-0" onClick={() => { /* Add Google signup logic here */ }}><i className="fab fa-fw fa-google text-white me-2"></i>Signup with Google</button>
                          </div>
                          <div className="col-xxl-6 d-grid">
                            <button className="btn bg-facebook mb-0" onClick={() => { /* Add Facebook signup logic here */ }}><i className="fab fa-fw fa-facebook-f me-2"></i>Signup with Facebook</button>
                          </div>
                        </div>
                        <div className="mt-4 text-center">
                          <span>Already have an account? <a href="/login">Sign in here</a></span>
                        </div>
                        <div className="d-grid mt-3">
                          <button className="btn btn-outline-secondary py-3 px-4 w-full" onClick={() => navigate("/login")}>
                            Sign in
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </main>
        </div>
      </div>
    </Layout>
  );
};

export default RegisterPage;
