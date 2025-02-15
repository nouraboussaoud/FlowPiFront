import React from "react";
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import 'bootstrap/dist/css/bootstrap.min.css';
import About from "./pages/About";
import Contact from "./pages/Contact";
import Courses from "./pages/Courses";
import Home from "./pages/Home";
import RegisterPage from "./pages/RegisterPage";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Footer from "./components/Footer";
import LoggedInHome from "./pages/LoggedInHome";
import GithubCallback from "./pages/GithubCallback";
import LoginPage from "./pages/auth/LoginPage";
import AdminDashboard from "./pages/dashboard/AdminDashboard";
import StudentDashboard from "./pages/dashboard/StudentDashboard";


function App() {
  return (
    <div>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/courses" element={<Courses />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/about" element={<About />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/github-callback" element={<GithubCallback />} />
          <Route path="/loggedIn" element={<LoggedInHome />} />
          <Route path="/admin-dashboard" element={<AdminDashboard />} />
          <Route path="/student-dashboard" element={<StudentDashboard />} />

        </Routes>
      </BrowserRouter>
      <Footer />
    </div>
  );
}

export default App;
