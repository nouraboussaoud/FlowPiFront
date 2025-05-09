import React, { useState, useEffect } from "react";
import axios from "axios";
import LayoutStudent from './dashboard/LayoutStudent';
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Contact from "../student-interfaces/Contact";
import Chatbox from "./tutor-interfaces/chatbox/ChatBox";

const ProjectManager = () => {
  const [projects, setProjects] = useState([]);
  const [groups, setGroups] = useState([]);
  const [userGroups, setUserGroups] = useState([]);
  const [newProject, setNewProject] = useState({
    name: "",
    description: "",
    group: ""
  });
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [currentProjectId, setCurrentProjectId] = useState(null);
  const [tutors, setTutors] = useState([]);
  const [selectedTutor, setSelectedTutor] = useState(null);
  const [showContactList, setShowContactList] = useState(false);
  const [showChatBubble, setShowChatBubble] = useState(true);
  const [unreadMessages, setUnreadMessages] = useState(0);

  const styles = {
    container: {
      maxWidth: "1200px",
      margin: "0 auto",
      padding: "2rem",
      backgroundColor: "#f9fafb",
      minHeight: "100vh"
    },
    header: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: "2rem",
      paddingBottom: "1rem",
      borderBottom: "1px solid #e5e7eb",
    },
    title: {
      color: "#1f2937",
      fontSize: "1.8rem",
      margin: 0,
      fontWeight: "600"
    },
    button: {
      border: "none",
      borderRadius: "0.375rem",
      padding: "0.75rem 1.5rem",
      fontWeight: 600,
      cursor: "pointer",
      transition: "all 0.2s",
      display: "flex",
      alignItems: "center",
      gap: "0.5rem",
    },
    buttonPrimary: {
      backgroundColor: "#1f2937",
      color: "white",
    },
    buttonPrimaryHover: {
      backgroundColor: "#374151",
    },
    buttonDanger: {
      backgroundColor: "#ef4444",
      color: "white",
    },
    buttonDangerHover: {
      backgroundColor: "#dc2626",
    },
    buttonDefault: {
      backgroundColor: "#e5e7eb",
      color: "#374151",
    },
    buttonDefaultHover: {
      backgroundColor: "#d1d5db",
    },
    taskCard: {
      background: "white",
      borderRadius: "0.5rem",
      boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
      padding: "1.5rem",
      transition: "all 0.2s",
      borderLeft: "4px solid #3b82f6",
      marginBottom: "1rem",
    },
    taskCardHover: {
      transform: "translateY(-2px)",
      boxShadow: "0 10px 15px rgba(0, 0, 0, 0.1)"
    },
    taskTitle: {
      color: "#1f2937",
      fontSize: "1.25rem",
      margin: "0 0 0.5rem 0",
      fontWeight: "600"
    },
    taskDescription: {
      color: "#6b7280",
      margin: "0.5rem 0",
      fontSize: "0.875rem",
      lineHeight: "1.5"
    },
    taskMeta: {
      display: "flex",
      justifyContent: "space-between",
      marginTop: "1rem",
      fontSize: "0.875rem",
      color: "#6b7280",
      alignItems: "center"
    },
    groupBadge: {
      backgroundColor: "#e5e7eb",
      color: "#374151",
      padding: "0.5rem 0.75rem",
      borderRadius: "0.375rem",
      fontSize: "0.875rem",
      fontWeight: "500",
      display: "inline-flex",
      alignItems: "center",
      gap: "0.5rem"
    },
    subjectBadge: {
      backgroundColor: "#dbeafe",
      color: "#1d4ed8",
      padding: "0.5rem 0.75rem",
      borderRadius: "0.375rem",
      fontSize: "0.875rem",
      fontWeight: "500",
      display: "inline-flex",
      alignItems: "center",
      gap: "0.5rem",
      marginTop: "0.5rem"
    },
    emptyState: {
      textAlign: "center",
      padding: "3rem",
      color: "#6b7280",
      backgroundColor: "white",
      borderRadius: "0.5rem",
      marginTop: "2rem",
      boxShadow: "0 1px 3px rgba(0, 0, 0, 0.08)"
    },
    modalOverlay: {
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: "rgba(0, 0, 0, 0.5)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 1000,
    },
    modalContent: {
      background: "white",
      padding: "2rem",
      borderRadius: "0.5rem",
      width: "100%",
      maxWidth: "500px",
      boxShadow: "0 10px 25px rgba(0, 0, 0, 0.1)",
    },
    modalHeader: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: "1.5rem",
    },
    modalTitle: {
      margin: 0,
      color: "#1f2937",
      fontSize: "1.25rem",
      fontWeight: "600"
    },
    closeButton: {
      background: "none",
      border: "none",
      fontSize: "1.5rem",
      cursor: "pointer",
      color: "#6b7280",
    },
    formGroup: {
      marginBottom: "1.25rem",
    },
    label: {
      display: "block",
      marginBottom: "0.5rem",
      fontWeight: "500",
      color: "#374151",
      fontSize: "0.875rem"
    },
    input: {
      width: "100%",
      padding: "0.75rem",
      border: "1px solid #e5e7eb",
      borderRadius: "0.375rem",
      fontSize: "1rem",
      backgroundColor: "#f9fafb",
      transition: "border-color 0.2s",
    },
    inputFocus: {
      outline: "none",
      borderColor: "#3b82f6",
      boxShadow: "0 0 0 3px rgba(59, 130, 246, 0.1)",
    },
    textarea: {
      width: "100%",
      padding: "0.75rem",
      border: "1px solid #e5e7eb",
      borderRadius: "0.375rem",
      fontSize: "1rem",
      minHeight: "100px",
      backgroundColor: "#f9fafb",
      transition: "border-color 0.2s",
    },
    select: {
      width: "100%",
      padding: "0.75rem",
      border: "1px solid #e5e7eb",
      borderRadius: "0.375rem",
      fontSize: "1rem",
      backgroundColor: "#f9fafb",
    },
    buttonGroup: {
      display: "flex",
      justifyContent: "flex-end",
      gap: "1rem",
      marginTop: "1.5rem",
    },
    errorMessage: {
      color: "#ef4444",
      backgroundColor: "#fee2e2",
      padding: "1rem",
      borderRadius: "0.375rem",
      marginBottom: "1rem",
      display: "flex",
      alignItems: "center",
      gap: "0.5rem",
    },
    taskGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))",
      gap: "1.5rem",
      marginTop: "2rem",
    },
    taskButtonGroup: {
      display: "flex",
      gap: "0.5rem",
    },
    groupInfo: {
      display: "flex",
      flexDirection: "column",
      gap: "0.5rem"
    },
    subjectList: {
      display: "flex",
      flexWrap: "wrap",
      gap: "0.5rem",
      marginTop: "0.5rem"
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

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    const token = localStorage.getItem("token");

    try {
      // Fetch user's groups
      const groupsResponse = await axios.get(
        "http://localhost:5000/api/groups/my-groups",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setUserGroups(groupsResponse.data);
      const userGroupIds = groupsResponse.data.map(group => group._id);

      // Fetch projects associated with the user's groups
      const projectsRes = await axios.get(
        "http://localhost:5000/api/projects/projects",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      const filteredProjects = projectsRes.data.filter(project => 
        project.group && userGroupIds.includes(project.group._id)
      );
      setProjects(filteredProjects);

      // Fetch available groups for creation
      const groupsRes = await axios.get(
        "http://localhost:5000/api/groups/dropdown",
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Filter to only show user's groups
      const userGroupsForCreation = groupsRes.data.filter(group => 
        userGroupIds.includes(group._id)
      );

      // Mark groups already used in projects
      const usedGroupIds = filteredProjects
        .map(p => p.group?._id)
        .filter(id => id);

      const groupsWithUsage = userGroupsForCreation.map(group => ({
        ...group,
        isUsed: usedGroupIds.includes(group._id)
      }));

      setGroups(groupsWithUsage);

      // Fetch tutors
      const tutorsRes = await axios.get(
        "http://localhost:5000/api/users/getAll",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const tutors = tutorsRes.data.filter(user => user.role === "tutor");
      setTutors(tutors);

    } catch (error) {
      setError("Error fetching data: " + error.message);
      console.error(error);
      toast.error("Error fetching data", {
        position: "top-right",
        autoClose: 3000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUnreadMessagesCount = async () => {
    const token = localStorage.getItem("token");
    try {
      const response = await axios.get(
        "http://localhost:5000/api/messages/unread",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setUnreadMessages(response.data?.count || 0);
    } catch (error) {
      console.error("Error fetching unread messages:", error);
    }
  };

  useEffect(() => {
    fetchData();
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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewProject(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const createProject = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    if (!token) {
      setError("No token found. Please login.");
      toast.error("No token found. Please login.", {
        position: "top-right",
        autoClose: 3000,
      });
      return;
    }

    try {
      setIsLoading(true);
      const { name, description, group } = newProject;
      
      // Verify user has access to the selected group
      const userGroupIds = userGroups.map(g => g._id);
      if (!userGroupIds.includes(group)) {
        throw new Error("You can only create projects for your own groups");
      }

      await axios.post(
        "http://localhost:5000/api/projects/createProject",
        { name, description, group },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      await fetchData();
      setShowModal(false);
      setError(null);
      toast.success("Project created successfully!", {
        position: "top-right",
        autoClose: 3000,
      });
    } catch (error) {
      const errorMessage = error.message || "Error creating project";
      setError(errorMessage);
      toast.error(errorMessage, {
        position: "top-right",
        autoClose: 3000,
      });
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateProject = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    if (!token) {
      setError("No token found. Please login.");
      toast.error("No token found. Please login.", {
        position: "top-right",
        autoClose: 3000,
      });
      return;
    }

    try {
      setIsLoading(true);
      const { name, description, group } = newProject;
      
      // Verify user has access to the selected group
      const userGroupIds = userGroups.map(g => g._id);
      if (!userGroupIds.includes(group)) {
        throw new Error("You can only assign projects to your own groups");
      }

      await axios.put(
        `http://localhost:5000/api/projects/projects/${currentProjectId}`,
        { name, description, group },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      await fetchData();
      setShowModal(false);
      setError(null);
      toast.success("Project updated successfully!", {
        position: "top-right",
        autoClose: 3000,
      });
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Error updating project";
      setError(errorMessage);
      toast.error(errorMessage, {
        position: "top-right",
        autoClose: 3000,
      });
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const deleteProject = async (projectId) => {
    const token = localStorage.getItem("token");
    if (!token) {
      setError("No token found. Please login.");
      toast.error("No token found. Please login.", {
        position: "top-right",
        autoClose: 3000,
      });
      return;
    }

    try {
      setIsLoading(true);
      
      // Verify the project belongs to user's group
      const projectToDelete = projects.find(p => p._id === projectId);
      const userGroupIds = userGroups.map(g => g._id);
      
      if (!projectToDelete?.group || !userGroupIds.includes(projectToDelete.group._id)) {
        throw new Error("You can only delete projects from your own groups");
      }

      await axios.delete(
        `http://localhost:5000/api/projects/projects/${projectId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setProjects(projects.filter(p => p._id !== projectId));
      toast.success("Project deleted successfully!", {
        position: "top-right",
        autoClose: 3000,
      });
    } catch (error) {
      const errorMessage = error.message || "Error deleting project";
      setError(errorMessage);
      toast.error(errorMessage, {
        position: "top-right",
        autoClose: 3000,
      });
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (project) => {
    setNewProject({
      name: project.name,
      description: project.description,
      group: project.group?._id || ""
    });
    setCurrentProjectId(project._id);
    setEditMode(true);
    setShowModal(true);
  };

  const resetForm = () => {
    setNewProject({
      name: "",
      description: "",
      group: ""
    });
    setCurrentProjectId(null);
    setEditMode(false);
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
        <div style={styles.header}>
          <h1 style={styles.title}>Project Manager</h1>
          {groups.length > 0 && (
            <button 
              style={{
                ...styles.button,
                ...styles.buttonPrimary,
                ':hover': styles.buttonPrimaryHover
              }}
              onClick={() => {
                resetForm();
                setShowModal(true);
              }}
            >
              Create Project
            </button>
          )}
        </div>
        
        {error && (
          <div style={styles.errorMessage}>
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="#ef4444">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {error}
          </div>
        )}

        {showModal && (
          <div style={styles.modalOverlay} onClick={() => setShowModal(false)}>
            <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
              <div style={styles.modalHeader}>
                <h2 style={styles.modalTitle}>
                  {editMode ? "Edit Project" : "Create New Project"}
                </h2>
                <button 
                  style={styles.closeButton}
                  onClick={() => setShowModal(false)}
                >
                  ×
                </button>
              </div>
              <form onSubmit={editMode ? updateProject : createProject}>
                <div style={styles.formGroup}>
                  <label style={styles.label} htmlFor="name">Project Name*</label>
                  <input
                    style={styles.input}
                    type="text"
                    id="name"
                    name="name"
                    placeholder="Enter project name"
                    value={newProject.name}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                
                <div style={styles.formGroup}>
                  <label style={styles.label} htmlFor="description">Description*</label>
                  <textarea
                    style={styles.textarea}
                    id="description"
                    name="description"
                    placeholder="Enter project description"
                    value={newProject.description}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                
                <div style={styles.formGroup}>
                  <label style={styles.label} htmlFor="group">Group*</label>
                  <select
                    style={styles.select}
                    id="group"
                    name="group"
                    value={newProject.group}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Select a group</option>
                    {groups.map(group => (
                      <option 
                        key={group._id} 
                        value={group._id}
                        disabled={group.isUsed && (!editMode || group._id !== newProject.group)}
                      >
                        {group.name} 
                        {group.assignedSubjects?.length > 0 && ` (${group.assignedSubjects.length} subjects)`}
                        {group.isUsed && " (Already assigned to another project)"}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div style={styles.buttonGroup}>
                  <button 
                    style={{
                      ...styles.button,
                      ...styles.buttonDefault,
                      ':hover': styles.buttonDefaultHover
                    }}
                    type="button" 
                    onClick={() => setShowModal(false)}
                  >
                    Cancel
                  </button>
                  <button 
                    style={{
                      ...styles.button,
                      ...styles.buttonPrimary,
                      ':hover': styles.buttonPrimaryHover
                    }}
                    type="submit" 
                    disabled={isLoading}
                  >
                    {isLoading 
                      ? (editMode ? 'Updating...' : 'Creating...') 
                      : (editMode ? 'Update Project' : 'Create Project')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {isLoading ? (
          <div style={styles.emptyState}>
            <svg width="48" height="48" fill="none" viewBox="0 0 24 24" stroke="#9 talep3af" style={{ margin: '0 auto 1rem' }}>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p>Loading projects...</p>
          </div>
        ) : projects.length > 0 ? (
          <div style={styles.taskGrid}>
            {projects.map(project => (
              <div key={project._id} style={styles.taskCard}>
                <h3 style={styles.taskTitle}>{project.name}</h3>
                <p style={styles.taskDescription}>{project.description}</p>
                
                <div style={styles.taskMeta}>
                  <div style={styles.groupInfo}>
                    {project.group ? (
                      <>
                        <span style={styles.groupBadge}>
                          <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                          </svg>
                          {project.group.name || "No group name"}
                        </span>
                        
                        {project.group.assignedSubjects?.length > 0 ? (
                          <div style={styles.subjectList}>
                            {project.group.assignedSubjects.map(subject => (
                              <span key={subject._id} style={styles.subjectBadge}>
                                <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                {subject.title}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span style={styles.subjectBadge}>No subjects assigned</span>
                        )}
                      </>
                    ) : (
                      <span style={styles.groupBadge}>No group assigned</span>
                    )}
                  </div>
                  
                  <div style={styles.taskButtonGroup}>
                    <button 
                      style={{
                        ...styles.button,
                        padding: '0.5rem',
                        ...styles.buttonPrimary,
                      }}
                      onClick={() => handleEdit(project)}
                      title="Edit project"
                    >
                      <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button 
                      style={{
                        ...styles.button,
                        padding: '0.5rem',
                        ...styles.buttonDanger,
                      }}
                      onClick={() => deleteProject(project._id)}
                      title="Delete project"
                    >
                      <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={styles.emptyState}>
            <svg width="48" height="48" fill="none" viewBox="0 0 24 24" stroke="#9ca3af" style={{ margin: '0 auto 1rem' }}>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <p>No projects available for your groups. Create your first project or wait to be added to a group!</p>
            {groups.length > 0 && (
              <button 
                style={{
                  ...styles.button,
                  ...styles.buttonPrimary,
                  marginTop: '1rem',
                  ':hover': styles.buttonPrimaryHover
                }}
                onClick={() => {
                  resetForm();
                  setShowModal(true);
                }}
              >
                Create Project
              </button>
            )}
          </div>
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

export default ProjectManager;