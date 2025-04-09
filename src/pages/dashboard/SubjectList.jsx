import React, { useEffect, useState } from 'react';
import axios from 'axios';
import LayoutTutorss from './LayoutTutorss';

const SubjectList = () => {
  const [subjects, setSubjects] = useState([]);
  const [groups, setGroups] = useState([]);
  const [editingSubject, setEditingSubject] = useState(null);
  const [formData, setFormData] = useState({ 
    title: '', 
    description: '',
    assignedGroups: [],
    keyFeatures: [],
    aiFunctionalities: []
  });
  

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

  // Récupérer tous les sujets avec les groupes assignés
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

  // Récupérer tous les groupes
  const fetchGroups = async () => {
    const token = localStorage.getItem("token");
    try {
      const res = await axios.get('http://localhost:5000/api/group', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setGroups(res.data);
    } catch (err) {
      console.error("Error fetching groups:", err);
    }
  };

  useEffect(() => {
    fetchSubjects();
    fetchGroups();
  }, []);

  // Lancer l'édition d'un sujet
  const startEditing = (subject) => {
    setEditingSubject(subject._id);
    setFormData({ 
      title: subject.title, 
      description: subject.description,
      assignedGroups: subject.assignedGroups?.map(g => g._id) || [],
      keyFeatures: subject.keyFeatures.length > 0 ? [...subject.keyFeatures] : [{ title: '', description: '' }],
      aiFunctionalities: subject.aiFunctionalities.length > 0 ? [...subject.aiFunctionalities] : [{ title: '', description: '' }]
    });
  };

  // Supprimer un sujet
  const deleteSubject = async (id) => {
    const token = localStorage.getItem("token");
    try {
      await axios.delete(`http://localhost:5000/api/subject/deleteSubject/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSubjects(subjects.filter(subject => subject._id !== id));
    } catch (err) {
      console.error("Error deleting subject:", err);
    }
  };

  // Mettre à jour un sujet
  const handleUpdate = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    try {
      await axios.put(
        `http://localhost:5000/api/subject/updateSubject/${editingSubject}`, 
        formData, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("Subject updated successfully.");
      setEditingSubject(null);
      fetchSubjects();
    } catch (err) {
      console.error("Error updating subject:", err);
    }
  };

  // Gestion des features
  const handleFeatureChange = (type, index, field, value) => {
    const updatedFeatures = [...formData[type]];
    updatedFeatures[index][field] = value;
    setFormData({ ...formData, [type]: updatedFeatures });
  };

  const addFeature = (type) => {
    setFormData({ 
      ...formData, 
      [type]: [...formData[type], { title: '', description: '' }] 
    });
  };

  const removeFeature = (type, index) => {
    const filteredFeatures = formData[type].filter((_, i) => i !== index);
    setFormData({ ...formData, [type]: filteredFeatures });
  };

  return (
    <LayoutTutorss>
      <div className="container mt-4">
        <h2 className="text-center mb-4"> List of Subjects</h2>

        {subjects.map(subject => (
          <div key={subject._id} className="card mb-4 p-4 shadow-sm">
            <div className="d-flex justify-content-between align-items-start">
              <div>
                <h3>{subject.title}</h3>
                <p className="text-muted small">Created: {formatDate(subject.createdAt)}</p>
              </div>
              <div>
                <button 
                  className="btn btn-sm btn-outline-primary me-2"
                  onClick={() => startEditing(subject)}
                >
                  ✏️ Edit
                </button>
                <button 
                  className="btn btn-sm btn-outline-danger"
                  onClick={() => deleteSubject(subject._id)}
                >
                  🗑️ Delete
                </button>
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

            {/* Section pour afficher les groupes assignés */}
            <div className="row mt-3">
              <div className="col-12">
                <h5>Assigned Groups</h5>
                {subject.assignedGroups?.length > 0 ? (
                  <div className="d-flex flex-wrap gap-2">
                    {subject.assignedGroups.map(group => (
                      <span key={group._id} className="badge bg-primary">
                        {group.name} 
                       
                      </span>
                    ))}
                  </div>
                ) : (
                  <div className="alert alert-warning py-2 mb-0">
                    No groups assigned to this subject
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}

        {editingSubject && (
          <div className="modal" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog modal-lg">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Edit Subject</h5>
                  <button 
                    type="button" 
                    className="btn-close" 
                    onClick={() => setEditingSubject(null)}
                  ></button>
                </div>
                <form onSubmit={handleUpdate}>
                  <div className="modal-body">
                    <div className="mb-3">
                      <label className="form-label">Title</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.title}
                        onChange={(e) => setFormData({...formData, title: e.target.value})}
                        required
                      />
                    </div>
                    
                    <div className="mb-3">
                      <label className="form-label">Description</label>
                      <textarea
                        className="form-control"
                        rows="3"
                        value={formData.description}
                        onChange={(e) => setFormData({...formData, description: e.target.value})}
                        required
                      />
                    </div>

                   
                    <div className="row">
                      <div className="col-md-6">
                        <div className="d-flex justify-content-between align-items-center mb-2">
                          <h6>Key Features</h6>
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-primary"
                            onClick={() => addFeature('keyFeatures')}
                          >
                            Add
                          </button>
                        </div>
                        {formData.keyFeatures.map((feature, index) => (
                          <div key={index} className="card mb-2 p-2">
                            <div className="mb-2">
                              <input
                                type="text"
                                className="form-control"
                                placeholder="Title"
                                value={feature.title}
                                onChange={(e) => handleFeatureChange('keyFeatures', index, 'title', e.target.value)}
                              />
                            </div>
                            <div className="mb-2">
                              <textarea
                                className="form-control"
                                placeholder="Description"
                                rows="2"
                                value={feature.description}
                                onChange={(e) => handleFeatureChange('keyFeatures', index, 'description', e.target.value)}
                              />
                            </div>
                            <button
                              type="button"
                              className="btn btn-sm btn-outline-danger"
                              onClick={() => removeFeature('keyFeatures', index)}
                            >
                              Remove
                            </button>
                          </div>
                        ))}
                      </div>
                      
                      <div className="col-md-6">
                        <div className="d-flex justify-content-between align-items-center mb-2">
                          <h6>AI Functionalities</h6>
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-primary"
                            onClick={() => addFeature('aiFunctionalities')}
                          >
                            Add
                          </button>
                        </div>
                        {formData.aiFunctionalities.map((func, index) => (
                          <div key={index} className="card mb-2 p-2">
                            <div className="mb-2">
                              <input
                                type="text"
                                className="form-control"
                                placeholder="Title"
                                value={func.title}
                                onChange={(e) => handleFeatureChange('aiFunctionalities', index, 'title', e.target.value)}
                              />
                            </div>
                            <div className="mb-2">
                              <textarea
                                className="form-control"
                                placeholder="Description"
                                rows="2"
                                value={func.description}
                                onChange={(e) => handleFeatureChange('aiFunctionalities', index, 'description', e.target.value)}
                              />
                            </div>
                            <button
                              type="button"
                              className="btn btn-sm btn-outline-danger"
                              onClick={() => removeFeature('aiFunctionalities', index)}
                            >
                              Remove
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button type="button" className="btn btn-secondary" onClick={() => setEditingSubject(null)}>
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-primary">
                      Save Changes
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </LayoutTutorss>
  );
};

export default SubjectList;