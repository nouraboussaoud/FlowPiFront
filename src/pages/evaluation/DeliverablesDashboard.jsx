import React, { useEffect, useState } from 'react';
import LayoutStudent from '../dashboard/LayoutStudent';
import axios from 'axios';
import Contact from "../../student-interfaces/Contact";
import Chatbox from "../tutor-interfaces/chatbox/ChatBox";
import { get } from "../../apiHelper";

const DeliverablesHistory = () => {
  const [deliverables, setDeliverables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Chat functionality states
  const [tutors, setTutors] = useState([]);
  const [selectedTutor, setSelectedTutor] = useState(null);
  const [showContactList, setShowContactList] = useState(false);
  const [showChatBubble, setShowChatBubble] = useState(true);
  const [unreadMessages, setUnreadMessages] = useState(0);

  useEffect(() => {
    const fetchDeliverables = async () => {
      const token = localStorage.getItem('authToken') || localStorage.getItem('token');
      console.log('localStorage contents:', Object.fromEntries(Object.entries(localStorage)));
      console.log('Using token:', token);

      if (!token || !token.startsWith('eyJhbGci')) {
        setError('No valid authentication token found. Please log in again.');
        setLoading(false);
        return;
      }

      // Validate token expiration
      let payload;
      try {
        payload = JSON.parse(atob(token.split('.')[1]));
        console.log('Token payload:', payload);
        const currentTime = Math.floor(Date.now() / 1000);
        if (payload.exp && payload.exp < currentTime) {
          console.log('Token expired at:', new Date(payload.exp * 1000));
          setError('Authentication token has expired. Please log in again.');
          localStorage.removeItem('authToken');
          localStorage.removeItem('token');
          setLoading(false);
          return;
        }
        if (!payload.userId && payload.id) {
          console.warn("Token uses 'id' instead of 'userId'. Backend may expect 'userId'.");
        }
      } catch (err) {
        console.error('Failed to decode token:', err);
        setError('Invalid token format. Please log in again.');
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get('http://localhost:5000/api/deliverables/history', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        console.log('Backend response:', response.data);
        setDeliverables(response.data.deliverables || []);
      } catch (error) {
        console.error('Error fetching deliverables:', error);
        if (error.response) {
          console.log('Error status:', error.response.status);
          console.log('Error data:', error.response.data);
          setError(`Failed to load deliverables: ${error.response.data.message || error.response.statusText}`);
        } else {
          setError('Failed to connect to the server. Please try again later.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchDeliverables();
    
    // Fetch tutors for chat
    fetchTutors();
    
    // Fetch unread messages count
    fetchUnreadMessagesCount();
    
    // Set up message polling interval
    const messageInterval = setInterval(fetchUnreadMessagesCount, 30000);
    
    return () => {
      clearInterval(messageInterval);
    };
  }, []);
  
  // Chat functionality methods
  const fetchTutors = () => {
    get("/users/tutors")
      .then((data) => {
        setTutors(data);
      })
      .catch((error) => {
        console.error("Error fetching tutors:", error);
      });
  };
  
  const fetchUnreadMessagesCount = () => {
    get("/messages/unread")
      .then((data) => {
        setUnreadMessages(data?.count || 0);
      })
      .catch((error) => {
        console.error("Error fetching unread messages:", error);
      });
  };
  
  const toggleContactList = () => {
    setShowContactList(!showContactList);
  };
  
  const closeContactList = () => {
    setShowContactList(false);
  };
  
  const handleSelectTutor = (tutor) => {
    setSelectedTutor(tutor);
    setShowContactList(false);
    setShowChatBubble(false); // Keep bubble hidden when chatbox is open
    setUnreadMessages(prev => Math.max(0, prev - 1));
  };
  
  const handleCloseChatbox = () => {
    setSelectedTutor(null);
    setShowChatBubble(true);
  };

  return (
    <LayoutStudent>
      <div className="container-fluid px-4">
        <div className="row">
          <div className="col-xl-9">
            <div className="card mb-4">
              <div className="card-header bg-transparent border-bottom">
                <h3 className="card-header-title mb-0">Deliverables History</h3>
              </div>
              <div className="card-body">
                {loading ? (
                  <div className="text-center">
                    <div className="spinner-border" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                    <p>Loading deliverables...</p>
                  </div>
                ) : error ? (
                  <div className="alert alert-danger" role="alert">
                    {error}
                  </div>
                ) : deliverables.length === 0 ? (
                  <p>No deliverables available.</p>
                ) : (
                  <table className="table table-striped">
                    <thead>
                      <tr>
                        <th>Title</th>
                        <th>Submission Date</th>
                        <th>Description</th>
                        <th>Mark</th>
                      </tr>
                    </thead>
                    <tbody>
                      {deliverables.map((deliverable) => (
                        <tr key={deliverable._id}>
                          <td>{deliverable.title}</td>
                          <td>{new Date(deliverable.submission_date).toLocaleDateString()}</td>
                          <td>{deliverable.description}</td>
                          <td>
                            {deliverable.evaluation && deliverable.evaluation.evaluationScore !== undefined ? (
                              <span
                                style={{
                                  color:
                                    deliverable.evaluation.evaluationScore < 30
                                      ? '#dc3545' // Red
                                      : deliverable.evaluation.evaluationScore > 60
                                      ? '#28a745' // Green
                                      : '#ffc107', // Yellow
                                  fontWeight: 'bold',
                                }}
                              >
                                {deliverable.evaluation.evaluationScore}
                              </span>
                            ) : (
                              'Not evaluated yet'
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Chat functionality */}
      <div className="chat-bubble-container">
        {showChatBubble && !selectedTutor && (
          <div
            className={`chat-bubble ${showContactList ? 'active' : ''}`}
            onClick={toggleContactList}
          >
            <i className="fas fa-comments"></i>
            {unreadMessages > 0 && <span className="badge">{unreadMessages}</span>}
          </div>
        )}

        {showContactList && (
          <div className="contact-list-panel">
            <div className="panel-header">
              <h3>Contacts</h3>
              <button className="close-btn" onClick={closeContactList}>×</button>
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
      
      <style jsx>{`
        .chat-bubble-container {
          position: fixed;
          bottom: 20px;
          right: 20px;
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
          bottom: 70px;
          right: 0;
          width: 300px;
          background-color: white;
          border-radius: 10px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          overflow: hidden;
        }
        
        .panel-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 15px;
          background-color: #f8f9fa;
          border-bottom: 1px solid #e9ecef;
        }
        
        .panel-header h3 {
          margin: 0;
          font-size: 18px;
        }
        
        .close-btn {
          background: none;
          border: none;
          font-size: 24px;
          cursor: pointer;
          color: #6c757d;
        }
        
        .panel-body {
          max-height: 300px;
          overflow-y: auto;
        }
      `}</style>
    </LayoutStudent>
  );
};

export default DeliverablesHistory;
