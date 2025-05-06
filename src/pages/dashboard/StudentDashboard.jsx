import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import LayoutStudent from './LayoutStudent';
import Contact from "../../student-interfaces/Contact";
import { get } from "../../apiHelper";
import Chatbox from "../tutor-interfaces/chatbox/ChatBox";
import SkillsManager from "./SkillsManager";

function StudentDashboard() {
  const location = useLocation();
  const navigate = useNavigate();
  const [tutors, setTutors] = useState([]); // State to hold the list of tutors
  const [selectedTutor, setSelectedTutor] = useState(null); // State to hold selected tutor for the chat


  
  
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
        localStorage.setItem('userId', userData._id);

        // Clean the URL by removing query parameters
        navigate('/student-dashboard', { replace: true });
      } catch (error) {
        console.error("Error decoding user data:", error);
        // Optionally, redirect to an error page or show a message
      }
    }
    // Fetch the list of tutors
    get('/users/getAll') // Update the endpoint as per your backend API
      .then((data) => {
        const tutors = data.filter(user => user.role === "tutor");
        setTutors(tutors); // Assuming the response is an array of tutor objects
      })
      .catch((error) => {
        console.error("Error fetching tutors:", error);
      });
  }, [location, navigate]);

  const handleSelectTutor = (tutor) => {
    setSelectedTutor(tutor); // Set selected tutor to display chatbox
  };

  return (
    <LayoutStudent>
      <div className="d-flex position-relative" style={{ height: "100vh" }}>
        
        {/* Main Content Area */}
        <div className="flex-grow-1 p-4">

          <SkillsManager />
          {selectedTutor && <Chatbox user={selectedTutor} onClose={() => setSelectedTutor(null)} />}
        </div>

        {/* Contact List (Fixed on Right) */}
        <div 
          className="position-fixed end-0 bg-light border-start shadow-sm p-3"
          style={{ width: "250px", height: "100vh", overflowY: "auto" }}
        >
          <Contact tutors={tutors} onSelectTutor={handleSelectTutor} />
        </div>
        <div>
     
       {/* Afficher le formulaire de création de groupe */}
    </div>

      </div>
    </LayoutStudent>
  );
 
}

export default StudentDashboard;