import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';
import '../styles/ProfileSection.css';

const ProfileSection = () => {
  const { user, login } = useAuth();
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      const validTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!validTypes.includes(file.type)) {
        setMessage('Please select a PDF or DOC file');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setMessage('File size should be less than 5MB');
        return;
      }
      setSelectedFile(file);
      setMessage('');
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setMessage('Please select a file first');
      return;
    }

    setUploading(true);
    setMessage('');

    try {
      const formData = new FormData();
      formData.append('resume', selectedFile);

      const response = await authAPI.uploadResume(formData);
      setMessage('Resume uploaded successfully!');
      setSelectedFile(null);

      const updatedUser = await authAPI.getMe();
      localStorage.setItem('user', JSON.stringify(updatedUser.data));
      window.location.reload();
    } catch (error) {
      setMessage('Failed to upload resume: ' + (error.response?.data?.error || error.message));
    } finally {
      setUploading(false);
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="profile-section">
      <div className="profile-grid">
        <div className="profile-card">
          <div className="profile-card-header">
            <div className="profile-avatar-xl">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="profile-name">{user?.name}</h2>
              <p className="profile-email">{user?.email}</p>
              <span className="profile-role-badge">{user?.role}</span>
            </div>
          </div>

          <div className="profile-info">
            <div className="info-row">
              <span className="info-label">Account Created</span>
              <span className="info-value">{formatDate(user?.createdAt)}</span>
            </div>
          </div>
        </div>

        <div className="profile-card">
          <h3 className="card-title">Resume Upload</h3>
          <p className="card-description">
            Upload your resume to help us personalize your learning experience
          </p>

          {user?.resume ? (
            <div className="resume-info">
              <div className="resume-icon">📄</div>
              <div className="resume-details">
                <h4 className="resume-name">{user.resume.originalName}</h4>
                <div className="resume-meta">
                  <span>{formatFileSize(user.resume.size)}</span>
                  <span>•</span>
                  <span>Uploaded on {formatDate(user.resume.uploadedAt)}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="no-resume">
              <div className="no-resume-icon">📄</div>
              <p>No resume uploaded yet</p>
            </div>
          )}

          <div className="upload-section">
            <input
              type="file"
              id="resume-upload"
              accept=".pdf,.doc,.docx"
              onChange={handleFileSelect}
              className="file-input-hidden"
            />
            <label htmlFor="resume-upload" className="file-select-btn">
              📎 Choose Resume
            </label>

            {selectedFile && (
              <div className="selected-file-info">
                <span className="selected-file-name">{selectedFile.name}</span>
                <span className="selected-file-size">{formatFileSize(selectedFile.size)}</span>
              </div>
            )}

            {message && (
              <div className={`upload-message ${message.includes('success') ? 'success' : 'error'}`}>
                {message}
              </div>
            )}

            <button
              onClick={handleUpload}
              disabled={!selectedFile || uploading}
              className="upload-btn"
            >
              {uploading ? 'Uploading...' : user?.resume ? 'Update Resume' : 'Upload Resume'}
            </button>

            <p className="upload-hint">
              Accepted formats: PDF, DOC, DOCX (Max 5MB)
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileSection;
