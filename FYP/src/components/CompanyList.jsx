import { useState } from 'react';
import { companyAPI } from '../services/api';
import '../styles/FolderList.css';

const CompanyList = ({ companies, onCompanyCreated, onCompanySelect, onCompanyDelete, loading }) => {
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setCreating(true);

    try {
      const response = await companyAPI.create({ name, description });
      onCompanyCreated(response.data);
      setName('');
      setDescription('');
      setShowModal(false);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create company');
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (e, companyId) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this company?')) {
      try {
        await companyAPI.delete(companyId);
        onCompanyDelete(companyId);
      } catch (err) {
        alert('Failed to delete company');
      }
    }
  };

  if (loading) {
    return <div className="loading">Loading companies...</div>;
  }

  return (
    <div className="folder-container">
      <div className="folder-header">
        <h2 className="folder-title">Companies</h2>
        <button onClick={() => setShowModal(true)} className="create-button">
          + New Company
        </button>
      </div>

      <div className="folder-grid">
        {companies.map((company) => (
          <div
            key={company._id}
            className="folder-card"
            onClick={() => onCompanySelect(company)}
          >
            <div className="folder-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
              </svg>
            </div>
            <h3 className="folder-name">{company.name}</h3>
            {company.description && (
              <p className="folder-description">{company.description}</p>
            )}
            <button
              onClick={(e) => handleDelete(e, company._id)}
              className="delete-button"
            >
              Delete
            </button>
          </div>
        ))}

        {companies.length === 0 && (
          <div className="empty-state">
            <p>No companies yet. Create your first company to get started.</p>
          </div>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Create New Company</h3>
              <button onClick={() => setShowModal(false)} className="close-button">
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit} className="modal-form">
              {error && <div className="error-message">{error}</div>}

              <div className="form-group">
                <label htmlFor="name" className="form-label">Company Name</label>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="form-input"
                  placeholder="e.g., Google, Microsoft"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="description" className="form-label">Description (Optional)</label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="form-textarea"
                  placeholder="Brief description about this company"
                  rows={3}
                />
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
                  disabled={creating}
                >
                  {creating ? 'Creating...' : 'Create Company'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CompanyList;
