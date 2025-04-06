import React, { useState, useEffect } from "react";
import axios from "axios";
import "./Tasks.css";

const TaskManager = () => {
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    project: "",
    priority: "low",
    taskDetails: "",
  });
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

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

    // Check if project is selected
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
        priority: "low",
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

  return (
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
                <label className="label" htmlFor="priority">Priority</label>
                <select
                  className="select"
                  id="priority"
                  name="priority"
                  value={newTask.priority}
                  onChange={handleInputChange}
                  required
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
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
                <p className="task-description">
                  <strong>Details:</strong> {task.taskDetails}
                </p>
              )}
              
              <div className="task-meta">
                <div>
                  <span className={`priority-badge priority-${task.priority}`}>
                    {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                  </span>
                  <span className="margin-left-half">• {getProjectName(task.project)}</span>
                </div>
                
                <div className="task-button-group">
                  <button 
                    className="button button-primary" 
                    onClick={() => updateTask(task._id, { status: "completed" })}
                    disabled={isLoading}
                  >
                    <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
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
    </div>
  );
};

export default TaskManager;