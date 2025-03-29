import React, { useState, useEffect } from 'react';
import { FaTimes, FaCheck } from 'react-icons/fa'; // Icône de croix et de coche
import { toast, ToastContainer } from 'react-toastify'; // Pour afficher des toasts
import 'react-toastify/dist/ReactToastify.css'; // Importer le style de Toastify
import DashboardLayout from './DashboardLayout';

const GroupList = () => {
  const [userGroups, setUserGroups] = useState([]); // Groupes disponibles pour l'utilisateur connecté
  const [currentUser, setCurrentUser] = useState(null); // Utilisateur connecté
  const [error, setError] = useState(''); // Pour gérer les erreurs
  const [loading, setLoading] = useState(true); // Pour gérer le chargement
  const [acceptedGroups, setAcceptedGroups] = useState([]); // Suivi des groupes acceptés par l'utilisateur

  // Fonction pour récupérer les groupes de l'utilisateur connecté
  const fetchUserGroups = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setError('Token is missing. Please login.');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/groups/my-groups', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error('Failed to fetch user groups');

      const data = await response.json(); // Récupérer les groupes de l'utilisateur
      setUserGroups(data); // Sauvegarder les groupes dans l'état
    } catch (error) {
      setError(error.message);
      console.error('Error fetching user groups:', error);
    } finally {
      setLoading(false); // Fin du chargement
    }
  };

  // Fonction pour gérer l'acceptation de l'invitation
  const handleAcceptInvitation = (groupId) => {
    // Affichage du toast de confirmation de l'acceptation
    toast.success('You have successfully joined the group!');

    // Ajouter le groupe à la liste des groupes acceptés
    setAcceptedGroups((prev) => {
      const updatedAcceptedGroups = [...prev, groupId];
      // Persister dans le localStorage
      localStorage.setItem('acceptedGroups', JSON.stringify(updatedAcceptedGroups));
      return updatedAcceptedGroups;
    });

    // Retirer le groupe de la liste des invitations
    setUserGroups((prevGroups) => prevGroups.filter((group) => group._id !== groupId));
  };

  // Fonction pour gérer le rejet de l'invitation
  const handleRejectInvitation = async (groupId) => {
    if (window.confirm('Are you sure you want to reject this invitation?')) {
      const token = localStorage.getItem('token');

      try {
        const response = await fetch(`http://localhost:5000/api/groups/${groupId}/reject-invitation`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) throw new Error('Failed to reject invitation.');

        // Mettre à jour l'état local en filtrant le groupe rejeté
        setUserGroups((prevGroups) => prevGroups.filter((group) => group._id !== groupId));

        toast.success('Invitation rejected successfully');

      } catch (error) {
        setError(error.message);
        console.error('Error rejecting invitation:', error);
        toast.error('Error rejecting invitation');
      }
    }
  };

  useEffect(() => {
    // Récupérer l'utilisateur connecté
    const token = localStorage.getItem('token');
    if (token) {
      const fetchCurrentUser = async () => {
        const response = await fetch('http://localhost:5000/api/users/current', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        const userData = await response.json();
        setCurrentUser(userData);
      };
      fetchCurrentUser();
    }

    // Charger les groupes acceptés depuis le localStorage
    const storedAcceptedGroups = JSON.parse(localStorage.getItem('acceptedGroups')) || [];
    setAcceptedGroups(storedAcceptedGroups);

    fetchUserGroups();
  }, []);

  return (
    <DashboardLayout>
      <div className="container mt-5">
        <div>
          <p style={styles.title}>Invitation List for Groups</p>

          {/* Ajoutez ici le reste de votre contenu */}
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
          <div className="alert alert-info text-center">You are not a member of any groups yet.</div>
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
                          <li key={member._id} className={`list-group-item ${member._id === currentUser?._id ? 'bg-light' : ''}`}>
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
                      {/* Les boutons "Accept Invitation" et "Reject Invitation" */}
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
                      {/* Si l'invitation est acceptée, les boutons disparaissent */}
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
      </div>

      {/* Affichage du toast */}
      <ToastContainer />
    </DashboardLayout>
  );
};

const styles = {
  title: {
    fontSize: "24px",
    fontWeight: "bold",
    color: "#000",
    textAlign: "center",
    padding: "10px 0",
    borderBottom: "2px solid #000",
    marginBottom: "20px",
  },
  acceptButton: {
    borderRadius: "20px", // Bordures arrondies
    padding: "8px 20px", // Espacement interne
    transition: "background-color 0.3s ease, transform 0.3s ease", // Animation lors du survol
  },
  rejectButton: {
    borderRadius: "20px", // Bordures arrondies
    padding: "8px 20px", // Espacement interne
    transition: "background-color 0.3s ease, transform 0.3s ease", // Animation lors du survol
  },
};

export default GroupList;
