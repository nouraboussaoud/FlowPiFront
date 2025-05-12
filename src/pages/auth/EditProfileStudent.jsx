import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import LayoutStudent from "../dashboard/LayoutStudent";
import { Container, Row, Col, Card } from "react-bootstrap";
import EditProfile from "./EditProfile";
import SkillsManager from "../dashboard/SkillsManager";
import Contact from "../../student-interfaces/Contact";
import Chatbox from "../tutor-interfaces/chatbox/ChatBox";
import { get } from "../../apiHelper";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./ProfileCommon.css";

const EditProfileStudent = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [tutors, setTutors] = useState([]);
  const [selectedTutor, setSelectedTutor] = useState(null);
  const [showContactList, setShowContactList] = useState(false);
  const [showChatBubble, setShowChatBubble] = useState(true);
  const [unreadMessages, setUnreadMessages] = useState(0);

  useEffect(() => {
    // Handle token storage
    const queryParams = new URLSearchParams(location.search);
    const token = queryParams.get("token");
    if (token) {
      localStorage.setItem("token", token);
      console.log("Token stored in localStorage:", token);
      navigate("/edit-profile-student", { replace: true });
    }

    // Fetch tutors
    get("/users/getAll")
      .then((data) => {
        const tutors = data.filter((user) => user.role === "tutor");
        setTutors(tutors);
      })
      .catch((error) => {
        console.error("Error fetching tutors:", error);
        toast.error("Error fetching tutors", {
          position: "top-right",
          autoClose: 3000,
        });
      });

    // Fetch unread messages count
    fetchUnreadMessagesCount();

    // Set up message polling interval
    const messageInterval = setInterval(fetchUnreadMessagesCount, 30000);

    return () => {
      clearInterval(messageInterval);
    };
  }, [location, navigate]);

  const fetchUnreadMessagesCount = () => {
    get("/messages/unread")
      .then((data) => {
        setUnreadMessages(data?.count || 0);
      })
      .catch((error) => {
        console.error("Error fetching unread messages:", error);
      });
  };

  const handleSelectTutor = (tutor) => {
    setSelectedTutor(tutor);
    setShowContactList(false);
    setShowChatBubble(false); // Keep bubble hidden when chatbox is open
    setUnreadMessages((prev) => Math.max(0, prev - 1));
  };

  const toggleContactList = () => {
    setShowContactList(true);
    setShowChatBubble(false); // Hide bubble when opening contact list
  };

  const closeContactList = () => {
    setShowContactList(false);
    setShowChatBubble(!selectedTutor); // Show bubble only if no chatbox is open
  };

  const handleCloseChatbox = () => {
    setSelectedTutor(null);
    setShowChatBubble(true); // Show bubble when closing chatbox
  };

  return (
    <LayoutStudent>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
      <Container className="profile-container">
        <Row>
          <Col md={12}>
            <Card className="profile-card mb-4">
              <Card.Body>
                <EditProfile />
              </Card.Body>
            </Card>
          </Col>
        </Row>
        <Row>
          <Col md={12}>
            <Card className="skills-card">
              <Card.Header className="skills-header">
                <h4>My Skills</h4>
              </Card.Header>
              <Card.Body>
                <SkillsManager />
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Chat functionality */}
        <div className="chat-bubble-container">
          {showChatBubble && !selectedTutor && (
            <div
              className={`chat-bubble ${showContactList ? "active" : ""}`}
              onClick={toggleContactList}
            >
              <i className="fas fa-comments"></i>
              {unreadMessages > 0 && (
                <span className="badge">{unreadMessages}</span>
              )}
            </div>
          )}

          {showContactList && (
            <div className="contact-list-panel">
              <div className="panel-header">
                <h3>Contacts</h3>
                <button className="close-btn" onClick={closeContactList}>
                  ×
                </button>
              </div>
              <div className="panel-body">
                <Contact tutors={tutors} onSelectTutor={handleSelectTutor} />
              </div>
            </div>
          )}
        </div>

        {selectedTutor && (
          <Chatbox user={selectedTutor} onClose={handleCloseChatbox} />
        )}
      </Container>

      <style jsx>{`
        .profile-container {
          padding: 20px;
          background-color: #f9fafb;
          min-height: calc(100vh - 80px);
        }

        .chat-bubble-container {
          position: fixed;
          bottom: 30px;
          right: 30px;
          z-index: 1000;
        }

        .chat-bubble {
          width: 60px;
          height: 60px;
          background-color: #007bff;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 24px;
          cursor: pointer;
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
          transition: all 0.3s ease;
          position: relative;
        }

        .chat-bubble:hover {
          transform: translateY(-5px);
          box-shadow: 0 6px 12px rgba(0, 0, 0, 0.3);
        }

        .chat-bubble.active {
          background-color: #0056b3;
        }

        .badge {
          position: absolute;
          top: -5px;
          right: -5px;
          background-color: #ff4136;
          color: white;
          border-radius: 50%;
          width: 22px;
          height: 22px;
          font-size: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .contact-list-panel {
          position: absolute;
          bottom: 75px;
          right: 0;
          width: 300px;
          max-height: 400px;
          background-color: white;
          border-radius: 10px;
          box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
          overflow: hidden;
          display: flex;
          flex-direction: column;
        }

        .panel-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 16px;
          border-bottom: 1px solid #e4e6eb;
        }

        .panel-header h3 {
          margin: 0;
          font-size: 16px;
          font-weight: 600;
        }

        .close-btn {
          background: none;
          border: none;
          font-size: 20px;
          cursor: pointer;
          color: #65676b;
        }

        .panel-body {
          padding: 12px;
          overflow-y: auto;
          flex: 1;
        }
      `}</style>
    </LayoutStudent>
  );
};

export default EditProfileStudent;