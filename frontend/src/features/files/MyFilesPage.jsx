import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchMyFiles, deletePdfFile } from './pdfFilesSlice';

const fmt = (d) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

const MyFilesPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { myFiles, myTotal, loading } = useSelector(s => s.pdfFiles);
  const [search, setSearch] = useState('');
  const [page, setPage]     = useState(1);
  const [deleting, setDel]  = useState(null);

  useEffect(() => {
    const t = setTimeout(() => dispatch(fetchMyFiles({ search, page, limit: 20 })), 300);
    return () => clearTimeout(t);
  }, [search, page, dispatch]);

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Delete "${title}"?`)) return;
    setDel(id);
    await dispatch(deletePdfFile(id));
    setDel(null);
  };

  return (
    <div className="px-8 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-7">
        <div>
          <h1 className="font-display text-3xl" style={{ color: 'var(--t1)' }}>My Files</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--t3)' }}>{myTotal} document{myTotal !== 1 ? 's' : ''} uploaded by you</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: 'var(--t3)' }}>
              <circle cx="11" cy="11" r="6"/><path d="m21 21-3.5-3.5" strokeLinecap="round"/>
            </svg>
            <input
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search your files…"
              className="rounded-xl border pl-9 pr-4 py-2.5 text-sm font-sans outline-none w-56"
              style={{ background: 'var(--bg2)', borderColor: 'var(--border2)', color: 'var(--t1)' }}
              onFocus={e => e.target.style.borderColor = 'var(--accent)'}
              onBlur={e => e.target.style.borderColor = 'var(--border2)'}
            />
          </div>
          <button
            onClick={() => navigate('/upload')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-sans font-semibold transition-colors"
            style={{ background: 'var(--accent)', color: 'var(--bg)' }}
          >
            + Upload PDF
          </button>
        </div>
      </div>

      {/* Files grid */}
      {loading ? (
        <div className="flex items-center justify-center py-24">
          <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: 'var(--accent)', borderTopColor: 'transparent' }}/>
        </div>
      ) : myFiles.length === 0 ? (
        <div className="text-center py-24">
          <div className="text-5xl mb-4">📂</div>
          <p className="text-lg font-display" style={{ color: 'var(--t1)' }}>No files yet</p>
          <p className="text-sm mt-1" style={{ color: 'var(--t3)' }}>Upload your first PDF to get started</p>
          <button onClick={() => navigate('/upload')}
            className="mt-5 px-6 py-2.5 rounded-xl text-sm font-sans font-semibold"
            style={{ background: 'var(--accent)', color: 'var(--bg)' }}>
            Upload PDF
          </button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-3">
            {myFiles.map(file => {
              const service = file.folder?.box?.service;
              const breadcrumb = [service?.name, file.folder?.box?.name, file.folder?.name].filter(Boolean).join(' › ');
              return (
                <div
                  key={file.id}
                  className="flex items-center gap-4 px-5 py-4 rounded-2xl border transition-all cursor-pointer group"
                  style={{ background: 'var(--bg2)', borderColor: 'var(--border)' }}
                  onClick={() => navigate(`/files/${file.id}`)}
                  onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--border2)'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
                >
                  {/* Service color dot + icon */}
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: service?.color ? `${service.color}20` : 'var(--bg3)' }}>
                    <svg viewBox="0 0 24 24" className="w-5 h-5" style={{ fill: service?.color || 'var(--accent)' }}>
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zm-1 1.5L18.5 9H13V3.5z"/>
                    </svg>
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate" style={{ color: 'var(--t1)' }}>{file.title}</p>
                    <p className="text-xs mt-0.5 truncate" style={{ color: 'var(--t3)' }}>{breadcrumb}</p>
                  </div>

                  {/* Meta */}
                  <div className="flex items-center gap-4 flex-shrink-0">
                    <span className="text-xs font-mono px-2 py-0.5 rounded"
                      style={{ background: 'var(--chip-bg)', color: 'var(--chip-c)' }}>
                      {file._count?.pages || file.pageCount} pages
                    </span>
                    <span className="text-xs hidden sm:block" style={{ color: 'var(--t3)' }}>{fmt(file.createdAt)}</span>
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={e => { e.stopPropagation(); navigate(`/files/${file.id}`); }}
                        className="px-3 py-1.5 rounded-lg text-xs font-sans border transition-colors"
                        style={{ borderColor: 'var(--border)', color: 'var(--t2)', background: 'var(--bg3)' }}>
                        View
                      </button>
                      <button
                        onClick={e => { e.stopPropagation(); handleDelete(file.id, file.title); }}
                        disabled={deleting === file.id}
                        className="px-3 py-1.5 rounded-lg text-xs font-sans transition-colors disabled:opacity-40"
                        style={{ background: 'rgba(239,68,68,.1)', color: '#ef4444' }}>
                        {deleting === file.id ? '…' : 'Delete'}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination */}
          {myTotal > 20 && (
            <div className="flex items-center justify-between mt-6">
              <button disabled={page === 1} onClick={() => setPage(p => p - 1)}
                className="text-sm disabled:opacity-40 px-4 py-2 rounded-lg border transition-colors"
                style={{ borderColor: 'var(--border)', color: 'var(--t2)' }}>
                ← Previous
              </button>
              <span className="text-xs font-mono" style={{ color: 'var(--t3)' }}>
                Page {page} · {myTotal} files
              </span>
              <button disabled={page * 20 >= myTotal} onClick={() => setPage(p => p + 1)}
                className="text-sm disabled:opacity-40 px-4 py-2 rounded-lg border transition-colors"
                style={{ borderColor: 'var(--border)', color: 'var(--t2)' }}>
                Next →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default MyFilesPage;
