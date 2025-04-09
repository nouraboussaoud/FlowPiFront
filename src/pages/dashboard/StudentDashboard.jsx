import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import LayoutStudent from './LayoutStudent';
import ContactList from "../Contact";
import { get } from "../../apiHelper";
import Chatbox from "../tutor-interfaces/chatbox/ChatBox";

function StudentDashboard() {
  const location = useLocation();
  const navigate = useNavigate();
  const [tutors, setTutors] = useState([]); 
  const [selectedTutor, setSelectedTutor] = useState(null);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    // Handle token storage
    const queryParams = new URLSearchParams(location.search);
    const token = queryParams.get('token');
    if (token) {
      localStorage.setItem('authToken', token);
      console.log('Token stored in localStorage:', token);
      navigate('/student-dashboard', { replace: true });
    }

    // Get current user ID
    const storedUserId = localStorage.getItem('userId');
    if (storedUserId) {
      setUserId(storedUserId);
    } else {
      // If not in localStorage, fetch from the /me endpoint
      get('/users/me')
        .then(data => {
          localStorage.setItem('userId', data._id);
          setUserId(data._id);
        })
        .catch(error => console.error("Error fetching user data:", error));
    }

    // Fetch the list of tutors
    get('/users/getAll')
      .then((data) => {
        const tutors = data.filter(user => user.role === "tutor");
        setTutors(tutors);
      })
      .catch((error) => {
        console.error("Error fetching tutors:", error);
      });
  }, [location, navigate]);

  const handleSelectTutor = (tutor) => {
    setSelectedTutor(tutor);
  };

  const handleChatClose = () => {
    setSelectedTutor(null);
  };

  return (
    <LayoutStudent>
      <div className="d-flex position-relative" style={{ height: "100vh" }}>
        {/* Main Content Area */}
        <div className="flex-grow-1 p-4">
          <h2>Welcome to the Student Dashboard</h2>
          {selectedTutor && (
            <Chatbox 
              user={selectedTutor} 
              onClose={handleChatClose}
              currentUserId={userId}
            />
          )}
        </div>

        {/* Contact List (Fixed on Right) */}
        <div 
          className="position-fixed end-0 bg-light border-start shadow-sm p-3"
          style={{ width: "250px", height: "100vh", overflowY: "auto" }}
        >
          <ContactList 
            tutors={tutors} 
            onSelectTutor={handleSelectTutor}
          />
        </div>
      </div>
    </LayoutStudent>
  );
}

export default StudentDashboard;