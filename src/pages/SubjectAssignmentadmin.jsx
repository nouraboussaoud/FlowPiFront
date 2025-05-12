import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import DashboardLayout from "./DashboardLayout";

const SubjectAssignmentadmin = () => {
  const navigate = useNavigate();
  
  const [state, setState] = useState({
    loading: false,
    threshold: 0.15,
    maxGroups: 3,
    autoAssign: false,
    results: null,
    error: null,
    stats: null,
    lastUpdated: null
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setState(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : type === 'number' ? parseFloat(value) : value
    }));
  };

  const refreshData = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.get('http://localhost:5000/api/subject/getAllSubjects', {
        headers: { Authorization: `Bearer ${token}` },
        params: { timestamp: state.lastUpdated }
      });
      
      setState(prev => ({
        ...prev,
        lastUpdated: new Date().getTime()
      }));
    } catch (error) {
      console.error("Refresh error:", error);
    }
  };

  const handleAssign = async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        throw new Error('Authentication token missing');
      }

      const { data } = await axios.get('http://localhost:5000/api/subject/assign', {
        params: {
          threshold: state.threshold,
          maxGroups: state.maxGroups,
          auto: state.autoAssign
        },
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (data?.success) {
        if (state.autoAssign) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
  
        setState(prev => ({
          ...prev,
          loading: false,
          results: data.assignments || [],
          stats: {
            ...data.stats,
            assignmentsCount: data.assignments?.length || 0,
            averageScore: data.assignments?.length 
              ? (data.assignments.reduce((sum, item) => sum + (item.score || 0), 0) / data.assignments.length)
              : 0
          },
          lastUpdated: data.timestamp
        }));
  
        if (state.autoAssign) {
          setTimeout(async () => {
            await refreshData();
            toast.success("Assignments updated successfully");
          }, 1500);
        } else {
          toast.success(`Found ${data.assignments?.length || 0} potential matches`);
        }
      }
    } catch (error) {
      console.error('Error:', error);
      const errorMessage = error.response?.data?.message || 
                          error.message || 
                          'Unknown error during assignment';
      
      setState(prev => ({
        ...prev,
        error: errorMessage,
        loading: false,
        results: []
      }));
      
      if (error.response?.status === 401) {
        toast.error('Session expired - Please log in again');
        navigate('/login');
      } else {
        toast.error(errorMessage);
      }
    }
  };

  const getScoreColor = (score) => {
    if (score > 0.7) return '#28a745'; // Green
    if (score > 0.4) return '#ffc107'; // Yellow
    return '#dc3545'; // Red
  };

  return (
    <DashboardLayout title="Subject Assignment Admin">
        <br></br>
        <br></br>
        <br></br>
        <br></br>
        <br></br>
      <div className="container py-4">
        <div className="card shadow-sm">
          <div className="card-header" style={{ backgroundColor: '#374151', color: 'white' }}>
          <h2 className="mb-0 text-white">
              <i className="bi bi-diagram-3 me-2"></i>
              Subject to Group Assignment
            </h2>
          </div>
          
          <div className="card-body">
            <div className="row mb-4">
              <div className="col-md-4">
                <div className="mb-3">
                  <label className="form-label">Matching threshold (0-1)</label>
                  <input
                    type="number"
                    name="threshold"
                    min="0"
                    max="1"
                    step="0.05"
                    className="form-control"
                    value={state.threshold}
                    onChange={handleChange}
                    style={{ borderColor: '#d1d5db' }}
                  />
                  <small className="text-muted">
                    Higher value = stricter matching (recommended: 0.15-0.3)
                  </small>
                </div>
              </div>
              
              <div className="col-md-4">
                <div className="mb-3">
                  <label className="form-label">Max groups per subject</label>
                  <input
                    type="number"
                    name="maxGroups"
                    min="1"
                    max="10"
                    className="form-control"
                    value={state.maxGroups}
                    onChange={handleChange}
                    style={{ borderColor: '#d1d5db' }}
                  />
                </div>
              </div>
              
              <div className="col-md-4">
                <div className="form-check form-switch mt-4 pt-2">
                  <input
                    type="checkbox"
                    name="autoAssign"
                    className="form-check-input"
                    checked={state.autoAssign}
                    onChange={handleChange}
                    id="autoAssignSwitch"
                    style={{ borderColor: '#d1d5db' }}
                  />
                  <label className="form-check-label" htmlFor="autoAssignSwitch">
                    Auto assignment
                  </label>
                  <small className="d-block text-muted">
                    {state.autoAssign 
                      ? "Groups will be automatically assigned" 
                      : "Only analysis will be performed"}
                  </small>
                </div>
              </div>
            </div>

            <div className="d-flex justify-content-between align-items-center mb-3">
              <button
                onClick={handleAssign}
                className="btn"
                disabled={state.loading}
                style={{ 
                  backgroundColor: '#4b5563',
                  color: 'white',
                  border: 'none'
                }}
              >
                {state.loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2"></span>
                    Processing...
                  </>
                ) : (
                  <>
                    <i className={`bi ${state.autoAssign ? 'bi-robot' : 'bi-search'} me-2`}></i>
                    {state.autoAssign ? 'Execute assignment' : 'Analyze matches'}
                  </>
                )}
              </button>

              {state.stats && (
                <div className="text-end">
                  <small className="text-muted">
                    Groups: {state.stats.totalGroups} | 
                    Subjects: {state.stats.totalSubjects} | 
                    Users: {state.stats.totalUsers}
                  </small>
                </div>
              )}
            </div>

            {state.error && (
              <div className="alert" style={{ backgroundColor: '#f8d7da', color: '#721c24', borderColor: '#f5c6cb' }}>
                <i className="bi bi-exclamation-triangle me-2"></i>
                {state.error}
              </div>
            )}

            {state.results && state.results.length > 0 ? (
              <div className="mt-4">
                <div className="card mb-4">
                  <div className="card-header" style={{ backgroundColor: '#f3f4f6' }}>
                    <h5 className="mb-0">
                      <i className="bi bi-list-check me-2"></i>
                      Detailed Results
                    </h5>
                  </div>
                  <div className="card-body p-0">
                    <div className="table-responsive">
                      <table className="table table-hover mb-0">
                        <thead style={{ backgroundColor: '#f9fafb' }}>
                          <tr>
                            <th style={{ width: '25%' }}>Subject</th>
                            <th style={{ width: '20%' }}>Group</th>
                            <th style={{ width: '10%' }}>Score</th>
                            <th style={{ width: '30%' }}>Skills</th>
                            <th style={{ width: '15%' }}>Members</th>
                          </tr>
                        </thead>
                        <tbody>
                          {state.results.map((item, index) => (
                            <tr key={index}>
                              <td>
                                <strong>{item.subjectTitle}</strong>
                                <div className="text-muted small text-truncate" style={{ maxWidth: '200px' }}>
                                  {item.subjectDescription}
                                </div>
                              </td>
                              <td>{item.groupName}</td>
                              <td>
                                <span 
                                  className="badge" 
                                  style={{ 
                                    backgroundColor: getScoreColor(item.score),
                                    color: item.score > 0.4 ? '#212529' : 'white'
                                  }}
                                >
                                  {item.score?.toFixed(2)}
                                </span>
                              </td>
                              <td>
                                {item.skills?.length > 0 ? (
                                  <div className="d-flex flex-wrap gap-1">
                                    {item.skills.map((skill, i) => (
                                      <span key={i} className="badge" style={{ backgroundColor: '#e5e7eb', color: '#374151' }}>
                                        {skill}
                                      </span>
                                    ))}
                                  </div>
                                ) : (
                                  <span className="text-muted small">None</span>
                                )}
                              </td>
                              <td>
                                <div className="d-flex flex-column">
                                  {item.members?.slice(0, 3).map((member, i) => (
                                    <span key={i} className="small">
                                      {member}
                                    </span>
                                  ))}
                                  {item.members?.length > 3 && (
                                    <span className="small text-muted">
                                      +{item.members.length - 3} more
                                    </span>
                                  )}
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

                <div className="alert" style={{ backgroundColor: '#e5e7eb', color: '#374151' }}>
                  <div className="row">
                    <div className="col-md-4">
                      <div className="d-flex justify-content-between">
                        <span>Matches:</span>
                        <strong>{state.results.length}</strong>
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="d-flex justify-content-between">
                        <span>Average score:</span>
                        <strong>{state.stats.averageScore?.toFixed(2) || '0.00'}</strong>
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="d-flex justify-content-between">
                        <span>Threshold used:</span>
                        <strong>{state.threshold}</strong>
                      </div>
                    </div>
                  </div>
                </div>

                {state.autoAssign && (
                  <div className="alert" style={{ backgroundColor: '#d1fae5', color: '#065f46' }}>
                    <i className="bi bi-check-circle-fill me-2"></i>
                    Groups have been automatically assigned to subjects in the database.
                  </div>
                )}
              </div>
            ) : state.results && state.results.length === 0 ? (
              <div className="alert" style={{ backgroundColor: '#e5e7eb', color: '#374151' }}>
                No matches found with current criteria
              </div>
            ) : null}
          </div>
        </div>
      </div>
      </DashboardLayout>
  );
};

export default SubjectAssignmentadmin;