import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

import TaskManager from '../tasks/DashboardTasks';

const LayoutStudent = ({ children }) => {
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [imgKey, setImgKey] = useState(Date.now());
  const navigate = useNavigate();
  const [profilePic, setProfilePic] = useState(null);
  const [showTaskManager, setShowTaskManager] = useState(false);

  
  useEffect(() => {
   
    // Get profile picture filename from local storage
    const storedProfilePic = localStorage.getItem("profilePic");
   
    if (storedProfilePic) {
      setProfilePic(`http://localhost:5000/uploads/${storedProfilePic}`);
    }
  }, []);
  const handleEditProfile = () => {
    navigate("/edit-profile"); 
  };
  const handleMessages = () => {
    navigate("/messages");
  };

  const handleNavigateToDeliverables = () => {
    navigate("/deliverables-history");
  };

  const handleNavigateToReturnDeliverable= () =>{
    navigate("/return-deliverable");
  };

  const handleNavigateToTutorsDeliverables=()=>{
    navigate("/tutors-deliverables");
  };
  
  const logoutUser = async () => {
    console.log("🔄 Tentative de déconnexion...");
  
    // Vérifier si le token est présent
    const token = localStorage.getItem("token");
    if (!token) {
      console.warn("⚠️ Aucun token trouvé. Redirection vers /login.");
      navigate("/login");
      return;
    }
  
    try {
      const response = await fetch("http://localhost:5000/api/users/logout", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
  
      if (response.status === 401) {
        console.warn("🚫 Token expiré. Nettoyage et redirection.");
        localStorage.clear();
        navigate("/login");
        return;
      }
  
      if (response.ok) {
        console.log("✅ Déconnexion réussie !");
        localStorage.clear();
        navigate("/login");
      } else {
        throw new Error("Erreur lors de la déconnexion !");
      }
    } catch (error) {
      console.error("❌ Erreur de déconnexion :", error);
      alert("Erreur de connexion au serveur !");
    }
  };
   // Toggle TaskManager visibility
 // Toggle TaskManager visibility and navigate to /tasks
 const toggleTaskManager = () => {
  setShowTaskManager(!showTaskManager);
  navigate("/tasks");  // This will navigate to the /tasks path
};
  
  

    
  const fetchUserData = () => {
    const storedUser = localStorage.getItem("user");
    const storedProfilePic = localStorage.getItem("profilePic");
  
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        console.log("🔍 Utilisateur récupéré :", parsedUser);
  
        let newProfilePic = "https://upload.wikimedia.org/wikipedia/commons/a/ac/Default_pfp.jpg"; // Image par défaut
  
        if (parsedUser.profilePic && parsedUser.profilePic.trim() !== "") {
          console.log("✅ Image détectée :", parsedUser.profilePic);
          newProfilePic = parsedUser.profilePic; // Image Google ou manuelle
        } else if (storedProfilePic) {
          newProfilePic = storedProfilePic;
        } else {
          console.warn("⚠️ Aucune `profilePic` trouvée, utilisation de l'image par défaut.");
        }
  
        setProfilePic(newProfilePic);
        setImgKey(Date.now()); // 🔄 Force le rechargement de l’image
      } catch (error) {
        console.error("❌ Erreur de parsing `user` :", error);
      }
    }
  };
  
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const storedProfilePic = localStorage.getItem("profilePic");
  
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        setProfilePic(storedProfilePic || "https://upload.wikimedia.org/wikipedia/commons/a/ac/Default_pfp.jpg");
      } catch (error) {
        console.error("Error parsing user data:", error);
      }
    }
  }, []);
  useEffect(() => {
    fetchUserData();
  }, [user]); // Met à jour lorsque `user` change
  

  useEffect(() => {
    const handleStorageChange = () => {
      console.log("♻️ Changement détecté dans `localStorage` !");
      fetchUserData();
    };

    window.addEventListener("storage", handleStorageChange);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get("token");
    const user = urlParams.get("user");

    if (token) {
      console.log("🔑 Token récupéré :", token);
      localStorage.setItem("token", token);
    }

    if (user) {
      try {
        console.log("👤 Utilisateur récupéré :", user);
        const parsedUser = JSON.parse(user);
        console.log("👀 Données utilisateur après parsing :", parsedUser);

        localStorage.setItem("user", JSON.stringify(parsedUser));
        localStorage.setItem("profilePic", parsedUser.profilePic || "https://upload.wikimedia.org/wikipedia/commons/a/ac/Default_pfp.jpg");

        fetchUserData(); // 🔄 Met à jour l’image immédiatement après connexion
      } catch (error) {
        console.error("❌ Erreur de parsing des données utilisateur :", error);
      }
    } else {
      console.warn("⚠️ Aucune donnée utilisateur dans l'URL après connexion.");
    }
  }, []);

 
  
  return (
    <div>
       <>
  <title>FlowPi</title>
  <meta charSet="utf-8" />
  <meta
    name="viewport"
    content="width=device-width, initial-scale=1, shrink-to-fit=no"
  />
  
  {/* Dark mode */}
  {/* Favicon */}
  <link rel="shortcut icon" href="assets/images/favicon.ico" />
  <link rel="preconnect" href="https://fonts.googleapis.com/" />
  <link rel="preconnect" href="https://fonts.gstatic.com/" crossOrigin="" />
  <link
    rel="stylesheet"
    href="https://fonts.googleapis.com/css2?family=Heebo:wght@400;500;700&family=Roboto:wght@400;500;700&display=swap"
  />
  <link
    rel="stylesheet"
    type="text/css"
    href="assets/vendor/font-awesome/css/all.min.css"
  />
  <link
    rel="stylesheet"
    type="text/css"
    href="assets/vendor/bootstrap-icons/bootstrap-icons.css"
  />
  <link
    rel="stylesheet"
    type="text/css"
    href="assets/vendor/choices/css/choices.min.css"
  />
  <link rel="stylesheet" type="text/css" href="assets/vendor/aos/aos.css" />
  <link rel="stylesheet" type="text/css" href="assets/css/style.css" />
  <header className="navbar-light navbar-sticky">
    <nav className="navbar navbar-expand-xl">
      <div className="container">
       
        {/* Logo END */}
        {/* Responsive navbar toggler */}
        <button
          className="navbar-toggler ms-auto"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarCollapse"
          aria-controls="navbarCollapse"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-animation">
            <span />
            <span />
            <span />
          </span>
        </button>
        <div className="navbar-collapse w-100 collapse" id="navbarCollapse">
          <ul className="navbar-nav navbar-nav-scroll mx-auto">
            <li className="nav-item dropdown">
              <a
                className="nav-link dropdown-toggle"
                href="#"
                id="demoMenu"
                data-bs-toggle="dropdown"
                aria-haspopup="true"
                aria-expanded="false"
              >
                Demos
              </a>
              <ul className="dropdown-menu" aria-labelledby="demoMenu">
                <li>
                  {" "}
                  <a className="dropdown-item" href="">
                    Home Default
                  </a>
                </li>
              </ul>
            </li>
            {/* Nav item 2 Pages */}
            
              
            <li className="nav-item dropdown">
              <a
                className="nav-link dropdown-toggle"
                href="#"
                id="accounntMenu"
                data-bs-toggle="dropdown"
                aria-haspopup="true"
                aria-expanded="false"
              >
                Accounts
              </a>
              <ul className="dropdown-menu" aria-labelledby="accounntMenu">
                <li className="dropdown-submenu dropend">
                  <a className="dropdown-item dropdown-toggle" href="#">
                    <i className="fas fa-user-tie fa-fw me-1" />
                    Instructor
                  </a>
                  <ul
                    className="dropdown-menu dropdown-menu-start"
                    data-bs-popper="none"
                  >
                    <li>
                      {" "}
                      <a
                        className="dropdown-item"
                        href="instructor-dashboard.html"
                      >
                        <i className="bi bi-grid-fill fa-fw me-1" />
                        Dashboard
                      </a>{" "}
                    </li>
                    <li>
                      {" "}
                      <a
                        className="dropdown-item"
                        href="#"
                        onClick={handleNavigateToTutorsDeliverables}
                      >
                        <i className="bi bi-basket-fill fa-fw me-1" />
                          Deliverables
                      </a>{" "}
                    </li>
                    <li>
                      {" "}
                      <a
                        className="dropdown-item"
                        href="instructor-create-course.html"
                      >
                        <i className="bi bi-file-earmark-plus-fill fa-fw me-1" />
                        Create Course
                      </a>{" "}
                    </li>
                    <li>
                      {" "}
                      <a className="dropdown-item" href="course-added.html">
                        <i className="bi bi-file-check-fill fa-fw me-1" />
                        Course Added
                      </a>{" "}
                    </li>
                    <li>
                      {" "}
                      <a className="dropdown-item" href="instructor-quiz.html">
                        <i className="bi bi-question-diamond fa-fw me-1" />
                        Quiz
                      </a>{" "}
                    </li>
                    <li>
                      {" "}
                      <a
                        className="dropdown-item"
                        href="instructor-earning.html"
                      >
                        <i className="fas fa-chart-line fa-fw me-1" />
                        Earnings
                      </a>{" "}
                    </li>
                    <li>
                      {" "}
                      <a
                        className="dropdown-item"
                        href="instructor-studentlist.html"
                      >
                        <i className="fas fa-user-graduate fa-fw me-1" />
                        Students
                      </a>{" "}
                    </li>
                    <li>
                      {" "}
                      <a className="dropdown-item" href="instructor-order.html">
                        <i className="bi bi-cart-check-fill fa-fw me-1" />
                        Orders
                      </a>{" "}
                    </li>
                    <li>
                      {" "}
                      <a
                        className="dropdown-item"
                        href="instructor-review.html"
                      >
                        <i className="bi bi-star-fill fa-fw me-1" />
                        Reviews
                      </a>{" "}
                    </li>
                    <li>
                      {" "}
                      <a
                        className="dropdown-item"
                        href="instructor-payout.html"
                      >
                        <i className="fas fa-wallet fa-fw me-1" />
                        Payout
                      </a>{" "}
                    </li>
                  </ul>
                </li>
                <li className="dropdown-submenu dropend">
                  <a className="dropdown-item dropdown-toggle" href="#">
                    <i className="fas fa-user-graduate fa-fw me-1" />
                    Student
                  </a>
                  <ul
                    className="dropdown-menu dropdown-menu-start"
                    data-bs-popper="none"
                  >
                    <li>
                      {" "}
                      <a
                        className="dropdown-item"
                        href="student-dashboard.html"
                      >
                        <i className="bi bi-grid-fill fa-fw me-1" />
                        Dashboard
                      </a>{" "}
                    </li>
                    <li className="dropdown-submenu dropend">
                  <a className="dropdown-item dropdown-toggle" href="#">
                    <i className="fas fa-user-graduate fa-fw me-1" />
                    My Deliverables
                  </a>
                  <ul
                    className="dropdown-menu dropdown-menu-start"
                    data-bs-popper="none"
                  >
                    
                    <li>
                      {" "}
                      <a
                        className="dropdown-item"
                        href="#"
                        onClick={handleNavigateToDeliverables}
                      >
                        <i className="bi bi-card-checklist fa-fw me-1" />
                        My Deliverables History
                      </a>{" "}
                    </li>
                    <li>
                      {" "}
                      <a
                        className="dropdown-item"
                        href="#"
                        onClick={handleNavigateToReturnDeliverable}
                      >
                        <i className="bi bi-card-checklist fa-fw me-1" />
                        Add Deliverable
                      </a>{" "}
                    </li>
                    
                  </ul>
                </li>
                    <li>
                      {" "}
                      <a
                        className="dropdown-item"
                        href="#"
                        onClick={handleNavigateToDeliverables}
                      >
                        <i className="bi bi-card-checklist fa-fw me-1" />
                        My Deliverables
                      </a>{" "}
                    </li>
                    <li>
                      {" "}
                      <a
                        className="dropdown-item"
                        href="student-course-list.html"
                      >
                        <i className="bi bi-basket-fill fa-fw me-1" />
                        Courses
                      </a>{" "}
                    </li>
                    <li>
                      {" "}
                      <a
                        className="dropdown-item"
                        href="student-course-resume.html"
                      >
                        <i className="far fa-fw fa-file-alt me-1" />
                        Course Resume
                      </a>{" "}
                    </li>
                    <li>
                      {" "}
                      <a className="dropdown-item" href="student-quiz.html">
                        <i className="bi bi-question-diamond fa-fw me-1" />
                        Quiz{" "}
                      </a>{" "}
                    </li>
                    <li>
                      {" "}
                      <a
                        className="dropdown-item"
                        href="student-payment-info.html"
                      >
                        <i className="bi bi-credit-card-2-front-fill fa-fw me-1" />
                        Payment Info
                      </a>{" "}
                    </li>
                    <li>
                      {" "}
                      <a className="dropdown-item" href="student-bookmark.html">
                        <i className="fas bi-cart-check-fill fa-fw me-1" />
                        Wishlist
                      </a>{" "}
                    </li>
                  </ul>
                </li>
                <li>
                  {" "}
                  <a className="dropdown-item" href="admin-dashboard.html">
                    <i className="fas fa-user-cog fa-fw me-1" />
                    Admin
                  </a>{" "}
                </li>
                <li>
                  {" "}
                  <hr className="dropdown-divider" />
                </li>
                <li>
                  {" "}
                  <a
                    className="dropdown-item"
                    href=""
                  >
                    <a className=""onClick={handleEditProfile} >
                    <i className="fas fa-fw fa-cog me-1" />
                    Edit Profile
                    </a>
                  </a>{" "}
                </li>
                
                <li>
                  {" "}
                  <a
                    className="dropdown-item"
                    href=""
                  >
                  <a onClick={toggleTaskManager}>
                  <i  className="fas fa-solid fa-list-check me-1"/>
                  Tasks 
                  </a>
                  </a>{" "}
                  </li>
                <li>
                  {" "}
                  <a
                    className="dropdown-item"
                    href="instructor-delete-account.html"
                  >
                    <i className="fas fa-fw fa-trash-alt me-1" />
                    Delete Profile
                  </a>{" "}
                </li>
                <li>
                  {" "}
                  <hr className="dropdown-divider" />
                </li>
                <li className="dropdown-submenu dropend">
                  <a className="dropdown-item dropdown-toggle" href="#">
                    Dropdown levels
                  </a>
                  <ul
                    className="dropdown-menu dropdown-menu-start"
                    data-bs-popper="none"
                  >
                    <li className="dropdown-submenu dropend">
                      <a className="dropdown-item dropdown-toggle" href="#">
                        Dropdown (end)
                      </a>
                      <ul className="dropdown-menu" data-bs-popper="none">
                        <li>
                          {" "}
                          <a className="dropdown-item" href="#">
                            Dropdown item
                          </a>{" "}
                        </li>
                        <li>
                          {" "}
                          <a className="dropdown-item" href="#">
                            Dropdown item
                          </a>{" "}
                        </li>
                      </ul>
                    </li>
                    <li>
                      {" "}
                      <a className="dropdown-item" href="#">
                        Dropdown item
                      </a>{" "}
                    </li>
                    <li className="dropdown-submenu dropstart">
                      <a className="dropdown-item dropdown-toggle" href="#">
                        Dropdown (start)
                      </a>
                      <ul
                        className="dropdown-menu dropdown-menu-end"
                        data-bs-popper="none"
                      >
                        <li>
                          {" "}
                          <a className="dropdown-item" href="#">
                            Dropdown item
                          </a>{" "}
                        </li>
                        <li>
                          {" "}
                          <a className="dropdown-item" href="#">
                            Dropdown item
                          </a>{" "}
                        </li>
                      </ul>
                    </li>
                    <li>
                      {" "}
                      <a className="dropdown-item" href="#">
                        Dropdown item
                      </a>{" "}
                    </li>
                  </ul>
                </li>
              </ul>
            </li>
            <li className="nav-item">
              <a className="nav-link" onClick={handleMessages}>
                Messages
              </a>
            </li>
            <li className="nav-item">
  <a className="nav-link" href="http://localhost:3000/InvitationList">
    Invitations to Join Groups
  </a>
</li>
<li className="nav-item">
  <a className="nav-link" href="create-group">
    Create Groups
  </a>
</li>
<li className="nav-item">
  <a className="nav-link" href="Project-Manager">
   Projects
  </a>
</li>
<li className="nav-item">
  <a className="nav-link" href="AttendancePerStudent">
   Attendance
  </a>
</li>

            <li className="nav-item dropdown">
              <a
                className="nav-link"
                href="#"
                id="advanceMenu"
                data-bs-toggle="dropdown"
                aria-haspopup="true"
                aria-expanded="false"
              >
                <i className="fas fa-ellipsis-h" />
              </a>
              <ul
                className="dropdown-menu dropdown-menu-end min-w-auto"
                data-bs-popper="none"
              >
                <li>
                  <a
                    className="dropdown-item"
                    href="https://support.webestica.com/"
                    target="_blank"
                  >
                    <i className="text-warning fa-fw bi bi-life-preserver me-2" />
                    Support
                  </a>
                </li>
                <li>
                  <a
                    className="dropdown-item"
                    href="docs/index.html"
                    target="_blank"
                  >
                    <i className="text-danger fa-fw bi bi-card-text me-2" />
                    Documentation
                  </a>
                </li>
                <li>
                  {" "}
                  <hr className="dropdown-divider" />
                </li>
                <li>
                  
                </li>
                <li>
                  <a
                    className="dropdown-item"
                    href="https://themes.getbootstrap.com/store/webestica/"
                    target="_blank"
                  >
                    <i className="text-success fa-fw bi bi-cloud-download-fill me-2" />
                    Buy Flowpi!
                  </a>
                </li>
                <li>
                  {" "}
                  <hr className="dropdown-divider" />
                </li>
                <li>
                  <a
                    className="dropdown-item"
                    href="docs/alerts.html"
                    target="_blank"
                  >
                    <i className="text-orange fa-fw bi bi-puzzle-fill me-2" />
                    Components
                  </a>
                </li>
                <li>
                  <a className="dropdown-item" href="docs/snippets.html">
                    <i className="text-purple fa-fw bi bi-stickies-fill me-2" />
                    Snippets
                  </a>
                </li>
              </ul>
            </li>
          </ul>
       
   
          
           <div>
           {profilePic ? (
  <img
    key={imgKey}
    src={profilePic.startsWith("http") ? profilePic : `http://localhost:5000/uploads/${profilePic}`}
    alt="Profile"
    style={{ width: "50px", height: "50px", borderRadius: "50%" }}
    onError={(e) => {
      console.warn("⚠️ Image introuvable :", profilePic);
      e.target.src = "https://upload.wikimedia.org/wikipedia/commons/a/ac/Default_pfp.jpg"; 
    }}
  />
) : (
  <p>🚫 Aucune image trouvée</p>
)}

                </div>
          <div className="nav my-3 my-xl-0 px-4 flex-nowrap align-items-center">
           <button className='btn btn-light rounded btn-md' onClick={logoutUser}>logout</button>
          </div>
        </div>
     
      </div>
    </nav>
  </header>
 <main>
    <section className="pt-0">
      <div className="container">
        <div className="row">
          <div className="col-xl-3">
            <div
              className="offcanvas-xl offcanvas-end"
              tabIndex={-1}
              id="offcanvasSidebar"
            >
              <div className="offcanvas-header bg-light">
                <h5 className="offcanvas-title" id="offcanvasNavbarLabel">
                  My profile
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  data-bs-dismiss="offcanvas"
                  data-bs-target="#offcanvasSidebar"
                  aria-label="Close"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      {children}
    </section>

  </main>
  <footer className="bg-dark p-3">
    <div className="container">
      <div className="row align-items-center">
        <div className="col-md-4 text-center text-md-start mb-3 mb-md-0">
          
        </div>
        {/* Widget */}
        <div className="col-md-4 mb-3 mb-md-0">
          <div className="text-center text-white text-primary-hover">
            Copyrights ©2025 Flowpi. Build by{" "}
            <a
              href="https://www.webestica.com/"
              target="_blank"
              className="text-white"
            >
              Webestica
            </a>
            .
          </div>
        </div>
        <div className="col-md-4">
          <ul className="list-inline mb-0 text-center text-md-end">
            <li className="list-inline-item ms-2">
              <a href="#">
                <i className="text-white fab fa-facebook" />
              </a>
            </li>
            <li className="list-inline-item ms-2">
              <a href="#">
                <i className="text-white fab fa-instagram" />
              </a>
            </li>
            <li className="list-inline-item ms-2">
              <a href="#">
                <i className="text-white fab fa-linkedin-in" />
              </a>
            </li>
            <li className="list-inline-item ms-2">
              <a href="#">
                <i className="text-white fab fa-twitter" />
              </a>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </footer>
  <div className="back-top">
    <i className="bi bi-arrow-up-short position-absolute top-50 start-50 translate-middle" />
  </div>
 </>
    </div>
  )
}

export default LayoutStudent