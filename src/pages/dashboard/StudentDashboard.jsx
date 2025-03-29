import React from 'react'
import { useNavigate, useLocation } from "react-router-dom";
import { useEffect } from 'react';
import LayoutStudent from './LayoutStudent';
import CreateGroup from "./CreateGroup";
function StudentDashboard() {
  const location = useLocation();
  const navigate = useNavigate();
  
  
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const token = queryParams.get('token');
    
    if (token) {
      localStorage.setItem('token', token);
      console.log('Token stored in localStorage:', token);
      navigate('/student-dashboard', { replace: true });
    }
  }, [location, navigate]);
 
  
  return (
    <LayoutStudent>
    <div>
     
      <CreateGroup /> {/* Afficher le formulaire de création de groupe */}
    </div>
  </LayoutStudent>
  )
}

export default StudentDashboard