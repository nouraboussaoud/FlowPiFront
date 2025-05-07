import React, { useState, useEffect } from 'react';
import axios from 'axios';
import LayoutStudent from './dashboard/LayoutStudent';
import { toast } from 'sonner';

const ProjectRecommendations = () => {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('Authentication token not found');
        }

        // Try to get user ID from localStorage first
        let userId = null;
        const userString = localStorage.getItem('user');
        
        if (userString) {
          try {
            const userData = JSON.parse(userString);
            userId = userData.userId || userData._id;
          } catch (e) {
            console.error('Error parsing user data from localStorage:', e);
          }
        }

        // If userId is still not found, fetch current user from API
        if (!userId) {
          console.log('User ID not found in localStorage, fetching current user...');
          const currentUserResponse = await axios.get(
            'http://localhost:5000/api/users/current',
            { headers: { Authorization: `Bearer ${token}` } }
          );
          
          if (currentUserResponse.data && (currentUserResponse.data._id || currentUserResponse.data.userId)) {
            userId = currentUserResponse.data._id || currentUserResponse.data.userId;
            
            // Update localStorage with the fetched user data
            localStorage.setItem('user', JSON.stringify(currentUserResponse.data));
          } else {
            throw new Error('Could not determine user ID from API response');
          }
        }

        if (!userId) {
          throw new Error('Could not determine user ID');
        }

        console.log('Fetching recommendations for user:', userId);
        
        const response = await axios.get(
          `http://localhost:5000/api/ai/recommend-projects/${userId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        setRecommendations(response.data.recommendations || []);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching project recommendations:', err);
        setError(err.message || 'Failed to load recommendations');
        setLoading(false);
        toast.error('Failed to load project recommendations');
      }
    };

    fetchRecommendations();
  }, []);

  // Function to render match factor bars
  const renderMatchFactors = (factors) => {
    const factorLabels = {
      learningStyle: 'Learning Style',
      complexityFit: 'Complexity Fit',
      collaborationFit: 'Collaboration',
      timeCommitment: 'Time Commitment',
      interestAlignment: 'Interest Alignment'
    };

    return (
      <div className="match-factors">
        {Object.entries(factors).map(([key, value]) => (
          <div key={key} className="factor-item">
            <div className="factor-label">{factorLabels[key]}</div>
            <div className="factor-bar-container">
              <div 
                className="factor-bar" 
                style={{ width: `${value}%`, backgroundColor: getColorForPercentage(value) }}
              ></div>
              <span className="factor-value">{value}%</span>
            </div>
          </div>
        ))}
      </div>
    );
  };

  // Function to get color based on percentage
  const getColorForPercentage = (percentage) => {
    if (percentage >= 80) return '#4CAF50'; // Green
    if (percentage >= 60) return '#8BC34A'; // Light Green
    if (percentage >= 40) return '#FFC107'; // Amber
    if (percentage >= 20) return '#FF9800'; // Orange
    return '#F44336'; // Red
  };

  if (loading) {
    return (
      <LayoutStudent>
        <div className="container mt-4">
          <div className="text-center p-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-3">Finding the perfect projects for you...</p>
          </div>
        </div>
      </LayoutStudent>
    );
  }

  if (error) {
    return (
      <LayoutStudent>
        <div className="container mt-4">
          <div className="alert alert-danger" role="alert">
            <h4 className="alert-heading">Error!</h4>
            <p>{error}</p>
            <hr />
            <p className="mb-0">Please try again later or contact support.</p>
          </div>
        </div>
      </LayoutStudent>
    );
  }

  return (
    <LayoutStudent>
      <div className="container mt-4">
        <div className="row mb-4">
          <div className="col">
            <h1 className="display-5 fw-bold">Project Recommendations</h1>
            <p className="lead">
              Based on your skills, learning style, and past performance, we've found these projects that might be a great fit for you.
            </p>
          </div>
        </div>

        {recommendations.length === 0 ? (
          <div className="alert alert-info" role="alert">
            <h4 className="alert-heading">No recommendations yet!</h4>
            <p>
              We don't have enough data to make personalized recommendations yet. 
              Complete more tasks and deliverables to help us understand your preferences better.
            </p>
          </div>
        ) : (
          <div className="row">
            {recommendations.map((rec, index) => (
              <div key={rec.projectId} className="col-md-6 mb-4">
                <div className="card h-100 shadow-sm">
                  <div className="card-header d-flex justify-content-between align-items-center">
                    <h5 className="mb-0">{rec.title}</h5>
                    <span 
                      className="badge rounded-pill" 
                      style={{ 
                        backgroundColor: getColorForPercentage(rec.matchScore),
                        fontSize: '1rem',
                        padding: '0.5rem 1rem'
                      }}
                    >
                      {rec.matchScore}% Match
                    </span>
                  </div>
                  <div className="card-body">
                    <p className="card-text">{rec.description}</p>
                    <h6 className="mt-4 mb-3">Match Factors:</h6>
                    {renderMatchFactors(rec.matchFactors)}
                  </div>
                  <div className="card-footer bg-transparent d-flex justify-content-end">
                    <button className="btn btn-outline-primary me-2">View Details</button>
                    <button className="btn btn-primary">Express Interest</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <style>
        {`
          .match-factors {
            margin-top: 1rem;
          }
          .factor-item {
            margin-bottom: 0.75rem;
          }
          .factor-label {
            font-size: 0.875rem;
            margin-bottom: 0.25rem;
            color: #6c757d;
          }
          .factor-bar-container {
            height: 0.5rem;
            background-color: #e9ecef;
            border-radius: 0.25rem;
            position: relative;
            overflow: hidden;
          }
          .factor-bar {
            height: 100%;
            border-radius: 0.25rem;
            transition: width 0.5s ease;
          }
          .factor-value {
            position: absolute;
            right: 0;
            top: -1.25rem;
            font-size: 0.75rem;
            font-weight: bold;
          }
        `}
      </style>
    </LayoutStudent>
  );
};

export default ProjectRecommendations;


