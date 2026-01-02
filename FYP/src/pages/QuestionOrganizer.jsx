import { useState, useEffect } from 'react';
import { fileAPI, companyAPI, topicAPI } from '../services/api';
import '../styles/QuestionOrganizer.css';

const QuestionOrganizer = () => {
  const [step, setStep] = useState(1);
  const [companies, setCompanies] = useState([]);
  const [topics, setTopics] = useState([]);
  const [difficultyFiles, setDifficultyFiles] = useState({
    easy: [],
    medium: [],
    difficult: []
  });

  const [selectedCompany, setSelectedCompany] = useState('');
  const [selectedTopic, setSelectedTopic] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('');

  const [loading, setLoading] = useState(true);
  const [loadingTopics, setLoadingTopics] = useState(false);
  const [loadingFiles, setLoadingFiles] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [uploadFile, setUploadFile] = useState(null);

  const difficulties = ['easy', 'medium', 'difficult'];

  useEffect(() => {
    loadCompanies();
  }, []);

  const loadCompanies = async () => {
    try {
      setLoading(true);
      const response = await companyAPI.getAll();
      setCompanies(response.data);
    } catch (error) {
      console.error('Error loading companies:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCompanyChange = async (companyId) => {
    setSelectedCompany(companyId);
    setSelectedTopic('');
    setSelectedDifficulty('');
    setDifficultyFiles({ easy: [], medium: [], difficult: [] });

    if (!companyId) {
      setStep(1);
      return;
    }

    setStep(2);
    setLoadingTopics(true);
    try {
      const response = await topicAPI.getByCompany(companyId);
      setTopics(response.data);
    } catch (error) {
      console.error('Error loading topics:', error);
    } finally {
      setLoadingTopics(false);
    }
  };

  const handleTopicChange = async (topicId) => {
    setSelectedTopic(topicId);
    setSelectedDifficulty('');
    setDifficultyFiles({ easy: [], medium: [], difficult: [] });

    if (!topicId) {
      setStep(2);
      return;
    }

    setStep(3);
    setLoadingFiles(true);
    try {
      const response = await fileAPI.getAllByDifficulty(selectedCompany, topicId);
      setDifficultyFiles(response.data);
    } catch (error) {
      console.error('Error loading files:', error);
    } finally {
      setLoadingFiles(false);
    }
  };

  const handleUploadFile = async () => {
    if (!uploadFile || !selectedDifficulty) {
      alert('Please select difficulty level and file');
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', uploadFile);
      formData.append('companyId', selectedCompany);
      formData.append('topicId', selectedTopic);
      formData.append('difficulty', selectedDifficulty);

      await fileAPI.upload(formData);
      alert('File uploaded successfully!');
      setUploadFile(null);
      await handleTopicChange(selectedTopic);
    } catch (error) {
      alert('Failed to upload file: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteFile = async (fileId) => {
    if (confirm('Are you sure you want to delete this file?')) {
      try {
        await fileAPI.delete(fileId);
        await handleTopicChange(selectedTopic);
      } catch (error) {
        alert('Failed to delete file: ' + error.message);
      }
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className="question-organizer">
      <div className="progress-steps">
        <div className={`step ${step >= 1 ? 'active' : ''} ${step > 1 ? 'completed' : ''}`}>
          <div className="step-number">1</div>
          <div className="step-label">Company</div>
        </div>
        <div className="step-connector"></div>
        <div className={`step ${step >= 2 ? 'active' : ''} ${step > 2 ? 'completed' : ''}`}>
          <div className="step-number">2</div>
          <div className="step-label">Topic</div>
        </div>
        <div className="step-connector"></div>
        <div className={`step ${step >= 3 ? 'active' : ''}`}>
          <div className="step-number">3</div>
          <div className="step-label">Upload</div>
        </div>
      </div>

      <div className="organizer-content">
        <div className="section">
          <h3>Step 1: Select Company</h3>
          <select
            value={selectedCompany}
            onChange={(e) => handleCompanyChange(e.target.value)}
            className="dropdown"
            disabled={loading}
          >
            <option value="">{loading ? 'Loading...' : 'Choose a company'}</option>
            {companies.map((company) => (
              <option key={company._id} value={company._id}>
                {company.name}
              </option>
            ))}
          </select>
        </div>

        {selectedCompany && (
          <div className="section">
            <h3>Step 2: Select Topic</h3>
            <select
              value={selectedTopic}
              onChange={(e) => handleTopicChange(e.target.value)}
              className="dropdown"
              disabled={loadingTopics}
            >
              <option value="">{loadingTopics ? 'Loading...' : 'Choose a topic'}</option>
              {topics.map((topic) => (
                <option key={topic._id} value={topic._id}>
                  {topic.name}
                </option>
              ))}
            </select>
            {!loadingTopics && topics.length === 0 && (
              <p className="message error">No topics found for this company</p>
            )}
          </div>
        )}

        {selectedTopic && (
          <div className="section">
            <h3>Step 3: Manage Questions by Difficulty</h3>

            <div className="difficulty-sections">
              {difficulties.map((difficulty) => (
                <div key={difficulty} className="difficulty-section">
                  <div className="difficulty-header">
                    <h4 className={`difficulty-title difficulty-${difficulty}`}>
                      {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)} Questions
                    </h4>
                    <span className="file-count">{difficultyFiles[difficulty].length} files</span>
                  </div>

                  <div className="files-list">
                    {difficultyFiles[difficulty].length === 0 ? (
                      <p className="message empty">No files uploaded yet</p>
                    ) : (
                      difficultyFiles[difficulty].map((file) => (
                        <div key={file._id} className="file-item">
                          <div className="file-info">
                            <span className="file-icon">📄</span>
                            <div className="file-details">
                              <div className="file-name">{file.originalName}</div>
                              <div className="file-meta">
                                {formatFileSize(file.size)} • {new Date(file.createdAt).toLocaleDateString()}
                              </div>
                            </div>
                          </div>
                          <button
                            onClick={() => handleDeleteFile(file._id)}
                            className="delete-btn"
                          >
                            Delete
                          </button>
                        </div>
                      ))
                    )}
                  </div>

                  <div className="upload-area">
                    <button
                      onClick={() => setSelectedDifficulty(difficulty)}
                      className={`select-difficulty-btn ${selectedDifficulty === difficulty ? 'selected' : ''}`}
                    >
                      {selectedDifficulty === difficulty ? 'Selected' : 'Select to Upload'}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {selectedDifficulty && (
              <div className="upload-section">
                <h4>Upload Question PDF to {selectedDifficulty.toUpperCase()}</h4>
                <input
                  type="file"
                  accept=".pdf"
                  onChange={(e) => setUploadFile(e.target.files[0])}
                  className="file-input"
                />
                {uploadFile && (
                  <div className="selected-file">
                    <span>{uploadFile.name}</span>
                    <span className="file-size">{formatFileSize(uploadFile.size)}</span>
                  </div>
                )}
                <button
                  onClick={handleUploadFile}
                  disabled={!uploadFile || uploading}
                  className="upload-btn"
                >
                  {uploading ? 'Uploading...' : 'Upload PDF'}
                </button>
                <button
                  onClick={() => setSelectedDifficulty('')}
                  className="cancel-btn"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default QuestionOrganizer;
