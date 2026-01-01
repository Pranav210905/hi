import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { companyAPI, topicAPI, fileAPI } from '../services/api';
import CompanyList from '../components/CompanyList';
import TopicList from '../components/TopicList';
import FileList from '../components/FileList';
import Header from '../components/Header';
import '../styles/Dashboard.css';

const Dashboard = () => {
  const { user } = useAuth();
  const [companies, setCompanies] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCompanies();
  }, []);

  const loadCompanies = async () => {
    try {
      const response = await companyAPI.getAll();
      setCompanies(response.data);
    } catch (error) {
      console.error('Error loading companies:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCompanyCreated = (company) => {
    setCompanies([company, ...companies]);
  };

  const handleCompanySelect = (company) => {
    setSelectedCompany(company);
    setSelectedTopic(null);
  };

  const handleCompanyDelete = (companyId) => {
    setCompanies(companies.filter(c => c._id !== companyId));
    if (selectedCompany?._id === companyId) {
      setSelectedCompany(null);
      setSelectedTopic(null);
    }
  };

  const handleTopicSelect = (topic) => {
    setSelectedTopic(topic);
  };

  const handleBack = () => {
    if (selectedTopic) {
      setSelectedTopic(null);
    } else if (selectedCompany) {
      setSelectedCompany(null);
    }
  };

  return (
    <div className="dashboard">
      <Header />

      <div className="dashboard-container">
        <div className="dashboard-header">
          <div>
            <h1 className="dashboard-title">
              Welcome back, {user?.name}
            </h1>
            <p className="dashboard-subtitle">
              {!selectedCompany && 'Select or create a company to get started'}
              {selectedCompany && !selectedTopic && `Managing topics for ${selectedCompany.name}`}
              {selectedTopic && `Managing files for ${selectedTopic.name}`}
            </p>
          </div>

          {(selectedCompany || selectedTopic) && (
            <button onClick={handleBack} className="back-button">
              ← Back
            </button>
          )}
        </div>

        <div className="dashboard-content">
          {!selectedCompany && (
            <CompanyList
              companies={companies}
              onCompanyCreated={handleCompanyCreated}
              onCompanySelect={handleCompanySelect}
              onCompanyDelete={handleCompanyDelete}
              loading={loading}
            />
          )}

          {selectedCompany && !selectedTopic && (
            <TopicList
              company={selectedCompany}
              onTopicSelect={handleTopicSelect}
            />
          )}

          {selectedTopic && (
            <FileList
              topic={selectedTopic}
              company={selectedCompany}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
