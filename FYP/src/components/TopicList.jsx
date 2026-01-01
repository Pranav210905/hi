import { useState, useEffect } from 'react';
import { topicAPI } from '../services/api';
import '../styles/FolderList.css';

const TopicList = ({ company, onTopicSelect }) => {
  const [topics, setTopics] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [creating, setCreating] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadTopics();
  }, [company]);

  const loadTopics = async () => {
    try {
      const response = await topicAPI.getByCompany(company._id);
      setTopics(response.data);
    } catch (error) {
      console.error('Error loading topics:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setCreating(true);

    try {
      const response = await topicAPI.create({
        name,
        description,
        companyId: company._id
      });
      setTopics([response.data, ...topics]);
      setName('');
      setDescription('');
      setShowModal(false);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create topic');
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (e, topicId) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this topic?')) {
      try {
        await topicAPI.delete(topicId);
        setTopics(topics.filter(t => t._id !== topicId));
      } catch (err) {
        alert('Failed to delete topic');
      }
    }
  };

  if (loading) {
    return <div className="loading">Loading topics...</div>;
  }

  return (
    <div className="folder-container">
      <div className="folder-header">
        <h2 className="folder-title">Topics in {company.name}</h2>
        <button onClick={() => setShowModal(true)} className="create-button">
          + New Topic
        </button>
      </div>

      <div className="folder-grid">
        {topics.map((topic) => (
          <div
            key={topic._id}
            className="folder-card"
            onClick={() => onTopicSelect(topic)}
          >
            <div className="folder-icon topic-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 7h-9" />
                <path d="M14 17H5" />
                <circle cx="17" cy="17" r="3" />
                <circle cx="7" cy="7" r="3" />
              </svg>
            </div>
            <h3 className="folder-name">{topic.name}</h3>
            {topic.description && (
              <p className="folder-description">{topic.description}</p>
            )}
            <button
              onClick={(e) => handleDelete(e, topic._id)}
              className="delete-button"
            >
              Delete
            </button>
          </div>
        ))}

        {topics.length === 0 && (
          <div className="empty-state">
            <p>No topics yet. Create your first topic to organize your files.</p>
          </div>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Create New Topic</h3>
              <button onClick={() => setShowModal(false)} className="close-button">
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit} className="modal-form">
              {error && <div className="error-message">{error}</div>}

              <div className="form-group">
                <label htmlFor="name" className="form-label">Topic Name</label>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="form-input"
                  placeholder="e.g., Aptitude, Reasoning, Coding"
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
                  placeholder="Brief description about this topic"
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
                  {creating ? 'Creating...' : 'Create Topic'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TopicList;
