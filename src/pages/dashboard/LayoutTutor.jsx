
import React, { useState, useEffect } from "react";
import axios from "axios";
import "../tasks/Tasks.css";

import { Folder, GitBranch, Clock, BarChart2 } from "lucide-react";
import LayoutTutorss from "./LayoutTutorss";

const TaskManager = () => {
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [showRepoModal, setShowRepoModal] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    project: "",
    taskDetails: "",
  });
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [repoDetails, setRepoDetails] = useState({
    owner: "",
    name: "",
    branch: ""
  });
  // State for commits and commits modal
  const [commits, setCommits] = useState([]);
  const [showCommitsModal, setShowCommitsModal] = useState(false);
  const [loadingCommits, setLoadingCommits] = useState(false);
  // State for progress update
  const [progressUpdate, setProgressUpdate] = useState({
    progressPercentage: 0,
    completedCount: 0,
    totalCount: 0
  });

  const handleRepoInputChange = (e) => {
    const { name, value } = e.target;
    setRepoDetails(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleRepoSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    if (!token) {
      console.error("No token found.");
      return;
    }

    const { owner, name, branch } = repoDetails;
    setLoadingCommits(true);

    try {
      // API call to fetch commits
      const response = await axios.get(
        `http://localhost:5000/api/tasks/track-commits/${selectedTaskId}/${owner}/${name}/${branch}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Store commits in state
      const commitData = response.data.commitDetails || [];
      setCommits(commitData);
      
      // Update task progress based on commits
      // Here we'll also update the task's progress in the database
// Update task progress based on commits count directly
const commitCount = commitData.length;
await updateTaskProgress(selectedTaskId, commitCount);      
      // Close repo modal and open commits modal
      setShowRepoModal(false);
      setShowCommitsModal(true);
    } catch (error) {
      console.error("Failed to fetch GitHub commits:", error);
      setError("Failed to fetch commits. Please check repository details.");
    } finally {
      setLoadingCommits(false);
    }
  };

  // Function to update task progress
  const updateTaskProgress = async (taskId, commitCount) => {
    const token = localStorage.getItem("token");
    if (!token) {
      setError("No token found. Please login.");
      return;
    }

    try {
      // Calculate progress percentage based on commit count
      // You might want to customize this calculation logic
     // Update task progress based on commits count directly
     const progress = commitCount; // Each commit represents 1%

      // Update progress state for UI display
      setProgressUpdate({
        progressPercentage: progress,
        completedCount: commitCount,
        totalCount: 100 // We set 100 as the maximum for percentage calculation
      });

      // API call to update task progress in the database
      const response = await axios.put(
        `http://localhost:5000/api/tasks/updateTaskProgress/${taskId}`,
        { 
          progressPercentage: progress,
          completedCount: commitCount,
          totalCount: 100
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // Update the task in the tasks array
      setTasks(tasks.map(task => 
        task._id === taskId 
          ? { ...task, progressPercentage: progress } 
          : task
      ));

      // Also update selectedTask if it exists
      if (selectedTask) {
        setSelectedTask({
          ...selectedTask,
          progressPercentage: progress
        });
      }

    } catch (error) {
      console.error("Error updating task progress:", error);
      setError("Failed to update task progress.");
    }
  };

  const openRepoModal = async (taskId) => {
    setSelectedTaskId(taskId);
    setShowRepoModal(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("No token found.");
        return;
      }
    
      const response = await axios.get(`http://localhost:5000/api/tasks/getTaskById/${taskId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    
      setSelectedTask(response.data);
      
      // Initialize progress update state with task data
      if (response.data.progressPercentage !== undefined) {
        setProgressUpdate({
          progressPercentage: response.data.progressPercentage || 0,
          completedCount: response.data.completedCount || 0,
          totalCount: response.data.totalCount || 10
        });
      }
    } catch (error) {
      console.error("Error fetching task:", error);
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
    } catch (error) {
      setError("Error fetching tasks");
      console.error(error);
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
      console.log("Projects fetched:", response.data);
    } catch (error) {
      setError("Error fetching projects");
      console.error(error);
    }
  };

  useEffect(() => {
    fetchTasks();
    fetchProjects();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    console.log(`Updating ${name} to ${value}`);
    setNewTask((prevTask) => ({
      ...prevTask,
      [name]: value,
    }));
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

    console.log("Creating task with data:", newTask);

    try {
      setIsLoading(true);
      const response = await axios.post(
        "http://localhost:5000/api/tasks/createTask",
        newTask,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setTasks([...tasks, response.data.task]);
      setNewTask({
        title: "",
        description: "",
        project: "",
        taskDetails: "",
      });
      setShowModal(false);
      setError(null);
    } catch (error) {
      setError("Error creating task");
      console.error(error);
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
    } catch (error) {
      setError("Error deleting task");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateTask = async (taskId, updatedData) => {
    const token = localStorage.getItem("token");
    if (!token) {
      setError("No token found. Please login.");
      return;
    }

    try {
      setIsLoading(true);
      await axios.put(
        `http://localhost:5000/api/tasks/setTaskCompleted/${taskId}`,
        updatedData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setTasks(
        tasks.map((task) =>
          task._id === taskId ? { ...task, ...updatedData } : task
        )
      );
    } catch (error) {
      setError("Error updating task");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const getProjectName = (projectId) => {
    const project = projects.find(p => p._id === projectId);
    return project ? project.name : "No Project";
  };

  // Function to format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  // Function to get progress bar color based on percentage
  const getProgressColor = (percentage) => {
    if (percentage < 30) return "#ef4444"; // Red
    if (percentage < 70) return "#f59e0b"; // Yellow/Orange
    return "#10b981"; // Green
  };

  return (
    <LayoutTutorss>
    <div className="container">
      <header className="header">
        <h1 className="title">Task Manager</h1>
        <button
          className="button button-primary"
          onClick={() => setShowModal(true)}
          disabled={isLoading}
        >
          <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Create Task
        </button>
      </header>

      {error && (
        <div className="error-message">
          <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="#ef4444">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {error}
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Create New Task</h2>
              <button className="close-button" onClick={() => setShowModal(false)}>&times;</button>
            </div>
            <form onSubmit={createTask}>
              <div className="form-group">
                <label className="label" htmlFor="title">Task Title</label>
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
                <label className="label" htmlFor="description">Description</label>
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
                <label className="label" htmlFor="project">Project</label>
                <select
                  className="select"
                  id="project"
                  name="project"
                  value={newTask.project}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select a project</option>
                  {projects && projects.length > 0 ? (
                    projects.map((project) => (
                      <option key={project._id} value={project._id}>
                        {project.name}
                      </option>
                    ))
                  ) : (
                    <option value="" disabled>No projects available</option>
                  )}
                </select>
              </div>

              <div className="form-group">
                <label className="label" htmlFor="taskDetails">Details</label>
                <textarea
                  className="textarea"
                  id="taskDetails"
                  name="taskDetails"
                  placeholder="Enter task details"
                  value={newTask.taskDetails}
                  onChange={handleInputChange}
                />
              </div>

              <div className="button-group">
                <button className="button button-default" type="button" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button className="button button-primary" type="submit" disabled={isLoading}>
                  {isLoading ? 'Creating...' : 'Create Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isLoading && tasks.length === 0 ? (
        <div className="empty-state">
          <svg width="48" height="48" fill="none" viewBox="0 0 24 24" stroke="#9ca3af" style={{ margin: '0 auto 1rem' }}>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p>Loading tasks...</p>
        </div>
      ) : tasks.length > 0 ? (
        <div className="task-grid">
          {tasks.map((task) => (
            <div key={task._id} className={`task-card task-card-${task.priority}`}>
              <h3 className="task-title">{task.title}</h3>
              <p className="task-description">{task.description}</p>

              {task.taskDetails && (
                <p className="task-details">
                  <strong>Details:</strong> {task.taskDetails}
                </p>
              )}
              
              {/* Display progress bar in task card */}
              {task.progressPercentage !== undefined && (
                <div className="task-progress">
                  <div className="progress-label">
                    <BarChart2 size={14} />
                    <span>Progress: {task.progressPercentage || 0}%</span>
                  </div>
                  <div className="progress-bar-container">
                    <div
                      className="progress-bar"
                      style={{ 
                        width: `${task.progressPercentage || 0}%`,
                        backgroundColor: getProgressColor(task.progressPercentage || 0)
                      }}
                    ></div>
                  </div>
                </div>
              )}

              <div className="task-meta">
                <div>
                  <span className={`priority-badge priority-${task.priority}`}>
                    {task.priority ? task.priority.charAt(0).toUpperCase() + task.priority.slice(1) : 'Medium'}
                  </span>
                  <span className="margin-left-half">• {getProjectName(task.project)}</span>
                </div>

                <div className="task-button-group">
                  <button
                    className="button button-primary"
                    onClick={() => openRepoModal(task._id)}
                    disabled={isLoading}
                  >
                    <GitBranch size={14} />
                  </button>

                  <button
                    className="button button-danger"
                    onClick={() => deleteTask(task._id)}
                    disabled={isLoading}
                  >
                    <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <svg width="48" height="48" fill="none" viewBox="0 0 24 24" stroke="#9ca3af" style={{ margin: '0 auto 1rem' }}>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <p>No tasks available. Create your first task!</p>
          <button
            className="button button-primary margin-top-1"
            onClick={() => setShowModal(true)}
          >
            Create Task
          </button>
        </div>
      )}

      {/* Repository Modal */}
      {showRepoModal && selectedTask && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2 className="modal-title">
                <Folder size={20} style={{ marginRight: '8px' }} />
                Repository Details
              </h2>
              <button
                className="close-button"
                onClick={() => setShowRepoModal(false)}
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleRepoSubmit}>
              <div className="form-group">
                <label className="label" htmlFor="owner">
                  Repository Owner
                </label>
                <input
                  className="input"
                  type="text"
                  id="owner"
                  name="owner"
                  value={repoDetails.owner}
                  onChange={handleRepoInputChange}
                  placeholder="e.g., octocat"
                  required
                />
              </div>

              <div className="form-group">
                <label className="label" htmlFor="name">
                  Repository Name
                </label>
                <input
                  className="input"
                  type="text"
                  id="name"
                  name="name"
                  value={repoDetails.name}
                  onChange={handleRepoInputChange}
                  placeholder="e.g., hello-world"
                  required
                />
              </div>

              <div className="form-group">
                <label className="label" htmlFor="branch">
                  Branch
                </label>
                <input
                  className="input"
                  type="text"
                  id="branch"
                  name="branch"
                  value={repoDetails.branch}
                  onChange={handleRepoInputChange}
                  placeholder="e.g., main"
                  required
                />
              </div>

              {/* Progress Bar with more detailed info */}
              <div className="form-group">
                <label className="label">Current Progress</label>
                <div className="progress-details">
                  <div className="progress-stats">
                    <span>Commits: {selectedTask.completedCount || 0}</span>
                    <span className="progress-percentage">{selectedTask.progressPercentage || 0}% Complete</span>
                  </div>
                  <div className="progress-bar-container">
                    <div
                      className="progress-bar"
                      style={{ 
                        width: `${selectedTask.progressPercentage || 0}%`,
                        backgroundColor: getProgressColor(selectedTask.progressPercentage || 0)
                      }}
                    ></div>
                  </div>
                </div>
              </div>

              <div className="button-group">
                <button
                  type="button"
                  className="button button-default"
                  onClick={() => setShowRepoModal(false)}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="button button-primary"
                  disabled={loadingCommits}
                >
                  {loadingCommits ? 'Loading...' : 'Fetch Commits'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Commits Modal */}
      {showCommitsModal && (
        <div className="modal-overlay">
          <div className="modal-content modal-lg">
            <div className="modal-header">
              <h2 className="modal-title">
                <GitBranch size={20} style={{ marginRight: '8px' }} />
                Git Commits for {repoDetails.owner}/{repoDetails.name}
              </h2>
              <button
                className="close-button"
                onClick={() => setShowCommitsModal(false)}
              >
                &times;
              </button>
            </div>

            {/* Progress information */}
            <div className="progress-summary">
              <div className="progress-header">
                <h3>Progress Update</h3>
                <span className="progress-badge" style={{ backgroundColor: getProgressColor(progressUpdate.progressPercentage) }}>
                  {progressUpdate.progressPercentage}%
                </span>
              </div>
              <div className="progress-bar-container">
                <div
                  className="progress-bar"
                  style={{ 
                    width: `${progressUpdate.progressPercentage}%`,
                    backgroundColor: getProgressColor(progressUpdate.progressPercentage)
                  }}
                ></div>
              </div>
              <div className="progress-metrics">
                <div className="metric">
                  <span className="metric-label">Commits Found:</span>
                  <span className="metric-value">{progressUpdate.completedCount}</span>
                </div>
                <div className="metric">
                  <span className="metric-label">Target Goal:</span>
                  <span className="metric-value">{progressUpdate.totalCount}</span>
                </div>
              </div>
            </div>

            <div className="modal-body">
              <h3 className="section-title">Commit History</h3>
              {commits.length > 0 ? (
                <div className="commits-container">
                  {commits.map((commit, index) => (
                    <div key={index} className="commit-item">
                      <div className="commit-header">
                        <span className="commit-date">
                          <Clock size={14} style={{ marginRight: '5px' }} />
                          {formatDate(commit.date)}
                        </span>
                      </div>
                      <div className="commit-message">{commit.message}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-commits">
                  <p>No commits found for this repository.</p>
                </div>
              )}
            </div>

            <div className="button-group">
              <button
                className="button button-primary"
                onClick={() => setShowCommitsModal(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
    </LayoutTutorss>
  );
};

export default TaskManager;