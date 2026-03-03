import { useDispatch, useSelector } from 'react-redux';
import { toggleTheme } from '../features/theme/themeSlice';

const ThemeToggle = () => {
  const dispatch = useDispatch();
  const { mode } = useSelector((s) => s.theme);
  const isDark = mode === 'dark';

  return (
    <button
      onClick={() => dispatch(toggleTheme())}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      className={`
        relative inline-flex items-center gap-2 px-3 py-2 rounded-xl border text-sm font-sans
        transition-all duration-200 group
        ${isDark
          ? 'bg-ink-700 border-ink-600 text-ink-300 hover:border-amber-500 hover:text-amber-400'
          : 'bg-slate-100 border-slate-300 text-slate-600 hover:border-amber-500 hover:text-amber-600'
        }
      `}
    >
      {/* Sun icon */}
      <svg
        viewBox="0 0 24 24"
        className={`w-4 h-4 transition-all duration-300 ${isDark ? 'opacity-40 scale-90' : 'opacity-100 scale-100 text-amber-500'}`}
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="12" cy="12" r="4"/>
        <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/>
      </svg>

      {/* Toggle track */}
      <div className={`
        relative w-10 h-5 rounded-full transition-all duration-300
        ${isDark ? 'bg-ink-600' : 'bg-amber-400'}
      `}>
        <div className={`
          absolute top-0.5 w-4 h-4 rounded-full shadow-sm transition-all duration-300
          ${isDark ? 'left-0.5 bg-ink-300' : 'left-5 bg-white'}
        `}/>
      </div>

      {/* Moon icon */}
      <svg
        viewBox="0 0 24 24"
        className={`w-4 h-4 transition-all duration-300 ${isDark ? 'opacity-100 scale-100 text-amber-400' : 'opacity-40 scale-90'}`}
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
      </svg>
    </button>
  );
};

export default ThemeToggle;
