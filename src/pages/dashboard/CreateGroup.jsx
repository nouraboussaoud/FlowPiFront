import React, { useState, useEffect } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import LayoutStudent from './LayoutStudent';
import Contact from "../../student-interfaces/Contact";
import Chatbox from "../tutor-interfaces/chatbox/ChatBox";

const CreateGroup = () => {
  const [groupName, setGroupName] = useState("");
  const [users, setUsers] = useState([]);
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [tutors, setTutors] = useState([]);
  const [selectedTutor, setSelectedTutor] = useState(null);
  const [showContactList, setShowContactList] = useState(false);
  const [showChatBubble, setShowChatBubble] = useState(true);
  const [unreadMessages, setUnreadMessages] = useState(0);

  useEffect(() => {
    const checkGroupName = async () => {
      if (groupName.trim() === "") return;
      
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(
          `http://localhost:5000/api/groups/check-name?name=${encodeURIComponent(groupName)}`,
          {
            headers: {
              "Authorization": `Bearer ${token}`,
            },
          }
        );
        
        if (!response.ok) throw new Error("Failed to check group name");
        
        const data = await response.json();
        if (data.exists) {
          setError("This group name is already taken");
        } else {
          setError("");
        }
      } catch (error) {
        console.error("Error checking group name:", error);
        toast.error("Error checking group name", {
          position: "top-right",
          autoClose: 3000,
        });
      }
    };
  
    const timer = setTimeout(() => {
      checkGroupName();
    }, 500);
  
    return () => clearTimeout(timer);
  }, [groupName]);

  const fetchUsers = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setError("Token is missing. Please login.");
      toast.error("Token is missing. Please login.", {
        position: "top-right",
        autoClose: 3000,
      });
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/api/users/getAll", {
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (Array.isArray(data)) {
        setUsers(data);
        // Filter tutors from the same response
        const tutors = data.filter(user => user.role === "tutor");
        setTutors(tutors);
      } else {
        console.error("❌ Erreur: Les données récupérées ne sont pas un tableau:", data);
        toast.error("Invalid data format received", {
          position: "top-right",
          autoClose: 3000,
        });
      }
    } catch (error) {
      console.error("❌ Erreur lors du chargement des utilisateurs:", error);
      toast.error("Error loading users", {
        position: "top-right",
        autoClose: 3000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUnreadMessagesCount = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const response = await fetch("http://localhost:5000/api/messages/unread", {
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });
      const data = await response.json();
      setUnreadMessages(data?.count || 0);
    } catch (error) {
      console.error("Error fetching unread messages:", error);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      fetchUsers();
      fetchUnreadMessagesCount();

      // Set up message polling interval
      const messageInterval = setInterval(fetchUnreadMessagesCount, 30000);

      return () => {
        clearInterval(messageInterval);
      };
    }
  }, []);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const token = localStorage.getItem("token");
    if (!token) {
      setError("Token is missing. Please login.");
      toast.error("Token is missing. Please login.", {
        position: "top-right",
        autoClose: 3000,
      });
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/api/groups/createGroup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: groupName,
          members: selectedMembers,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to create group");
      }

      toast.success("Group created successfully!", {
        position: "top-right",
        autoClose: 3000,
      });
      setGroupName("");
      setSelectedMembers([]);
    } catch (error) {
      setError(error.message);
      console.error("Error creating group:", error);
      toast.error(error.message, {
        position: "top-right",
        autoClose: 3000,
      });
    }
  };

  const handleMemberSelection = (userId) => {
    setSelectedMembers((prevMembers) =>
      prevMembers.includes(userId)
        ? prevMembers.filter((id) => id !== userId)
        : [...prevMembers, userId]
    );
  };

  const toggleContactList = () => {
    setShowContactList(true);
    setShowChatBubble(false);
  };

  const closeContactList = () => {
    setShowContactList(false);
    setShowChatBubble(!selectedTutor);
  };

  const handleSelectTutor = (tutor) => {
    setSelectedTutor(tutor);
    setShowContactList(false);
    setShowChatBubble(false);
    setUnreadMessages(prev => Math.max(0, prev - 1));
  };

  const handleCloseChatbox = () => {
    setSelectedTutor(null);
    setShowChatBubble(true);
  };

  return (
    <LayoutStudent>
      <br></br>
      <br></br>
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
      <div style={styles.container}>
        <h2 style={styles.header}>Create a New Group</h2>

        {error && <p style={styles.error}>{error}</p>}

        {isLoading ? (
          <div style={styles.loading}>
            <p>Loading users...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={styles.form}>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Group Name:</label>
              <input
                type="text"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                required
                style={styles.input}
              />
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Select Members:</label>
              <div style={styles.membersContainer}>
                {users.map((user) => (
                  <div key={user._id} style={styles.member}>
                    <input
                      type="checkbox"
                      checked={selectedMembers.includes(user._id)}
                      onChange={() => handleMemberSelection(user._id)}
                      style={styles.checkbox}
                    />
                    <span>{user.name} ({user.email})</span>
                  </div>
                ))}
              </div>
            </div>

            <button type="submit" style={styles.submitButton}>Create Group</button>
          </form>
        )}

        <div style={styles.chatBubbleContainer}>
          {showChatBubble && !selectedTutor && (
            <div
              style={{
                ...styles.chatBubble,
                ...(showContactList ? styles.chatBubbleActive : {}),
              }}
              onClick={toggleContactList}
            >
              <i className="fas fa-comments"></i>
              {unreadMessages > 0 && <span style={styles.badge}>{unreadMessages}</span>}
            </div>
          )}

          {showContactList && (
            <div style={styles.contactListPanel}>
              <div style={styles.panelHeader}>
                <h3 style={styles.panelHeaderTitle}>Contacts</h3>
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
  container: {
    maxWidth: "600px",
    margin: "0 auto",
    padding: "20px",
    backgroundColor: "#f9f9f9",
    borderRadius: "8px",
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
  },
  header: {
    textAlign: "center",
    color: "#333",
    fontSize: "24px",
    marginBottom: "20px",
  },
  form: {
    display: "flex",
    flexDirection: "column",
  },
  inputGroup: {
    marginBottom: "15px",
  },
  label: {
    fontWeight: "bold",
    marginBottom: "5px",
    color: "#555",
  },
  input: {
    padding: "10px",
    fontSize: "16px",
    border: "1px solid #ccc",
    borderRadius: "4px",
    width: "100%",
  },
  membersContainer: {
    marginTop: "10px",
  },
  member: {
    marginBottom: "10px",
    display: "flex",
    alignItems: "center",
  },
  checkbox: {
    marginRight: "10px",
  },
  submitButton: {
    padding: "12px",
    fontSize: "16px",
    backgroundColor: "#4CAF50",
    color: "white",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    transition: "background-color 0.3s ease",
  },
  submitButtonHover: {
    backgroundColor: "#45a049",
  },
  error: {
    color: "red",
    textAlign: "center",
    marginBottom: "15px",
  },
  loading: {
    textAlign: "center",
    padding: "20px",
    color: "#555",
  },
  chatBubbleContainer: {
    position: "fixed",
    bottom: "30px",
    right: "30px",
    zIndex: "1000",
  },
  chatBubble: {
    width: "60px",
    height: "60px",
    backgroundColor: "#007bff",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "white",
    fontSize: "24px",
    cursor: "pointer",
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
    transition: "all 0.3s ease",
    position: "relative",
  },
  chatBubbleHover: {
    transform: "translateY(-5px)",
    boxShadow: "0 6px 12px rgba(0, 0, 0, 0.3)",
  },
  chatBubbleActive: {
    backgroundColor: "#0056b3",
  },
  badge: {
    position: "absolute",
    top: "-5px",
    right: "-5px",
    backgroundColor: "#ff4136",
    color: "white",
    borderRadius: "50%",
    width: "22px",
    height: "22px",
    fontSize: "12px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  contactListPanel: {
    position: "absolute",
    bottom: "75px",
    right: "0",
    width: "300px",
    maxHeight: "400px",
    backgroundColor: "white",
    borderRadius: "10px",
    boxShadow: "0 5px 15px rgba(0, 0, 0, 0.2)",
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
  },
  panelHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "12px 16px",
    borderBottom: "1px solid #e4e6eb",
  },
  panelHeaderTitle: {
    margin: "0",
    fontSize: "16px",
    fontWeight: "600",
  },
  closeBtn: {
    background: "none",
    border: "none",
    fontSize: "20px",
    cursor: "pointer",
    color: "#65676b",
  },
  panelBody: {
    padding: "12px",
    overflowY: "auto",
    flex: "1",
  },
};

export default CreateGroup;