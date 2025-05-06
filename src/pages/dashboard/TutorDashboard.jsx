import React from 'react'
import UsersTable from '../tutor-interfaces/UsersTable';
import { useNavigate, useLocation } from "react-router-dom";
import { useEffect } from 'react';

import LayoutTutorss from './LayoutTutorss';
import LayoutTutor from './LayoutTutor';
function TutorDashboard(){
    const location = useLocation();
    const navigate = useNavigate();
    
   
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const token = queryParams.get('token');
    const userParam = queryParams.get('user');

    if (token && userParam) {
      try {
        const userData = JSON.parse(decodeURIComponent(userParam));
        
        // Stocker le token et les données utilisateur dans sessionStorage (effacé à la fermeture du navigateur)
        sessionStorage.setItem('token', token);
        sessionStorage.setItem('userData', JSON.stringify(userData));

        // Supprimer les paramètres de l'URL sans recharger la page
        navigate(location.pathname, { replace: true });
      } catch (error) {
        console.error("Error decoding user data:", error);
        navigate("/login?error=invalid_auth_data");
      }
    } else {
      // Si aucun token n'est trouvé, vérifier s'il est déjà en sessionStorage
      const storedToken = sessionStorage.getItem('token');
      if (!storedToken) {
        navigate("/login?error=no_auth_data");
      }
    }
  }, [location, navigate]);
    
    return (
        <div>
      

          <LayoutTutorss >
          <LayoutTutor />
          <UsersTable />
          </LayoutTutorss>
        </div>
      );

}
export default TutorDashboard;