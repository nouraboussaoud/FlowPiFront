import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import LayoutTutorss from './LayoutTutorss';
import UsersTable from '../tutor-interfaces/UsersTable';
import Dashboard from '../tutor-interfaces/DashboardStat';

const TutorDashboard = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard' or 'users'

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
        if (payload.role !== 'tutor') {
          setError('This dashboard requires tutor access. Please log in as a tutor.');
          setLoading(false);
          navigate('/login');
          return;
        }

        if (queryParams.get('token')) {
          localStorage.setItem('token', token);
          console.log('Token stored in localStorage:', token);
          navigate('/tutor-dashboard', { replace: true });
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

  if (loading) {
    return (
      <LayoutTutorss>
        <div className="d-flex justify-content-center align-items-center min-vh-50">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </LayoutTutorss>
    );
  }

  if (error) {
    return (
      <LayoutTutorss>
        <div className="container">
          <div className="alert alert-danger" role="alert">
            <i className="bi bi-exclamation-triangle-fill me-2"></i>
            {error}
          </div>
        </div>
      </LayoutTutorss>
    );
  }

  return (
    <LayoutTutorss>
      <div className="container-fluid px-4 py-3">
        <div className="row mb-4">
          <div className="col-12">
            <div className="card shadow-sm border-0">
             
            </div>
          </div>
        </div>


        <div className="row">
          <div className="col-12">
            {activeTab === 'dashboard' ? (
              <div className="card shadow-sm border-0">
                <div className="card-body">
                  <Dashboard />
                </div>
              </div>
            ) : (
              <div className="card shadow-sm border-0">
                <div className="card-body">
                  
                  <UsersTable />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </LayoutTutorss>
  );
};

export default TutorDashboard;