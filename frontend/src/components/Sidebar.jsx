import { NavLink, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logoutUser } from '../features/auth/authSlice';
import ThemeToggle from './ThemeToggle';

const NAV = [
  {
    section: 'Main',
    items: [
      { to: '/dashboard',        icon: '⊞', label: 'My Files' },
      { to: '/recent',           icon: '◷', label: 'Recent Activity' },
      { to: '/search',           icon: '⊕', label: 'Search' },
    ]
  },
  {
    section: 'Browse',
    items: [
      { to: '/browse',           icon: '❏', label: 'Services & Boxes' },
    ]
  },
  {
    section: 'Upload',
    items: [
      { to: '/upload',           icon: '↑', label: 'Upload PDF' },
      { to: '/folders/new',      icon: '+', label: 'New Folder' },
    ]
  }
];

const Sidebar = () => {
  const dispatch  = useDispatch();
  const navigate  = useNavigate();
  const { user }  = useSelector(s => s.auth);

  const handleLogout = async () => {
    await dispatch(logoutUser());
    navigate('/login');
  };

  return (
    <aside
      className="flex flex-col h-screen w-60 flex-shrink-0 border-r font-sans transition-colors duration-250"
      style={{ backgroundColor: 'var(--bg2)', borderColor: 'var(--border)' }}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5 border-b" style={{ borderColor: 'var(--border)' }}>
        <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: 'var(--accent)' }}>
          <svg viewBox="0 0 24 24" className="w-5 h-5" style={{ fill: 'var(--bg)' }}>
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zm-1 1.5L18.5 9H13V3.5z"/>
          </svg>
        </div>
        <span className="font-display text-lg" style={{ color: 'var(--t1)' }}>Archivum</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-3">
        {NAV.map(group => (
          <div key={group.section} className="mb-5">
            <p className="text-xs uppercase tracking-widest px-3 mb-2 font-medium"
              style={{ color: 'var(--t3)' }}>
              {group.section}
            </p>
            {group.items.map(item => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-xl mb-0.5 text-sm font-medium transition-all ${
                    isActive ? 'font-semibold' : ''
                  }`
                }
                style={({ isActive }) => ({
                  backgroundColor: isActive ? 'rgba(245,158,11,0.12)' : 'transparent',
                  color: isActive ? 'var(--accent)' : 'var(--t2)',
                })}
                onMouseEnter={e => { if (!e.currentTarget.classList.contains('active')) e.currentTarget.style.backgroundColor = 'var(--bg3)'; }}
                onMouseLeave={e => { if (!e.currentTarget.style.color.includes('accent')) e.currentTarget.style.backgroundColor = 'transparent'; }}
              >
                <span className="text-base w-5 text-center">{item.icon}</span>
                {item.label}
              </NavLink>
            ))}
          </div>
        ))}

        {/* Admin link — only for admins */}
        {user?.role === 'ADMIN' && (
          <div className="mb-5">
            <p className="text-xs uppercase tracking-widest px-3 mb-2 font-medium" style={{ color: 'var(--t3)' }}>
              Admin
            </p>
            <NavLink
              to="/admin"
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all border"
              style={{ borderColor: 'var(--accent)', color: 'var(--accent)', backgroundColor: 'rgba(245,158,11,0.06)' }}
            >
              <span className="text-base w-5 text-center">⚙</span>
              Admin Panel
            </NavLink>
          </div>
        )}
      </nav>

      {/* Bottom: user info + theme + logout */}
      <div className="border-t p-4 space-y-3" style={{ borderColor: 'var(--border)' }}>
        <ThemeToggle />

        <div className="flex items-center gap-3 px-1">
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
            style={{ backgroundColor: 'var(--bg3)', color: 'var(--accent)' }}>
            {user?.email?.[0]?.toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium truncate" style={{ color: 'var(--t1)' }}>{user?.email}</p>
            <p className="text-xs" style={{ color: 'var(--t3)' }}>{user?.role}</p>
          </div>
          <button
            onClick={handleLogout}
            title="Sign out"
            className="p-1.5 rounded-lg transition-colors"
            style={{ color: 'var(--t3)' }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--t1)'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--t3)'}
          >
            <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16 17 21 12 16 7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
