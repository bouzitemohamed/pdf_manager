import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchPdfFile, updatePdfFile, deletePdfFile } from './pdfFilesSlice';
import api from '../../utils/api';

const FileViewerPage = () => {
  const { id }    = useParams();
  const dispatch  = useDispatch();
  const navigate  = useNavigate();
  const { currentFile: file, loading } = useSelector(s => s.pdfFiles);

  const [viewToken, setViewToken] = useState(null);
  const [tab, setTab]         = useState('pdf');     // 'pdf' | 'text' | 'edit'
  const [editTitle, setTitle] = useState('');
  const [editDate, setDate]   = useState('');
  const [editPages, setEditPages] = useState([]);
  const [saving, setSaving]   = useState(false);
  const [newPdf, setNewPdf]   = useState(null);
  const [saveMsg, setSaveMsg] = useState('');

  useEffect(() => { dispatch(fetchPdfFile(id)); }, [id, dispatch]);

  // Fetch a short-lived token for the PDF iframe
  useEffect(() => {
    api.get(`/files/${id}/view-token`).then(r => setViewToken(r.data.token)).catch(() => {});
  }, [id]);

  useEffect(() => {
    if (file) {
      setTitle(file.title);
      setDate(file.dateCreated?.split('T')[0] || '');
      setEditPages(file.pages?.map(p => ({ ...p })) || []);
    }
  }, [file]);

  const handleSave = async () => {
    setSaving(true);
    const formData = new FormData();
    formData.append('title', editTitle);
    formData.append('dateCreated', editDate);
    editPages.forEach(p => {
      formData.append(`pages[${p.order - 1}][order]`, p.order);
      formData.append(`pages[${p.order - 1}][content]`, p.content);
    });
    if (newPdf) formData.append('pdf', newPdf);

    await dispatch(updatePdfFile({ id, formData }));
    setSaving(false);
    setSaveMsg('Saved successfully!');
    setTimeout(() => setSaveMsg(''), 3000);
    setNewPdf(null);
    setTab('text');
  };

  const handleDelete = async () => {
    if (!window.confirm(`Delete "${file?.title}"? This cannot be undone.`)) return;
    await dispatch(deletePdfFile(id));
    navigate('/dashboard');
  };

  const handleDownload = () => {
    window.open(`/api/files/${id}/download`, '_blank');
  };

  const inputStyle = { width: '100%', background: 'var(--bg3)', border: '1px solid var(--border2)', borderRadius: 10, padding: '10px 14px', color: 'var(--t1)', fontFamily: 'DM Sans, sans-serif', fontSize: 14, outline: 'none' };
  const labelStyle = { fontSize: 10, color: 'var(--t2)', textTransform: 'uppercase', letterSpacing: '.14em', fontWeight: 500, display: 'block', marginBottom: 6 };

  if (loading || !file) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: 'var(--accent)', borderTopColor: 'transparent' }}/>
      </div>
    );
  }

  const breadcrumb = [
    file.folder?.box?.service?.name,
    file.folder?.box?.name,
    file.folder?.name
  ].filter(Boolean).join(' › ');

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-start justify-between px-8 py-5 border-b flex-shrink-0" style={{ borderColor: 'var(--border)', background: 'var(--bg2)' }}>
        <div>
          <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-xs mb-2 transition-colors"
            style={{ color: 'var(--t3)' }}>
            ← Back
          </button>
          <h1 className="font-display text-2xl" style={{ color: 'var(--t1)' }}>{file.title}</h1>
          <p className="text-xs mt-1" style={{ color: 'var(--t3)' }}>
            {breadcrumb} · {file._count?.pages || file.pages?.length || 0} pages · {file.uploadedBy?.email}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={handleDownload}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-sans transition-colors"
            style={{ borderColor: 'var(--border)', color: 'var(--t2)', background: 'var(--bg3)' }}>
            ↓ Download
          </button>
          <button onClick={handleDelete}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-sans transition-colors"
            style={{ background: 'rgba(239,68,68,.1)', color: '#ef4444' }}>
            🗑 Delete
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 px-8 py-3 border-b flex-shrink-0" style={{ borderColor: 'var(--border)', background: 'var(--bg2)' }}>
        {[
          { id: 'pdf',  label: '📄 View PDF' },
          { id: 'text', label: '📝 Text Pages' },
          { id: 'edit', label: '✏️ Edit' }
        ].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className="px-4 py-2 rounded-lg text-sm font-sans font-medium transition-all border-b-2"
            style={{
              borderBottomColor: tab === t.id ? 'var(--accent)' : 'transparent',
              color: tab === t.id ? 'var(--accent)' : 'var(--t2)'
            }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-8 py-6">

        {/* PDF Viewer */}
        {tab === 'pdf' && (
          file.filePath ? (
            viewToken ? (
              <div className="w-full rounded-2xl overflow-hidden border" style={{ borderColor: 'var(--border)', height: 'calc(100vh - 200px)' }}>
                <iframe
                  src={`/api/files/${id}/view?token=${viewToken}`}
                  className="w-full h-full"
                  title={file.title}
                />
              </div>
            ) : (
              <div className="flex items-center justify-center" style={{ height: 'calc(100vh - 200px)' }}>
                <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: 'var(--accent)', borderTopColor: 'transparent' }}/>
              </div>
            )
          ) : (
            <div className="text-center py-20" style={{ color: 'var(--t3)' }}>
              <div className="text-4xl mb-3">📄</div>
              <p>No PDF binary stored for this file</p>
            </div>
          )
        )}

        {/* Text pages */}
        {tab === 'text' && (
          <div className="max-w-3xl mx-auto space-y-4">
            {file.pages?.length === 0 && (
              <p className="text-center py-10" style={{ color: 'var(--t3)' }}>No extracted text available</p>
            )}
            {file.pages?.map(page => (
              <div key={page.id} className="rounded-2xl border overflow-hidden" style={{ background: 'var(--bg2)', borderColor: 'var(--border)' }}>
                <div className="flex items-center justify-between px-5 py-3 border-b" style={{ background: 'var(--bg)', borderColor: 'var(--border)' }}>
                  <span className="font-mono text-xs font-semibold" style={{ color: 'var(--accent)' }}>
                    PAGE {String(page.order).padStart(2, '0')}
                  </span>
                  <span className="text-xs" style={{ color: 'var(--t3)' }}>{page.content.length} chars</span>
                </div>
                <pre className="px-5 py-4 text-sm leading-relaxed whitespace-pre-wrap font-sans" style={{ color: 'var(--t2)' }}>
                  {page.content}
                </pre>
              </div>
            ))}
          </div>
        )}

        {/* Edit */}
        {tab === 'edit' && (
          <div className="max-w-2xl mx-auto">
            {saveMsg && (
              <div className="mb-4 px-4 py-3 rounded-xl text-sm" style={{ background: 'rgba(16,185,129,.1)', color: 'var(--green)', border: '1px solid var(--green)' }}>
                ✓ {saveMsg}
              </div>
            )}

            <div className="rounded-2xl border p-6 space-y-5 mb-6" style={{ background: 'var(--bg2)', borderColor: 'var(--border)' }}>
              <h3 className="font-display text-lg" style={{ color: 'var(--t1)' }}>File Information</h3>

              <div>
                <label style={labelStyle}>Title</label>
                <input style={inputStyle} value={editTitle} onChange={e => setTitle(e.target.value)}/>
              </div>

              <div>
                <label style={labelStyle}>Date Created</label>
                <input style={inputStyle} type="date" value={editDate} onChange={e => setDate(e.target.value)}/>
              </div>

              <div>
                <label style={labelStyle}>Replace PDF File (optional)</label>
                <input
                  type="file" accept=".pdf"
                  onChange={e => setNewPdf(e.target.files[0])}
                  style={{ ...inputStyle, padding: '8px 14px' }}
                />
                {newPdf && <p className="text-xs mt-1" style={{ color: 'var(--green)' }}>New file selected: {newPdf.name}</p>}
              </div>
            </div>

            <div className="rounded-2xl border p-6 space-y-4" style={{ background: 'var(--bg2)', borderColor: 'var(--border)' }}>
              <h3 className="font-display text-lg" style={{ color: 'var(--t1)' }}>Edit Page Text</h3>
              <p className="text-xs" style={{ color: 'var(--t3)' }}>Edit the extracted text content of each page</p>

              {editPages.map((page, idx) => (
                <div key={page.id || idx}>
                  <label style={labelStyle}>Page {page.order}</label>
                  <textarea
                    rows={5}
                    style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.7 }}
                    value={page.content}
                    onChange={e => {
                      const updated = [...editPages];
                      updated[idx] = { ...updated[idx], content: e.target.value };
                      setEditPages(updated);
                    }}
                  />
                </div>
              ))}
            </div>

            <button
              onClick={handleSave}
              disabled={saving}
              className="w-full mt-5 rounded-xl py-3 text-sm font-bold font-sans disabled:opacity-40"
              style={{ background: 'var(--accent)', color: 'var(--bg)' }}
            >
              {saving ? 'Saving…' : 'Save Changes'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default FileViewerPage;