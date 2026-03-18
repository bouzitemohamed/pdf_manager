import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchFolder } from '../browse/browseSlice';
import { fetchFolderFiles, deletePdfFile } from './pdfFilesSlice';

const fmt = (d) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

const FolderPage = () => {
  const { id }   = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { currentFolder: folder, loading: folderLoading } = useSelector(s => s.browse);
  const { folderFiles, loading } = useSelector(s => s.pdfFiles);

  useEffect(() => {
    dispatch(fetchFolder(id));
    dispatch(fetchFolderFiles(id));
  }, [id, dispatch]);

  const handleDelete = async (fileId, title) => {
    if (!window.confirm(`Delete "${title}"?`)) return;
    dispatch(deletePdfFile(fileId));
  };

  if (folderLoading || !folder) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin"
          style={{ borderColor: 'var(--accent)', borderTopColor: 'transparent' }}/>
      </div>
    );
  }

  const service = folder.box?.service;
  const breadcrumb = [service?.name, folder.box?.name, folder.name].filter(Boolean);

  return (
    <div className="px-8 py-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 mb-5 text-xs" style={{ color: 'var(--t3)' }}>
        <button onClick={() => navigate('/browse')} style={{ color: 'var(--accent)' }}>Browse</button>
        {breadcrumb.map((b, i) => (
          <span key={i} className="flex items-center gap-2">
            <span>›</span>
            <span style={{ color: i === breadcrumb.length - 1 ? 'var(--t1)' : 'var(--t3)' }}>{b}</span>
          </span>
        ))}
      </div>

      {/* Header */}
      <div className="flex items-start justify-between mb-7">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl"
            style={{ background: `${service?.color || '#f59e0b'}20` }}>
            📁
          </div>
          <div>
            <h1 className="font-display text-3xl" style={{ color: 'var(--t1)' }}>{folder.name}</h1>
            {folder.description && (
              <p className="text-sm mt-0.5" style={{ color: 'var(--t3)' }}>{folder.description}</p>
            )}
            <p className="text-xs mt-1" style={{ color: 'var(--t3)' }}>
              Created by {folder.createdBy?.email} · {folderFiles.length} files
            </p>
          </div>
        </div>
        <button
          onClick={() => navigate('/upload')}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-sans font-semibold"
          style={{ background: 'var(--accent)', color: 'var(--bg)' }}>
          + Add PDF
        </button>
      </div>

      {/* Files list */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-7 h-7 rounded-full border-2 border-t-transparent animate-spin"
            style={{ borderColor: 'var(--accent)', borderTopColor: 'transparent' }}/>
        </div>
      ) : folderFiles.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-4xl mb-3">📄</div>
          <p className="font-display text-lg" style={{ color: 'var(--t1)' }}>No files in this folder</p>
          <button onClick={() => navigate('/upload')}
            className="mt-4 px-5 py-2 rounded-xl text-sm font-sans font-semibold"
            style={{ background: 'var(--accent)', color: 'var(--bg)' }}>
            Upload PDF
          </button>
        </div>
      ) : (
        <div className="rounded-2xl border overflow-hidden" style={{ background: 'var(--bg2)', borderColor: 'var(--border)' }}>
          {/* Table header */}
          <div className="grid grid-cols-12 px-5 py-3 text-xs uppercase tracking-widest border-b"
            style={{ background: 'var(--bg3)', borderColor: 'var(--border)', color: 'var(--t3)' }}>
            <span className="col-span-5">Title</span>
            <span className="col-span-2">Date Created</span>
            <span className="col-span-2">Uploaded by</span>
            <span className="col-span-1">Pages</span>
            <span className="col-span-2 text-right">Actions</span>
          </div>

          <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
            {folderFiles.map(file => (
              <div key={file.id}
                className="grid grid-cols-12 px-5 py-3.5 items-center group cursor-pointer"
                onClick={() => navigate(`/files/${file.id}`)}
                style={{ transition: 'background .15s' }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--bg3)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>

                <div className="col-span-5 flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ background: `${service?.color || '#f59e0b'}15` }}>
                    <svg viewBox="0 0 24 24" className="w-4 h-4" style={{ fill: service?.color || 'var(--accent)' }}>
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zm-1 1.5L18.5 9H13V3.5z"/>
                    </svg>
                  </div>
                  <span className="text-sm font-medium truncate" style={{ color: 'var(--t1)' }}>{file.title}</span>
                </div>

                <div className="col-span-2 text-xs" style={{ color: 'var(--t3)' }}>
                  {fmt(file.dateCreated || file.createdAt)}
                </div>

                <div className="col-span-2 text-xs truncate" style={{ color: 'var(--t3)' }}>
                  {file.uploadedBy?.email}
                </div>

                <div className="col-span-1">
                  <span className="text-xs font-mono px-2 py-0.5 rounded"
                    style={{ background: 'var(--chip-bg)', color: 'var(--chip-c)' }}>
                    {file._count?.pages || file.pageCount}p
                  </span>
                </div>

                <div className="col-span-2 flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={e => { e.stopPropagation(); navigate(`/files/${file.id}`); }}
                    className="px-3 py-1 rounded-lg text-xs border font-sans"
                    style={{ borderColor: 'var(--border)', color: 'var(--t2)', background: 'var(--bg2)' }}>
                    View
                  </button>
                  <button onClick={e => { e.stopPropagation(); handleDelete(file.id, file.title); }}
                    className="px-3 py-1 rounded-lg text-xs font-sans"
                    style={{ background: 'rgba(239,68,68,.1)', color: '#ef4444' }}>
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default FolderPage;
