import { useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchFiles, deleteFile, fetchFileDetail, setSearchQuery } from './filesSlice';

const formatDate = (d) =>
  new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

const FileList = () => {
  const dispatch = useDispatch();
  const { items, total, loading, searchQuery, selectedFile } = useSelector((s) => s.files);
  const [deleting, setDeleting] = useState(null);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => {
      dispatch(setSearchQuery(search));
      setPage(1);
    }, 350);
    return () => clearTimeout(t);
  }, [search, dispatch]);

  useEffect(() => {
    dispatch(fetchFiles({ search: searchQuery, page, limit: 20 }));
  }, [searchQuery, page, dispatch]);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this file?')) return;
    setDeleting(id);
    await dispatch(deleteFile(id));
    setDeleting(null);
  };

  const handleView = (id) => {
    dispatch(fetchFileDetail(id));
  };

  return (
    <div className="bg-ink-800 border border-ink-600 rounded-2xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 p-6 border-b border-ink-700">
        <div>
          <h2 className="font-display text-xl text-white">Documents</h2>
          <p className="text-ink-400 text-xs font-sans mt-0.5">{total} total</p>
        </div>
        <div className="sm:ml-auto relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 fill-ink-400" viewBox="0 0 24 24">
            <path d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" stroke="currentColor" strokeWidth="2" fill="none"/>
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search files…"
            className="bg-ink-700 border border-ink-500 rounded-lg pl-10 pr-4 py-2 text-white font-sans text-sm placeholder-ink-400 focus:outline-none focus:border-amber-500 transition-colors w-64"
          />
        </div>
      </div>

      {/* File viewer modal */}
      {selectedFile && (
        <div className="fixed inset-0 bg-ink-900/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-ink-800 border border-ink-600 rounded-2xl w-full max-w-3xl max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between p-5 border-b border-ink-700">
              <div>
                <h3 className="font-display text-lg text-white">{selectedFile.name}</h3>
                <p className="text-ink-400 text-xs font-sans mt-0.5">{selectedFile.page_count} pages · {selectedFile.num_box || 'No box'}</p>
              </div>
              <button onClick={() => dispatch({ type: 'files/clearSelectedFile' })} className="text-ink-400 hover:text-white transition-colors p-2">
                <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current"><path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" fill="none"/></svg>
              </button>
            </div>
            <div className="overflow-y-auto p-5 space-y-4">
              {selectedFile.pages?.map((p) => (
                <div key={p.id} className="border border-ink-600 rounded-lg p-4">
                  <p className="text-amber-500 font-mono text-xs mb-2">Page {p.order}</p>
                  <p className="text-ink-200 font-sans text-sm leading-relaxed whitespace-pre-wrap">{p.content}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* List */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="w-7 h-7 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-16 text-ink-400 font-sans text-sm">
          {searchQuery ? 'No files match your search.' : 'No documents yet. Upload your first PDF!'}
        </div>
      ) : (
        <div className="divide-y divide-ink-700">
          {items.map((file) => (
            <div key={file.id} className="flex items-center gap-4 px-6 py-4 hover:bg-ink-700/40 transition-colors group">
              {/* Icon */}
              <div className="flex-shrink-0 w-10 h-10 bg-ink-700 rounded-lg flex items-center justify-center">
                <svg viewBox="0 0 24 24" className="w-5 h-5 fill-amber-500">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zm-1 1.5L18.5 9H13V3.5z"/>
                </svg>
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="text-white font-sans font-medium text-sm truncate">{file.name}</p>
                <div className="flex items-center gap-3 mt-0.5">
                  <span className="text-ink-400 text-xs font-sans">{file.page_count} pages</span>
                  {file.num_box && (
                    <span className="text-xs font-mono bg-ink-700 text-amber-400 px-2 py-0.5 rounded">{file.num_box}</span>
                  )}
                  <span className="text-ink-500 text-xs font-sans">{formatDate(file.createdAt)}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => handleView(file.id)}
                  className="text-xs font-sans text-ink-300 hover:text-white bg-ink-700 hover:bg-ink-600 px-3 py-1.5 rounded-lg transition-colors"
                >
                  View
                </button>
                <button
                  onClick={() => handleDelete(file.id)}
                  disabled={deleting === file.id}
                  className="text-xs font-sans text-red-400 hover:text-red-300 bg-red-900/20 hover:bg-red-900/40 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
                >
                  {deleting === file.id ? '…' : 'Delete'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {total > 20 && (
        <div className="flex items-center justify-between px-6 py-4 border-t border-ink-700">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="text-sm font-sans text-ink-400 hover:text-white disabled:opacity-40 transition-colors"
          >
            ← Previous
          </button>
          <span className="text-ink-500 text-xs font-sans">Page {page}</span>
          <button
            onClick={() => setPage((p) => p + 1)}
            disabled={page * 20 >= total}
            className="text-sm font-sans text-ink-400 hover:text-white disabled:opacity-40 transition-colors"
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
};

export default FileList;
