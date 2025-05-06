import React, { useState, useEffect } from "react";
import axios from "axios";
import { JitsiMeeting } from '@jitsi/react-sdk';
import io from 'socket.io-client';
import LayoutStudent from './dashboard/LayoutStudent';

const ProjectManager = () => {
  // États pour la gestion des projets
  const [projects, setProjects] = useState([]);
  const [groups, setGroups] = useState([]);
  const [userGroups, setUserGroups] = useState([]);
  const [newProject, setNewProject] = useState({
    name: "",
    description: "",
    group: ""
  });
  
  // États pour l'interface
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [currentProjectId, setCurrentProjectId] = useState(null);
  
  // États pour Jitsi Meet
  const [showJitsi, setShowJitsi] = useState(false);
  const [currentMeeting, setCurrentMeeting] = useState(null);
  
  // États pour la gestion des appels
  const [incomingCall, setIncomingCall] = useState(null);
  const [showCallModal, setShowCallModal] = useState(false);

  // Styles CSS-in-JS
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
      fontSize: "1.8rem",
      fontWeight: "600",
      color: "#1f2937",
      margin: 0
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
      '&:hover': {
        backgroundColor: "#374151"
      }
    },
    buttonDanger: {
      backgroundColor: "#ef4444",
      color: "white",
      '&:hover': {
        backgroundColor: "#dc2626"
      }
    },
    buttonDefault: {
      backgroundColor: "#e5e7eb",
      color: "#374151",
      '&:hover': {
        backgroundColor: "#d1d5db"
      }
    },
    buttonSuccess: {
      backgroundColor: "#10b981",
      color: "white",
      '&:hover': {
        backgroundColor: "#059669"
      }
    },
    taskCard: {
      background: "white",
      borderRadius: "0.5rem",
      boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
      padding: "1.5rem",
      transition: "all 0.2s",
      borderLeft: "4px solid #3b82f6",
      marginBottom: "1rem",
      '&:hover': {
        transform: "translateY(-2px)",
        boxShadow: "0 10px 15px rgba(0, 0, 0, 0.1)"
      }
    },
    taskTitle: {
      fontSize: "1.25rem",
      fontWeight: "600",
      color: "#1f2937",
      margin: "0 0 0.5rem 0"
    },
    taskDescription: {
      color: "#6b7280",
      fontSize: "0.875rem",
      lineHeight: "1.5",
      margin: "0.5rem 0"
    },
    taskMeta: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginTop: "1rem",
      fontSize: "0.875rem",
      color: "#6b7280"
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
      zIndex: 1000
    },
    modalContent: {
      background: "white",
      padding: "2rem",
      borderRadius: "0.5rem",
      width: "100%",
      maxWidth: "500px",
      boxShadow: "0 10px 25px rgba(0, 0, 0, 0.1)"
    },
    modalHeader: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: "1.5rem"
    },
    modalTitle: {
      fontSize: "1.25rem",
      fontWeight: "600",
      color: "#1f2937",
      margin: 0
    },
    closeButton: {
      background: "none",
      border: "none",
      fontSize: "1.5rem",
      cursor: "pointer",
      color: "#6b7280"
    },
    formGroup: {
      marginBottom: "1.25rem"
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
      '&:focus': {
        outline: "none",
        borderColor: "#3b82f6",
        boxShadow: "0 0 0 3px rgba(59, 130, 246, 0.1)"
      }
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
      '&:focus': {
        outline: "none",
        borderColor: "#3b82f6",
        boxShadow: "0 0 0 3px rgba(59, 130, 246, 0.1)"
      }
    },
    select: {
      width: "100%",
      padding: "0.75rem",
      border: "1px solid #e5e7eb",
      borderRadius: "0.375rem",
      fontSize: "1rem",
      backgroundColor: "#f9fafb"
    },
    buttonGroup: {
      display: "flex",
      justifyContent: "flex-end",
      gap: "1rem",
      marginTop: "1.5rem"
    },
    errorMessage: {
      color: "#ef4444",
      backgroundColor: "#fee2e2",
      padding: "1rem",
      borderRadius: "0.375rem",
      marginBottom: "1rem",
      display: "flex",
      alignItems: "center",
      gap: "0.5rem"
    },
    taskGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))",
      gap: "1.5rem",
      marginTop: "2rem"
    },
    taskButtonGroup: {
      display: "flex",
      gap: "0.5rem"
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
    jitsiContainer: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 2000,
      backgroundColor: 'white'
    },
    closeMeetingButton: {
      position: 'absolute',
      top: '20px',
      right: '20px',
      zIndex: 2001,
      background: '#ef4444',
      color: 'white',
      border: 'none',
      borderRadius: '4px',
      padding: '8px 16px',
      cursor: 'pointer'
    }
  };

  // Effet pour écouter les invitations d'appel
