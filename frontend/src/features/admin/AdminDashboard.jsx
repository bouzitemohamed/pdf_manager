import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logoutUser } from '../auth/authSlice';
import { fetchAdminStats } from './adminSlice';
import ThemeToggle from '../../components/ThemeToggle';
import NotificationBell from './NotificationBell';
import AdminStats from './AdminStats';
import AdminUsers from './AdminUsers';
import AdminFiles from './AdminFiles';
import AdminAuditLog from './AdminAuditLog';
import AdminServicesPage from './AdminServicesPage';
import useAdminSocket from '../../hooks/useAdminSocket';

const TABS = [
  { id: 'overview',  label: 'Overview',          icon: '◈' },
  { id: 'services',  label: 'Services & Boxes',   icon: '⊞' },
  { id: 'users',     label: 'Users',              icon: '◉' },
  { id: 'files',     label: 'All Files',          icon: '◫' },
  { id: 'audit',     label: 'Audit Log',          icon: '◷' },
];

const AdminDashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector(s => s.auth);
  const [activeTab, setActiveTab] = useState('overview');

  useAdminSocket();

  useEffect(() => { dispatch(fetchAdminStats()); }, [dispatch]);

  const handleLogout = async () => {
    await dispatch(logoutUser());
    navigate('/login');
  };

  return (
    <div className="min-h-screen font-sans transition-colors duration-250"
      style={{ backgroundColor: 'var(--bg)', color: 'var(--t1)' }}>

      {/* Header */}
      <header className="border-b px-6 py-3 transition-colors duration-250"
        style={{ backgroundColor: 'var(--bg2)', borderColor: 'var(--border)' }}>
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'var(--accent)' }}>
              <svg viewBox="0 0 24 24" className="w-5 h-5" style={{ fill: 'var(--bg)' }}>
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zm-1 1.5L18.5 9H13V3.5z"/>
              </svg>
            </div>
            <span className="font-display text-lg" style={{ color: 'var(--t1)' }}>Archivum</span>
            <span className="text-xs font-mono px-2 py-0.5 rounded-full border font-semibold"
              style={{ color: 'var(--accent)', borderColor: 'var(--accent)', backgroundColor: 'rgba(245,158,11,.08)' }}>
              ADMIN
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm hidden sm:block" style={{ color: 'var(--t2)' }}>{user?.email}</span>
            <NotificationBell />
            <ThemeToggle />
            <button onClick={() => navigate('/dashboard')}
              className="text-xs px-3 py-2 rounded-lg border transition-colors"
              style={{ borderColor: 'var(--border)', color: 'var(--t2)', backgroundColor: 'var(--bg3)' }}>
              User View
            </button>
            <button onClick={handleLogout} className="text-sm transition-colors"
              style={{ color: 'var(--t2)' }}
              onMouseEnter={e => e.target.style.color = 'var(--t1)'}
              onMouseLeave={e => e.target.style.color = 'var(--t2)'}>
              Sign out
            </button>
          </div>
        </div>
      </header>

      {/* Tab Bar */}
      <div className="border-b px-6 transition-colors"
        style={{ backgroundColor: 'var(--bg2)', borderColor: 'var(--border)' }}>
        <div className="max-w-7xl mx-auto flex gap-1">
          {TABS.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className="flex items-center gap-2 px-4 py-3 text-sm font-sans font-medium border-b-2 transition-all"
              style={{
                borderBottomColor: activeTab === tab.id ? 'var(--accent)' : 'transparent',
                color: activeTab === tab.id ? 'var(--accent)' : 'var(--t2)',
              }}>
              <span className="text-base">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {activeTab === 'overview'  && <AdminStats />}
        {activeTab === 'services'  && <AdminServicesPage />}
        {activeTab === 'users'     && <AdminUsers />}
        {activeTab === 'files'     && <AdminFiles />}
        {activeTab === 'audit'     && <AdminAuditLog />}
      </main>
    </div>
  );
};

export default AdminDashboard;
