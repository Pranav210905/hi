import { useState, useEffect } from 'react';
import { assessmentAPI, companyAPI, topicAPI } from '../services/api';
import '../styles/AssessmentManager.css';

const AssessmentManager = () => {
  const [assessments, setAssessments] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [topics, setTopics] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    companyId: '',
    topicId: '',
    duration: 60,
    totalMarks: 100,
    passingMarks: 40,
    questions: []
  });
  const [currentQuestion, setCurrentQuestion] = useState({
    type: 'mcq',
    question: '',
    options: ['', '', '', ''],
    correctAnswer: '',
    section: 'aptitude',
    difficulty: 'medium',
    timeLimit: 60
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [assessmentsRes, companiesRes] = await Promise.all([
        assessmentAPI.getAllAdmin(),
        companyAPI.getAll()
      ]);
      setAssessments(assessmentsRes.data);
      setCompanies(companiesRes.data);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCompanyChange = async (companyId) => {
    setFormData({ ...formData, companyId, topicId: '' });
    if (companyId) {
      try {
        const response = await topicAPI.getByCompany(companyId);
        setTopics(response.data);
      } catch (error) {
        console.error('Error loading topics:', error);
      }
    }
  };

  const addQuestion = () => {
    if (!currentQuestion.question) {
      alert('Please enter a question');
      return;
    }

    if (currentQuestion.type === 'mcq') {
      if (currentQuestion.options.some(opt => !opt)) {
        alert('Please fill all options');
        return;
      }
      if (!currentQuestion.correctAnswer) {
        alert('Please select the correct answer');
        return;
      }
    }

    setFormData({
      ...formData,
      questions: [...formData.questions, { ...currentQuestion }]
    });

    setCurrentQuestion({
      type: 'mcq',
      question: '',
      options: ['', '', '', ''],
      correctAnswer: '',
      section: 'aptitude',
      difficulty: 'medium',
      timeLimit: 60
    });
  };

  const removeQuestion = (index) => {
    setFormData({
      ...formData,
      questions: formData.questions.filter((_, i) => i !== index)
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.questions.length === 0) {
      alert('Please add at least one question');
      return;
    }

    try {
      await assessmentAPI.create(formData);
      alert('Assessment created successfully!');
      setShowModal(false);
      setFormData({
        title: '',
        description: '',
        companyId: '',
        topicId: '',
        duration: 60,
        totalMarks: 100,
        passingMarks: 40,
        questions: []
      });
      loadData();
    } catch (error) {
      alert('Failed to create assessment: ' + error.message);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this assessment?')) {
      try {
        await assessmentAPI.delete(id);
        setAssessments(assessments.filter(a => a._id !== id));
      } catch (error) {
        alert('Failed to delete assessment');
      }
    }
  };

  if (loading) {
    return <div className="loading">Loading assessments...</div>;
  }

  return (
    <div className="assessment-manager">
      <div className="manager-header">
        <button onClick={() => setShowModal(true)} className="create-assessment-btn">
          + Create New Assessment
        </button>
      </div>

      <div className="assessments-grid">
        {assessments.map((assessment) => (
          <div key={assessment._id} className="assessment-card">
            <div className="assessment-header">
              <h3 className="assessment-title">{assessment.title}</h3>
              <span className={`assessment-status ${assessment.isActive ? 'active' : 'inactive'}`}>
                {assessment.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
            {assessment.description && (
              <p className="assessment-description">{assessment.description}</p>
            )}
            <div className="assessment-meta">
              <div className="meta-item">
                <span className="meta-icon">⏱️</span>
                <span>{assessment.duration} mins</span>
              </div>
              <div className="meta-item">
                <span className="meta-icon">📝</span>
                <span>{assessment.questions.length} questions</span>
              </div>
              <div className="meta-item">
                <span className="meta-icon">💯</span>
                <span>{assessment.totalMarks} marks</span>
              </div>
            </div>
            {assessment.companyId && (
              <div className="assessment-company">
                Company: {assessment.companyId.name}
              </div>
            )}
            <button
              onClick={() => handleDelete(assessment._id)}
              className="delete-assessment-btn"
            >
              Delete
            </button>
          </div>
        ))}

        {assessments.length === 0 && (
          <div className="empty-state">
            <p>No assessments yet. Create your first assessment to get started.</p>
          </div>
        )}
      </div>

      {showModal && (
        <div className="assessment-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="assessment-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Create New Assessment</h2>
              <button onClick={() => setShowModal(false)} className="close-btn">×</button>
            </div>

            <form onSubmit={handleSubmit} className="assessment-form">
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Title</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="form-input"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Duration (minutes)</label>
                  <input
                    type="number"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
                    className="form-input"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="form-textarea"
                  rows={2}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Company (Optional)</label>
                  <select
                    value={formData.companyId}
                    onChange={(e) => handleCompanyChange(e.target.value)}
                    className="form-select"
                  >
                    <option value="">Select Company</option>
                    {companies.map((company) => (
                      <option key={company._id} value={company._id}>{company.name}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Topic (Optional)</label>
                  <select
                    value={formData.topicId}
                    onChange={(e) => setFormData({ ...formData, topicId: e.target.value })}
                    className="form-select"
                    disabled={!formData.companyId}
                  >
                    <option value="">Select Topic</option>
                    {topics.map((topic) => (
                      <option key={topic._id} value={topic._id}>{topic.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Total Marks</label>
                  <input
                    type="number"
                    value={formData.totalMarks}
                    onChange={(e) => setFormData({ ...formData, totalMarks: parseInt(e.target.value) })}
                    className="form-input"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Passing Marks</label>
                  <input
                    type="number"
                    value={formData.passingMarks}
                    onChange={(e) => setFormData({ ...formData, passingMarks: parseInt(e.target.value) })}
                    className="form-input"
                    required
                  />
                </div>
              </div>

              <div className="questions-section">
                <h3 className="section-title">Questions ({formData.questions.length})</h3>

                <div className="question-builder">
                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Question Type</label>
                      <select
                        value={currentQuestion.type}
                        onChange={(e) => setCurrentQuestion({ ...currentQuestion, type: e.target.value })}
                        className="form-select"
                      >
                        <option value="mcq">Multiple Choice</option>
                        <option value="coding">Coding</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Section</label>
                      <select
                        value={currentQuestion.section}
                        onChange={(e) => setCurrentQuestion({ ...currentQuestion, section: e.target.value })}
                        className="form-select"
                      >
                        <option value="aptitude">Aptitude</option>
                        <option value="reasoning">Reasoning</option>
                        <option value="verbal">Verbal</option>
                        <option value="coding">Coding</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Difficulty</label>
                      <select
                        value={currentQuestion.difficulty}
                        onChange={(e) => setCurrentQuestion({ ...currentQuestion, difficulty: e.target.value })}
                        className="form-select"
                      >
                        <option value="easy">Easy</option>
                        <option value="medium">Medium</option>
                        <option value="hard">Hard</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Question</label>
                    <textarea
                      value={currentQuestion.question}
                      onChange={(e) => setCurrentQuestion({ ...currentQuestion, question: e.target.value })}
                      className="form-textarea"
                      rows={3}
                      placeholder="Enter your question here..."
                    />
                  </div>

                  {currentQuestion.type === 'mcq' && (
                    <>
                      <div className="form-group">
                        <label className="form-label">Options</label>
                        {currentQuestion.options.map((option, index) => (
                          <input
                            key={index}
                            type="text"
                            value={option}
                            onChange={(e) => {
                              const newOptions = [...currentQuestion.options];
                              newOptions[index] = e.target.value;
                              setCurrentQuestion({ ...currentQuestion, options: newOptions });
                            }}
                            className="form-input"
                            placeholder={`Option ${index + 1}`}
                            style={{ marginBottom: '0.5rem' }}
                          />
                        ))}
                      </div>

                      <div className="form-group">
                        <label className="form-label">Correct Answer</label>
                        <select
                          value={currentQuestion.correctAnswer}
                          onChange={(e) => setCurrentQuestion({ ...currentQuestion, correctAnswer: e.target.value })}
                          className="form-select"
                        >
                          <option value="">Select correct answer</option>
                          {currentQuestion.options.map((option, index) => (
                            option && <option key={index} value={option}>{option}</option>
                          ))}
                        </select>
                      </div>
                    </>
                  )}

                  <button type="button" onClick={addQuestion} className="add-question-btn">
                    + Add Question
                  </button>
                </div>

                {formData.questions.length > 0 && (
                  <div className="questions-list">
                    {formData.questions.map((q, index) => (
                      <div key={index} className="question-item">
                        <div className="question-content">
                          <span className="question-number">Q{index + 1}</span>
                          <span className="question-text">{q.question}</span>
                          <span className="question-badge">{q.section}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeQuestion(index)}
                          className="remove-question-btn"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="modal-actions">
                <button type="button" onClick={() => setShowModal(false)} className="cancel-btn">
                  Cancel
                </button>
                <button type="submit" className="submit-btn">
                  Create Assessment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssessmentManager;