// Replace your current socket useEffect with this improved version
useEffect(() => {
  const token = localStorage.getItem('token');
  if (!token) return;

  const socket = io('http://localhost:5000', {
    auth: { token },
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
    transports: ['websocket'] // Force WebSocket transport
  });

  // Debugging logs
  socket.on('connect', () => {
    console.log('✅ Socket connected with ID:', socket.id);
  });

  socket.on('connect_error', (err) => {
    console.error('❌ Socket connection error:', err.message);
  });

  socket.on('video-call-invitation', (data) => {
    console.log('📩 Received call invitation:', data);
    setIncomingCall(data);
    setShowCallModal(true);
  });

  socket.on('disconnect', (reason) => {
    console.log('⚠️ Socket disconnected:', reason);
  });

  return () => {
    console.log('🧹 Cleaning up socket connection');
    socket.disconnect();
  };
}, []);
// In ProjectManager.jsx, add this temporary useEffect
useEffect(() => {
  const socket = io('http://localhost:5000', { auth: { token: localStorage.getItem('token') } });
  socket.on('test-event', (data) => {
    console.log('Test message received:', data);
    alert('Test message received!');
  });
  return () => socket.disconnect();
}, []);

  // Fonction pour répondre à l'appel
  const respondToCall = async (response) => {
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `http://localhost:5000/api/projects/${incomingCall.projectId}/respond-call`,
        {
          response,
          roomName: incomingCall.roomName,
          from: incomingCall.from
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response === 'accept') {
        setCurrentMeeting({
          roomName: incomingCall.roomName,
          projectName: incomingCall.projectName
        });
        setShowJitsi(true);
      }

      setShowCallModal(false);
      setIncomingCall(null);
    } catch (error) {
      setError("Error responding to call: " + error.message);
    }
  };

  const startMeeting = async (project) => {
    try {
        const token = localStorage.getItem("token");
        const userId = localStorage.getItem("userId");
        
        if (!userId) {
            setError("User ID not found. Please log in again.");
            return;
        }
  
        // Generate a unique room name
        const roomName = `project-${project._id}-${Date.now()}`;
        
        // Get group details
        const groupRes = await axios.get(
            `http://localhost:5000/api/groups/getGroupById/${project.group._id}`,
            { headers: { Authorization: `Bearer ${token}` } }
        );
  
        const group = groupRes.data;
        
        // Validate group data
        if (!group?.members || !Array.isArray(group.members)) {
            throw new Error("Invalid group data structure");
        }
  
        // Filter members (excluding current user)
        const members = group.members.filter(memberId => memberId !== userId);
        
        if (members.length === 0) {
            setError("No other members in the group to invite");
            return;
        }
  
        // Send invitations (remove the assignment to a variable since we don't use it)
        await axios.post(
            `http://localhost:5000/api/projects/${project._id}/invite-call`,
            { 
                roomName, 
                projectId: project._id,
                userIds: members 
            },
            { headers: { Authorization: `Bearer ${token}` } }
        );
  
        // Start the meeting
        setCurrentMeeting({
            roomName,
            projectName: project.name,
            participants: members.length
        });
        setShowJitsi(true);
  
    } catch (error) {
        console.error("Meeting error:", error);
        setError(error.response?.data?.message || error.message);
    }
  };

