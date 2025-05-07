import React, { useState, useEffect } from "react";
import axios from "axios";
import "./AdminTasks.css";
import { Folder, GitBranch, Clock, BarChart2, Users, AlertCircle, Calendar, CheckCircle, XCircle } from "lucide-react";

const AdminTaskDashboard = () => {
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({
    totalTasks: 0,
    completedTasks: 0,
    overdueTasks: 0,
    highPriority: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showUserTasksModal, setShowUserTasksModal] = useState(false);
  const [selectedUserTasks, setSelectedUserTasks] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [filter, setFilter] = useState({
    project: 'all',
    status: 'all',
    priority: 'all',
    user: 'all'
  });

  // Fetch all data on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        
        // Fetch tasks
        const tasksResponse = await axios.get("http://localhost:5000/api/tasks/getAllTasks", {
          headers: { Authorization: `Bearer ${token}` },
        });
        
        // Fetch projects
        const projectsResponse = await axios.get("http://localhost:5000/api/projects/projects", {
          headers: { Authorization: `Bearer ${token}` },
        });
        
        // Fetch users
        const usersResponse = await axios.get("http://localhost:5000/api/users/getAll", {
          headers: { Authorization: `Bearer ${token}` },
        });

        setTasks(tasksResponse.data);
        setProjects(projectsResponse.data);
        setUsers(usersResponse.data);
        calculateStats(tasksResponse.data);
        setLoading(false);
      } catch (err) {
        setError("Failed to fetch data");
        setLoading(false);
        console.error(err);
      }
    };

    fetchData();
  }, []);

  // Calculate statistics
  const calculateStats = (tasksData) => {
    const now = new Date();
    const statsData = {
      totalTasks: tasksData.length,
      completedTasks: tasksData.filter(task => task.status === 'completed').length,
      overdueTasks: tasksData.filter(task => 
        task.dueDate && new Date(task.dueDate) < now && task.status !== 'completed'
      ).length,
      highPriority: tasksData.filter(task => task.priority === 'high').length
    };
    setStats(statsData);
  };

  // Filter tasks based on selected filters
  const filteredTasks = tasks.filter(task => {
    return (
      (filter.project === 'all' || task.project === filter.project) &&
      (filter.status === 'all' || task.status === filter.status) &&
      (filter.priority === 'all' || task.priority === filter.priority) &&
      (filter.user === 'all' || task.assignedTo === filter.user)
    );
  });

  // Get project name by ID
  const getProjectName = (projectId) => {
    const project = projects.find(p => p._id === projectId);
    return project ? project.name : "Unassigned";
  };

  // Get user name by ID
  const getUserName = (userId) => {
    const user = users.find(u => u._id === userId);
    return user ? user.name : "Unassigned";
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "No due date";
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  // Handle viewing task details
  const handleViewTask = (task) => {
    setSelectedTask(task);
    setShowTaskModal(true);
  };

  // Handle viewing user tasks
  const handleViewUserTasks = async (userId) => {
    try {
      setSelectedUserId(userId);
      const userTasks = tasks.filter(task => task.assignedTo === userId);
      setSelectedUserTasks(userTasks);
      setShowUserTasksModal(true);
    } catch (err) {
      setError("Failed to fetch user tasks");
      console.error(err);
    }
  };

  // Handle task status change
  const handleStatusChange = async (taskId, newStatus) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `http://localhost:5000/api/tasks/updateTaskStatus/${taskId}`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Update local state
      setTasks(tasks.map(task => 
        task._id === taskId ? { ...task, status: newStatus } : task
      ));
      
      // Recalculate stats
      calculateStats(tasks.map(task => 
        task._id === taskId ? { ...task, status: newStatus } : task
      ));
    } catch (err) {
      setError("Failed to update task status");
      console.error(err);
    }
  };

  // Get priority color
  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'high': return '#ef4444';
      case 'medium': return '#f59e0b';
      case 'low': return '#10b981';
      default: return '#3b82f6';
    }
  };

  // Get status icon
  const getStatusIcon = (status) => {
    switch(status) {
      case 'completed': 
        return <CheckCircle size={16} color="#10b981" />;
      case 'in-progress': 
        return <BarChart2 size={16} color="#3b82f6" />;
      case 'overdue': 
        return <AlertCircle size={16} color="#ef4444" />;
      default: 
        return <Calendar size={16} color="#9ca3af" />;
    }
  };

  if (loading) {
    return (
      <LayoutAdmin>
        <div className="admin-task-dashboard loading">
          <div className="spinner"></div>
          <p>Loading dashboard...</p>
        </div>
      </LayoutAdmin>
    );
  }

  return (
      <div className="admin-task-dashboard">
        <header className="dashboard-header">
          <h1>Task Dashboard</h1>
          <div className="header-actions">
            <button className="btn btn-primary">
              Generate Report
            </button>
          </div>
        </header>

        {error && (
          <div className="alert alert-danger">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        {/* Stats Cards */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon total-tasks">
              <Folder size={24} />
            </div>
            <div className="stat-info">
              <h3>{stats.totalTasks}</h3>
              <p>Total Tasks</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon completed">
              <CheckCircle size={24} />
            </div>
            <div className="stat-info">
              <h3>{stats.completedTasks}</h3>
              <p>Completed</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon overdue">
              <AlertCircle size={24} />
            </div>
            <div className="stat-info">
              <h3>{stats.overdueTasks}</h3>
              <p>Overdue</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon high-priority">
              <AlertCircle size={24} />
            </div>
            <div className="stat-info">
              <h3>{stats.highPriority}</h3>
              <p>High Priority</p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="filters-section">
          <div className="filter-group">
            <label htmlFor="project-filter">Project</label>
            <select 
              id="project-filter" 
              value={filter.project}
              onChange={(e) => setFilter({...filter, project: e.target.value})}
            >
              <option value="all">All Projects</option>
              {projects.map(project => (
                <option key={project._id} value={project._id}>
                  {project.name}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="status-filter">Status</label>
            <select 
              id="status-filter" 
              value={filter.status}
              onChange={(e) => setFilter({...filter, status: e.target.value})}
            >
              <option value="all">All Statuses</option>
              <option value="not-started">Not Started</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="overdue">Overdue</option>
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="priority-filter">Priority</label>
            <select 
              id="priority-filter" 
              value={filter.priority}
              onChange={(e) => setFilter({...filter, priority: e.target.value})}
            >
              <option value="all">All Priorities</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="user-filter">User</label>
            <select 
              id="user-filter" 
              value={filter.user}
              onChange={(e) => setFilter({...filter, user: e.target.value})}
            >
              <option value="all">All Users</option>
              {users.map(user => (
                <option key={user._id} value={user._id}>
                  {user.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Tasks Table */}
        <div className="tasks-table-container">
          <table className="tasks-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Project</th>
                <th>Assigned To</th>
                <th>Priority</th>
                <th>Status</th>
                <th>Due Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTasks.length > 0 ? (
                filteredTasks.map(task => (
                  <tr key={task._id}>
                    <td>
                      <div className="task-title" onClick={() => handleViewTask(task)}>
                        {task.title}
                      </div>
                    </td>
                    <td>{getProjectName(task.project)}</td>
                    <td>
                      <div 
                        className="user-cell" 
                        onClick={() => handleViewUserTasks(task.assignedTo)}
                      >
                        {getUserName(task.assignedTo)}
                      </div>
                    </td>
                    <td>
                      <span 
                        className="priority-badge" 
                        style={{ backgroundColor: getPriorityColor(task.priority) }}
                      >
                        {task.priority}
                      </span>
                    </td>
                    <td>
                      <div className="status-cell">
                        {getStatusIcon(task.status)}
                        <span>{task.status}</span>
                      </div>
                    </td>
                    <td>{formatDate(task.dueDate)}</td>
                    <td>
                      <div className="action-buttons">
                        {task.status !== 'completed' && (
                          <button 
                            className="btn btn-success btn-sm"
                            onClick={() => handleStatusChange(task._id, 'completed')}
                          >
                            Complete
                          </button>
                        )}
                        <button 
                          className="btn btn-info btn-sm"
                          onClick={() => handleViewTask(task)}
                        >
                          View
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="no-tasks">
                    No tasks found matching your filters
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Task Details Modal */}
        {showTaskModal && selectedTask && (
          <div className="modal-overlay">
            <div className="modal-content">
              <div className="modal-header">
                <h2>Task Details</h2>
                <button 
                  className="close-button"
                  onClick={() => setShowTaskModal(false)}
                >
                  &times;
                </button>
              </div>
              <div className="modal-body">
                <div className="task-detail-row">
                  <h3>{selectedTask.title}</h3>
                  <span 
                    className="priority-badge" 
                    style={{ backgroundColor: getPriorityColor(selectedTask.priority) }}
                  >
                    {selectedTask.priority} priority
                  </span>
                </div>

                <div className="task-detail-row">
                  <div className="detail-item">
                    <strong>Project:</strong>
                    <span>{getProjectName(selectedTask.project)}</span>
                  </div>
                  <div className="detail-item">
                    <strong>Assigned To:</strong>
                    <span>{getUserName(selectedTask.assignedTo)}</span>
                  </div>
                </div>

                <div className="task-detail-row">
                  <div className="detail-item">
                    <strong>Status:</strong>
                    <div className="status-display">
                      {getStatusIcon(selectedTask.status)}
                      <span>{selectedTask.status}</span>
                    </div>
                  </div>
                  <div className="detail-item">
                    <strong>Due Date:</strong>
                    <span>{formatDate(selectedTask.dueDate)}</span>
                  </div>
                </div>

                <div className="task-description">
                  <strong>Description:</strong>
                  <p>{selectedTask.description}</p>
                </div>

                {selectedTask.taskDetails && (
                  <div className="task-details">
                    <strong>Additional Details:</strong>
                    <p>{selectedTask.taskDetails}</p>
                  </div>
                )}

                <div className="task-actions">
                  <button 
                    className="btn btn-secondary"
                    onClick={() => setShowTaskModal(false)}
                  >
                    Close
                  </button>
                  {selectedTask.status !== 'completed' && (
                    <button 
                      className="btn btn-primary"
                      onClick={() => {
                        handleStatusChange(selectedTask._id, 'completed');
                        setShowTaskModal(false);
                      }}
                    >
                      Mark as Completed
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* User Tasks Modal */}
        {showUserTasksModal && (
          <div className="modal-overlay">
            <div className="modal-content">
              <div className="modal-header">
                <h2>
                  <Users size={20} style={{ marginRight: '8px' }} />
                  {getUserName(selectedUserId)}'s Tasks
                </h2>
                <button 
                  className="close-button"
                  onClick={() => setShowUserTasksModal(false)}
                >
                  &times;
                </button>
              </div>
              <div className="modal-body">
                {selectedUserTasks.length > 0 ? (
                  <div className="user-tasks-list">
                    {selectedUserTasks.map(task => (
                      <div key={task._id} className="user-task-item">
                        <div className="user-task-header">
                          <h4>{task.title}</h4>
                          <span 
                            className="priority-badge" 
                            style={{ backgroundColor: getPriorityColor(task.priority) }}
                          >
                            {task.priority}
                          </span>
                        </div>
                        <div className="user-task-details">
                          <div>
                            <strong>Project:</strong> {getProjectName(task.project)}
                          </div>
                          <div>
                            <strong>Status:</strong> 
                            <span className="status-display">
                              {getStatusIcon(task.status)}
                              {task.status}
                            </span>
                          </div>
                          <div>
                            <strong>Due:</strong> {formatDate(task.dueDate)}
                          </div>
                        </div>
                        <div className="user-task-actions">
                          <button 
                            className="btn btn-sm btn-info"
                            onClick={() => {
                              setShowUserTasksModal(false);
                              handleViewTask(task);
                            }}
                          >
                            View Details
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="no-tasks">
                    <p>This user has no tasks assigned.</p>
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button 
                  className="btn btn-secondary"
                  onClick={() => setShowUserTasksModal(false)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
  );
};

export default AdminTaskDashboard;