import React, { useState, useEffect } from "react";
import axios from "axios";
import DashboardLayout from "../DashboardLayout";
import "./AdminTasks.css";
import { Folder, GitBranch, Clock, BarChart2, Users, AlertCircle, Calendar, CheckCircle, XCircle } from "lucide-react";

const AdminTaskDashboard = () => {
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [githubData, setGithubData] = useState({ commits: [], pull_requests: [] });
  const [riskAssessment, setRiskAssessment] = useState({
    risk: "",
    confidence: 0,
    explanation: "",
  });
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState({
    project: "",
    status: "",
    priority: "",
    assignedTo: "",
    search: "",
  });
  const [sortBy, setSortBy] = useState("priority");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showTaskDetailsModal, setShowTaskDetailsModal] = useState(false);
  const [showCommitsModal, setShowCommitsModal] = useState(false);
  const [showRiskModal, setShowRiskModal] = useState(false);
  const [selectedTaskDetails, setSelectedTaskDetails] = useState(null);
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    project: "",
    priority: "medium",
    assignedTo: "",
    taskDetails: "",
    repoOwner: "",
    repoName: "",
    branchName: "",
  });
  const tasksPerPage = 5;

  // Pagination calculations
  const filteredTasks = tasks.filter((task) => {
    const matchesProject = filters.project ? task.project === filters.project : true;
    const matchesStatus = filters.status ? task.status === filters.status : true;
    const matchesPriority = filters.priority ? task.priority === filters.priority : true;
    const matchesAssignedTo = filters.assignedTo ? task.assignedTo === filters.assignedTo : true;
    const matchesSearch = filters.search
      ? task.title.toLowerCase().includes(filters.search.toLowerCase()) ||
        task.description.toLowerCase().includes(filters.search.toLowerCase())
      : true;
    return matchesProject && matchesStatus && matchesPriority && matchesAssignedTo && matchesSearch;
  });

  const sortedTasks = [...filteredTasks].sort((a, b) => {
    if (sortBy === "priority") {
      const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    } else if (sortBy === "status") {
      return a.status.localeCompare(b.status);
    } else if (sortBy === "progress") {
      return (b.progressPercentage || 0) - (a.progressPercentage || 0);
    }
    return 0;
  });

  const totalPages = Math.ceil(sortedTasks.length / tasksPerPage);
  const startIndex = (currentPage - 1) * tasksPerPage;
  const endIndex = startIndex + tasksPerPage;
  const paginatedTasks = sortedTasks.slice(startIndex, endIndex);

  // Helper functions
  const getProjectName = (projectId) => {
    const project = projects.find((p) => p._id === projectId);
    return project ? project.name : "No Project";
  };

  const getUserInfo = (userId) => {
    if (!userId) return { name: "Unassigned", email: "No email", profilePic: null };
    const user = users.find((u) => u && u._id === userId);
    return user
      ? { name: user.name || "Unknown", email: user.email || "No email", profilePic: user.profilePic || null }
      : { name: "Unassigned", email: "No email", profilePic: null };
  };

  const getProfilePicUrl = (profilePic) => {
    if (!profilePic) return "https://upload.wikimedia.org/wikipedia/commons/a/ac/Default_pfp.jpg";
    return profilePic.startsWith("http")
      ? profilePic
      : `http://localhost:5000/uploads/${profilePic}`;
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "pending": return "#9ca3af";
      case "in-progress": return "#f59e0b";
      case "completed": return "#10b981";
      default: return "#3b82f6";
    }
  };

  const getProgressColor = (percentage) => {
    if (percentage < 30) return "#ef4444";
    if (percentage < 70) return "#f59e0b";
    return "#10b981";
  };

  const getRiskColor = (risk) => {
    switch (risk?.toLowerCase()) {
      case "high risk": return "#ef4444";
      case "low risk": return "#10b981";
      default: return "#3b82f6";
    }
  };

  const getRiskDescription = (risk) => {
    switch (risk?.toLowerCase()) {
      case "high risk": return "This task has significant challenges that may impact deadlines or quality.";
      case "low risk": return "This task appears straightforward with minimal risks.";
      default: return "Risk assessment not available.";
    }
  };

  const getRiskFactors = (risk) => {
    switch (risk?.toLowerCase()) {
      case "high risk": return [
        "Complex requirements",
        "Tight deadlines",
        "Multiple dependencies",
        "Potential quality issues",
      ];
      case "low risk": return [
        "Simple requirements",
        "Clear objectives",
        "Minimal dependencies",
      ];
      default: return ["Unknown risk factors"];
    }
  };

  const getRecommendations = (risk) => {
    switch (risk?.toLowerCase()) {
      case "high risk": return [
        "Break task into smaller subtasks",
        "Allocate additional resources",
        "Schedule frequent check-ins",
        "Identify potential blockers early",
      ];
      case "low risk": return [
        "Proceed as planned",
        "Monitor for unexpected changes",
        "Document progress regularly",
      ];
      default: return ["No specific recommendations available"];
    }
  };

  const isTaskStalled = (task) => {
    if (task.status === "completed") return false;
    if (!task.progressPercentage || task.progressPercentage === 0) return true;
    return task.progressPercentage < 30;
  };

  // API calls
  const fetchTasks = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setError("No token found. Please login.");
      setIsLoading(false);
      return;
    }
    try {
      const response = await axios.get("http://localhost:5000/api/tasks/getAllTasks", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTasks(response.data);
      setCurrentPage(1);
    } catch (error) {
      setError(error.response?.data?.message || "Error fetching tasks");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchProjects = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setError("No token found. Please login.");
      return;
    }
    try {
      const response = await axios.get("http://localhost:5000/api/projects/projects", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProjects(response.data);
    } catch (error) {
      setError(error.response?.data?.message || "Error fetching projects");
    }
  };

  const fetchUsers = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setError("No token found. Please login.");
      return;
    }
    try {
      const response = await axios.get("http://localhost:5000/api/users/getAll", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(response.data);
    } catch (error) {
      setError(error.response?.data?.message || "Error fetching users");
    }
  };

  const createTask = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    if (!token) {
      setError("No token found. Please login.");
      return;
    }
    try {
      setIsLoading(true);
      const response = await axios.post(
        "http://localhost:5000/api/tasks/createTask",
        newTask,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setTasks([...tasks, response.data.task]);
      setShowCreateModal(false);
      setNewTask({
        title: "",
        description: "",
        project: "",
        priority: "medium",
        assignedTo: "",
        taskDetails: "",
        repoOwner: "",
        repoName: "",
        branchName: "",
      });
      setError(null);
    } catch (error) {
      setError(error.response?.data?.message || "Error creating task");
    } finally {
      setIsLoading(false);
    }
  };

  const updateTask = async (taskId, updates) => {
    const token = localStorage.getItem("token");
    if (!token) {
      setError("No token found. Please login.");
      return;
    }
    try {
      setIsLoading(true);
      const response = await axios.put(
        `http://localhost:5000/api/tasks/updateTask/${taskId}`,
        updates,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setTasks(tasks.map((t) => (t._id === taskId ? response.data.task : t)));
      setShowEditModal(false);
      setError(null);
    } catch (error) {
      setError(error.response?.data?.message || "Error updating task");
    } finally {
      setIsLoading(false);
    }
  };

  const deleteTask = async (taskId) => {
    const token = localStorage.getItem("token");
    if (!token) {
      setError("No token found. Please login.");
      return;
    }
    try {
      setIsLoading(true);
      await axios.delete(`http://localhost:5000/api/tasks/deleteTask/${taskId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTasks(tasks.filter((task) => task._id !== taskId));
      const newTotalPages = Math.ceil((tasks.length - 1) / tasksPerPage);
      if (currentPage > newTotalPages && newTotalPages > 0) {
        setCurrentPage(newTotalPages);
      } else if (newTotalPages === 0) {
        setCurrentPage(1);
      }
      setError(null);
    } catch (error) {
      setError(error.response?.data?.message || "Error deleting task");
    } finally {
      setIsLoading(false);
    }
  };

  const assignTask = async (taskId, userId) => {
    const token = localStorage.getItem("token");
    if (!token) {
      setError("No token found. Please login.");
      return;
    }
    try {
      setIsLoading(true);
      const response = await axios.put(
        `http://localhost:5000/api/tasks/assignTask/${taskId}`,
        { assignedTo: userId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setTasks(tasks.map((t) => (t._id === taskId ? response.data : t)));
      setError(null);
    } catch (error) {
      setError(error.response?.data?.message || "Error assigning task");
    } finally {
      setIsLoading(false);
    }
  };

  const setTaskStatus = async (taskId, status) => {
    const token = localStorage.getItem("token");
    if (!token) {
      setError("No token found. Please login.");
      return;
    }
    try {
      setIsLoading(true);
      const endpoint = status === "pending"
        ? `setPending/${taskId}`
        : status === "in-progress"
        ? `setInProgress/${taskId}`
        : `setCompleted/${taskId}`;
      const response = await axios.put(
        `http://localhost:5000/api/tasks/${endpoint}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setTasks(tasks.map((t) => (t._id === taskId ? response.data : t)));
      setError(null);
    } catch (error) {
      setError(error.response?.data?.message || `Error setting task to ${status}`);
    } finally {
      setIsLoading(false);
    }
  };

  const trackCommits = async (taskId) => {
    const token = localStorage.getItem("token");
    if (!token) {
      setError("No token found. Please login.");
      return;
    }
    try {
      setIsLoading(true);
      const response = await axios.get(
        `http://localhost:5000/api/tasks/track-commits/${taskId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setGithubData({
        commits: response.data.commits || [],
        pull_requests: response.data.pull_requests || [],
      });
      setSelectedTaskId(taskId);
      setShowCommitsModal(true);
      setError(null);
    } catch (error) {
      setError(error.response?.data?.message || "Error tracking GitHub activity");
    } finally {
      setIsLoading(false);
    }
  };

  const openRiskModal = async (taskId) => {
    const token = localStorage.getItem("token");
    if (!token) {
      setError("No token found. Please login.");
      return;
    }
    try {
      const response = await axios.get(
        `http://localhost:5000/api/tasks/getTaskById/${taskId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const task = response.data;
      if (task.risk && task.riskConfidence) {
        setRiskAssessment({
          risk: task.risk,
          confidence: task.riskConfidence,
          explanation: `AI analysis based on task details: "${task.taskDetails || "No details provided"}". ${
            task.risk.toLowerCase() === "high risk"
              ? "Identified potential challenges that may delay completion."
              : "Task appears manageable with minimal obstacles."
          }`,
        });
        setSelectedTaskId(taskId);
        setShowRiskModal(true);
        setError(null);
      } else {
        setError("No risk assessment available for this task");
      }
    } catch (error) {
      setError(error.response?.data?.message || "Error fetching risk assessment");
    }
  };

  // Pagination handlers
  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const getPageNumbers = () => {
    const pages = [];
    const maxPagesToShow = 5;
    let startPage, endPage;
    if (totalPages <= maxPagesToShow) {
      startPage = 1;
      endPage = totalPages;
    } else {
      const halfMax = Math.floor(maxPagesToShow / 2);
      if (currentPage <= halfMax + 1) {
        startPage = 1;
        endPage = maxPagesToShow - 1;
      } else if (currentPage + halfMax >= totalPages) {
        startPage = totalPages - maxPagesToShow + 2;
        endPage = totalPages;
      } else {
        startPage = currentPage - halfMax;
        endPage = currentPage + halfMax - 1;
      }
    }
    pages.push(1);
    if (startPage > 2) pages.push("...");
    for (let i = Math.max(2, startPage); i <= Math.min(totalPages - 1, endPage); i++) {
      pages.push(i);
    }
    if (endPage < totalPages - 1) pages.push("...");
    if (totalPages > 1) pages.push(totalPages);
    return pages;
  };

  // Effect hooks
  useEffect(() => {
    fetchTasks();
    fetchProjects();
    fetchUsers();
  }, []);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape") {
        setShowCreateModal(false);
        setShowEditModal(false);
        setShowTaskDetailsModal(false);
        setShowCommitsModal(false);
        setShowRiskModal(false);
      }
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, []);

  // Task stats
  const taskStats = {
    total: tasks.length,
    pending: tasks.filter((t) => t.status === "pending").length,
    inProgress: tasks.filter((t) => t.status === "in-progress").length,
    completed: tasks.filter((t) => t.status === "completed").length,
  };

  return (
    <DashboardLayout title="Task Manager">
      <div className="container">
        <div className="section-title">Task Manager</div>
        <div className="task-header">
          <div className="task-stats">
            <span>Total: <strong>{taskStats.total}</strong></span>
            <span>Pending: <strong>{taskStats.pending}</strong></span>
            <span>In Progress: <strong>{taskStats.inProgress}</strong></span>
            <span>Completed: <strong>{taskStats.completed}</strong></span>
          </div>
          <button
            className="btn btn-primary"
            onClick={() => setShowCreateModal(true)}
            disabled={isLoading}
          >
            <CheckCircle size={16} /> Create Task
          </button>
        </div>

        <div className="filter-controls">
          <input
            type="text"
            placeholder="Search tasks..."
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            className="form-control search-input"
          />
          <select
            value={filters.project}
            onChange={(e) => setFilters({ ...filters, project: e.target.value })}
            className="form-control"
          >
            <option value="">All Projects</option>
            {projects.map((project) => (
              <option key={project._id} value={project._id}>{project.name}</option>
            ))}
          </select>
          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            className="form-control"
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>
          <select
            value={filters.priority}
            onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
            className="form-control"
          >
            <option value="">All Priorities</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
          </select>
          <select
            value={filters.assignedTo}
            onChange={(e) => setFilters({ ...filters, assignedTo: e.target.value })}
            className="form-control"
          >
            <option value="">All Users</option>
            {users.map((user) => (
              <option key={user._id} value={user._id}>{user.name}</option>
            ))}
          </select>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="form-control"
          >
            <option value="priority">Sort by Priority</option>
            <option value="status">Sort by Status</option>
            <option value="progress">Sort by Progress</option>
          </select>
        </div>

        {error && (
          <div className="alert alert-danger">
            <XCircle size={20} /> {error}
          </div>
        )}

        {isLoading && tasks.length === 0 ? (
          <div className="empty-state">
            <Clock size={48} color="#9ca3af" />
            <p>Loading tasks...</p>
          </div>
        ) : sortedTasks.length > 0 ? (
          <>
            <div className="task-grid">
              {paginatedTasks.map((task) => (
                <div key={task._id} className={`card task-card task-priority-${task.priority}`}>
                  <h3 className="task-title">{task.title}</h3>
                  <p className="task-description">{task.description}</p>
                  <div className="task-assigned-user">
                    <img
                      src={getProfilePicUrl(getUserInfo(task.assignedTo).profilePic)}
                      alt={getUserInfo(task.assignedTo).name}
                      className="user-avatar"
                      onError={(e) => (e.target.src = "https://upload.wikimedia.org/wikipedia/commons/a/ac/Default_pfp.jpg")}
                    />
                    <div>
                      <strong>{getUserInfo(task.assignedTo).name}</strong>
                      <div className="user-email">{getUserInfo(task.assignedTo).email}</div>
                    </div>
                  </div>
                  <div className="task-meta">
                    <span className="badge" style={{ backgroundColor: getStatusColor(task.status) }}>
                      {task.status ? task.status.charAt(0).toUpperCase() + task.status.slice(1) : "Pending"}
                    </span>
                    <span className={`badge priority-${task.priority}`}>
                      {task.priority ? task.priority.charAt(0).toUpperCase() + task.priority.slice(1) : "Medium"}
                    </span>
                    <span><Folder size={14} /> {getProjectName(task.project)}</span>
                  </div>
                  {typeof task.progressPercentage === "number" && task.progressPercentage > 0 ? (
                    <div className="task-progress">
                      <div className="progress-label">
                        <BarChart2 size={14} />
                        <span>Progress: {task.progressPercentage}%</span>
                        {isTaskStalled(task) && <AlertCircle size={14} color="#ef4444" title="No recent activity" />}
                      </div>
                      <div className="progress-bar">
                        <div
                          style={{
                            width: `${task.progressPercentage}%`,
                            backgroundColor: getProgressColor(task.progressPercentage),
                          }}
                        ></div>
                      </div>
                    </div>
                  ) : (
                    <div className="task-progress">
                      <div className="progress-label">
                        <BarChart2 size={14} />
                        <span>Progress: Awaiting activity</span>
                        <AlertCircle size={14} color="#ef4444" title="No activity detected" />
                      </div>
                    </div>
                  )}
                  <div className="task-actions">
                    <button
                      className="btn btn-info btn-sm"
                      onClick={() => {
                        setSelectedTaskDetails(task);
                        setShowTaskDetailsModal(true);
                      }}
                      title="View Details"
                    >
                      <Calendar size={14} />
                    </button>
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => {
                        setSelectedTaskDetails(task);
                        setShowEditModal(true);
                      }}
                      title="Edit Task"
                    >
                      <CheckCircle size={14} />
                    </button>
                    <select
                      value={task.assignedTo || ""}
                      onChange={(e) => assignTask(task._id, e.target.value)}
                      className="form-control assign-select"
                      title="Assign User"
                    >
                      <option value="">Unassigned</option>
                      {users.map((user) => (
                        <option key={user._id} value={user._id}>{user.name}</option>
                      ))}
                    </select>
                    <button
                      className="btn btn-warning btn-sm"
                      onClick={() => openRiskModal(task._id)}
                      style={{ backgroundColor: task.risk ? getRiskColor(task.risk) : "#3b82f6" }}
                      title="View Risk Assessment"
                    >
                      <AlertCircle size={14} />
                    </button>
                    <button
                      className="btn btn-success btn-sm"
                      onClick={() => trackCommits(task._id)}
                      title="Track GitHub Activity"
                    >
                      <GitBranch size={14} />
                    </button>
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => deleteTask(task._id)}
                      title="Delete Task"
                    >
                      <XCircle size={14} />
                    </button>
                    <div className="status-buttons">
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => setTaskStatus(task._id, "pending")}
                        disabled={task.status === "pending"}
                      >
                        Pending
                      </button>
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => setTaskStatus(task._id, "in-progress")}
                        disabled={task.status === "in-progress"}
                      >
                        In Progress
                      </button>
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => setTaskStatus(task._id, "completed")}
                        disabled={task.status === "completed"}
                      >
                        Completed
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {sortedTasks.length > tasksPerPage && (
              <div className="pagination">
                <button
                  className="btn btn-secondary"
                  onClick={goToPreviousPage}
                  disabled={currentPage === 1}
                >
                  Previous
                </button>
                {getPageNumbers().map((page, index) => (
                  <button
                    key={index}
                    className={`btn ${page === currentPage ? "btn-primary" : "btn-secondary"} ${page === "..." ? "ellipsis" : ""}`}
                    onClick={() => typeof page === "number" && goToPage(page)}
                    disabled={page === "..."}
                  >
                    {page}
                  </button>
                ))}
                <button
                  className="btn btn-secondary"
                  onClick={goToNextPage}
                  disabled={currentPage === totalPages}
                >
                  Next
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="empty-state">
            <Users size={48} color="#9ca3af" />
            <p>No tasks available.</p>
          </div>
        )}

        {showCreateModal && (
          <div className="modal" onClick={() => setShowCreateModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <h2>Create Task</h2>
              <form onSubmit={createTask}>
                <div className="form-group">
                  <label>Title</label>
                  <input
                    type="text"
                    className="form-control"
                    value={newTask.title}
                    onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Description</label>
                  <textarea
                    className="form-control"
                    value={newTask.description}
                    onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                    required
                  ></textarea>
                </div>
                <div className="form-group">
                  <label>Project</label>
                  <select
                    className="form-control"
                    value={newTask.project}
                    onChange={(e) => setNewTask({ ...newTask, project: e.target.value })}
                    required
                  >
                    <option value="">Select Project</option>
                    {projects.map((project) => (
                      <option key={project._id} value={project._id}>{project.name}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Priority</label>
                  <select
                    className="form-control"
                    value={newTask.priority}
                    onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Assign To</label>
                  <select
                    className="form-control"
                    value={newTask.assignedTo}
                    onChange={(e) => setNewTask({ ...newTask, assignedTo: e.target.value })}
                  >
                    <option value="">Unassigned</option>
                    {users.map((user) => (
                      <option key={user._id} value={user._id}>{user.name}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Task Details</label>
                  <textarea
                    className="form-control"
                    value={newTask.taskDetails}
                    onChange={(e) => setNewTask({ ...newTask, taskDetails: e.target.value })}
                  ></textarea>
                </div>
                <div className="form-group">
                  <label>GitHub Repo Owner</label>
                  <input
                    type="text"
                    className="form-control"
                    value={newTask.repoOwner}
                    onChange={(e) => setNewTask({ ...newTask, repoOwner: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>GitHub Repo Name</label>
                  <input
                    type="text"
                    className="form-control"
                    value={newTask.repoName}
                    onChange={(e) => setNewTask({ ...newTask, repoName: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>GitHub Branch Name</label>
                  <input
                    type="text"
                    className="form-control"
                    value={newTask.branchName}
                    onChange={(e) => setNewTask({ ...newTask, branchName: e.target.value })}
                  />
                </div>
                <div className="modal-actions">
                  <button type="submit" className="btn btn-primary" disabled={isLoading}>
                    Create
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShowCreateModal(false)}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {showEditModal && selectedTaskDetails && (
          <div className="modal" onClick={() => setShowEditModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <h2>Edit Task</h2>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  updateTask(selectedTaskDetails._id, selectedTaskDetails);
                }}
              >
                <div className="form-group">
                  <label>Title</label>
                  <input
                    type="text"
                    className="form-control"
                    value={selectedTaskDetails.title}
                    onChange={(e) =>
                      setSelectedTaskDetails({ ...selectedTaskDetails, title: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Description</label>
                  <textarea
                    className="form-control"
                    value={selectedTaskDetails.description}
                    onChange={(e) =>
                      setSelectedTaskDetails({ ...selectedTaskDetails, description: e.target.value })
                    }
                    required
                  ></textarea>
                </div>
                <div className="form-group">
                  <label>Project</label>
                  <select
                    className="form-control"
                    value={selectedTaskDetails.project}
                    onChange={(e) =>
                      setSelectedTaskDetails({ ...selectedTaskDetails, project: e.target.value })
                    }
                    required
                  >
                    <option value="">Select Project</option>
                    {projects.map((project) => (
                      <option key={project._id} value={project._id}>{project.name}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Priority</label>
                  <select
                    className="form-control"
                    value={selectedTaskDetails.priority}
                    onChange={(e) =>
                      setSelectedTaskDetails({ ...selectedTaskDetails, priority: e.target.value })
                    }
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Assign To</label>
                  <select
                    className="form-control"
                    value={selectedTaskDetails.assignedTo || ""}
                    onChange={(e) =>
                      setSelectedTaskDetails({ ...selectedTaskDetails, assignedTo: e.target.value })
                    }
                  >
                    <option value="">Unassigned</option>
                    {users.map((user) => (
                      <option key={user._id} value={user._id}>{user.name}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Task Details</label>
                  <textarea
                    className="form-control"
                    value={selectedTaskDetails.taskDetails || ""}
                    onChange={(e) =>
                      setSelectedTaskDetails({ ...selectedTaskDetails, taskDetails: e.target.value })
                    }
                  ></textarea>
                </div>
                <div className="form-group">
                  <label>GitHub Repo Owner</label>
                  <input
                    type="text"
                    className="form-control"
                    value={selectedTaskDetails.repoOwner || ""}
                    onChange={(e) =>
                      setSelectedTaskDetails({ ...selectedTaskDetails, repoOwner: e.target.value })
                    }
                  />
                </div>
                <div className="form-group">
                  <label>GitHub Repo Name</label>
                  <input
                    type="text"
                    className="form-control"
                    value={selectedTaskDetails.repoName || ""}
                    onChange={(e) =>
                      setSelectedTaskDetails({ ...selectedTaskDetails, repoName: e.target.value })
                    }
                  />
                </div>
                <div className="form-group">
                  <label>GitHub Branch Name</label>
                  <input
                    type="text"
                    className="form-control"
                    value={selectedTaskDetails.branchName || ""}
                    onChange={(e) =>
                      setSelectedTaskDetails({ ...selectedTaskDetails, branchName: e.target.value })
                    }
                  />
                </div>
                <div className="modal-actions">
                  <button type="submit" className="btn btn-primary" disabled={isLoading}>
                    Save
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShowEditModal(false)}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {showTaskDetailsModal && selectedTaskDetails && (
          <div className="modal" onClick={() => setShowTaskDetailsModal(false)}>
            <div className="modal-content task-details-modal" onClick={(e) => e.stopPropagation()}>
              <h2>Task Details</h2>
              <div className="task-details-content">
                <div className="detail-section">
                  <h3>Task Information</h3>
                  <div className="detail-grid">
                    <div className="detail-item">
                      <span className="detail-label">Title:</span>
                      <span className="detail-value">{selectedTaskDetails.title}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Status:</span>
                      <span className="badge" style={{ backgroundColor: getStatusColor(selectedTaskDetails.status) }}>
                        {selectedTaskDetails.status ? selectedTaskDetails.status.charAt(0).toUpperCase() + selectedTaskDetails.status.slice(1) : "Pending"}
                      </span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Priority:</span>
                      <span className={`badge priority-${selectedTaskDetails.priority}`}>
                        {selectedTaskDetails.priority ? selectedTaskDetails.priority.charAt(0).toUpperCase() + selectedTaskDetails.priority.slice(1) : "Medium"}
                      </span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Project:</span>
                      <span className="detail-value">{getProjectName(selectedTaskDetails.project)}</span>
                    </div>
                    {typeof selectedTaskDetails.progressPercentage === "number" && (
                      <div className="detail-item">
                        <span className="detail-label">Progress:</span>
                        <div className="progress-bar">
                          <div
                            style={{
                              width: `${selectedTaskDetails.progressPercentage}%`,
                              backgroundColor: getProgressColor(selectedTaskDetails.progressPercentage),
                            }}
                          ></div>
                        </div>
                        <span className="detail-value">{selectedTaskDetails.progressPercentage}%</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="detail-section">
                  <h3>Description</h3>
                  <p>{selectedTaskDetails.description}</p>
                  {selectedTaskDetails.taskDetails && (
                    <>
                      <h3>Additional Details</h3>
                      <p>{selectedTaskDetails.taskDetails}</p>
                    </>
                  )}
                </div>
                <div className="detail-section">
                  <h3>Assigned User</h3>
                  <div className="user-info">
                    <img
                      src={getProfilePicUrl(getUserInfo(selectedTaskDetails.assignedTo).profilePic)}
                      alt={getUserInfo(selectedTaskDetails.assignedTo).name}
                      className="user-avatar"
                      onError={(e) => (e.target.src = "https://upload.wikimedia.org/wikipedia/commons/a/ac/Default_pfp.jpg")}
                    />
                    <div>
                      <h4>{getUserInfo(selectedTaskDetails.assignedTo).name}</h4>
                      <p>{getUserInfo(selectedTaskDetails.assignedTo).email}</p>
                    </div>
                  </div>
                </div>
                {selectedTaskDetails.risk && (
                  <div className="detail-section">
                    <h3>Risk Assessment</h3>
                    <span className="badge" style={{ backgroundColor: getRiskColor(selectedTaskDetails.risk) }}>
                      {selectedTaskDetails.risk}
                    </span>
                    <p>{getRiskDescription(selectedTaskDetails.risk)}</p>
                  </div>
                )}
                <div className="modal-actions">
                  <button
                    className="btn btn-primary"
                    onClick={() => trackCommits(selectedTaskDetails._id)}
                  >
                    <GitBranch size={14} /> Track GitHub Activity
                  </button>
                  <button
                    className="btn btn-secondary"
                    onClick={() => setShowTaskDetailsModal(false)}
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {showCommitsModal && (
          <div className="modal" onClick={() => setShowCommitsModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <h2><GitBranch size={20} /> GitHub Activity</h2>
              <div className="github-activity">
                <h3>Commits</h3>
                {githubData.commits.length > 0 ? (
                  <ul>
                    {githubData.commits.map((commit, index) => (
                      <li key={index}>
                        <strong>{commit.message}</strong>
                        <a href={commit.url} target="_blank" rel="noopener noreferrer">View</a>
                        <p>Author: {commit.author} | Date: {new Date(commit.date).toLocaleString()}</p>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p>No commits found.</p>
                )}
                <h3>Merged Pull Requests</h3>
                {githubData.pull_requests.length > 0 ? (
                  <ul>
                    {githubData.pull_requests.map((pr, index) => (
                      <li key={index}>
                        <strong>#{pr.number}: {pr.title}</strong>
                        <a href={pr.url} target="_blank" rel="noopener noreferrer">View</a>
                        <p>Merged: {new Date(pr.merge_date).toLocaleString()}</p>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p>No merged pull requests found.</p>
                )}
              </div>
              <div className="modal-actions">
                <button
                  className="btn btn-secondary"
                  onClick={() => setShowCommitsModal(false)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {showRiskModal && (
          <div className="modal" onClick={() => setShowRiskModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <h2><AlertCircle size={20} /> AI Risk Insights</h2>
              <div className="risk-assessment-content">
                <div className="risk-visualization">
                  <div className="risk-gauge">
                    <div className="gauge-background">
                      <div
                        className="gauge-fill"
                        style={{
                          width: `${riskAssessment.confidence * 100}%`,
                          backgroundColor: getRiskColor(riskAssessment.risk),
                        }}
                      ></div>
                    </div>
                    <div className="gauge-labels">
                      <span>Low</span>
                      <span>Medium</span>
                      <span>High</span>
                    </div>
                  </div>
                  <div className="risk-summary">
                    <h3>
                      <span style={{ color: getRiskColor(riskAssessment.risk) }}>
                        {riskAssessment.risk}
                      </span>
                      <span className="badge">
                        {(riskAssessment.confidence * 100).toFixed(0)}% confidence
                      </span>
                    </h3>
                    <p>{getRiskDescription(riskAssessment.risk)}</p>
                  </div>
                </div>
                <div className="risk-details">
                  <div className="detail-card">
                    <h4>AI Analysis</h4>
                    <p>{riskAssessment.explanation}</p>
                  </div>
                  <div className="detail-card">
                    <h4>Potential Issues</h4>
                    <ul>
                      {getRiskFactors(riskAssessment.risk).map((factor, index) => (
                        <li key={index}>{factor}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="detail-card">
                    <h4>Recommendations</h4>
                    <ul>
                      {getRecommendations(riskAssessment.risk).map((rec, index) => (
                        <li key={index}>{rec}</li>
                      ))}
                    </ul>
                  </div>
                </div>
                <div className="modal-actions">
                  <button
                    className="btn btn-secondary"
                    onClick={() => setShowRiskModal(false)}
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default AdminTaskDashboard;