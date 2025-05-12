import React from "react";
import { X, GitBranch, Code, Bot } from "lucide-react";
import "./QuizHistoryModal.css";

const QuizHistoryModal = ({ history, onClose, githubInfo }) => {
  // Calculate analytics
  const totalAttempts = history.length;
  const passedAttempts = history.filter(attempt => attempt.passed).length;
  const passRate = totalAttempts > 0 ? ((passedAttempts / totalAttempts) * 100).toFixed(1) : 0;

  // Calculate average score
  const totalScore = history.reduce((sum, attempt) => sum + attempt.score, 0);
  const averageScore = totalAttempts > 0 ? (totalScore / totalAttempts).toFixed(1) : 0;

  // Calculate correct answers
  const correctAnswers = history.length > 0 && history[0].results
    ? history.reduce((sum, attempt) => {
      return sum + attempt.results.filter(result => result.isCorrect).length;
    }, 0)
    : 0;

  const totalQuestions = history.length > 0 && history[0].results
    ? history.reduce((sum, attempt) => sum + attempt.results.length, 0)
    : 0;

  const accuracy = totalQuestions > 0
    ? ((correctAnswers / totalQuestions) * 100).toFixed(1)
    : 0;

  return (
    <>
      <div style={{
        backgroundColor: '#f8fafc',
        borderBottom: '1px solid #e5e7eb',
        padding: '16px 24px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderRadius: '12px 12px 0 0'
      }}>
        <h2 style={{
          margin: 0,
          fontSize: '1.5rem',
          fontWeight: '600',
          color: '#1f2937'
        }}>
          Quiz History & Analytics
        </h2>
        <button
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: '#6b7280',
            fontSize: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '4px'
          }}
        >
          <X size={24} />
        </button>
      </div>

      <div style={{
        padding: '24px',
        backgroundColor: 'white',
        color: '#1f2937'
      }}>
        {/* GitHub Info Section - Only show if githubInfo is provided */}
        {githubInfo && (
          <div style={{
            backgroundColor: '#f8fafc',
            padding: '16px',
            borderRadius: '8px',
            marginBottom: '24px',
            border: '1px solid #e5e7eb'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '8px'
            }}>
              <GitBranch size={18} color="#4b5563" />
              <h3 style={{
                fontSize: '1.1rem',
                fontWeight: '600',
                margin: 0,
                color: '#1f2937'
              }}>
                Quiz Source
              </h3>
            </div>

            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '8px'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <Code size={16} color="#4b5563" />
                <span style={{ fontSize: '0.9rem' }}>
                  Repository: <strong>{githubInfo.repoOwner}/{githubInfo.repoName}</strong>
                </span>
              </div>

              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                
              </div>

              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginTop: '8px',
                padding: '8px',
                backgroundColor: '#f0f9ff',
                borderRadius: '6px',
                border: '1px solid #bfdbfe'
              }}>
                <Bot size={16} color="#3b82f6" />
                <span style={{ fontSize: '0.9rem', color: '#1e40af' }}>
                  Questions were automatically generated from code changes using AI analysis
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Analytics Section */}
        <div style={{
          backgroundColor: 'white',
          marginBottom: '24px'
        }}>
          <h3 style={{
            fontSize: '1.25rem',
            fontWeight: '600',
            marginBottom: '16px',
            color: '#1f2937'
          }}>
            Analytics
          </h3>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '16px',
            backgroundColor: 'white'
          }}>
            {/* Total Attempts */}
            <div style={{
              backgroundColor: 'white',
              padding: '16px',
              borderRadius: '8px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              textAlign: 'center'
            }}>
              <p style={{
                color: '#6b7280',
                fontSize: '0.875rem',
                marginBottom: '8px'
              }}>
                Total Attempts
              </p>
              <h4 style={{
                color: '#1f2937',
                fontSize: '1.5rem',
                fontWeight: '700',
                margin: 0
              }}>
                {totalAttempts}
              </h4>
            </div>

            {/* Passed Attempts */}
            <div style={{
              backgroundColor: 'white',
              padding: '16px',
              borderRadius: '8px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              textAlign: 'center'
            }}>
              <p style={{
                color: '#6b7280',
                fontSize: '0.875rem',
                marginBottom: '8px'
              }}>
                Passed Attempts
              </p>
              <h4 style={{
                color: '#1f2937',
                fontSize: '1.5rem',
                fontWeight: '700',
                margin: 0
              }}>
                {passedAttempts}
              </h4>
            </div>

            {/* Pass Rate */}
            <div style={{
              backgroundColor: 'white',
              padding: '16px',
              borderRadius: '8px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              textAlign: 'center'
            }}>
              <p style={{
                color: '#6b7280',
                fontSize: '0.875rem',
                marginBottom: '8px'
              }}>
                Pass Rate
              </p>
              <h4 style={{
                color: '#1f2937',
                fontSize: '1.5rem',
                fontWeight: '700',
                margin: 0
              }}>
                {passRate}%
              </h4>
            </div>

            {/* Average Score */}
            <div style={{
              backgroundColor: 'white',
              padding: '16px',
              borderRadius: '8px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              textAlign: 'center'
            }}>
              <p style={{
                color: '#6b7280',
                fontSize: '0.875rem',
                marginBottom: '8px'
              }}>
                Average Score
              </p>
              <h4 style={{
                color: '#1f2937',
                fontSize: '1.5rem',
                fontWeight: '700',
                margin: 0
              }}>
                {averageScore}/100
              </h4>
            </div>

            {/* Correct Answers */}
            <div style={{
              backgroundColor: 'white',
              padding: '16px',
              borderRadius: '8px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              textAlign: 'center'
            }}>
              <p style={{
                color: '#6b7280',
                fontSize: '0.875rem',
                marginBottom: '8px'
              }}>
                Correct Answers
              </p>
              <h4 style={{
                color: '#1f2937',
                fontSize: '1.5rem',
                fontWeight: '700',
                margin: 0
              }}>
                {correctAnswers} / {totalQuestions}
              </h4>
            </div>

            {/* Accuracy */}
            <div style={{
              backgroundColor: 'white',
              padding: '16px',
              borderRadius: '8px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              textAlign: 'center'
            }}>
              <p style={{
                color: '#6b7280',
                fontSize: '0.875rem',
                marginBottom: '8px'
              }}>
                Accuracy
              </p>
              <h4 style={{
                color: '#1f2937',
                fontSize: '1.5rem',
                fontWeight: '700',
                margin: 0
              }}>
                {accuracy}%
              </h4>
            </div>
          </div>
        </div>

        {/* Attempt History Section */}
        <div style={{
          backgroundColor: 'white',
          color: '#1f2937'
        }}>
          <h3 style={{
            fontSize: '1.25rem',
            fontWeight: '600',
            marginBottom: '16px',
            color: '#1f2937'
          }}>
            Attempt History
          </h3>

          {history.length === 0 ? (
            <div style={{
              backgroundColor: 'white',
              padding: '24px',
              textAlign: 'center',
              color: '#6b7280',
              borderRadius: '8px',
              border: '1px dashed #d1d5db'
            }}>
              No quiz attempts found.
            </div>
          ) : (
            history.map((attempt, index) => (
              <div key={index} style={{
                backgroundColor: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                marginBottom: '16px',
                overflow: 'hidden'
              }}>
                <div style={{
                  backgroundColor: 'white',
                  padding: '16px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  borderBottom: '1px solid #e5e7eb'
                }}>
                  <div style={{
                    backgroundColor: 'white',
                    color: '#1f2937',
                    fontWeight: '600'
                  }}>
                    Attempt #{history.length - index}
                  </div>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    backgroundColor: 'white'
                  }}>
                    <div style={{
                      color: '#6b7280',
                      fontSize: '0.875rem',
                      backgroundColor: 'white'
                    }}>
                      {new Date(attempt.completedAt).toLocaleString()}
                    </div>
                    <div style={{
                      backgroundColor: attempt.passed ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                      color: attempt.passed ? '#10b981' : '#ef4444',
                      padding: '4px 12px',
                      borderRadius: '9999px',
                      fontSize: '0.75rem',
                      fontWeight: '600'
                    }}>
                      {attempt.passed ? 'Passed' : 'Failed'}
                    </div>
                  </div>
                </div>

                <div style={{
                  backgroundColor: 'white',
                  padding: '16px',
                  borderBottom: '1px solid #e5e7eb'
                }}>
                  <div style={{
                    backgroundColor: 'white',
                    color: '#1f2937',
                    fontWeight: '600',
                    marginBottom: '8px'
                  }}>
                    Score: {attempt.score}/100
                  </div>
                </div>

                {attempt.results && attempt.results.length > 0 && (
                  <div style={{
                    backgroundColor: 'white',
                    padding: '16px'
                  }}>
                    <div style={{
                      backgroundColor: 'white',
                      color: '#1f2937',
                      fontWeight: '600',
                      marginBottom: '12px'
                    }}>
                      Question Details:
                    </div>

                    {attempt.results.map((result, qIndex) => (
                      <div key={qIndex} style={{
                        backgroundColor: 'white',
                        padding: '12px',
                        border: '1px solid #e5e7eb',
                        borderRadius: '6px',
                        marginBottom: '12px',
                        borderLeft: `4px solid ${result.isCorrect ? '#10b981' : '#ef4444'}`
                      }}>
                        <div style={{
                          backgroundColor: 'white',
                          color: '#1f2937',
                          marginBottom: '8px',
                          fontWeight: '500'
                        }}>
                          {result.question}
                        </div>

                        <div style={{
                          backgroundColor: result.isCorrect ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                          padding: '8px',
                          borderRadius: '6px',
                          marginBottom: '8px'
                        }}>
                          <div style={{
                            display: 'flex',
                            alignItems: 'flex-start',
                            gap: '8px',
                            backgroundColor: 'transparent'
                          }}>
                            <div style={{
                              color: result.isCorrect ? '#10b981' : '#ef4444',
                              fontWeight: '600',
                              backgroundColor: 'transparent'
                            }}>
                              {result.isCorrect ? '✓' : '✗'}
                            </div>
                            <div style={{
                              backgroundColor: 'transparent',
                              width: '100%'
                            }}>
                              <div style={{
                                color: result.isCorrect ? '#10b981' : '#ef4444',
                                marginBottom: '4px',
                                fontWeight: '500',
                                backgroundColor: 'transparent'
                              }}>
                                <strong>Your answer:</strong> {result.studentAnswer}
                              </div>

                              {!result.isCorrect && (
                                <div style={{
                                  color: '#10b981',
                                  backgroundColor: 'transparent',
                                  fontWeight: '500'
                                }}>
                                  <strong>Correct answer:</strong> {result.correctAnswer}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        {result.explanation && (
                          <div style={{
                            backgroundColor: '#f8fafc',
                            padding: '10px',
                            borderRadius: '6px',
                            borderLeft: '3px solid #9ca3af',
                            marginTop: '8px'
                          }}>
                            <div style={{
                              fontWeight: '500',
                              marginBottom: '4px',
                              color: '#4b5563',
                              backgroundColor: 'transparent'
                            }}>
                              Explanation:
                            </div>
                            <div style={{
                              color: result.isCorrect ? '#10b981' : '#ef4444',
                              backgroundColor: 'transparent',
                              fontSize: '0.9rem'
                            }}>
                              {result.explanation}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
};

export default QuizHistoryModal;
