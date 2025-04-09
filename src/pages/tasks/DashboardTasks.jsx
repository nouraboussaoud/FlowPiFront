import React, { useState, useEffect } from "react";
import axios from "axios";
import LayoutStudent from "../dashboard/LayoutStudent";
import "./Tasks.css";
import { Folder, GitBranch, Clock, BarChart2, Edit } from "lucide-react";

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
  const [updateTaskData, setUpdateTaskData] = useState({
    title: "",
    description: "",
    project: "",
    taskDetails: "",
    priority: "medium",
  });
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [showRiskModal, setShowRiskModal] = useState(false);
  const [riskAssessment, setRiskAssessment] = useState({
    risk: '',
    confidence: 0,
    explanation: ''
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [repoDetails, setRepoDetails] = useState({
    owner: "",
    name: "",
    branch: ""
  });
  const [commits, setCommits] = useState([]);
  const [showCommitsModal, setShowCommitsModal] = useState(false);
  const [loadingCommits, setLoadingCommits] = useState(false);
  const [progressUpdate, setProgressUpdate] = useState({
    progressPercentage: 0,
    completedCount: 0
  });

  // Helper functions for risk assessment
  const getRiskColor = (risk) => {
    switch(risk.toLowerCase()) {
      case 'high': return '#ef4444';
      case 'medium': return '#f59e0b';
      case 'low': return '#10b981';
      default: return '#3b82f6';
    }
  };

  const getRiskDescription = (risk) => {
    switch(risk.toLowerCase()) {
      case 'high':
        return "This task has significant challenges that may impact deadlines or quality.";
      case 'medium':
        return "This task has some potential issues that need attention.";
      case 'low':
        return "This task appears straightforward with minimal risks.";
      default:
        return "Risk assessment not available.";
    }
  };

  const getRiskFactors = (risk) => {
    switch(risk.toLowerCase()) {
      case 'high':
        return [
          "Complex requirements",
          "Tight deadlines",
          "Multiple dependencies",
          "Potential quality issues"
        ];
      case 'medium':
        return [
          "Moderate complexity",
          "Some dependencies",
          "Potential timeline pressure"
        ];
      case 'low':
        return [
          "Simple requirements",
          "Clear objectives",
          "Minimal dependencies"
        ];
      default:
        return ["Unknown risk factors"];
    }
  };

  const getRecommendations = (risk) => {
    switch(risk.toLowerCase()) {
      case 'high':
        return [
          "Break task into smaller subtasks",
          "Allocate additional resources",
          "Schedule frequent check-ins",
          "Identify potential blockers early"
        ];
      case 'medium':
        return [
          "Monitor progress closely",
          "Identify key dependencies",
          "Set intermediate milestones",
          "Communicate potential delays early"
        ];
      case 'low':
        return [
          "Proceed as planned",
          "Monitor for unexpected changes",
          "Document progress regularly"
        ];
      default:
        return ["No specific recommendations available"];
    }
  };

  // Event handlers
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
      const response = await axios.get(
        `http://localhost:5000/api/tasks/track-commits/${selectedTaskId}/${owner}/${name}/${branch}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const commitData = response.data.commitDetails || [];
      setCommits(commitData);
      
      const progressPercentage = response.data.progressPercentage || 0;
      const completedCount = response.data.completedCount || commitData.length || 0;
      
      setProgressUpdate({
        progressPercentage,
        completedCount
      });
      
      setTasks(tasks.map(task => 
        task._id === selectedTaskId 
          ? { 
              ...task, 
              progressPercentage,
              completedCount
            } 
          : task
      ));

      setShowRepoModal(false);
      setShowCommitsModal(true);
    } catch (error) {
      console.error("Failed to fetch GitHub commits:", error);
      setError("Failed to fetch commits. Please check repository details.");
    } finally {
      setLoadingCommits(false);
    }
  };

  const openRiskModal = async (taskId) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("No token found.");
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
          explanation: task.riskExplanation || "Our AI model analyzed the task details and identified potential risks."
        });
        setShowRiskModal(true);
      } else {
        setError("No risk assessment available for this task");
      }
    } catch (error) {
      console.error("Error fetching task risk:", error);
      setError("Error fetching risk assessment");
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
      
      if (response.data.progressPercentage !== undefined) {
        setProgressUpdate({
          progressPercentage: response.data.progressPercentage || 0,
          completedCount: response.data.completedCount || 0
        });
      }
    } catch (error) {
      console.error("Error fetching task:", error);
    }
  };

  const openUpdateModal = async (taskId) => {
    setSelectedTaskId(taskId);
    setIsUpdating(true);
    
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
    
      const task = response.data;
      setUpdateTaskData({
        title: task.title,
        description: task.description,
        project: task.project,
        taskDetails: task.taskDetails || "",
        priority: task.priority || "medium",
      });
      
      setShowUpdateModal(true);
      setIsUpdating(false);
    } catch (error) {
      console.error("Error fetching task for update:", error);
      setError("Error fetching task details");
      setIsUpdating(false);
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
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      
      setTasks(tasks.map(task => 
        task._id === selectedTaskId ? response.data.task : task
      ));
      
      setShowUpdateModal(false);
      setError(null);
    } catch (error) {
      if (error.response) {
        console.error('Update error response:', error.response.data);
        setError(error.response.data.message || "Error updating task");
      } else if (error.request) {
        console.error('Update error request:', error.request);
        setError("No response from server. Please try again.");
      } else {
        console.error('Update error:', error.message);
        setError("Error setting up request");
      }
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
      setTasks(tasks.filter((task) => task._id !== taskId));
    } catch (error) {
      setError("Error deleting task");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const getProjectName = (projectId) => {
    const project = projects.find(p => p._id === projectId);
    return project ? project.name : "No Project";
  };

  const formatDate = (dateString) => {
    const date = new 
    Date(dateString);
    return date.toLocaleString();
  };

  const getProgressColor = (percentage) => {
    if (percentage < 30) return "#ef4444";
    if (percentage < 70) return "#f59e0b";
    return "#10b981";
  };

  return (
    <LayoutStudent>
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
                    {projects.map((project) => (
                      <option key={project._id} value={project._id}>
                        {project.name}
                      </option>
                    ))}
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

        {showUpdateModal && (
          <div className="modal-overlay" onClick={() => setShowUpdateModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2 className="modal-title">Update Task</h2>
                <button className="close-button" onClick={() => setShowUpdateModal(false)}>&times;</button>
              </div>
              <form onSubmit={updateTask}>
                <div className="form-group">
                  <label className="label" htmlFor="update-title">Task Title</label>
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
                  <label className="label" htmlFor="update-description">Description</label>
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
                  <label className="label" htmlFor="update-project">Project</label>
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
                  <label className="label" htmlFor="update-priority">Priority</label>
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
                  </select>
                </div>

                <div className="form-group">
                  <label className="label" htmlFor="update-taskDetails">Details</label>
                  <textarea
                    className="textarea"
                    id="update-taskDetails"
                    name="taskDetails"
                    placeholder="Enter task details"
                    value={updateTaskData.taskDetails}
                    onChange={handleUpdateInputChange}
                  />
                </div>

                <div className="button-group">
                  <button className="button button-default" type="button" onClick={() => setShowUpdateModal(false)}>
                    Cancel
                  </button>
                  <button className="button button-primary" type="submit" disabled={isUpdating}>
                    {isUpdating ? 'Updating...' : 'Update Task'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {showRiskModal && (
          <div className="modal-overlay" onClick={() => setShowRiskModal(false)}>
            <div className="modal-content risk-modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2 className="modal-title">
                  <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke={getRiskColor(riskAssessment.risk)}>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                  AI Risk Insights
                </h2>
                <button className="close-button" onClick={() => setShowRiskModal(false)}>&times;</button>
              </div>
              
              <div className="risk-assessment-content">
                <div className="risk-visualization">
                  <div className="risk-gauge">
                    <div className="gauge-background">
                      <div 
                        className="gauge-fill"
                        style={{
                          width: `${riskAssessment.confidence}%`,
                          backgroundColor: getRiskColor(riskAssessment.risk)
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
                      <span className="risk-label" style={{ color: getRiskColor(riskAssessment.risk) }}>
                        {riskAssessment.risk} Risk
                      </span>
                      <span className="confidence-pill">
                        {riskAssessment.confidence}% confidence
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
                          <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke={getRiskColor(riskAssessment.risk)}>
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
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
                    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="#3b82f6">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                    <span>AI-Powered Risk Assessment</span>
                  </div>
                  <small>This analysis is generated by our AI model based on task details and historical data.</small>
                </div>
              </div>
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
                
                {task.progressPercentage !== undefined && (
                  <div className="task-progress">
                    <div className="progress-label">
                      <BarChart2 size={14} />
                      <span>Commits: {task.completedCount || 0} ({task.progressPercentage || 0}%)</span>
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
                      className="button button-secondary"
                      onClick={() => openUpdateModal(task._id)}
                      disabled={isLoading}
                    >
                      <Edit size={14} />
                    </button>
                    
                    <button
                      className="button button-info"
                      onClick={() => openRiskModal(task._id)}
                      disabled={isLoading}
                      title="View AI Risk Assessment"
                    >
                      <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                      </svg>
                    </button>
                    
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

                <div className="form-group">
                  <label className="label">Current Progress</label>
                  <div className="progress-details">
                    <div className="progress-stats">
                      <span>Commits: {selectedTask.completedCount || 0}</span>
                      <span className="progress-percentage">{selectedTask.progressPercentage || 0}%</span>
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

              <div className="progress-summary">
                <div className="progress-header">
                  <h3>Commit Progress</h3>
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
                    <span className="metric-label">Total Commits:</span>
                    <span className="metric-value">{progressUpdate.completedCount  || commits.length || 0}</span>
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
    </LayoutStudent>
  );
};

export default TaskManager;