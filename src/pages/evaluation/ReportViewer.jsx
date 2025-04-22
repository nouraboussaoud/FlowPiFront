import React, { useState, useEffect } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import axios from 'axios';
import { 
  FaArrowLeft, 
  FaSearchPlus, 
  FaSearchMinus, 
  FaRobot, 
  FaCopy, 
  FaFileDownload,
  FaSpinner,
  FaExclamationTriangle
} from 'react-icons/fa';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import LayoutStudent from '../dashboard/LayoutStudent';

// Initialize PDF.js worker with error handling
const initializePdfWorker = () => {
  try {
    pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;
  } catch (err) {
    console.error('Failed to set PDF worker from CDN:', err);
    // Fallback to unpkg if Cloudflare fails
    pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;
  }
};

initializePdfWorker();

const ReportViewer = () => {
  const { deliverableId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  
  // State variables
  const [deliverable, setDeliverable] = useState(null);
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1.0);
  const [aiScore, setAiScore] = useState(null);
  const [plagiarismScore, setPlagiarismScore] = useState(null);
  const [loading, setLoading] = useState({
    report: true,
    ai: false,
    plagiarism: false,
    pdfWorker: false
  });
  const [pdfUrl, setPdfUrl] = useState(location.state?.fileUrl || null);
  const [pdfText, setPdfText] = useState('');
  const [error, setError] = useState(null);
  const [pdfWorkerError, setPdfWorkerError] = useState(false);

  // Handle PDF worker loading errors
  useEffect(() => {
    const handleWorkerError = (err) => {
      console.error('PDF worker error:', err);
      setPdfWorkerError(true);
      // Try fallback worker source
      pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;
    };

    pdfjs.GlobalWorkerOptions.workerErrorHandler = handleWorkerError;

    return () => {
      pdfjs.GlobalWorkerOptions.workerErrorHandler = null;
    };
  }, []);

  // Initialize the report viewer
  useEffect(() => {
    const initializeViewer = async () => {
      try {
        // If we have a direct URL from navigation state
        if (location.state?.fileUrl) {
          setLoading(prev => ({ ...prev, report: false }));
          return;
        }

        // Otherwise fetch from API
        const token = localStorage.getItem('authToken');
        if (!token) throw new Error('Authentication required');

        // Fetch deliverable metadata
        const deliverableResponse = await axios.get(
          `/api/deliverables/${deliverableId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setDeliverable(deliverableResponse.data);

        // Fetch PDF file
        const fileResponse = await axios.get(
          `/api/deliverables/${deliverableId}/file`,
          {
            headers: { Authorization: `Bearer ${token}` },
            responseType: 'blob'
          }
        );

        const blob = new Blob([fileResponse.data], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        setPdfUrl(url);

      } catch (err) {
        console.error('Initialization error:', err);
        setError(err.response?.data?.message || err.message || 'Failed to load report');
      } finally {
        setLoading(prev => ({ ...prev, report: false }));
      }
    };

    initializeViewer();
  }, [deliverableId, location.state]);

  // PDF handlers with enhanced error handling
  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
    setError(null);
    extractTextFromPdf();
  };

  const onDocumentLoadError = (error) => {
    console.error('PDF load error:', error);
    setError('Failed to load PDF document. Trying alternative viewer...');
    setPdfWorkerError(true);
  };

  // Extract text from PDF for analysis
  const extractTextFromPdf = async () => {
    if (!pdfUrl) return;
    
    try {
      const loadingTask = pdfjs.getDocument(pdfUrl);
      const pdf = await loadingTask.promise;
      
      let fullText = '';
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        fullText += textContent.items.map(item => item.str).join(' ');
      }
      
      setPdfText(fullText);
    } catch (err) {
      console.error('Text extraction failed:', err);
    }
  };

  // Analysis functions
  const runAiDetection = async () => {
    setLoading(prev => ({ ...prev, ai: true }));
    try {
      const token = localStorage.getItem('authToken');
      const response = await axios.post(
        '/api/aiDetection/analyze',
        { text: pdfText },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setAiScore(response.data.ai_probability);
    } catch (err) {
      console.error('AI detection failed:', err);
      setAiScore('Error');
    } finally {
      setLoading(prev => ({ ...prev, ai: false }));
    }
  };

  const runPlagiarismCheck = async () => {
    setLoading(prev => ({ ...prev, plagiarism: true }));
    try {
      const token = localStorage.getItem('authToken');
      const response = await axios.post(
        '/api/plagiarism/check',
        { text: pdfText },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setPlagiarismScore(response.data.plagiarism_score);
    } catch (err) {
      console.error('Plagiarism check failed:', err);
      setPlagiarismScore('Error');
    } finally {
      setLoading(prev => ({ ...prev, plagiarism: false }));
    }
  };

  // Navigation controls
  const goToPrevPage = () => setPageNumber(prev => Math.max(1, prev - 1));
  const goToNextPage = () => setPageNumber(prev => Math.min(numPages || 1, prev + 1));
  const zoomIn = () => setScale(prev => prev + 0.2);
  const zoomOut = () => setScale(prev => Math.max(0.5, prev - 0.2));
  const goBack = () => navigate(-1);

  // Download handler
  const downloadPdf = () => {
    if (!pdfUrl) return;
    
    const link = document.createElement('a');
    link.href = pdfUrl;
    link.download = `report_${deliverableId}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Render PDF viewer or fallback
  const renderPdfViewer = () => {
    if (pdfWorkerError) {
      return (
        <div style={styles.fallbackContainer}>
          <FaExclamationTriangle style={styles.warningIcon} />
          <p>PDF viewer failed to load. Showing alternative viewer...</p>
          <iframe
            src={pdfUrl}
            title="PDF Viewer"
            style={styles.pdfIframe}
          />
          <p>
            <a href={pdfUrl} style={styles.downloadLink}>
              Download PDF instead
            </a>
          </p>
        </div>
      );
    }

    return (
      <Document
        file={pdfUrl}
        onLoadSuccess={onDocumentLoadSuccess}
        onLoadError={onDocumentLoadError}
        loading={<div style={styles.loadingContainer}>Loading PDF viewer...</div>}
        error={<div style={styles.errorContainer}>Error loading PDF</div>}
      >
        <Page 
          pageNumber={pageNumber} 
          scale={scale}
          renderTextLayer={false}
          renderAnnotationLayer={false}
        />
      </Document>
    );
  };

  return (
    <LayoutStudent>
      <div className="report-viewer-container" style={styles.container}>
        {/* Header */}
        <div style={styles.header}>
          <button onClick={goBack} style={styles.backButton}>
            <FaArrowLeft /> Back
          </button>
          
          <h2 style={styles.title}>Report Viewer</h2>
          
          <button 
            onClick={downloadPdf} 
            style={styles.downloadButton} 
            disabled={!pdfUrl}
          >
            <FaFileDownload /> Download PDF
          </button>
        </div>
        
        {/* Deliverable Info */}
        {deliverable && (
          <div style={styles.deliverableInfo}>
            <h3>{deliverable.title}</h3>
            <p>Submitted: {new Date(deliverable.submission_date).toLocaleDateString()}</p>
            <p>{deliverable.description}</p>
          </div>
        )}
        
        {/* Main Content */}
        <div style={styles.mainContent}>
          {/* PDF Viewer */}
          <div style={styles.pdfContainer}>
            {/* PDF Controls */}
            <div style={styles.pdfControls}>
              <div style={styles.pageControls}>
                <button 
                  onClick={goToPrevPage} 
                  disabled={pageNumber <= 1}
                  style={styles.controlButton}
                >
                  Previous
                </button>
                <span>
                  Page {pageNumber} of {numPages || '--'}
                </span>
                <button 
                  onClick={goToNextPage} 
                  disabled={!numPages || pageNumber >= numPages}
                  style={styles.controlButton}
                >
                  Next
                </button>
              </div>
              
              <div style={styles.zoomControls}>
                <button onClick={zoomOut} style={styles.controlButton}>
                  <FaSearchMinus /> Zoom Out
                </button>
                <span>{Math.round(scale * 100)}%</span>
                <button onClick={zoomIn} style={styles.controlButton}>
                  <FaSearchPlus /> Zoom In
                </button>
              </div>
            </div>
            
            {/* PDF Display */}
            <div style={styles.pdfDisplay}>
              {loading.report ? (
                <div style={styles.loadingContainer}>
                  <FaSpinner className="spinner" />
                  <p>Loading report...</p>
                </div>
              ) : error ? (
                <div style={styles.errorContainer}>
                  <p style={styles.errorText}>{error}</p>
                  <button onClick={goBack} style={styles.errorButton}>
                    Return to Dashboard
                  </button>
                </div>
              ) : pdfUrl ? (
                renderPdfViewer()
              ) : (
                <div style={styles.errorContainer}>
                  <p>No PDF file available</p>
                </div>
              )}
            </div>
          </div>
          
          {/* Analysis Sidebar (remains the same as before) */}
          {/* ... */}
        </div>
      </div>
    </LayoutStudent>
  );
};

// Styles
const styles = {
  container: {
    padding: '20px',
    maxWidth: '1200px',
    margin: '0 auto'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px'
  },
  backButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 16px',
    backgroundColor: '#f3f4f6',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer'
  },
  title: {
    margin: 0,
    color: '#1f2937'
  },
  downloadButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 16px',
    backgroundColor: '#4f46e5',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer'
  },
  deliverableInfo: {
    marginBottom: '20px',
    padding: '15px',
    backgroundColor: '#f9fafb',
    borderRadius: '8px'
  },
  mainContent: {
    display: 'flex',
    gap: '20px',
    '@media (max-width: 768px)': {
      flexDirection: 'column'
    }
  },
  pdfContainer: {
    flex: 3,
    border: '1px solid #e5e7eb',
    borderRadius: '8px',
    overflow: 'hidden'
  },
  pdfControls: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '10px',
    backgroundColor: '#f3f4f6',
    borderBottom: '1px solid #e5e7eb'
  },
  pageControls: {
    display: 'flex',
    gap: '10px',
    alignItems: 'center'
  },
  zoomControls: {
    display: 'flex',
    gap: '10px',
    alignItems: 'center'
  },
  controlButton: {
    padding: '5px 10px',
    backgroundColor: '#fff',
    border: '1px solid #d1d5db',
    borderRadius: '4px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '5px'
  },
  pdfDisplay: {
    padding: '20px',
    display: 'flex',
    justifyContent: 'center',
    backgroundColor: '#f3f4f6',
    minHeight: '600px',
    overflow: 'auto'
  },
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    height: '100%'
  },
  errorContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    height: '100%',
    color: '#ef4444'
  },
  errorText: {
    margin: 0
  },
  errorButton: {
    padding: '8px 16px',
    backgroundColor: '#ef4444',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer'
  },
  sidebar: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
    minWidth: '250px'
  },
  panel: {
    border: '1px solid #e5e7eb',
    borderRadius: '8px',
    padding: '15px',
    backgroundColor: '#fff'
  },
  panelTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '15px',
    color: '#1f2937'
  },
  panelText: {
    fontSize: '14px',
    color: '#4b5563',
    marginBottom: '15px'
  },
  scoreBox: {
    padding: '10px',
    borderRadius: '4px',
    marginBottom: '15px'
  },
  scoreText: {
    fontWeight: 'bold',
    marginBottom: '5px'
  },
  scoreDescription: {
    fontSize: '14px',
    color: '#4b5563'
  },
  analyzeButton: {
    width: '100%',
    padding: '8px',
    backgroundColor: '#4f46e5',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px'
  },
  metadataItem: {
    marginBottom: '10px'
  },
  metadataLabel: {
    fontSize: '14px',
    fontWeight: 'bold',
    marginBottom: '3px'
  },
  metadataValue: {
    fontSize: '14px',
    padding: '2px 8px',
    display: 'inline-block',
    borderRadius: '9999px'
  },
  link: {
    fontSize: '14px',
    color: '#4f46e5',
    textDecoration: 'none'
  },
  fallbackContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    padding: '20px',
    textAlign: 'center'
  },
  warningIcon: {
    color: '#f59e0b',
    fontSize: '2rem',
    marginBottom: '1rem'
  },
  pdfIframe: {
    width: '100%',
    height: '600px',
    border: 'none',
    marginTop: '1rem'
  },
  downloadLink: {
    color: '#3b82f6',
    textDecoration: 'underline',
    marginTop: '1rem'
  }
};

export default ReportViewer;