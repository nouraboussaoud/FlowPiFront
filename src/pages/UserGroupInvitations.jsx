import React, { useState, useEffect } from 'react';
import { FaTimes, FaCheck } from 'react-icons/fa';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import LayoutStudent from './dashboard/LayoutStudent';
import Contact from "../student-interfaces/Contact";
import Chatbox from "./tutor-interfaces/chatbox/ChatBox";
import { get } from "../apiHelper";

const GroupList = () => {
  const [userGroups, setUserGroups] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [acceptedGroups, setAcceptedGroups] = useState([]);
  const [tutors, setTutors] = useState([]);
  const [selectedTutor, setSelectedTutor] = useState(null);
  const [showContactList, setShowContactList] = useState(false);
  const [showChatBubble, setShowChatBubble] = useState(true);
  const [unreadMessages, setUnreadMessages] = useState(0);

  // Fetch user groups
  const fetchUserGroups = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setError('Token is missing. Please login.');
      setLoading(false);
      return;
    }

    try {
      const data = await get('/groups/my-groups', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUserGroups(data || []);
    } catch (error) {
      setError(error.message);
      console.error('Error fetching user groups:', error);
      toast.error('Error fetching groups', {
        position: "top-right",
        autoClose: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  // Fetch unread messages count
  const fetchUnreadMessagesCount = async () => {
    try {
      const data = await get("/messages/unread");
      setUnreadMessages(data?.count || 0);
    } catch (error) {
      console.error("Error fetching unread messages:", error);
    }
  };

  // Handle accepting an invitation
  const handleAcceptInvitation = async (groupId) => {
    const token = localStorage.getItem('token');
    try {
      await fetch(`http://localhost:5000/api/groups/${groupId}/accept-invitation`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setUserGroups(prev => prev.filter(g => g._id !== groupId));
      setAcceptedGroups(prev => [...prev, groupId]);
      localStorage.setItem('acceptedGroups', JSON.stringify([...acceptedGroups, groupId]));
      toast.success('Invitation accepted!', {
        position: "top-right",
        autoClose: 3000,
      });
    } catch (error) {
      toast.error(error.message, {
        position: "top-right",
        autoClose: 3000,
      });
    }
  };

  // Handle rejecting an invitation
  const handleRejectInvitation = async (groupId) => {
    if (window.confirm('Are you sure you want to reject this invitation?')) {
      const token = localStorage.getItem('token');
      try {
        await fetch(`http://localhost:5000/api/groups/${groupId}/reject-invitation`, {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setUserGroups(prev => prev.filter(g => g._id !== groupId));
        toast.success('Invitation rejected successfully', {
          position: "top-right",
          autoClose: 3000,
        });
      } catch (error) {
        toast.error('Error rejecting invitation', {
          position: "top-right",
          autoClose: 3000,
        });
      }
    }
  };

  // Toggle contact list
  const toggleContactList = () => {
    setShowContactList(true);
    setShowChatBubble(false);
  };

  // Close contact list
  const closeContactList = () => {
    setShowContactList(false);
    setShowChatBubble(!selectedTutor);
  };

  // Select tutor
  const handleSelectTutor = (tutor) => {
    setSelectedTutor(tutor);
    setShowContactList(false);
    setShowChatBubble(false);
    setUnreadMessages(prev => Math.max(0, prev - 1));
  };

  // Close chatbox
  const handleCloseChatbox = () => {
    setSelectedTutor(null);
    setShowChatBubble(true);
  };

  // useEffect for initial setup
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      const fetchCurrentUser = async () => {
        try {
          const userData = await get('/users/current', {
            headers: { Authorization: `Bearer ${token}` },
          });
          setCurrentUser(userData);
        } catch (error) {
          console.error('Error fetching current user:', error);
        }
      };
      fetchCurrentUser();
    }

    const storedAcceptedGroups = JSON.parse(localStorage.getItem('acceptedGroups')) || [];
    setAcceptedGroups(storedAcceptedGroups);

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

    fetchUserGroups();
    fetchUnreadMessagesCount();

    // Set up message polling interval
    const messageInterval = setInterval(fetchUnreadMessagesCount, 30000);

    return () => {
      clearInterval(messageInterval);
    };
  }, []);

  // Handle escape key to close contact list or chatbox
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape") {
        setShowContactList(false);
        setSelectedTutor(null);
        setShowChatBubble(true);
      }
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, []);

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
      <div className="container mt-5">
        <div>
          <p style={styles.title}>Invitation List for Groups</p>
        </div>
        {error && <div className="alert alert-danger">{error}</div>}

        {loading ? (
          <div className="text-center">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p>Loading your groups...</p>
          </div>
        ) : userGroups.length === 0 ? (
          <div className="alert alert-info text-center">You haven't received any invitations yet</div>
        ) : (
          <div className="row">
            {userGroups.map((group) => (
              <div className="col-md-6 col-lg-4 mb-4" key={group._id}>
                <div className="card h-100 shadow-sm">
                  <div className="card-body">
                    <h5 className="card-title d-flex justify-content-between">
                      <span>{group.name}</span>
                    </h5>

                    <div className="mb-3">
                      <h6 className="text-muted">Members:</h6>
                      <ul className="list-group list-group-flush">
                        {group.members.map((member) => (
                          <li
                            key={member._id}
                            className={`list-group-item ${member._id === currentUser?._id ? 'bg-light' : ''}`}
                          >
                            <div className="d-flex align-items-center">
                              {member.profilePic && (
                                <img
                                  src={`http://localhost:5000/uploads/${member.profilePic}`}
                                  alt={member.name}
                                  className="rounded-circle me-2"
                                  style={{ width: '30px', height: '30px', objectFit: 'cover' }}
                                />
                              )}
                              <span>
                                {member.name}
                                {member._id === currentUser?._id && ' (You)'}
                                {group.admin?._id === member._id && ' 👑'}
                              </span>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="d-flex justify-content-between">
                      {!acceptedGroups.includes(group._id) && (
                        <>
                          <button
                            className="btn btn-outline-primary btn-sm"
                            style={styles.acceptButton}
                            onClick={() => handleAcceptInvitation(group._id)}
                          >
                            <FaCheck className="me-1" /> Accept Invitation
                          </button>
                          <button
                            className="btn btn-outline-danger btn-sm"
                            style={styles.rejectButton}
                            onClick={() => handleRejectInvitation(group._id)}
                          >
                            <FaTimes className="me-1" /> Reject Invitation
                          </button>
                        </>
                      )}
                      {acceptedGroups.includes(group._id) && (
                        <p className="text-success">You have accepted the invitation.</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div style={styles.chatBubbleContainer}>
          {showChatBubble && !selectedTutor && (
            <div
              style={styles.chatBubble}
              className={`chat-bubble ${showContactList ? 'active' : ''}`}
              onClick={toggleContactList}
            >
              <i className="fas fa-comments"></i>
              {unreadMessages > 0 && <span style={styles.badge}>{unreadMessages}</span>}
            </div>
          )}

          {showContactList && (
            <div style={styles.contactListPanel}>
              <div style={styles.panelHeader}>
                <h3>Contacts</h3>
                <button style={styles.closeBtn} onClick={closeContactList}>×</button>
              </div>
              <div style={styles.panelBody}>
                <Contact tutors={tutors} onSelectTutor={handleSelectTutor} />
              </div>
            </div>
          )}
        </div>

        {selectedTutor && (
          <Chatbox user={selectedTutor} onClose={handleCloseChatbox} />
        )}
      </div>
    </LayoutStudent>
  );
};

const styles = {
  title: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#000',
    textAlign: 'center',
    padding: '10px 0',
    borderBottom: '2px solid #000',
    marginBottom: '20px',
  },
  acceptButton: {
    borderRadius: '20px',
    padding: '8px 20px',
    transition: 'background-color 0.3s ease, transform 0.3s ease',
  },
  rejectButton: {
    borderRadius: '20px',
    padding: '8px 20px',
    transition: 'background-color 0.3s ease, transform 0.3s ease',
  },
  chatBubbleContainer: {
    position: 'fixed',
    bottom: '30px',
    right: '30px',
    zIndex: '1000',
  },
  chatBubble: {
    width: '60px',
    height: '60px',
    backgroundColor: '#007bff',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    fontSize: '24px',
    cursor: 'pointer',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
    transition: 'all 0.3s ease',
    position: 'relative',
  },
  badge: {
    position: '！我',
    top: '-5px',
    right: '-5px',
    backgroundColor: '#ff4136',
    color: 'white',
    borderRadius: '50%',
    width: '22px',
    height: '22px',
    fontSize: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  contactListPanel: {
    position: 'absolute',
    bottom: '75px',
    right: '0',
    width: '300px',
    maxHeight: '400px',
    backgroundColor: 'white',
    borderRadius: '10px',
    boxShadow: '0 5px 15px rgba(0, 0, 0, 0.2)',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
  },
  panelHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 16px',
    borderBottom: '1px solid #e4e6eb',
  },
  panelBody: {
    padding: '12px',
    overflowY: 'auto',
    flex: '1',
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    fontSize: '20px',
    cursor: 'pointer',
    color: '#65676b',
  },
};

export default GroupList;