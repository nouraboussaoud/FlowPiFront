import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import LayoutStudent from "../dashboard/LayoutStudent";
import "./Tasks.css";
import { Folder, Clock, BarChart2, Edit, AlertCircle, Eye } from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Contact from "../../student-interfaces/Contact";
import { get, post } from "../../apiHelper";
import Chatbox from "../tutor-interfaces/chatbox/ChatBox";

const TaskManager = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [userGroups, setUserGroups] = useState([]);
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
  const [tutors, setTutors] = useState([]);
  const [selectedTutor, setSelectedTutor] = useState(null);
  const [showContactList, setShowContactList] = useState(false);
  const [showChatBubble, setShowChatBubble] = useState(true);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const tasksPerPage = 6;

  const statusOptions = ["pending", "in-progress", "completed"];

  const totalPages = Math.ceil(tasks.length / tasksPerPage);
  const startIndex = (currentPage - 1) * tasksPerPage;
  const endIndex = startIndex + tasksPerPage;
  const paginatedTasks = tasks.slice(startIndex, endIndex);

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
        { headers: { Authorization: `Bearer ${token}` } }
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
        setError(
          "No risk assessment available. Please ensure task details are provided."
        );
      }
    } catch (error) {
      console.error("Error fetching task risk:", error);
      setError(
        error.response?.data?.message || "Failed to fetch risk assessment."
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
        project: task.project?._id || task.project || "",
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
        .get(`http://localhost:5000/api/projects/getProjectById/${id}`, {
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

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    const token = localStorage.getItem("token");
    if (!token) {
      setError("No token found. Please login.");
      setIsLoading(false);
      return;
    }

    try {
      // 1. Fetch user's groups
      const groupsResponse = await axios.get(
        "http://localhost:5000/api/groups/my-groups",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setUserGroups(groupsResponse.data);
      const userGroupIds = groupsResponse.data.map((group) => group._id);

      // 2. Fetch projects associated with the user's groups
      const projectsResponse = await axios.get(
        "http://localhost:5000/api/projects/projects",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const filteredProjects = projectsResponse.data.filter(
        (project) => project.group && userGroupIds.includes(project.group._id)
      );
      setProjects(filteredProjects);

      // 3. Fetch tasks associated with the filtered projects
      const tasksResponse = await axios.get(
        "http://localhost:5000/api/tasks/myTasks",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const tasksWithRisk = await Promise.all(
        tasksResponse.data.map(async (task) => {
          try {
            const taskResponse = await axios.get(
              `http://localhost:5000/api/tasks/getTaskById/${task._id}`,
              { headers: { Authorization: `Bearer ${token}` } }
            );
            return { ...task, risk: taskResponse.data.risk || "unknown" };
          } catch (error) {
            console.error(`Error fetching risk for task ${task._id}:`, error);
            return { ...task, risk: "unknown" };
          }
        })
      );
      const filteredTasks = tasksWithRisk.filter(
        (task) =>
          task.project &&
          filteredProjects.some((project) => project._id === task.project._id)
      );
      setTasks(filteredTasks);
      setCurrentPage(1);
    } catch (error) {
      console.error("Error fetching data:", error);
      setError(error.response?.data?.message || "Error fetching data");
    } finally {
      setIsLoading(false);
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

    // Verify the project belongs to user's group
    const project = projects.find((p) => p._id === newTask.project);
    if (!project || !userGroups.some((g) => g._id === project.group?._id)) {
      setError("You can only create tasks for projects in your groups");
      return;
    }

    try {
      setIsLoading(true);
      const response = await axios.post(
        "http://localhost:5000/api/tasks/createTask",
        newTask,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const taskResponse = await axios.get(
        `http://localhost:5000/api/tasks/getTaskById/${response.data.task._id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setTasks([
        ...tasks,
        { ...response.data.task, risk: taskResponse.data.risk || "unknown" },
      ]);
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
      const newTotalPages = Math.ceil((tasks.length + 1) / tasksPerPage);
      if (currentPage > newTotalPages) {
        setCurrentPage(newTotalPages);
      }
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

    // Verify the project belongs to user's group
    const project = projects.find((p) => p._id === updateTaskData.project);
    if (!project || !userGroups.some((g) => g._id === project.group?._id)) {
      setError("You can only assign tasks to projects in your groups");
      return;
    }

    try {
      setIsUpdating(true);
      const response = await axios.put(
        `http://localhost:5000/api/tasks/updateTask/${selectedTaskId}`,
        updateTaskData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const taskResponse = await axios.get(
        `http://localhost:5000/api/tasks/getTaskById/${selectedTaskId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setTasks((prev) =>
        prev.map((task) =>
          task._id === selectedTaskId
            ? { ...response.data.task, risk: taskResponse.data.risk || "unknown" }
            : task
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
      const task = tasks.find((t) => t._id === taskId);
      const project = projects.find((p) => p._id === task.project?._id);
      if (!project || !userGroups.some((g) => g._id === project.group?._id)) {
        setError("You can only delete tasks from projects in your groups");
        return;
      }

      await axios.delete(`http://localhost:5000/api/tasks/deleteTask/${taskId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTasks((prev) => prev.filter((task) => task._id !== taskId));
      setError(null);
      const newTotalPages = Math.ceil((tasks.length - 1) / tasksPerPage);
      if (currentPage > newTotalPages && newTotalPages > 0) {
        setCurrentPage(newTotalPages);
      } else if (newTotalPages === 0) {
        setCurrentPage(1);
      }
    } catch (error) {
      console.error("Error deleting task:", error);
      setError(error.response?.data?.message || "Error deleting task");
    } finally {
      setIsLoading(false);
    }
  };

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
    if (startPage > 2) {
      pages.push("...");
    }
    for (let i = Math.max(2, startPage); i <= Math.min(totalPages - 1, endPage); i++) {
      pages.push(i);
    }
    if (endPage < totalPages - 1) {
      pages.push("...");
    }
    if (totalPages > 1) {
      pages.push(totalPages);
    }

    return pages;
  };

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
    setShowChatBubble(false);
    setUnreadMessages((prev) => Math.max(0, prev - 1));
  };

  const toggleContactList = () => {
    setShowContactList(true);
    setShowChatBubble(false);
  };

  const closeContactList = () => {
    setShowContactList(false);
    setShowChatBubble(!selectedTutor);
  };

  const handleCloseChatbox = () => {
    setSelectedTutor(null);
    setShowChatBubble(true);
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
    fetchData();

    const queryParams = new URLSearchParams(location.search);
    const token = queryParams.get("token");
    if (token) {
      localStorage.setItem("token", token);
      console.log("Token stored in localStorage:", token);
      navigate("/tasks", { replace: true });
    }

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

    fetchUnreadMessagesCount();
    const messageInterval = setInterval(fetchUnreadMessagesCount, 30000);
    return () => clearInterval(messageInterval);
  }, [location, navigate]);

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
        setShowContactList(false);
        setShowChatBubble(true);
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

        <div className="simple-header">
          <div className="task-counts">
            <span>Total: <strong>{taskStats.total}</strong></span>
            <span>•</span>
            <span>Pending: <strong>{taskStats.pending}</strong></span>
            <span>•</span>
            <span>Completed: <strong>{taskStats.completed}</strong></span>
          </div>

          <button
            className="button button-primary"
            onClick={() => setShowModal(true)}
            disabled={isLoading || projects.length === 0}
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
                        {riskAssessment.risk}
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
                  <label className="label">Group</label>
                  <p className="text-gray-700">
                    {selectedProject.group?.name || "No group assigned"}
                  </p>
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

        <div className="chat-bubble-container">
          {showChatBubble && !selectedTutor && (
            <div
              className={`chat-bubble ${showContactList ? "active" : ""}`}
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
          <>
            <div className="task-grid">
              {paginatedTasks.map((task) => (
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
                        style={{
                          backgroundColor: getRiskColor(task.risk),
                          borderColor: getRiskColor(task.risk),
                        }}
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
            {tasks.length > 0 && (
              <div className="pagination">
                <button
                  className="pagination-button"
                  onClick={goToPreviousPage}
                  disabled={currentPage === 1}
                >
                  Previous
                </button>
                <div className="pagination-pages">
                  {getPageNumbers().map((page, index) => (
                    <button
                      key={index}
                      className={`pagination-page ${
                        page === currentPage ? "active" : ""
                      } ${page === "..." ? "ellipsis" : ""}`}
                      onClick={() => typeof page === "number" && goToPage(page)}
                      disabled={page === "..."}
                    >
                      {page}
                    </button>
                  ))}
                </div>
                <button
                  className="pagination-button"
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
            <p>No tasks assigned to you in your groups. Create a new task!</p>
            {projects.length > 0 && (
              <button
                className="button button-primary margin-top-1"
                onClick={() => setShowModal(true)}
              >
                Create Task
              </button>
            )}
          </div>
        )}
      </div>

      <style jsx>{`
        .simple-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
          padding-bottom: 1rem;
          border-bottom: 1px solid #e5e7eb;
        }

        .task-counts {
          display: flex;
          align-items: center;
          gap: 10px;
          color: #6b7280;
          font-size: 14px;
        }

        .task-counts strong {
          color: #1f2937;
          font-weight: 600;
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

        .pagination {
          display: flex;
          justify-content: center;
          align-items: center;
          margin-top: 20px;
          gap: 10px;
        }

        .pagination-button {
          padding: 10px 18px;
          background-color: #4a6cf7;
          color: white;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-size: 14px;
          font-weight: 500;
          transition: all 0.2s;
          box-shadow: 0 2px 4px rgba(74, 108, 247, 0.2);
        }

        .pagination-button:hover:not(:disabled) {
          background-color: #3a5bd9;
          transform: translateY(-2px);
          box-shadow: 0 4px 8px rgba(74, 108, 247, 0.3);
        }

        .pagination-button:disabled {
          background-color: #a5b4fc;
          cursor: not-allowed;
        }

        .pagination-pages {
          display: flex;
          gap: 6px;
        }

        .pagination-page {
          padding: 8px 14px;
          background-color: #f8fafc;
          color: #4a5568;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          cursor: pointer;
          font-size: 14px;
          font-weight: 500;
          transition: all 0.2s;
        }

        .pagination-page:hover:not(.ellipsis):not(.active) {
          background-color: #edf2f7;
          transform: translateY(-2px);
        }

        .pagination-page.active {
          background-color: #4a6cf7;
          color: white;
          border-color: #4a6cf7;
          box-shadow: 0 2px 4px rgba(74, 108, 247, 0.2);
        }

        .pagination-page.ellipsis {
          background-color: transparent;
          border: none;
          cursor: default;
          display: flex;
          align-items: center;
        }

        @media (max-width: 767.98px) {
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
          .pagination {
            flex-wrap: wrap;
            gap: 5px;
          }
          .pagination-button {
            padding: 6px 12px;
            font-size: 12px;
          }
          .pagination-page {
            padding: 6px 10px;
            font-size: 12px;
          }
        }
      `}</style>
    </LayoutStudent>
  );
};

export default TaskManager;
