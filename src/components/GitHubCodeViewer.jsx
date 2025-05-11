import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Code, Copy, Check, ExternalLink } from 'lucide-react';

const GitHubCodeViewer = ({ repoOwner, repoName, filePath, commitSha }) => {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchCode = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // GitHub API URL to fetch raw file content
        const url = `https://api.github.com/repos/${repoOwner}/${repoName}/contents/${filePath}${commitSha ? `?ref=${commitSha}` : ''}`;
        
        const response = await axios.get(url, {
          headers: {
            'Accept': 'application/vnd.github.v3.raw',
            'Authorization': `Bearer ${process.env.REACT_APP_GITHUB_TOKEN || localStorage.getItem('githubToken')}`
          }
        });
        
        setCode(response.data);
      } catch (err) {
        console.error('Error fetching code from GitHub:', err);
        setError(err.response?.data?.message || 'Failed to fetch code from GitHub');
      } finally {
        setLoading(false);
      }
    };

    if (repoOwner && repoName && filePath) {
      fetchCode();
    } else {
      setError('Missing repository information');
      setLoading(false);
    }
  }, [repoOwner, repoName, filePath, commitSha]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getFileExtension = () => {
    return filePath.split('.').pop();
  };

  const getGitHubFileUrl = () => {
    return `https://github.com/${repoOwner}/${repoName}/blob/${commitSha || 'main'}/${filePath}`;
  };

  return (
    <div style={{
      backgroundColor: 'white',
      border: '1px solid #e5e7eb',
      borderRadius: '8px',
      overflow: 'hidden',
      marginBottom: '16px'
    }}>
      <div style={{
        backgroundColor: '#f8fafc',
        padding: '12px 16px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: '1px solid #e5e7eb'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          color: '#4b5563',
          fontSize: '0.875rem',
          fontFamily: 'monospace'
        }}>
          <Code size={16} />
          {filePath}
        </div>
        <div style={{
          display: 'flex',
          gap: '8px'
        }}>
          <button
            onClick={copyToClipboard}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              padding: '4px 8px',
              borderRadius: '4px',
              border: 'none',
              backgroundColor: '#f3f4f6',
              color: '#4b5563',
              fontSize: '0.75rem',
              cursor: 'pointer'
            }}
          >
            {copied ? <Check size={14} /> : <Copy size={14} />}
            {copied ? 'Copied!' : 'Copy'}
          </button>
          <a
            href={getGitHubFileUrl()}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              padding: '4px 8px',
              borderRadius: '4px',
              border: 'none',
              backgroundColor: '#f3f4f6',
              color: '#4b5563',
              fontSize: '0.75rem',
              textDecoration: 'none',
              cursor: 'pointer'
            }}
          >
            <ExternalLink size={14} />
            View on GitHub
          </a>
        </div>
      </div>
      
      <div style={{
        position: 'relative',
        maxHeight: '300px',
        overflow: 'auto'
      }}>
        {loading ? (
          <div style={{
            padding: '16px',
            textAlign: 'center',
            color: '#6b7280'
          }}>
            Loading code...
          </div>
        ) : error ? (
          <div style={{
            padding: '16px',
            textAlign: 'center',
            color: '#ef4444'
          }}>
            {error}
          </div>
        ) : (
          <pre style={{
            margin: 0,
            padding: '16px',
            backgroundColor: '#f8fafc',
            color: '#1f2937',
            fontSize: '0.875rem',
            fontFamily: 'monospace',
            overflowX: 'auto',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word'
          }}>
            <code>{code}</code>
          </pre>
        )}
      </div>
    </div>
  );
};

export default GitHubCodeViewer;