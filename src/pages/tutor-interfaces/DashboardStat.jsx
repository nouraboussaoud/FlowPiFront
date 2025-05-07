import { useEffect, useState } from "react";
import axios from "axios";
import { io } from "socket.io-client";
import { Link } from "react-router-dom";
import "./DashboardStat.css";

const Dashboard = () => {
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
  const [userId, setUserId] = useState(null);
  const [userName, setUserName] = useState("");

  useEffect(() => {
    // Get user ID and name from localStorage
    const user = localStorage.getItem("user");
    if (user) {
      try {
        const userData = JSON.parse(user);
        setUserId(userData.userId || userData.id);
        setUserName(userData.name || "");
      } catch (err) {
        console.error("Error parsing user data:", err);
      }
    }
  }, []);

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
          console.log("Tasks response:", tasksResponse.data);
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
          console.log("Unread messages response:", messagesResponse.data); // Debug log
          unreadMessagesTotal = Object.values(messagesResponse.data?.counts || {}).reduce(
            (sum, count) => sum + count, 0
          );
        } catch (error) {
          console.error("Error fetching unread messages:", error);
          setError("Failed to fetch unread messages: " + (error.response?.data?.message || error.message));
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
        console.log("Unread messages updated:", messagesResponse.data);
        const unreadMessagesTotal = Object.values(messagesResponse.data?.counts || {}).reduce(
          (sum, count) => sum + count, 0
        );
        setStats(prev => ({
          ...prev,
          unreadMessages: unreadMessagesTotal,
        }));
      } catch (err) {
        console.error("Failed to update unread messages:", err);
        setError("Failed to update unread messages: " + (err.response?.data?.message || err.message));
      }
    };

    socket.on("new_message", (message) => {
      console.log("New message received:", message); // Debug log
      fetchUnreadMessages(); // Re-fetch counts for accuracy
    });

    socket.on("message_read", () => {
      console.log("Message read event received");
      fetchUnreadMessages(); // Re-fetch counts when a message is read
    });

    socket.on("task_updated", () => {
      const fetchTaskStats = async () => {
        try {
          const tasksResponse = await axios.get("http://localhost:5000/api/tasks/getAllTasks", {
            headers: { Authorization: `Bearer ${token}` },
          });
          console.log("Task updated response:", tasksResponse.data);
          const tasks = Array.isArray(tasksResponse.data) ? tasksResponse.data : [];
          const completedTasks = tasks.filter(task => task.status === "completed").length;
          setStats(prev => ({
            ...prev,
            tasks: tasks.length,
            tasksCompleted: completedTasks,
          }));
        } catch (err) {
          console.error("Failed to update task stats:", err);
          setError("Failed to update tasks: " + (err.response?.data?.message || err.message));
        }
      };

      fetchTaskStats();
    });

    socket.on("connect_error", (err) => {
      console.error("Socket.IO connection error:", err.message);
    });

    return () => socket.disconnect();
  }, []);

  // Motivational message based on tasks
  const getMotivationalMessage = () => {
    if (stats.tasks === 0) {
      return "Ready to start your learning journey? Check out your assignments!";
    } else if (stats.tasks > 0 && stats.tasks === stats.tasksCompleted) {
      return "Amazing job! You've completed all your tasks. Time to celebrate!";
    } else {
      return "You've got this! Take one task at a time.";
    }
  };

  return (
    <div className="dashboard-container">
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

      </div>

      {error && (
        <div className="error-alert">
          <i className="bi bi-exclamation-circle"></i>
          <span>{error}</span>
          <button onClick={() => setError(null)}>
            <i className="bi bi-x"></i>
          </button>
        </div>
      )}

      {loading ? (
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading statistics...</p>
        </div>
      ) : (
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon tasks">
              <i className="bi bi-list-task"></i>
            </div>
            <div className="stat-content">
              <h2>Tasks</h2>
              <p className="stat-value">{stats.tasks}</p>
              <Link to="/task-manager-tutor" className="stat-link">View Tasks</Link>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon projects">
              <i className="bi bi-kanban"></i>
            </div>
            <div className="stat-content">
              <h2>Projects</h2>
              <p className="stat-value">{stats.projects}</p>
              <Link to="/Project-Tutor" className="stat-link">View Projects</Link>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon deliverables">
              <i className="bi bi-file-earmark-check"></i>
            </div>
            <div className="stat-content">
              <h2>Deliverables</h2>
              <p className="stat-value">{stats.deliverables}</p>
              <Link to="/tutors-deliverables" className="stat-link">View Deliverables</Link>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon messages">
              <i className="bi bi-chat-dots"></i>
            </div>
            <div className="stat-content">
              <h2>Unread Messages</h2>
              <p className="stat-value">{stats.unreadMessages}</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon groups">
              <i className="bi bi-people"></i>
            </div>
            <div className="stat-content">
              <h2>Groups</h2>
              <p className="stat-value">{stats.groups}</p>
              <Link to="/GroupTutor" className="stat-link">View Groups</Link>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon subjects">
              <i className="bi bi-book"></i>
            </div>
            <div className="stat-content">
              <h2>Subjects</h2>
              <p className="stat-value">{stats.subjects}</p>
              <Link to="/Subject-List" className="stat-link">View Subjects</Link>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon completion">
              <i className="bi bi-check-circle"></i>
            </div>
            <div className="stat-content">
              <h2>Completion Rate</h2>
              <p className="stat-value">
                {stats.tasks > 0
                  ? Math.round((stats.tasksCompleted / stats.tasks) * 100)
                  : 0}%
              </p>
              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{
                    width: `${stats.tasks > 0
                      ? Math.round((stats.tasksCompleted / stats.tasks) * 100)
                      : 0}%`
                  }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
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

        .stat-link {
          color: #3b82f6; /* blue-500 */
          text-decoration: none;
        }

        .stat-link:hover {
          color: #2563eb; /* blue-600 */
        }

        .stat-icon {
          background-color: #3b82f6; /* blue-500 */
          color: white;
          border-radius: 50%;
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
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

          .welcome-actions button {
            width: 100%;
          }

          .welcome-text h1 {
            font-size: 24px;
          }

          .motivational-message {
            font-size: 14px;
          }
        }
      `}</style>
    </div>
  );
};

export default Dashboard;