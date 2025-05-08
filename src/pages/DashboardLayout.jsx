import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faSun, 
  faMoon, 
  faTachometerAlt, 
  faTasks, 
  faUsers, 
  faLayerGroup, 
  faProjectDiagram, 
  faBookOpen, 
  faList, 
  faCog,
  faBars,
  faSignOutAlt
} from "@fortawesome/free-solid-svg-icons";

const LayoutAdmin = ({ children, title }) => {
  const [profilePic, setProfilePic] = useState(null);
  const [userName, setUserName] = useState("Admin");
  const [darkMode, setDarkMode] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const DEFAULT_PROFILE_PIC = "https://upload.wikimedia.org/wikipedia/commons/a/ac/Default_pfp.jpg";

  // Navigation menu items
  const navItems = [
    { title: "Dashboard", icon: faTachometerAlt, path: "/admin-dashboard" },
    { title: "Tasks", icon: faTasks, path: "/dashboard-tasks" },
    { title: "Users", icon: faUsers, path: "/usersList" },
    { title: "Groups", icon: faLayerGroup, path: "/groupList" },
    { title: "Projects", icon: faProjectDiagram, path: "/ProjectAdmin" },
    { title: "Create Subjects", icon: faBookOpen, path: "/CreateSubjectAdmin" },
    { title: "All Subjects", icon: faList, path: "/SubjectAdmin" },
    { title: "Settings", icon: faCog, path: "/user-settings" }
  ];

  useEffect(() => {
    // Get user data from localStorage
    const token = localStorage.getItem("token");
    const storedProfilePic = localStorage.getItem("profilePic");
    const storedUserName = localStorage.getItem("userName");
    const storedTheme = localStorage.getItem("theme");
    const storedSidebarState = localStorage.getItem("sidebarState");
    
    // Redirect to login if no token
    if (!token) {
      navigate("/login");
      return;
    }
    
    // Set profile picture if available
    if (storedProfilePic) {
      setProfilePic(
        storedProfilePic.startsWith("http")
          ? storedProfilePic
          : `http://localhost:5000/uploads/${storedProfilePic}`
      );
    } else {
      setProfilePic(DEFAULT_PROFILE_PIC);
    }

    // Set user name if available
    if (storedUserName) {
      setUserName(storedUserName);
    }
    
    // Set theme
    setDarkMode(storedTheme === "dark");
    
    // Set sidebar state
    setSidebarCollapsed(storedSidebarState === "collapsed");
    
  }, [navigate]);

  // Navigation handler
  const handleNavigateTo = (path) => {
    navigate(path);
    setMobileMenuOpen(false);
  };

  // Toggle dark mode
  const toggleDarkMode = () => {
    const newMode = !darkMode;
    document.documentElement.setAttribute("data-theme", newMode ? "dark" : "light");
    localStorage.setItem("theme", newMode ? "dark" : "light");
    setDarkMode(newMode);
  };

  // Toggle sidebar collapse
  const toggleSidebar = () => {
    const newState = !sidebarCollapsed;
    localStorage.setItem("sidebarState", newState ? "collapsed" : "expanded");
    setSidebarCollapsed(newState);
  };

  // Toggle mobile menu
  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  // Logout function
  const logoutUser = () => {
    // Clear localStorage
    localStorage.removeItem("token");
    localStorage.removeItem("profilePic");
    localStorage.removeItem("userName");
    localStorage.removeItem("userRole");
    localStorage.removeItem("user");
    navigate("/login");
  };

  // Check if a nav item is active
  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <div className={`layout-container ${darkMode ? "dark-mode" : ""}`}>
      {/* Top Navbar */}
      <header className="top-navbar">
        <div className="top-navbar-left">
          <button 
            className="sidebar-toggle-btn" 
            onClick={toggleSidebar}
            aria-label="Toggle sidebar"
          >
            <FontAwesomeIcon icon={faBars} />
          </button>
          <h1 className="app-title">FlowPi</h1>
        </div>
        
        <div className="page-title">
          <h2>{title}</h2>
        </div>
        
        <div className="top-navbar-right">
          {/* Dark mode toggle */}
          <button 
            className="theme-toggle-btn" 
            onClick={toggleDarkMode} 
            aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
          >
            <FontAwesomeIcon icon={darkMode ? faSun : faMoon} />
          </button>
          
          {/* User Profile */}
          <div className="user-profile-dropdown">
            <div className="user-profile-trigger">
              <div className="user-info">
                <img
                  src={profilePic || DEFAULT_PROFILE_PIC}
                  alt="User Profile"
                  className="profile-image"
                  onError={(e) => {
                    e.target.src = DEFAULT_PROFILE_PIC;
                  }}
                />
                <div className="user-details">
                  <span className="user-name">{userName}</span>
                  <span className="user-role">Admin</span>
                </div>
              </div>
              <div className="dropdown-content">
                <div className="dropdown-item" onClick={() => handleNavigateTo("/edit-profile")}>My Profile</div>
                <div className="dropdown-item" onClick={() => handleNavigateTo("/user-settings")}>Account Settings</div>
                <div className="dropdown-divider"></div>
                <button className="logout-btn" onClick={logoutUser}>
                  <FontAwesomeIcon icon={faSignOutAlt} className="me-2" />
                  Logout
                </button>
              </div>
            </div>
          </div>
          
          {/* Mobile menu button */}
          <button 
            className="mobile-menu-toggle" 
            onClick={toggleMobileMenu}
            aria-expanded={mobileMenuOpen}
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>
      </header>

      {/* Mobile menu overlay */}
      <div className={`mobile-menu-overlay ${mobileMenuOpen ? "active" : ""}`} onClick={toggleMobileMenu}></div>

      {/* Main container */}
      <div className="main-container">
        {/* Sidebar */}
        <aside className={`sidebar ${sidebarCollapsed ? "collapsed" : ""} ${mobileMenuOpen ? "mobile-open" : ""}`}>
          <div className="sidebar-content">
            <div className="sidebar-header">
              <div className="sidebar-logo">
                {!sidebarCollapsed && <span>Admin Panel</span>}
              </div>
            </div>
            
            <nav className="sidebar-nav">
              <ul className="nav-list">
                {navItems.map((item, index) => (
                  <li key={index} className={`nav-item ${isActive(item.path) ? "active" : ""}`}>
                    <button 
                      className="nav-link" 
                      onClick={() => handleNavigateTo(item.path)}
                    >
                      <FontAwesomeIcon icon={item.icon} className="nav-icon" />
                      {!sidebarCollapsed && <span className="nav-text">{item.title}</span>}
                      {sidebarCollapsed && <span className="tooltip">{item.title}</span>}
                    </button>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </aside>

        {/* Main Content */}
        <main className={`main-content ${sidebarCollapsed ? "expanded" : ""}`}>
          <div className="content-wrapper">
            {children}
          </div>
        </main>
      </div>

      <style jsx>{`
        :root {
          /* Primary colors - softer blue palette */
          --primary-color: #3b82f6;
          --primary-light: #60a5fa;
          --primary-dark: #2563eb;
          
          /* Background colors - clean and light */
          --bg-color: #f9fafb;
          --content-bg: #ffffff;
          
          /* Text colors - improved readability */
          --text-color: #1f2937;
          --text-light: #6b7280;
          
          /* UI elements */
          --border-color: #e5e7eb;
          --shadow-color: rgba(0, 0, 0, 0.05);
          
          /* Navbar and Sidebar */
          --navbar-bg: #1e40af;
          --navbar-text: #f3f4f6;
          --sidebar-bg: #1e40af;
          --sidebar-text: #f3f4f6;
          --sidebar-active: rgba(255, 255, 255, 0.15);
          --sidebar-hover: rgba(255, 255, 255, 0.1);
          
          /* Dimensions */
          --sidebar-width: 250px;
          --sidebar-collapsed-width: 70px;
          --navbar-height: 64px;
          --transition-speed: 0.3s;
          
          /* Status colors */
          --success: #10b981;
          --warning: #f59e0b;
          --danger: #ef4444;
          --info: #3b82f6;
        }

        .dark-mode {
          /* Dark mode - softer contrast */
          --primary-color: #60a5fa;
          --primary-light: #93c5fd;
          --primary-dark: #3b82f6;
          
          /* Background colors - dark but not too harsh */
          --bg-color: #111827;
          --content-bg: #1f2937;
          
          /* Text colors - better readability in dark mode */
          --text-color: #f9fafb;
          --text-light: #d1d5db;
          
          /* UI elements */
          --border-color: #374151;
          --shadow-color: rgba(0, 0, 0, 0.2);
          
          /* Navbar and Sidebar */
          --navbar-bg: #111827;
          --navbar-text: #f9fafb;
          --sidebar-bg: #111827;
          --sidebar-text: #f9fafb;
          --sidebar-active: rgba(96, 165, 250, 0.2);
          --sidebar-hover: rgba(96, 165, 250, 0.1);
          
          /* Status colors - slightly muted for dark mode */
          --success: #34d399;
          --warning: #fbbf24;
          --danger: #f87171;
          --info: #60a5fa;
        }

        /* Reset & Base Styles */
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        .layout-container {
          display: flex;
          flex-direction: column;
          min-height: 100vh;
          background-color: var(--bg-color);
          color: var(--text-color);
          transition: background-color var(--transition-speed), color var(--transition-speed);
        }

        /* Top Navbar */
        .top-navbar {
          height: var(--navbar-height);
          background-color: var(--navbar-bg);
          box-shadow: 0 1px 3px var(--shadow-color);
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 1.5rem;
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 100;
          transition: background-color var(--transition-speed);
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .top-navbar-left {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .sidebar-toggle-btn {
          background: none;
          border: none;
          color: var(--navbar-text);
          font-size: 1.25rem;
          cursor: pointer;
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          transition: all 0.2s ease;
        }

        .sidebar-toggle-btn:hover {
          background-color: rgba(255, 255, 255, 0.15);
          color: white;
          transform: rotate(90deg);
        }

        .app-title {
          font-size: 1.5rem;
          font-weight: 700;
          color: white;
          margin: 0;
          letter-spacing: 0.5px;
        }

        .page-title {
          display: flex;
          align-items: center;
          flex: 1;
          justify-content: center;
        }

        .page-title h2 {
          font-size: 1.25rem;
          font-weight: 600;
          color: white;
          margin: 0;
          position: relative;
          padding-bottom: 4px;
        }

        .page-title h2::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 50%;
          transform: translateX(-50%);
          width: 40px;
          height: 3px;
          background-color: white;
          border-radius: 3px;
        }

        .top-navbar-right {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .theme-toggle-btn {
          background: none;
          border: none;
          color: var(--navbar-text);
          font-size: 1.25rem;
          cursor: pointer;
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          transition: all 0.2s ease;
          position: relative;
          overflow: hidden;
        }

        .theme-toggle-btn:hover {
          background-color: rgba(255, 255, 255, 0.15);
          color: white;
        }

        .theme-toggle-btn::before {
          content: '';
          position: absolute;
          width: 0;
          height: 0;
          border-radius: 50%;
          background-color: rgba(255, 255, 255, 0.3);
          transform: translate(-50%, -50%);
          transition: width 0.4s ease, height 0.4s ease;
        }

        .theme-toggle-btn:active::before {
          width: 150%;
          height: 150%;
        }

        /* User Profile Dropdown */
        .user-profile-dropdown {
          position: relative;
        }

        .user-profile-trigger {
          position: relative;
        }

        .user-info {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          cursor: pointer;
          padding: 0.5rem 0.75rem;
          border-radius: 8px;
          transition: all 0.2s ease;
          background-color: rgba(0, 0, 0, 0.15);
        }

        .user-info:hover {
          background-color: rgba(0, 0, 0, 0.25);
        }

        .user-details {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
        }

        .user-name {
          font-size: 0.875rem;
          font-weight: 600;
          color: white;
        }

        .user-role {
          font-size: 0.75rem;
          color: rgba(255, 255, 255, 0.7);
        }

        .profile-image {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          object-fit: cover;
          border: none;
          transition: transform 0.2s ease;
        }

        .user-info:hover .profile-image {
          transform: scale(1.05);
        }

        .dropdown-content {
          position: absolute;
          top: calc(100% + 5px);
          right: 0;
          background-color: var(--content-bg);
          min-width: 200px;
          box-shadow: 0 5px 15px var(--shadow-color);
          border-radius: 10px;
          padding: 0.5rem 0;
          z-index: 110;
          opacity: 0;
          visibility: hidden;
          transform: translateY(10px);
          transition: all 0.3s ease;
          border: 1px solid var(--border-color);
        }

        .user-profile-trigger:hover .dropdown-content {
          opacity: 1;
          visibility: visible;
          transform: translateY(0);
        }

        .dropdown-item {
          display: flex;
          align-items: center;
          padding: 0.75rem 1rem;
          color: var(--text-color);
          text-decoration: none;
          transition: all 0.2s ease;
          font-size: 0.875rem;
          cursor: pointer;
        }

        .dropdown-item:hover {
          background-color: var(--bg-color);
          color: var(--primary-color);
          padding-left: 1.25rem;
        }

        .dropdown-divider {
          height: 1px;
          background-color: var(--border-color);
          margin: 0.5rem 0;
        }

        .logout-btn {
          width: 100%;
          display: flex;
          align-items: center;
          text-align: left;
          padding: 0.75rem 1rem;
          background: none;
          border: none;
          color: var(--danger);
          cursor: pointer;
          font-size: 0.875rem;
          transition: all 0.2s ease;
        }

        .logout-btn:hover {
          background-color: rgba(239, 68, 68, 0.1);
          color: var(--danger);
          padding-left: 1.25rem;
        }

        /* Mobile Menu Toggle */
        .mobile-menu-toggle {
          display: none;
          background: none;
          border: none;
          width: 40px;
          height: 40px;
          position: relative;
          cursor: pointer;
          border-radius: 50%;
          transition: background-color 0.2s ease;
        }

        .mobile-menu-toggle:hover {
          background-color: var(--bg-color);
        }

        .mobile-menu-toggle span {
          display: block;
          position: absolute;
          height: 3px;
          width: 24px;
          background-color: var(--text-color);
          border-radius: 3px;
          opacity: 1;
          left: 8px;
          transform: rotate(0deg);
          transition: .25s ease-in-out;
        }

        .mobile-menu-toggle span:nth-child(1) {
          top: 12px;
        }

        .mobile-menu-toggle span:nth-child(2) {
          top: 19px;
        }

        .mobile-menu-toggle span:nth-child(3) {
          top: 26px;
        }

        .mobile-menu-toggle[aria-expanded="true"] span:nth-child(1) {
          top: 19px;
          transform: rotate(45deg);
        }

        .mobile-menu-toggle[aria-expanded="true"] span:nth-child(2) {
          opacity: 0;
        }

        .mobile-menu-toggle[aria-expanded="true"] span:nth-child(3) {
          top: 19px;
          transform: rotate(-45deg);
        }

        .mobile-menu-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(0, 0, 0, 0.5);
          backdrop-filter: blur(3px);
          z-index: 98;
          opacity: 0;
          visibility: hidden;
          transition: opacity 0.3s ease;
        }

        .mobile-menu-overlay.active {
          opacity: 1;
          visibility: visible;
        }

        /* Main Container */
        .main-container {
          display: flex;
          margin-top: var(--navbar-height);
          min-height: calc(100vh - var(--navbar-height));
        }

        /* Sidebar */
        .sidebar {
          width: var(--sidebar-width);
          background-color: var(--sidebar-bg);
          box-shadow: 2px 0 5px var(--shadow-color);
          transition: width var(--transition-speed), transform var(--transition-speed), background-color var(--transition-speed);
          z-index: 99;
          overflow-x: hidden;
          position: fixed;
          top: var(--navbar-height);
          left: 0;
          bottom: 0;
        }

        .sidebar.collapsed {
          width: var(--sidebar-collapsed-width);
        }

        .sidebar-content {
          height: 100%;
          display: flex;
          flex-direction: column;
        }

        .sidebar-header {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1.5rem 1rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .sidebar-logo {
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.25rem;
          font-weight: 700;
          color: white;
        }

        .sidebar-nav {
          flex: 1;
          padding: 1rem 0;
          overflow-y: auto;
        }

        .nav-list {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .nav-item {
          margin: 0.25rem 0.75rem;
          border-radius: 10px;
          transition: background-color 0.2s, transform 0.2s;
        }

        .nav-item.active {
          background-color: var(--sidebar-active);
          box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
        }

        .nav-item.active .nav-link {
          color: white;
          font-weight: 600;
        }

        .nav-link {
          display: flex;
          align-items: center;
          padding: 0.75rem 1rem;
          color: var(--sidebar-text);
          text-decoration: none;
          border-radius: 10px;
          transition: color 0.2s, background-color 0.2s;
          position: relative;
          border: none;
          background: none;
          width: 100%;
          text-align: left;
          cursor: pointer;
        }

        .nav-link:hover {
          color: white;
          background-color: var(--primary-color);
        }
        
        .nav-item:hover {
          background-color: var(--sidebar-hover);
          transform: translateX(3px);
        }

        .nav-icon {
          font-size: 1.1rem;
          width: 24px;
          text-align: center;
          margin-right: 1rem;
          transition: margin var(--transition-speed);
          color: var(--sidebar-text);
        }

        .nav-link:hover .nav-icon {
          color: white;
        }

        .sidebar.collapsed .nav-icon {
          margin-right: 0;
        }

        .nav-text {
          font-size: 0.9rem;
          white-space: nowrap;
          color: var(--sidebar-text);
        }

        .tooltip {
          position: absolute;
          left: 100%;
          top: 50%;
          transform: translateY(-50%);
          background-color: var(--content-bg);
          color: var(--text-color);
          padding: 0.5rem 0.75rem;
          border-radius: 6px;
          font-size: 0.8rem;
          box-shadow: 0 3px 10px var(--shadow-color);
          opacity: 0;
          visibility: hidden;
          transition: all 0.2s;
          pointer-events: none;
          margin-left: 10px;
          white-space: nowrap;
          z-index: 200;
        }

        .tooltip::before {
          content: "";
          position: absolute;
          top: 50%;
          left: -6px;
          transform: translateY(-50%);
          border-style: solid;
          border-width: 6px 6px 6px 0;
          border-color: transparent var(--content-bg) transparent transparent;
        }

        .sidebar.collapsed .nav-item:hover .tooltip {
          opacity: 1;
          visibility: visible;
        }

        /* Main Content */
        .main-content {
          flex: 1;
          margin-left: var(--sidebar-width);
          transition: margin-left var(--transition-speed);
          padding: 1.5rem;
        }

        .main-content.expanded {
          margin-left: var(--sidebar-collapsed-width);
        }

        .content-wrapper {
          background-color: var(--content-bg);
          border-radius: 12px;
          padding: 1.5rem;
          box-shadow: 0 4px 6px var(--shadow-color);
          min-height: calc(100vh - var(--navbar-height) - 3rem);
          border: 1px solid var(--border-color);
        }

        /* Responsive Design */
        @media (max-width: 991.98px) {
          .page-title {
            display: none;
          }
          
          .user-details {
            display: none;
          }
        }

        @media (max-width: 767.98px) {
          .sidebar {
            transform: translateX(-100%);
            width: var(--sidebar-width) !important;
          }
          
          .sidebar.mobile-open {
            transform: translateX(0);
          }
          
          .main-content {
            margin-left: 0 !important;
            padding: 1rem;
          }
          
          .mobile-menu-toggle {
            display: block;
          }
          
          .sidebar-toggle-btn {
            display: none;
          }
          
          .app-title {
            margin: 0 auto;
          }
          
          .top-navbar-left, .top-navbar-right {
            flex: 1;
          }
          
          .top-navbar-right {
            justify-content: flex-end;
          }
        }

        @media (max-width: 575.98px) {
          .content-wrapper {
            padding: 1rem;
          }
          
          .top-navbar {
            padding: 0 1rem;
          }
        }
      `}</style>
    </div>
  );
};

export default LayoutAdmin;
