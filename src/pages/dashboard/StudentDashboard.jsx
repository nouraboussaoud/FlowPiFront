import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import LayoutStudent from "./LayoutStudent";
import Contact from "../../student-interfaces/Contact";
import { get, post } from "../../apiHelper";
import Chatbox from "../tutor-interfaces/chatbox/ChatBox";
import SkillsManager from "./SkillsManager";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function StudentDashboard() {
  const location = useLocation();
  const navigate = useNavigate();
  const [tutors, setTutors] = useState([]);
  const [selectedTutor, setSelectedTutor] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [showContactList, setShowContactList] = useState(false);
  const [showChatBubble, setShowChatBubble] = useState(true);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [userName, setUserName] = useState("");
  const [timeOfDay, setTimeOfDay] = useState("");
  const [groupForm, setGroupForm] = useState({
    name: "",
    description: "",
    members: [],
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Set greeting based on time of day
    const hour = new Date().getHours();
    if (hour < 12) setTimeOfDay("morning");
    else if (hour < 18) setTimeOfDay("afternoon");
    else setTimeOfDay("evening");

    // Get user name from localStorage
    const user = localStorage.getItem("user");
    if (user) {
      try {
        const userData = JSON.parse(user);
        setUserName(userData.name || "");
      } catch (error) {
        console.error("Error parsing user data:", error);
      }
    }

    // If no username was found in localStorage, try to fetch it from the API
    if (!userName) {
      const token = localStorage.getItem("token");
      if (token) {
        get("/users/me")
          .then((userData) => {
            if (userData && userData.name) {
              setUserName(userData.name);
              // Update localStorage with the fetched user data
              localStorage.setItem("user", JSON.stringify(userData));
            }
          })
          .catch((error) => {
            console.error("Error fetching user data:", error);
          });
      }
    }

    // Handle token storage
    const queryParams = new URLSearchParams(location.search);
    const token = queryParams.get("token");
    if (token) {
      localStorage.setItem("token", token);
      console.log("Token stored in localStorage:", token);
      navigate("/student-dashboard", { replace: true });
    }

    // Fetch tutors
    get("/users/getAll")
      .then((data) => {
        const tutors = data.filter((user) => user.role === "tutor");
        setTutors(tutors);
      })
      .catch((error) => {
        console.error("Error fetching tutors:", error);
        toast.error("Error fetching tutors", {
          position: "top-right",
          autoClose: 3000,
        });
      });

    // Fetch tasks
    get("/tasks/myTasks")
      .then((data) => {
        setTasks(data || []);
      })
      .catch((error) => {
        console.error("Error fetching tasks:", error);
        toast.error("Error fetching tasks", {
          position: "top-right",
          autoClose: 3000,
        });
      });

    // Fetch unread messages count
    fetchUnreadMessagesCount();

    // Set up message polling interval
    const messageInterval = setInterval(fetchUnreadMessagesCount, 30000);

    return () => {
      clearInterval(messageInterval);
    };
  }, [location, navigate]);

  const fetchUnreadMessagesCount = () => {
    get("/messages/unread")
      .then((data) => {
        setUnreadMessages(data?.count || 0);
      })
      .catch((error) => {
        console.error("Error fetching unread messages:", error);
      });
  };

  const handleSelectTutor = (tutor) => {
    setSelectedTutor(tutor);
    setShowContactList(false);
    setShowChatBubble(false); // Keep bubble hidden when chatbox is open
    setUnreadMessages(prev => Math.max(0, prev - 1));
  };

  const toggleContactList = () => {
    setShowContactList(true);
    setShowChatBubble(false); // Hide bubble when opening contact list
  };

  const closeContactList = () => {
    setShowContactList(false);
    setShowChatBubble(!selectedTutor); // Show bubble only if no chatbox is open
  };

  const handleCloseChatbox = () => {
    setSelectedTutor(null);
    setShowChatBubble(true); // Show bubble when closing chatbox
  };

  const handleGroupInputChange = (e) => {
    const { name, value } = e.target;
    setGroupForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleMemberChange = (e) => {
    const selectedOptions = Array.from(e.target.selectedOptions).map(
      (option) => option.value
    );
    setGroupForm((prev) => ({ ...prev, members: selectedOptions }));
  };

  const createGroup = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("No token found. Please login.", {
        position: "top-right",
        autoClose: 3000,
      });
      return;
    }

    if (!groupForm.name) {
      toast.error("Group name is required.", {
        position: "top-right",
        autoClose: 3000,
      });
      return;
    }

    try {
      setIsLoading(true);
      await post(
        "/groups/create",
        groupForm,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Group created successfully!", {
        position: "top-right",
        autoClose: 3000,
      });
      setGroupForm({ name: "", description: "", members: [] });
      setShowGroupModal(false);
    } catch (error) {
      console.error("Error creating group:", error);
      toast.error(error.response?.data?.message || "Error creating group", {
        position: "top-right",
        autoClose: 3000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const taskStats = {
    total: tasks.length,
    pending: tasks.filter((t) => t.status === "pending").length,
    inProgress: tasks.filter((t) => t.status === "in-progress").length,
    completed: tasks.filter((t) => t.status === "completed").length,
  };

  // Get motivational quote based on task stats
  const getMotivationalMessage = () => {
    if (taskStats.total === 0) {
      return "Ready to start your learning journey? Check out your assignments!";
    } else if (taskStats.completed === taskStats.total) {
      return "Amazing job! You've completed all your tasks. Time to celebrate!";
    } else if (taskStats.completed > taskStats.pending) {
      return "You're making great progress! Keep up the good work!";
    } else {
      return "You've got this! Take one task at a time.";
    }
  };

  return (
    <LayoutStudent>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
      <div className="d-flex position-relative" style={{ height: "calc(100vh - 20px)", marginTop: "-15px" }}>
        {/* Main Content Area */}
        <div className="flex-grow-1 p-2">
          <div className="dashboard-overview">
            <div className="welcome-banner">
              <div className="welcome-text">
                <h1>
                  {userName ? (
                    <>Welcome, <span className="highlight">{userName}</span>!</>
                  ) : (
                    <>Welcome to your learning space!</>
                  )}
                </h1>
                <p className="motivational-message">{getMotivationalMessage()}</p>
              </div>
              <div className="welcome-actions">
                <button
                  className="button button-primary"
                  onClick={() => navigate("/Subject-List")}
                >
                  <i className="fas fa-book-open me-2"></i>
                  Browse Subjects
                </button>
              </div>
            </div>

            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon">
                  <i className="fas fa-tasks"></i>
                </div>
                <div className="stat-content">
                  <h3>{taskStats.total}</h3>
                  <p>Total Tasks</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">
                  <i className="fas fa-hourglass-start"></i>
                </div>
                <div className="stat-content">
                  <h3>{taskStats.pending}</h3>
                  <p>Pending</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">
                  <i className="fas fa-spinner"></i>
                </div>
                <div className="stat-content">
                  <h3>{taskStats.inProgress}</h3>
                  <p>In Progress</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">
                  <i className="fas fa-check-circle"></i>
                </div>
                <div className="stat-content">
                  <h3>{taskStats.completed}</h3>
                  <p>Completed</p>
                </div>
              </div>
            </div>

            <div className="dashboard-actions">
              <button
                className="button button-secondary"
                onClick={() => navigate("/tasks")}
              >
                <i className="fas fa-clipboard-list me-2"></i>
                View All Tasks
              </button>

              <button
                className="button button-outline"
                onClick={() => navigate("/deliverables-history")}
              >
                <i className="fas fa-file-alt me-2"></i>
                My Deliverables
              </button>
            </div>
          </div>

          {selectedTutor && (
            <Chatbox user={selectedTutor} onClose={handleCloseChatbox} />
          )}
        </div>

        {/* Chat Bubble & Contact List */}
        <div className="chat-bubble-container">
          {/* Chat Bubble Icon */}
          {showChatBubble && !selectedTutor && (
            <div
              className={`chat-bubble ${showContactList ? 'active' : ''}`}
              onClick={toggleContactList}
            >
              <i className="fas fa-comments"></i>
              {unreadMessages > 0 && <span className="badge">{unreadMessages}</span>}
            </div>
          )}

          {/* Expandable Contact List */}
          {showContactList && (
            <div className="contact-list-panel">
              <div className="panel-header">
                <h3>Contacts</h3>
                <button className="close-btn" onClick={closeContactList}>×</button>
              </div>
              <div className="panel-body">
                <Contact tutors={tutors} onSelectTutor={handleSelectTutor} />
              </div>
            </div>
          )}
        </div>

        {/* Group Creation Modal */}
        {showGroupModal && (
          <div
            className="modal-overlay"
            onClick={() => setShowGroupModal(false)}
          >
            <div
              className="modal-content"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-header">
                <h2 className="modal-title">Create Study Group</h2>
                <button
                  className="close-button"
                  onClick={() => setShowGroupModal(false)}
                >
                  ×
                </button>
              </div>
              <form onSubmit={createGroup}>
                <div className="form-group">
                  <label className="label" htmlFor="group-name">
                    Group Name
                  </label>
                  <input
                    className="input"
                    type="text"
                    id="group-name"
                    name="name"
                    placeholder="Enter group name"
                    value={groupForm.name}
                    onChange={handleGroupInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="label" htmlFor="group-description">
                    Description
                  </label>
                  <textarea
                    className="textarea"
                    id="group-description"
                    name="description"
                    placeholder="Enter group description"
                    value={groupForm.description}
                    onChange={handleGroupInputChange}
                  />
                </div>
                <div className="form-group">
                  <label className="label" htmlFor="group-members">
                    Members
                  </label>
                  <select
                    className="select"
                    id="group-members"
                    name="members"
                    multiple
                    value={groupForm.members}
                    onChange={handleMemberChange}
                  >
                    {tutors.map((tutor) => (
                      <option key={tutor._id} value={tutor._id}>
                        {tutor.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="button-group">
                  <button
                    className="button button-default"
                    type="button"
                    onClick={() => setShowGroupModal(false)}
                  >
                    Cancel
                  </button>
                  <button
                    className="button button-primary"
                    type="submit"
                    disabled={isLoading}
                  >
                    {isLoading ? "Creating..." : "Create Group"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>

      {/* CSS for the dashboard */}
      <style jsx>{`
        .dashboard-container {
          width: 100%;
          min-height: calc(100vh - 80px); /* Subtract header height */
          padding: 20px;
          background-color: #f9fafb;
        }

        .content-wrapper {
          max-width: 1280px;
          margin: 0 auto;
          width: 100%;
        }

        .dashboard-overview {
          margin-bottom: 1rem;
        }

        .welcome-banner {
          background: linear-gradient(135deg, #6a11cb 0%, #2575fc 100%);
          border-radius: 8px;
          padding: 16px;
          margin-bottom: 16px;
          color: white;
          display: flex;
          justify-content: space-between;
          align-items: center;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }

        .welcome-text h1 {
          font-size: 28px;
          font-weight: 600;
          margin-bottom: 8px;
          color: #e5e7eb; /* grey-200 */
        }

        .motivational-message {
          font-size: 16px;
          opacity: 0.9;
          margin-bottom: 0;
          color: #e5e7eb; /* grey-200 */
        }

        .welcome-actions {
          display: flex;
          gap: 12px;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 16px;
          margin-bottom: 24px;
        }

        .stat-card {
          background-color: white;
          border-radius: 10px;
          padding: 20px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
          display: flex;
          align-items: center;
          transition: transform 0.2s, box-shadow 0.2s;
        }

        .stat-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
        }

        .stat-icon {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          background-color: #f0f4ff;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-right: 16px;
        }

        .stat-icon i {
          font-size: 20px;
          color: #3b82f6; /* blue-500 */
        }

        .stat-content h3 {
          font-size: 24px;
          font-weight: 700;
          margin: 0;
          color: #1f2937;
        }

        .stat-content p {
          font-size: 14px;
          color: #6b7280;
          margin: 0;
        }

        .dashboard-actions {
          display: flex;
          gap: 12px;
          margin-top: 16px;
        }

        .button {
          padding: 10px 16px;
          border-radius: 8px;
          font-weight: 500;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.2s;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border: none;
        }

        .button-primary {
          background-color: #3b82f6; /* blue-500 */
          color: white;
        }

        .button-primary:hover {
          background-color: #2563eb; /* blue-600 */
        }

        .button-secondary {
          background-color: #10b981;
          color: white;
        }

        .button-secondary:hover {
          background-color: #059669;
        }

        .button-outline {
          background-color: transparent;
          color: #3b82f6; /* blue-500 */
          border: 1px solid #3b82f6;
        }

        .button-outline:hover {
          background-color: #eff6ff; /* blue-50 */
        }

        .chat-bubble-container {
          position: fixed;
          bottom: 30px;
          right: 30px;
          z-index: 1000;
        }

        .chat-bubble {
          width: 60px;
          height: 60px;
          background-color: #3b82f6; /* blue-500 */
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 24px;
          cursor: pointer;
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
          transition: all 0.3s ease;
          position: relative;
        }

        .chat-bubble:hover {
          transform: translateY(-5px);
          box-shadow: 0 6px 12px rgba(0, 0, 0, 0.3);
          background-color: #2563eb; /* blue-600 */
        }

        .chat-bubble.active {
          background-color: #2563eb; /* blue-600 */
        }

        .badge {
          position: absolute;
          top: -5px;
          right: -5px;
          background-color: #ef4444;
          color: white;
          border-radius: 50%;
          width: 22px;
          height: 22px;
          font-size: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .contact-list-panel {
          position: absolute;
          bottom: 75px;
          right: 0;
          width: 300px;
          max-height: 400px;
          background-color: white;
          border-radius: 10px;
          box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
          overflow: hidden;
          display: flex;
          flex-direction: column;
        }

        .panel-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 15px;
          background-color: #f8f9fa;
          border-bottom: 1px solid #e4e6eb;
        }

        .panel-header h3 {
          margin: 0;
          font-size: 16px;
          font-weight: 600;
        }

        .close-btn {
          border: none;
          background: none;
          font-size: 20px;
          cursor: pointer;
          color: #6c757d;
        }

        .close-btn:hover {
          color: #343a40;
        }

        .panel-body {
          padding: 10px;
          overflow-y: auto;
          flex-grow: 1;
        }

        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(0, 0, 0, 0.5);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 1000;
        }

        .modal-content {
          background-color: white;
          border-radius: 10px;
          padding: 20px;
          width: 100%;
          max-width: 500px;
          box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }

        .modal-title {
          font-size: 20px;
          font-weight: 600;
        }

        .close-button {
          background: none;
          border: none;
          font-size: 20px;
          cursor: pointer;
          color: #6c757d;
        }

        .close-button:hover {
          color: #343a40;
        }

        .form-group {
          margin-bottom: 20px;
        }

        .label {
          display: block;
          font-size: 14px;
          font-weight: 500;
          margin-bottom: 8px;
        }

        .input,
        .textarea,
        .select {
          width: 100%;
          padding: 10px;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          font-size: 14px;
        }

        .textarea {
          min-height: 100px;
          resize: vertical;
        }

        .select {
          height: 120px;
        }

        .button-group {
          display: flex;
          gap: 12px;
          justify-content: flex-end;
        }

        .button-default {
          background-color: #6b7280;
          color: white;
        }

        .button-default:hover {
          background-color: #4b5563;
        }

        /* Responsive Adjustments */
        @media (max-width: 767.98px) {
          .welcome-banner {
            flex-direction: column;
            align-items: flex-start;
          }

          .welcome-actions {
            margin-top: 16px;
            width: 100%;
          }

          .welcome-actions button {
            width: 100%;
          }

          .stats-grid {
            grid-template-columns: repeat(2, 1fr);
          }

          .dashboard-actions {
            flex-direction: column;
          }

          .dashboard-actions button {
            width: 100%;
          }

          .chat-bubble-container {
            bottom: 20px;
            right: 20px;
          }

          .chat-bubble {
            width: 50px;
            height: 50px;
            font-size: 20px;
          }

          .contact-list-panel {
            width: 250px;
            max-height: 300px;
          }

          .badge {
            width: 18px;
            height: 18px;
            font-size: 10px;
          }

          .modal-content {
            margin: 20px;
            max-width: 90%;
          }
        }

        @media (max-width: 575.98px) {
          .stats-grid {
            grid-template-columns: 1fr;
          }

          .welcome-text h1 {
            font-size: 24px;
          }

          .motivational-message {
            font-size: 14px;
          }
        }
      `}</style>
    </LayoutStudent>
  );
}

export default StudentDashboard;
