import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Autocomplete,
  TextField,
  Chip,
  Button,
  Box,
  Typography,
  CircularProgress,
  Alert,
  Snackbar
} from '@mui/material';

// Static skills list
const STATIC_SKILLS = [
  "javascript", "python", "java", "c#", "c++", "react", "angular", 
  "vue.js", "node.js", "express", "mongodb", "mysql", "postgresql",
  "docker", "git", "aws", "azure", "machine learning", "data science",
  "cybersecurity", "typescript", "php", "ruby", "swift", "kotlin",
  "django", "flask", "spring", "laravel", "tensorflow", "pytorch", 
  "nlp", "computer vision" , "redux" , "graphql" , "flutter" , "react native" , "jest" , "css" , "sql" , "airflow" , "pyspark"
];

const SkillsManager = () => {
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const token = localStorage.getItem('token');

  // Fetch existing user skills
  useEffect(() => {
    if (token) {
      const fetchUserSkills = async () => {
        try {
          setLoading(true);
          const response = await axios.get('http://localhost:5000/api/users/me/skills', {
            headers: { Authorization: `Bearer ${token}` }
          });
          setSelectedSkills(response.data || []);
        } catch (err) {
          console.error("Error fetching user skills:", err);
        
        } finally {
          setLoading(false);
        }
      };
      fetchUserSkills();
    }
  }, [token]);
  

  // Save skills
  const handleSave = async () => {
    try {
      setLoading(true);
      setError(null);
      
      await axios.put(
        'http://localhost:5000/api/users/skills',
        { skills: selectedSkills },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setSuccess("Skills successfully saved!");
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError("Error saving skills. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', p: 3 }}>
      <Typography variant="h4" gutterBottom>
        My Skills
      </Typography>
      
      <Typography paragraph>
      If you have already selected your skills, you can update them below. Otherwise, please select up to 10 skills that best represent you:
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {success && (
        <Snackbar open={!!success} autoHideDuration={3000} onClose={() => setSuccess(null)}>
          <Alert severity="success">{success}</Alert>
        </Snackbar>
      )}

      <Autocomplete
        multiple
        options={STATIC_SKILLS}
        value={selectedSkills}
        onChange={(event, newValue) => {
          if (newValue.length <= 10) {
            setSelectedSkills(newValue);
          }
        }}
        renderTags={(value, getTagProps) =>
          value.map((option, index) => (
            <Chip
              key={index}
              label={option}
              {...getTagProps({ index })}
              sx={{ m: 0.5 }}
            />
          ))
        }
        renderInput={(params) => (
          <TextField
            {...params}
            label="Select your skills"
            placeholder="Search..."
          />
        )}
        sx={{ mb: 3 }}
        noOptionsText="No skill found"
        disabled={!token || loading}
      />

      <Button
        variant="contained"
        onClick={handleSave}
        disabled={!token || loading || selectedSkills.length === 0}
        startIcon={loading ? <CircularProgress size={20} /> : null}
      >
        Save
      </Button>

      {!token && (
        <Alert severity="warning" sx={{ mt: 2 }}>
          Please log in to save your skills.
        </Alert>
      )}
    </Box>
  );
};

export default SkillsManager;
