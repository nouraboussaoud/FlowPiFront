import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

function AuthSuccess() {
  const navigate = useNavigate();
  const location = useLocation();
  const [message, setMessage] = useState('Authentication successful! Redirecting...');
  
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get('token');
    const userId = params.get('userId');
    const role = params.get('role');
    const error = params.get('error');
    
    if (error) {
      setMessage(`Authentication failed: ${error}`);
      // Redirect to login after a delay
      setTimeout(() => navigate('/login'), 3000);
      return;
    }
    
    if (!token) {
      setMessage('No authentication token received. Redirecting to login...');
      // Redirect to login after a delay
      setTimeout(() => navigate('/login'), 2000);
      return;
    }
    
    // Save auth data
    localStorage.setItem('token', token);
    localStorage.setItem('userId', userId);
    localStorage.setItem('userRole', role);
    
    // Log success
    console.log('Authentication successful, token saved');
    
    // Redirect to dashboard
    setTimeout(() => navigate('/dashboard'), 1500);
  }, [location, navigate]);
  
  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md text-center">
        <h2 className="text-2xl mb-4 font-semibold text-gray-800">{message}</h2>
        <div className="animate-spin h-8 w-8 border-4 border-blue-500 rounded-full border-t-transparent mx-auto"></div>
      </div>
    </div>
  );
}

export default AuthSuccess;