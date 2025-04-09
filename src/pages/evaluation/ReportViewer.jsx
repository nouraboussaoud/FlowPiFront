import React, { useState, useEffect } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import axios from 'axios';
import { FaArrowLeft, FaSearchPlus, FaSearchMinus, FaRobot, FaCopy, FaFileDownload } from 'react-icons/fa';
import { useParams, useNavigate } from 'react-router-dom';
import LayoutStudent from '../dashboard/LayoutStudent';

// Set up PDF.js worker with the correct version number to match your installed package
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

const ReportViewer = () => {
  const { deliverableId } = useParams();
  const navigate = useNavigate();
  
  // State variables
  const [deliverable, setDeliverable] = useState(null);
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1.0);
  const [aiScore, setAiScore] = useState(null);
  const [aiScoreLoading, setAiScoreLoading] = useState(false);
  const [plagiarismScore, setPlagiarismScore] = useState(null);
  const [plagiarismLoading, setPlagiarismLoading] = useState(false);
  const [pdfUrl, setPdfUrl] = useState(null);
  const [pdfText, setPdfText] = useState('');
  const [error, setError] = useState(null);
  const [loadingReport, setLoadingReport] = useState(true);

  // Fetch deliverable data
  useEffect(() => {
    const fetchDeliverable = async () => {
      try {
        const token = localStorage.getItem('authToken');
        if (!token) {
          throw new Error('No authentication token found');
        }
        
        const response = await axios.get(`/api/deliverables/${deliverableId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        setDeliverable(response.data);
        console.log('Deliverable data:', response.data);
        
        // Get the PDF file URL (separate API call)
        fetchPdfFile(response.data);
      } catch (err) {
        console.error('Error fetching deliverable:', err);
        setError(`Failed to load deliverable data: ${err.message}`);
        setLoadingReport(false);
      }
    };

    if (deliverableId) {
      fetchDeliverable();
    }
  }, [deliverableId]);

  // Fetch PDF file
  const fetchPdfFile = async (deliverableData) => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('No authentication token found');
      }
      
      // Use direct URL construction for blob download
      const fileUrl = `/api/deliverables/${deliverableId}/file`;
      console.log('Attempting to fetch PDF from:', fileUrl);
      
      // Create an axios instance for binary data
      const response = await axios.get(fileUrl, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob'  // Important for binary data
      });
      
      // Validate the response
      const contentType = response.headers['content-type'];
      console.log('Response content type:', contentType);
      
      if (!contentType.includes('application/pdf')) {
        console.warn('Warning: Response is not a PDF. Content-Type:', contentType);
      }
      
      // Create a URL for the blob
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      console.log('Created blob URL:', url);
      
      setPdfUrl(url);
      setLoadingReport(false);
    } catch (err) {
      console.error('Error fetching PDF:', err);
      setError(`Failed to load PDF file: ${err.message}`);
      setLoadingReport(false);
    }
  };

  // PDF load handlers
  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
    setError(null);
    console.log('PDF loaded successfully with', numPages, 'pages');
    
    // After PDF loads successfully, extract text for analysis
    extractTextFromPdf();
  };
  
  const onDocumentLoadError = (err) => {
    console.error('PDF load error:', err);
    setError(`Failed to load PDF document: ${err.message}`);
  };

  // Extract text from PDF for analysis - using PDF.js tools
  const extractTextFromPdf = async () => {
    try {
      // Use the pdfjs library to extract text
      const loadingTask = pdfjs.getDocument(pdfUrl);
      const pdf = await loadingTask.promise;
      
      let fullText = '';
      
      // Extract text from each page
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map(item => item.str).join(' ');
        fullText += pageText + ' ';
      }
      
      console.log('Extracted text length:', fullText.length);
      setPdfText(fullText);
    } catch (error) {
      console.error('Error extracting text from PDF:', error);
    }
  };

  // Run AI detection on the report with proper error handling
  const runAiDetection = async () => {
    setAiScoreLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      
      // Updated API endpoint path to match server routes
      const response = await axios.post('/api/aiDetection/analyze', {
        text: pdfText  // Send the extracted text from PDF
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('AI detection response:', response.data);
      setAiScore(response.data.ai_probability);
    } catch (err) {
      console.error('AI detection error:', err);
      setAiScore("Error");
    } finally {
      setAiScoreLoading(false);
    }
  };

  // Run plagiarism check with proper error handling
  const runPlagiarismCheck = async () => {
    setPlagiarismLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      
      // Updated API endpoint path to match server routes
      const response = await axios.post('/api/plagiarism/analyze', {
        text: pdfText  // Send the extracted text from PDF
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('Plagiarism check response:', response.data);
      setPlagiarismScore(response.data.plagiarism_score);
    } catch (err) {
      console.error('Plagiarism check error:', err);
      setPlagiarismScore("Error");
    } finally {
      setPlagiarismLoading(false);
    }
  };

  // Navigation handlers remain the same
  const goToPrevPage = () => setPageNumber(pageNumber <= 1 ? 1 : pageNumber - 1);
  const goToNextPage = () => setPageNumber(pageNumber >= numPages ? numPages : pageNumber + 1);
  const zoomIn = () => setScale(scale + 0.2);
  const zoomOut = () => setScale(Math.max(0.6, scale - 0.2));
  const goBack = () => navigate(-1);

  // Download the PDF
  const downloadPdf = () => {
    if (pdfUrl) {
      const link = document.createElement('a');
      link.href = pdfUrl;
      link.download = `report-${deliverableId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  // Your render method remains the same...
  return (
    <LayoutStudent>
      <div className="report-viewer-container" style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
        {/* Header section */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <button
            onClick={goBack}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 16px',
              backgroundColor: '#f3f4f6',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            <FaArrowLeft /> Back
          </button>
          
          <h2>Report Viewer</h2>
          
          <div style={{ display: 'flex', gap: '10px' }}>
            <button 
              onClick={downloadPdf}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 16px',
                backgroundColor: '#4f46e5',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              <FaFileDownload /> Download PDF
            </button>
          </div>
        </div>
        
        {/* Details and control section */}
        {deliverable && (
          <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#f9fafb', borderRadius: '8px' }}>
            <h3>{deliverable.title}</h3>
            <p style={{ color: '#6b7280', fontSize: '14px' }}>
              Submitted on: {new Date(deliverable.submission_date).toLocaleDateString()}
            </p>
            <p style={{ marginTop: '10px' }}>{deliverable.description}</p>
          </div>
        )}
        
        {/* Main content area */}
        <div style={{ display: 'flex', gap: '20px' }}>
          {/* PDF Display area */}
          <div style={{ flex: '3', border: '1px solid #e5e7eb', borderRadius: '8px', overflow: 'hidden' }}>
            {/* PDF Navigation toolbar */}
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              padding: '10px', 
              backgroundColor: '#f3f4f6', 
              borderBottom: '1px solid #e5e7eb' 
            }}>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button 
                  onClick={goToPrevPage} 
                  disabled={pageNumber <= 1}
                  style={{
                    padding: '5px 10px',
                    backgroundColor: pageNumber <= 1 ? '#e5e7eb' : '#fff',
                    border: '1px solid #d1d5db',
                    borderRadius: '4px',
                    cursor: pageNumber <= 1 ? 'not-allowed' : 'pointer'
                  }}
                >
                  Previous
                </button>
                <span style={{ display: 'flex', alignItems: 'center' }}>
                  Page {pageNumber} of {numPages || '--'}
                </span>
                <button 
                  onClick={goToNextPage} 
                  disabled={!numPages || pageNumber >= numPages}
                  style={{
                    padding: '5px 10px',
                    backgroundColor: !numPages || pageNumber >= numPages ? '#e5e7eb' : '#fff',
                    border: '1px solid #d1d5db',
                    borderRadius: '4px',
                    cursor: !numPages || pageNumber >= numPages ? 'not-allowed' : 'pointer'
                  }}
                >
                  Next
                </button>
              </div>
              
              <div style={{ display: 'flex', gap: '10px' }}>
                <button 
                  onClick={zoomOut}
                  style={{
                    padding: '5px 10px',
                    backgroundColor: '#fff',
                    border: '1px solid #d1d5db',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px'
                  }}
                >
                  <FaSearchMinus /> Zoom Out
                </button>
                <span style={{ display: 'flex', alignItems: 'center' }}>
                  {Math.round(scale * 100)}%
                </span>
                <button 
                  onClick={zoomIn}
                  style={{
                    padding: '5px 10px',
                    backgroundColor: '#fff',
                    border: '1px solid #d1d5db',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px'
                  }}
                >
                  <FaSearchPlus /> Zoom In
                </button>
              </div>
            </div>
            
            {/* PDF Viewer */}
            <div style={{ 
              padding: '20px', 
              display: 'flex', 
              justifyContent: 'center',
              backgroundColor: '#f3f4f6',
              minHeight: '600px',
              overflow: 'auto'
            }}>
              {loadingReport ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                  <p>Loading report...</p>
                </div>
              ) : error ? (
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  height: '100%',
                  color: '#ef4444',
                  flexDirection: 'column',
                  gap: '10px'
                }}>
                  <p>{error}</p>
                  <button
                    onClick={goBack}
                    style={{
                      padding: '8px 16px',
                      backgroundColor: '#ef4444',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                  >
                    Return to Deliverables
                  </button>
                </div>
              ) : pdfUrl ? (
                <Document
                  file={pdfUrl}
                  onLoadSuccess={onDocumentLoadSuccess}
                  onLoadError={onDocumentLoadError}
                  loading={<div>Loading PDF...</div>}
                  error={<div>Error loading PDF!</div>}
                >
                  <Page 
                    pageNumber={pageNumber} 
                    scale={scale}
                    renderTextLayer={true}
                    renderAnnotationLayer={true}
                  />
                </Document>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                  <p>No PDF file available</p>
                </div>
              )}
            </div>
          </div>
          
          {/* Analysis sidebar - remained the same */}
          <div style={{ 
            flex: '1', 
            display: 'flex', 
            flexDirection: 'column', 
            gap: '20px',
            minWidth: '250px',
            maxWidth: '300px' 
          }}>
            {/* AI detection panel */}
            <div style={{ 
              border: '1px solid #e5e7eb', 
              borderRadius: '8px', 
              padding: '15px',
              backgroundColor: '#fff'
            }}>
              <h4 style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '8px',
                marginBottom: '15px',
                color: '#1f2937'
              }}>
                <FaRobot /> AI Content Detection
              </h4>
              
              {aiScore !== null ? (
                <div style={{ 
                  backgroundColor: aiScore > 0.7 ? '#fee2e2' : aiScore > 0.3 ? '#fef3c7' : '#ecfdf5',
                  padding: '10px', 
                  borderRadius: '4px',
                  marginBottom: '15px'
                }}>
                  <p style={{ fontWeight: 'bold', marginBottom: '5px' }}>
                    AI Score: {typeof aiScore === 'number' ? `${(aiScore * 100).toFixed(1)}%` : aiScore}
                  </p>
                  <p style={{ fontSize: '14px', color: '#4b5563' }}>
                    {aiScore > 0.7 
                      ? 'High probability of AI-generated content' 
                      : aiScore > 0.3 
                        ? 'Medium probability of AI-generated content'
                        : 'Low probability of AI-generated content'}
                  </p>
                </div>
              ) : (
                <div style={{ marginBottom: '15px' }}>
                  <p style={{ fontSize: '14px', color: '#4b5563' }}>
                    Run analysis to check if content was generated by AI
                  </p>
                </div>
              )}
              
              <button
                onClick={runAiDetection}
                disabled={aiScoreLoading || !pdfText}
                style={{
                  width: '100%',
                  padding: '8px',
                  backgroundColor: '#4f46e5',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: aiScoreLoading || !pdfText ? 'not-allowed' : 'pointer',
                  opacity: aiScoreLoading || !pdfText ? 0.7 : 1
                }}
              >
                {aiScoreLoading ? 'Analyzing...' : 'Run AI Detection'}
              </button>
            </div>
            
            {/* Plagiarism detection panel */}
            <div style={{ 
              border: '1px solid #e5e7eb', 
              borderRadius: '8px', 
              padding: '15px',
              backgroundColor: '#fff'
            }}>
              <h4 style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '8px',
                marginBottom: '15px',
                color: '#1f2937'
              }}>
                <FaCopy /> Plagiarism Check
              </h4>
              
              {plagiarismScore !== null ? (
                <div style={{ 
                  backgroundColor: plagiarismScore > 0.7 ? '#fee2e2' : plagiarismScore > 0.3 ? '#fef3c7' : '#ecfdf5',
                  padding: '10px', 
                  borderRadius: '4px',
                  marginBottom: '15px'
                }}>
                  <p style={{ fontWeight: 'bold', marginBottom: '5px' }}>
                    Plagiarism Score: {typeof plagiarismScore === 'number' ? `${(plagiarismScore * 100).toFixed(1)}%` : plagiarismScore}
                  </p>
                  <p style={{ fontSize: '14px', color: '#4b5563' }}>
                    {plagiarismScore > 0.7 
                      ? 'High amount of potentially plagiarized content' 
                      : plagiarismScore > 0.3 
                        ? 'Medium amount of potentially plagiarized content'
                        : 'Low amount of potentially plagiarized content'}
                  </p>
                </div>
              ) : (
                <div style={{ marginBottom: '15px' }}>
                  <p style={{ fontSize: '14px', color: '#4b5563' }}>
                    Run analysis to check for plagiarized content
                  </p>
                </div>
              )}
              
              <button
                onClick={runPlagiarismCheck}
                disabled={plagiarismLoading || !pdfText}
                style={{
                  width: '100%',
                  padding: '8px',
                  backgroundColor: '#4f46e5',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: plagiarismLoading || !pdfText ? 'not-allowed' : 'pointer',
                  opacity: plagiarismLoading || !pdfText ? 0.7 : 1
                }}
              >
                {plagiarismLoading ? 'Analyzing...' : 'Run Plagiarism Check'}
              </button>
            </div>
            
            {/* Additional details panel */}
            <div style={{ 
              border: '1px solid #e5e7eb', 
              borderRadius: '8px', 
              padding: '15px',
              backgroundColor: '#fff'
            }}>
              <h4 style={{ marginBottom: '15px', color: '#1f2937' }}>Report Details</h4>
              
              <div style={{ marginBottom: '10px' }}>
                <p style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '3px' }}>
                  Submission Date
                </p>
                <p style={{ fontSize: '14px', color: '#4b5563' }}>
                  {deliverable ? new Date(deliverable.submission_date).toLocaleDateString() : '--'}
                </p>
              </div>
              
              <div style={{ marginBottom: '10px' }}>
                <p style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '3px' }}>
                  Status
                </p>
                <p style={{ 
                  fontSize: '14px', 
                  padding: '2px 8px',
                  display: 'inline-block',
                  borderRadius: '9999px',
                  backgroundColor: deliverable?.status === 'evaluated' ? '#dcfce7' : '#fef3c7',
                  color: deliverable?.status === 'evaluated' ? '#166534' : '#92400e'
                }}>
                  {deliverable?.status === 'evaluated' ? 'Evaluated' : 'Pending'}
                </p>
              </div>
              
              {deliverable?.github_commit_url && (
                <div style={{ marginBottom: '10px' }}>
                  <p style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '3px' }}>
                    GitHub Commit
                  </p>
                  <a 
                    href={deliverable.github_commit_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ fontSize: '14px', color: '#4f46e5', textDecoration: 'none' }}
                  >
                    View Code on GitHub
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </LayoutStudent>
  );
};

export default ReportViewer;