// Enhanced socket effect with reconnection logic
useEffect(() => {
  let socket;
  const connectSocket = () => {
      socket = io('http://localhost:5000', {
          auth: {
              token: localStorage.getItem('token')
          },
          reconnectionAttempts: 5,
          reconnectionDelay: 1000
      });

      socket.on('connect', () => {
          console.log('Socket connected');
      });

      socket.on('connect_error', (err) => {
          console.error('Socket connection error:', err);
          setTimeout(connectSocket, 5000); // Reconnect after 5 seconds
      });

      socket.on('video-call-invitation', (data) => {
          console.log('Received call invitation:', data);
          setIncomingCall({
              ...data,
              timestamp: new Date().toISOString()
          });
          setShowCallModal(true);
      });

      socket.on('disconnect', () => {
          console.log('Socket disconnected');
      });
  };

  connectSocket();

  return () => {
      if (socket) {
          socket.disconnect();
      }
  };
}, []);

  // Récupération des données
  const fetchData = async () => {
    const token = localStorage.getItem("token");
    const userId = localStorage.getItem("userId");
    console.log("Fetching data with userId:", userId);
    if (!token) {
      setError("No token found. Please login.");
      setIsLoading(false);
      return;
    }
  
    try {
      // 1. Récupérer les groupes de l'utilisateur
      const groupsResponse = await axios.get(
        "http://localhost:5000/api/groups/my-groups",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setUserGroups(groupsResponse.data);
      const userGroupIds = groupsResponse.data.map(group => group._id);
  
      // 2. Récupérer les projets filtrés par groupes
      const projectsRes = await axios.get(
        "http://localhost:5000/api/projects/projects",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      const filteredProjects = projectsRes.data.filter(project => 
        project.group && userGroupIds.includes(project.group._id)
      );
      setProjects(filteredProjects);
  
      // 3. Récupérer les groupes disponibles
      const groupsRes = await axios.get(
        "http://localhost:5000/api/groups/dropdown",
        { headers: { Authorization: `Bearer ${token}` } }
      );
  
      // Remove the unused variable assignments and directly use the filtered data
      const groupsWithUsage = groupsRes.data
        .filter(group => userGroupIds.includes(group._id))
        .map(group => ({
          ...group,
          isUsed: filteredProjects.some(p => p.group?._id === group._id)
        }));
  
      setGroups(groupsWithUsage);
  
    } catch (error) {
      setError("Error fetching data: " + error.message);
      console.error("Fetch error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    console.log("localStorage userId:", localStorage.getItem("userId"));
    console.log("localStorage token:", localStorage.getItem("token"));
    fetchData();
  }, []);

  // Gestion des changements de formulaire
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewProject(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Création d'un projet
  const createProject = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    if (!token) {
      setError("No token found. Please login.");
      return;
    }

    try {
      setIsLoading(true);
      const { name, description, group } = newProject;
      
      // Vérifier l'accès au groupe sélectionné
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
    } catch (error) {
      setError(error.message || "Error creating project");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  // Mise à jour d'un projet
  const updateProject = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    if (!token) {
      setError("No token found. Please login.");
      return;
    }

    try {
      setIsLoading(true);
      const { name, description, group } = newProject;
      
      // Vérifier l'accès au groupe sélectionné
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
    } catch (error) {
      setError(error.response?.data?.message || "Error updating project");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  // Suppression d'un projet
  const deleteProject = async (projectId) => {
    const token = localStorage.getItem("token");
    if (!token) {
      setError("No token found. Please login.");
      return;
    }

    try {
      setIsLoading(true);
      
      // Vérifier que le projet appartient à un groupe de l'utilisateur
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
    } catch (error) {
      setError(error.message || "Error deleting project");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  // Édition d'un projet
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

  // Réinitialisation du formulaire
  const resetForm = () => {
    setNewProject({
      name: "",
      description: "",
      group: ""
    });
    setCurrentProjectId(null);
    setEditMode(false);
  };

  // Fermer la réunion Jitsi
  const closeMeeting = () => {
    setShowJitsi(false);
    setCurrentMeeting(null);
  };

  return (
    <LayoutStudent>
      <div style={styles.container}>
        {/* Affichage des erreurs */}
        {error && (
          <div style={styles.errorMessage}>
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="#ef4444">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {error}
          </div>
        )}

        {/* Modal pour les appels entrants */}
        {showCallModal && incomingCall && (
          <div style={styles.modalOverlay}>
            <div style={styles.modalContent}>
              <div style={styles.modalHeader}>
                <h2 style={styles.modalTitle}>
                  Appel vidéo entrant
                </h2>
              </div>
              <div style={styles.formGroup}>
                <p>Appel de {incomingCall.callerName} pour le projet: {incomingCall.projectName}</p>
              </div>
              <div style={styles.buttonGroup}>
                <button 
                  style={{
                    ...styles.button,
                    ...styles.buttonDanger
                  }}
                  onClick={() => respondToCall('decline')}
                >
                  Refuser
                </button>
                <button 
                  style={{
                    ...styles.button,
                    ...styles.buttonSuccess
                  }}
                  onClick={() => respondToCall('accept')}
                >
                  Accepter
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Fenêtre Jitsi Meet */}
        {showJitsi && currentMeeting && (
          <div style={styles.jitsiContainer}>
            <button 
              style={styles.closeMeetingButton}
              onClick={closeMeeting}
            >
              Fermer la réunion
            </button>
            <JitsiMeeting
              domain="jitsi.riot.im" 
           
              roomName={currentMeeting.roomName}
              configOverwrite={{
                startWithAudioMuted: true,
                startWithVideoMuted: false,
                subject: `Réunion pour le projet: ${currentMeeting.projectName}`,
                constraints: {
                  video: {
                    height: { ideal: 720, max: 720, min: 240 }
                  }
                },
                disableSimulcast: false,
                startScreenSharing: true,
                enableEmailInStats: false
              }}
              interfaceConfigOverwrite={{
                DISABLE_JOIN_LEAVE_NOTIFICATIONS: true,
                SHOW_CHROME_EXTENSION_BANNER: false,
                MOBILE_APP_PROMO: false,
                TOOLBAR_BUTTONS: [
                  'microphone', 'camera', 'closedcaptions', 'desktop', 'fullscreen',
                  'fodeviceselection', 'hangup', 'profile', 'info', 'chat', 'recording',
                  'livestreaming', 'etherpad', 'sharedvideo', 'settings', 'raisehand',
                  'videoquality', 'filmstrip', 'invite', 'feedback', 'stats', 'shortcuts',
                  'tileview', 'videobackgroundblur', 'download', 'help', 'mute-everyone'
                ]
              }}
              userInfo={{
                displayName: localStorage.getItem('username') || 'Utilisateur'
              }}
              onApiReady={(externalApi) => {
                console.log('Jitsi API ready', externalApi);
              }}
              getIFrameRef={(iframeRef) => {
                iframeRef.style.height = '100vh';
                iframeRef.style.width = '100%';
              }}
            />
          </div>
        )}

        {/* Modal de création/édition de projet */}
        {showModal && (
          <div style={styles.modalOverlay} onClick={() => setShowModal(false)}>
            <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
              <div style={styles.modalHeader}>
                <h2 style={styles.modalTitle}>
                  {editMode ? "Modifier le projet" : "Créer un nouveau projet"}
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
                  <label style={styles.label} htmlFor="name">Nom du projet*</label>
                  <input
                    style={styles.input}
                    type="text"
                    id="name"
                    name="name"
                    placeholder="Entrez le nom du projet"
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
                    placeholder="Entrez la description du projet"
                    value={newProject.description}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                
                <div style={styles.formGroup}>
                  <label style={styles.label} htmlFor="group">Groupe*</label>
                  <select
                    style={styles.select}
                    id="group"
                    name="group"
                    value={newProject.group}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Sélectionnez un groupe</option>
                    {groups.map(group => (
                      <option 
                        key={group._id} 
                        value={group._id}
                        disabled={group.isUsed && (!editMode || group._id !== newProject.group)}
                      >
                        {group.name} 
                        {group.assignedSubjects?.length > 0 && ` (${group.assignedSubjects.length} matières)`}
                        {group.isUsed && " (Déjà assigné à un autre projet)"}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div style={styles.buttonGroup}>
                  <button 
                    style={{
                      ...styles.button,
                      ...styles.buttonDefault
                    }}
                    type="button" 
                    onClick={() => setShowModal(false)}
                  >
                    Annuler
                  </button>
                  <button 
                    style={{
                      ...styles.button,
                      ...styles.buttonPrimary
                    }}
                    type="submit" 
                    disabled={isLoading}
                  >
                    {isLoading 
                      ? (editMode ? 'Enregistrement...' : 'Création...') 
                      : (editMode ? 'Enregistrer' : 'Créer le projet')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Affichage principal */}
        {isLoading ? (
          <div style={styles.emptyState}>
            <svg width="48" height="48" fill="none" viewBox="0 0 24 24" stroke="#9ca3af" style={{ margin: '0 auto 1rem' }}>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p>Chargement des projets...</p>
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
                          {project.group.name || "Nom de groupe non défini"}
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
                          <span style={styles.subjectBadge}>Aucune matière assignée</span>
                        )}
                      </>
                    ) : (
                      <span style={styles.groupBadge}>Aucun groupe assigné</span>
                    )}
                  </div>
                  
                  <div style={styles.taskButtonGroup}>
                    <button 
                      style={{
                        ...styles.button,
                        padding: '0.5rem',
                        ...styles.buttonSuccess
                      }}
                      onClick={() => startMeeting(project)}
                      title="Démarrer une réunion"
                    >
                      <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </button>
                    <button 
                      style={{
                        ...styles.button,
                        padding: '0.5rem',
                        ...styles.buttonPrimary
                      }}
                      onClick={() => handleEdit(project)}
                      title="Modifier le projet"
                    >
                      <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button 
                      style={{
                        ...styles.button,
                        padding: '0.5rem',
                        ...styles.buttonDanger
                      }}
                      onClick={() => deleteProject(project._id)}
                      title="Supprimer le projet"
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
            <p>Aucun projet disponible pour vos groupes. Créez votre premier projet ou attendez d'être ajouté à un groupe !</p>
            {groups.length > 0 && (
              <button 
                style={{
                  ...styles.button,
                  ...styles.buttonPrimary,
                  marginTop: '1rem'
                }}
                onClick={() => {
                  resetForm();
                  setShowModal(true);
                }}
              >
                Créer un projet
              </button>
            )}
          </div>
        )}
      </div>
    </LayoutStudent>
  );
};

export default ProjectManager;