
import React, { useEffect, useState } from 'react';
import LayoutTutorss from '../dashboard/LayoutTutorss';
import LeftSideBar from '../components/LeftSideBar';
import DeliverableDetails from './DeliverableDetailsModal';
import axios from 'axios';

const TutorsDeliverables = () => {
  const [deliverables, setDeliverables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDeliverable, setSelectedDeliverable] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('authToken') || localStorage.getItem('token');

    const fetchDeliverables = async () => {
      try {
        const response = await axios.get('/api/deliverables/getAllDeliverables', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        // Check if response has the expected format
        if (response.data.success && response.data.data) {
          setDeliverables(response.data.data);
        } else {
          throw new Error('Unexpected response format');
        }
      } catch (err) {
        console.error('Fetch error:', err);
        setDeliverables([]);
      } finally {
        setLoading(false);
      }
    };

    fetchDeliverables();
  }, []);

  const handleViewDetails = (deliverable) => {
    console.log('Selected Deliverable:', deliverable);
    setSelectedDeliverable(deliverable);
  };

  const handleCloseModal = () => {
    setSelectedDeliverable(null);
  };

  const handleSubmitEvaluation = (updatedDeliverable) => {
    setDeliverables((prev) =>
      prev.map((d) => (d._id === updatedDeliverable._id ? updatedDeliverable : d))
    );
  };

  return (
    <LayoutTutorss>
      <div className="container-fluid px-4">
        <div className="row">
          <div className="col-xl-9">
            <div className="card mb-4">
              <div className="card-header bg-transparent border-bottom">
                <h3 className="card-header-title mb-0">Tutor's Deliverables</h3>
              </div>
              <div className="card-body">
                {loading ? (
                  <p>Loading...</p>
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
                        <th>Actions</th>
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
                          <td>
                            <button
                              className="btn btn-primary"
                              onClick={() => handleViewDetails(deliverable)}
                            >
                              View
                            </button>
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
      {selectedDeliverable && (
        <DeliverableDetails
          deliverable={selectedDeliverable}
          onClose={handleCloseModal}
          onSubmitEvaluation={handleSubmitEvaluation}
        />
      )}
    </LayoutTutorss>
  );
};

export default TutorsDeliverables;
