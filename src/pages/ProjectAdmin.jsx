import React, { useState, useEffect } from "react";
import axios from "axios";
import DashboardLayout from "./DashboardLayout";

const ProjectManager = () => {
  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const styles = {
    container: {
      maxWidth: "1200px",
      margin: "0 auto",
      padding: "2rem",
      backgroundColor: "#f9fafb",
      minHeight: "100vh"
    },
    header: {
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
    projectCard: {
      background: "white",
      borderRadius: "0.5rem",
      boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
      padding: "1.5rem",
      marginBottom: "1.5rem"
    },
    projectTitle: {
      color: "#1f2937",
      fontSize: "1.25rem",
      margin: "0 0 0.5rem 0",
      fontWeight: "600"
    },
    projectDescription: {
      color: "#6b7280",
      margin: "0.5rem 0",
      fontSize: "0.875rem"
    },
    groupInfo: {
      marginTop: "1rem",
      padding: "1rem",
      backgroundColor: "#f3f4f6",
      borderRadius: "0.375rem"
    },
    memberList: {
      display: "flex",
      flexWrap: "wrap",
      gap: "0.5rem",
      marginTop: "0.5rem"
    },
    memberItem: {
      display: "flex",
      alignItems: "center",
      gap: "0.5rem",
      backgroundColor: "#e5e7eb",
      padding: "0.5rem 0.75rem",
      borderRadius: "0.375rem"
    },
    emptyState: {
      textAlign: "center",
      padding: "3rem",
      color: "#6b7280"
    }
  };

  const fetchProjectsWithGroupsAndMembers = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No token found");
      }

      const response = await axios.get("http://localhost:5000/api/projects/projects", {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setProjects(response.data);
    } catch (error) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProjectsWithGroupsAndMembers();
  }, []);

  return (
    <DashboardLayout >
      <div style={styles.container}>
      <h1 style={styles.title}>All Projects</h1>
        <br></br>


        {isLoading ? (
          <div style={styles.emptyState}>Loading projects...</div>
        ) : projects.length > 0 ? (
          projects.map(project => (
            <div key={project._id} style={styles.projectCard}>
              <h3 style={styles.projectTitle}>{project.name}</h3>
              <p style={styles.projectDescription}>{project.description}</p>
              
              {project.group && (
                <div style={styles.groupInfo}>
                  <h4>Group: {project.group.name}</h4>
                  {project.group.assignedSubjects && (
                    <div>
                      <h5>Subjects:</h5>
                      <ul>
                        {project.group.assignedSubjects.map(subject => (
                          <li key={subject._id}>{subject.title}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {project.createdBy && (
                    <div>
                      <h5>Created By: {project.createdBy.name}</h5>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))
        ) : (
          <div style={styles.emptyState}>No projects found</div>
        )}
      </div>
      </DashboardLayout >
  );
};

export default ProjectManager;