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
import CreateGroup from "./pages/dashboard/CreateGroup";
import ForgotPasswordPage from "./pages/auth/ForgotPassword";
import TutorDashboard from "./pages/dashboard/TutorDashboard";
import UsersList from "./pages/UsersList";
import Logout from "./pages/auth/Logout";
import EditProfile from "./pages/auth/EditProfile";
import UserSettings from "./pages/auth/UserSettings";
import NoursDashboar from "./pages/test/NoursDashboar";
import DouaaComp from "./pages/test/DouaaComp";
import { Toaster } from "sonner";
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
        <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/courses" element={<Courses />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/about" element={<About />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/github-callback" element={<GithubCallback />} />
          <Route path="/loggedIn" element={<LoggedInHome />} />
          <Route path="/admin-dashboard" element={<AdminDashboard />} />
          <Route path="/student-dashboard" element={<StudentDashboard />} />
          <Route path="/create-group" element={<CreateGroup />} />
          <Route path="/tutor-dashboard" element={<TutorDashboard />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/usersList" element={<UsersList />} />
          <Route path="/logout" element={<Logout />} />
          <Route path="/edit-profile" element={<EditProfile />} />
          <Route path="/user-settings" element={<UserSettings />} />

    
<Route path="/nour" element={<NoursDashboar/>} >
<Route path="douaa" element={<DouaaComp/>} />
</Route>
        </Routes>
      </BrowserRouter>
      <Toaster position="top-center" />

    </div>
  );
}

export default App;
