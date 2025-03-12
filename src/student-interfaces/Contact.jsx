import React from 'react';

function Contact({ tutors, onSelectTutor }) {
  return (
    <div className="container mt-3">
      <h4 className="text-center mb-3">Tutors</h4>
      <ul className="list-group">
        {tutors.length === 0 ? (
          <li className="list-group-item text-center text-muted">No tutors available</li>
        ) : (
          tutors.map((tutor) => (
            <li 
              key={tutor._id} 
              className="list-group-item d-flex align-items-center p-3 cursor-pointer" 
              onClick={() => onSelectTutor(tutor)}
              style={{ cursor: "pointer" }}
            >
              <img
                src={tutor.profilePic ? `http://localhost:5000/uploads/${tutor.profilePic}` : "assets/images/avatar/01.jpg"}
                alt={tutor.name}
                className="rounded-circle me-3"
                width="50"
                height="50"
              />
              <span className="fw-bold">{tutor.name}</span>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}

export default Contact;
