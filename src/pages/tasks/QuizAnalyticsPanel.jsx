import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BarChart2, X, Award, AlertCircle, GitBranch, Code, Bot } from 'lucide-react';
import './Tasks.css';

const QuizAnalyticsPanel = ({ taskId, onClose, githubInfo: propGithubInfo }) => {
  const [analytics, setAnalytics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [githubInfo, setGithubInfo] = useState(propGithubInfo || null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setError('No token found. Please login.');
          setLoading(false);
          return;
        }

        const response = await axios.get(
          `http://localhost:5000/api/tasks/quizAnalytics/${taskId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        // Log the full response for debugging
        console.log('Full API Response:', response.data);

        // Ensure we have proper user information in the analytics
        const processedAnalytics = response.data.analytics.map(quiz => ({
          ...quiz,
          attempts: quiz.attempts.map(attempt => ({
            ...attempt,
            username: attempt.username || attempt.email || 'Unknown Student'
          }))
        }));

        // Only extract githubInfo if not provided via props
        if (!propGithubInfo) {
          let extractedGithubInfo = null;
          if (response.data.githubInfo) {
            extractedGithubInfo = response.data.githubInfo;
          } else if (response.data.task && response.data.task.githubInfo) {
            extractedGithubInfo = response.data.task.githubInfo;
          } else if (response.data.task) {
            // Fallback: Construct githubInfo from task fields if available
            const task = response.data.task;
            if (task.repoOwner || task.repoName || task.commitSha || task.branchName) {
              console.log('Constructing githubInfo from task fields:', task);
              extractedGithubInfo = {
                repoOwner: task.repoOwner || 'Unknown',
                repoName: task.repoName || 'Unknown',
                commitSha: task.commitSha || task.branchName ,
                branch: task.branchName 
              };
            }
          }
          
          if (extractedGithubInfo) {
            setGithubInfo(extractedGithubInfo);
          }
        }

        setAnalytics(processedAnalytics || []);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching quiz analytics:', error);
        setError(error.response?.data?.message || 'Error fetching quiz analytics');
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [taskId, propGithubInfo]);

  // Log githubInfo changes
  useEffect(() => {
    console.log('Current githubInfo state:', githubInfo);
  }, [githubInfo]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  const getScoreColor = (score) => {
    if (score >= 80) return '#10b981'; // Green
    if (score >= 60) return '#f59e0b'; // Yellow
    return '#ef4444'; // Red
  };

  // Helper function to check if githubInfo is valid for rendering
  const hasValidGithubInfo = (info) => {
    return info && info.repoOwner && info.repoName;
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content analytics-panel"
        onClick={(e) => e.stopPropagation()}
        style={{
          backgroundColor: 'white',
          color: '#1f2937',
          maxWidth: '900px',
          width: '90%',
          maxHeight: '90vh',
          overflow: 'auto',
          borderRadius: '12px',
          boxShadow: '0 10px 25px rgba(0, 0, 0, 0.15)'
        }}
      >
        <div
          className="modal-header"
          style={{
            backgroundColor: '#f8fafc',
            borderBottom: '1px solid #edf2f7',
            padding: '16px 24px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >
          <h2
            className="modal-title"
            style={{
              margin: 0,
              fontSize: '1.5rem',
              fontWeight: '600',
              color: '#1f2937',
              display: 'flex',
              alignItems: '/emcenter',
              gap: '8px'
            }}
          >
            <BarChart2 size={20} className="me-2" />
            Quiz Analytics
          </h2>
          <button
            className="close-button"
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '1.5rem',
              cursor: 'pointer',
              color: '#6b7280'
            }}
          >
            <X size={20} />
          </button>
        </div>

        {loading ? (
          <div
            className="loading-container"
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '40px',
              backgroundColor: 'white'
            }}
          >
            <div className="spinner"></div>
            <p style={{ color: '#6b7280', marginTop: '16px' }}>Loading analytics...</p>
          </div>
        ) : error ? (
          <div
            className="error-message"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '24px',
              color: '#ef4444',
              backgroundColor: 'white'
            }}
          >
            <AlertCircle size={20} />
            <p>{error}</p>
          </div>
        ) : analytics.length === 0 ? (
          <div
            className="empty-state"
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center job',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '40px',
              color: '#6b7280',
              backgroundColor: 'white'
            }}
          >
            <Award size={48} color="#9ca3af" />
            <p>No quiz attempts found for this task.</p>
          </div>
        ) : (
          <div
            className="analytics-content"
            style={{
              padding: '24px',
              backgroundColor: 'white'
            }}
          >
            {selectedQuiz ? (
              <div className="quiz-details" style={{ backgroundColor: 'white' }}>
                <button
                  className="back-button"
                  onClick={() => setSelectedQuiz(null)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    background: 'none',
                    border: 'none',
                    color: '#4a6cf7',
                    fontWeight: '500',
                    padding: '8px 0',
                    marginBottom: '16px',
                    cursor: 'pointer'
                  }}
                >
                  ← Back to all quizzes
                </button>
                {/* GitHub Info Section */}
                {hasValidGithubInfo(githubInfo) ? (
                  <div
                    style={{
                      backgroundColor: 'white',
                      padding: '16px',
                      borderRadius: '8px',
                      marginBottom: '24px',
                      border: '1px solid #e5e7eb'
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        marginBottom: '16px'
                      }}
                    >
                      <GitBranch size={18} color="#4b5563" />
                      <h3
                        style={{
                          fontSize: '1.1rem',
                          fontWeight: '600',
                          margin: 0,
                          color: '#1f2937'
                        }}
                      >
                        Quiz Source
                      </h3>
                    </div>
                    <div
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '16px'
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px'
                        }}
                      >
                        <Code size={16} color="#4b5563" />
                        <span style={{ fontSize: '0.9rem' }}>
                          Repository:{' '}
                          <strong>
                            {githubInfo.repoOwner}/{githubInfo.repoName}
                          </strong>
                        </span>
                      </div>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px'
                        }}
                      >
                        <GitBranch size={16} color="#4b5563" />
                        <span style={{ fontSize: '0.9rem' }}>
                          Branch/Commit:{' '}
                          <strong>
                            {githubInfo.commitSha || githubInfo.branch }
                          </strong>
                        </span>
                      </div>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          marginTop: '8px',
                          padding: '12px',
                          backgroundColor: '#f0f9ff',
                          borderRadius: '6px',
                          border: '1px solid #bfdbfe'
                        }}
                      >
                        <Bot size={16} color="#3b82f6" />
                        <span
                          style={{ fontSize: '0.9rem', color: '#1e40af' }}
                        >
                          Questions were automatically generated from code changes
                          using AI analysis
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div
                    style={{
                      backgroundColor: '#f8fafc',
                      padding: '16px',
                      borderRadius: '8px',
                      marginBottom: '24px',
                      border: '1px solid #e5e7eb',
                      color: '#6b7280'
                    }}
                  >
                    <p>No GitHub information available for this task.</p>
                  </div>
                )}
                <h3
                  style={{
                    fontSize: '20px',
                    fontWeight: '600',
                    marginBottom: '16px',
                    color: '#1f2937',
                    borderBottom: '1px solid #e5e7eb',
                    paddingBottom: '8px'
                  }}
                >
                  Quiz Attempt Details
                </h3>
                <div
                  className="attempt-info"
                  style={{
                    backgroundColor: '#f8fafc',
                    padding: '16px',
                    borderRadius: '8px',
                    marginBottom: '24px'
                  }}
                >
                  <p>
                    <strong>Student:</strong> {selectedQuiz.username}
                  </p>
                  <p>
                    <strong>Date:</strong> {formatDate(selectedQuiz.completedAt)}
                  </p>
                  <p>
                    <strong>Score:</strong>{' '}
                    <span style={{ color: getScoreColor(selectedQuiz.score) }}>
                      {selectedQuiz.score}%
                    </span>
                  </p>
                  <p>
                    <strong>Status:</strong>{' '}
                    {selectedQuiz.passed ? (
                      <span className="passed-badge">Passed</span>
                    ) : (
                      <span className="failed-badge">Failed</span>
                    )}
                  </p>
                </div>
                <h4
                  style={{
                    fontSize: '18px',
                    fontWeight: '600',
                    marginBottom: '16px',
                    color: '#374151'
                  }}
                >
                  Question Results
                </h4>
                {selectedQuiz.results && selectedQuiz.results.length > 0 ? (
                  <div className="question-results" style={{ backgroundColor: 'white' }}>
                    {selectedQuiz.results.map((result, index) => (
                      <div
                        key={index}
                        className={`result-item ${result.isCorrect ? 'correct' : 'incorrect'}`}
                        style={{
                          padding: '16px',
                          borderRadius: '8px',
                          marginBottom: '16px',
                          position: 'relative',
                          backgroundColor: result.isCorrect
                            ? 'rgba(16, 185, 129, 0.1)'
                            : 'rgba(239, 68, 68, 0.1)',
                          borderLeft: `4px solid ${result.isCorrect ? '#10b981' : '#ef4444'}`
                        }}
                      >
                        <p
                          className="question-text"
                          style={{ color: '#1f2937', fontWeight: '500' }}
                        >
                          {result.question}
                        </p>
                        <div
                          className="answer-details"
                          style={{
                            backgroundColor: 'rgba(255, 255, 255, 0.7)',
                            padding: '12px',
                            borderRadius: '6px',
                            marginBottom: '12px',
                            borderLeft: `3px solid ${result.isCorrect ? '#10b981' : '#ef4444'}`
                          }}
                        >
                          <p>
                            <strong>Student's Answer:</strong> {result.studentAnswer}
                          </p>
                          {!result.isCorrect && (
                            <p>
                              <strong>Correct Answer:</strong> {result.correctAnswer}
                            </p>
                          )}
                        </div>
                        {result.explanation && (
                          <div
                            className="explanation"
                            style={{
                              backgroundColor: '#f8fafc',
                              padding: '12px',
                              borderRadius: '6px',
                              fontStyle: 'italic',
                              color: '#4b5563',
                              borderLeft: '3px solid #9ca3af'
                            }}
                          >
                            <p>
                              <strong>Explanation:</strong> {result.explanation}
                            </p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p style={{ color: '#6b7280' }}>
                    No detailed results available for this attempt.
                  </p>
                )}
              </div>
            ) : (
              <>
                <h3
                  style={{
                    fontSize: '20px',
                    fontWeight: '600',
                    marginBottom: '16px',
                    color: '#1f2937',
                    borderBottom: '1px solid #e5e7eb',
                    paddingBottom: '8px'
                  }}
                >
                  Quiz Attempts
                </h3>
                {/* GitHub Info Section */}
                {hasValidGithubInfo(githubInfo) ? (
                  <div
                    style={{
                      backgroundColor: 'white',
                      padding: '16px',
                      borderRadius: '8px',
                      marginBottom: '24px',
                      border: '1px solid #e5e7eb'
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        marginBottom: '16px'
                      }}
                    >
                      <GitBranch size={18} color="#4b5563" />
                      <h3
                        style={{
                          fontSize: '1.1rem',
                          fontWeight: '600',
                          margin: 0,
                          color: '#1f2937'
                        }}
                      >
                        Quiz Source
                      </h3>
                    </div>
                    <div
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '16px'
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px'
                        }}
                      >
                        <Code size={16} color="#4b5563" />
                        <span style={{ fontSize: '0.9rem' }}>
                          Repository:{' '}
                          <strong>
                            {githubInfo.repoOwner}/{githubInfo.repoName}
                          </strong>
                        </span>
                      </div>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px'
                        }}
                      >
                        <GitBranch size={16} color="#4b5563" />
                        <span style={{ fontSize: '0.9rem' }}>
                          Branch/Commit:{' '}
                          <strong>
                            {githubInfo.commitSha || githubInfo.branch || 'main'}
                          </strong>
                        </span>
                      </div>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          marginTop: '8px',
                          padding: '12px',
                          backgroundColor: '#f0f9ff',
                          borderRadius: '6px',
                          border: '1px solid #bfdbfe'
                        }}
                      >
                        <Bot size={16} color="#3b82f6" />
                        <span
                          style={{ fontSize: '0.9rem', color: '#1e40af' }}
                        >
                          Questions were automatically generated from code changes
                          using AI analysis
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div
                    style={{
                      backgroundColor: '#f8fafc',
                      padding: '16px',
                      borderRadius: '8px',
                      marginBottom: '24px',
                      border: '1px solid #e5e7eb',
                      color: '#6b7280'
                    }}
                  >
                    <p>No GitHub information available for this task.</p>
                  </div>
                )}
                <div className="attempts-list" style={{ backgroundColor: 'white' }}>
                  {analytics.flatMap(quiz =>
                    quiz.attempts.map((attempt, index) => (
                      <div
                        key={`${quiz.quizId}-${index}`}
                        className="attempt-card"
                        onClick={() => setSelectedQuiz(attempt)}
                        style={{
                          backgroundColor: '#ffffff',
                          borderRadius: '8px',
                          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                          padding: '16px',
                          marginBottom: '16px',
                          cursor: 'pointer',
                          transition: 'transform 0.2s, box-shadow 0.2s',
                          border: '1px solid #e5e7eb'
                        }}
                        onMouseOver={(e) => {
                          e.currentTarget.style.transform = 'translateY(-2px)';
                          e.currentTarget.style.boxShadow =
                            '0 4px 6px rgba(0, 0, 0, 0.1)';
                        }}
                        onMouseOut={(e) => {
                          e.currentTarget.style.transform = 'translateY(0)';
                          e.currentTarget.style.boxShadow =
                            '0 1px 3px rgba(0, 0, 0, 0.1)';
                        }}
                      >
                        <div
                          className="attempt-header"
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: '12px'
                          }}
                        >
                          <span
                            className="attempt-date"
                            style={{
                              fontSize: '14px',
                              color: '#6b7280'
                            }}
                          >
                            {formatDate(attempt.completedAt)}
                          </span>
                          {attempt.passed ? (
                            <span className="passed-badge">Passed</span>
                          ) : (
                            <span className="failed-badge">Failed</span>
                          )}
                        </div>
                        <div className="attempt-body">
                          <p
                            className="student-name"
                            style={{
                              fontWeight: '600',
                              fontSize: '16px',
                              marginBottom: '8px',
                              color: '#1f2937'
                            }}
                          >
                            {attempt.username}
                          </p>
                          <div className="score-container">
                            <div className="score-bar-container">
                              <div
                                className="score-bar"
                                style={{
                                  width: `${attempt.score}%`,
                                  backgroundColor: getScoreColor(attempt.score)
                                }}
                              ></div>
                            </div>
                            <span
                              className="score-value"
                              style={{ color: getScoreColor(attempt.score) }}
                            >
                              {attempt.score}%
                            </span>
                          </div>
                        </div>
                        <div
                          className="attempt-footer"
                          style={{
                            marginTop: '12px',
                            textAlign: 'right'
                          }}
                        >
                          <button
                            className="view-details-button"
                            style={{
                              backgroundColor: '#f3f4f6',
                              color: '#4b5563',
                              border: 'none',
                              padding: '6px 12px',
                              borderRadius: '6px',
                              fontSize: '14px',
                              fontWeight: '500',
                              cursor: 'pointer'
                            }}
                          >
                            View Details
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default QuizAnalyticsPanel;
