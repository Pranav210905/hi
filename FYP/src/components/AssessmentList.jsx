import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { assessmentAPI } from '../services/api';
import '../styles/AssessmentList.css';

const AssessmentList = () => {
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadAssessments();
  }, []);

  const loadAssessments = async () => {
    try {
      const response = await assessmentAPI.getAll();
      setAssessments(response.data);
    } catch (error) {
      console.error('Error loading assessments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStartAssessment = (assessmentId) => {
    navigate(`/assessment/${assessmentId}`);
  };

  if (loading) {
    return <div className="loading">Loading assessments...</div>;
  }

  return (
    <div className="assessment-list">
      {assessments.length === 0 ? (
        <div className="empty-state-large">
          <div className="empty-icon">📝</div>
          <h3>No Assessments Available</h3>
          <p>There are no active assessments at the moment. Check back later!</p>
        </div>
      ) : (
        <div className="assessments-grid">
          {assessments.map((assessment) => (
            <div key={assessment._id} className="assessment-card-user">
              <div className="assessment-badge">Active</div>
              <h3 className="assessment-title-user">{assessment.title}</h3>
              {assessment.description && (
                <p className="assessment-description-user">{assessment.description}</p>
              )}

              <div className="assessment-details">
                <div className="detail-item">
                  <span className="detail-icon">⏱️</span>
                  <div>
                    <span className="detail-label">Duration</span>
                    <span className="detail-value">{assessment.duration} mins</span>
                  </div>
                </div>

                <div className="detail-item">
                  <span className="detail-icon">📝</span>
                  <div>
                    <span className="detail-label">Questions</span>
                    <span className="detail-value">{assessment.questions?.length || 0}</span>
                  </div>
                </div>

                <div className="detail-item">
                  <span className="detail-icon">💯</span>
                  <div>
                    <span className="detail-label">Total Marks</span>
                    <span className="detail-value">{assessment.totalMarks}</span>
                  </div>
                </div>

                <div className="detail-item">
                  <span className="detail-icon">✅</span>
                  <div>
                    <span className="detail-label">Passing</span>
                    <span className="detail-value">{assessment.passingMarks}%</span>
                  </div>
                </div>
              </div>

              {assessment.companyId && (
                <div className="assessment-company-tag">
                  <span className="company-icon">🏢</span>
                  {assessment.companyId.name}
                </div>
              )}

              <button
                onClick={() => handleStartAssessment(assessment._id)}
                className="start-assessment-btn"
              >
                Start Assessment →
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AssessmentList;
