import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAdminUsers, suspendUser, unsuspendUser, deleteAdminUser, impersonateUser } from './adminSlice';

const fmt = (d) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

const AdminUsers = () => {
  const dispatch = useDispatch();
  const { users, totalUsers, loading } = useSelector((s) => s.admin);
  const { user: me } = useSelector((s) => s.auth);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [acting, setActing] = useState(null);
  const [impersonating, setImpersonating] = useState(null);

  useEffect(() => {
    const t = setTimeout(() => { dispatch(fetchAdminUsers({ search, page, limit: 20 })); }, 300);
    return () => clearTimeout(t);
  }, [search, page, dispatch]);

  const handle = async (action, userId) => {
    setActing(userId);
    await dispatch(action(userId));
    setActing(null);
  };

  const handleImpersonate = async (userId) => {
    setActing(userId);
    const result = await dispatch(impersonateUser(userId));
    setActing(null);
    if (result.payload?.accessToken) {
      setImpersonating(result.payload);
    }
  };

  return (
    <div>
      {/* Impersonation Banner */}
      {impersonating && (
        <div className="mb-4 px-4 py-3 rounded-xl border flex items-center justify-between"
          style={{ backgroundColor: 'rgba(245,158,11,0.1)', borderColor: 'var(--accent)' }}>
          <p className="text-sm font-sans" style={{ color: 'var(--accent)' }}>
            🎭 Impersonation token generated for <strong>{impersonating.impersonating.email}</strong>
            <span className="ml-2 text-xs opacity-70">(valid 5 minutes)</span>
          </p>
          <div className="flex gap-2">
            <code className="text-xs px-2 py-1 rounded font-mono max-w-xs truncate"
              style={{ backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-secondary)' }}>
              {impersonating.accessToken.substring(0, 40)}…
            </code>
            <button onClick={() => { navigator.clipboard.writeText(impersonating.accessToken); }}
              className="text-xs px-3 py-1 rounded border transition-colors"
              style={{ borderColor: 'var(--accent)', color: 'var(--accent)' }}>
              Copy Token
            </button>
            <button onClick={() => setImpersonating(null)} style={{ color: 'var(--text-muted)' }}>✕</button>
          </div>
        </div>
      )}

      {/* Search + header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="font-display text-2xl" style={{ color: 'var(--text-primary)' }}>Users</h2>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>{totalUsers} total accounts</p>
        </div>
        <div className="relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: 'var(--text-muted)' }}>
            <circle cx="11" cy="11" r="6"/><path d="m21 21-3.5-3.5" strokeLinecap="round"/>
          </svg>
          <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search by email…"
            className="rounded-xl border pl-10 pr-4 py-2.5 text-sm font-sans outline-none transition-colors w-60"
            style={{ backgroundColor: 'var(--input-bg)', borderColor: 'var(--border-light)', color: 'var(--text-primary)' }}
            onFocus={e => e.target.style.borderColor = 'var(--accent)'}
            onBlur={e => e.target.style.borderColor = 'var(--border-light)'}
          />
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl border overflow-hidden" style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border)' }}>
        <div className="grid grid-cols-12 px-5 py-3 text-xs uppercase tracking-widest font-sans border-b"
          style={{ backgroundColor: 'var(--bg-tertiary)', borderColor: 'var(--border)', color: 'var(--text-muted)' }}>
          <span className="col-span-4">Email</span>
          <span className="col-span-2">Role</span>
          <span className="col-span-1">Files</span>
          <span className="col-span-2">Status</span>
          <span className="col-span-2">Joined</span>
          <span className="col-span-1 text-right">Actions</span>
        </div>

        {loading ? (
          <div className="py-16 text-center">
            <div className="w-7 h-7 border-2 border-t-transparent rounded-full animate-spin mx-auto" style={{ borderColor: 'var(--accent)', borderTopColor: 'transparent' }} />
          </div>
        ) : users.length === 0 ? (
          <p className="text-center py-12 text-sm" style={{ color: 'var(--text-muted)' }}>No users found</p>
        ) : (
          <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
            {users.map((u) => (
              <div key={u.id} className="grid grid-cols-12 px-5 py-3.5 items-center transition-colors group"
                style={{ ':hover': { backgroundColor: 'var(--bg-hover)' } }}>

                <div className="col-span-4 flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0"
                    style={{ backgroundColor: 'var(--bg-tertiary)', color: 'var(--accent)' }}>
                    {u.email[0].toUpperCase()}
                  </div>
                  <span className="text-sm font-sans truncate" style={{ color: 'var(--text-primary)' }}>{u.email}</span>
                  {u.id === me?.id && <span className="text-xs" style={{ color: 'var(--text-muted)' }}>(you)</span>}
                </div>

                <div className="col-span-2">
                  <span className="text-xs font-mono px-2 py-0.5 rounded border"
                    style={u.role === 'ADMIN'
                      ? { color: 'var(--accent)', borderColor: 'var(--accent)', backgroundColor: 'rgba(245,158,11,0.08)' }
                      : { color: 'var(--text-muted)', borderColor: 'var(--border)' }}>
                    {u.role}
                  </span>
                </div>

                <div className="col-span-1 text-sm" style={{ color: 'var(--text-secondary)' }}>
                  {u._count?.files ?? 0}
                </div>

                <div className="col-span-2">
                  <span className="text-xs px-2 py-0.5 rounded font-sans"
                    style={u.suspended
                      ? { backgroundColor: 'rgba(239,68,68,.12)', color: '#ef4444' }
                      : { backgroundColor: 'rgba(16,185,129,.12)', color: '#10b981' }}>
                    {u.suspended ? 'Suspended' : 'Active'}
                  </span>
                </div>

                <div className="col-span-2 text-xs" style={{ color: 'var(--text-muted)' }}>
                  {fmt(u.createdAt)}
                </div>

                <div className="col-span-1 flex justify-end gap-1">
                  {u.id !== me?.id && u.role !== 'ADMIN' && (
                    <>
                      <button onClick={() => handle(u.suspended ? unsuspendUser : suspendUser, u.id)}
                        disabled={acting === u.id}
                        title={u.suspended ? 'Unsuspend' : 'Suspend'}
                        className="p-1.5 rounded-lg transition-colors disabled:opacity-40"
                        style={{ backgroundColor: 'var(--bg-tertiary)', color: u.suspended ? '#10b981' : '#f59e0b' }}>
                        {acting === u.id ? '…' : u.suspended ? '▶' : '⏸'}
                      </button>
                      <button onClick={() => handleImpersonate(u.id)}
                        disabled={acting === u.id}
                        title="Impersonate"
                        className="p-1.5 rounded-lg transition-colors disabled:opacity-40"
                        style={{ backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-secondary)' }}>
                        🎭
                      </button>
                      <button onClick={() => { if (window.confirm(`Delete ${u.email}?`)) handle(deleteAdminUser, u.id); }}
                        disabled={acting === u.id}
                        title="Delete user"
                        className="p-1.5 rounded-lg transition-colors disabled:opacity-40"
                        style={{ backgroundColor: 'rgba(239,68,68,.1)', color: '#ef4444' }}>
                        🗑
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalUsers > 20 && (
          <div className="flex items-center justify-between px-5 py-3 border-t" style={{ borderColor: 'var(--border)' }}>
            <button disabled={page === 1} onClick={() => setPage(p => p - 1)}
              className="text-sm disabled:opacity-40" style={{ color: 'var(--text-secondary)' }}>← Prev</button>
            <span className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>Page {page}</span>
            <button disabled={page * 20 >= totalUsers} onClick={() => setPage(p => p + 1)}
              className="text-sm disabled:opacity-40" style={{ color: 'var(--text-secondary)' }}>Next →</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminUsers;
