import React, { useState } from 'react';
import LayoutTutorss from './LayoutTutorss';
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
    <LayoutTutorss>
      <div className="container mt-4 p-4 rounded bg-white" style={{ 
        maxWidth: '700px', 
        border: '1px solid #e5e7eb',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)'
      }}>
        <h3 className="mb-4 text-center" style={{ color: '#374151' }}>Create a New Subject</h3>
        
        <form onSubmit={handleSubmit}>
          {/* Title Field */}
          <div className="mb-3">
            <label className="form-label" style={{ color: '#4b5563' }}>Subject Title*</label>
            <input
              type="text"
              name="title"
              className={`form-control ${errors.title ? 'is-invalid' : ''}`}
              value={formData.title}
              onChange={handleChange}
              maxLength={100}
              style={{ 
                borderColor: '#e5e7eb',
                backgroundColor: '#f9fafb'
              }}
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
            <label className="form-label" style={{ color: '#4b5563' }}>Subject Description*</label>
            <textarea
              name="description"
              className={`form-control ${errors.description ? 'is-invalid' : ''}`}
              rows="3"
              value={formData.description}
              onChange={handleChange}
              maxLength={500}
              style={{ 
                borderColor: '#e5e7eb',
                backgroundColor: '#f9fafb'
              }}
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
          <h5 className="mb-3" style={{ color: '#4b5563' }}>Key Features</h5>
          {formData.keyFeatures.map((item, index) => (
            <div key={index} className="row mb-2">
              <div className="col-md-6">
                <input
                  className="form-control mb-2"
                  placeholder="Feature Title"
                  value={item.title}
                  onChange={(e) => handleListChange(index, 'title', e.target.value, 'keyFeatures')}
                  style={{ 
                    borderColor: '#e5e7eb',
                    backgroundColor: '#f9fafb'
                  }}
                />
              </div>
              <div className="col-md-6">
                <input
                  className={`form-control mb-2 ${errors[`keyFeatures_${index}_description`] ? 'is-invalid' : ''}`}
                  placeholder="Feature Description"
                  value={item.description}
                  onChange={(e) => handleListChange(index, 'description', e.target.value, 'keyFeatures')}
                  style={{ 
                    borderColor: '#e5e7eb',
                    backgroundColor: '#f9fafb'
                  }}
                />
                {errors[`keyFeatures_${index}_description`] && (
                  <div className="invalid-feedback">{errors[`keyFeatures_${index}_description`]}</div>
                )}
              </div>
              {formData.keyFeatures.length > 1 && (
                <div className="col-12">
                  <button
                    type="button"
                    className="btn btn-sm"
                    onClick={() => removeItem(index, 'keyFeatures')}
                    style={{ 
                      backgroundColor: 'transparent',
                      color: '#6b7280',
                      border: '1px solid #d1d5db'
                    }}
                  >
                    Remove Feature
                  </button>
                </div>
              )}
            </div>
          ))}
          <button
            type="button"
            className="btn btn-sm mb-4"
            onClick={() => addItem('keyFeatures')}
            style={{ 
              backgroundColor: 'transparent',
              color: '#374151',
              border: '1px solid #d1d5db'
            }}
          >
            + Add Key Feature
          </button>

          {/* AI Functionalities */}
          <h5 className="mb-3" style={{ color: '#4b5563' }}>AI Functionalities</h5>
          {formData.aiFunctionalities.map((item, index) => (
            <div key={index} className="row mb-2">
              <div className="col-md-6">
                <input
                  className="form-control mb-2"
                  placeholder="AI Title"
                  value={item.title}
                  onChange={(e) => handleListChange(index, 'title', e.target.value, 'aiFunctionalities')}
                  style={{ 
                    borderColor: '#e5e7eb',
                    backgroundColor: '#f9fafb'
                  }}
                />
              </div>
              <div className="col-md-6">
                <input
                  className={`form-control mb-2 ${errors[`aiFunc_${index}_description`] ? 'is-invalid' : ''}`}
                  placeholder="AI Description"
                  value={item.description}
                  onChange={(e) => handleListChange(index, 'description', e.target.value, 'aiFunctionalities')}
                  style={{ 
                    borderColor: '#e5e7eb',
                    backgroundColor: '#f9fafb'
                  }}
                />
                {errors[`aiFunc_${index}_description`] && (
                  <div className="invalid-feedback">{errors[`aiFunc_${index}_description`]}</div>
                )}
              </div>
              {formData.aiFunctionalities.length > 1 && (
                <div className="col-12">
                  <button
                    type="button"
                    className="btn btn-sm"
                    onClick={() => removeItem(index, 'aiFunctionalities')}
                    style={{ 
                      backgroundColor: 'transparent',
                      color: '#6b7280',
                      border: '1px solid #d1d5db'
                    }}
                  >
                    Remove Functionality
                  </button>
                </div>
              )}
            </div>
          ))}
          <button
            type="button"
            className="btn btn-sm mb-4"
            onClick={() => addItem('aiFunctionalities')}
            style={{ 
              backgroundColor: 'transparent',
              color: '#374151',
              border: '1px solid #d1d5db'
            }}
          >
            + Add AI Functionality
          </button>

          {/* Submit Button */}
          <button 
            type="submit" 
            className="btn w-100 py-2" 
            disabled={loading}
            style={{ 
              backgroundColor: '#374151',
              color: 'white',
              border: 'none',
              transition: 'all 0.2s'
            }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#4b5563'}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#374151'}
          >
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
    </LayoutTutorss>
  );
};

export default SubjectForm;