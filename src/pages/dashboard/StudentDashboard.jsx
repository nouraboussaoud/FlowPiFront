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
    if (token) {
      localStorage.setItem('token', token);
      console.log('Token stored in localStorage:', token);
      console.log('on est ici');
      navigate('/student-dashboard', { replace: true });
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
          <h2>Welcome to the Student Dashboard</h2>
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
     
      <SkillsManager /> {/* Afficher le formulaire de création de groupe */}
    </div>

      </div>
    </LayoutStudent>
  );
 
}

export default StudentDashboard;
