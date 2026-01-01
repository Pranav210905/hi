import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import '../styles/Sidebar.css';

const Sidebar = ({ activeTab, onTabChange }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isAdmin = user?.role === 'admin';

  const adminTabs = [
    {
      section: 'Management',
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: '📊' },
        { id: 'companies', label: 'Companies', icon: '🏢' },
        { id: 'assessments', label: 'Assessments', icon: '📝' },
        { id: 'students', label: 'Students', icon: '👥' }
      ]
    }
  ];

  const userTabs = [
    {
      section: 'Main',
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: '🏠' },
        { id: 'assessments', label: 'My Assessments', icon: '📝' },
        { id: 'results', label: 'Results', icon: '📊' },
        { id: 'profile', label: 'Profile', icon: '👤' }
      ]
    }
  ];

  const tabs = isAdmin ? adminTabs : userTabs;

  return (
    <>
      <button
        className="mobile-menu-btn"
        onClick={() => setIsOpen(!isOpen)}
      >
        ☰
      </button>

      <div className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <h2 className="sidebar-logo">Adaptive Learning</h2>
          <div className="sidebar-user">
            <div className="user-avatar-large">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <h3 className="user-name-large">{user?.name}</h3>
            <p className="user-email-large">{user?.email}</p>
            <span className="user-role-badge">{user?.role}</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          {tabs.map((section) => (
            <div key={section.section} className="nav-section">
              <h4 className="nav-section-title">{section.section}</h4>
              {section.items.map((item) => (
                <div
                  key={item.id}
                  className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
                  onClick={() => {
                    onTabChange(item.id);
                    setIsOpen(false);
                  }}
                >
                  <span className="nav-icon">{item.icon}</span>
                  <span>{item.label}</span>
                </div>
              ))}
            </div>
          ))}
        </nav>

        <div className="sidebar-footer">
          <button onClick={handleLogout} className="logout-btn">
            <span>🚪</span>
            Logout
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
