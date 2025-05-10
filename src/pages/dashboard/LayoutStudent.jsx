import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHome, faTasks, faUsers, faProjectDiagram,
  faEnvelope, faBell, faMoon, faSun, faUserEdit,
  faSignOutAlt, faGraduationCap, faChalkboardTeacher,
  faClipboardList, faFileUpload, faInbox, faCaretDown,
  faCode // For FlowPi logo
} from "@fortawesome/free-solid-svg-icons";
import "./LayoutStudent.css";

const LayoutStudent = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [profilePic, setProfilePic] = useState(null);
  const [showTaskManager, setShowTaskManager] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showAccountsDropdown, setShowAccountsDropdown] = useState(false);
  const [showStudentDropdown, setShowStudentDropdown] = useState(false);
  const [showInstructorDropdown, setShowInstructorDropdown] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [darkMode, setDarkMode] = useState(localStorage.getItem("theme") === "dark");

  // Default profile image
  const DEFAULT_PROFILE_PIC = "https://upload.wikimedia.org/wikipedia/commons/a/ac/Default_pfp.jpg";
  const pro = localStorage.getItem("profilePic");
  const photo = `http://localhost:5000/uploads/profiles/${pro}`;
  console.log("aaa",pro);
  console.log("aaa",photo);

  useEffect(() => {
    // Get user data and profile picture from localStorage
    const fetchUserData = () => {
      try {
        const storedUser = localStorage.getItem("user");
        const storedProfilePic = localStorage.getItem("profilePic");


        if (storedUser) {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);

          // Set profile picture with appropriate path
          if (storedProfilePic) {
            setProfilePic(
              storedProfilePic.startsWith("http")
                ? storedProfilePic
                : `http://localhost:5000/uploads/${storedProfilePic}`
            );
          } else {
            setProfilePic(DEFAULT_PROFILE_PIC);
          }
        }
      } catch (error) {
        console.error("Error parsing user data:", error);
        setProfilePic(DEFAULT_PROFILE_PIC);
      }
    };

    fetchUserData();

    // Listen for localStorage changes
    const handleStorageChange = () => {
      fetchUserData();
    };

    // Listen for custom profile update event
    const handleProfileUpdate = (event) => {
      console.log("Profile update detected:", event.detail);
      const newProfilePic = event.detail.profilePic;
      if (newProfilePic) {
        setProfilePic(
          newProfilePic.startsWith("http")
            ? newProfilePic
            : `http://localhost:5000/uploads/${newProfilePic}`
        );
      }
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("profileUpdated", handleProfileUpdate);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("profileUpdated", handleProfileUpdate);
    };
  }, []);

  // Check for URL parameters (token and user) after login
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get("token");
    const user = urlParams.get("user");

    if (token) {
      localStorage.setItem("token", token);
    }

    if (user) {
      try {
        const parsedUser = JSON.parse(user);
        localStorage.setItem("user", JSON.stringify(parsedUser));
        localStorage.setItem("profilePic", parsedUser.profilePic || DEFAULT_PROFILE_PIC);
      } catch (error) {
        console.error("Error parsing user data from URL:", error);
      }
    }
  }, []);

  // Add click outside listener to close dropdowns
  useEffect(() => {
    function handleClickOutside(event) {
      // Close dropdowns when clicking outside
      if (!event.target.closest('.accounts-dropdown-container') &&
        !event.target.closest('.accounts-toggle')) {
        setShowAccountsDropdown(false);
        setShowStudentDropdown(false);
        setShowInstructorDropdown(false);
      }

      if (!event.target.closest('.profile-dropdown') &&
        !event.target.closest('.profile-section')) {
        setShowProfileDropdown(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Navigation handlers
  const handleEditProfile = () => {
    navigate("/edit-profile-student");
    setShowProfileDropdown(false);
  };

  const handleNavigateToDeliverables = () => {
    navigate("/deliverables-history");
    setShowMobileMenu(false);
    setShowAccountsDropdown(false);
    setShowStudentDropdown(false);
  };

  const handleNavigateToReturnDeliverable = () => {
    navigate("/return-deliverable");
    setShowMobileMenu(false);
    setShowAccountsDropdown(false);
    setShowStudentDropdown(false);
  };

  const handleNavigateToTutorsDeliverables = () => {
    navigate("/tutors-deliverables");
    setShowMobileMenu(false);
    setShowAccountsDropdown(false);
    setShowInstructorDropdown(false);
  };

  const toggleTaskManager = () => {
    setShowTaskManager(!showTaskManager);
    navigate("/tasks");
    setShowMobileMenu(false);
  };

  // Add these navigation handlers
  const handleNavigateToHome = () => {
    navigate("/student-dashboard");
    setShowMobileMenu(false);
  };

  const handleNavigateToInvitations = () => {
    navigate("/InvitationList");
    setShowMobileMenu(false);
  };

  const handleNavigateToGroups = () => {
    navigate("/create-group");
    setShowMobileMenu(false);
  };

  const handleNavigateToProjects = () => {
    navigate("/Project-Manager");
    setShowMobileMenu(false);
  };

  const handleNavigateToStudentDashboard = () => {
    navigate("/student-dashboard");
    setShowMobileMenu(false);
    setShowAccountsDropdown(false);
    setShowStudentDropdown(false);
  };

  // Logout handler
  const logoutUser = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      const response = await fetch("http://localhost:5000/api/users/logout", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.status === 401 || response.ok) {
        localStorage.clear();
        navigate("/login");
      } else {
        throw new Error("Logout failed");
      }
    } catch (error) {
      console.error("Logout error:", error);
      alert("Server connection error!");
    }
  };

  // Toggle dropdowns
  const toggleProfileDropdown = () => {
    setShowProfileDropdown(!showProfileDropdown);
  };

  const toggleAccountsDropdown = (e) => {
    e.preventDefault();
    setShowAccountsDropdown(!showAccountsDropdown);
    if (showAccountsDropdown) {
      setShowStudentDropdown(false);
      setShowInstructorDropdown(false);
    }
  };

  const toggleStudentDropdown = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setShowStudentDropdown(!showStudentDropdown);
    setShowInstructorDropdown(false);
  };

  const toggleInstructorDropdown = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setShowInstructorDropdown(!showInstructorDropdown);
    setShowStudentDropdown(false);
  };

  // Toggle mobile menu
  const toggleMobileMenu = () => {
    setShowMobileMenu(!showMobileMenu);
  };

  // Add this useEffect to properly handle Bootstrap's navbar
  useEffect(() => {
    // This ensures Bootstrap's collapse functionality works correctly
    const navbarCollapse = document.querySelector('.navbar-collapse');
    if (navbarCollapse) {
      if (showMobileMenu) {
        navbarCollapse.classList.add('show');
      } else {
        navbarCollapse.classList.remove('show');
      }
    }
  }, [showMobileMenu]);

  // Toggle dark mode
  const toggleDarkMode = () => {
    if (darkMode) {
      document.documentElement.setAttribute("data-theme", "light");
      localStorage.setItem("theme", "light");
      setDarkMode(false);
    } else {
      document.documentElement.setAttribute("data-theme", "dark");
      localStorage.setItem("theme", "dark");
      setDarkMode(true);
    }
  };

  // Check if a nav link is active
  const isActive = (path) => {
    return location.pathname === path;
  };

  const navbarStyles = {
    navbar: {
      height: '50px',
      minHeight: '50px'
    },
    navLink: {
      padding: '0.5rem 1rem'
    }
  };

  return (
    <div className="layout-container">
      <header className="navbar-header fixed-top">
        <nav className="navbar navbar-expand-xl shadow-sm" style={navbarStyles.navbar}>
          <div className="container">
            {/* Logo */}
            <div className="navbar-brand" onClick={handleNavigateToHome} style={{ cursor: 'pointer' }}>
              <FontAwesomeIcon icon={faCode} className="me-2" />
              FlowPi
            </div>

            {/* Responsive navbar toggler */}
            <button
              className={`navbar-toggler ${showMobileMenu ? 'collapsed' : ''}`}
              type="button"
              onClick={toggleMobileMenu}
              aria-expanded={showMobileMenu}
              aria-label="Toggle navigation"
            >
              <span className="navbar-toggler-icon"></span>
            </button>

            {/* Navbar collapse */}
            <div className={`collapse navbar-collapse ${showMobileMenu ? 'show' : ''}`} id="navbarCollapse">
              <ul className="navbar-nav navbar-nav-scroll mx-auto">
                {/* Account dropdown */}
                <li className="nav-item dropdown accounts-dropdown-container position-relative">
                  <a
                    className="nav-link dropdown-toggle accounts-toggle"
                    href="#"
                    onClick={toggleAccountsDropdown}
                  >
                    Accounts
                  </a>

                  {showAccountsDropdown && (
                    <ul className="dropdown-menu show shadow" style={{
                      position: 'absolute',
                      top: '100%',
                      left: 0,
                      zIndex: 1000,
                      minWidth: '200px'
                    }}>
                      {/* Student section */}
                      <li className="dropdown-item dropdown-submenu position-relative">
                        <a href="#" className="d-flex justify-content-between align-items-center" onClick={toggleStudentDropdown}>
                          <span>
                            Student
                          </span>
                          <FontAwesomeIcon icon={faCaretDown} />
                        </a>

                        {showStudentDropdown && (
                          <ul className="dropdown-menu submenu show shadow" style={{
                            position: 'absolute',
                            top: 0,
                            left: '100%',
                            zIndex: 1001,
                            minWidth: '200px'
                          }}>
                            <li>
                              <div
                                className="dropdown-item"
                                onClick={handleNavigateToStudentDashboard}
                                style={{ cursor: 'pointer' }}
                              >
                                Dashboard
                              </div>
                            </li>
                            <li>
                              <div
                                className="dropdown-item"
                                onClick={handleNavigateToDeliverables}
                                style={{ cursor: 'pointer' }}
                              >
                                My Deliverables
                              </div>
                            </li>
                            <li>
                              <div
                                className="dropdown-item"
                                onClick={handleNavigateToReturnDeliverable}
                                style={{ cursor: 'pointer' }}
                              >
                                Add Deliverable
                              </div>
                            </li>
                          </ul>
                        )}
                      </li>

                      {/* Instructor section */}
                      <li className="dropdown-item dropdown-submenu position-relative">
                        <a href="#" className="d-flex justify-content-between align-items-center" onClick={toggleInstructorDropdown}>
                          <span>
                            Instructor
                          </span>
                          <FontAwesomeIcon icon={faCaretDown} />
                        </a>

                        {showInstructorDropdown && (
                          <ul className="dropdown-menu submenu show shadow" style={{
                            position: 'absolute',
                            top: 0,
                            left: '100%',
                            zIndex: 1001,
                            minWidth: '200px'
                          }}>
                            <li>
                              <div
                                className="dropdown-item"
                                onClick={handleNavigateToTutorsDeliverables}
                                style={{ cursor: 'pointer' }}
                              >
                                Deliverables
                              </div>
                            </li>
                          </ul>
                        )}
                      </li>
                    </ul>
                  )}
                </li>

                {/* Main navigation items */}
                <li className="nav-item">
                  <div
                    className={`nav-link ${isActive('/InvitationList') ? 'active' : ''}`}
                    onClick={handleNavigateToInvitations}
                    style={{ cursor: 'pointer', ...navbarStyles.navLink }}
                  >
                    Invitations
                  </div>
                </li>
                <li className="nav-item">
                  <div
                    className={`nav-link ${isActive('/create-group') ? 'active' : ''}`}
                    onClick={handleNavigateToGroups}
                    style={{ cursor: 'pointer', ...navbarStyles.navLink }}
                  >
                    Groups
                  </div>
                </li>
                <li className="nav-item">
                  <div
                    className={`nav-link ${isActive('/Project-Manager') ? 'active' : ''}`}
                    onClick={handleNavigateToProjects}
                    style={{ cursor: 'pointer', ...navbarStyles.navLink }}
                  >
                    Projects
                  </div>
                </li>
                <li className="nav-item">
                  <a className={`nav-link ${isActive('/tasks') ? 'active' : ''}`} onClick={toggleTaskManager} style={{ cursor: 'pointer' }}>
                    Tasks
                  </a>
                </li>
              </ul>

              {/* Right side controls */}
              <div className="d-flex align-items-center">
                {/* Dark mode toggle */}
                <div className="nav-item me-3">
                  <a className="nav-link px-2" onClick={toggleDarkMode} style={{ cursor: 'pointer' }}>
                    <FontAwesomeIcon icon={darkMode ? faSun : faMoon} />
                  </a>
                </div>



                {/* Profile dropdown menu */}
                <div className="profile-section position-relative">
                  <div onClick={toggleProfileDropdown} style={{ cursor: 'pointer' }} className="d-flex align-items-center">
                    {profilePic ? (
                      <img
                        src={photo}
                        alt="Profile"
                        className="profile-image"
                        style={{ width: "40px", height: "40px", borderRadius: "50%" }}
                        onError={(e) => {
                          e.target.src = DEFAULT_PROFILE_PIC;
                        }}
                      />
                    ) : (
                      <img src={photo} alt="Default Profile" style={{ width: "40px", height: "40px", borderRadius: "50%" }} />
                    )}
                    <FontAwesomeIcon icon={faCaretDown} className="ms-2" />
                  </div>

                  {/* Dropdown menu for profile actions */}
                  {showProfileDropdown && (
                    <div className="profile-dropdown shadow" style={{
                      position: 'absolute',
                      right: 0,
                      top: '50px',
                      backgroundColor: 'white',
                      borderRadius: '8px',
                      padding: '8px 0',
                      width: '200px',
                      zIndex: 1000
                    }}>
                      <div
                        onClick={handleEditProfile}
                        className="dropdown-item d-flex align-items-center"
                        style={{ padding: '10px 15px', cursor: 'pointer' }}
                      >
                        <FontAwesomeIcon icon={faUserEdit} className="me-2" />
                        Edit Profile
                      </div>
                      <div
                        onClick={logoutUser}
                        className="dropdown-item d-flex align-items-center text-danger"
                        style={{ padding: '10px 15px', cursor: 'pointer' }}
                      >
                        <FontAwesomeIcon icon={faSignOutAlt} className="me-2" />
                        Logout
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </nav>
      </header>

      {/* Add padding to the main content to prevent it from being hidden under the fixed navbar */}
      <main style={{
        paddingTop: '80px',
        minHeight: '100vh',
        width: '100%',
        display: 'flex',
        flexDirection: 'column'
      }}>
        <section style={{ flex: 1, width: '100%' }}>
          {children}
        </section>
      </main>
    </div>
  );
};

export default LayoutStudent;
