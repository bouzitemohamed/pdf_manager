import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchRecentFiles } from './pdfFilesSlice';

const fmt = (d) => new Date(d).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });

const RecentPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { recentFiles, loading } = useSelector(s => s.pdfFiles);

  useEffect(() => { dispatch(fetchRecentFiles()); }, [dispatch]);

  return (
    <div className="px-8 py-8">
      <div className="mb-7">
        <h1 className="font-display text-3xl" style={{ color: 'var(--t1)' }}>Recent Activity</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--t3)' }}>Last 20 files uploaded across all users</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-24">
          <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin"
            style={{ borderColor: 'var(--accent)', borderTopColor: 'transparent' }}/>
        </div>
      ) : recentFiles.length === 0 ? (
        <div className="text-center py-24">
          <div className="text-5xl mb-4">◷</div>
          <p className="font-display text-lg" style={{ color: 'var(--t1)' }}>No activity yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {recentFiles.map(file => {
            const service = file.folder?.box?.service;
            const breadcrumb = [service?.name, file.folder?.box?.name, file.folder?.name].filter(Boolean).join(' › ');
            return (
              <div key={file.id}
                onClick={() => navigate(`/files/${file.id}`)}
                className="flex items-center gap-4 px-5 py-4 rounded-2xl border cursor-pointer transition-all group"
                style={{ background: 'var(--bg2)', borderColor: 'var(--border)' }}
                onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--border2)'}
                onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
              >
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: `${service?.color || '#f59e0b'}20` }}>
                  <svg viewBox="0 0 24 24" className="w-5 h-5" style={{ fill: service?.color || 'var(--accent)' }}>
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zm-1 1.5L18.5 9H13V3.5z"/>
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate" style={{ color: 'var(--t1)' }}>{file.title}</p>
                  <p className="text-xs mt-0.5 truncate" style={{ color: 'var(--t3)' }}>
                    {breadcrumb} · by {file.uploadedBy?.email}
                  </p>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <span className="text-xs font-mono px-2 py-0.5 rounded"
                    style={{ background: 'var(--chip-bg)', color: 'var(--chip-c)' }}>
                    {file._count?.pages || file.pageCount}p
                  </span>
                  <span className="text-xs hidden sm:block" style={{ color: 'var(--t3)' }}>
                    {fmt(file.createdAt)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default RecentPage;
