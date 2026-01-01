import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';
import AssessmentList from '../components/AssessmentList';
import ProfileSection from '../components/ProfileSection';
import ResultsSection from '../components/ResultsSection';
import '../styles/Sidebar.css';

const UserDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState({
    assessments: 0,
    completed: 0,
    avgScore: 0
  });

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <div>
            <div className="page-header">
              <h1 className="page-title">Welcome back, {user?.name}!</h1>
              <p className="page-subtitle">Track your progress and continue your learning journey</p>
            </div>

            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-header">
                  <div>
                    <h3 className="stat-value">{stats.assessments}</h3>
                    <p className="stat-label">Available Assessments</p>
                  </div>
                  <div className="stat-icon blue">📝</div>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-header">
                  <div>
                    <h3 className="stat-value">{stats.completed}</h3>
                    <p className="stat-label">Completed Tests</p>
                  </div>
                  <div className="stat-icon green">✅</div>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-header">
                  <div>
                    <h3 className="stat-value">{stats.avgScore}%</h3>
                    <p className="stat-label">Average Score</p>
                  </div>
                  <div className="stat-icon orange">📊</div>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-header">
                  <div>
                    <h3 className="stat-value">{user?.resume ? 'Yes' : 'No'}</h3>
                    <p className="stat-label">Resume Uploaded</p>
                  </div>
                  <div className="stat-icon purple">📄</div>
                </div>
              </div>
            </div>

            <div className="page-header" style={{ marginTop: '2rem' }}>
              <h2 className="page-title" style={{ fontSize: '1.5rem' }}>Quick Actions</h2>
            </div>

            <div className="stats-grid">
              <div className="stat-card" style={{ cursor: 'pointer' }} onClick={() => setActiveTab('assessments')}>
                <div className="stat-header">
                  <div>
                    <h3 className="stat-label">Take Assessment</h3>
                    <p style={{ fontSize: '0.875rem', color: '#64748b', marginTop: '0.5rem' }}>
                      Start a new assessment
                    </p>
                  </div>
                  <div className="stat-icon blue">📝</div>
                </div>
              </div>

              <div className="stat-card" style={{ cursor: 'pointer' }} onClick={() => setActiveTab('results')}>
                <div className="stat-header">
                  <div>
                    <h3 className="stat-label">View Results</h3>
                    <p style={{ fontSize: '0.875rem', color: '#64748b', marginTop: '0.5rem' }}>
                      Check your performance
                    </p>
                  </div>
                  <div className="stat-icon green">📊</div>
                </div>
              </div>

              <div className="stat-card" style={{ cursor: 'pointer' }} onClick={() => setActiveTab('profile')}>
                <div className="stat-header">
                  <div>
                    <h3 className="stat-label">Update Profile</h3>
                    <p style={{ fontSize: '0.875rem', color: '#64748b', marginTop: '0.5rem' }}>
                      Upload your resume
                    </p>
                  </div>
                  <div className="stat-icon purple">👤</div>
                </div>
              </div>
            </div>
          </div>
        );
      case 'assessments':
        return (
          <div>
            <div className="page-header">
              <h1 className="page-title">Available Assessments</h1>
              <p className="page-subtitle">Choose an assessment to start practicing</p>
            </div>
            <AssessmentList />
          </div>
        );
      case 'results':
        return (
          <div>
            <div className="page-header">
              <h1 className="page-title">My Results</h1>
              <p className="page-subtitle">View your assessment history and performance</p>
            </div>
            <ResultsSection />
          </div>
        );
      case 'profile':
        return (
          <div>
            <div className="page-header">
              <h1 className="page-title">My Profile</h1>
              <p className="page-subtitle">Manage your account and upload your resume</p>
            </div>
            <ProfileSection />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="app-layout">
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
      <main className="main-content">
        <div className="content-wrapper">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default UserDashboard;
