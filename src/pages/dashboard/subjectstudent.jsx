import React, { useEffect, useState } from 'react';
import axios from 'axios';
import LayoutTutor from './LayoutTutor';

const SubjectList = () => {
  const [subjects, setSubjects] = useState([]);

  // Formatage de la date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Récupérer tous les sujets
  const fetchSubjects = async () => {
    const token = localStorage.getItem("token");
    try {
      const res = await axios.get('http://localhost:5000/api/subject/getAllSubjects', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSubjects(res.data);
    } catch (err) {
      console.error("Error fetching subjects:", err);
    }
  };

  useEffect(() => {
    fetchSubjects();
  }, []);

  return (
    <LayoutTutor>
      <div className="container mt-4">
        <h2 className="text-center mb-4">📚 List of Subjects</h2>

        {subjects.map(subject => (
          <div key={subject._id} className="card mb-4 p-4 shadow-sm">
            <div className="d-flex justify-content-between align-items-start">
              <div>
                <h3>{subject.title}</h3>
                <p className="text-muted small">Created: {formatDate(subject.createdAt)}</p>
              </div>
            </div>
            
            <div className="mt-3">
              <p>{subject.description}</p>
            </div>
            
            <div className="row mt-3">
              <div className="col-md-6">
                <h5>Key Features</h5>
                <ul className="list-group">
                  {subject.keyFeatures?.map((feature, index) => (
                    <li key={index} className="list-group-item">
                      <strong>{feature.title}</strong>
                      <p className="mb-0">{feature.description}</p>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="col-md-6">
                <h5>AI Functionalities</h5>
                <ul className="list-group">
                  {subject.aiFunctionalities?.map((func, index) => (
                    <li key={index} className="list-group-item">
                      <strong>{func.title}</strong>
                      <p className="mb-0">{func.description}</p>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        ))}
      </div>
    </LayoutTutor>
  );
};

export default SubjectList;