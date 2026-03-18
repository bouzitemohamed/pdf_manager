import { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useDropzone } from 'react-dropzone';
import { useNavigate } from 'react-router-dom';
import { fetchServices } from '../services/servicesSlice';
import { fetchBoxes, fetchFolders } from '../browse/browseSlice';
import { uploadPdfFile } from './pdfFilesSlice';

const UploadPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items: services } = useSelector(s => s.services);
  const { boxes, folders }  = useSelector(s => s.browse);
  const { uploading, uploadProgress, error } = useSelector(s => s.pdfFiles);

  const [file, setFile]           = useState(null);
  const [title, setTitle]         = useState('');
  const [dateCreated, setDate]    = useState(new Date().toISOString().split('T')[0]);
  const [serviceId, setServiceId] = useState('');
  const [boxId, setBoxId]         = useState('');
  const [folderId, setFolderId]   = useState('');
  const [progress, setProgress]   = useState(0);
  const [success, setSuccess]     = useState(false);

  useEffect(() => { dispatch(fetchServices()); }, [dispatch]);

  useEffect(() => {
    if (serviceId) { dispatch(fetchBoxes({ serviceId })); setBoxId(''); setFolderId(''); }
  }, [serviceId, dispatch]);

  useEffect(() => {
    if (boxId) { dispatch(fetchFolders({ boxId })); setFolderId(''); }
  }, [boxId, dispatch]);

  const onDrop = useCallback(acceptedFiles => {
    const f = acceptedFiles[0];
    if (f) {
      setFile(f);
      if (!title) setTitle(f.name.replace('.pdf', '').replace(/_/g, ' '));
    }
  }, [title]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    maxFiles: 1
  });

  const handleSubmit = async () => {
    if (!file || !title || !folderId) return;

    const formData = new FormData();
    formData.append('pdf', file);
    formData.append('title', title);
    formData.append('folderId', folderId);
    formData.append('dateCreated', dateCreated);

    const result = await dispatch(uploadPdfFile({
      formData,
      onProgress: p => setProgress(p)
    }));

    if (!result.error) {
      setSuccess(true);
      setTimeout(() => navigate(`/files/${result.payload.id}`), 1500);
    }
  };

  const labelStyle = { fontSize: 10, color: 'var(--t2)', textTransform: 'uppercase', letterSpacing: '.14em', fontWeight: 500, display: 'block', marginBottom: 6 };
  const inputStyle = { width: '100%', background: 'var(--bg3)', border: '1px solid var(--border2)', borderRadius: 10, padding: '11px 14px', color: 'var(--t1)', fontFamily: 'DM Sans, sans-serif', fontSize: 14, outline: 'none' };
  const selectStyle = { ...inputStyle, cursor: 'pointer' };

  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      <div className="mb-8">
        <h1 className="font-display text-3xl" style={{ color: 'var(--t1)' }}>Upload PDF</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--t3)' }}>
          Add a document to the archive — it will be stored as text and as the original PDF
        </p>
      </div>

      {success && (
        <div className="mb-5 px-4 py-3 rounded-xl text-sm font-sans" style={{ background: 'rgba(16,185,129,.1)', color: 'var(--green)', border: '1px solid var(--green)' }}>
          ✓ Uploaded successfully! Redirecting…
        </div>
      )}

      {error && (
        <div className="mb-5 px-4 py-3 rounded-xl text-sm font-sans" style={{ background: 'var(--error-bg)', color: 'var(--error-text)', border: '1px solid var(--error-border)' }}>
          {error}
        </div>
      )}

      <div className="rounded-2xl border p-6 space-y-5" style={{ background: 'var(--bg2)', borderColor: 'var(--border)' }}>

        {/* Drop zone */}
        <div
          {...getRootProps()}
          className="rounded-xl border-2 border-dashed p-8 text-center cursor-pointer transition-all"
          style={{
            borderColor: isDragActive ? 'var(--accent)' : file ? 'var(--green)' : 'var(--border2)',
            background: isDragActive ? 'rgba(245,158,11,.04)' : file ? 'rgba(16,185,129,.04)' : 'var(--bg3)'
          }}
        >
          <input {...getInputProps()} />
          {file ? (
            <>
              <div className="text-3xl mb-2">📄</div>
              <p className="font-medium text-sm" style={{ color: 'var(--t1)' }}>{file.name}</p>
              <p className="text-xs mt-1" style={{ color: 'var(--green)' }}>
                {(file.size / 1024 / 1024).toFixed(2)} MB · Ready
              </p>
              <button onClick={e => { e.stopPropagation(); setFile(null); }}
                className="text-xs mt-3 px-3 py-1 rounded-lg border transition-colors"
                style={{ borderColor: 'var(--border2)', color: 'var(--t3)' }}>
                Remove
              </button>
            </>
          ) : (
            <>
              <div className="text-3xl mb-2">☁</div>
              <p className="text-sm font-medium" style={{ color: 'var(--t1)' }}>
                {isDragActive ? 'Drop your PDF here' : 'Drag & drop your PDF here'}
              </p>
              <p className="text-xs mt-1" style={{ color: 'var(--t3)' }}>or click to browse · PDF only · max 50MB</p>
            </>
          )}
        </div>

        {/* Title */}
        <div>
          <label style={labelStyle}>Document Title *</label>
          <input style={inputStyle} value={title} onChange={e => setTitle(e.target.value)} placeholder="Enter document title"/>
        </div>

        {/* Date */}
        <div>
          <label style={labelStyle}>Date Created</label>
          <input style={inputStyle} type="date" value={dateCreated} onChange={e => setDate(e.target.value)}/>
        </div>

        {/* Service dropdown */}
        <div>
          <label style={labelStyle}>Service *</label>
          <select style={selectStyle} value={serviceId} onChange={e => setServiceId(e.target.value)}>
            <option value="">— Select a service —</option>
            {services.map(s => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>

        {/* Box dropdown */}
        <div>
          <label style={labelStyle}>Box *</label>
          <select style={selectStyle} value={boxId} onChange={e => setBoxId(e.target.value)} disabled={!serviceId}>
            <option value="">— Select a box —</option>
            {boxes.map(b => (
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
          </select>
          {!serviceId && <p className="text-xs mt-1" style={{ color: 'var(--t3)' }}>Select a service first</p>}
        </div>

        {/* Folder dropdown */}
        <div>
          <label style={labelStyle}>Folder *</label>
          <select style={selectStyle} value={folderId} onChange={e => setFolderId(e.target.value)} disabled={!boxId}>
            <option value="">— Select a folder —</option>
            {folders.map(f => (
              <option key={f.id} value={f.id}>{f.name}</option>
            ))}
          </select>
          {!boxId && <p className="text-xs mt-1" style={{ color: 'var(--t3)' }}>Select a box first</p>}
        </div>

        {/* Progress bar */}
        {uploading && (
          <div>
            <div className="flex justify-between text-xs mb-1.5" style={{ color: 'var(--t3)' }}>
              <span>Uploading & extracting pages…</span>
              <span>{progress}%</span>
            </div>
            <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--bg3)' }}>
              <div className="h-full rounded-full transition-all" style={{ width: `${progress}%`, background: 'var(--accent)' }}/>
            </div>
          </div>
        )}

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={!file || !title || !folderId || uploading}
          className="w-full rounded-xl py-3 text-sm font-bold font-sans transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          style={{ background: 'var(--accent)', color: 'var(--bg)' }}
        >
          {uploading ? `Uploading… ${progress}%` : 'Upload & Extract Pages'}
        </button>
      </div>
    </div>
  );
};

export default UploadPage;
