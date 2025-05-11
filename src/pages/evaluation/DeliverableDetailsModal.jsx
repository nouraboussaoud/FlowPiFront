import React, { useState, useEffect } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import axios from 'axios';
import { FaFolder, FaFolderOpen, FaFile, FaTimes, FaExpand, FaCompress, FaPlay, FaPause, FaStop } from 'react-icons/fa';
import Editor from '@monaco-editor/react';
import { useNavigate } from 'react-router-dom';
import jsPDF from 'jspdf';

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

const DeliverableDetails = ({ deliverable, onClose, onSubmitEvaluation }) => {
  const navigate = useNavigate();
  // State declarations
  const [aiScore, setAiScore] = useState(null);
  const [aiScoreLoading, setAiScoreLoading] = useState(false);
  const [numPages, setNumPages] = useState(null);
  const [evaluationScore, setEvaluationScore] = useState('');
  const [notes, setNotes] = useState('');
  const [checklist, setChecklist] = useState({
    requirement1: false,
    requirement2: false,
    requirement3: false,
  });
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [uploadedFileUrl, setUploadedFileUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [commitURL, setCommitURL] = useState('');
  const [fileTree, setFileTree] = useState([]);
  const [selectedFileContent, setSelectedFileContent] = useState('');
  const [selectedFileId, setSelectedFileId] = useState(null);
  const [selectedFilePath, setSelectedFilePath] = useState('');
  const [loading, setLoading] = useState({
    tree: true,
    content: false,
    submission: false,
    plagiarism: false,
  });
  const [error, setError] = useState({
    tree: null,
    content: null,
    submission: null,
    plagiarism: null,
  });
  const [cache, setCache] = useState({});
  const [nestedFileTree, setNestedFileTree] = useState({});
  const [fullScreenEditor, setFullScreenEditor] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [pdfError, setPdfError] = useState(null);
  const [plagiarismScore, setPlagiarismScore] = useState(null);
  const [plagiarized, setPlagiarized] = useState(null);
  const [plagiarismDetails, setPlagiarismDetails] = useState([]);
  const [expandedMatches, setExpandedMatches] = useState({});

  // Rubric data
  const rubric = [
    { name: 'Code Quality', weight: 40 },
    { name: 'Documentation', weight: 30 },
    { name: 'Functionality', weight: 30 },
  ];

  const [rubricScores, setRubricScores] = useState(
    rubric.reduce((acc, criterion) => ({ ...acc, [criterion.name]: 0 }), {})
  );

  // Plagiarism check handler
  const handleCheckPlagiarism = async () => {
    if (!deliverable.file?.url) {
      alert('No file URL provided.');
      return;
    }
    setLoading((prev) => ({ ...prev, plagiarism: true }));
    setError((prev) => ({ ...prev, plagiarism: null }));
    setPlagiarismScore(null);
    setPlagiarized(null);
    setPlagiarismDetails([]);
    setExpandedMatches({});

    try {
      const fileUrl = deliverable.file.url.replace(/\?.*$/, '');
      const response = await axios.post('http://localhost:5000/api/summary', {
        fileUrl,
        includeSummary: false,
      });
      const { plagiarismScore, plagiarized, plagiarismDetails } = response.data;
      setPlagiarismScore(plagiarismScore);
      setPlagiarized(plagiarized);
      setPlagiarismDetails(plagiarismDetails || []);
    } catch (err) {
      console.error(err);
      setError((prev) => ({ ...prev, plagiarism: 'An error occurred while checking plagiarism.' }));
    } finally {
      setLoading((prev) => ({ ...prev, plagiarism: false }));
    }
  };

  // Export plagiarism report as PDF
  const exportPlagiarismReport = () => {
    if (!plagiarismScore) return;

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    const lineHeight = 7;
    let y = 20;

    // Header
    doc.setFontSize(16);
    doc.text('Plagiarism Report', margin, y);
    y += 10;
    doc.setFontSize(12);
    doc.setTextColor(100);
    doc.text(`Generated: ${new Date().toLocaleString()}`, pageWidth - margin, y, { align: 'right' });
    y += 15;

    // Document Info
    doc.setFontSize(14);
    doc.setTextColor(0);
    doc.text('Document:', margin, y);
    doc.setFontSize(12);
    doc.text(deliverable.file.url.split('/').pop(), margin + 40, y);
    y += 10;

    doc.setFontSize(14);
    doc.text('Plagiarism Score:', margin, y);
    doc.setFontSize(12);
    doc.text(`${plagiarismScore}%`, margin + 40, y);
    y += 10;

    doc.setFontSize(14);
    doc.text('Status:', margin, y);
    doc.setFontSize(12);
    doc.text(plagiarized ? '❌ May be plagiarized' : '✅ Appears original', margin + 40, y, { maxWidth: pageWidth - margin - 40 });
    y += 15;

    // Plagiarism Details
    if (plagiarismDetails.length > 0) {
      doc.setFontSize(14);
      doc.text('Plagiarism Details:', margin, y);
      y += 10;

      plagiarismDetails.forEach((match, index) => {
        doc.setFontSize(12);
        doc.setTextColor(0);
        doc.text(`Matched Document ${index + 1}: ${match.documentUrl.split('/').pop()} (${match.similarityScore}%)`, margin, y);
        y += 10;

        if (match.similarSections && match.similarSections.length > 0) {
          doc.setFontSize(10);
          doc.setTextColor(100);
          match.similarSections.forEach((section) => {
            y += 5;
            doc.text('Original:', margin + 5, y);
            doc.setTextColor(0);
            doc.text(section.original, margin + 20, y, { maxWidth: pageWidth - margin - 20 });
            y += 10;

            doc.setTextColor(100);
            doc.text('Matched:', margin + 5, y);
            doc.setTextColor(0);
            doc.text(section.matched, margin + 20, y, { maxWidth: pageWidth - margin - 20 });
            y += 10;

            doc.setTextColor(100);
            doc.text(`Similarity: ${section.similarity}%`, margin + 5, y);
            y += 10;

            if (y > 270) {
              doc.addPage();
              y = 20;
              doc.setFontSize(14);
              doc.text('Plagiarism Details (Continued):', margin, y);
              y += 10;
            }
          });
        }
        y += 5;
      });
    }

    // Footer
    doc.setFontSize(10);
    doc.setTextColor(150);
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.text(`Page ${i} of ${pageCount}`, pageWidth / 2, 290, { align: 'center' });
    }

    doc.save(`plagiarism_report_${deliverable.file.url.split('/').pop()}.pdf`);
  };

  const toggleMatchDetails = (index) => {
    setExpandedMatches((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  // Document handlers
  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
    setPdfError(null);
  };

  const onDocumentLoadError = (error) => {
    console.error('PDF load error:', error);
    setPdfError('Failed to load PDF document');
  };

  const openPdfInNewTab = () => {
    if (deliverable.file && deliverable.file.url) {
      try {
        window.open(deliverable.file.url, '_blank', 'noopener,noreferrer');
      } catch (error) {
        console.error('Failed to open PDF:', error);
        const newWindow = window.open();
        if (newWindow) {
          newWindow.opener = null;
          newWindow.location.href = deliverable.file.url;
        } else {
          alert('Popup blocked. Please allow popups for this site or click the file link to view the PDF.');
        }
      }
    }
  };

  const handleSummarize = async () => {
    if (isLoading) return;

    try {
      setIsLoading(true);

      if (!deliverable.file || !deliverable.file.url) {
        console.error('Missing deliverable file URL');
        return;
      }

      const fileUrl = deliverable.file.url.replace(/\?.*$/, '');

      const response = await axios.post('http://localhost:5000/api/summary', {
        fileUrl: fileUrl,
        includeSummary: true,
        includeAudio: true,
      });

      const { summary, audioUrl } = response.data;
      if (summary) {
        const newWindow = window.open('', '_blank', 'width=800,height=600');
        if (newWindow) {
          newWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
              <title>Document Summary</title>
              <style>
                body {
                  font-family: Arial, sans-serif;
                  line-height: 1.6;
                  margin: 20px;
                  max-width: 800px;
                  margin: 0 auto;
                  padding: 20px;
                  background-color: #f4f4f4;
                }
                h1 {
                  color: #333;
                  border-bottom: 1px solid #ddd;
                  padding-bottom: 10px;
                }
                .summary-content {
                  background-color: #fff;
                  padding: 20px;
                  border-radius: 5px;
                  border-left: 4px solid #007bff;
                  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                  white-space: pre-wrap;
                }
                .file-info {
                  margin-bottom: 20px;
                  color: #666;
                }
                .audio-controls {
                  margin-top: 20px;
                  display: flex;
                  gap: 10px;
                }
                .audio-controls button {
                  background-color: #007bff;
                  color: white;
                  border: none;
                  padding: 8px 15px;
                  border-radius: 4px;
                  cursor: pointer;
                  font-size: 14px;
                  display: flex;
                  align-items: center;
                  gap: 5px;
                  transition: background-color 0.2s;
                }
                .audio-controls button:hover {
                  background-color: #0056b3;
                }
                .audio-controls button:disabled {
                  background-color: #6c757d;
                  cursor: not-allowed;
                }
                .audio-player {
                  margin-top: 20px;
                }
                .print-button {
                  background-color: #28a745;
                  color: white;
                  border: none;
                  padding: 10px 20px;
                  border-radius: 4px;
                  cursor: pointer;
                  font-size: 14px;
                  margin-top: 10px;
                  transition: background-color 0.2s;
                }
                .print-button:hover {
                  background-color: #218838;
                }
                @media print {
                  .audio-controls, .audio-player, .print-button {
                    display: none;
                  }
                }
              </style>
            </head>
            <body>
              <h1>Document Summary</h1>
              <div class="file-info">
                <strong>Original File:</strong> ${deliverable.file.url.split('/').pop()}
              </div>
              <div class="summary-content">
                ${summary.replace(/\n/g, '<br>')}
              </div>
              ${audioUrl ? `
                <div class="audio-player">
                  <audio id="audio-player" src="${audioUrl}" controls>
                    Your browser does not support the audio element.
                  </audio>
                  <div class="audio-controls">
                    <button id="play-btn"><FaPlay /> Play</button>
                    <button id="pause-btn" disabled><FaPause /> Pause</button>
                    <button id="stop-btn" disabled><FaStop /> Stop</button>
                  </div>
                </div>
              ` : '<p>No audio available.</p>'}
              <button class="print-button" onclick="window.print()">Print Summary</button>
              <script>
                const audio = document.getElementById('audio-player');
                let isPlaying = false;

                if (audio) {
                  document.getElementById('play-btn').addEventListener('click', () => {
                    if (!isPlaying) {
                      audio.play();
                      isPlaying = true;
                      document.getElementById('play-btn').disabled = true;
                      document.getElementById('pause-btn').disabled = false;
                      document.getElementById('stop-btn').disabled = false;
                    }
                  });

                  document.getElementById('pause-btn').addEventListener('click', () => {
                    if (isPlaying) {
                      audio.pause();
                      isPlaying = false;
                      document.getElementById('play-btn').disabled = false;
                      document.getElementById('pause-btn').disabled = true;
                    }
                  });

                  document.getElementById('stop-btn').addEventListener('click', () => {
                    if (isPlaying || !audio.paused) {
                      audio.pause();
                      audio.currentTime = 0;
                      isPlaying = false;
                      document.getElementById('play-btn').disabled = false;
                      document.getElementById('pause-btn').disabled = true;
                      document.getElementById('stop-btn').disabled = true;
                    }
                  });

                  audio.onended = () => {
                    isPlaying = false;
                    document.getElementById('play-btn').disabled = false;
                    document.getElementById('pause-btn').disabled = true;
                    document.getElementById('stop-btn').disabled = true;
                  };
                }

                // Cleanup on window close
                window.addEventListener('beforeunload', () => {
                  if (audio && (isPlaying || !audio.paused)) {
                    audio.pause();
                    audio.currentTime = 0;
                  }
                });
              </script>
            </body>
            </html>
          `);
          newWindow.document.close();
        }
      }
    } catch (error) {
      console.error('Failed to summarize the document:', error);
      alert('Failed to summarize the document. Please check if the file is accessible or contact support.');
    } finally {
      setIsLoading(false);
    }
  };

  // Enhanced file type detection for Monaco
  const getFileLanguage = (filename) => {
    if (!filename) return 'plaintext';

    const extension = filename.split('.').pop().toLowerCase();
    switch (extension) {
      case 'js':
        return 'javascript';
      case 'jsx':
        return 'javascript';
      case 'ts':
        return 'typescript';
      case 'tsx':
        return 'typescript';
      case 'py':
        return 'python';
      case 'java':
        return 'java';
      case 'c':
        return 'c';
      case 'cpp':
      case 'cc':
      case 'cxx':
      case 'hpp':
      case 'h':
        return 'cpp';
      case 'cs':
        return 'csharp';
      case 'go':
        return 'go';
      case 'rs':
        return 'rust';
      case 'rb':
        return 'ruby';
      case 'php':
        return 'php';
      case 'twig':
        return 'twig';
      case 'sh':
        return 'shell';
      case 'html':
      case 'htm':
        return 'html';
      case 'css':
        return 'css';
      case 'scss':
        return 'scss';
      case 'sass':
        return 'sass';
      case 'json':
        return 'json';
      case 'md':
        return 'markdown';
      case 'yml':
      case 'yaml':
        return 'yaml';
      case 'xml':
        return 'xml';
      default:
        return 'plaintext';
    }
  };

  const fetchUploadedFiles = async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) throw new Error('No token found');

      const response = await axios.get(`/api/deliverables/${deliverable._id}/file`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const file = response.data.file;

      if (file?.url) {
        setUploadedFiles([
          {
            path: file.url,
            name: file.url.split('/').pop(),
            public_id: file.public_id,
          },
        ]);
      } else {
        setUploadedFiles([]);
      }
    } catch (error) {
      console.error('Error fetching uploaded files:', error.message);
    }
  };

  const runAiDetectionOnUploadedFile = async (fileId) => {
    setAiScoreLoading(true);
    try {
      const res = await axios.get(`/api/aiDetection/${fileId}`);
      setAiScore(res.data?.ai_probability || 'No score available');
    } catch (error) {
      console.error('AI detection fetch error:', error);
      setAiScore('Error');
    } finally {
      setAiScoreLoading(false);
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
      setError((prev) => ({ ...prev, submission: null }));
      setLoading((prev) => ({ ...prev, submission: true }));

      if (!evaluationScore || isNaN(evaluationScore) || evaluationScore < 0 || evaluationScore > 100) {
        setError((prev) => ({
          ...prev,
          submission: 'Please enter a valid evaluation score between 0 and 100',
        }));
        setLoading((prev) => ({ ...prev, submission: false }));
        return;
      }

      const evaluationData = {
        evaluationScore: parseFloat(evaluationScore),
        notes,
      };

      await onSubmitEvaluation(deliverable._id, evaluationData);

      setSubmitSuccess(true);

      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (error) {
      console.error('Error submitting evaluation:', error);
      setError((prev) => ({
        ...prev,
        submission: error.response?.data?.message || 'Failed to submit evaluation. Please try again.',
      }));
    } finally {
      setLoading((prev) => ({ ...prev, submission: false }));
    }
  };

  // AI detection
  const fetchAiDetectionScore = async () => {
    setAiScoreLoading(true);
    try {
      const res = await axios.get(
        `/api/aiDetection/${deliverable._id}?filePath=${encodeURIComponent(selectedFilePath)}`
      );
      const score = res.data?.ai_probability;
      setAiScore(score);
    } catch (error) {
      console.error('AI detection fetch error:', error);
      setAiScore('Erreur');
    } finally {
      setAiScoreLoading(false);
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
      setError((prev) => ({ ...prev, tree: error.message }));
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
        setLoading((prev) => ({ ...prev, tree: false }));
        setError((prev) => ({ ...prev, tree: null }));
      } else {
        throw new Error('Failed to fetch file tree.');
      }
    } catch (error) {
      setError((prev) => ({ ...prev, tree: error.message }));
      setLoading((prev) => ({ ...prev, tree: false }));
    }
  };

  const fetchFileContent = async (filePath) => {
    setSelectedFilePath(filePath);
    setError((prev) => ({ ...prev, content: null }));
    setLoading((prev) => ({ ...prev, content: true }));

    try {
      if (cache[filePath]) {
        setSelectedFileContent(cache[filePath]);
        setLoading((prev) => ({ ...prev, content: false }));
        setAiScore(null);
        fetchAiDetectionScore();
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
        setAiScore(null);
        fetchAiDetectionScore();
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

      setError((prev) => ({ ...prev, content: errorMessage }));
      setSelectedFileContent(`Error loading file: ${errorMessage}\nPath: ${filePath}`);
    } finally {
      setLoading((prev) => ({ ...prev, content: false }));
    }
  };

  // Tree building and rendering functions
  const buildFileTree = (files) => {
    const tree = {};

    files.forEach((file) => {
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
            fileData: index === parts.length - 1 ? file : null,
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
      Object.keys(node.children).forEach((key) => {
        updatedChildren[key] = updateTree(node.children[key]);
      });

      return {
        ...node,
        children: updatedChildren,
      };
    };

    setNestedFileTree((prevTree) => {
      const newTree = {};
      Object.keys(prevTree).forEach((key) => {
        newTree[key] = updateTree(prevTree[key]);
      });
      return newTree;
    });
  };

  const renderFileTree = (tree, level = 0) => {
    const items = Object.values(tree);
    const folders = items
      .filter((item) => item.isFolder)
      .sort((a, b) => a.name.localeCompare(b.name));
    const files = items
      .filter((item) => !item.isFolder)
      .sort((a, b) => a.name.localeCompare(b.name));

    return (
      <>
        {folders.map((node) => (
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
                userSelect: 'none',
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
              <div>{renderFileTree(node.children, level + 1)}</div>
            )}
          </div>
        ))}

        {files.map((node) => (
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
              userSelect: 'none',
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

      if (deliverable.evaluation) {
        if (deliverable.evaluation.evaluationScore) {
          setEvaluationScore(deliverable.evaluation.evaluationScore);
        }
        if (deliverable.evaluation.notes) {
          setNotes(deliverable.evaluation.notes);
        }
      }
      fetchUploadedFiles();
    }
  }, [deliverable]);

  useEffect(() => {
    if (selectedFilePath) {
      setAiScore(null);
    }
  }, [selectedFilePath]);

  if (!deliverable) return null;

  if (fullScreenEditor) {
    return (
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: '#1e1e1e',
          zIndex: 2000,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '10px',
            backgroundColor: '#252526',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderBottom: '1px solid #444',
          }}
        >
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
                gap: '5px',
              }}
            >
              <FaCompress style={{ marginRight: '5px' }} />
              Exit Full Screen
            </button>
          </div>
        </div>

        {/* Main content */}
        <div style={{ flex: 1, overflow: 'hidden', display: 'flex' }}>
          {/* File explorer */}
          <div
            style={{
              width: '250px',
              borderRight: '1px solid #444',
              backgroundColor: '#252526',
              overflowY: 'auto',
              padding: '10px',
            }}
          >
            <h5
              style={{
                color: '#d4d4d4',
                marginBottom: '10px',
                paddingLeft: '5px',
              }}
            >
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
          <div style={{ flex: 1, overflow: 'hidden' }}>
            {loading.content ? (
              <div
                style={{
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: '#1e1e1e',
                  color: '#d4d4d4',
                }}
              >
                Loading file content...
              </div>
            ) : error.content ? (
              <div
                style={{
                  height: '100%',
                  padding: '15px',
                  backgroundColor: '#1e1e1e',
                  color: '#f48771',
                  whiteSpace: 'pre-wrap',
                  overflow: 'auto',
                }}
              >
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
              <div
                style={{
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: '#1e1e1e',
                  color: '#d4d4d4',
                }}
              >
                No file selected
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
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
      }}
    >
      <div
        style={{
          backgroundColor: 'white',
          borderRadius: '8px',
          width: '90%',
          maxWidth: '1200px',
          maxHeight: '85vh',
          overflow: 'auto',
          padding: '20px',
          position: 'relative',
        }}
      >
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
            color: '#666',
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
                        border: '1px solid #ddd',
                      }}
                    />
                  </li>
                ))}
              </ul>
              <div style={{ flex: 1, minWidth: '250px' }}>
                <h5 style={{ marginBottom: '10px' }}>Files Explorer</h5>
                <div
                  style={{
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    padding: '10px',
                    height: '300px',
                    overflowY: 'auto',
                    backgroundColor: '#f9f9f9',
                  }}
                >
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
                <p>
                  <strong>Title:</strong> {deliverable.title}
                </p>
                <p>
                  <strong>Submission Date:</strong> {new Date(deliverable.submission_date).toLocaleDateString()}
                </p>
                <p>
                  <strong>Description:</strong> {deliverable.description}
                </p>
                <p>
                  <strong>Status:</strong>{' '}
                  <span
                    style={{
                      color: deliverable.status === 'evaluated' ? '#28a745' : '#f0ad4e',
                      fontWeight: 'bold',
                    }}
                  >
                    {deliverable.status.charAt(0).toUpperCase() + deliverable.status.slice(1)}
                  </span>
                </p>

                <div style={{ margin: '15px 0' }}>
                  <h5>Quick Links</h5>
                  <ul style={{ listStyle: 'none', padding: '0' }}>
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
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '10px',
                    }}
                  >
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
                          borderRadius: '3px',
                        }}
                      >
                        <FaExpand size={12} />
                        Full Screen
                      </button>
                    )}
                  </div>
                  <div
                    style={{
                      border: '1px solid #444',
                      borderRadius: '4px',
                      height: '300px',
                      overflow: 'hidden',
                    }}
                  >
                    {loading.content ? (
                      <div
                        style={{
                          height: '100%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          backgroundColor: '#1e1e1e',
                          color: '#d4d4d4',
                        }}
                      >
                        Loading file content...
                      </div>
                    ) : error.content ? (
                      <div
                        style={{
                          height: '100%',
                          padding: '15px',
                          backgroundColor: '#1e1e1e',
                          color: '#f48771',
                          whiteSpace: 'pre-wrap',
                          overflow: 'auto',
                        }}
                      >
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
                      <div
                        style={{
                          height: '100%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          backgroundColor: '#1e1e1e',
                          color: '#d4d4d4',
                        }}
                      >
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
                    minHeight: '100px',
                  }}
                  placeholder="Write your feedback here..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                ></textarea>
              </div>

              <div style={{ marginBottom: '20px' }}>
                {selectedFilePath && (
                  <>
                    <h5>report :</h5>
                    <a
                      href={selectedFilePath}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: 'inline-block',
                        marginBottom: '10px',
                        color: '#007bff',
                        textDecoration: 'underline',
                      }}
                    >
                      {selectedFilePath.split('/').pop()}
                    </a>
                    <div>
                      <strong>AI Detection Score :</strong>{' '}
                      {aiScoreLoading
                        ? 'Analyzing...'
                        : aiScore !== null
                        ? typeof aiScore === 'number'
                          ? `${(aiScore * 100).toFixed(2)}%`
                          : aiScore
                        : 'No analysis available'}
                    </div>
                  </>
                )}
              </div>
              <div style={{ marginBottom: '20px' }}>
                <h5>Uploaded Report</h5>
                <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                  <p style={{ margin: 0 }}>
                    <strong>File:</strong>{' '}
                    <a
                      href={deliverable.file.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        color: '#007bff',
                        textDecoration: 'underline',
                        wordBreak: 'break-all',
                      }}
                    >
                      {deliverable.file.url.split('/').pop()}
                    </a>
                  </p>

                  <button
                    onClick={openPdfInNewTab}
                    style={{
                      backgroundColor: '#007bff',
                      color: 'white',
                      border: 'none',
                      padding: '8px 15px',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '14px',
                      transition: 'background-color 0.2s',
                    }}
                    onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#0056b3')}
                    onMouseOut={(e) => (e.currentTarget.style.backgroundColor = '#007bff')}
                  >
                    Open PDF
                  </button>

                  <button
                    type="button"
                    onClick={handleSummarize}
                    disabled={isLoading}
                    style={{
                      backgroundColor: isLoading ? '#6c757d' : '#6c757d',
                      color: 'white',
                      border: 'none',
                      padding: '8px 15px',
                      borderRadius: '4px',
                      cursor: isLoading ? 'not-allowed' : 'pointer',
                      fontSize: '14px',
                      transition: 'background-color 0.2s',
                    }}
                    onMouseOver={(e) => {
                      if (!isLoading) e.currentTarget.style.backgroundColor = '#5a6268';
                    }}
                    onMouseOut={(e) => {
                      if (!isLoading) e.currentTarget.style.backgroundColor = '#6c757d';
                    }}
                  >
                    {isLoading ? 'Summarizing...' : 'Summarize File'}
                  </button>

                  <button
                    type="button"
                    onClick={handleCheckPlagiarism}
                    disabled={loading.plagiarism}
                    style={{
                      backgroundColor: loading.plagiarism ? '#6c757d' : '#17a2b8',
                      color: 'white',
                      border: 'none',
                      padding: '8px 15px',
                      borderRadius: '4px',
                      cursor: loading.plagiarism ? 'not-allowed' : 'pointer',
                      fontSize: '14px',
                      transition: 'background-color 0.2s',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                    }}
                    onMouseOver={(e) => {
                      if (!loading.plagiarism) e.currentTarget.style.backgroundColor = '#138496';
                    }}
                    onMouseOut={(e) => {
                      if (!loading.plagiarism) e.currentTarget.style.backgroundColor = '#17a2b8';
                    }}
                  >
                    {loading.plagiarism ? (
                      <>
                        <div
                          style={{
                            width: '16px',
                            height: '16px',
                            border: '2px solid #fff',
                            borderTop: '2px solid transparent',
                            borderRadius: '50%',
                            animation: 'spin 1s linear infinite',
                          }}
                        />
                        Checking...
                      </>
                    ) : (
                      'Check Plagiarism'
                    )}
                  </button>
                </div>

                {error.plagiarism && (
                  <p
                    style={{
                      color: '#dc3545',
                      marginTop: '10px',
                      backgroundColor: '#f8d7da',
                      padding: '8px',
                      borderRadius: '4px',
                    }}
                  >
                    {error.plagiarism}
                  </p>
                )}

                {plagiarismScore !== null && (
                  <div style={{ marginTop: '15px' }}>
                    <p style={{ fontWeight: 'bold', color: '#333' }}>
                      Plagiarism Score: {plagiarismScore}%
                    </p>
                    <p
                      style={{
                        fontWeight: 'bold',
                        color: plagiarized ? '#dc3545' : '#28a745',
                        marginTop: '5px',
                      }}
                    >
                      {plagiarized ? '❌ Report may be plagiarized' : '✅ Report appears original'}
                    </p>

                    <button
                      onClick={exportPlagiarismReport}
                      disabled={!plagiarismScore}
                      style={{
                        backgroundColor: plagiarismScore ? '#ffc107' : '#6c757d',
                        color: 'white',
                        border: 'none',
                        padding: '8px 15px',
                        borderRadius: '4px',
                        cursor: plagiarismScore ? 'pointer' : 'not-allowed',
                        fontSize: '14px',
                        marginTop: '10px',
                        transition: 'background-color 0.2s',
                      }}
                      onMouseOver={(e) => {
                        if (plagiarismScore) e.currentTarget.style.backgroundColor = '#e0a800';
                      }}
                      onMouseOut={(e) => {
                        if (plagiarismScore) e.currentTarget.style.backgroundColor = '#ffc107';
                      }}
                    >
                      Export Plagiarism Report
                    </button>

                    {plagiarismDetails.length > 0 && (
                      <div style={{ marginTop: '15px' }}>
                        <h5 style={{ color: '#333', marginBottom: '10px' }}>Plagiarism Details:</h5>
                        {plagiarismDetails.map((match, index) => (
                          <div
                            key={index}
                            style={{
                              border: '1px solid #ddd',
                              borderRadius: '4px',
                              marginBottom: '10px',
                              padding: '10px',
                              backgroundColor: '#fff',
                            }}
                          >
                            <div
                              style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                cursor: 'pointer',
                              }}
                              onClick={() => toggleMatchDetails(index)}
                            >
                              <p style={{ margin: '0', fontWeight: 'bold', fontSize: '14px' }}>
                                Matched Document: {match.documentUrl.split('/').pop()} (
                                {match.similarityScore}%)
                              </p>
                              <span style={{ fontSize: '14px', color: '#007bff' }}>
                                {expandedMatches[index] ? 'Hide Details' : 'Show Details'}
                              </span>
                            </div>
                            {expandedMatches[index] && match.similarSections.length > 0 && (
                              <div style={{ marginTop: '10px' }}>
                                <h6 style={{ fontSize: '14px', color: '#333', marginBottom: '8px' }}>
                                  Similar Sections:
                                </h6>
                                <ul style={{ paddingLeft: '20px', fontSize: '13px', color: '#555' }}>
                                  {match.similarSections.map((section, i) => (
                                    <li key={i} style={{ marginBottom: '10px' }}>
                                      <strong>Original:</strong> {section.original} <br />
                                      <strong>Matched:</strong> {section.matched} <br />
                                      <strong>Similarity:</strong> {section.similarity}%
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
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
                    border: '1px solid #ddd',
                  }}
                />
              </div>

              {error.submission && (
                <div
                  style={{
                    marginBottom: '15px',
                    color: '#dc3545',
                    backgroundColor: '#f8d7da',
                    padding: '10px',
                    borderRadius: '4px',
                    border: '1px solid #f5c6cb',
                  }}
                >
                  {error.submission}
                </div>
              )}

              {submitSuccess && (
                <div
                  style={{
                    marginBottom: '15px',
                    color: '#155724',
                    backgroundColor: '#d4edda',
                    padding: '10px',
                    borderRadius: '4px',
                    border: '1px solid #c3e6cb',
                  }}
                >
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
                  alignItems: 'center',
                  transition: 'background-color 0.2s',
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

        <style>
          {`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}
        </style>
      </div>
    </div>
  );
};

export default DeliverableDetails;