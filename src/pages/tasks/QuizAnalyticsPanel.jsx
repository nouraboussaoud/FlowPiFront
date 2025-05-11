import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BarChart2, X, Award, AlertCircle } from 'lucide-react';
import './Tasks.css';

const QuizAnalyticsPanel = ({ taskId, onClose }) => {
  const [analytics, setAnalytics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedQuiz, setSelectedQuiz] = useState(null);

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

        setAnalytics(response.data.analytics || []);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching quiz analytics:', error);
        setError(error.response?.data?.message || 'Error fetching quiz analytics');
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [taskId]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  const getScoreColor = (score) => {
    if (score >= 80) return '#10b981'; // Green
    if (score >= 60) return '#f59e0b'; // Yellow
    return '#ef4444'; // Red
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content analytics-panel" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">
            <BarChart2 size={20} className="me-2" />
            Quiz Analytics
          </h2>
          <button className="close-button" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {loading ? (
          <div className="loading-container">
            <div className="spinner"></div>
            <p>Loading analytics...</p>
          </div>
        ) : error ? (
          <div className="error-message">
            <AlertCircle size={20} />
            <p>{error}</p>
          </div>
        ) : analytics.length === 0 ? (
          <div className="empty-state">
            <Award size={48} color="#9ca3af" />
            <p>No quiz attempts found for this task.</p>
          </div>
        ) : (
          <div className="analytics-content">
            {selectedQuiz ? (
              <div className="quiz-details">
                <button 
                  className="back-button"
                  onClick={() => setSelectedQuiz(null)}
                >
                  ← Back to all quizzes
                </button>
                
                <h3>Quiz Attempt Details</h3>
                <div className="attempt-info">
                  <p><strong>Student:</strong> {selectedQuiz.username}</p>
                  <p><strong>Date:</strong> {formatDate(selectedQuiz.completedAt)}</p>
                  <p><strong>Score:</strong> <span style={{ color: getScoreColor(selectedQuiz.score) }}>{selectedQuiz.score}%</span></p>
                  <p><strong>Status:</strong> {selectedQuiz.passed ? 
                    <span className="passed-badge">Passed</span> : 
                    <span className="failed-badge">Failed</span>}
                  </p>
                </div>
                
                <h4>Question Results</h4>
                {selectedQuiz.results && selectedQuiz.results.length > 0 ? (
                  <div className="question-results">
                    {selectedQuiz.results.map((result, index) => (
                      <div 
                        key={index} 
                        className={`result-item ${result.isCorrect ? 'correct' : 'incorrect'}`}
                      >
                        <p className="question-text">{result.question}</p>
                        <div className="answer-details">
                          <p><strong>Student's Answer:</strong> {result.studentAnswer}</p>
                          {!result.isCorrect && (
                            <p><strong>Correct Answer:</strong> {result.correctAnswer}</p>
                          )}
                        </div>
                        {result.explanation && (
                          <div className="explanation">
                            <p><strong>Explanation:</strong> {result.explanation}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p>No detailed results available for this attempt.</p>
                )}
              </div>
            ) : (
              <>
                <h3>Quiz Attempts</h3>
                <div className="attempts-list">
                  {analytics.flatMap(quiz => 
                    quiz.attempts.map((attempt, index) => (
                      <div 
                        key={`${quiz.quizId}-${index}`} 
                        className="attempt-card"
                        onClick={() => setSelectedQuiz(attempt)}
                      >
                        <div className="attempt-header">
                          <span className="attempt-date">{formatDate(attempt.completedAt)}</span>
                          {attempt.passed ? 
                            <span className="passed-badge">Passed</span> : 
                            <span className="failed-badge">Failed</span>}
                        </div>
                        <div className="attempt-body">
                          <p className="student-name">{attempt.username}</p>
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
                            <span className="score-value" style={{ color: getScoreColor(attempt.score) }}>
                              {attempt.score}%
                            </span>
                          </div>
                        </div>
                        <div className="attempt-footer">
                          <button className="view-details-button">View Details</button>
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