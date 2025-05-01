import React from 'react'
import UsersTable from '../tutor-interfaces/UsersTable';
import { useNavigate, useLocation } from "react-router-dom";
import { useEffect } from 'react';

import LayoutTutorss from './LayoutTutorss';
import LayoutTutor from './LayoutTutor';
function TutorDashboard(){
    const location = useLocation();
    const navigate = useNavigate();
    
    
    useEffect(() => {
      const queryParams = new URLSearchParams(location.search);
      const token = queryParams.get('token');
      
      if (token) {
        localStorage.setItem('token', token);
        console.log('Token stored in localStorage:', token);
        navigate('/tutor-dashboard', { replace: true });
      }
    }, [location, navigate]);
    return (
        <div>
      

          <LayoutTutorss >
          <UsersTable />
          
          </LayoutTutorss>
        </div>
      );

}
export default TutorDashboard;