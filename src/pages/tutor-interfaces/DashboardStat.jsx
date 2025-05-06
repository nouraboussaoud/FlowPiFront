import { useEffect, useState } from "react";
import axios from "axios";
import { io } from "socket.io-client";
import { Link } from "react-router-dom";
import { Pie, Bar } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from "chart.js";
import "./DashboardStat.css";

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

const Dashboard = () => {
  const [stats, setStats] = useState({
    tasks: 0,
    projects: 0,
    deliverables: 0,
    unreadMessages: 0,
    groups: 0,
    subjects: 0,
    users: 0
  });
  const [taskStatus, setTaskStatus] = useState({ pending: 0, completed: 0, inProgress: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("No token found. Please login.");

        // Fetch counts concurrently
        const [
          tasksRes, 
          projectsRes, 
          deliverablesRes, 
          messagesRes, 
          statusRes,
          groupsRes,
          subjectsRes,
          usersRes
        ] = await Promise.all([
          axios.get("http://localhost:5000/api/tasks/count", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get("http://localhost:5000/api/projects/count", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get("http://localhost:5000/api/deliverables/count", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get("http://localhost:5000/api/messages/unread-counts-by-sender", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get("http://localhost:5000/api/tasks/status-counts", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get("http://localhost:5000/api/groups/count", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get("http://localhost:5000/api/subjects/count", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get("http://localhost:5000/api/users/count", {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        // Sum unread messages
        const unreadMessagesTotal = Object.values(messagesRes.data.counts).reduce(
          (sum, count) => sum + count, 0
        );

        setStats({
          tasks: tasksRes.data.count,
          projects: projectsRes.data.count,
          deliverables: deliverablesRes.data.count,
          unreadMessages: unreadMessagesTotal,
          groups: groupsRes.data.count,
          subjects: subjectsRes.data.count,
          users: usersRes.data.count
        });

        setTaskStatus({
          pending: statusRes.data.pending || 0,
          completed: statusRes.data.completed || 0,
          inProgress: statusRes.data.inProgress || 0
        });
      } catch (err) {
        setError(err.response?.data?.message || err.message || "Failed to fetch statistics");
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  // Socket.IO for real-time updates
  useEffect(() => {
    const socket = io("http://localhost:5000");
    
    socket.on("connect", () => {
      console.log("Connected to Socket.IO server");
    });
    
    socket.on("new_message", (message) => {
      if (message.sender.role === "student") {
        setStats((prev) => ({
          ...prev,
          unreadMessages: prev.unreadMessages + 1,
        }));
      }
    });
    
    socket.on("task_updated", () => {
      // Refresh task stats when a task is updated
      const fetchTaskStats = async () => {
        try {
          const token = localStorage.getItem("token");
          const statusRes = await axios.get("http://localhost:5000/api/tasks/status-counts", {
            headers: { Authorization: `Bearer ${token}` },
          });
          
          setTaskStatus({
            pending: statusRes.data.pending || 0,
            completed: statusRes.data.completed || 0,
            inProgress: statusRes.data.inProgress || 0
          });
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

  // Pie chart data for tasks by status
  const pieData = {
    labels: ["Pending", "In Progress", "Completed"],
    datasets: [
      {
        data: [taskStatus.pending, taskStatus.inProgress, taskStatus.completed],
        backgroundColor: ["#3b82f6", "#f59e0b", "#10b981"],
        borderColor: ["#fff", "#fff", "#fff"],
        borderWidth: 2,
      },
    ],
  };

  const pieOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
        labels: { font: { size: 14 } },
      },
      tooltip: { enabled: true },
    },
  };

  // Bar chart for activity overview
  const barData = {
    labels: ["Tasks", "Projects", "Deliverables", "Messages"],
    datasets: [
      {
        label: "Activity Overview",
        data: [stats.tasks, stats.projects, stats.deliverables, stats.unreadMessages],
        backgroundColor: [
          "rgba(59, 130, 246, 0.7)",
          "rgba(16, 185, 129, 0.7)",
          "rgba(245, 158, 11, 0.7)",
          "rgba(239, 68, 68, 0.7)"
        ],
        borderColor: [
          "rgba(59, 130, 246, 1)",
          "rgba(16, 185, 129, 1)",
          "rgba(245, 158, 11, 1)",
          "rgba(239, 68, 68, 1)"
        ],
        borderWidth: 1,
      },
    ],
  };

  const barOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
      },
      title: {
        display: true,
        text: "Activity Overview",
        font: { size: 16 }
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Tutor Dashboard</h1>
        <div className="date-display">
          {new Date().toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
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
        <>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon tasks">
                <i className="bi bi-list-task"></i>
              </div>
              <div className="stat-content">
                <h2>Tasks</h2>
                <p className="stat-value">{stats.tasks}</p>
                <Link to="/tasks" className="stat-link">View Tasks</Link>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon projects">
                <i className="bi bi-kanban"></i>
              </div>
              <div className="stat-content">
                <h2>Projects</h2>
                <p className="stat-value">{stats.projects}</p>
                <Link to="/projects" className="stat-link">View Projects</Link>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon deliverables">
                <i className="bi bi-file-earmark-check"></i>
              </div>
              <div className="stat-content">
                <h2>Deliverables</h2>
                <p className="stat-value">{stats.deliverables}</p>
                <Link to="/deliverables" className="stat-link">View Deliverables</Link>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon messages">
                <i className="bi bi-chat-dots"></i>
              </div>
              <div className="stat-content">
                <h2>Unread Messages</h2>
                <p className="stat-value">{stats.unreadMessages}</p>
                <Link to="/messages" className="stat-link">View Messages</Link>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon groups">
                <i className="bi bi-people"></i>
              </div>
              <div className="stat-content">
                <h2>Groups</h2>
                <p className="stat-value">{stats.groups}</p>
                <Link to="/groups" className="stat-link">View Groups</Link>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon subjects">
                <i className="bi bi-book"></i>
              </div>
              <div className="stat-content">
                <h2>Subjects</h2>
                <p className="stat-value">{stats.subjects}</p>
                <Link to="/subjects" className="stat-link">View Subjects</Link>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon users">
                <i className="bi bi-person"></i>
              </div>
              <div className="stat-content">
                <h2>Users</h2>
                <p className="stat-value">{stats.users}</p>
                <Link to="/users" className="stat-link">View Users</Link>
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
                    ? Math.round((taskStatus.completed / stats.tasks) * 100) 
                    : 0}%
                </p>
                <div className="progress-bar">
                  <div 
                    className="progress-fill" 
                    style={{ 
                      width: `${stats.tasks > 0 
                        ? Math.round((taskStatus.completed / stats.tasks) * 100) 
                        : 0}%` 
                    }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          <div className="charts-container">
            <div className="chart-card">
              <h2>Tasks by Status</h2>
              <div className="chart-wrapper">
                <Pie data={pieData} options={pieOptions} />
              </div>
            </div>
            
            <div className="chart-card">
              <h2>Activity Overview</h2>
              <div className="chart-wrapper">
                <Bar data={barData} options={barOptions} />
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;
