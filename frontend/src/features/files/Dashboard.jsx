import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logoutUser } from '../auth/authSlice';
import { fetchFiles } from '../files/filesSlice';
import UploadZone from '../files/UploadZone';
import FileList from '../files/FileList';

const Dashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((s) => s.auth);
  const { items, total } = useSelector((s) => s.files);

  useEffect(() => {
    dispatch(fetchFiles({ page: 1, limit: 20 }));
  }, [dispatch]);

  const handleLogout = async () => {
    await dispatch(logoutUser());
    navigate('/login');
  };

  const totalPages = items.reduce((sum, f) => sum + (f.page_count || 0), 0);

  return (
    <div className="min-h-screen bg-ink-900 font-sans">
      {/* Navbar */}
      <header className="border-b border-ink-700 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center">
              <svg viewBox="0 0 24 24" className="w-5 h-5 fill-ink-900">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zm-1 1.5L18.5 9H13V3.5z"/>
              </svg>
            </div>
            <span className="font-display text-xl text-white">Archivum</span>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-ink-400 text-sm hidden sm:block">{user?.email}</span>
            <button
              onClick={handleLogout}
              className="text-sm text-ink-400 hover:text-white transition-colors"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-10">
        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-10">
          {[
            { label: 'Documents', value: total },
            { label: 'Pages Indexed', value: totalPages },
            { label: 'Storage', value: 'Cloud' },
          ].map((stat) => (
            <div key={stat.label} className="bg-ink-800 border border-ink-700 rounded-xl p-5">
              <p className="text-ink-400 text-xs uppercase tracking-widest font-sans">{stat.label}</p>
              <p className="font-display text-3xl text-white mt-1">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Main Grid */}
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
