import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import LayoutTutorss from './dashboard/LayoutTutorss';
import { toast } from 'sonner';

const TeamFormationSuggestions = () => {
  const { projectId } = useParams();
  const [project, setProject] = useState(null);
  const [suggestedTeams, setSuggestedTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [teamSizeParams, setTeamSizeParams] = useState({
    minTeamSize: 2,
    maxTeamSize: 4
  });

  
  useEffect(() => {
    const fetchProjectDetails = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('Authentication token not found');
        }

        const response = await axios.get(
          `http://localhost:5000/api/projects/projects/${projectId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        setProject(response.data);
      } catch (err) {
        console.error('Error fetching project details:', err);
        setError(err.message || 'Failed to load project details');
        toast.error('Failed to load project details');
      }
    };

    fetchProjectDetails();
  }, [projectId]);

  useEffect(() => {
    if (project) {
      fetchTeamSuggestions();
    }
  }, [project, teamSizeParams]);

  const fetchTeamSuggestions = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication token not found');
      }

      const response = await axios.post(
        `http://localhost:5000/api/ai/suggest-teams/${projectId}`,
        teamSizeParams,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setSuggestedTeams(response.data.suggestedTeams || []);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching team suggestions:', err);
      setError(err.message || 'Failed to load team suggestions');
      setLoading(false);
      toast.error('Failed to load team suggestions');
    }
  };

  const handleTeamSizeChange = (e) => {
    const { name, value } = e.target;
    setTeamSizeParams(prev => ({
      ...prev,
      [name]: parseInt(value, 10)
    }));
  };

  const renderTeamDynamics = (dynamics) => {
    const dynamicLabels = {
      skillDiversity: 'Skill Diversity',
      learningStyleDiversity: 'Learning Style Diversity',
      workPatternBalance: 'Work Pattern Balance',
      scheduleCompatibility: 'Schedule Compatibility',
      overallBalance: 'Overall Team Balance'
    };

    return (
      <div className="team-dynamics">
        {Object.entries(dynamics).map(([key, value]) => (
          <div key={key} className="dynamic-item">
            <div className="dynamic-label">{dynamicLabels[key]}</div>
            <div className="dynamic-bar-container">
              <div 
                className="dynamic-bar" 
                style={{ width: `${value}%`, backgroundColor: getColorForPercentage(value) }}
              ></div>
              <span className="dynamic-value">{value}%</span>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const getColorForPercentage = (percentage) => {
    if (percentage >= 80) return '#4CAF50'; // Green
    if (percentage >= 60) return '#8BC34A'; // Light Green
    if (percentage >= 40) return '#FFC107'; // Amber
    if (percentage >= 20) return '#FF9800'; // Orange
    return '#F44336'; // Red
  };

  if (loading && !project) {
    return (
      <LayoutTutorss>
        <div className="container mt-4">
          <div className="text-center p-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-3">Loading project details...</p>
          </div>
        </div>
      </LayoutTutorss>
    );
  }

  if (error && !project) {
    return (
      <LayoutTutorss>
        <div className="container mt-4">
          <div className="alert alert-danger" role="alert">
            <h4 className="alert-heading">Error!</h4>
            <p>{error}</p>
            <hr />
            <p className="mb-0">Please try again later or contact support.</p>
          </div>
        </div>
      </LayoutTutorss>
    );
  }

  return (
    <LayoutTutorss>
      <div className="container mt-4">
        <div className="row mb-4">
          <div className="col">
            <h1 className="display-5 fw-bold">Team Formation Suggestions</h1>
            {project && (
              <p className="lead">
                Optimized team suggestions for project: <strong>{project.name}</strong>
              </p>
            )}
          </div>
        </div>

        <div className="row mb-4">
          <div className="col-md-6">
            <div className="card shadow-sm">
              <div className="card-header">
                <h5 className="mb-0">Team Size Parameters</h5>
              </div>
              <div className="card-body">
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label htmlFor="minTeamSize" className="form-label">Minimum Team Size</label>
                    <input
                      type="number"
                      className="form-control"
                      id="minTeamSize"
                      name="minTeamSize"
                      min="2"
                      max="10"
                      value={teamSizeParams.minTeamSize}
                      onChange={handleTeamSizeChange}
                    />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label htmlFor="maxTeamSize" className="form-label">Maximum Team Size</label>
                    <input
                      type="number"
                      className="form-control"
                      id="maxTeamSize"
                      name="maxTeamSize"
                      min="2"
                      max="10"
                      value={teamSizeParams.maxTeamSize}
                      onChange={handleTeamSizeChange}
                    />
                  </div>
                </div>
                <button 
                  className="btn btn-primary w-100" 
                  onClick={fetchTeamSuggestions}
                  disabled={loading}
                >
                  {loading ? 'Generating Teams...' : 'Generate Team Suggestions'}
                </button>
              </div>
            </div>
          </div>
          {project && (
            <div className="col-md-6">
              <div className="card shadow-sm h-100">
                <div className="card-header">
                  <h5 className="mb-0">Project Details</h5>
                </div>
                <div className="card-body">
                  <h6>{project.name}</h6>
                  <p>{project.description}</p>
                  {project.group && (
                    <div>
                      <strong>Group:</strong> {project.group.name}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {loading && project ? (
          <div className="text-center p-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-3">Analyzing student profiles and generating optimal teams...</p>
          </div>
        ) : error ? (
          <div className="alert alert-danger" role="alert">
            <h4 className="alert-heading">Error!</h4>
            <p>{error}</p>
          </div>
        ) : suggestedTeams.length === 0 ? (
          <div className="alert alert-info" role="alert">
            <h4 className="alert-heading">No team suggestions available</h4>
            <p>
              We couldn't generate team suggestions. This might be due to insufficient student data
              or not enough students available for the project.
            </p>
          </div>
        ) : (
          <div className="row">
            {suggestedTeams.map((team, index) => (
              <div key={index} className="col-md-6 mb-4">
                <div className="card shadow-sm">
                  <div className="card-header bg-primary text-white">
                    <h5 className="mb-0">Team {index + 1}</h5>
                  </div>
                  <div className="card-body">
                    <h6 className="mb-3">Team Members:</h6>
                    <ul className="list-group mb-4">
                      {team.members.map(member => (
                        <li key={member.id} className="list-group-item d-flex justify-content-between align-items-center">
                          <div>
                            <strong>{member.name}</strong>
                            <div className="text-muted small">{member.email}</div>
                          </div>
                          <div>
                            {member.skills && member.skills.slice(0, 3).map(skill => (
                              <span key={skill} className="badge bg-secondary me-1">{skill}</span>
                            ))}
                          </div>
                        </li>
                      ))}
                    </ul>
                    
                    <h6 className="mb-3">Team Dynamics:</h6>
                    {renderTeamDynamics(team.teamDynamics)}
                  </div>
                  <div className="card-footer bg-transparent d-flex justify-content-end">
                    <button className="btn btn-outline-primary me-2">Modify Team</button>
                    <button className="btn btn-success">Approve Team</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <style>
        {`
          .team-dynamics {
            margin-top: 1rem;
          }
          .dynamic-item {
            margin-bottom: 0.75rem;
          }
          .dynamic-label {
            font-size: 0.875rem;
            margin-bottom: 0.25rem;
            color: #6c757d;
          }
          .dynamic-bar-container {
            height: 0.5rem;
            background-color: #e9ecef;
            border-radius: 0.25rem;
            position: relative;
            overflow: hidden;
          }
          .dynamic-bar {
            height: 100%;
            border-radius: 0.25rem;
            transition: width 0.5s ease;
          }
          .dynamic-value {
            position: absolute;
            right: 0;
            top: -1.25rem;
            font-size: 0.75rem;
            font-weight: bold;
          }
        `}
      </style>
    </LayoutTutorss>
  );
};

export default TeamFormationSuggestions;
