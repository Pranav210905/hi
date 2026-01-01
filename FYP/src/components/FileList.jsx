import { useState, useEffect } from 'react';
import { fileAPI } from '../services/api';
import '../styles/FolderList.css';

const FileList = ({ topic, company }) => {
  const [files, setFiles] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadFiles();
  }, [topic]);

  const loadFiles = async () => {
    try {
      const response = await fileAPI.getByTopic(topic._id);
      setFiles(response.data);
    } catch (error) {
      console.error('Error loading files:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      setError('Please select a file');
      return;
    }

    setError('');
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('topicId', topic._id);
      formData.append('companyId', company._id);

      const response = await fileAPI.upload(formData);
      setFiles([response.data, ...files]);
      setSelectedFile(null);
      setShowModal(false);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to upload file');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (e, fileId) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this file?')) {
      try {
        await fileAPI.delete(fileId);
        setFiles(files.filter(f => f._id !== fileId));
      } catch (err) {
        alert('Failed to delete file');
      }
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  if (loading) {
    return <div className="loading">Loading files...</div>;
  }

  return (
    <div className="folder-container">
      <div className="folder-header">
        <h2 className="folder-title">Files in {topic.name}</h2>
        <button onClick={() => setShowModal(true)} className="create-button">
          + Upload File
        </button>
      </div>

      <div className="folder-grid">
        {files.map((file) => (
          <div key={file._id} className="folder-card file-card">
            <div className="folder-icon file-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" />
                <polyline points="13 2 13 9 20 9" />
              </svg>
            </div>
            <h3 className="folder-name">{file.originalName}</h3>
            <p className="file-size">{formatFileSize(file.size)}</p>
            <button
              onClick={(e) => handleDelete(e, file._id)}
              className="delete-button"
            >
              Delete
            </button>
          </div>
        ))}

        {files.length === 0 && (
          <div className="empty-state">
            <p>No files yet. Upload your first file to get started.</p>
          </div>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Upload File</h3>
              <button onClick={() => setShowModal(false)} className="close-button">
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit} className="modal-form">
              {error && <div className="error-message">{error}</div>}

              <div className="form-group">
                <label htmlFor="file" className="form-label">Select File</label>
                <div className="file-input-wrapper">
                  <input
                    id="file"
                    type="file"
                    onChange={handleFileSelect}
                    className="file-input"
                    required
                  />
                  {selectedFile && (
                    <div className="selected-file">
                      <span>{selectedFile.name}</span>
                      <span className="file-size-small">{formatFileSize(selectedFile.size)}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="cancel-button"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="submit-button"
                  disabled={uploading}
                >
                  {uploading ? 'Uploading...' : 'Upload File'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FileList;
