import React, { useState } from 'react';
import LayoutTutor from './LayoutTutor';
import axios from 'axios';

const SubjectForm = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [keyFeatures, setKeyFeatures] = useState([{ title: '', description: '' }]);
  const [aiFunctionalities, setAiFunctionalities] = useState([{ title: '', description: '' }]);
  const [loading, setLoading] = useState(false);

  const handleListChange = (index, field, value, list, setList) => {
    const updated = [...list];
    updated[index][field] = value;
    setList(updated);
  };

  const addItem = (list, setList) => {
    setList([...list, { title: '', description: '' }]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = localStorage.getItem("token");

      const payload = {
        title,
        description,
        keyFeatures: keyFeatures.filter(f => f.title || f.description),
        aiFunctionalities: aiFunctionalities.filter(f => f.title || f.description)
      };

      await axios.post("http://localhost:5000/api/subject/createSubject", payload, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      alert("Subject added successfully!");
      setTitle('');
      setDescription('');
      setKeyFeatures([{ title: '', description: '' }]);
      setAiFunctionalities([{ title: '', description: '' }]);
    } catch (error) {
      alert("Error adding subject.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <LayoutTutor>
    <div className="container mt-4 p-4 shadow rounded bg-light" style={{ maxWidth: '700px' }}>
      <h3 className="mb-4 text-center text-primary">Create a New Subject</h3>
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label>Subject Title</label>
          <input
            type="text"
            className="form-control"
            value={title}
            onChange={e => setTitle(e.target.value)}
            required
          />
        </div>

        <div className="mb-3">
          <label>Subject Description</label>
          <textarea
            className="form-control"
            rows="3"
            value={description}
            onChange={e => setDescription(e.target.value)}
            required
          ></textarea>
        </div>

        <h5 className="text-secondary">Key Features</h5>
        {keyFeatures.map((item, index) => (
          <div key={index} className="row mb-2">
            <div className="col-md-6">
              <input
                className="form-control"
                placeholder="Feature Title"
                value={item.title}
                onChange={(e) => handleListChange(index, 'title', e.target.value, keyFeatures, setKeyFeatures)}
              />
            </div>
            <div className="col-md-6">
              <input
                className="form-control"
                placeholder="Feature Description"
                value={item.description}
                onChange={(e) => handleListChange(index, 'description', e.target.value, keyFeatures, setKeyFeatures)}
              />
            </div>
          </div>
        ))}
        <button type="button" className="btn btn-outline-primary btn-sm mb-3" onClick={() => addItem(keyFeatures, setKeyFeatures)}>
          + Add Key Feature
        </button>

        <h5 className="text-secondary">AI Functionalities</h5>
        {aiFunctionalities.map((item, index) => (
          <div key={index} className="row mb-2">
            <div className="col-md-6">
              <input
                className="form-control"
                placeholder="AI Title"
                value={item.title}
                onChange={(e) => handleListChange(index, 'title', e.target.value, aiFunctionalities, setAiFunctionalities)}
              />
            </div>
            <div className="col-md-6">
              <input
                className="form-control"
                placeholder="AI Description"
                value={item.description}
                onChange={(e) => handleListChange(index, 'description', e.target.value, aiFunctionalities, setAiFunctionalities)}
              />
            </div>
          </div>
        ))}
        <button type="button" className="btn btn-outline-success btn-sm mb-4" onClick={() => addItem(aiFunctionalities, setAiFunctionalities)}>
          + Add AI Functionality
        </button>

        <button type="submit" className="btn btn-primary w-100" disabled={loading}>
          {loading ? "Submitting..." : "Add Subject"}
        </button>
      </form>
    </div>
    </LayoutTutor>
  );
};

export default SubjectForm;
