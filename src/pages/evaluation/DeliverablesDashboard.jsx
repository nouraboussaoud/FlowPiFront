import React, { useEffect, useState } from 'react';
import LayoutStudent from '../dashboard/LayoutStudent';
import LeftSideBar from '../components/LeftSideBar';
import axios from 'axios';

const DeliverablesHistory = () => {
  const [deliverables, setDeliverables] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");//douaa
 
    console.log('Token from Local Storage:', token);
    const fetchDeliverables = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/deliverables/history', {
          headers: {
       
            
            Authorization: `Bearer ${localStorage.getItem('token')}`,//douaa
          },
          withCredentials: true
        });
        setDeliverables(response.data.deliverables);
      } catch (error) {
        console.error('Error fetching deliverables:', error);
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
                      </tr>
                    </thead>
                    <tbody>
                      {deliverables.map((deliverable) => (
                        <tr key={deliverable._id}>
                          <td>{deliverable.title}</td>
                          <td>{new Date(deliverable.submission_date).toLocaleDateString()}</td>
                          <td>{deliverable.description}</td>
                          <td>
                            {deliverable.evaluation_score !== undefined
                              ? deliverable.evaluation_score
                              : 'Not evaluated yet'}
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