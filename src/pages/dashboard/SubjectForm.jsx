import React, { useState } from 'react';
import LayoutTutor from './LayoutTutor';
import axios from 'axios';

const SubjectForm = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    keyFeatures: [{ title: '', description: '' }],
    aiFunctionalities: [{ title: '', description: '' }]
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Validation instantanée pour la limite de caractères
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
      // Effacer l'erreur si la longueur est correcte
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
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
          }))
      };

      await axios.post("http://localhost:5000/api/subject/createSubject", payload, {
        headers: { Authorization: `Bearer ${token}` }
      });

      alert("Subject added successfully!");
      // Reset form
      setFormData({
        title: '',
        description: '',
        keyFeatures: [{ title: '', description: '' }],
        aiFunctionalities: [{ title: '', description: '' }]
      });
      setErrors({});
    } catch (error) {
      console.error("Error:", error.response?.data || error.message);
      alert(error.response?.data?.message || "Error adding subject");
    } finally {
      setLoading(false);
    }
  };

  return (
    <LayoutTutor>
      <div className="container mt-4 p-4 shadow rounded bg-light" style={{ maxWidth: '700px' }}>
        <h3 className="mb-4 text-center text-primary">Create a New Subject</h3>
        
        <form onSubmit={handleSubmit}>
          {/* Title Field */}
          <div className="mb-3">
  <label className="form-label">Subject Title*</label>
  <input
    type="text"
    name="title"
    className={`form-control ${errors.title ? 'is-invalid' : ''}`}
    value={formData.title}
    onChange={handleChange}
    maxLength={100} // Bloque physiquement la saisie au-delà
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

          {/* Description Field */}
          <div className="mb-3">
  <label className="form-label">Subject Description*</label>
  <textarea
    name="description"
    className={`form-control ${errors.description ? 'is-invalid' : ''}`}
    rows="3"
    value={formData.description}
    onChange={handleChange}
    maxLength={500}
  ></textarea>
  {errors.description && (
    <div className="invalid-feedback d-block">
      {errors.description}
    </div>
  )}
  <small className="text-muted">
    {formData.description.length}/500 characters
  </small>
</div>

          {/* Key Features */}
          <h5 className="text-secondary">Key Features</h5>
          {formData.keyFeatures.map((item, index) => (
            <div key={index} className="row mb-2">
              <div className="col-md-6">
                <input
                  className="form-control"
                  placeholder="Feature Title"
                  value={item.title}
                  onChange={(e) => handleListChange(index, 'title', e.target.value, 'keyFeatures')}
                />
              </div>
              <div className="col-md-6">
                <input
                  className={`form-control ${errors[`keyFeatures_${index}_description`] ? 'is-invalid' : ''}`}
                  placeholder="Feature Description"
                  value={item.description}
                  onChange={(e) => handleListChange(index, 'description', e.target.value, 'keyFeatures')}
                />
                {errors[`keyFeatures_${index}_description`] && (
                  <div className="invalid-feedback">{errors[`keyFeatures_${index}_description`]}</div>
                )}
              </div>
              {formData.keyFeatures.length > 1 && (
                <button
                  type="button"
                  className="btn btn-sm btn-outline-danger mt-2"
                  onClick={() => removeItem(index, 'keyFeatures')}
                >
                  Remove
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            className="btn btn-outline-primary btn-sm mb-3"
            onClick={() => addItem('keyFeatures')}
          >
            + Add Key Feature
          </button>

          {/* AI Functionalities */}
          <h5 className="text-secondary">AI Functionalities</h5>
          {formData.aiFunctionalities.map((item, index) => (
            <div key={index} className="row mb-2">
              <div className="col-md-6">
                <input
                  className="form-control"
                  placeholder="AI Title"
                  value={item.title}
                  onChange={(e) => handleListChange(index, 'title', e.target.value, 'aiFunctionalities')}
                />
              </div>
              <div className="col-md-6">
                <input
                  className={`form-control ${errors[`aiFunc_${index}_description`] ? 'is-invalid' : ''}`}
                  placeholder="AI Description"
                  value={item.description}
                  onChange={(e) => handleListChange(index, 'description', e.target.value, 'aiFunctionalities')}
                />
                {errors[`aiFunc_${index}_description`] && (
                  <div className="invalid-feedback">{errors[`aiFunc_${index}_description`]}</div>
                )}
              </div>
              {formData.aiFunctionalities.length > 1 && (
                <button
                  type="button"
                  className="btn btn-sm btn-outline-danger mt-2"
                  onClick={() => removeItem(index, 'aiFunctionalities')}
                >
                  Remove
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            className="btn btn-outline-success btn-sm mb-4"
            onClick={() => addItem('aiFunctionalities')}
          >
            + Add AI Functionality
          </button>

          <button type="submit" className="btn btn-primary w-100" disabled={loading}>
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2"></span>
                Submitting...
              </>
            ) : (
              'Add Subject'
            )}
          </button>
        </form>
      </div>
    </LayoutTutor>
  );
};

export default SubjectForm;