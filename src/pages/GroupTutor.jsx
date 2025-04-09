import React, { useState, useEffect } from "react";
import { FaEdit, FaTrashAlt } from "react-icons/fa"; // Import des icônes pour Edit et Delete
import LayoutTutor from './dashboard/LayoutTutor';

const GroupList = () => {
  const [groups, setGroups] = useState([]);
  const [users, setUsers] = useState([]); // État pour les utilisateurs
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [groupsPerPage] = useState(5); // Nombre de groupes par page
  const [showUpdateModal, setShowUpdateModal] = useState(false); // Pour afficher la modale de mise à jour
  const [groupToUpdate, setGroupToUpdate] = useState(null); // Pour stocker les données du groupe à mettre à jour
  const [updatedGroupName, setUpdatedGroupName] = useState(""); // Pour gérer le champ du nom de groupe à mettre à jour
  const [selectedMembers, setSelectedMembers] = useState([]); // Pour gérer les membres sélectionnés

  const fetchGroups = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setError("Token is missing. Please login.");
      return;
    }
  
    try {
      const response = await fetch("http://localhost:5000/api/groups/getAllGroups", {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });
  
      if (!response.ok) {
        throw new Error("Failed to fetch groups");
      }
  
      const data = await response.json();
      setGroups(data);
    } catch (error) {
      setError(error.message);
      console.error("Error fetching groups:", error);
    }
  };
    const fetchUsers = async () => {
      const token = localStorage.getItem("token");
      try {
        const response = await fetch("http://localhost:5000/api/users/getAll", {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}`,
          },
        }); if (!response.ok) {
            throw new Error("Failed to fetch users");
          }
    
          const data = await response.json();
          setUsers(data); // Met à jour la liste des utilisateurs
        } catch (error) {
          console.error("Error fetching users:", error);
        }
      };
      useEffect(() => {
    fetchGroups();
    fetchUsers();
  }, []); // Lancer la requête uniquement au montage du composant
  useEffect(() => {
    if (groups.length > 0) fetchUsers();
  }, [groups]);

  // ✅ Fonction pour rafraîchir les groupes
  const refreshGroups = async () => {
    console.log("🔄 Rafraîchissement des groupes...");
    await fetchGroups();
  };
  // Logique de pagination
  const indexOfLastGroup = currentPage * groupsPerPage;
  const indexOfFirstGroup = indexOfLastGroup - groupsPerPage;
  const currentGroups = groups.slice(indexOfFirstGroup, indexOfLastGroup);

  // Fonction pour ouvrir la modale de mise à jour avec les informations du groupe
  const handleEditGroup = (group) => {
    setGroupToUpdate(group); // Stocker le groupe sélectionné
    setUpdatedGroupName(group.name); // Initialiser le champ du nom du groupe à mettre à jour
    setSelectedMembers(group.members.map((member) => member._id)); // Initialiser les membres sélectionnés
    setShowUpdateModal(true); // Ouvrir la modale de mise à jour
  };

  // Fonction pour fermer la modale de mise à jour
  const closeUpdateModal = () => {
    setShowUpdateModal(false);
    setUpdatedGroupName(""); // Réinitialiser le champ
    setGroupToUpdate(null); // Réinitialiser les données du groupe
    setSelectedMembers([]); // Réinitialiser les membres sélectionnés
  };

  // Fonction pour mettre à jour le groupe
  const handleUpdateGroup = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    if (!token || !groupToUpdate) {
      setError("Group or token is missing.");
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/groups/updateGroup/${groupToUpdate._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: updatedGroupName, // Nouveau nom du groupe
          members: selectedMembers, // Membres sélectionnés
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update group");
      }

      // Récupérer le groupe mis à jour depuis le backend
      const updatedGroup = await response.json();

      // Mettre à jour localement le groupe dans l'état
      setGroups((prevGroups) =>
        prevGroups.map((group) =>
          group._id === updatedGroup._id ? updatedGroup : group
        )
      );

      // Fermer la modale après la mise à jour
      closeUpdateModal();
      await refreshGroups();
    } catch (error) {
      setError(error.message);
      console.error("Error updating group:", error);
    }
  };

  // Fonction pour supprimer un groupe
  const handleDeleteGroup = async (groupId) => {
    if (window.confirm("Are you sure you want to delete this group? This action cannot be undone.")) {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(`http://localhost:5000/api/groups/deleteGroup/${groupId}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to delete group");
        }

        // Remove group from state
        setGroups((prevGroups) => prevGroups.filter((group) => group._id !== groupId));
      } catch (error) {
        console.error("Error deleting group:", error);
      }
    }
  };

  // Logique pour la pagination
  const handleNextPage = () => {
    if (currentPage < Math.ceil(groups.length / groupsPerPage)) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  return (
    <LayoutTutor>
    <div className="container mt-5">
      <h1 className="text-center mb-4">Groups List</h1>

      {error && <p style={{ color: "red" }}>{error}</p>}

      {/* Groups Display */}
      <div className="row">
  {currentGroups.length === 0 ? (
    <div className="col-12 text-center">No groups found.</div>
  ) : (
    currentGroups.map((group) => (
      <div className="col-md-4 col-12 mb-4" key={group._id}>
        <div className="card shadow-sm">
          <div className="card-body">
            <h5 className="card-title">
              <strong>Name:</strong> {group.name}
            </h5>

            {/* Section Membres */}
            <p className="card-text">
              <strong>Members:</strong>
              <ul>
                {group.members.map((member) => (
                  <li key={member._id}>
                    {member.name}
                    {member.skills?.length > 0 && (
                      <div>
                        <small>Skills: 
                          {member.skills.map((skill, i) => (
                            <span key={i} className="badge bg-secondary me-1">{skill}</span>
                          ))}
                        </small>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            </p>

            {/* Nouvelle section pour les sujets assignés */}
            <p className="card-text mt-3">
              <strong>Assigned Subjects:</strong>
              {group.assignedSubjects?.length > 0 ? (
                <ul className="mt-2">
                  {group.assignedSubjects.map(subject => (
                    <li key={subject._id}>
                      <strong>{subject.title}</strong>
                      <p className="small text-muted mb-1">{subject.description}</p>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-muted">No subjects assigned</div>
              )}
            </p>

            {/* Boutons existants */}
            <div className="d-flex justify-content-between mt-3">
              <button
                className="btn btn-outline-primary"
                onClick={() => handleEditGroup(group)}
              >
                <FaEdit /> Update
              </button>
              <button
                className="btn btn-outline-danger"
                onClick={() => handleDeleteGroup(group._id)}
              >
                <FaTrashAlt /> Delete
              </button>
            </div>
          </div>
        </div>
      </div>
    ))
  )}
</div>

      {/* Pagination Controls */}
      <div className="d-flex justify-content-center my-4">
        <button className="btn btn-outline-secondary me-2" onClick={handlePrevPage} disabled={currentPage === 1}>
          Previous
        </button>
        <button
          className="btn btn-outline-secondary"
          onClick={handleNextPage}
          disabled={currentPage >= Math.ceil(groups.length / groupsPerPage)}
        >
          Next
        </button>
      </div>

      {/* Update Group Modal */}
      {showUpdateModal && (
        <div className="modal show" style={{ display: "block" }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Update Group</h5>
                <button type="button" className="close" onClick={closeUpdateModal}>
                  &times;
                </button>
              </div>
              <div className="modal-body">
                <form onSubmit={handleUpdateGroup}>
                  <div className="form-group">
                    <label htmlFor="groupName">Group Name</label>
                    <input
                      type="text"
                      className="form-control"
                      id="groupName"
                      value={updatedGroupName}
                      onChange={(e) => setUpdatedGroupName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="members">Select Members</label>
                    <div>
                      {users.map((user) => (
                        <div key={user._id}>
                          <input
                            type="checkbox"
                            checked={selectedMembers.includes(user._id)}
                            onChange={() => {
                              setSelectedMembers((prevMembers) =>
                                prevMembers.includes(user._id)
                                  ? prevMembers.filter((id) => id !== user._id)
                                  : [...prevMembers, user._id]
                              );
                            }}
                          />
                          <span>{user.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <button type="submit" className="btn btn-primary mt-3">
                    Update Group
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
    </LayoutTutor>
  );
};

export default GroupList;
