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
        // Handle token storage
        const queryParams = new URLSearchParams(location.search);
        const token = queryParams.get('token');
        const userParam = queryParams.get('user');
       
        if (token && userParam) {
          try {
            const decodedUser = decodeURIComponent(userParam);
            const userData = JSON.parse(decodedUser);
            // Validate userData
            if (!userData._id || typeof userData._id !== 'string') {
              throw new Error('Invalid or missing user _id');
            }
            // Store user data in localStorage
          localStorage.setItem('token', token);
            localStorage.setItem('token', token);
            localStorage.setItem('userId', userData._id);
          
          } catch (error) {
            console.error("Error decoding user data:", error);
            
            // Optionally, redirect to an error page or show a message
          }
          // Redirect to the dashboard after storing the token
          const userId = localStorage.getItem("userId");
          console.log("Fetching data with userId:", userId);
        } }, [location, navigate]);
    
    return (
        <div>
      

          <LayoutTutorss >
          <LayoutTutor />
          <UsersTable />
          </LayoutTutorss>
        </div>
      );

}
export default TutorDashboard;