import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { searchFiles, clearSearch } from './pdfFilesSlice';

const SearchPage = () => {
  const dispatch  = useDispatch();
  const navigate  = useNavigate();
  const { searchResults, loading } = useSelector(s => s.pdfFiles);
  const [query, setQuery] = useState('');

  const handleSearch = e => {
    e.preventDefault();
    if (!query.trim()) return;
    dispatch(searchFiles(query.trim()));
  };

  const handleClear = () => {
    setQuery('');
    dispatch(clearSearch());
  };

  return (
    <div className="px-8 py-8 max-w-3xl mx-auto">
      <div className="mb-7">
        <h1 className="font-display text-3xl" style={{ color: 'var(--t1)' }}>Search</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--t3)' }}>
          Search across file titles and extracted page content
        </p>
      </div>

      {/* Search form */}
      <form onSubmit={handleSearch} className="flex gap-3 mb-8">
        <div className="flex-1 relative">
          <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: 'var(--t3)' }}>
            <circle cx="11" cy="11" r="6"/><path d="m21 21-3.5-3.5" strokeLinecap="round"/>
          </svg>
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search files and page content…"
            className="w-full rounded-2xl border pl-11 pr-4 py-3.5 text-sm font-sans outline-none"
            style={{ background: 'var(--bg2)', borderColor: 'var(--border2)', color: 'var(--t1)' }}
            onFocus={e => e.target.style.borderColor = 'var(--accent)'}
            onBlur={e => e.target.style.borderColor = 'var(--border2)'}
          />
        </div>
        <button type="submit" disabled={!query.trim() || loading}
          className="px-6 py-3.5 rounded-2xl text-sm font-sans font-bold disabled:opacity-40"
          style={{ background: 'var(--accent)', color: 'var(--bg)' }}>
          {loading ? '…' : 'Search'}
        </button>
        {searchResults && (
          <button type="button" onClick={handleClear}
            className="px-4 py-3.5 rounded-2xl text-sm font-sans border"
            style={{ borderColor: 'var(--border)', color: 'var(--t2)' }}>
            Clear
          </button>
        )}
      </form>

      {/* Results */}
      {searchResults && (
        <div className="space-y-6">
          {/* File title matches */}
          {searchResults.files.length > 0 && (
            <div>
              <h3 className="text-xs uppercase tracking-widest font-semibold mb-3" style={{ color: 'var(--t3)' }}>
                Files matching "{searchResults.query}" — {searchResults.files.length} result{searchResults.files.length !== 1 ? 's' : ''}
              </h3>
              <div className="space-y-2">
                {searchResults.files.map(file => {
                  const service = file.folder?.box?.service;
                  const breadcrumb = [service?.name, file.folder?.box?.name, file.folder?.name].filter(Boolean).join(' › ');
                  return (
                    <div key={file.id}
                      onClick={() => navigate(`/files/${file.id}`)}
                      className="flex items-center gap-4 px-5 py-4 rounded-2xl border cursor-pointer"
                      style={{ background: 'var(--bg2)', borderColor: 'var(--border)' }}
                      onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--accent)'}
                      onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
                    >
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ background: `${service?.color || '#f59e0b'}20` }}>
                        <svg viewBox="0 0 24 24" className="w-5 h-5" style={{ fill: service?.color || 'var(--accent)' }}>
                          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zm-1 1.5L18.5 9H13V3.5z"/>
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold truncate" style={{ color: 'var(--t1)' }}>{file.title}</p>
                        <p className="text-xs truncate" style={{ color: 'var(--t3)' }}>{breadcrumb}</p>
                      </div>
                      <span className="text-xs px-2 py-0.5 rounded font-mono flex-shrink-0"
                        style={{ background: 'rgba(16,185,129,.1)', color: 'var(--green)' }}>
                        title match
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Page content matches */}
          {searchResults.pages.length > 0 && (
            <div>
              <h3 className="text-xs uppercase tracking-widest font-semibold mb-3" style={{ color: 'var(--t3)' }}>
                Page content matches — {searchResults.pages.length} result{searchResults.pages.length !== 1 ? 's' : ''}
              </h3>
              <div className="space-y-2">
                {searchResults.pages.map(page => {
                  const file = page.pdfFile;
                  const service = file?.folder?.box?.service;
                  // Highlight snippet around query
                  const idx = page.content.toLowerCase().indexOf(searchResults.query.toLowerCase());
                  const start = Math.max(0, idx - 60);
                  const end   = Math.min(page.content.length, idx + 100);
                  const snippet = (start > 0 ? '…' : '') + page.content.slice(start, end) + (end < page.content.length ? '…' : '');

                  return (
                    <div key={page.id}
                      onClick={() => navigate(`/files/${file?.id}`)}
                      className="px-5 py-4 rounded-2xl border cursor-pointer"
                      style={{ background: 'var(--bg2)', borderColor: 'var(--border)' }}
                      onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--accent)'}
                      onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-sm font-semibold" style={{ color: 'var(--t1)' }}>{file?.title}</span>
                        <span className="text-xs font-mono px-2 py-0.5 rounded"
                          style={{ background: 'var(--chip-bg)', color: 'var(--chip-c)' }}>
                          p.{page.order}
                        </span>
                        <span className="text-xs px-2 py-0.5 rounded font-mono"
                          style={{ background: 'rgba(99,102,241,.1)', color: '#818cf8' }}>
                          content match
                        </span>
                      </div>
                      <p className="text-xs leading-relaxed" style={{ color: 'var(--t3)' }}>{snippet}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {searchResults.files.length === 0 && searchResults.pages.length === 0 && (
            <div className="text-center py-16">
              <div className="text-4xl mb-3">🔍</div>
              <p className="font-display text-lg" style={{ color: 'var(--t1)' }}>No results found</p>
              <p className="text-sm mt-1" style={{ color: 'var(--t3)' }}>
                Try different keywords or check the spelling
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchPage;
