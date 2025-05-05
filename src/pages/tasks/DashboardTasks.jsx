import React, { useState, useEffect } from "react";
import axios from "axios";
import LayoutStudent from "../dashboard/LayoutStudent";
import "./Tasks.css";
import { Folder, Clock, BarChart2, Edit, AlertCircle, Eye } from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const TaskManager = () => {
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [selectedProject, setSelectedProject] = useState(null);
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    project: "",
    taskDetails: "",
    repoOwner: "",
    repoName: "",
    branchName: "",
  });
  const [updateTaskData, setUpdateTaskData] = useState({
    title: "",
    description: "",
    project: "",
    taskDetails: "",
    priority: "medium",
    status: "pending",
    repoOwner: "",
    repoName: "",
    branchName: "",
  });
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [showRiskModal, setShowRiskModal] = useState(false);
  const [showCommitsModal, setShowCommitsModal] = useState(false);
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [githubData, setGithubData] = useState({ commits: [], pull_requests: [] });
  const [riskAssessment, setRiskAssessment] = useState({
    risk: "",
    confidence: 0,
    explanation: "",
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  // Status enum
  const statusOptions = ["pending", "in-progress", "completed"];

  // Helper functions for risk assessment
  const getRiskColor = (risk) => {
    switch (risk?.toLowerCase()) {
      case "high risk":
        return "#ef4444";
      case "low risk":
        return "#10b981";
      default:
        return "#3b82f6";
    }
  };

  const getRiskDescription = (risk) => {
    switch (risk?.toLowerCase()) {
      case "high risk":
        return "This task has significant challenges that may impact deadlines or quality.";
      case "low risk":
        return "This task appears straightforward with minimal risks.";
      default:
        return "Risk assessment not available.";
    }
  };

  const getRiskFactors = (risk) => {
    switch (risk?.toLowerCase()) {
      case "high risk":
        return [
          "Complex requirements",
          "Tight deadlines",
          "Multiple dependencies",
          "Potential quality issues",
        ];
      case "low risk":
        return ["Simple requirements", "Clear objectives", "Minimal dependencies"];
      default:
        return ["Unknown risk factors"];
    }
  };

  const getRecommendations = (risk) => {
    switch (risk?.toLowerCase()) {
      case "high risk":
        return [
          "Break task into smaller subtasks",
          "Allocate additional resources",
          "Schedule frequent check-ins",
          "Identify potential blockers early",
        ];
      case "low risk":
        return [
          "Proceed as planned",
          "Monitor for unexpected changes",
          "Document progress regularly",
        ];
      default:
        return ["No specific recommendations available"];
    }
  };

  // Helper function for status badge color
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "pending":
        return "#6b7280";
      case "in-progress":
        return "#f59e0b";
      case "completed":
        return "#10b981";
      default:
        return "#6b7280";
    }
  };

  // Helper function to calculate progress based on GitHub activity
  const calculateProgress = (commits, pullRequests, taskStatus) => {
    let progress = 0;

    if (taskStatus === "completed") {
      return 100;
    } else if (taskStatus === "pending") {
      progress = Math.min(progress, 10);
    }

    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    (commits || []).forEach((commit) => {
      const commitDate = new Date(commit.date);
      const isRecent = commitDate > oneWeekAgo;
      progress += isRecent ? 2 : 1;
    });
    progress = Math.min(progress, 50);

    (pullRequests || []).forEach((pr) => {
      const prDate = new Date(pr.merge_date);
      const isRecent = prDate > oneWeekAgo;
      progress += isRecent ? 15 : 10;
    });
    progress = Math.min(progress, 90);

    const hasRecentActivity =
      (commits || []).some((c) => new Date(c.date) > oneWeekAgo) ||
      (pullRequests || []).some((pr) => new Date(pr.merge_date) > oneWeekAgo);
    if (!hasRecentActivity && taskStatus !== "completed") {
      progress = Math.min(progress, 30);
    }

    return Math.round(Math.min(progress, 100));
  };

  // Event handlers
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewTask((prevTask) => ({
      ...prevTask,
      [name]: value,
    }));
  };

  const handleUpdateInputChange = (e) => {
    const { name, value } = e.target;
    setUpdateTaskData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const openRiskModal = async (taskId) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("No token found. Please login.");
        return;
      }

      const response = await axios.get(
        `http://localhost:5000/api/tasks/getTaskById/${taskId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const task = response.data;
      if (task.risk && task.riskConfidence) {
        setRiskAssessment({
          risk: task.risk,
          confidence: task.riskConfidence,
          explanation:
            task.riskExplanation ||
            `AI analysis based on task details: "${
              task.taskDetails || "No details provided"
            }". ${
              task.risk.toLowerCase() === "high risk"
                ? "Identified potential challenges that may delay completion."
                : "Task appears manageable with minimal obstacles."
            }`,
        });
        setShowRiskModal(true);
      } else {
        setError("No risk assessment available for this task");
      }
    } catch (error) {
      console.error("Error fetching task risk:", error);
      setError(
        error.response?.data?.message || "Error fetching risk assessment"
      );
    }
  };

  const openUpdateModal = async (taskId) => {
    setSelectedTaskId(taskId);
    setIsUpdating(true);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("No token found. Please login.");
        return;
      }

      const response = await axios.get(
        `http://localhost:5000/api/tasks/getTaskById/${taskId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const task = response.data;
      setUpdateTaskData({
        title: task.title || "",
        description: task.description || "",
        project: task.project || "",
        taskDetails: task.taskDetails || "",
        priority: task.priority || "medium",
        status: task.status || "pending",
        repoOwner: task.repoOwner || "",
        repoName: task.repoName || "",
        branchName: task.branchName || "",
      });

      setShowUpdateModal(true);
      setIsUpdating(false);
    } catch (error) {
      console.error("Error fetching task for update:", error);
      setError(error.response?.data?.message || "Error fetching task details");
      setIsUpdating(false);
    }
  };

  const openProjectModal = (projectId) => {
    if (!projectId) {
      toast.error("No project associated with this task.", {
        position: "top-right",
        autoClose: 3000,
      });
      return;
    }

    // Handle case where projectId is an object (populated project)
    const id = typeof projectId === "object" && projectId?._id ? projectId._id : projectId;

    if (!id || typeof id !== "string") {
      toast.error("Invalid project ID.", {
        position: "top-right",
        autoClose: 3000,
      });
      return;
    }

    const project = projects.find((p) => p._id === id);
    if (project) {
      setSelectedProject(project);
      setShowProjectModal(true);
    } else {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("No token found. Please login.", {
          position: "top-right",
          autoClose: 3000,
        });
        return;
      }

      axios
        .get(`http://localhost:5000/api/projects/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((response) => {
          setSelectedProject(response.data);
          setShowProjectModal(true);
        })
        .catch((error) => {
          console.error("Error fetching project details:", error);
          toast.error(
            error.response?.data?.message || "Error fetching project details",
            { position: "top-right", autoClose: 3000 }
          );
        });
    }
  };

  const trackCommits = async (taskId) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("No token found. Please login.");
        return;
      }

      setIsLoading(true);

      const taskResponse = await axios.get(
        `http://localhost:5000/api/tasks/getTaskById/${taskId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const task = taskResponse.data;
      if (!task.repoOwner || !task.repoName || !task.branchName) {
        throw new Error("GitHub repository information is incomplete");
      }

      const githubResponse = await axios.get(
        `http://localhost:5000/api/tasks/track-commits/${taskId}`,
        {
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        }
      );

      if (!githubResponse.data) {
        throw new Error("No GitHub data received");
      }

      const { commits, pull_requests } = githubResponse.data;

      const calculatedProgress = calculateProgress(commits, pull_requests, task.status);

      setTasks((prevTasks) =>
        prevTasks.map((t) =>
          t._id === taskId ? { ...t, progressPercentage: calculatedProgress } : t
        )
      );

      await axios.post(
        `http://localhost:5000/api/tasks/updateTaskProgress/${taskId}`,
        { progressPercentage: calculatedProgress },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setGithubData({ commits: commits || [], pull_requests: pull_requests || [] });
      setShowCommitsModal(true);
      setError(null);
    } catch (error) {
      console.error("Error tracking GitHub activity:", error);
      setError(
        error.response?.data?.message || error.message || "Error tracking GitHub activity"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTasks = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setError("No token found. Please login.");
      setIsLoading(false);
      return;
    }

    try {
      const response = await axios.get("http://localhost:5000/api/tasks/myTasks", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTasks(response.data || []);
    } catch (error) {
      console.error("Error fetching assigned tasks:", error);
      setError(
        error.response?.data?.message || "Error fetching your assigned tasks"
      );
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
      setProjects(response.data || []);
    } catch (error) {
      console.error("Error fetching projects:", error);
      setError(error.response?.data?.message || "Error fetching projects");
    }
  };

  const createTask = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    if (!token) {
      setError("No token found. Please login.");
      return;
    }

    if (!newTask.project) {
      setError("Please select a project");
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
      setNewTask({
        title: "",
        description: "",
        project: "",
        taskDetails: "",
        repoOwner: "",
        repoName: "",
        branchName: "",
      });
      setShowModal(false);
      setError(null);
    } catch (error) {
      console.error("Error creating task:", error);
      setError(error.response?.data?.message || "Error creating task");
    } finally {
      setIsLoading(false);
    }
  };

  const updateTask = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    if (!token) {
      setError("No token found. Please login.");
      return;
    }

    try {
      setIsUpdating(true);
      const response = await axios.put(
        `http://localhost:5000/api/tasks/updateTask/${selectedTaskId}`,
        updateTaskData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setTasks((prev) =>
        prev.map((task) =>
          task._id === selectedTaskId ? response.data.task : task
        )
      );

      setShowUpdateModal(false);
      setError(null);
    } catch (error) {
      console.error("Update error:", error);
      setError(error.response?.data?.message || "Error updating task");
    } finally {
      setIsUpdating(false);
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
      setTasks((prev) => prev.filter((task) => task._id !== taskId));
      setError(null);
    } catch (error) {
      console.error("Error deleting task:", error);
      setError(error.response?.data?.message || "Error deleting task");
    } finally {
      setIsLoading(false);
    }
  };

  const getProjectName = (projectId) => {
    const project = projects.find((p) => p._id === (typeof projectId === "object" ? projectId?._id : projectId));
    return project ? project.name : "No Project";
  };

  const getProgressColor = (percentage) => {
    if (percentage < 30) return "#ef4444";
    if (percentage < 70) return "#f59e0b";
    return "#10b981";
  };

  const isTaskStalled = (task) => {
    if (task.status === "completed") return false;
    if (!task.progressPercentage || task.progressPercentage === 0) return true;
    return task.progressPercentage < 30;
  };

  const taskStats = {
    total: tasks.length,
    pending: tasks.filter((t) => t.status === "pending").length,
    inProgress: tasks.filter((t) => t.status === "in-progress").length,
    completed: tasks.filter((t) => t.status === "completed").length,
  };

  useEffect(() => {
    fetchTasks();
    fetchProjects();
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
        setShowModal(false);
        setShowUpdateModal(false);
        setShowRiskModal(false);
        setShowCommitsModal(false);
        setShowProjectModal(false);
      }
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, []);

  return (
    <LayoutStudent>
      <div className="container">
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
        <div className="dashboard-overview">
          <div className="dashboard-header">
            <h1 className="dashboard-title">My Assigned Tasks</h1>
            <button
              className="button button-primary"
              onClick={() => setShowModal(true)}
              disabled={isLoading}
            >
              <svg
                width="16"
                height="16"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
              New Task
            </button>
          </div>
          <div className="stats-grid">
            <div className="stat-card">
              <h3>{taskStats.total}</h3>
              <p>Total Assigned</p>
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
        </div>

        {error && (
          <div className="error-message">
            <svg
              width="20"
              height="20"
              fill="none"
              viewBox="0 0 24 24"
              stroke="#ef4444"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            {error}
          </div>
        )}

        {showModal && (
          <div className="modal-overlay" onClick={() => setShowModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2 className="modal-title">Create New Task</h2>
                <button
                  className="close-button"
                  onClick={() => setShowModal(false)}
                >
                  ×
                </button>
              </div>
              <form onSubmit={createTask}>
                <div className="form-group">
                  <label className="label" htmlFor="title">
                    Task Title
                  </label>
                  <input
                    className="input"
                    type="text"
                    id="title"
                    name="title"
                    placeholder="Enter task title"
                    value={newTask.title}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="label" htmlFor="description">
                    Description
                  </label>
                  <input
                    className="input"
                    type="text"
                    id="description"
                    name="description"
                    placeholder="Enter task description"
                    value={newTask.description}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="label" htmlFor="project">
                    Project
                  </label>
                  <select
                    className="select"
                    id="project"
                    name="project"
                    value={newTask.project}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Select a project</option>
                    {projects.map((project) => (
                      <option key={project._id} value={project._id}>
                        {project.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="label" htmlFor="taskDetails">
                    Details
                  </label>
                  <textarea
                    className="textarea"
                    id="taskDetails"
                    name="taskDetails"
                    placeholder="Enter task details"
                    value={newTask.taskDetails}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="form-group">
                  <label className="label" htmlFor="repoOwner">
                    Repository Owner
                  </label>
                  <input
                    className="input"
                    type="text"
                    id="repoOwner"
                    name="repoOwner"
                    placeholder="e.g., octocat"
                    value={newTask.repoOwner}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="label" htmlFor="repoName">
                    Repository Name
                  </label>
                  <input
                    className="input"
                    type="text"
                    id="repoName"
                    name="repoName"
                    placeholder="e.g., hello-world"
                    value={newTask.repoName}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="label" htmlFor="branchName">
                    Branch
                  </label>
                  <input
                    className="input"
                    type="text"
                    id="branchName"
                    name="branchName"
                    placeholder="e.g., main"
                    value={newTask.branchName}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="button-group">
                  <button
                    className="button button-default"
                    type="button"
                    onClick={() => setShowModal(false)}
                  >
                    Cancel
                  </button>
                  <button
                    className="button button-primary"
                    type="submit"
                    disabled={isLoading}
                  >
                    {isLoading ? "Creating..." : "Create Task"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {showUpdateModal && (
          <div className="modal-overlay" onClick={() => setShowUpdateModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2 className="modal-title">Update Task</h2>
                <button
                  className="close-button"
                  onClick={() => setShowUpdateModal(false)}
                >
                  ×
                </button>
              </div>
              <form onSubmit={updateTask}>
                <div className="form-group">
                  <label className="label" htmlFor="update-title">
                    Task Title
                  </label>
                  <input
                    className="input"
                    type="text"
                    id="update-title"
                    name="title"
                    placeholder="Enter task title"
                    value={updateTaskData.title}
                    onChange={handleUpdateInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="label" htmlFor="update-description">
                    Description
                  </label>
                  <input
                    className="input"
                    type="text"
                    id="update-description"
                    name="description"
                    placeholder="Enter task description"
                    value={updateTaskData.description}
                    onChange={handleUpdateInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="label" htmlFor="update-project">
                    Project
                  </label>
                  <select
                    className="select"
                    id="update-project"
                    name="project"
                    value={updateTaskData.project}
                    onChange={handleUpdateInputChange}
                    required
                  >
                    <option value="">Select a project</option>
                    {projects.map((project) => (
                      <option key={project._id} value={project._id}>
                        {project.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="label" htmlFor="update-status">
                    Status
                  </label>
                  <select
                    className="select"
                    id="update-status"
                    name="status"
                    value={updateTaskData.status}
                    onChange={handleUpdateInputChange}
                  >
                    {statusOptions.map((status) => (
                      <option key={status} value={status}>
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="label" htmlFor="update-priority">
                    Priority
                  </label>
                  <select
                    className="select"
                    id="update-priority"
                    name="priority"
                    value={updateTaskData.priority}
                    onChange={handleUpdateInputChange}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="label" htmlFor="update-taskDetails">
                    Details
                  </label>
                  <textarea
                    className="textarea"
                    id="update-taskDetails"
                    name="taskDetails"
                    placeholder="Enter task details"
                    value={updateTaskData.taskDetails}
                    onChange={handleUpdateInputChange}
                  />
                </div>
                <div className="form-group">
                  <label className="label" htmlFor="update-repoOwner">
                    Repository Owner
                  </label>
                  <input
                    className="input"
                    type="text"
                    id="update-repoOwner"
                    name="repoOwner"
                    placeholder="e.g., octocat"
                    value={updateTaskData.repoOwner}
                    onChange={handleUpdateInputChange}
                  />
                </div>
                <div className="form-group">
                  <label className="label" htmlFor="update-repoName">
                    Repository Name
                  </label>
                  <input
                    className="input"
                    type="text"
                    id="update-repoName"
                    name="repoName"
                    placeholder="e.g., hello-world"
                    value={updateTaskData.repoName}
                    onChange={handleUpdateInputChange}
                  />
                </div>
                <div className="form-group">
                  <label className="label" htmlFor="update-branchName">
                    Branch
                  </label>
                  <input
                    className="input"
                    type="text"
                    id="update-branchName"
                    name="branchName"
                    placeholder="e.g., main"
                    value={updateTaskData.branchName}
                    onChange={handleUpdateInputChange}
                  />
                </div>
                <div className="button-group">
                  <button
                    className="button button-default"
                    type="button"
                    onClick={() => setShowUpdateModal(false)}
                  >
                    Cancel
                  </button>
                  <button
                    className="button button-primary"
                    type="submit"
                    disabled={isUpdating}
                  >
                    {isUpdating ? "Updating..." : "Update Task"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {showRiskModal && (
          <div className="modal-overlay" onClick={() => setShowRiskModal(false)}>
            <div
              className="modal-content risk-modal"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-header">
                <h2 className="modal-title">
                  <svg
                    width="20"
                    height="20"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke={getRiskColor(riskAssessment.risk)}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                    />
                  </svg>
                  AI Risk Insights
                </h2>
                <button
                  className="close-button"
                  onClick={() => setShowRiskModal(false)}
                >
                  ×
                </button>
              </div>
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
                      <span
                        className="risk-label"
                        style={{ color: getRiskColor(riskAssessment.risk) }}
                      >
                        {riskAssessment.risk} Risk
                      </span>
                      <span className="confidence-pill">
                        {(riskAssessment.confidence * 100).toFixed(0)}% confidence
                      </span>
                    </h3>
                    <p className="risk-description">
                      {getRiskDescription(riskAssessment.risk)}
                    </p>
                  </div>
                </div>
                <div className="risk-details">
                  <div className="detail-card">
                    <h4>AI Analysis</h4>
                    <p>{riskAssessment.explanation}</p>
                  </div>
                  <div className="detail-card">
                    <h4>Potential Issues</h4>
                    <ul className="risk-factors">
                      {getRiskFactors(riskAssessment.risk).map((factor, index) => (
                        <li key={index}>
                          <svg
                            width="16"
                            height="16"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke={getRiskColor(riskAssessment.risk)}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                          {factor}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="detail-card recommendations">
                    <h4>AI Recommendations</h4>
                    <div className="recommendation-grid">
                      {getRecommendations(riskAssessment.risk).map((rec, index) => (
                        <div key={index} className="recommendation-item">
                          <div className="rec-icon">{index + 1}</div>
                          <p>{rec}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="ai-footer">
                  <div className="ai-powered">
                    <svg
                      width="16"
                      height="16"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="#3b82f6"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                      />
                    </svg>
                    <span>AI-Powered Risk Assessment</span>
                  </div>
                  <small>
                    This analysis is generated by our AI model based on task details
                    and historical data.
                  </small>
                </div>
              </div>
            </div>
          </div>
        )}

        {showCommitsModal && (
          <div className="modal-overlay" onClick={() => setShowCommitsModal(false)}>
            <div
              className="modal-content commits-modal"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-header">
                <h2 className="modal-title">GitHub Activity</h2>
                <button
                  className="close-button"
                  onClick={() => setShowCommitsModal(false)}
                >
                  ×
                </button>
              </div>
              <div className="github-activity">
                <h3>Commits</h3>
                {githubData.commits.length > 0 ? (
                  <ul className="commits-list">
                    {githubData.commits.map((commit, index) => (
                      <li key={index} className="commit-item">
                        <div className="commit-message">
                          <strong>{commit.message}</strong>
                          <a href={commit.url} target="_blank" rel="noopener noreferrer">
                            View on GitHub
                          </a>
                        </div>
                        <div className="commit-meta">
                          <span>Author: {commit.author}</span>
                          <span>Date: {new Date(commit.date).toLocaleString()}</span>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p>No commits found.</p>
                )}
                <h3>Merged Pull Requests</h3>
                {githubData.pull_requests.length > 0 ? (
                  <ul className="pr-list">
                    {githubData.pull_requests.map((pr, index) => (
                      <li key={index} className="pr-item">
                        <div className="pr-title">
                          <strong>#{pr.number}: {pr.title}</strong>
                          <a href={pr.url} target="_blank" rel="noopener noreferrer">
                            View on GitHub
                          </a>
                        </div>
                        <div className="pr-meta">
                          <span>Merged: {new Date(pr.merge_date).toLocaleString()}</span>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p>No merged pull requests found.</p>
                )}
              </div>
              <div className="button-group">
                <button
                  className="button button-default"
                  onClick={() => setShowCommitsModal(false)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {showProjectModal && selectedProject && (
          <div className="modal-overlay" onClick={() => setShowProjectModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2 className="modal-title">Project Details</h2>
                <button
                  className="close-button"
                  onClick={() => setShowProjectModal(false)}
                >
                  ×
                </button>
              </div>
              <div className="project-details">
                <div className="form-group">
                  <label className="label">Project Name</label>
                  <p className="text-gray-700">{selectedProject.name}</p>
                </div>
                <div className="form-group">
                  <label className="label">Description</label>
                  <p className="text-gray-700">
                    {selectedProject.description || "No description provided."}
                  </p>
                </div>
                <div className="form-group">
                  <label className="label">Progress</label>
                  <div className="progress-bar-container">
                    <div
                      className="progress-bar"
                      style={{
                        width: `${selectedProject.progress || 0}%`,
                        backgroundColor: getProgressColor(selectedProject.progress || 0),
                      }}
                    ></div>
                  </div>
                  <p className="text-gray-700">{selectedProject.progress || 0}%</p>
                </div>
                <div className="form-group">
                  <label className="label">Created At</label>
                  <p className="text-gray-700">
                    {new Date(selectedProject.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>
              <div className="button-group">
                <button
                  className="button button-default"
                  onClick={() => setShowProjectModal(false)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {isLoading && tasks.length === 0 ? (
          <div className="empty-state">
            <svg
              width="48"
              height="48"
              fill="none"
              viewBox="0 0 24 24"
              stroke="#9ca3af"
              style={{ margin: "0 auto 1rem" }}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <p>Loading your tasks...</p>
          </div>
        ) : tasks.length > 0 ? (
          <div className="task-grid">
            {tasks.map((task) => (
              <div
                key={task._id}
                className={`task-card task-card-${task.priority}`}
              >
                <h3 className="task-title">{task.title}</h3>
                <p className="task-description">{task.description}</p>
                {task.taskDetails && (
                  <p className="task-details">
                    <strong>Details:</strong> {task.taskDetails}
                  </p>
                )}
                <div className="task-status">
                  <span
                    className="status-badge"
                    style={{ backgroundColor: getStatusColor(task.status) }}
                  >
                    {task.status
                      ? task.status.charAt(0).toUpperCase() + task.status.slice(1)
                      : "Pending"}
                  </span>
                </div>
                {typeof task.progressPercentage === "number" &&
                task.progressPercentage > 0 ? (
                  <div
                    className="task-progress"
                    title="Progress based on GitHub activity"
                  >
                    <div className="progress-label">
                      <BarChart2 size={14} />
                      <span>Progress: {task.progressPercentage}%</span>
                      {isTaskStalled(task) && (
                        <AlertCircle
                          size={14}
                          color="#ef4444"
                          title="No recent activity"
                        />
                      )}
                    </div>
                    <div className="progress-bar-container">
                      <div
                        className="progress-bar"
                        style={{
                          width: `${task.progressPercentage}%`,
                          backgroundColor: getProgressColor(task.progressPercentage),
                        }}
                      ></div>
                    </div>
                  </div>
                ) : (
                  <div
                    className="task-progress"
                    title="Progress based on GitHub activity"
                  >
                    <div className="progress-label">
                      <BarChart2 size={14} />
                      <span>Progress: Awaiting activity</span>
                      <AlertCircle
                        size={14}
                        color="#ef4444"
                        title="No activity detected"
                      />
                    </div>
                  </div>
                )}
                <div className="task-meta">
                  <div>
                    <span
                      className={`priority-badge priority-${task.priority}`}
                    >
                      {task.priority
                        ? task.priority.charAt(0).toUpperCase() +
                          task.priority.slice(1)
                        : "Medium"}
                    </span>
                    <span className="margin-left-half">
                      • {getProjectName(task.project)}
                    </span>
                  </div>
                  <div className="task-button-group">
                    <button
                      className="button button-secondary"
                      onClick={() => openUpdateModal(task._id)}
                      disabled={isLoading}
                      title="Update Task"
                    >
                      <Edit size={14} />
                    </button>
                    <button
                      className="button button-info"
                      onClick={() => openRiskModal(task._id)}
                      disabled={isLoading}
                      title="View AI Risk Assessment"
                    >
                      <svg
                        width="14"
                        height="14"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                        />
                      </svg>
                    </button>
                    <button
                      className="button button-primary"
                      onClick={() => openProjectModal(task.project?._id || task.project)}
                      disabled={isLoading || !task.project}
                      title="View Project Details"
                    >
                      <Eye size={14} />
                    </button>
                    <button
                      className="button button-danger"
                      onClick={() => deleteTask(task._id)}
                      disabled={isLoading}
                      title="Delete Task"
                    >
                      <svg
                        width="14"
                        height="14"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <svg
              width="48"
              height="48"
              fill="none"
              viewBox="0 0 24 24"
              stroke="#9ca3af"
              style={{ margin: "0 auto 1rem" }}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
            <p>No tasks assigned to you. Create a new task!</p>
            <button
              className="button button-primary margin-top-1"
              onClick={() => setShowModal(true)}
            >
              Create Task
            </button>
          </div>
        )}
      </div>
    </LayoutStudent>
  );
};

export default TaskManager;