import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import DashboardLayout from '../DashboardLayout';
import axios from 'axios';
import { Link } from 'react-router-dom';

const AdminDashboard = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    users: 0,
    tutors: 0,
    students: 0,
    projects: 0,
    subjects: 0,
    groups: 0,
    tasks: 0,
  });
  const [activeTab, setActiveTab] = useState('dashboard');

  useEffect(() => {
    const initializeDashboard = async () => {
      const queryParams = new URLSearchParams(location.search);
      const token = queryParams.get('token') || localStorage.getItem('token');

      if (!token || !token.startsWith('eyJhbGci')) {
        setError('No valid authentication token found. Please log in.');
        setLoading(false);
        navigate('/login');
        return;
      }

      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        console.log('Token payload:', payload);
        const currentTime = Math.floor(Date.now() / 1000);
        if (!payload.userId && !payload.id) {
          throw new Error('Token missing userId or id');
        }
        if (payload.exp && payload.exp < currentTime) {
          setError('Authentication token has expired. Please log in again.');
          localStorage.removeItem('token');
          setLoading(false);
          navigate('/login');
          return;
        }
        if (payload.role !== 'admin') {
          setError('This dashboard requires admin access. Please log in as an admin.');
          setLoading(false);
          navigate('/login');
          return;
        }

        if (queryParams.get('token')) {
          localStorage.setItem('token', token);
          console.log('Token stored in localStorage:', token);
          navigate('/admin-dashboard', { replace: true });
        }

        const userId = payload.userId || payload.id;
        const response = await fetch(`http://localhost:5000/api/users/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.status === 401) {
          setError('Unauthorized. Please log in again.');
          localStorage.clear();
          navigate('/login');
          return;
        }
        if (!response.ok) {
          throw new Error(`Failed to fetch user data: ${response.status} ${response.statusText}`);
        }
        const data = await response.json();
        console.log('Fetched user data:', data);
        setUser(data);
        localStorage.setItem('user', JSON.stringify({
          userId,
          name: data.name,
          email: data.email,
          role: data.role,
          profilePicture: data.profilePicture,
        }));
        
        // Fetch dashboard stats
        fetchDashboardStats(token);
        
        setError(null);
      } catch (err) {
        console.error('Initialization error:', err);
        setError(err.message || 'Failed to initialize dashboard. Please log in again.');
        navigate('/login');
      } finally {
        setLoading(false);
      }
    };

    initializeDashboard();
  }, [location, navigate]);

  const fetchDashboardStats = async (token) => {
    try {
      // These would be actual API calls in a real application
      const usersResponse = await axios.get('http://localhost:5000/api/users/count', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const projectsResponse = await axios.get('http://localhost:5000/api/projects/count', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const subjectsResponse = await axios.get('http://localhost:5000/api/subjects/count', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const groupsResponse = await axios.get('http://localhost:5000/api/groups/count', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const tasksResponse = await axios.get('http://localhost:5000/api/tasks/count', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setStats({
        users: usersResponse.data.count || 0,
        tutors: usersResponse.data.tutorCount || 0,
        students: usersResponse.data.studentCount || 0,
        projects: projectsResponse.data.count || 0,
        subjects: subjectsResponse.data.count || 0,
        groups: groupsResponse.data.count || 0,
        tasks: tasksResponse.data.count || 0,
      });
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    }
  };

  const getMotivationalMessage = () => {
    const messages = [
      "Empowering education through effective administration.",
      "Great administrators make great educational experiences possible.",
      "Your oversight ensures quality learning for all students.",
      "Managing today's education for tomorrow's leaders.",
      "Behind every successful student is a well-managed educational system."
    ];
    return messages[Math.floor(Math.random() * messages.length)];
  };

  if (loading) {
    return (
      <DashboardLayout title="Admin Dashboard">
        <div className="d-flex justify-content-center align-items-center min-vh-50">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout title="Admin Dashboard">
        <div className="container">
          <div className="alert alert-danger" role="alert">
            <i className="bi bi-exclamation-triangle-fill me-2"></i>
            {error}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Admin Dashboard">
      <div className="container-fluid px-4 py-3">
        <div className="row mb-4">
          <div className="col-12">
            <div className="card shadow-sm border-0">
              <div className="card-body">
                <h2 className="card-title">Admin Dashboard</h2>
                <p className="card-text">Welcome to the administration panel.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="row mb-4">
          <div className="col-12">
            <ul className="nav nav-tabs">
              <li className="nav-item">
                <button 
                  className={`nav-link ${activeTab === 'dashboard' ? 'active' : ''}`}
                  onClick={() => setActiveTab('dashboard')}
                >
                  <i className="bi bi-speedometer2 me-2"></i>
                  Dashboard
                </button>
              </li>
              <li className="nav-item">
                <button 
                  className={`nav-link ${activeTab === 'users' ? 'active' : ''}`}
                  onClick={() => setActiveTab('users')}
                >
                  <i className="bi bi-people-fill me-2"></i>
                  Users Management
                </button>
              </li>
            </ul>
          </div>
        </div>

        <div className="row">
          <div className="col-12">
            {activeTab === 'dashboard' ? (
              <div className="card shadow-sm border-0">
                <div className="card-body">
                  <div className="dashboard-container">
                    <div className="welcome-banner">
                      <div className="welcome-text">
                        <h1>
                          {user?.name ? (
                            <>Welcome, <span className="highlight">{user.name}</span>!</>
                          ) : (
                            <>Welcome to the admin dashboard!</>
                          )}
                        </h1>
                        <p className="motivational-message">{getMotivationalMessage()}</p>
                      </div>
                      <div className="welcome-actions">
                        <button
                          className="btn btn-primary"
                          onClick={() => navigate("/usersList")}
                        >
                          <i className="fas fa-users me-2"></i>
                          Manage Users
                        </button>
                      </div>
                    </div>

                    <div className="stats-grid">
                      <div className="stat-card">
                        <div className="stat-icon users">
                          <i className="bi bi-people"></i>
                        </div>
                        <div className="stat-content">
                          <h2>Total Users</h2>
                          <p className="stat-value">{stats.users}</p>
                          <Link to="/usersList" className="stat-link">View Users</Link>
                        </div>
                      </div>

                      <div className="stat-card">
                        <div className="stat-icon tutors">
                          <i className="bi bi-person-badge"></i>
                        </div>
                        <div className="stat-content">
                          <h2>Tutors</h2>
                          <p className="stat-value">{stats.tutors}</p>
                          <Link to="/usersList?role=tutor" className="stat-link">View Tutors</Link>
                        </div>
                      </div>

                      <div className="stat-card">
                        <div className="stat-icon students">
                          <i className="bi bi-mortarboard"></i>
                        </div>
                        <div className="stat-content">
                          <h2>Students</h2>
                          <p className="stat-value">{stats.students}</p>
                          <Link to="/usersList?role=student" className="stat-link">View Students</Link>
                        </div>
                      </div>

                      <div className="stat-card">
                        <div className="stat-icon projects">
                          <i className="bi bi-kanban"></i>
                        </div>
                        <div className="stat-content">
                          <h2>Projects</h2>
                          <p className="stat-value">{stats.projects}</p>
                          <Link to="/ProjectAdmin" className="stat-link">View Projects</Link>
                        </div>
                      </div>

                      <div className="stat-card">
                        <div className="stat-icon subjects">
                          <i className="bi bi-book"></i>
                        </div>
                        <div className="stat-content">
                          <h2>Subjects</h2>
                          <p className="stat-value">{stats.subjects}</p>
                          <Link to="/SubjectAdmin" className="stat-link">View Subjects</Link>
                        </div>
                      </div>

                      <div className="stat-card">
                        <div className="stat-icon groups">
                          <i className="bi bi-people-fill"></i>
                        </div>
                        <div className="stat-content">
                          <h2>Groups</h2>
                          <p className="stat-value">{stats.groups}</p>
                          <Link to="/groupList" className="stat-link">View Groups</Link>
                        </div>
                      </div>

                      <div className="stat-card">
                        <div className="stat-icon tasks">
                          <i className="bi bi-list-task"></i>
                        </div>
                        <div className="stat-content">
                          <h2>Tasks</h2>
                          <p className="stat-value">{stats.tasks}</p>
                          <Link to="/dashboard-tasks" className="stat-link">View Tasks</Link>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="card shadow-sm border-0">
                <div className="card-body">
                  <h3>User Management</h3>
                  <p>Manage all users in the system.</p>
                  <div className="d-grid gap-2 d-md-flex justify-content-md-start">
                    <Link to="/usersList" className="btn btn-primary me-md-2">
                      <i className="bi bi-people me-2"></i>
                      All Users
                    </Link>
                    <Link to="/usersList?role=tutor" className="btn btn-info me-md-2">
                      <i className="bi bi-person-badge me-2"></i>
                      Tutors
                    </Link>
                    <Link to="/usersList?role=student" className="btn btn-success">
                      <i className="bi bi-mortarboard me-2"></i>
                      Students
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;
