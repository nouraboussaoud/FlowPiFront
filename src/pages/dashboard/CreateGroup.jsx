import React, { useState, useEffect } from "react";
import { toast, ToastContainer } from "react-toastify"; // Importez Toastify
import "react-toastify/dist/ReactToastify.css"; // Importez le fichier CSS de Toastify

const CreateGroup = () => {
  const [groupName, setGroupName] = useState("");
  const [users, setUsers] = useState([]);
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true); // Ajout pour détecter le chargement

  // Fetch users when component mounts
  const fetchUsers = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const response = await fetch("http://localhost:5000/api/users/getAll", {
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (Array.isArray(data)) {
        setUsers(data);
      } else {
        console.error("❌ Erreur: Les données récupérées ne sont pas un tableau:", data);
      }
    } catch (error) {
      console.error("❌ Erreur lors du chargement des utilisateurs:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Chargement initial
  useEffect(() => {
    console.log("🔍 Vérification du token...");
    const token = localStorage.getItem("token");

    if (token) {
      console.log("🔑 Token trouvé, récupération des utilisateurs...");
      fetchUsers();
    }
  }, [localStorage.getItem("token")]); // <-- Surveiller le token

  const handleSubmit = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem("token");
    if (!token) {
      setError("Token is missing. Please login.");
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
          members: selectedMembers, // Array of user IDs
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create group");
      }

      const result = await response.json();
      console.log("Group created successfully:", result);

      // Affichage de la notification de succès
      toast.success("Group created successfully!");

      // Clear input and selection after submission
      setGroupName("");
      setSelectedMembers([]);
    } catch (error) {
      setError(error.message);
      console.error("Error creating group:", error);
      // Affichage de la notification d'erreur
      toast.error("Failed to create group. Please try again.");
    }
  };

  const handleMemberSelection = (userId) => {
    setSelectedMembers((prevMembers) =>
      prevMembers.includes(userId)
        ? prevMembers.filter((id) => id !== userId)
        : [...prevMembers, userId]
    );
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.header}>Create a New Group</h2>

      {error && <p style={styles.error}>{error}</p>}

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

      <ToastContainer />
    </div>
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
};

export default CreateGroup;
