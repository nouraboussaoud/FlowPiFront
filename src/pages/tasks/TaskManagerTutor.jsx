import React, { useState, useEffect } from "react";
import axios from "axios";
import LayoutTutor from "../dashboard/LayoutTutorss";
import "./Tasks.css";
import { Clock, BarChart2, GitCommit, AlertCircle } from "lucide-react";

const TaskManagerTutor = () => {
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [githubData, setGithubData] = useState({ commits: [], pull_requests: [] });
  const [error, setError] = useState(null);
  const [showRiskModal, setShowRiskModal] = useState(false);
  const [showCommitsModal, setShowCommitsModal] = useState(false);
  const [riskAssessment, setRiskAssessment] = useState({
    risk: "",
    confidence: 0,
    explanation: "",
  });
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const tasksPerPage = 6;

  // Pagination calculations
  const totalPages = Math.ceil(tasks.length / tasksPerPage);
  const startIndex = (currentPage - 1) * tasksPerPage;
  const endIndex = startIndex + tasksPerPage;
  const paginatedTasks = tasks.slice(startIndex, endIndex);

  // Helper functions for risk assessment
  const getRiskColor = (risk) => {
    switch (risk.toLowerCase()) {
      case "high risk":
        return "#ef4444";
      case "low risk":
        return "#10b981";
      default:
        return "#3b82f6";
    }
  };

  const getRiskDescription = (risk) => {
    switch (risk.toLowerCase()) {
      case "high risk":
        return "This task has significant challenges that may impact deadlines or quality.";
      case "low risk":
        return "This task appears straightforward with minimal risks.";
      default:
        return "Risk assessment not available.";
    }
  };

  const getRiskFactors = (risk) => {
    switch (risk.toLowerCase()) {
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
    switch (risk.toLowerCase()) {
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

  // Helper function to calculate progress based on GitHub activity
  const calculateProgress = (commits, pullRequests, taskStatus) => {
    let progress = 0;

    // Base progress caps based on status
    if (taskStatus === "completed") {
      return 100;
    } else if (taskStatus === "pending") {
      progress = Math.min(progress, 10); // Cap pending tasks at 10% unless activity suggests more
    }

    // Calculate progress from commits
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    commits.forEach((commit) => {
      const commitDate = new Date(commit.date);
      const isRecent = commitDate > oneWeekAgo;
      // Each commit adds 1% (2% if recent), capped at 50% total from commits
      progress += isRecent ? 2 : 1;
    });
    progress = Math.min(progress, 50); // Cap commit contribution

    // Calculate progress from pull requests
    pullRequests.forEach((pr) => {
      const prDate = new Date(pr.merge_date);
      const isRecent = prDate > oneWeekAgo;
      // Each merged PR adds 10% (15% if recent), capped at 40% total from PRs
      progress += isRecent ? 15 : 10;
    });
    progress = Math.min(progress, 90); // Cap total progress to leave room for completion

    // If no recent activity (last week), reduce progress to reflect stagnation
    const hasRecentActivity = commits.some((c) => new Date(c.date) > oneWeekAgo) ||
                             pullRequests.some((pr) => new Date(pr.merge_date) > oneWeekAgo);
    if (!hasRecentActivity && taskStatus !== "completed") {
      progress = Math.min(progress, 30); // Cap at 30% for inactive tasks
    }

    return Math.round(Math.min(progress, 100)); // Ensure progress is 0-100%
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

      // Fetch task details to verify GitHub info and get status
      const taskResponse = await axios.get(
        `http://localhost:5000/api/tasks/getTaskById/${taskId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const task = taskResponse.data;
      if (!task.repoOwner || !task.repoName || !task.branchName) {
        throw new Error("GitHub repository information is incomplete");
      }

      // Fetch commits and pull requests
      const githubResponse = await axios.get(
        `http://localhost:5000/api/tasks/track-commits/${taskId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!githubResponse.data) {
        throw new Error("No GitHub data received");
      }

      const { commits, pull_requests } = githubResponse.data;

      // Calculate progress based on GitHub activity
      const calculatedProgress = calculateProgress(commits, pull_requests, task.status);

      // Update task progress in state
      setTasks((prevTasks) =>
        prevTasks.map((t) =>
          t._id === taskId ? { ...t, progressPercentage: calculatedProgress } : t
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
      let errorMessage = "Error tracking GitHub activity";
      
      if (error.response) {
        errorMessage = error.response.data?.message || `Server error: ${error.response.status}`;
      } else if (error.request) {
        errorMessage = "No response from server";
      } else {
        errorMessage = error.message || "Request setup error";
      }
      
      setError(errorMessage);
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
      setTasks(response.data);
      setCurrentPage(1); // Reset to first page when tasks are fetched
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

  useEffect(() => {
    fetchTasks();
    fetchProjects();

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
      // Adjust current page if necessary
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
    switch (status.toLowerCase()) {
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

  // Check for stalled tasks (no activity in the last week)
  const isTaskStalled = (task) => {
    if (task.status === "completed") return false;
    if (!task.progressPercentage || task.progressPercentage === 0) return true;
    return task.progressPercentage < 30;
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
                    <div className="task-progress" title="Progress based on GitHub activity">
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
                        onClick={() => trackCommits(task._id)}
                        disabled={isLoading}
                        title="Track GitHub Activity"
                      >
                        <GitCommit size={14} />
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
          padding: 8px 16px;
          background-color: #007bff;
          color: white;
          border: none;
          border-radius: 5px;
          cursor: pointer;
          font-size: 14px;
          transition: background-color 0.2s;
        }

        .pagination-button:hover:not(:disabled) {
          background-color: #0056b3;
        }

        .pagination-button:disabled {
          background-color: #6c757d;
          cursor: not-allowed;
        }

        .pagination-pages {
          display: flex;
          gap: 5px;
        }

        .pagination-page {
          padding: 8px 12px;
          background-color: #f8f9fa;
          color: #343a40;
          border: 1px solid #e4e6eb;
          border-radius: 5px;
          cursor: pointer;
          font-size: 14px;
          transition: all 0.2s;
        }

        .pagination-page:hover:not(.ellipsis):not(.active) {
          background-color: #e4e6eb;
        }

        .pagination-page.active {
          background-color: #007bff;
          color: white;
          border-color: #007bff;
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
      `}</style>
    </LayoutTutor>
  );
};

export default TaskManagerTutor;
