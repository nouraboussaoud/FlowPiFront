import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaCheck, FaTimes, FaSpinner, FaQuestionCircle } from "react-icons/fa";
import "./Tasks.css";

const QuizModal = ({ quiz, taskId, onClose, onSubmit }) => {
  const [answers, setAnswers] = useState({});
  const [results, setResults] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [autoCloseTimer, setAutoCloseTimer] = useState(null);
  const [alreadyPassed, setAlreadyPassed] = useState(false);

  // Effect to auto-close the modal after showing results
  useEffect(() => {
    if (results) {
      // Set a timer to close the modal after 5 seconds
      const timer = setTimeout(() => {
        onClose();
      }, 5000); // 5 seconds
      
      setAutoCloseTimer(timer);
      
      // Clear the timer if the component unmounts or results change
      return () => {
        if (autoCloseTimer) clearTimeout(autoCloseTimer);
      };
    }
  }, [results, onClose]);

  const handleAnswerChange = (questionId, answer) => {
    setAnswers({
      ...answers,
      [questionId]: answer,
    });
  };

  const handleSubmit = async () => {
    // Check if all questions are answered
    const unansweredQuestions = quiz.questions.filter(
      (q, index) => !answers[index]
    );

    if (unansweredQuestions.length > 0) {
      setError(`Please answer all questions before submitting.`);
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      const token = localStorage.getItem("token");
      if (!token) {
        setError("No token found. Please login.");
        return;
      }

      // Log the data being sent for debugging
      console.log("Submitting quiz with data:", {
        taskId: quiz.taskId,
        quizId: quiz.quizId,
        answers: answers
      });

      // Make sure we're sending all the required data in the format expected by the backend
      const response = await axios.post(
        `http://localhost:5000/api/tasks/submitQuiz/${quiz.quizId}`,
        { 
          taskId: quiz.taskId,
          quizId: parseInt(quiz.quizId), // Ensure quizId is a number
          answers: answers 
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      console.log("Quiz submission response:", response.data);
      
      // Handle the case where the student has already passed a quiz
      if (response.data.alreadyPassed) {
        setAlreadyPassed(true);
        setResults({
          score: 100,
          passed: true,
          alreadyPassed: true,
          results: []
        });
        
        // If the component expects a callback
        if (onSubmit) {
          onSubmit({
            alreadyPassed: true,
            passed: true,
            score: 100
          });
        }
        return;
      }
      
      setResults(response.data);
      
      // If the component expects a progress update
      if (onSubmit) {
        onSubmit(response.data);
      }
    } catch (error) {
      console.error("Error submitting quiz:", error);
      // More detailed error logging
      if (error.response) {
        console.error("Error response data:", error.response.data);
        console.error("Error response status:", error.response.status);
        if (error.response.status === 403 && error.response.data.alreadyPassed) {
          setAlreadyPassed(true);
          setResults({
            score: 100,
            passed: true,
            alreadyPassed: true,
            results: []
          });
          return;
        }
        setError(
          error.response.data.message || "Error submitting quiz. Please try again."
        );
      } else if (error.request) {
        console.error("Error request:", error.request);
        setError("No response received from server. Please check your connection.");
      } else {
        console.error("Error message:", error.message);
        setError("Error submitting quiz. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Function to handle manual close and clear any timers
  const handleClose = () => {
    if (autoCloseTimer) clearTimeout(autoCloseTimer);
    onClose();
  };

  return (
    <>
      <div className="modal-header">
        <h2 className="modal-title">
          {results ? (
            <>
              <FaCheck style={{ color: results.score >= 70 ? '#10b981' : '#ef4444' }} />
              Quiz Results
            </>
          ) : (
            <>
              <FaQuestionCircle style={{ color: '#4a6cf7' }} />
              Task Knowledge Quiz
            </>
          )}
        </h2>
        <button className="close-button" onClick={handleClose}>
          ×
        </button>
      </div>
      <div className="modal-body">
        {error && (
          <div className="error-message" style={{
            backgroundColor: '#fee2e2',
            color: '#b91c1c',
            padding: '12px',
            borderRadius: '8px',
            marginBottom: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <FaTimes />
            {error}
          </div>
        )}
        
        {alreadyPassed ? (
          <div className="already-passed-message" style={{
            backgroundColor: '#f0fdf4',
            borderLeft: '4px solid #10b981',
            padding: '16px',
            borderRadius: '8px',
            marginBottom: '24px',
            textAlign: 'center'
          }}>
            <h3 style={{
              fontSize: '20px',
              color: '#10b981',
              marginBottom: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}>
              <FaCheck />
              Already Passed
            </h3>
            <p style={{ fontSize: '16px', marginBottom: '12px' }}>
              You have already passed a quiz for this task. No further quiz attempts are allowed.
            </p>
            <p className="auto-close-message" style={{
              fontStyle: 'italic',
              color: '#6b7280',
              marginTop: '16px',
              fontSize: '14px'
            }}>
              This window will close automatically in a few seconds...
            </p>
          </div>
        ) : !results ? (
          <>
            <div className="quiz-intro" style={{
              backgroundColor: '#f0f7ff',
              borderLeft: '4px solid #4a6cf7',
              padding: '16px',
              borderRadius: '8px',
              marginBottom: '24px'
            }}>
              <p style={{ margin: 0 }}>
                This quiz will test your understanding of the task. Answer all questions
                to demonstrate your knowledge.
              </p>
            </div>
            {quiz.questions.map((question, index) => (
              <div key={index} className="quiz-question" style={{
                backgroundColor: '#f8fafc',
                padding: '20px',
                borderRadius: '10px',
                marginBottom: '20px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
              }}>
                <h3 style={{
                  fontSize: '17px',
                  fontWeight: '600',
                  color: '#334155',
                  marginBottom: '16px'
                }}>
                  Question {index + 1}: {question.question}
                </h3>
                <div className="quiz-options" style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px'
                }}>
                  {question.options.map((option, optIndex) => (
                    <label key={optIndex} className="quiz-option" style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      padding: '12px',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      backgroundColor: answers[index] === option ? '#e0e7ff' : '#fff',
                      border: `1px solid ${answers[index] === option ? '#818cf8' : '#e2e8f0'}`,
                    }}>
                      <input
                        type="radio"
                        name={`question-${index}`}
                        value={option}
                        checked={answers[index] === option}
                        onChange={() => handleAnswerChange(index, option)}
                        style={{ marginRight: '12px', marginTop: '3px' }}
                      />
                      <span>{option}</span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </>
        ) : (
          <div className="quiz-results">
            <div className="result-summary" style={{
              backgroundColor: results.score >= 70 ? '#f0fdf4' : '#fef2f2',
              borderRadius: '10px',
              padding: '20px',
              marginBottom: '24px',
              textAlign: 'center',
              borderLeft: `4px solid ${results.score >= 70 ? '#10b981' : '#ef4444'}`
            }}>
              <h3 style={{
                fontSize: '24px',
                marginBottom: '12px',
                color: results.score >= 70 ? '#10b981' : '#ef4444',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}>
                {results.alreadyPassed ? (
                  <>
                    <FaCheck />
                    Quiz Already Passed
                  </>
                ) : (
                  <>
                    {results.score >= 70 ? <FaCheck /> : <FaTimes />}
                    Your Score: {results.score}/100
                  </>
                )}
              </h3>
              <p style={{ fontSize: '16px', marginBottom: '12px' }}>
                {results.alreadyPassed
                  ? "You have already passed a quiz for this task. No further quiz attempts are needed."
                  : results.score >= 70
                    ? "Congratulations! You passed the quiz."
                    : "You didn't pass the quiz. Review the task details and try again."}
              </p>
              {results.progressPercentage && (
                <p style={{ 
                  fontSize: '16px', 
                  backgroundColor: '#f0f7ff', 
                  padding: '8px 16px',
                  borderRadius: '6px',
                  display: 'inline-block'
                }}>
                  Task progress has been updated to {results.progressPercentage}%.
                </p>
              )}
              <p className="auto-close-message" style={{
                fontStyle: 'italic',
                color: '#6b7280',
                marginTop: '16px',
                fontSize: '14px'
              }}>
                This window will close automatically in a few seconds...
              </p>
            </div>
            
            <h3 style={{ 
              fontSize: '18px', 
              marginBottom: '16px',
              color: '#334155',
              borderBottom: '1px solid #e2e8f0',
              paddingBottom: '8px'
            }}>
              Question Results:
            </h3>
            {results.results.map((result, index) => (
              <div
                key={index}
                className={`result-item ${result.isCorrect ? "correct" : "incorrect"}`}
                style={{
                  backgroundColor: result.isCorrect ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                  borderLeft: `4px solid ${result.isCorrect ? '#10b981' : '#ef4444'}`,
                  padding: '16px',
                  borderRadius: '8px',
                  marginBottom: '16px'
                }}
              >
                <h4 style={{ 
                  fontSize: '16px', 
                  marginBottom: '12px',
                  color: '#334155',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  {result.isCorrect ? <FaCheck style={{ color: '#10b981' }} /> : <FaTimes style={{ color: '#ef4444' }} />}
                  Question {index + 1}: {result.question}
                </h4>
                <p style={{ marginBottom: '8px' }}>
                  Your answer: <strong>{result.studentAnswer}</strong>
                </p>
                {!result.isCorrect && (
                  <p style={{ marginBottom: '8px', color: '#10b981' }}>
                    Correct answer: <strong>{result.correctAnswer}</strong>
                  </p>
                )}
                <p className="explanation" style={{
                  backgroundColor: '#f8fafc',
                  padding: '12px',
                  borderRadius: '6px',
                  fontSize: '14px',
                  color: '#4b5563'
                }}>
                  {result.explanation}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="modal-footer">
        {!results && !alreadyPassed ? (
          <>
            <button className="button button-default" onClick={handleClose}>
              Cancel
            </button>
            <button
              className="button button-primary"
              onClick={handleSubmit}
              disabled={isSubmitting}
              style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              {isSubmitting ? (
                <>
                  <FaSpinner className="spinner" style={{ animation: 'spin 1s linear infinite' }} />
                  Submitting...
                </>
              ) : (
                "Submit Answers"
              )}
            </button>
          </>
        ) : (
          <button className="button button-default" onClick={handleClose}>
            Close
          </button>
        )}
      </div>
    </>
  );
};

export default QuizModal;