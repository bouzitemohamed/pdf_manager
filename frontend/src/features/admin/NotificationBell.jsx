import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { markAllRead } from './adminSlice';

const ACTION_ICONS = {
  FILE_UPLOAD: '📄',
  FILE_DELETE: '🗑️',
  default:     '🔔',
};

const NotificationBell = () => {
  const dispatch = useDispatch();
  const { notifications } = useSelector((s) => s.admin);
  const [open, setOpen] = useState(false);
  const unread = notifications.filter((n) => !n.read).length;

  const handleOpen = () => {
    setOpen(!open);
    if (!open && unread > 0) dispatch(markAllRead());
  };

  return (
    <div className="relative">
      <button
        onClick={handleOpen}
        className="relative p-2 rounded-xl border transition-all"
        style={{ backgroundColor: 'var(--bg-tertiary)', borderColor: 'var(--border)', color: 'var(--text-secondary)' }}
      >
        <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
          <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
        </svg>
        {unread > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full text-xs font-bold flex items-center justify-center"
            style={{ backgroundColor: 'var(--accent)', color: 'var(--bg-primary)' }}>
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-12 w-80 rounded-2xl border shadow-2xl z-50 overflow-hidden"
            style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border)' }}>
            <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: 'var(--border)' }}>
              <span className="font-sans font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
                Notifications
              </span>
              <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{notifications.length} total</span>
            </div>

            <div className="max-h-80 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="py-10 text-center text-sm" style={{ color: 'var(--text-muted)' }}>
                  No notifications yet
                </div>
              ) : (
                notifications.map((n) => (
                  <div key={n.id} className="flex gap-3 px-4 py-3 border-b transition-colors"
                    style={{ borderColor: 'var(--border)', backgroundColor: n.read ? 'transparent' : 'rgba(245,158,11,0.04)' }}>
                    <span className="text-lg flex-shrink-0">{ACTION_ICONS[n.type] || ACTION_ICONS.default}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-sans leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{n.message}</p>
                      <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                        {new Date(n.timestamp).toLocaleTimeString()}
                      </p>
                    </div>
                    {!n.read && (
                      <div className="w-2 h-2 rounded-full flex-shrink-0 mt-1" style={{ backgroundColor: 'var(--accent)' }} />
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default NotificationBell;
