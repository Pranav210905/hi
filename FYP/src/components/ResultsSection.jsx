import { useState, useEffect } from 'react';
import { assessmentAPI } from '../services/api';
import '../styles/ResultsSection.css';

const ResultsSection = () => {
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAttempts();
  }, []);

  const loadAttempts = async () => {
    try {
      const response = await assessmentAPI.getMyAttempts();
      setAttempts(response.data);
    } catch (error) {
      console.error('Error loading attempts:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (percentage, passingMarks) => {
    if (percentage >= passingMarks) return 'passed';
    return 'failed';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return <div className="loading">Loading results...</div>;
  }

  return (
    <div className="results-section">
      {attempts.length === 0 ? (
        <div className="empty-state-large">
          <div className="empty-icon">📊</div>
          <h3>No Attempts Yet</h3>
          <p>You haven't taken any assessments yet. Start practicing to see your results here!</p>
        </div>
      ) : (
        <div className="results-grid">
          {attempts.map((attempt) => (
            <div key={attempt._id} className="result-card">
              <div className="result-header">
                <div>
                  <h3 className="result-title">{attempt.assessmentId?.title || 'Assessment'}</h3>
                  <p className="result-date">{formatDate(attempt.completedAt || attempt.startedAt)}</p>
                </div>
                <span className={`result-status ${attempt.status}`}>
                  {attempt.status === 'completed' ? '✅' : '⏳'}
                </span>
              </div>

              {attempt.status === 'completed' && (
                <>
                  <div className="result-score">
                    <div className="score-circle">
                      <div className="score-value">{attempt.percentage?.toFixed(1)}%</div>
                      <div className="score-label">Score</div>
                    </div>
                    <div className="score-details">
                      <div className="score-item">
                        <span className="score-item-label">Total Score</span>
                        <span className="score-item-value">
                          {attempt.totalScore}/{attempt.assessmentId?.totalMarks}
                        </span>
                      </div>
                      <div className="score-item">
                        <span className="score-item-label">Time Taken</span>
                        <span className="score-item-value">{Math.floor(attempt.timeTaken / 60)} mins</span>
                      </div>
                      <div className="score-item">
                        <span className="score-item-label">Accuracy</span>
                        <span className="score-item-value">{attempt.performance?.accuracy?.toFixed(1)}%</span>
                      </div>
                    </div>
                  </div>

                  {attempt.performance?.sectionWise && (
                    <div className="section-performance">
                      <h4 className="section-title">Section-wise Performance</h4>
                      <div className="sections-grid">
                        {attempt.performance.sectionWise.map((section) => (
                          <div key={section.section} className="section-item">
                            <div className="section-name">{section.section}</div>
                            <div className="section-score">
                              {section.correct}/{section.total}
                            </div>
                            <div className="section-progress">
                              <div
                                className="section-progress-bar"
                                style={{ width: `${(section.correct / section.total) * 100}%` }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}

              {attempt.status === 'in-progress' && (
                <div className="in-progress-message">
                  <p>Assessment in progress...</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ResultsSection;
