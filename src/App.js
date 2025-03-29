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
import GroupList from "./pages/GroupList";
import InvitationList from "./pages/UserGroupInvitations";
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
      console.log("🔄 Exécution de getUser() après connexion Google...");
      
      const token = localStorage.getItem("token");
      if (!token) {
        console.warn("⚠️ Aucun token trouvé dans localStorage.");
        return;
      }
  
      // Utiliser une route correcte pour récupérer l'utilisateur après Google Auth
      const url = `${process.env.REACT_APP_API_URL}/api/users/me`; 
      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${token}`
        },
        withCredentials: true
      });
  
      if (!response.data) {
        throw new Error("⚠️ Aucune donnée utilisateur récupérée !");
      }
  
      console.log("✅ Utilisateur récupéré :", response.data);
      localStorage.setItem("user", JSON.stringify(response.data)); // Stockage en local
  
      setUser(response.data); // Met à jour l'état utilisateur immédiatement
    } catch (error) {
      console.error("❌ Erreur lors de la récupération de l'utilisateur :", error);
    }
  };
  
  // 🛠️ Lance la récupération après la connexion Google
  useEffect(() => {
    console.log("🔄 Vérification après connexion...");
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get("token");
  
    if (token) {
      console.log("🆕 Token détecté, stockage et récupération de l'utilisateur...");
      localStorage.setItem("token", token); // Stocke le token dans `localStorage`
      getUser(); // Récupère immédiatement l'utilisateur après connexion Google
    } else {
      console.warn("⚠️ Aucun token trouvé dans l'URL après connexion.");
    }
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
          <Route path="/groupList" element={<GroupList />} />
          <Route path="/InvitationList" element={<InvitationList />} />
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
