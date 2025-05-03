import React, { useState, useEffect } from "react";
import ContactList from "../../student-interfaces/Contact";
import Chatbox from "../tutor-interfaces/chatbox/ChatBox";
import { get } from "../../apiHelper";

function MessagesDropdown({ onClose }) {
  const [tutors, setTutors] = useState([]);
  const [selectedTutor, setSelectedTutor] = useState(null);

  useEffect(() => {
    // Fetch the list of tutors
    get('/users/getAll')
      .then((data) => {
        const tutors = data.filter(user => user.role === "tutor");
        setTutors(tutors);
        console.log("Tutors fetched:", tutors); // Debug: Log fetched tutors
      })
      .catch((error) => {
        console.error("Error fetching tutors:", error);
      });
  }, []);

  const handleSelectTutor = (tutor) => {
    console.log("Tutor selected:", tutor); // Debug: Log selected tutor
    setSelectedTutor(tutor);
    onClose(); // Close dropdown after selecting a tutor
  };

  return (
    <>
      <div
        className="dropdown-menu show bg-light border shadow-sm p-3"
        style={{
          position: "absolute",
          top: "100%",
          left: "auto",
          right: 0,
          width: "300px",
          maxHeight: "400px",
          overflowY: "auto",
          zIndex: 1000,
        }}
      >
        <h5 className="dropdown-header">Messages</h5>
        <ContactList tutors={tutors} onSelectTutor={handleSelectTutor} />
      </div>
      {selectedTutor && (
        <div
          className="chatbox-container"
          style={{
            position: "fixed",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            zIndex: 1050,
            maxWidth: "600px",
            width: "100%",
            background: "white",
            borderRadius: "10px",
            boxShadow: "0 0 10px rgba(0, 0, 0, 0.2)",
            padding: "0",
          }}
        >
          <Chatbox user={selectedTutor} onClose={() => setSelectedTutor(null)} />
        </div>
      )}
    </>
  );
}

export default MessagesDropdown;