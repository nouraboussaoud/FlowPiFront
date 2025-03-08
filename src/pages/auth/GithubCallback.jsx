import React, { useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const GitHubCallback = () => {
    const navigate = useNavigate();

    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');

        if (code) {
            // Send the code to the backend
            axios.post('http://localhost:5000/api/users/auth/github', { code })
                .then((response) => {
                    const { jwtToken, user } = response.data;
                    console.log('JWT Token:', jwtToken);
                    console.log('User Data:', user);

                    // Store the JWT token in localStorage or cookies
                    localStorage.setItem('token', jwtToken);
                    console.log('Github Connected Successfully');

                    // Redirect to the dashboard or home page
                    navigate('/home');
                })
                .catch((error) => {
                    console.error('Error during GitHub OAuth:', error);
                    navigate('/loginGithub');
                });
        } else {
            navigate('/loginGithub');
        }
    }, [navigate]);

    return <div>Loading...</div>;
};

export default GitHubCallback;