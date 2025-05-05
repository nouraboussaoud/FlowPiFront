import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import LayoutTutorss from './LayoutTutorss';
import UsersTable from '../tutor-interfaces/UsersTable';

const TutorDashboard = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
        <div className="flex justify-center items-center h-screen">
          <svg className="animate-spin h-8 w-8 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
      </LayoutTutorss>
    );
  }

  if (error) {
    return (
      <LayoutTutorss>
        <div className="max-w-4xl mx-auto p-4">
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4" role="alert">
            <p>{error}</p>
          </div>
        </div>
      </LayoutTutorss>
    );
  }

  return (
    <LayoutTutorss>
      <div className="container mx-auto p-4 sm:p-6 lg:p-8">
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Tutor Dashboard</h1>
        </div>
        <div className="grid grid-cols-1 gap-6">
          <div className="bg-white shadow-md rounded-lg p-4 sm:p-6">
            <h2 className="text-xl font-semibold text-gray-700 mb-4">Students Overview</h2>
            <div className="overflow-x-auto">
              <UsersTable />
            </div>
          </div>
        </div>
      </div>
    </LayoutTutorss>
  );
};

export default TutorDashboard;