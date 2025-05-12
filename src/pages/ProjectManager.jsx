import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { JitsiMeeting } from '@jitsi/react-sdk';
import io from 'socket.io-client';
import LayoutStudent from './dashboard/LayoutStudent';
import callSound from '../assets/sounds/microsoft_teams_call.mp3';

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
  const [showJitsi, setShowJitsi] = useState(false);
  const [currentMeeting, setCurrentMeeting] = useState(null);
  const socketRef = useRef(null);
  const [incomingCall, setIncomingCall] = useState(null);
  const [showCallModal, setShowCallModal] = useState(false);
  const [groupMembers, setGroupMembers] = useState([]);

  const styles = {
    container: {
      maxWidth: "1200px",
      margin: "0 auto",
      padding: "2rem",
      backgroundColor: "#f8fafc",
      minHeight: "100vh"
    },
    header: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: "2rem",
      paddingBottom: "1rem",
      borderBottom: "1px solid #e2e8f0",
    },
    title: {
      fontSize: "1.8rem",
      fontWeight: "600",
      color: "#1e293b",
      margin: 0
    },
    button: {
      border: "none",
      borderRadius: "8px",
      padding: "0.75rem 1.5rem",
      fontWeight: 600,
      cursor: "pointer",
      transition: "all 0.2s",
      display: "flex",
      alignItems: "center",
      gap: "0.5rem",
      fontSize: "0.95rem"
    },
    actionButton: {
      border: "none",
      borderRadius: "8px",
      padding: "0.75rem 1.25rem",
      fontWeight: 600,
      cursor: "pointer",
      transition: "all 0.2s",
      display: "flex",
      alignItems: "center",
      gap: "0.5rem",
      fontSize: "0.95rem",
      boxShadow: "0 2px 5px rgba(0, 0, 0, 0.1)"
    },
    editButton: {
      backgroundColor: "#0e5ad6",
      color: "white",
      '&:hover': {
        backgroundColor: "#0e5ad6"
      }
    },
    deleteButton: {
      backgroundColor: "#f51616",
      color: "white",
      '&:hover': {
        backgroundColor: "#f51616"
      }
    },
    icon: {
      width: "18px",
      height: "18px"
    }
  ,
    buttonPrimary: {
      backgroundColor: "#3b82f6",
      color: "white",
      '&:hover': {
        backgroundColor: "#2563eb"
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
      backgroundColor: "#e2e8f0",
      color: "#475569",
      '&:hover': {
        backgroundColor: "#cbd5e1"
      }
    },
    buttonSuccess: {
      backgroundColor: "#4CAF50",
      color: "white",
      '&:hover': {
        backgroundColor: "#4CAF50"
      }
    },
    taskCard: {
      background: "white",
      borderRadius: "16px",
      boxShadow: "0 8px 20px rgba(0, 0, 0, 0.08)",
      padding: "2rem",
      transition: "all 0.3s ease",
      borderLeft: "8px solid #3b82f6",
      marginBottom: "2rem",
      maxWidth: "900px",
      margin: "0 auto 2rem",
      '&:hover': {
        transform: "translateY(-5px)",
        boxShadow: "0 12px 25px rgba(0, 0, 0, 0.12)"
      }
    },
    taskTitle: {
      fontSize: "1.8rem",
      fontWeight: "700",
      color: "#1e293b",
      margin: "0 0 1rem 0",
      display: "flex",
      alignItems: "center",
      gap: "0.8rem"
    },
    taskDescription: {
      color: "#64748b",
      fontSize: "1rem",
      lineHeight: "1.6",
      margin: "0.75rem 0"
    },
    taskMeta: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginTop: "1.5rem",
      fontSize: "0.875rem",
      color: "#64748b"
    },
    groupBadge: {
      backgroundColor: "#dbeafe",
      color: "#1d4ed8",
      padding: "0.75rem 1.25rem",
      borderRadius: "8px",
      fontSize: "0.95rem",
      fontWeight: "600",
      display: "inline-flex",
      alignItems: "center",
      gap: "0.75rem",
      marginRight: "0.75rem",
      marginBottom: "0.75rem",
      border: "1px solid #bfdbfe",
      transition: "all 0.2s",
      '&:hover': {
        backgroundColor: "#bfdbfe",
        transform: "translateY(-2px)"
      }
    },
    subjectBadge: {
      backgroundColor: "#dbeafe",
      color: "#1d4ed8",
      padding: "0.75rem 1.25rem",
      borderRadius: "8px",
      fontSize: "0.95rem",
      fontWeight: "600",
      display: "inline-flex",
      alignItems: "center",
      gap: "0.75rem",
      marginRight: "0.75rem",
      marginBottom: "0.75rem",
      border: "1px solid #bfdbfe",
      transition: "all 0.2s",
      '&:hover': {
        backgroundColor: "#bfdbfe",
        transform: "translateY(-2px)"
      }
    },
    emptyState: {
      textAlign: "center",
      padding: "3rem",
      color: "#64748b",
      backgroundColor: "white",
      borderRadius: "12px",
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
      borderRadius: "12px",
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
      color: "#1e293b",
      margin: 0
    },
    closeButton: {
      background: "none",
      border: "none",
      fontSize: "1.5rem",
      cursor: "pointer",
      color: "#64748b"
    },
    formGroup: {
      marginBottom: "1.25rem"
    },
    label: {
      display: "block",
      marginBottom: "0.5rem",
      fontWeight: "500",
      color: "#475569",
      fontSize: "0.875rem"
    },
    input: {
      width: "100%",
      padding: "0.75rem",
      border: "1px solid #e2e8f0",
      borderRadius: "8px",
      fontSize: "1rem",
      backgroundColor: "#f8fafc",
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
      border: "1px solid #e2e8f0",
      borderRadius: "8px",
      fontSize: "1rem",
      minHeight: "120px",
      backgroundColor: "#f8fafc",
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
      border: "1px solid #e2e8f0",
      borderRadius: "8px",
      fontSize: "1rem",
      backgroundColor: "#f8fafc"
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
      borderRadius: "8px",
      marginBottom: "1.5rem",
      display: "flex",
      alignItems: "center",
      gap: "0.5rem",
      fontSize: "0.95rem"
    },
    taskButtonGroup: {
      display: "flex",
      gap: "1rem",
      alignItems: "center",
      justifyContent: "flex-end",
      marginTop: "1.5rem"
    },
    groupInfo: {
      display: "flex",
      flexDirection: "column",
      gap: "1rem",
      backgroundColor: "#f8fafc",
      padding: "1.5rem",
      borderRadius: "12px",
      margin: "1.5rem 0",
      border: "1px solid #e2e8f0"
    },
    groupHeader: {
      display: "flex",
      alignItems: "center",
      gap: "1rem",
      marginBottom: "0.5rem"
    },
    subjectList: {
      display: "flex",
      flexWrap: "wrap",
      gap: "0.75rem",
      marginTop: "1rem"
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
      borderRadius: '6px',
      padding: '8px 16px',
      cursor: 'pointer',
      fontWeight: '500'
    },
    videoCallSection: {
      marginTop: "1.5rem",
      padding: "1.25rem",
      backgroundColor: "#f0fdf4",
      borderRadius: "8px",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: "1rem",
      border: "1px solid #bbf7d0"
    },
    videoCallText: {
      fontSize: "1rem",
      color: "#4CAF50",
      fontWeight: "500"
    },
    membersSection: {
      marginTop: "2rem",
      padding: "1.5rem",
      background: "white",
      borderRadius: "12px",
      boxShadow: "0 4px 6px rgba(0, 0, 0, 0.05)",
      maxWidth: "800px",
      margin: "2rem auto"
    },
    membersTitle: {
      fontSize: "1.25rem",
      fontWeight: "600",
      color: "#1e293b",
      marginBottom: "1.25rem",
      paddingBottom: "0.75rem",
      borderBottom: "1px solid #e2e8f0"
    },
    memberList: {
      display: "flex",
      flexDirection: "column",
      gap: "0.5rem"
    },
    memberItem: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: "1rem",
      padding: "0.75rem",
      fontSize: "0.95rem",
      color: "#475569",
      backgroundColor: "#f8fafc",
      borderRadius: "8px",
      transition: "all 0.2s"
    },
    memberInfo: {
      display: "flex",
      alignItems: "center",
      gap: "0.75rem"
    },
    statusDot: {
      width: "12px",
      height: "12px",
      borderRadius: "50%",
      display: "inline-block"
    },
    onlineDot: {
      backgroundColor: "#10b981"
    },
    offlineDot: {
      backgroundColor: "#94a3b8"
    },
    statusText: {
      fontSize: "0.875rem",
      fontWeight: "500"
    },
    onlineText: {
      color: "#10b981"
    },
    offlineText: {
      color: "#94a3b8"
    },
    callButton: {
      backgroundColor: "#3b82f6",
      color: "white",
      border: "none",
      borderRadius: "6px",
      padding: "0.5rem 1rem",
      fontSize: "0.875rem",
      cursor: "pointer",
      transition: "all 0.2s",
      '&:hover': {
        backgroundColor: "#2563eb"
      }
    }
  };

  const respondToCall = async (response) => {
    try {
      if (incomingCall?.stopSound) {
        incomingCall.stopSound();
      }
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
        socketRef.current?.emit('join-call-room', incomingCall.roomName);
      }
      setShowCallModal(false);
      setIncomingCall(null);
    } catch (error) {
      setError("Error responding to call: " + error.message);
    }
  };

  const closeMeeting = () => {
    setShowJitsi(false);
    setCurrentMeeting(null);
    socketRef.current?.emit('leave-call-room', currentMeeting?.roomName);
  };

  const startMeeting = async (project) => {
    try {
      const token = localStorage.getItem("token");
      const userId = localStorage.getItem("userId");
      if (!userId) {
        setError("User ID not found. Please log in again.");
        return;
      }
      const roomName = `project-${project._id}-${Date.now()}`;
      const groupRes = await axios.get(
        `http://localhost:5000/api/groups/getGroupById/${project.group._id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const group = groupRes.data;
      if (!group?.members || !Array.isArray(group.members)) {
        throw new Error("Invalid group data structure");
      }
      const members = group.members.filter(memberId => memberId !== userId);
      if (members.length === 0) {
        setError("No other members in the group to invite");
        return;
      }
      await axios.post(
        `http://localhost:5000/api/projects/${project._id}/invite-call`,
        {
          roomName,
          projectId: project._id,
          projectName: project.name,
          userIds: members,
          callerName: localStorage.getItem('username') || 'A group member'
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
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

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setError('No token found. Please login.');
      return;
    }
    const socket = io('http://localhost:5000', {
      auth: { token },
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      transports: ['websocket'],
    });
    socketRef.current = socket;
    socket.on('connect', () => {
      console.log('✅ Socket connected with ID:', socket.id);
    });
    socket.on('connect_error', (err) => {
      console.error('❌ Socket connection error:', err.message);
      setError('Failed to connect to the server. Please try again later.');
    });
    socket.on('video-call-invitation', (data) => {
      const audio = new Audio(callSound);
      audio.loop = true;
      audio.play();
      setIncomingCall({
        ...data,
        stopSound: () => {
          audio.pause();
        },
        timestamp: new Date().toISOString(),
      });
      setShowCallModal(true);
    });
    socket.on('user-status', ({ userId, username, isOnline }) => {
      setGroupMembers(prev => {
        const existingMember = prev.find(member => member.userId === userId);
        if (existingMember) {
          return prev.map(member =>
            member.userId === userId ? { ...member, isOnline } : member
          );
        }
        return [...prev, { userId, username, isOnline }];
      });
    });
    socket.on('disconnect', (reason) => {
      console.log('⚠️ Socket disconnected:', reason);
    });
    return () => {
      if (socketRef.current) socketRef.current.disconnect();
    };
  }, []);
 

  const fetchData = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      setError("No token found. Please login.");
      setIsLoading(false);
      return;
    }
    try {
      const groupsResponse = await axios.get(
        "http://localhost:5000/api/groups/my-group",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setUserGroups(groupsResponse.data);
      const userGroupIds = groupsResponse.data.map(group => group._id);
      const projectsRes = await axios.get(
        "http://localhost:5000/api/projects/projects",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const filteredProjects = projectsRes.data.filter(project =>
        project.group && userGroupIds.includes(project.group._id)
      );
      setProjects(filteredProjects);
      if (filteredProjects.length > 0) {
        const groupId = filteredProjects[0].group._id;
        const groupRes = await axios.get(
          `http://localhost:5000/api/groups/getGroupById/${groupId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const members = groupRes.data.members.map(memberId => ({
          userId: memberId,
          username: `User-${memberId.slice(-4)}`,
          isOnline: false
        }));
        setGroupMembers(members);
      }
      const groupsRes = await axios.get(
        "http://localhost:5000/api/groups/dropdown",
        { headers: { Authorization: `Bearer ${token}` } }
      );
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
    fetchData();
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
      return;
    }
    try {
      setIsLoading(true);
      const { name, description, group } = newProject;
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

  const deleteProject = async (projectId) => {
    const token = localStorage.getItem("token");
    if (!token) {
      setError("No token found. Please login.");
      return;
    }
    try {
      setIsLoading(true);
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

  return (
    <LayoutStudent>
      <br></br>
      <div style={styles.container}>
        {error && (
          <div style={styles.errorMessage}>
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="#ef4444">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {error}
          </div>
        )}

        {showCallModal && incomingCall && (
          <div style={styles.modalOverlay}>
            <div style={styles.modalContent}>
              <div style={styles.modalHeader}>
                <h2 style={styles.modalTitle}>
                  Incoming Video Call
                </h2>
              </div>
              <div style={styles.formGroup}>
                <p>Call from {incomingCall.callerName} for project: {incomingCall.projectName}</p>
              </div>
              <div style={styles.buttonGroup}>
                <button
                  style={{
                    ...styles.button,
                    ...styles.buttonDanger
                  }}
                  onClick={() => respondToCall('decline')}
                >
                  Decline
                </button>
                <button
                  style={{
                    ...styles.button,
                    ...styles.buttonSuccess
                  }}
                  onClick={() => respondToCall('accept')}
                >
                  Accept
                </button>
              </div>
            </div>
          </div>
        )}

        {showJitsi && currentMeeting && (
          <div style={styles.jitsiContainer}>
            <button
              style={styles.closeMeetingButton}
              onClick={closeMeeting}
            >
              Close Meeting
            </button>
            <JitsiMeeting
              domain="jitsi.riot.im"
              roomName={currentMeeting.roomName}
              configOverwrite={{
                startWithAudioMuted: true,
                startWithVideoMuted: false,
                subject: `Meeting for project: ${currentMeeting.projectName}`,
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
                displayName: localStorage.getItem('username') || 'User'
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
                      ...styles.buttonDefault
                    }}
                    type="button"
                    onClick={() => setShowModal(false)}
                  >
                    Cancel
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
                      ? (editMode ? 'Saving...' : 'Creating...')
                      : (editMode ? 'Save' : 'Create Project')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {isLoading ? (
          <div style={styles.emptyState}>
            <svg width="48" height="48" fill="none" viewBox="0 0 24 24" stroke="#94a3b8" style={{ margin: '0 auto 1rem' }}>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p>Loading projects...</p>
          </div>
        ) : projects.length > 0 ? (
          <>
          {projects.map(project => (
            <div key={project._id} style={styles.taskCard}>
              <h3 style={styles.taskTitle}>
                <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="#3b82f6">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                {project.name}
              </h3>
              <p style={styles.taskDescription}>{project.description}</p>
              <div style={styles.videoCallSection}>
                <span style={styles.videoCallText}>Start a video meeting with your group</span>
                <button
                  style={{
                    ...styles.button,
                    ...styles.buttonSuccess,
                    padding: '0.75rem 1.5rem',
                    fontSize: '1rem'
                  }}
                  onClick={() => startMeeting(project)}
                >
                  <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  Start Call
                </button>
              </div>
              <div style={styles.groupInfo}>
                {project.group ? (
                  <>
                   <h4 style={{ margin: "0.5rem 0", color: "475569#", fontSize: "1.1rem" }}>
                          Associated Team:
                        </h4>
                    <div style={styles.groupHeader}>
                      <span style={styles.groupBadge}>
                        <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        {project.group.name || "Group name not defined"}
                      </span>
                    </div>
                    {project.group.assignedSubjects?.length > 0 ? (
                      <>
                        <h4 style={{ margin: "0.5rem 0", color: "#475569", fontSize: "1.1rem" }}>
                          Associated Subject:
                        </h4>
                        <div style={styles.subjectList}>
                          {project.group.assignedSubjects.map(subject => (
                            <span key={subject._id} style={styles.subjectBadge}>
                              <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="#1d4ed8">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                              {subject.title}
                            </span>
                          ))}
                        </div>
                      </>
                    ) : (
                      <span style={styles.subjectBadge}>
                        <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="#64748b">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        No subjects assigned to this group
                      </span>
                    )}
                  </>
                ) : (
                  <span style={styles.groupBadge}>No group assigned</span>
                )}
              </div>
              <div style={styles.taskButtonGroup}>
                <button
                  style={{
                    ...styles.actionButton,
                    ...styles.editButton
                  }}
                  onClick={() => handleEdit(project)}
                >
                  <svg style={styles.icon} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Edit Project
                </button>
                <button
              
                  style={{
                    ...styles.actionButton,
                    ...styles.deleteButton
                  }}
                  onClick={() => deleteProject(project._id)}
                >
                  <svg style={styles.icon} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Delete Project
                </button>
              </div>
            </div>
          ))}
 
          </>
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