import React, { useState } from 'react';
import './ToolsRightSideBar.css'; // Import your CSS file for styling

const ToolsRightSideBar = ({ deliverable, checklist = {}, rubric, codeSnippet, reportUrl, onCheckPlagiarism }) => {
  const [notes, setNotes] = useState('');
  const [rubricScores, setRubricScores] = useState(
    rubric.reduce((acc, criterion) => ({ ...acc, [criterion.name]: 0 }), {})
  );

  const handleRubricChange = (e, criterion) => {
    const { value } = e.target;
    setRubricScores((prev) => ({ ...prev, [criterion.name]: value }));
  };

  const handlePlagiarismCheck = () => {
    onCheckPlagiarism(deliverable);
  };

  return (
    <div className="tools-sidebar">
      <h4>Evaluation Tools</h4>
      <div className="tools-section">
        <h5>Deliverable Status</h5>
        <p>
          <strong>Status:</strong>{' '}
          {deliverable.status === 'pending'
            ? 'Pending Evaluation'
            : deliverable.status === 'evaluated'
            ? 'Evaluated'
            : 'Rejected'}
        </p>
      </div>
      <div className="tools-section">
        <h5>Quick Links</h5>
        <ul>
          <li>
            <a href={deliverable.github_commit_url} target="_blank" rel="noopener noreferrer">
              View GitHub Commit
            </a>
          </li>
          <li>
            <a href={`mailto:${deliverable.student_email}`} target="_blank" rel="noopener noreferrer">
              Contact Student
            </a>
          </li>
        </ul>
      </div>
      <div className="tools-section">
        <h5>Notes</h5>
        <textarea
          className="form-control"
          rows="5"
          placeholder="Write your notes here..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        ></textarea>
      </div>
      <div className="tools-section">
        <h5>Checklist Summary</h5>
        <ul>
          {Object.entries(checklist).map(([key, value]) => (
            <li key={key}>
              {key.replace(/([A-Z])/g, ' $1')}: {value ? '✔️ Completed' : '❌ Not Completed'}
            </li>
          ))}
        </ul>
      </div>
      {/* Deliverable Rubric */}
      <div className="tools-section">
        <h5>Deliverable Rubric</h5>
        <ul>
          {rubric.map((criterion) => (
            <li key={criterion.name}>
              <label>
                {criterion.name} ({criterion.weight}%):
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={rubricScores[criterion.name]}
                  onChange={(e) => handleRubricChange(e, criterion)}
                  className="form-control"
                />
              </label>
            </li>
          ))}
        </ul>
      </div>
      {/* Code Snippet Viewer */}
      <div className="tools-section">
        <h5>Code Snippet Viewer</h5>
        <pre className="code-snippet">
          <code>{codeSnippet || 'No code snippet available.'}</code>
        </pre>
      </div>
      {/* Report Viewer */}
      <div className="tools-section">
        <h5>Report Viewer</h5>
        {reportUrl ? (
          <a href={reportUrl} target="_blank" rel="noopener noreferrer" className="btn btn-primary btn-sm">
            View Report
          </a>
        ) : (
          <p>No report available.</p>
        )}
      </div>
      {/* Plagiarism Checker */}
      <div className="tools-section">
        <h5>Plagiarism Checker</h5>
        <button className="btn btn-danger btn-sm" onClick={handlePlagiarismCheck}>
          Check for Plagiarism
        </button>
      </div>
    </div>
  );
};

export default ToolsRightSideBar;