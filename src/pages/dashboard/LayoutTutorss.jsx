import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSignOutAlt, faUserEdit, faCaretDown, faCode, faTasks,
  faUsers, faProjectDiagram, faListTask, faKanban,
  faFileEarmarkCheck, faChatDots, faPeople, faBook, faCheckCircle
} from "@fortawesome/free-solid-svg-icons";
import axios from "axios";
import { io } from "socket.io-client";
import { Link } from "react-router-dom";
import "./LayoutStudent.css";
import "../tutor-interfaces/DashboardStat.css";

const LayoutTutorss = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [activeDropdown, setActiveDropdown] = useState(null);
  

  // User state
  const [user, setUser] = useState(null);
  const [profilePic, setProfilePic] = useState("");
  const [imgKey, setImgKey] = useState(Date.now());
  const [userId, setUserId] = useState(null);
  const [userName, setUserName] = useState("");
  const pro = localStorage.getItem("profilePic");
  const photo = `http://localhost:5000/uploads/profiles/${pro}`
  // UI state
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [darkMode, setDarkMode] = useState(localStorage.getItem("theme") === "dark");

  // Dashboard stats state
  const [stats, setStats] = useState({
    tasks: 0,
    tasksCompleted: 0,
    projects: 0,
    deliverables: 0,
    unreadMessages: 0,
    groups: 0,
    subjects: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Default profile image
  const DEFAULT_PROFILE_PIC = "https://upload.wikimedia.org/wikipedia/commons/a/ac/Default_pfp.jpg";

  // Navigation styles
  const navbarStyles = {
    navbar: {
      height: '50px',
      minHeight: '50px'
    },
    navLink: {
      padding: '0.5rem 1rem'
    }
  };

  // Function to toggle a specific dropdown
  const toggleDropdown = (dropdownName) => {
    if (activeDropdown === dropdownName) {
      setActiveDropdown(null); // Close if already open
    } else {
      setActiveDropdown(dropdownName); // Open this dropdown, closing others
    }
  };

  // Get user data from localStorage
  useEffect(() => {
    const user = localStorage.getItem("user");
    if (user) {
      try {
        const userData = JSON.parse(user);
        setUserId(userData.userId || userData.id);
        setUserName(userData.name || "");
        setUser(userData);

        let newProfilePic = DEFAULT_PROFILE_PIC;
        if (userData.profilePic && userData.profilePic.trim() !== "") {
          newProfilePic = userData.profilePic.startsWith("http")
            ? userData.profilePic
            : `http://localhost:5000/uploads/profiles/${userData.profilePic}`;
        } else {
          const storedProfilePic = localStorage.getItem("profilePic");
          console.log("test", storedProfilePic );
          if (storedProfilePic) {
            newProfilePic = storedProfilePic.startsWith("http")
              ? storedProfilePic
              : `http://localhost:5000/uploads/profiles/${storedProfilePic}`;
          }
        }
        setProfilePic(newProfilePic);
      } catch (err) {
        console.error("Error parsing user data:", err);
        setProfilePic(DEFAULT_PROFILE_PIC);
      }
    }
  }, []);

  // Fetch dashboard stats
  useEffect(() => {
    if (!userId) return;

    const fetchStats = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("No token found. Please login.");

        // Fetch tasks
        let tasks = [];
        try {
          const tasksResponse = await axios.get("http://localhost:5000/api/tasks/getAllTasks", {
            headers: { Authorization: `Bearer ${token}` },
          });
          tasks = Array.isArray(tasksResponse.data) ? tasksResponse.data : [];
        } catch (error) {
          console.error("Error fetching tasks:", error);
          setError("Failed to fetch tasks: " + (error.response?.data?.message || error.message));
        }

        // Fetch projects
        let projects = [];
        try {
          const projectsResponse = await axios.get("http://localhost:5000/api/projects/projects", {
            headers: { Authorization: `Bearer ${token}` },
          });
          projects = projectsResponse.data || [];
        } catch (error) {
          console.error("Error fetching projects:", error);
        }

        // Fetch deliverables
        let deliverables = [];
        try {
          const deliverablesResponse = await axios.get("http://localhost:5000/api/deliverables/history", {
            headers: { Authorization: `Bearer ${token}` },
          });
          deliverables = deliverablesResponse.data?.deliverables || [];
        } catch (error) {
          console.error("Error fetching deliverables:", error);
        }

        // Fetch unread messages
        let unreadMessagesTotal = 0;
        try {
          const messagesResponse = await axios.get("http://localhost:5000/api/messages/unread-counts-by-sender", {
            headers: { Authorization: `Bearer ${token}` },
          });
          unreadMessagesTotal = Object.values(messagesResponse.data?.counts || {}).reduce(
            (sum, count) => sum + count, 0
          );
        } catch (error) {
          console.error("Error fetching unread messages:", error);
        }

        // Fetch groups
        let groups = [];
        try {
          const groupsResponse = await axios.get("http://localhost:5000/api/groups", {
            headers: { Authorization: `Bearer ${token}` },
          });
          groups = groupsResponse.data || [];
        } catch (error) {
          console.error("Error fetching groups from /api/groups:", error);
          try {
            const groupsResponse = await axios.get("http://localhost:5000/api/group/getAll", {
              headers: { Authorization: `Bearer ${token}` },
            });
            groups = groupsResponse.data || [];
          } catch (error2) {
            console.error("Error fetching groups from /api/group/getAll:", error2);
          }
        }

        // Fetch subjects
        let subjects = [];
        try {
          const subjectsResponse = await axios.get("http://localhost:5000/api/subject/getAllSubjects", {
            headers: { Authorization: `Bearer ${token}` },
          });
          subjects = subjectsResponse.data || [];
        } catch (error) {
          console.error("Error fetching subjects:", error);
        }

        // Calculate task completion
        const completedTasks = tasks.filter(task => task.status === "completed").length;

        setStats({
          tasks: tasks.length,
          tasksCompleted: completedTasks,
          projects: projects.length,
          deliverables: deliverables.length,
          unreadMessages: unreadMessagesTotal,
          groups: groups.length,
          subjects: subjects.length,
        });
      } catch (err) {
        console.error("Error fetching stats:", err);
        setError(err.response?.data?.message || err.message || "Failed to fetch statistics");
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [userId]);

  // Socket.IO for real-time updates
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    const socket = io("http://localhost:5000", {
      auth: { token },
      transports: ['websocket', 'polling']
    });

    socket.on("connect", () => {
      console.log("Connected to Socket.IO server");
    });

    const fetchUnreadMessages = async () => {
      try {
        const messagesResponse = await axios.get("http://localhost:5000/api/messages/unread-counts-by-sender", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const unreadMessagesTotal = Object.values(messagesResponse.data?.counts || {}).reduce(
          (sum, count) => sum + count, 0
        );
        setStats(prev => ({
          ...prev,
          unreadMessages: unreadMessagesTotal,
        }));
      } catch (err) {
        console.error("Failed to update unread messages:", err);
      }
    };

    socket.on("new_message", () => {
      fetchUnreadMessages();
    });

    socket.on("message_read", () => {
      fetchUnreadMessages();
    });

    socket.on("task_updated", () => {
      const fetchTaskStats = async () => {
        try {
          const tasksResponse = await axios.get("http://localhost:5000/api/tasks/getAllTasks", {
            headers: { Authorization: `Bearer ${token}` },
          });
          const tasks = Array.isArray(tasksResponse.data) ? tasksResponse.data : [];
          const completedTasks = tasks.filter(task => task.status === "completed").length;
          setStats(prev => ({
            ...prev,
            tasks: tasks.length,
            tasksCompleted: completedTasks,
          }));
        } catch (err) {
          console.error("Failed to update task stats:", err);
        }
      };

      fetchTaskStats();
    });

    socket.on("connect_error", (err) => {
      console.error("Socket.IO connection error:", err.message);
    });

    return () => socket.disconnect();
  }, []);

  // Update click outside listener to close dropdowns
  useEffect(() => {
    function handleClickOutside(event) {
      // Check if click is outside any dropdown
      const isOutsideDropdowns =
        !event.target.closest('.dropdown-menu') &&
        !event.target.closest('.dropdown-toggle');

      if (isOutsideDropdowns) {
        setActiveDropdown(null);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Navigation handlers
  const handleNavigateToHome = () => {
    navigate("/tutor-dashboard");
    setShowMobileMenu(false);
  };

  const handleNavigateToSubjects = () => {
    navigate("/Subject-List");
    setShowMobileMenu(false);
    setActiveDropdown(null);
  };

  const handleNavigateToCreateSubject = () => {
    navigate("/Subject-Form");
    setShowMobileMenu(false);
    setActiveDropdown(null);
  };

  const handleNavigateToProjects = () => {
    navigate("/Project-Tutor");
    setShowMobileMenu(false);
  };

  const handleNavigateToGroups = () => {
    navigate("/GroupTutor");
    setShowMobileMenu(false);
    setActiveDropdown(null);
  };

  const handleNavigateToGroupAssignment = () => {
    navigate("/Subject-Assignment");
    setShowMobileMenu(false);
    setActiveDropdown(null);
  };

  const handleNavigateToTasks = () => {
    navigate("/task-manager-tutor");
    setShowMobileMenu(false);
  };

  const handleNavigateToDeliverables = () => {
    navigate("");
    setShowMobileMenu(false);
  };

  const handleEditProfile = () => {
    navigate("/edit-profile-tutor");
    setActiveDropdown(null);
  };

  const toggleMobileMenu = () => {
    setShowMobileMenu(!showMobileMenu);
  };

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

  const logoutUser = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
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

      if (response.status === 401 || response.ok) {
        localStorage.clear();
        navigate("/login");
      } else {
        throw new Error("Error during logout!");
      }
    } catch (error) {
      console.error("Logout error:", error);
      alert("Server connection error!");
    }
  };

  // Check if a nav link is active
  const isActive = (path) => {
    return location.pathname === path;
  };

  // Motivational message based on tasks
  const getMotivationalMessage = () => {
    if (stats.tasks === 0) {
      return "Ready to start your teaching journey? Create some assignments!";
    } else if (stats.tasks > 0 && stats.tasks === stats.tasksCompleted) {
      return "Amazing job! All tasks are completed. Your students are on track!";
    } else {
      return "You're making great progress! Keep guiding your students.";
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
              className="navbar-toggler"
              type="button"
              onClick={toggleMobileMenu}
              aria-label="Toggle navigation"
            >
              <span className="navbar-toggler-animation">
                <span></span>
                <span></span>
                <span></span>
              </span>
            </button>

            {/* Navbar collapse */}
            <div className={`navbar-collapse ${showMobileMenu ? 'show' : ''}`} id="navbarCollapse">
              <ul className="navbar-nav navbar-nav-scroll mx-auto">
                {/* Subjects dropdown */}
                <li className="nav-item dropdown">
                  <div
                    className={`nav-link dropdown-toggle ${isActive('/Subject-List') || isActive('/Subject-Form') ? 'active' : ''}`}
                    style={{ cursor: 'pointer', ...navbarStyles.navLink }}
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleDropdown('subjects');
                    }}
                  >
                    Subjects
                  </div>

                  {activeDropdown === 'subjects' && (
                    <ul className="dropdown-menu show">
                      <li>
                        <div
                          className="dropdown-item"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleNavigateToCreateSubject();
                          }}
                          style={{ cursor: 'pointer' }}
                        >
                          Create subjects
                        </div>
                      </li>
                      <li>
                        <div
                          className="dropdown-item"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleNavigateToSubjects();
                          }}
                          style={{ cursor: 'pointer' }}
                        >
                          All subjects
                        </div>
                      </li>
                    </ul>
                  )}
                </li>

                {/* Projects */}
                <li className="nav-item">
                  <div
                    className={`nav-link ${isActive('/Project-Tutor') ? 'active' : ''}`}
                    onClick={handleNavigateToProjects}
                    style={{ cursor: 'pointer', ...navbarStyles.navLink }}
                  >
                    Projects
                  </div>
                </li>

                {/* Groups dropdown */}
                <li className="nav-item dropdown">
                  <div
                    className={`nav-link dropdown-toggle ${isActive('/GroupTutor') || isActive('/Subject-Assignment') ? 'active' : ''}`}
                    style={{ cursor: 'pointer', ...navbarStyles.navLink }}
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleDropdown('groups');
                    }}
                  >
                    Groups
                  </div>

                  {activeDropdown === 'groups' && (
                    <ul className="dropdown-menu show">
                      <li>
                        <div
                          className="dropdown-item"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleNavigateToGroups();
                          }}
                          style={{ cursor: 'pointer' }}
                        >
                          View groups
                        </div>
                      </li>
                      <li>
                        <div
                          className="dropdown-item"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleNavigateToGroupAssignment();
                          }}
                          style={{ cursor: 'pointer' }}
                        >
                          Group Assignment
                        </div>
                      </li>
                    </ul>
                  )}
                </li>

                {/* Students */}
                <li className="nav-item">
                  <div
                    className={`nav-link ${isActive('/users-table') ? 'active' : ''}`}
                    onClick={() => {
                      navigate("/users-table");
                      setShowMobileMenu(false);
                    }}
                    style={{ cursor: 'pointer', ...navbarStyles.navLink }}
                  >
                    Students
                  </div>
                </li>

                {/* Tasks */}
                <li className="nav-item">
                  <div
                    className={`nav-link ${isActive('/task-manager-tutor') ? 'active' : ''}`}
                    onClick={handleNavigateToTasks}
                    style={{ cursor: 'pointer', ...navbarStyles.navLink }}
                  >
                    Tasks
                  </div>
                </li>

                {/* Deliverables */}
                <li className="nav-item">
                  <div
                    className={`nav-link ${isActive('/tutors-deliverables') ? 'active' : ''}`}
                    onClick={handleNavigateToDeliverables}
                    style={{ cursor: 'pointer', ...navbarStyles.navLink }}
                  >
                    Deliverables
                  </div>
                </li>
              </ul>

              {/* Right side controls */}
              <div className="d-flex align-items-center">
                {/* Profile dropdown menu */}
                <div className="profile-section position-relative">
                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleDropdown('profile');
                    }}
                    style={{ cursor: 'pointer' }}
                    className="d-flex align-items-center dropdown-toggle"
                  >
                    <img
                      key={imgKey}
                      src={photo}
                      alt="Profile"
                      className="profile-image"
                      style={{ width: "40px", height: "40px", borderRadius: "50%" }}
                      onError={(e) => {
                        e.target.src = DEFAULT_PROFILE_PIC;
                      }}
                    />
                  </div>

                  {/* Dropdown menu for profile actions */}
                  {activeDropdown === 'profile' && (
                    <div className="dropdown-menu profile-dropdown show" style={{
                      position: 'absolute',
                      right: 0,
                      top: '50px',
                      backgroundColor: 'var(--bg-color)',
                      borderRadius: '8px',
                      padding: '8px 0',
                      width: '200px',
                      zIndex: 1000
                    }}>
                      <div
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditProfile();
                        }}
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
      <main style={{ paddingTop: '80px' }}>
        <section>
          {children}
        </section>
      </main>
    </div>
  );
};

export default LayoutTutorss
