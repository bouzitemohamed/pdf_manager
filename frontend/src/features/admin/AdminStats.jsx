import { useSelector } from 'react-redux';

const fmt = (d) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

const StatCard = ({ label, value, sub, accent }) => (
  <div className="rounded-2xl p-6 border transition-colors" style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border)' }}>
    <p className="text-xs uppercase tracking-widest font-sans mb-2" style={{ color: 'var(--text-secondary)' }}>{label}</p>
    <p className="font-display text-4xl" style={{ color: accent ? 'var(--accent)' : 'var(--text-primary)' }}>{value ?? '—'}</p>
    {sub && <p className="text-xs mt-2" style={{ color: 'var(--text-muted)' }}>{sub}</p>}
  </div>
);

const AdminStats = () => {
  const { stats, loading } = useSelector((s) => s.admin);

  if (loading || !stats) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: 'var(--accent)', borderTopColor: 'transparent' }} />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Users"   value={stats.totalUsers}  sub="Registered accounts" />
        <StatCard label="Total Files"   value={stats.totalFiles}  sub="Across all users" />
        <StatCard label="Pages Indexed" value={stats.totalPages}  sub="Full-text searchable" accent />
        <StatCard label="Storage"       value="Cloud"             sub="PostgreSQL backed" />
      </div>

      {/* Two-column: Recent Files + Recent Users */}
      <div className="grid lg:grid-cols-2 gap-6">

        {/* Recent Files */}
        <div className="rounded-2xl border overflow-hidden" style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border)' }}>
          <div className="px-5 py-4 border-b" style={{ borderColor: 'var(--border)' }}>
            <h3 className="font-display text-lg" style={{ color: 'var(--text-primary)' }}>Recent Uploads</h3>
          </div>
          {stats.recentFiles.length === 0 ? (
            <p className="text-center py-8 text-sm" style={{ color: 'var(--text-muted)' }}>No files yet</p>
          ) : (
            <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
              {stats.recentFiles.map((f) => (
                <div key={f.id} className="flex items-center gap-3 px-5 py-3">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
                    <svg viewBox="0 0 24 24" className="w-4 h-4" style={{ fill: 'var(--accent)' }}>
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zm-1 1.5L18.5 9H13V3.5z"/>
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>{f.name}</p>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{f.user?.email} · {fmt(f.createdAt)}</p>
                  </div>
                  <span className="text-xs font-mono px-2 py-0.5 rounded" style={{ backgroundColor: 'var(--chip-bg)', color: 'var(--chip-text)' }}>
                    {f.page_count}p
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Users */}
        <div className="rounded-2xl border overflow-hidden" style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border)' }}>
          <div className="px-5 py-4 border-b" style={{ borderColor: 'var(--border)' }}>
            <h3 className="font-display text-lg" style={{ color: 'var(--text-primary)' }}>Recent Users</h3>
          </div>
          {stats.recentUsers.length === 0 ? (
            <p className="text-center py-8 text-sm" style={{ color: 'var(--text-muted)' }}>No users yet</p>
          ) : (
            <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
              {stats.recentUsers.map((u) => (
                <div key={u.id} className="flex items-center gap-3 px-5 py-3">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm flex-shrink-0"
                    style={{ backgroundColor: 'var(--bg-tertiary)', color: 'var(--accent)' }}>
                    {u.email[0].toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>{u.email}</p>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Joined {fmt(u.createdAt)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {u.role === 'ADMIN' && (
                      <span className="text-xs px-2 py-0.5 rounded border font-mono" style={{ color: 'var(--accent)', borderColor: 'var(--accent)' }}>ADMIN</span>
                    )}
                    {u.suspended && (
                      <span className="text-xs px-2 py-0.5 rounded" style={{ backgroundColor: 'rgba(239,68,68,.1)', color: '#ef4444' }}>SUSPENDED</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminStats;
