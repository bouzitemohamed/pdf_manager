import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAdminFiles, deleteAdminFile } from './adminSlice';

const fmt = (d) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

const AdminFiles = () => {
  const dispatch = useDispatch();
  const { files, totalFiles, loading } = useSelector((s) => s.admin);
  const [search, setSearch]  = useState('');
  const [page, setPage]      = useState(1);
  const [deleting, setDeleting] = useState(null);

  useEffect(() => {
    const t = setTimeout(() => { dispatch(fetchAdminFiles({ search, page, limit: 20 })); }, 300);
    return () => clearTimeout(t);
  }, [search, page, dispatch]);

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete "${name}"? This cannot be undone.`)) return;
    setDeleting(id);
    await dispatch(deleteAdminFile(id));
    setDeleting(null);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="font-display text-2xl" style={{ color: 'var(--text-primary)' }}>All Files</h2>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>{totalFiles} files across all users</p>
        </div>
        <div className="relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: 'var(--text-muted)' }}>
            <circle cx="11" cy="11" r="6"/><path d="m21 21-3.5-3.5" strokeLinecap="round"/>
          </svg>
          <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search files or users…"
            className="rounded-xl border pl-10 pr-4 py-2.5 text-sm font-sans outline-none w-64"
            style={{ backgroundColor: 'var(--input-bg)', borderColor: 'var(--border-light)', color: 'var(--text-primary)' }}
            onFocus={e => e.target.style.borderColor = 'var(--accent)'}
            onBlur={e => e.target.style.borderColor = 'var(--border-light)'}
          />
        </div>
      </div>

      <div className="rounded-2xl border overflow-hidden" style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border)' }}>
        <div className="grid grid-cols-12 px-5 py-3 text-xs uppercase tracking-widest border-b"
          style={{ backgroundColor: 'var(--bg-tertiary)', borderColor: 'var(--border)', color: 'var(--text-muted)' }}>
          <span className="col-span-4">File Name</span>
          <span className="col-span-3">Owner</span>
          <span className="col-span-2">Box #</span>
          <span className="col-span-1">Pages</span>
          <span className="col-span-1">Date</span>
          <span className="col-span-1 text-right">Del</span>
        </div>

        {loading ? (
          <div className="py-16 text-center">
            <div className="w-7 h-7 border-2 border-t-transparent rounded-full animate-spin mx-auto" style={{ borderColor: 'var(--accent)', borderTopColor: 'transparent' }} />
          </div>
        ) : files.length === 0 ? (
          <p className="text-center py-12 text-sm" style={{ color: 'var(--text-muted)' }}>No files found</p>
        ) : (
          <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
            {files.map((f) => (
              <div key={f.id} className="grid grid-cols-12 px-5 py-3.5 items-center group">
                <div className="col-span-4 flex items-center gap-3 min-w-0">
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: 'var(--bg-tertiary)' }}>
                    <svg viewBox="0 0 24 24" className="w-4 h-4" style={{ fill: 'var(--accent)' }}>
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zm-1 1.5L18.5 9H13V3.5z"/>
                    </svg>
                  </div>
                  <span className="text-sm truncate font-sans" style={{ color: 'var(--text-primary)' }}>{f.name}</span>
                </div>
                <div className="col-span-3 text-xs truncate" style={{ color: 'var(--text-secondary)' }}>{f.user?.email}</div>
                <div className="col-span-2">
                  {f.num_box
                    ? <span className="text-xs font-mono px-2 py-0.5 rounded" style={{ backgroundColor: 'var(--chip-bg)', color: 'var(--chip-text)' }}>{f.num_box}</span>
                    : <span style={{ color: 'var(--text-muted)' }}>—</span>}
                </div>
                <div className="col-span-1 text-sm" style={{ color: 'var(--text-secondary)' }}>{f.page_count}</div>
                <div className="col-span-1 text-xs" style={{ color: 'var(--text-muted)' }}>{fmt(f.createdAt)}</div>
                <div className="col-span-1 flex justify-end">
                  <button onClick={() => handleDelete(f.id, f.name)} disabled={deleting === f.id}
                    className="p-1.5 rounded-lg transition-colors disabled:opacity-40 opacity-0 group-hover:opacity-100"
                    style={{ backgroundColor: 'rgba(239,68,68,.1)', color: '#ef4444' }}>
                    {deleting === f.id ? '…' : '🗑'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {totalFiles > 20 && (
          <div className="flex items-center justify-between px-5 py-3 border-t" style={{ borderColor: 'var(--border)' }}>
            <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="text-sm disabled:opacity-40" style={{ color: 'var(--text-secondary)' }}>← Prev</button>
            <span className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>Page {page}</span>
            <button disabled={page * 20 >= totalFiles} onClick={() => setPage(p => p + 1)} className="text-sm disabled:opacity-40" style={{ color: 'var(--text-secondary)' }}>Next →</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminFiles;
