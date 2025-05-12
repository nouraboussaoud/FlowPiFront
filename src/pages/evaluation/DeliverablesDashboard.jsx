import React, { useEffect, useState } from 'react';
import LayoutStudent from '../dashboard/LayoutStudent';
import axios from 'axios';

const DeliverablesHistory = () => {
  const [deliverables, setDeliverables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDeliverables = async () => {
      const token = localStorage.getItem('authToken') || localStorage.getItem('token');
      console.log('localStorage contents:', Object.fromEntries(Object.entries(localStorage)));
      console.log('Using token:', token);

      if (!token || !token.startsWith('eyJhbGci')) {
        setError('No valid authentication token found. Please log in again.');
        setLoading(false);
        return;
      }

      // Validate token expiration
      let payload;
      try {
        payload = JSON.parse(atob(token.split('.')[1]));
        console.log('Token payload:', payload);
        const currentTime = Math.floor(Date.now() / 1000);
        if (payload.exp && payload.exp < currentTime) {
          console.log('Token expired at:', new Date(payload.exp * 1000));
          setError('Authentication token has expired. Please log in again.');
          localStorage.removeItem('authToken');
          localStorage.removeItem('token');
          setLoading(false);
          return;
        }
        if (!payload.userId && payload.id) {
          console.warn("Token uses 'id' instead of 'userId'. Backend may expect 'userId'.");
        }
      } catch (err) {
        console.error('Failed to decode token:', err);
        setError('Invalid token format. Please log in again.');
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get('http://localhost:5000/api/deliverables/history', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        console.log('Backend response:', response.data);
        setDeliverables(response.data.deliverables || []);
      } catch (error) {
        console.error('Error fetching deliverables:', error);
        if (error.response) {
          console.log('Error status:', error.response.status);
          console.log('Error data:', error.response.data);
          setError(`Failed to load deliverables: ${error.response.data.message || error.response.statusText}`);
        } else {
          setError('Failed to connect to the server. Please try again later.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchDeliverables();
  }, []);

  return (
    <LayoutStudent>
      <div className="container-fluid px-4">
        <div className="row">
          <div className="col-xl-9">
            <div className="card mb-4">
              <div className="card-header bg-transparent border-bottom">
                <h3 className="card-header-title mb-0">Deliverables History</h3>
              </div>
              <div className="card-body">
                {loading ? (
                  <div className="text-center">
                    <div className="spinner-border" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                    <p>Loading deliverables...</p>
                  </div>
                ) : error ? (
                  <div className="alert alert-danger" role="alert">
                    {error}
                  </div>
                ) : deliverables.length === 0 ? (
                  <p>No deliverables available.</p>
                ) : (
                  <table className="table table-striped">
                    <thead>
                      <tr>
                        <th>Title</th>
                        <th>Submission Date</th>
                        <th>Description</th>
                        <th>Mark</th>
                      </tr>
                    </thead>
                    <tbody>
                      {deliverables.map((deliverable) => (
                        <tr key={deliverable._id}>
                          <td>{deliverable.title}</td>
                          <td>{new Date(deliverable.submission_date).toLocaleDateString()}</td>
                          <td>{deliverable.description}</td>
                          <td>
                            {deliverable.evaluation && deliverable.evaluation.evaluationScore !== undefined ? (
                              <span
                                style={{
                                  color:
                                    deliverable.evaluation.evaluationScore < 30
                                      ? '#dc3545' // Red
                                      : deliverable.evaluation.evaluationScore > 60
                                      ? '#28a745' // Green
                                      : '#ffc107', // Yellow
                                  fontWeight: 'bold',
                                }}
                              >
                                {deliverable.evaluation.evaluationScore}
                              </span>
                            ) : (
                              'Not evaluated yet'
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </LayoutStudent>
  );
};

export default DeliverablesHistory;