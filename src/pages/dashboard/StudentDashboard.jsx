import React from 'react'
import { useNavigate, useLocation } from "react-router-dom";
import { useEffect } from 'react';
import LayoutStudent from './LayoutStudent';

function StudentDashboard() {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const token = queryParams.get('token');
    
    if (token) {
      localStorage.setItem('authToken', token);
      console.log('Token stored in localStorage:', token);
      navigate('/student-dashboard', { replace: true });
    }
  }, [location, navigate]);

  return (
 <LayoutStudent />
  )
}

export default StudentDashboard