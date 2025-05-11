import React, { useState, useEffect } from "react";
import axios from "axios";
import LayoutTutor from "../dashboard/LayoutTutorss";
import "./Tasks.css";
import { Clock, BarChart2, GitCommit, AlertCircle, BookOpen } from "lucide-react";
import QuizAnalyticsPanel from './QuizAnalyticsPanel';

const TaskManagerTutor = () => {
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [githubData, setGithubData] = useState({ commits: [], pull_requests: [] });
  const [error, setError] = useState(null);
  const [showRiskModal, setShowRiskModal] = useState(false);
  const [showCommitsModal, setShowCommitsModal] = useState(false);
  const [showAnalyticsPanel, setShowAnalyticsPanel] = useState(null);
  const [riskAssessment, setRiskAssessment] = useState({
    risk: "",
    confidence: 0,
    explanation: "",
  });
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const tasksPerPage = 6;
  const [users, setUsers] = useState([]);
  const [showTaskDetailsModal, setShowTaskDetailsModal] = useState(false);
  const [selectedTaskDetails, setSelectedTaskDetails] = useState(null);

  // Pagination calculations
  const totalPages = Math.ceil(tasks.length / tasksPerPage);
  const startIndex = (currentPage - 1) * tasksPerPage;
  const endIndex = startIndex + tasksPerPage;
  const paginatedTasks = tasks.slice(startIndex, endIndex);

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

  // Helper function to calculate progress
  const calculateProgress = (commits, pull_requests, taskStatus, quizScore) => {
    let progress = 0;

    if (taskStatus === "completed") {
      return 100;
    } else if (taskStatus === "pending") {
      progress = Math.min(progress, 10);
    }

    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    commits.forEach((commit) => {
      const commitDate = new Date(commit.date);
      const isRecent = commitDate > oneWeekAgo;
      progress += isRecent ? 2 : 1;
    });
    progress = Math.min(progress, 50);

    pull_requests.forEach((pr) => {
      const prDate = new Date(pr.merge_date);
      const isRecent = prDate > oneWeekAgo;
      progress += isRecent ? 15 : 10;
    });
    progress = Math.min(progress, 90);

    if (quizScore !== undefined) {
      progress = Math.min(progress + quizScore * 0.5, 90);
    }

    const hasRecentActivity = commits.some((c) => new Date(c.date) > oneWeekAgo) ||
                             pull_requests.some((pr) => new Date(pr.merge_date) > oneWeekAgo);
    if (!hasRecentActivity && taskStatus !== "completed") {
      progress = Math.min(progress, 30);
    }

    return Math.round(Math.min(progress, 100));
  };

  const openRiskModal = async (taskId) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("No token found. Please login.");
        return;
      }

      const response = await axios.get(`http://localhost:5000/api/tasks/getTaskById/${taskId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

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
        setShowRiskModal(true);
      } else {
        setError("No risk assessment available for this task");
      }
    } catch (error) {
      console.error("Error fetching task risk:", error);
      setError(error.response?.data?.message || "Error fetching risk assessment");
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
        { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } }
      );

      if (!githubResponse.data) {
        throw new Error("No GitHub data received");
      }

      const { commits, pull_requests } = githubResponse.data;

      // Fetch quiz analytics
      let quizScore, quizPassed;
      try {
        const quizResponse = await axios.get(
          `http://localhost:5000/api/tasks/quizAnalytics/${taskId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        
        // Find attempts for the assigned user
        const latestAttempt = quizResponse.data.analytics
          .flatMap(quiz => quiz.attempts)
          .filter(attempt => attempt.userId === task.assignedTo)
          .sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt))[0];
        
        quizScore = latestAttempt?.score;
        quizPassed = latestAttempt?.passed;
      } catch (error) {
        console.error("Error fetching quiz analytics:", error);
        quizScore = null;
        quizPassed = null;
      }

      const calculatedProgress = calculateProgress(
        commits,
        pull_requests,
        task.status,
        quizScore
      );

      setTasks((prevTasks) =>
        prevTasks.map((t) =>
          t._id === taskId ? { ...t, progressPercentage: calculatedProgress, quizScore, quizPassed } : t
        )
      );

      setGithubData({
        commits: commits || [],
        pull_requests: pull_requests || []
      });
      setShowCommitsModal(true);
      setError(null);
    } catch (error) {
      console.error("Error tracking GitHub activity:", error);
      setError(error.response?.data?.message || error.message || "Error tracking GitHub activity");
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
      const response = await axios.get("http://localhost:5000/api/tasks/getAllTasks", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const tasksWithQuizData = await Promise.all(response.data.map(async (task) => {
        try {
          const quizResponse = await axios.get(
            `http://localhost:5000/api/tasks/quizAnalytics/${task._id}`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          
          // Find attempts for the assigned user
          const latestAttempt = quizResponse.data.analytics
            .flatMap(quiz => quiz.attempts)
            .filter(attempt => 
              attempt.userId === task.assignedTo || 
              attempt.email === getUserInfo(task.assignedTo).email
            )
            .sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt))[0];
          
          return {
            ...task,
            quizScore: latestAttempt?.score,
            quizPassed: latestAttempt?.passed
          };
        } catch (error) {
          return { ...task, quizScore: null, quizPassed: null };
        }
      }));

      setTasks(tasksWithQuizData);
      setCurrentPage(1);
    } catch (error) {
      console.error("Error fetching tasks:", error);
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
      console.error("Error fetching projects:", error);
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
      console.error("Error fetching users:", error);
      setError(error.response?.data?.message || "Error fetching users");
    }
  };

  useEffect(() => {
    fetchTasks();
    fetchProjects();
    fetchUsers();

    if (error) {
      const timer = setTimeout(() => setError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape") {
        setShowRiskModal(false);
        setShowCommitsModal(false);
        setShowAnalyticsPanel(null);
        setShowTaskDetailsModal(false);
      }
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, []);

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

  const getProjectName = (projectId) => {
    const project = projects.find((p) => p._id === projectId);
    return project ? project.name : "No Project";
  };

  const getProgressColor = (percentage) => {
    if (percentage < 30) return "#ef4444";
    if (percentage < 70) return "#f59e0b";
    return "#10b981";
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "pending":
        return "#9ca3af";
      case "in-progress":
        return "#f59e0b";
      case "completed":
        return "#10b981";
      default:
        return "#3b82f6";
    }
  };

  const isTaskStalled = (task) => {
    if (task.status === "completed") return false;
    if (!task.progressPercentage || task.progressPercentage === 0) return true;
    return task.progressPercentage < 30;
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

  const taskStats = {
    total: tasks.length,
    pending: tasks.filter((t) => t.status === "pending").length,
    inProgress: tasks.filter((t) => t.status === "in-progress").length,
    completed: tasks.filter((t) => t.status === "completed").length,
  };

  const getUserInfo = (userId) => {
    if (!userId || userId === "undefined" || userId === "null") {
      return { 
        name: "Unassigned", 
        email: "No email", 
        profilePic: null 
      };
    }
    
    const user = users.find(u => u && u._id === userId);
    
    return user ? 
      { 
        name: user.name || "Unknown", 
        email: user.email || "No email",
        profilePic: user.profilePic || null
      } : 
      { 
        name: "Unassigned", 
        email: "No email",
        profilePic: null
      };
  };

  const getProfilePicUrl = (profilePic) => {
    if (!profilePic) {
      return "https://upload.wikimedia.org/wikipedia/commons/a/ac/Default_pfp.jpg";
    }
    return profilePic.startsWith("http")
      ? profilePic
      : `http://localhost:5000/uploads/profiles/${profilePic}`;
  };

  const openTaskDetailsModal = (task) => {
    setSelectedTaskDetails(task);
    setShowTaskDetailsModal(true);
  };

  return (
    <LayoutTutor>
      <div className="container">
        <div className="simple-header">
          <div className="task-counts">
            <span>Total: <strong>{taskStats.total}</strong></span>
            <span>•</span>
            <span>Pending: <strong>{taskStats.pending}</strong></span>
            <span>•</span>
            <span>Completed: <strong>{taskStats.completed}</strong></span>
          </div>
        </div>

        {error && (
          <div className="error-message">
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="#ef4444">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {error}
          </div>
        )}

        {showRiskModal && (
          <div className="modal-overlay" onClick={() => setShowRiskModal(false)}>
            <div className="modal-content risk-modal" onClick={(e) => e.stopPropagation()}>
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
            <div className="modal-content commits-modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2 className="modal-title">
                  <GitCommit size={20} />
                  GitHub Activity
                </h2>
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

        {showAnalyticsPanel && (
          <div className="modal-overlay">
            <QuizAnalyticsPanel 
              taskId={showAnalyticsPanel} 
              onClose={() => setShowAnalyticsPanel(null)}
              githubInfo={{
                repoOwner: tasks.find(t => t._id === showAnalyticsPanel)?.repoOwner ,
                repoName: tasks.find(t => t._id === showAnalyticsPanel)?.repoName ,
                commitSha: tasks.find(t => t._id === showAnalyticsPanel)?.commitSha ,
                branch: tasks.find(t => t._id === showAnalyticsPanel)?.branchName 
              }}
            />
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
            <p>Loading tasks...</p>
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

                  <div className="task-assigned-user">
                    <div className="user-info-container">
                      <div className="user-avatar">
                        <img
                          src={getProfilePicUrl(getUserInfo(task.assignedTo).profilePic)}
                          alt={getUserInfo(task.assignedTo).name}
                          className="user-avatar-img"
                          onError={(e) => {
                            e.target.src = "https://upload.wikimedia.org/wikipedia/commons/a/ac/Default_pfp.jpg";
                          }}
                        />
                      </div>
                      <div className="user-details">
                        <strong>{getUserInfo(task.assignedTo).name}</strong>
                        <div className="user-email">{getUserInfo(task.assignedTo).email}</div>
                      </div>
                    </div>
                  </div>

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
                    <div className="task-progress" title="Progress based on GitHub activity and quiz results">
                      <div className="progress-label">
                        <BarChart2 size={14} />
                        <span>Progress: {task.progressPercentage}%</span>
                        {isTaskStalled(task) && (
                          <AlertCircle size={14} color="#ef4444" title="No recent activity" />
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
                    <div className="task-progress" title="Progress based on GitHub activity">
                      <div className="progress-label">
                        <BarChart2 size={14} />
                        <span>Progress: Awaiting activity</span>
                        <AlertCircle size={14} color="#ef4444" title="No activity detected" />
                      </div>
                    </div>
                  )}

                  {task.quizScore !== undefined && (
                    <div className="task-quiz-status">
                      <BookOpen size={14} />
                      <span>
                        Quiz: {task.quizScore}/100 (
                        {task.quizPassed ? (
                          <span style={{ color: '#10b981' }}>Passed</span>
                        ) : (
                          <span style={{ color: '#ef4444' }}>Failed</span>
                        )})
                      </span>
                    </div>
                  )}

                  <div className="task-meta">
                    <div>
                      <span className={`priority-badge priority-${task.priority}`}>
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
                        onClick={() => openTaskDetailsModal(task)}
                        disabled={isLoading}
                        title="View Task Details"
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
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                          />
                        </svg>
                      </button>
                      <button
                        className="button button-info"
                        onClick={() => openRiskModal(task._id)}
                        disabled={isLoading}
                        title="View AI Risk Assessment"
                        style={{
                          backgroundColor: task.risk ? getRiskColor(task.risk) : "#3b82f6",
                          borderColor: task.risk ? getRiskColor(task.risk) : "#3b82f6",
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
                        onClick={() => trackCommits(task._id)}
                        disabled={isLoading}
                        title="Track GitHub Activity"
                      >
                        <GitCommit size={14} />
                      </button>
                      <button
                        className="button button-success"
                        onClick={() => setShowAnalyticsPanel(task._id)}
                        disabled={isLoading}
                        title="View Quiz Analytics"
                      >
                        <BarChart2 size={14} />
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
            {tasks.length > tasksPerPage && (
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
            <p>No tasks available.</p>
          </div>
        )}
      </div>

      {showTaskDetailsModal && selectedTaskDetails && (
        <div className="modal-overlay" onClick={() => setShowTaskDetailsModal(false)}>
          <div className="modal-content task-details-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">
                <svg
                  width="20"
                  height="20"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
                Task Details
              </h2>
              <button
                className="close-button"
                onClick={() => setShowTaskDetailsModal(false)}
              >
                ×
              </button>
            </div>

            <div className="task-details-content">
              <div className="detail-section">
                <h3 className="section-title">Task Information</h3>
                <div className="detail-grid">
                  <div className="detail-item">
                    <span className="detail-label">Title:</span>
                    <span className="detail-value">{selectedTaskDetails.title}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Status:</span>
                    <span 
                      className="status-badge"
                      style={{ backgroundColor: getStatusColor(selectedTaskDetails.status) }}
                    >
                      {selectedTaskDetails.status
                        ? selectedTaskDetails.status.charAt(0).toUpperCase() + selectedTaskDetails.status.slice(1)
                        : "Pending"}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Priority:</span>
                    <span className={`priority-badge priority-${selectedTaskDetails.priority}`}>
                      {selectedTaskDetails.priority
                        ? selectedTaskDetails.priority.charAt(0).toUpperCase() + selectedTaskDetails.priority.slice(1)
                        : "Medium"}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Project:</span>
                    <span className="detail-value">{getProjectName(selectedTaskDetails.project)}</span>
                  </div>
                  {selectedTaskDetails.dueDate && (
                    <div className="detail-item">
                      <span className="detail-label">Due Date:</span>
                      <span className="detail-value">
                        {new Date(selectedTaskDetails.dueDate).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                  {typeof selectedTaskDetails.progressPercentage === "number" && (
                    <div className="detail-item">
                      <span className="detail-label">Progress:</span>
                      <div className="progress-container">
                        <div 
                          className="progress-bar" 
                          style={{
                            width: `${selectedTaskDetails.progressPercentage}%`,
                            backgroundColor: getProgressColor(selectedTaskDetails.progressPercentage)
                          }}
                        ></div>
                      </div>
                      <span className="progress-text">{selectedTaskDetails.progressPercentage}%</span>
                    </div>
                  )}
                  {selectedTaskDetails.quizScore !== undefined && (
                    <div className="detail-item">
                      <span className="detail-label">Quiz Result:</span>
                      <span className="detail-value">
                        {selectedTaskDetails.quizScore}/100 (
                        {selectedTaskDetails.quizPassed ? (
                          <span style={{ color: '#10b981' }}>Passed</span>
                        ) : (
                          <span style={{ color: '#ef4444' }}>Failed</span>
                        )})
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="detail-section">
                <h3 className="section-title">Description</h3>
                <p className="description-text">{selectedTaskDetails.description}</p>
                
                {selectedTaskDetails.taskDetails && (
                  <>
                    <h3 className="section-title mt-4">Additional Details</h3>
                    <p className="description-text">{selectedTaskDetails.taskDetails}</p>
                  </>
                )}
              </div>

              <div className="detail-section">
                <h3 className="section-title">Assigned Student</h3>
                <div className="student-info">
                  <div className="student-avatar">
                    <img
                      src={getProfilePicUrl(getUserInfo(selectedTaskDetails.assignedTo).profilePic)}
                      alt={getUserInfo(selectedTaskDetails.assignedTo).name}
                      className="rounded-circle"
                      width="40"
                      height="40"
                      style={{ objectFit: 'cover' }}
                      onError={(e) => {
                        e.target.src = "https://upload.wikimedia.org/wikipedia/commons/a/ac/Default_pfp.jpg";
                      }}
                    />
                  </div>
                  <div className="student-details">
                    <h4 className="student-name">{getUserInfo(selectedTaskDetails.assignedTo).name}</h4>
                    <p className="student-email">{getUserInfo(selectedTaskDetails.assignedTo).email}</p>
                  </div>
                </div>
              </div>

              {selectedTaskDetails.risk && (
                <div className="detail-section">
                  <h3 className="section-title">Risk Assessment</h3>
                  <div className="risk-info">
                    <span 
                      className="risk-badge"
                      style={{ backgroundColor: getRiskColor(selectedTaskDetails.risk) }}
                    >
                      {selectedTaskDetails.risk}
                    </span>
                    <p className="risk-description">
                      {getRiskDescription(selectedTaskDetails.risk)}
                    </p>
                  </div>
                </div>
              )}

              <div className="modal-actions">
                <button 
                  className="button button-secondary"
                  onClick={() => setShowTaskDetailsModal(false)}
                >
                  Close
                </button>
                <button 
                  className="button button-primary"
                  onClick={() => trackCommits(selectedTaskDetails._id)}
                >
                  <GitCommit size={14} className="me-2" />
                  Track GitHub Activity
                </button>
                <button
                  className="button button-success"
                  onClick={() => setShowAnalyticsPanel(selectedTaskDetails._id)}
                >
                  <BarChart2 size={14} className="me-2" />
                  View Quiz Analytics
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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

        .task-assigned-user {
          background-color: #f3f4f6;
          padding: 0.75rem;
          border-radius: 0.375rem;
          margin-bottom: 0.75rem;
          font-size: 0.875rem;
        }
        
        .user-email {
          color: #6b7280;
          font-size: 0.75rem;
          margin-top: 0.25rem;
        }

        .user-info-container {
          display: flex;
          align-items: center;
        }

        .user-avatar {
          margin-right: 0.75rem;
        }

        .user-avatar-img {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          object-fit: cover;
          border: 2px solid #fff;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }

        .user-details {
          display: flex;
          flex-direction: column;
        }

        .task-quiz-status {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
          color: #4b5563;
          margin-top: 8px;
        }

        .task-details-modal {
          max-width: 700px;
          width: 90%;
          max-height: 85vh;
          overflow-y: auto;
        }

        .task-details-content {
          padding: 1.5rem;
        }

        .detail-section {
          margin-bottom: 1.5rem;
          padding-bottom: 1.5rem;
          border-bottom: 1px solid #e5e7eb;
        }

        .detail-section:last-child {
          border-bottom: none;
          margin-bottom: 0;
          padding-bottom: 0;
        }

        .section-title {
          font-size: 1.125rem;
          font-weight: 600;
          color: #374151;
          margin-bottom: 1rem;
        }

        .detail-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 1rem;
        }

        .detail-item {
          display: flex;
          flex-direction: column;
        }

        .detail-label {
          font-size: 0.75rem;
          color: #6b7280;
          margin-bottom: 0.25rem;
        }

        .detail-value {
          font-size: 0.875rem;
          color: #1f2937;
          font-weight: 500;
        }

        .description-text {
          color: #4b5563;
          font-size: 0.875rem;
          line-height: 1.5;
        }

        .student-info {
          display: flex;
          align-items: center;
          background-color: #f9fafb;
          padding: 1rem;
          border-radius: 0.5rem;
        }

        .student-avatar {
          margin-right: 1rem;
        }

        .student-details {
          flex: 1;
        }

        .student-name {
          font-size: 1rem;
          font-weight: 600;
          color: #1f2937;
          margin: 0 0 0.25rem;
        }

        .student-email {
          font-size: 0.875rem;
          color: #6b7280;
          margin: 0;
        }

        .risk-info {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
        }

        .risk-badge {
          display: inline-block;
          padding: 0.25rem 0.75rem;
          border-radius: 9999px;
          font-size: 0.75rem;
          font-weight: 500;
          color: white;
          margin-bottom: 0.5rem;
        }

        .risk-description {
          font-size: 0.875rem;
          color: #4b5563;
          margin: 0;
        }

        .progress-container {
          height: 0.5rem;
          background-color: #e5e7eb;
          border-radius: 9999px;
          overflow: hidden;
          margin: 0.25rem 0;
          width: 100%;
        }

        .progress-bar {
          height: 100%;
          border-radius: 9999px;
        }

        .progress-text {
          font-size: 0.75rem;
          color: #6b7280;
        }

        .modal-actions {
          display: flex;
          justify-content: flex-end;
          gap: 0.75rem;
          margin-top: 1.5rem;
        }

        .mt-4 {
          margin-top: 1rem;
        }

        .me-2 {
          margin-right: 0.5rem;
        }

        .button-success {
          background-color: #10b981;
          border-color: #10b981;
          color: white;
        }

        .button-success:hover {
          background-color: #059669;
          border-color: #059669;
        }

        @media (max-width: 640px) {
          .detail-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </LayoutTutor>
  );
};

export default TaskManagerTutor;
