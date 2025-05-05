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
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [groupForm, setGroupForm] = useState({
    name: "",
    description: "",
    members: [],
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
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
      
    // Fetch unread messages count (example implementation)
    fetchUnreadMessagesCount();
    
    // Set up message polling interval
    const messageInterval = setInterval(fetchUnreadMessagesCount, 30000); // Check every 30 seconds
    
    return () => {
      clearInterval(messageInterval); // Cleanup on unmount
    };
  }, [location, navigate]);
  
  // Function to fetch unread messages count
  const fetchUnreadMessagesCount = () => {
    // Replace this with your actual API call to get unread messages
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
    setShowContactList(false); // Hide contact list after selecting tutor
    
    // Reset unread messages when opening chat
    // This is just an example - you would typically only reset messages for this specific tutor
    setUnreadMessages(prev => Math.max(0, prev - 1));
  };

  const toggleContactList = () => {
    setShowContactList(!showContactList);
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
      <div className="d-flex position-relative" style={{ height: "100vh" }}>
        {/* Main Content Area */}
        <div className="flex-grow-1 p-4">
          <div className="dashboard-overview">
            <div className="dashboard-header">
              <h1 className="dashboard-title">Student Dashboard</h1>
            </div>
            <div className="stats-grid">
              <div className="stat-card">
                <h3>{taskStats.total}</h3>
                <p>Total Tasks</p>
              </div>
              <div className="stat-card">
                <h3>{taskStats.pending}</h3>
                <p>Pending</p>
              </div>
              <div className="stat-card">
                <h3>{taskStats.inProgress}</h3>
                <p>In Progress</p>
              </div>
              <div className="stat-card">
                <h3>{taskStats.completed}</h3>
                <p>Completed</p>
              </div>
            </div>
            <button
              className="button button-secondary mt-3"
              onClick={() => navigate("/tasks")}
            >
              View All Tasks
            </button>
          </div>
          {selectedTutor && (
            <Chatbox user={selectedTutor} onClose={() => setSelectedTutor(null)} />
          )}
        </div>

        {/* Chat Bubble & Contact List */}
        <div className="chat-bubble-container">
          {/* Chat Bubble Icon */}
          <div 
            className={`chat-bubble ${showContactList ? 'active' : ''}`} 
            onClick={toggleContactList}
          >
            <i className="fas fa-comments"></i>
            {unreadMessages > 0 && <span className="badge">{unreadMessages}</span>}
          </div>
          
          {/* Expandable Contact List */}
          {showContactList && (
            <div className="contact-list-panel">
              <div className="panel-header">
                <h3>Contacts</h3>
                <button className="close-btn" onClick={toggleContactList}>&times;</button>
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

      {/* CSS for the chat bubble and contact panel */}
      <style jsx>{`
        .chat-bubble-container {
          position: fixed;
          bottom: 30px;
          right: 30px;
          z-index: 1000;
        }
        
        .chat-bubble {
          width: 60px;
          height: 60px;
          background-color: #007bff;
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
        }
        
        .chat-bubble.active {
          background-color: #0056b3;
        }
        
        .badge {
          position: absolute;
          top: -5px;
          right: -5px;
          background-color: #ff4136;
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
          border-bottom: 1px solid #e9ecef;
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
      `}</style>
    </LayoutStudent>
  );
}

export default StudentDashboard;