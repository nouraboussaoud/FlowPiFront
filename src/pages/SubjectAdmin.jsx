import React, { useEffect, useState } from 'react';
import axios from 'axios';
import DashboardLayout from "./DashboardLayout";

const SubjectList = () => {
  const [subjects, setSubjects] = useState([]);
  const [groups, setGroups] = useState([]);
  const [editingSubject, setEditingSubject] = useState(null);
  const [formData, setFormData] = useState({ 
    title: '', 
    description: '',
    assignedGroups: [],
    keyFeatures: [{ title: '', description: '' }],
    aiFunctionalities: [{ title: '', description: '' }]
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

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

  // Validation des champs
  const validate = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    } else if (formData.title.length > 100) {
      newErrors.title = 'Title must be less than 100 characters';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    } else if (formData.description.length > 500) {
      newErrors.description = 'Description must be less than 500 characters';
    }
    
    formData.keyFeatures.forEach((feature, index) => {
      if (feature.title && !feature.description) {
        newErrors[`keyFeatures_${index}_description`] = 'Description is required if title is provided';
      }
    });
    
    formData.aiFunctionalities.forEach((func, index) => {
      if (func.title && !func.description) {
        newErrors[`aiFunc_${index}_description`] = 'Description is required if title is provided';
      }
    });
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

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
    setErrors({});
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

  // Gestion des changements
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (name === 'title' && value.length > 100) {
      setErrors(prev => ({
        ...prev,
        title: 'Title must be 100 characters or less'
      }));
    } else if (name === 'description' && value.length > 500) {
      setErrors(prev => ({
        ...prev,
        description: 'Description must be 500 characters or less'
      }));
    } else {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

  const handleListChange = (index, field, value, listName) => {
    setFormData(prev => {
      const updatedList = [...prev[listName]];
      updatedList[index][field] = value;
      return { ...prev, [listName]: updatedList };
    });
  };

  const addItem = (listName) => {
    setFormData(prev => ({
      ...prev,
      [listName]: [...prev[listName], { title: '', description: '' }]
    }));
  };

  const removeItem = (index, listName) => {
    setFormData(prev => {
      const updatedList = [...prev[listName]];
      updatedList.splice(index, 1);
      return { ...prev, [listName]: updatedList };
    });
  };

  // Mettre à jour un sujet
  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    
    setLoading(true);
    const token = localStorage.getItem("token");
    try {
      const payload = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        keyFeatures: formData.keyFeatures
          .filter(f => f.title.trim() || f.description.trim())
          .map(f => ({
            title: f.title.trim(),
            description: f.description.trim()
          })),
        aiFunctionalities: formData.aiFunctionalities
          .filter(f => f.title.trim() || f.description.trim())
          .map(f => ({
            title: f.title.trim(),
            description: f.description.trim()
          })),
        assignedGroups: formData.assignedGroups
      };

      await axios.put(
        `http://localhost:5000/api/subject/updateSubject/${editingSubject}`, 
        payload, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("Subject updated successfully.");
      setEditingSubject(null);
      fetchSubjects();
    } catch (err) {
      console.error("Error updating subject:", err);
      alert(err.response?.data?.message || "Error updating subject");
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="container mt-4">
        <h2 className="text-center mb-4">List of Subjects</h2>

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
                      <label className="form-label">Title*</label>
                      <input
                        type="text"
                        name="title"
                        className={`form-control ${errors.title ? 'is-invalid' : ''}`}
                        value={formData.title}
                        onChange={handleChange}
                        maxLength={100}
                      />
                      {errors.title && (
                        <div className="invalid-feedback d-block">
                          {errors.title}
                        </div>
                      )}
                      <small className="text-muted">
                        {formData.title.length}/100 characters
                      </small>
                    </div>
                    
                    <div className="mb-3">
                      <label className="form-label">Description*</label>
                      <textarea
                        name="description"
                        className={`form-control ${errors.description ? 'is-invalid' : ''}`}
                        rows="3"
                        value={formData.description}
                        onChange={handleChange}
                        maxLength={500}
                      />
                      {errors.description && (
                        <div className="invalid-feedback d-block">
                          {errors.description}
                        </div>
                      )}
                      <small className="text-muted">
                        {formData.description.length}/500 characters
                      </small>
                    </div>

                    <div className="row">
                      <div className="col-md-6">
                        <div className="d-flex justify-content-between align-items-center mb-2">
                          <h6>Key Features</h6>
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-primary"
                            onClick={() => addItem('keyFeatures')}
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
                                onChange={(e) => handleListChange(index, 'title', e.target.value, 'keyFeatures')}
                              />
                            </div>
                            <div className="mb-2">
                              <textarea
                                className={`form-control ${errors[`keyFeatures_${index}_description`] ? 'is-invalid' : ''}`}
                                placeholder="Description"
                                rows="2"
                                value={feature.description}
                                onChange={(e) => handleListChange(index, 'description', e.target.value, 'keyFeatures')}
                              />
                              {errors[`keyFeatures_${index}_description`] && (
                                <div className="invalid-feedback">
                                  {errors[`keyFeatures_${index}_description`]}
                                </div>
                              )}
                            </div>
                            <button
                              type="button"
                              className="btn btn-sm btn-outline-danger"
                              onClick={() => removeItem(index, 'keyFeatures')}
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
                            onClick={() => addItem('aiFunctionalities')}
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
                                onChange={(e) => handleListChange(index, 'title', e.target.value, 'aiFunctionalities')}
                              />
                            </div>
                            <div className="mb-2">
                              <textarea
                                className={`form-control ${errors[`aiFunc_${index}_description`] ? 'is-invalid' : ''}`}
                                placeholder="Description"
                                rows="2"
                                value={func.description}
                                onChange={(e) => handleListChange(index, 'description', e.target.value, 'aiFunctionalities')}
                              />
                              {errors[`aiFunc_${index}_description`] && (
                                <div className="invalid-feedback">
                                  {errors[`aiFunc_${index}_description`]}
                                </div>
                              )}
                            </div>
                            <button
                              type="button"
                              className="btn btn-sm btn-outline-danger"
                              onClick={() => removeItem(index, 'aiFunctionalities')}
                            >
                              Remove
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button 
                      type="button" 
                      className="btn btn-secondary" 
                      onClick={() => setEditingSubject(null)}
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit" 
                      className="btn btn-primary"
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2"></span>
                          Updating...
                        </>
                      ) : (
                        'Save Changes'
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default SubjectList;