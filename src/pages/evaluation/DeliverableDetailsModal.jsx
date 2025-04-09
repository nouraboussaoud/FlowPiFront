import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaFolder, FaFolderOpen, FaFile, FaTimes, FaExpand, FaCompress } from 'react-icons/fa';
import Editor from '@monaco-editor/react';

const DeliverableDetails = ({ deliverable, onClose, onSubmitEvaluation }) => {
  // State declarations
  const [evaluationScore, setEvaluationScore] = useState('');
  const [notes, setNotes] = useState('');
  const [checklist, setChecklist] = useState({
    requirement1: false,
    requirement2: false,
    requirement3: false,
  });
  const [commitURL, setCommitURL] = useState('');
  const [fileTree, setFileTree] = useState([]);
  const [selectedFileContent, setSelectedFileContent] = useState('');
  const [selectedFilePath, setSelectedFilePath] = useState('');
  const [loading, setLoading] = useState({
    tree: true,
    content: false,
    submission: false
  });
  const [error, setError] = useState({
    tree: null,
    content: null,
    submission: null
  });
  const [cache, setCache] = useState({});
  const [nestedFileTree, setNestedFileTree] = useState({});
  const [fullScreenEditor, setFullScreenEditor] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Rubric data
  const rubric = [
    { name: 'Code Quality', weight: 40 },
    { name: 'Documentation', weight: 30 },
    { name: 'Functionality', weight: 30 },
  ];

  const [rubricScores, setRubricScores] = useState(
    rubric.reduce((acc, criterion) => ({ ...acc, [criterion.name]: 0 }), {})
  );

  // Enhanced file type detection for Monaco
  const getFileLanguage = (filename) => {
    if (!filename) return 'plaintext';
    
    const extension = filename.split('.').pop().toLowerCase();
    switch(extension) {
      case 'js': return 'javascript';
      case 'jsx': return 'javascript';
      case 'ts': return 'typescript';
      case 'tsx': return 'typescript';
      case 'py': return 'python';
      case 'java': return 'java';
      case 'c': return 'c';
      case 'cpp':
      case 'cc':
      case 'cxx':
      case 'hpp':
      case 'h': return 'cpp';
      case 'cs': return 'csharp';
      case 'go': return 'go';
      case 'rs': return 'rust';
      case 'rb': return 'ruby';
      case 'php': return 'php';
      case 'twig': return 'twig';
      case 'sh': return 'shell';
      case 'html':
      case 'htm': return 'html';
      case 'css': return 'css';
      case 'scss': return 'scss';
      case 'sass': return 'sass';
      case 'json': return 'json';
      case 'md': return 'markdown';
      case 'yml':
      case 'yaml': return 'yaml';
      case 'xml': return 'xml';
      default: return 'plaintext';
    }
  };

  // Toggle fullscreen editor
  const toggleFullScreenEditor = () => {
    setFullScreenEditor(!fullScreenEditor);
  };

  // Handler functions
  const handleRubricChange = (e, criterion) => {
    const { value } = e.target;
    setRubricScores((prev) => ({ ...prev, [criterion.name]: value }));
  };

  const handleChecklistChange = (e) => {
    const { name, checked } = e.target;
    setChecklist((prev) => ({ ...prev, [name]: checked }));
  };

  const handleSubmit = async () => {
    try {
      // Clear previous errors
      setError(prev => ({...prev, submission: null}));
      setLoading(prev => ({...prev, submission: true}));
      
      // Validate the evaluation score
      if (!evaluationScore || isNaN(evaluationScore) || evaluationScore < 0 || evaluationScore > 100) {
        setError(prev => ({...prev, submission: 'Please enter a valid evaluation score between 0 and 100'}));
        setLoading(prev => ({...prev, submission: false}));
        return;
      }
  
      // Prepare evaluation data
      const evaluationData = {
        evaluationScore: parseFloat(evaluationScore), // Convert to number
        notes,
      };
  
      // Call the onSubmitEvaluation prop with the evaluation data
      await onSubmitEvaluation(deliverable._id, evaluationData);
      
      // Set success state
      setSubmitSuccess(true);
      
      // Close the modal after a short delay to show success message
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (error) {
      console.error('Error submitting evaluation:', error);
      setError(prev => ({
        ...prev, 
        submission: error.response?.data?.message || 'Failed to submit evaluation. Please try again.'
      }));
    } finally {
      setLoading(prev => ({...prev, submission: false}));
    }
  };

  // GitHub API functions
  const fetchCommitDetails = async () => {
    try {
      const response = await axios.get(
        `https://api.github.com/repos/nouraboussaoud/FlowPiFront/commits/main`,
        {
          headers: {
            Authorization: `Bearer ${process.env.REACT_APP_GITHUB_TOKEN}`,
          },
        }
      );

      if (response.data?.html_url) {
        setCommitURL(response.data.html_url);
      } else {
        throw new Error('Failed to fetch commit details.');
      }
    } catch (error) {
      setError(prev => ({...prev, tree: error.message}));
    }
  };

  const fetchFileTree = async () => {
    try {
      const response = await axios.get(
        `https://api.github.com/repos/nouraboussaoud/FlowPiFront/git/trees/main?recursive=1`,
        {
          headers: {
            Authorization: `Bearer ${process.env.REACT_APP_GITHUB_TOKEN}`,
          },
        }
      );

      if (response.data?.tree) {
        setFileTree(response.data.tree);
        setLoading(prev => ({...prev, tree: false}));
        setError(prev => ({...prev, tree: null}));
      } else {
        throw new Error('Failed to fetch file tree.');
      }
    } catch (error) {
      setError(prev => ({...prev, tree: error.message}));
      setLoading(prev => ({...prev, tree: false}));
    }
  };

  const fetchFileContent = async (filePath) => {
    setSelectedFilePath(filePath);
    setError(prev => ({...prev, content: null}));
    setLoading(prev => ({...prev, content: true}));
    
    try {
      if (cache[filePath]) {
        setSelectedFileContent(cache[filePath]);
        setLoading(prev => ({...prev, content: false}));
        return;
      }

      const response = await axios.get(
        `https://raw.githubusercontent.com/nouraboussaoud/FlowPiFront/main/${filePath}`,
        {
          responseType: 'text',
          headers: {
            Accept: 'text/plain; charset=utf-8',
          },
        }
      );

      if (response.data) {
        setSelectedFileContent(response.data);
        setCache((prevCache) => ({ ...prevCache, [filePath]: response.data }));
      } else {
        throw new Error('File content not available');
      }
    } catch (error) {
      console.error('Error fetching file:', error);
      let errorMessage = error.message;
      
      if (error.response) {
        if (error.response.status === 404) {
          errorMessage = 'File not found in repository (404)';
        } else if (error.response.status === 403) {
          errorMessage = 'API rate limit exceeded (403)';
        } else {
          errorMessage = `API error: ${error.response.status}`;
        }
      }
      
      setError(prev => ({...prev, content: errorMessage}));
      setSelectedFileContent(`Error loading file: ${errorMessage}\nPath: ${filePath}`);
    } finally {
      setLoading(prev => ({...prev, content: false}));
    }
  };

  // Tree building and rendering functions
  const buildFileTree = (files) => {
    const tree = {};

    files.forEach(file => {
      const parts = file.path.split('/');
      let currentLevel = tree;

      parts.forEach((part, index) => {
        if (!currentLevel[part]) {
          currentLevel[part] = {
            name: part,
            isFolder: index < parts.length - 1 || file.type === 'tree',
            children: {},
            isOpen: false,
            path: parts.slice(0, index + 1).join('/'),
            fileData: index === parts.length - 1 ? file : null
          };
        }
        currentLevel = currentLevel[part].children;
      });
    });

    return tree;
  };

  const toggleFolder = (path) => {
    const updateTree = (node) => {
      if (node.path === path) {
        return { ...node, isOpen: !node.isOpen };
      }

      const updatedChildren = {};
      Object.keys(node.children).forEach(key => {
        updatedChildren[key] = updateTree(node.children[key]);
      });
      
      return {
        ...node,
        children: updatedChildren
      };
    };
    
    setNestedFileTree(prevTree => {
      const newTree = {};
      Object.keys(prevTree).forEach(key => {
        newTree[key] = updateTree(prevTree[key]);
      });
      return newTree;
    });
  };

  const renderFileTree = (tree, level = 0) => {
    const items = Object.values(tree);
    const folders = items.filter(item => item.isFolder)
                         .sort((a, b) => a.name.localeCompare(b.name));
    const files = items.filter(item => !item.isFolder)
                      .sort((a, b) => a.name.localeCompare(b.name));

    return (
      <>
        {folders.map(node => (
          <div key={node.path} style={{ marginLeft: `${level * 15}px` }}>
            <div 
              onClick={() => toggleFolder(node.path)}
              style={{ 
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                padding: '5px 0',
                fontWeight: 'bold',
                color: '#1a73e8',
                userSelect: 'none'
              }}
            >
              {node.isOpen ? (
                <FaFolderOpen style={{ marginRight: '8px', color: '#1a73e8' }} />
              ) : (
                <FaFolder style={{ marginRight: '8px', color: '#1a73e8' }} />
              )}
              {node.name}
            </div>
            {node.isOpen && Object.keys(node.children).length > 0 && (
              <div>
                {renderFileTree(node.children, level + 1)}
              </div>
            )}
          </div>
        ))}

        {files.map(node => (
          <div 
            key={node.path}
            onClick={() => fetchFileContent(node.path)}
            style={{
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              padding: '5px 0',
              marginLeft: `${level * 15}px`,
              color: '#5f6368',
              userSelect: 'none'
            }}
          >
            <FaFile style={{ marginRight: '8px', color: '#80868b' }} />
            {node.name}
          </div>
        ))}
      </>
    );
  };

  // Effects
  useEffect(() => {
    if (fileTree.length > 0) {
      const structuredTree = buildFileTree(fileTree);
      setNestedFileTree(structuredTree);
    }
  }, [fileTree]);

  useEffect(() => {
    if (deliverable) {
      fetchCommitDetails();
      fetchFileTree();
      
      // Initialize form with existing evaluation data if available
      if (deliverable.evaluation) {
        if (deliverable.evaluation.evaluationScore) {
          setEvaluationScore(deliverable.evaluation.evaluationScore);
        }
        if (deliverable.evaluation.notes) {
          setNotes(deliverable.evaluation.notes);
        }
      }
    }
  }, [deliverable]);

  if (!deliverable) return null;

  if (fullScreenEditor) {
    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: '#1e1e1e',
        zIndex: 2000,
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Header */}
        <div style={{
          padding: '10px',
          backgroundColor: '#252526',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '1px solid #444'
        }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <FaFile style={{ marginRight: '8px', color: '#80868b' }} />
            {selectedFilePath.split('/').pop() || 'No file selected'}
          </div>
          <div>
            <button 
              onClick={toggleFullScreenEditor}
              style={{
                background: 'none',
                border: 'none',
                color: '#d4d4d4',
                cursor: 'pointer',
                padding: '5px 10px',
                borderRadius: '3px',
                display: 'flex',
                alignItems: 'center',
                gap: '5px'
              }}
            >
              <FaCompress style={{ marginRight: '5px' }} />
              Exit Full Screen
            </button>
          </div>
        </div>
        
        {/* Main content */}
        <div style={{ 
          flex: 1, 
          overflow: 'hidden',
          display: 'flex'
        }}>
          {/* File explorer */}
          <div style={{
            width: '250px',
            borderRight: '1px solid #444',
            backgroundColor: '#252526',
            overflowY: 'auto',
            padding: '10px'
          }}>
            <h5 style={{ 
              color: '#d4d4d4',
              marginBottom: '10px',
              paddingLeft: '5px'
            }}>
              Files Explorer
            </h5>
            {loading.tree ? (
              <p style={{ color: '#d4d4d4' }}>Loading files...</p>
            ) : error.tree ? (
              <p style={{ color: '#f48771' }}>Error loading file tree: {error.tree}</p>
            ) : (
              renderFileTree(nestedFileTree)
            )}
          </div>
          
          {/* Editor */}
          <div style={{ 
            flex: 1,
            overflow: 'hidden'
          }}>
            {loading.content ? (
              <div style={{ 
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#1e1e1e',
                color: '#d4d4d4'
              }}>
                Loading file content...
              </div>
            ) : error.content ? (
              <div style={{ 
                height: '100%',
                padding: '15px',
                backgroundColor: '#1e1e1e',
                color: '#f48771',
                whiteSpace: 'pre-wrap',
                overflow: 'auto'
              }}>
                {selectedFileContent}
              </div>
            ) : selectedFileContent ? (
              <Editor
                height="100%"
                language={getFileLanguage(selectedFilePath)}
                value={selectedFileContent}
                theme="vs-dark"
                options={{
                  readOnly: true,
                  minimap: { enabled: true },
                  fontSize: 14,
                  wordWrap: 'on',
                  lineNumbers: 'on',
                  renderWhitespace: 'none',
                  scrollBeyondLastLine: false,
                  automaticLayout: true,
                  folding: true,
                  lineDecorationsWidth: 10,
                  lineNumbersMinChars: 3,
                  renderLineHighlight: 'all',
                }}
              />
            ) : (
              <div style={{ 
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#1e1e1e',
                color: '#d4d4d4'
              }}>
                No file selected
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      position: 'fixed',
      top: '100px',
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'flex-start',
      zIndex: 1000,
      paddingTop: '20px',
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '8px',
        width: '90%',
        maxWidth: '1200px',
        maxHeight: '85vh',
        overflow: 'auto',
        padding: '20px',
        position: 'relative'
      }}>
        <button 
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '15px',
            right: '15px',
            background: 'none',
            border: 'none',
            fontSize: '1.5rem',
            cursor: 'pointer',
            color: '#666'
          }}
        >
          <FaTimes />
        </button>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <h2 style={{ marginBottom: '20px', color: '#333' }}>Deliverable Evaluation</h2>
          
          <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
            {/* Evaluation Criteria */}
            <div style={{ flex: 1, minWidth: '250px' }}>
              <h3 style={{ borderBottom: '1px solid #eee', paddingBottom: '10px' }}>Evaluation Criteria</h3>
              <ul style={{ listStyle: 'none', padding: 0 }}>
                {rubric.map((criterion) => (
                  <li key={criterion.name} style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', marginBottom: '5px' }}>
                      {criterion.name} ({criterion.weight}%)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={rubricScores[criterion.name]}
                      onChange={(e) => handleRubricChange(e, criterion)}
                      style={{
                        width: '100%',
                        padding: '8px',
                        borderRadius: '4px',
                        border: '1px solid #ddd'
                      }}
                    />
                  </li>
                ))}
              </ul>
              <div style={{ flex: 1, minWidth: '250px' }}>
                <h5 style={{ marginBottom: '10px' }}>Files Explorer</h5>
                <div style={{
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  padding: '10px',
                  height: '300px',
                  overflowY: 'auto',
                  backgroundColor: '#f9f9f9'
                }}>
                  {loading.tree ? (
                    <p>Loading files...</p>
                  ) : error.tree ? (
                    <p style={{ color: 'red' }}>Error loading file tree: {error.tree}</p>
                  ) : (
                    renderFileTree(nestedFileTree)
                  )}
                </div>
              </div>
            </div>

            {/* Deliverable Details */}
            <div style={{ flex: 2, minWidth: '300px' }}>
              <div style={{ marginBottom: '20px' }}>
                <h3 style={{ borderBottom: '1px solid #eee', paddingBottom: '10px' }}>Deliverable Details</h3>
                <p><strong>Title:</strong> {deliverable.title}</p>
                <p><strong>Submission Date:</strong> {new Date(deliverable.submission_date).toLocaleDateString()}</p>
                <p><strong>Description:</strong> {deliverable.description}</p>
                <p><strong>Status:</strong> <span style={{
                  color: deliverable.status === 'evaluated' ? '#28a745' : '#f0ad4e',
                  fontWeight: 'bold'
                }}>{deliverable.status.charAt(0).toUpperCase() + deliverable.status.slice(1)}</span></p>
                
                <div style={{ margin: '15px 0' }}>
                  <h5>Quick Links</h5>
                  <ul style={{ listStyle: 'none', padding: 0 }}>
                    <li style={{ marginBottom: '5px' }}>
                      <a 
                        href={commitURL} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        style={{ color: '#1a73e8', textDecoration: 'none' }}
                      >
                        View On GitHub
                      </a>
                    </li>
                    <li>
                      <a 
                        href={`mailto:${deliverable.student_email}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        style={{ color: '#1a73e8', textDecoration: 'none' }}
                      >
                        Contact Student
                      </a>
                    </li>
                  </ul>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: '250px' }}>
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    marginBottom: '10px'
                  }}>
                    <h5>File Content</h5>
                    {selectedFileContent && (
                      <button 
                        onClick={toggleFullScreenEditor}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#1a73e8',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '5px',
                          padding: '2px 8px',
                          borderRadius: '3px'
                        }}
                      >
                        <FaExpand size={12} />
                        Full Screen
                      </button>
                    )}
                  </div>
                  <div style={{
                    border: '1px solid #444',
                    borderRadius: '4px',
                    height: '300px',
                    overflow: 'hidden',
                  }}>
                    {loading.content ? (
                      <div style={{ 
                        height: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: '#1e1e1e',
                        color: '#d4d4d4'
                      }}>
                        Loading file content...
                      </div>
                    ) : error.content ? (
                      <div style={{ 
                        height: '100%',
                        padding: '15px',
                        backgroundColor: '#1e1e1e',
                        color: '#f48771',
                        whiteSpace: 'pre-wrap',
                        overflow: 'auto'
                      }}>
                        {selectedFileContent}
                      </div>
                    ) : selectedFileContent ? (
                      <Editor
                        height="300px"
                        language={getFileLanguage(selectedFilePath)}
                        value={selectedFileContent}
                        theme="vs-dark"
                        options={{
                          readOnly: true,
                          minimap: { enabled: false },
                          fontSize: 14,
                          wordWrap: 'on',
                          lineNumbers: 'on',
                          renderWhitespace: 'none',
                          scrollBeyondLastLine: false,
                          automaticLayout: true,
                          folding: true,
                          lineDecorationsWidth: 10,
                          lineNumbersMinChars: 3,
                          renderLineHighlight: 'all',
                          scrollbar: {
                            vertical: 'auto',
                            horizontal: 'auto',
                          },
                        }}
                      />
                    ) : (
                      <div style={{ 
                        height: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: '#1e1e1e',
                        color: '#d4d4d4'
                      }}>
                        No file selected
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Evaluation Area */}
            <div style={{ flex: 1, minWidth: '250px' }}>
              <h3 style={{ borderBottom: '1px solid #eee', paddingBottom: '10px' }}>Evaluation</h3>
              
              <div style={{ marginBottom: '20px' }}>
                <h5>Checklist</h5>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <input
                      type="checkbox"
                      name="requirement1"
                      checked={checklist.requirement1}
                      onChange={handleChecklistChange}
                    />
                    Requirement 1
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <input
                      type="checkbox"
                      name="requirement2"
                      checked={checklist.requirement2}
                      onChange={handleChecklistChange}
                    />
                    Requirement 2
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <input
                      type="checkbox"
                      name="requirement3"
                      checked={checklist.requirement3}
                      onChange={handleChecklistChange}
                    />
                    Requirement 3
                  </label>
                </div>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <h5>Notes</h5>
                <textarea
                  style={{
                    width: '100%',
                    padding: '8px',
                    borderRadius: '4px',
                    border: '1px solid #ddd',
                    minHeight: '100px'
                  }}
                  placeholder="Write your feedback here..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                ></textarea>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <h5>Final Mark</h5>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={evaluationScore}
                  onChange={(e) => setEvaluationScore(e.target.value)}
                  placeholder="Enter evaluation mark (0-100)"
                  style={{
                    width: '100%',
                    padding: '8px',
                    borderRadius: '4px',
                    border: '1px solid #ddd'
                  }}
                />
              </div>

              {error.submission && (
                <div style={{ 
                  marginBottom: '15px', 
                  color: '#dc3545', 
                  backgroundColor: '#f8d7da',
                  padding: '10px',
                  borderRadius: '4px',
                  border: '1px solid #f5c6cb'
                }}>
                  {error.submission}
                </div>
              )}

              {submitSuccess && (
                <div style={{ 
                  marginBottom: '15px', 
                  color: '#155724', 
                  backgroundColor: '#d4edda',
                  padding: '10px',
                  borderRadius: '4px',
                  border: '1px solid #c3e6cb'
                }}>
                  Evaluation submitted successfully!
                </div>
              )}

              <button 
                onClick={handleSubmit}
                disabled={loading.submission}
                style={{
                  backgroundColor: loading.submission ? '#6c757d' : '#28a745',
                  color: 'white',
                  border: 'none',
                  padding: '10px 15px',
                  borderRadius: '4px',
                  cursor: loading.submission ? 'not-allowed' : 'pointer',
                  width: '100%',
                  fontSize: '1rem',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center'
                }}
                onMouseOver={(e) => {
                  if (!loading.submission) e.currentTarget.style.backgroundColor = '#218838';
                }}
                onMouseOut={(e) => {
                  if (!loading.submission) e.currentTarget.style.backgroundColor = '#28a745';
                }}
              >
                {loading.submission ? 'Submitting...' : 'Submit Evaluation'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeliverableDetails;