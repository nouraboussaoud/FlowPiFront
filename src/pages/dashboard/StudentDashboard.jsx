import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import LayoutStudent from "./LayoutStudent";
import Contact from "../../student-interfaces/Contact";
import { get, post } from "../../apiHelper";
import Chatbox from "../tutor-interfaces/chatbox/ChatBox";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { 
  Chart as ChartJS, 
  ArcElement, 
  Tooltip, 
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Filler,
  RadialLinearScale
} from 'chart.js';
import { Pie, Doughnut, Bar, Line, PolarArea } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(
  ArcElement, 
  Tooltip, 
  Legend, 
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Filler,
  RadialLinearScale
);

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
  
  // Add new state for chart data
  const [taskCompletionTrend, setTaskCompletionTrend] = useState({
    labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
    data: [2, 4, 3, 5]
  });

  // Add state for priority data
  const [taskPriorityData, setTaskPriorityData] = useState({
    labels: ['Low', 'Medium', 'High', 'Urgent'],
    data: [0, 0, 0, 0]
  });

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
    const token = queryParams.get('token');
    const userParam = queryParams.get('user');

    if (token && userParam) {
      try {
        const decodedUser = decodeURIComponent(userParam);
        const userData = JSON.parse(decodedUser);
        // Validate userData
        if (!userData._id || typeof userData._id !== 'string') {
          throw new Error('Invalid or missing user _id');
        }
        // Store user data in localStorage
        localStorage.setItem('token', token);
        localStorage.setItem('userId', userData._id);

        // Clean the URL by removing query parameters
        navigate('/student-dashboard', { replace: true });
      } catch (error) {
        console.error("Error decoding user data:", error);
        // Optionally, redirect to an error page or show a message
      }
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
        
        // Calculate priority statistics
        if (data && data.length > 0) {
          const priorityCounts = {
            low: data.filter(t => t.priority === "low").length,
            medium: data.filter(t => t.priority === "medium").length,
            high: data.filter(t => t.priority === "high").length,
            urgent: data.filter(t => t.priority === "urgent").length
          };
          
          setTaskPriorityData({
            labels: ['Low', 'Medium', 'High', 'Urgent'],
            data: [
              priorityCounts.low,
              priorityCounts.medium, 
              priorityCounts.high,
              priorityCounts.urgent
            ]
          });
        }
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

  // Motivational message based on tasks
  const getMotivationalMessage = () => {
    if (tasks.length === 0) {
      return "Ready to start your learning journey? Check out your assignments!";
    } else if (tasks.length > 0 && tasks.filter(t => t.status === "completed").length === tasks.length) {
      return "Amazing job! You've completed all your tasks. Time to celebrate!";
    } else {
      return `You're making great progress! Keep going, you've completed ${taskStats.completed} of ${taskStats.total} tasks.`;
    }
  };

  // Prepare chart data objects
  const taskStatusData = {
    labels: ['Pending', 'In Progress', 'Completed'],
    datasets: [
      {
        data: [taskStats.pending, taskStats.inProgress, taskStats.completed],
        backgroundColor: ['#f59e0b', '#3b82f6', '#10b981'],
        hoverBackgroundColor: ['#d97706', '#2563eb', '#059669'],
        borderWidth: 0,
      },
    ],
  };

  // Prepare bar chart data for priority
  const taskPriorityChartData = {
    labels: taskPriorityData.labels,
    datasets: [
      {
        data: taskPriorityData.data,
        backgroundColor: ['#3b82f6', '#f59e0b', '#ef4444', '#dc2626'],
        hoverBackgroundColor: ['#2563eb', '#d97706', '#b91c1c', '#991b1b'],
        borderWidth: 1,
        borderRadius: 4,
      },
    ],
  };

  // Prepare polar area data for task completion trend
  // Removed

  // Chart options
  const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          padding: 20,
          boxWidth: 10,
          font: {
            size: 12
          }
        }
      }
    }
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          precision: 0
        }
      }
    }
  };

  const lineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          precision: 0
        }
      }
    }
  };

  // Removed polarAreaOptions

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
      <div className="dashboard-container">
        {/* Improved Welcome Banner */}
        <div className="welcome-banner">
          <div className="welcome-text">
            <h1>
              {timeOfDay && userName ? (
                <>Good {timeOfDay}, <span className="highlight">{userName}</span>! 👋</>
              ) : (
                <>Welcome to your learning space! 🎓</>
              )}
            </h1>
            <p className="motivational-message">{getMotivationalMessage()}</p>
          </div>
        </div>

        {/* Task Summary Card First */}
        <div className="stats-summary-card">
          <h3>Task Summary</h3>
          <div className="stats-grid">
            <div className="stat-item">
              <div className="stat-icon pending">
                <i className="fas fa-hourglass-start"></i>
              </div>
              <div className="stat-content">
                <h4>{taskStats.pending}</h4>
                <p>Pending</p>
              </div>
            </div>
            <div className="stat-item">
              <div className="stat-icon in-progress">
                <i className="fas fa-spinner"></i>
              </div>
              <div className="stat-content">
                <h4>{taskStats.inProgress}</h4>
                <p>In Progress</p>
              </div>
            </div>
            <div className="stat-item">
              <div className="stat-icon completed">
                <i className="fas fa-check-circle"></i>
              </div>
              <div className="stat-content">
                <h4>{taskStats.completed}</h4>
                <p>Completed</p>
              </div>
            </div>
            <div className="stat-item">
              <div className="stat-icon total">
                <i className="fas fa-tasks"></i>
              </div>
              <div className="stat-content">
                <h4>{taskStats.total}</h4>
                <p>Total</p>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity Card */}
        <div className="activity-card">
          <div className="activity-header">
            <h3>Recent Activity</h3>
            <button 
              className="view-all-button"
              onClick={() => navigate('/tasks')}
            >
              View All Activities
              <i className="fas fa-arrow-right"></i>
            </button>
          </div>
          <div className="activity-list">
            {tasks.slice(0, 3).map((task, index) => (
              <div key={index} className="activity-item">
                <div className={`activity-icon ${task.status}`}>
                  <i className={`fas ${
                    task.status === "completed" ? "fa-check" : 
                    task.status === "in-progress" ? "fa-spinner fa-spin" : "fa-clock"
                  }`}></i>
                </div>
                <div className="activity-content">
                  <h4>
                    {task.title || `Task #${index + 1}`}
                    {task.priority && (
                      <span className={`priority-indicator priority-${task.priority}`}>
                        {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                      </span>
                    )}
                  </h4>
                  <p>{task.description?.substring(0, 60) || "No description available"}{task.description?.length > 60 ? "..." : ""}</p>
                  <div className="activity-meta">
                    <span className="activity-date">
                      <i className="far fa-calendar-alt"></i> {new Date(task.updatedAt || task.createdAt || Date.now()).toLocaleDateString()}
                    </span>
                    <span className={`activity-status ${task.status}`}>
                      {task.status === "completed" ? "Completed" : 
                       task.status === "in-progress" ? "In Progress" : "Pending"}
                    </span>
                  </div>
                </div>
              </div>
            ))}
            {tasks.length === 0 && (
              <div className="empty-state">
                <i className="fas fa-inbox fa-2x"></i>
                <p>No recent activity</p>
                <button 
                  className="view-all-button empty-state-button"
                  onClick={() => navigate('/tasks')}
                >
                  Go to Tasks
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Charts Grid */}
        <div className="dashboard-grid">
          {/* Task Status Chart - Pie */}
          <div className="chart-card">
            <h3>Task Status</h3>
            <div className="chart-container">
              <Pie data={taskStatusData} options={pieOptions} />
            </div>
          </div>

          {/* Task Priority Chart - Bar */}
          <div className="chart-card">
            <h3>Task Priority Distribution</h3>
            <div className="chart-container">
              <Bar data={taskPriorityChartData} options={barOptions} />
            </div>
          </div>
        </div>

        {/* Removed Weekly Task Completion Chart */}

        {/* Chat functionality */}
        <div className="chat-bubble-container">
          {showChatBubble && !selectedTutor && (
            <div
              className={`chat-bubble ${showContactList ? 'active' : ''}`}
              onClick={toggleContactList}
            >
              <i className="fas fa-comments"></i>
              {unreadMessages > 0 && <span className="badge">{unreadMessages}</span>}
            </div>
          )}

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

        {selectedTutor && (
          <Chatbox user={selectedTutor} onClose={handleCloseChatbox} />
        )}

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

      <style jsx>{`
        .dashboard-container {
          padding: 20px;
          background-color: #f9fafb;
          min-height: calc(100vh - 80px);
        }

        .welcome-banner {
          background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
          border-radius: 12px;
          padding: 28px;
          margin-bottom: 24px;
          color: #0c4a6e;
          border: 1px solid #bae6fd;
          display: flex;
          justify-content: center;
          align-items: center;
          box-shadow: 0 4px 20px rgba(56, 189, 248, 0.1);
          text-align: center;
        }

        .welcome-text {
          max-width: 600px;
        }

        .welcome-text h1 {
          font-size: 28px;
          font-weight: 600;
          margin-bottom: 10px;
          color: #0369a1;
        }

        .highlight {
          color: #0284c7;
          font-weight: 700;
          position: relative;
          display: inline-block;
        }

        .highlight::after {
          content: '';
          position: absolute;
          bottom: -2px;
          left: 0;
          width: 100%;
          height: 2px;
          background-color: #38bdf8;
          border-radius: 2px;
        }

        .motivational-message {
          font-size: 16px;
          margin-bottom: 0;
          color: #0c4a6e;
        }

        .dashboard-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 24px;
          margin-bottom: 24px;
        }

        .chart-card {
          background-color: white;
          border-radius: 12px;
          padding: 20px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
          transition: transform 0.2s, box-shadow 0.2s;
          margin-bottom: 24px;
        }

        .weekly-chart {
          margin-bottom: 24px;
        }

        .chart-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
        }

        .chart-card h3 {
          font-size: 18px;
          font-weight: 600;
          margin-bottom: 16px;
          color: #1f2937;
        }

        .chart-container {
          height: 250px;
          position: relative;
        }

        .weekly-chart .chart-container {
          max-width: 600px;
          margin: 0 auto;
        }

        .stats-summary-card {
          background-color: white;
          border-radius: 12px;
          padding: 20px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
          margin-bottom: 24px;
        }

        .stats-summary-card h3 {
          font-size: 18px;
          font-weight: 600;
          margin-bottom: 16px;
          color: #1f2937;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
        }

        .stat-item {
          display: flex;
          align-items: center;
          padding: 12px;
          border-radius: 8px;
          background-color: #f9fafb;
        }

        .stat-icon {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-right: 12px;
        }

        .stat-icon.pending {
          background-color: #fef3c7;
          color: #d97706;
        }

        .stat-icon.in-progress {
          background-color: #e0f2fe;
          color: #2563eb;
        }

        .stat-icon.completed {
          background-color: #d1fae5;
          color: #059669;
        }

        .stat-icon.total {
          background-color: #e5e7eb;
          color: #4b5563;
        }

        .stat-content h4 {
          font-size: 20px;
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

        /* Keep existing button styles */

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
          padding: 12px 16px;
          border-bottom: 1px solid #e4e6eb;
        }

        .panel-header h3 {
          margin: 0;
          font-size: 16px;
          font-weight: 600;
        }

        .close-btn {
          background: none;
          border: none;
          font-size: 20px;
          cursor: pointer;
          color: #65676b;
        }

        .panel-body {
          padding: 12px;
          overflow-y: auto;
          flex: 1;
        }

        /* Responsive Adjustments */
        @media (max-width: 991.98px) {
          .dashboard-grid {
            grid-template-columns: 1fr;
          }
          
          .stats-grid {
            grid-template-columns: repeat(2, 1fr);
          }
          
          .weekly-chart .chart-container {
            max-width: 100%;
          }
        }

        @media (max-width: 767.98px) {
          .welcome-banner {
            flex-direction: column;
            align-items: flex-start;
          }

          .welcome-actions {
            margin-top: 16px;
            width: 100%;
          }

          .stats-grid {
            grid-template-columns: repeat(2, 1fr);
          }
          
          .activity-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 12px;
          }
          
          .view-all-button {
            align-self: flex-end;
          }
        }

        @media (max-width: 575.98px) {
          .stats-grid {
            grid-template-columns: 1fr;
          }
        }

        .activity-card {
          background-color: white;
          border-radius: 12px;
          padding: 20px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
          margin-bottom: 24px;
          transition: transform 0.2s, box-shadow 0.2s;
        }

        .activity-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
        }

        .activity-card h3 {
          font-size: 18px;
          font-weight: 600;
          margin-bottom: 16px;
          color: #1f2937;
        }

        .activity-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .activity-item {
          display: flex;
          align-items: flex-start;
          padding: 16px;
          background-color: #f9fafb;
          border-radius: 8px;
          transition: transform 0.2s, box-shadow 0.2s;
          border-left: 4px solid #e5e7eb;
        }

        .activity-item:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
        }

        .activity-item.completed {
          border-left-color: #10b981;
        }

        .activity-item.in-progress {
          border-left-color: #3b82f6;
        }

        .activity-item.pending {
          border-left-color: #f59e0b;
        }

        .activity-icon {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-right: 16px;
          flex-shrink: 0;
        }

        .activity-icon.completed {
          background-color: #d1fae5;
          color: #059669;
        }

        .activity-icon.in-progress {
          background-color: #e0f2fe;
          color: #2563eb;
        }

        .activity-icon.pending {
          background-color: #fef3c7;
          color: #d97706;
        }

        .activity-content {
          flex: 1;
        }

        .activity-content h4 {
          font-size: 16px;
          font-weight: 600;
          margin: 0 0 8px 0;
          color: #111827;
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 6px;
        }

        .priority-indicator {
          display: inline-block;
          font-size: 12px;
          font-weight: 500;
          padding: 2px 6px;
          border-radius: 4px;
          margin-left: 8px;
          vertical-align: middle;
        }

        .priority-low {
          background-color: #dbeafe;
          color: #1e40af;
        }

        .priority-medium {
          background-color: #fef3c7;
          color: #92400e;
        }

        .priority-high {
          background-color: #fee2e2;
          color: #b91c1c;
        }

        .priority-urgent {
          background-color: #dc2626;
          color: white;
        }

        .activity-content p {
          font-size: 14px;
          color: #4b5563;
          margin: 0 0 12px 0;
        }

        .activity-meta {
          display: flex;
          justify-content: space-between;
          font-size: 12px;
          color: #6b7280;
        }

        .activity-date {
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .activity-status {
          padding: 2px 8px;
          border-radius: 12px;
          font-weight: 500;
        }

        .activity-status.completed {
          background-color: #d1fae5;
          color: #059669;
        }

        .activity-status.in-progress {
          background-color: #e0f2fe;
          color: #2563eb;
        }

        .activity-status.pending {
          background-color: #fef3c7;
          color: #d97706;
        }

        .empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 40px 20px;
          color: #9ca3af;
          text-align: center;
        }

        .empty-state i {
          margin-bottom: 16px;
        }

        .empty-state p {
          margin-bottom: 16px;
        }

        .empty-state-button {
          background-color: #eff6ff;
          color: #3b82f6;
          border: none;
          padding: 8px 16px;
          border-radius: 8px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .empty-state-button:hover {
          background-color: #dbeafe;
          color: #2563eb;
        }

        .activity-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
        }

        .activity-header h3 {
          margin-bottom: 0;
        }

        .view-all-button {
          background-color: transparent;
          color: #3b82f6;
          border: none;
          font-size: 14px;
          font-weight: 500;
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .view-all-button:hover {
          background-color: #eff6ff;
          color: #2563eb;
        }

        .view-all-button i {
          font-size: 12px;
          transition: transform 0.2s ease;
        }

        .view-all-button:hover i {
          transform: translateX(3px);
        }

        .empty-state-button {
          margin-top: 12px;
          background-color: #eff6ff;
          padding: 8px 16px;
          border-radius: 8px;
        }
      `}</style>
    </LayoutStudent>
  );
}

export default StudentDashboard;
