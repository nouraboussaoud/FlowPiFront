import React from "react";
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import 'bootstrap/dist/css/bootstrap.min.css';
import About from "./pages/About";
import Contact from "./pages/Contact";
import Courses from "./pages/Courses";
import Home from "./pages/Home";
import RegisterPage from "./pages/auth/RegisterPage";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Footer from "./components/Footer";
import LoggedInHome from "./pages/LoggedInHome";
import GithubCallback from "./pages/GithubCallback";
import LoginPage from "./pages/auth/LoginPage";
import AdminDashboard from "./pages/dashboard/AdminDashboard";
import StudentDashboard from "./pages/dashboard/StudentDashboard";
import ForgotPasswordPage from "./pages/auth/ForgotPassword";
import TutorDashboard from "./pages/dashboard/TutorDashboard";
import UsersList from "./pages/UsersList";
import Logout from "./pages/auth/Logout";
import {Navigate} from "react-router-dom";
import { useEffect ,useState } from "react";
import axios from "axios";

function App() {
  const [user, setUser] = useState(null);
  const getUser = async () => {
    try {
      const url = `${process.env.REACT_APP_API_URL}/auth/login/success`;
    const { data } = await axios.get(url, { withCredentials: true });
    setUser(data.user);
    }
    catch (error) {
      console.error("Error getting user:", error);}
    };
    useEffect(() => {
      getUser();
    }, []);

  
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
          <Route path="/tutor-dashboard" element={<TutorDashboard />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/usersList" element={<UsersList />} />
          <Route path="/logout" element={<Logout />} />


        </Routes>
      </BrowserRouter>
      <Footer />
    </div>
  );
}

export default App ;
