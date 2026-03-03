import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { useDispatch, useSelector } from 'react-redux';
import { uploadFile, setUploadProgress } from './filesSlice';

const UploadZone = ({ onSuccess }) => {
  const dispatch = useDispatch();
  const { uploading, uploadProgress } = useSelector((s) => s.files);
  const [numBox, setNumBox] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [localFile, setLocalFile] = useState(null);

  const onDrop = useCallback((accepted) => {
    if (accepted.length > 0) setLocalFile(accepted[0]);
  }, []);

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    multiple: false,
    onDragEnter: () => setDragActive(true),
    onDragLeave: () => setDragActive(false),
  });

  const handleUpload = () => {
    if (!localFile) return;
    const formData = new FormData();
    formData.append('pdf', localFile);
    if (numBox) formData.append('num_box', numBox);

    dispatch(
      uploadFile({
        formData,
        onProgress: (pct) => dispatch(setUploadProgress(pct)),
      })
    ).then((action) => {
      if (!action.error) {
        setLocalFile(null);
        setNumBox('');
        onSuccess?.();
      }
    });
  };

  return (
    <div className="bg-ink-800 border border-ink-600 rounded-2xl p-6">
      <h2 className="font-display text-xl text-white mb-5">Upload Document</h2>

      {/* Dropzone */}
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all ${
          dragActive
            ? 'border-amber-500 bg-amber-500/10'
            : localFile
            ? 'border-green-500 bg-green-500/10'
            : 'border-ink-500 hover:border-ink-400 hover:bg-ink-700/50'
        }`}
      >
        <input {...getInputProps()} />

        {localFile ? (
          <div className="flex flex-col items-center gap-3">
            <div className="w-14 h-14 bg-green-500/20 rounded-full flex items-center justify-center">
              <svg viewBox="0 0 24 24" className="w-7 h-7 fill-green-400">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zm-1 1.5L18.5 9H13V3.5z"/>
              </svg>
            </div>
            <div>
              <p className="text-white font-sans font-medium text-sm">{localFile.name}</p>
              <p className="text-ink-400 font-sans text-xs mt-1">{(localFile.size / 1024 / 1024).toFixed(2)} MB</p>
            </div>
            <button
              onClick={(e) => { e.stopPropagation(); setLocalFile(null); }}
              className="text-ink-400 hover:text-red-400 text-xs font-sans transition-colors"
            >
              Remove
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3">
            <div className="w-14 h-14 bg-ink-700 rounded-full flex items-center justify-center">
              <svg viewBox="0 0 24 24" className="w-7 h-7 fill-ink-300">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zM13 3.5L18.5 9H13V3.5zM12 17l-4-4h2.5v-4h3v4H16l-4 4z"/>
              </svg>
            </div>
            <div>
              <p className="text-white font-sans font-medium text-sm">Drop your PDF here</p>
              <p className="text-ink-400 font-sans text-xs mt-1">or click to browse · Max 50MB</p>
            </div>
          </div>
        )}
      </div>

      {/* Metadata */}
      {localFile && (
        <div className="mt-4">
          <label className="block text-ink-300 text-xs font-sans font-medium uppercase tracking-widest mb-2">
            Box Number (optional)
          </label>
          <input
            type="text"
            value={numBox}
            onChange={(e) => setNumBox(e.target.value)}
            placeholder="e.g. BOX-2024-001"
            className="w-full bg-ink-700 border border-ink-500 rounded-lg px-4 py-2.5 text-white font-sans text-sm placeholder-ink-400 focus:outline-none focus:border-amber-500 transition-colors"
          />
        </div>
      )}

      {/* Progress Bar */}
      {uploading && (
        <div className="mt-4">
          <div className="flex justify-between text-xs font-sans text-ink-400 mb-2">
            <span>Uploading & processing…</span>
            <span>{uploadProgress}%</span>
          </div>
          <div className="h-1.5 bg-ink-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-amber-500 transition-all duration-300 rounded-full"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* Upload Button */}
      <button
        onClick={handleUpload}
        disabled={!localFile || uploading}
        className="mt-5 w-full bg-amber-500 hover:bg-amber-400 text-ink-900 font-sans font-semibold rounded-lg py-3 text-sm transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {uploading ? `Processing… ${uploadProgress}%` : 'Upload & Extract Pages'}
      </button>
    </div>
  );
};

export default UploadZone;
