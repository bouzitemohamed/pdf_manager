import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAuditLog } from './adminSlice';

const ACTION_STYLES = {
  FILE_UPLOAD:      { bg: 'rgba(16,185,129,.1)',  color: '#10b981', icon: '📤' },
  FILE_DELETE:      { bg: 'rgba(239,68,68,.1)',   color: '#ef4444', icon: '🗑️' },
  FILE_VIEW:        { bg: 'rgba(99,102,241,.1)',  color: '#818cf8', icon: '👁' },
  LOGIN:            { bg: 'rgba(245,158,11,.1)',  color: '#f59e0b', icon: '🔑' },
  LOGOUT:           { bg: 'rgba(107,114,128,.1)', color: '#9ca3af', icon: '🚪' },
  REGISTER:         { bg: 'rgba(59,130,246,.1)',  color: '#60a5fa', icon: '✨' },
  USER_SUSPENDED:   { bg: 'rgba(239,68,68,.1)',   color: '#ef4444', icon: '⛔' },
  USER_UNSUSPENDED: { bg: 'rgba(16,185,129,.1)',  color: '#10b981', icon: '✅' },
  USER_DELETED:     { bg: 'rgba(239,68,68,.15)',  color: '#ef4444', icon: '💀' },
  IMPERSONATE:      { bg: 'rgba(245,158,11,.1)',  color: '#f59e0b', icon: '🎭' },
};

const ALL_ACTIONS = Object.keys(ACTION_STYLES);

const fmt = (d) => new Date(d).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });

const AdminAuditLog = () => {
  const dispatch = useDispatch();
  const { auditLogs, totalLogs, loading } = useSelector((s) => s.admin);
  const [page, setPage]           = useState(1);
  const [filterAction, setFilter] = useState('');

  useEffect(() => {
    dispatch(fetchAuditLog({ page, limit: 50, ...(filterAction && { action: filterAction }) }));
  }, [page, filterAction, dispatch]);

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="font-display text-2xl" style={{ color: 'var(--text-primary)' }}>Audit Log</h2>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>{totalLogs} total events recorded</p>
        </div>
        <select
          value={filterAction}
          onChange={e => { setFilter(e.target.value); setPage(1); }}
          className="rounded-xl border px-3 py-2.5 text-sm font-sans outline-none"
          style={{ backgroundColor: 'var(--input-bg)', borderColor: 'var(--border-light)', color: 'var(--text-primary)' }}
        >
          <option value="">All actions</option>
          {ALL_ACTIONS.map(a => <option key={a} value={a}>{a}</option>)}
        </select>
      </div>

      <div className="rounded-2xl border overflow-hidden" style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border)' }}>
        {loading ? (
          <div className="py-16 text-center">
            <div className="w-7 h-7 border-2 border-t-transparent rounded-full animate-spin mx-auto" style={{ borderColor: 'var(--accent)', borderTopColor: 'transparent' }} />
          </div>
        ) : auditLogs.length === 0 ? (
          <p className="text-center py-12 text-sm" style={{ color: 'var(--text-muted)' }}>No activity yet</p>
        ) : (
          <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
            {auditLogs.map((entry) => {
              const style = ACTION_STYLES[entry.action] || { bg: 'rgba(107,114,128,.1)', color: '#9ca3af', icon: '•' };
              return (
                <div key={entry.id} className="flex items-start gap-4 px-5 py-3.5">
                  {/* Icon */}
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 text-sm"
                    style={{ backgroundColor: style.bg }}>
                    {style.icon}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded"
                        style={{ backgroundColor: style.bg, color: style.color }}>
                        {entry.action}
                      </span>
                      <span className="text-sm font-sans" style={{ color: 'var(--text-primary)' }}>
                        {entry.user?.email}
                      </span>
                      {entry.file && (
                        <span className="text-xs truncate max-w-xs" style={{ color: 'var(--text-muted)' }}>
                          → {entry.file.name}
                        </span>
                      )}
                    </div>
                    {entry.detail && (
                      <p className="text-xs mt-0.5 font-sans" style={{ color: 'var(--text-muted)' }}>{entry.detail}</p>
                    )}
                  </div>

                  {/* Timestamp */}
                  <span className="text-xs flex-shrink-0 font-mono" style={{ color: 'var(--text-muted)' }}>
                    {fmt(entry.createdAt)}
                  </span>
                </div>
              );
            })}
          </div>
        )}

        {totalLogs > 50 && (
          <div className="flex items-center justify-between px-5 py-3 border-t" style={{ borderColor: 'var(--border)' }}>
            <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="text-sm disabled:opacity-40" style={{ color: 'var(--text-secondary)' }}>← Prev</button>
            <span className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>Page {page} · {totalLogs} events</span>
            <button disabled={page * 50 >= totalLogs} onClick={() => setPage(p => p + 1)} className="text-sm disabled:opacity-40" style={{ color: 'var(--text-secondary)' }}>Next →</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminAuditLog;
