import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logoutUser } from '../auth/authSlice';
import { fetchFiles } from '../files/filesSlice';
import UploadZone from '../files/UploadZone';
import FileList from '../files/FileList';
import ThemeToggle from '../../components/ThemeToggle';

const Dashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user }  = useSelector((s) => s.auth);
  const { items, total } = useSelector((s) => s.files);

  useEffect(() => { dispatch(fetchFiles({ page: 1, limit: 20 })); }, [dispatch]);

  const handleLogout = async () => { await dispatch(logoutUser()); navigate('/login'); };
  const totalPages = items.reduce((sum, f) => sum + (f.page_count || 0), 0);

  return (
    <div className="min-h-screen font-sans transition-colors duration-250" style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
      <header style={{ backgroundColor: 'var(--header-bg)', borderBottomColor: 'var(--border)' }} className="border-b px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'var(--accent)' }}>
              <svg viewBox="0 0 24 24" className="w-5 h-5" style={{ fill: 'var(--bg-primary)' }}>
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zm-1 1.5L18.5 9H13V3.5z"/>
              </svg>
            </div>
            <span className="font-display text-xl" style={{ color: 'var(--text-primary)' }}>Archivum</span>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-sm hidden sm:block" style={{ color: 'var(--text-secondary)' }}>{user?.email}</span>

            {/* Admin panel link — only visible to admins */}
            {user?.role === 'ADMIN' && (
              <button onClick={() => navigate('/admin')}
                className="text-xs px-3 py-2 rounded-xl border font-semibold transition-colors"
                style={{ borderColor: 'var(--accent)', color: 'var(--accent)', backgroundColor: 'rgba(245,158,11,0.08)' }}>
                ⚙ Admin Panel
              </button>
            )}

            <ThemeToggle />

            <button onClick={handleLogout} className="text-sm transition-colors"
              style={{ color: 'var(--text-secondary)' }}
              onMouseEnter={e => e.target.style.color = 'var(--text-primary)'}
              onMouseLeave={e => e.target.style.color = 'var(--text-secondary)'}>
              Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-10">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-10">
          {[{ label: 'Documents', value: total }, { label: 'Pages Indexed', value: totalPages }, { label: 'Storage', value: 'Cloud' }].map((stat) => (
            <div key={stat.label} className="rounded-xl p-5 border" style={{ backgroundColor: 'var(--stat-bg)', borderColor: 'var(--border)' }}>
              <p className="text-xs uppercase tracking-widest" style={{ color: 'var(--text-secondary)' }}>{stat.label}</p>
              <p className="font-display text-3xl mt-1" style={{ color: 'var(--text-primary)' }}>{stat.value}</p>
            </div>
          ))}
        </div>
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <UploadZone onSuccess={() => dispatch(fetchFiles({ page: 1, limit: 20 }))} />
          </div>
          <div className="lg:col-span-2">
            <FileList />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
