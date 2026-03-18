import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchServices } from '../services/servicesSlice';
import { fetchBoxes, fetchFolders, createFolder } from './browseSlice';

const BrowsePage = () => {
  const dispatch  = useDispatch();
  const navigate  = useNavigate();
  const { user }  = useSelector(s => s.auth);
  const { items: services } = useSelector(s => s.services);
  const { boxes, folders, loading } = useSelector(s => s.browse);

  const [selectedService, setService] = useState(null);
  const [selectedBox, setBox]         = useState(null);
  const [showNewFolder, setNewFolder] = useState(false);
  const [newFolderName, setFolderName]= useState('');
  const [newFolderDesc, setFolderDesc]= useState('');
  const [creating, setCreating]       = useState(false);
  const [createError, setCreateError] = useState('');

  useEffect(() => { dispatch(fetchServices()); }, [dispatch]);

  const handleSelectService = (svc) => {
    setService(svc);
    setBox(null);
    dispatch(fetchBoxes({ serviceId: svc.id }));
  };

  const handleSelectBox = (box) => {
    setBox(box);
    dispatch(fetchFolders({ boxId: box.id }));
  };

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) return;
    setCreating(true);
    setCreateError('');
    const result = await dispatch(createFolder({
      name: newFolderName.trim(),
      description: newFolderDesc.trim(),
      boxId: selectedBox.id
    }));
    setCreating(false);
    if (!result.error) {
      setFolderName('');
      setFolderDesc('');
      setNewFolder(false);
    } else {
      setCreateError(result.payload);
    }
  };

  const inputStyle = {
    width: '100%', background: 'var(--bg3)', border: '1px solid var(--border2)',
    borderRadius: 10, padding: '10px 14px', color: 'var(--t1)',
    fontFamily: 'DM Sans, sans-serif', fontSize: 14, outline: 'none'
  };

  return (
    <div className="px-8 py-8">
      <div className="mb-7">
        <h1 className="font-display text-3xl" style={{ color: 'var(--t1)' }}>Browse Archive</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--t3)' }}>
          Navigate through services, boxes and folders
        </p>
      </div>

      <div className="grid grid-cols-3 gap-5">

        {/* Column 1 — Services */}
        <div className="rounded-2xl border overflow-hidden" style={{ background: 'var(--bg2)', borderColor: 'var(--border)' }}>
          <div className="px-4 py-3 border-b" style={{ borderColor: 'var(--border)', background: 'var(--bg3)' }}>
            <h3 className="font-display text-base" style={{ color: 'var(--t1)' }}>Services</h3>
            <p className="text-xs mt-0.5" style={{ color: 'var(--t3)' }}>{services.length} total</p>
          </div>
          <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
            {services.length === 0 && (
              <p className="text-center py-10 text-sm" style={{ color: 'var(--t3)' }}>No services yet</p>
            )}
            {services.map(svc => (
              <button
                key={svc.id}
                onClick={() => handleSelectService(svc)}
                className="w-full flex items-center gap-3 px-4 py-3.5 text-left transition-colors"
                style={{
                  background: selectedService?.id === svc.id ? 'rgba(245,158,11,.08)' : 'transparent',
                  borderLeft: selectedService?.id === svc.id ? `3px solid ${svc.color || 'var(--accent)'}` : '3px solid transparent'
                }}
              >
                <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: `${svc.color || '#f59e0b'}20` }}>
                  <span className="text-lg">{svc.name[0]}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate" style={{ color: 'var(--t1)' }}>{svc.name}</p>
                  <p className="text-xs" style={{ color: 'var(--t3)' }}>{svc._count?.boxes || 0} boxes</p>
                </div>
                <svg viewBox="0 0 24 24" className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: 'var(--t3)' }}>
                  <path d="M9 18l6-6-6-6" strokeLinecap="round"/>
                </svg>
              </button>
            ))}
          </div>
        </div>

        {/* Column 2 — Boxes */}
        <div className="rounded-2xl border overflow-hidden" style={{ background: 'var(--bg2)', borderColor: 'var(--border)' }}>
          <div className="px-4 py-3 border-b" style={{ borderColor: 'var(--border)', background: 'var(--bg3)' }}>
            <h3 className="font-display text-base" style={{ color: 'var(--t1)' }}>
              {selectedService ? `${selectedService.name} — Boxes` : 'Boxes'}
            </h3>
            <p className="text-xs mt-0.5" style={{ color: 'var(--t3)' }}>
              {selectedService ? `${boxes.length} boxes` : 'Select a service'}
            </p>
          </div>
          <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
            {!selectedService && (
              <p className="text-center py-10 text-sm" style={{ color: 'var(--t3)' }}>← Select a service</p>
            )}
            {selectedService && boxes.length === 0 && (
              <p className="text-center py-10 text-sm" style={{ color: 'var(--t3)' }}>No boxes in this service</p>
            )}
            {boxes.map(box => (
              <button
                key={box.id}
                onClick={() => handleSelectBox(box)}
                className="w-full flex items-center gap-3 px-4 py-3.5 text-left transition-colors"
                style={{
                  background: selectedBox?.id === box.id ? 'rgba(245,158,11,.08)' : 'transparent',
                  borderLeft: selectedBox?.id === box.id ? '3px solid var(--accent)' : '3px solid transparent'
                }}
              >
                <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: 'var(--bg3)' }}>
                  <span className="text-base">📦</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate" style={{ color: 'var(--t1)' }}>{box.name}</p>
                  <p className="text-xs" style={{ color: 'var(--t3)' }}>{box._count?.folders || 0} folders</p>
                </div>
                <svg viewBox="0 0 24 24" className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: 'var(--t3)' }}>
                  <path d="M9 18l6-6-6-6" strokeLinecap="round"/>
                </svg>
              </button>
            ))}
          </div>
        </div>

        {/* Column 3 — Folders */}
        <div className="rounded-2xl border overflow-hidden" style={{ background: 'var(--bg2)', borderColor: 'var(--border)' }}>
          <div className="px-4 py-3 border-b flex items-center justify-between" style={{ borderColor: 'var(--border)', background: 'var(--bg3)' }}>
            <div>
              <h3 className="font-display text-base" style={{ color: 'var(--t1)' }}>
                {selectedBox ? `${selectedBox.name} — Folders` : 'Folders'}
              </h3>
              <p className="text-xs mt-0.5" style={{ color: 'var(--t3)' }}>
                {selectedBox ? `${folders.length} folders` : 'Select a box'}
              </p>
            </div>
            {selectedBox && (
              <button
                onClick={() => setNewFolder(!showNewFolder)}
                className="text-xs px-3 py-1.5 rounded-lg font-sans font-semibold transition-colors"
                style={{ background: 'var(--accent)', color: 'var(--bg)' }}>
                + New Folder
              </button>
            )}
          </div>

          {/* New folder form */}
          {showNewFolder && (
            <div className="px-4 py-4 border-b space-y-3" style={{ borderColor: 'var(--border)', background: 'rgba(245,158,11,.04)' }}>
              {createError && (
                <p className="text-xs" style={{ color: '#ef4444' }}>{createError}</p>
              )}
              <input style={inputStyle} placeholder="Folder name *" value={newFolderName} onChange={e => setFolderName(e.target.value)}/>
              <input style={inputStyle} placeholder="Description (optional)" value={newFolderDesc} onChange={e => setFolderDesc(e.target.value)}/>
              <div className="flex gap-2">
                <button onClick={handleCreateFolder} disabled={!newFolderName.trim() || creating}
                  className="flex-1 py-2 rounded-lg text-xs font-sans font-semibold disabled:opacity-40"
                  style={{ background: 'var(--accent)', color: 'var(--bg)' }}>
                  {creating ? 'Creating…' : 'Create'}
                </button>
                <button onClick={() => { setNewFolder(false); setFolderName(''); setCreateError(''); }}
                  className="px-4 py-2 rounded-lg text-xs font-sans border"
                  style={{ borderColor: 'var(--border)', color: 'var(--t2)' }}>
                  Cancel
                </button>
              </div>
            </div>
          )}

          <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
            {!selectedBox && (
              <p className="text-center py-10 text-sm" style={{ color: 'var(--t3)' }}>← Select a box</p>
            )}
            {selectedBox && folders.length === 0 && !showNewFolder && (
              <p className="text-center py-10 text-sm" style={{ color: 'var(--t3)' }}>No folders yet</p>
            )}
            {folders.map(folder => (
              <button
                key={folder.id}
                onClick={() => navigate(`/folders/${folder.id}`)}
                className="w-full flex items-center gap-3 px-4 py-3.5 text-left transition-colors group"
                style={{ background: 'transparent' }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--bg3)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: 'var(--bg3)' }}>
                  <span className="text-base">📁</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate" style={{ color: 'var(--t1)' }}>{folder.name}</p>
                  <p className="text-xs" style={{ color: 'var(--t3)' }}>
                    {folder._count?.pdfFiles || 0} files · {folder.createdBy?.email}
                  </p>
                </div>
                <svg viewBox="0 0 24 24" className="w-4 h-4 flex-shrink-0 opacity-0 group-hover:opacity-100" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: 'var(--t3)' }}>
                  <path d="M9 18l6-6-6-6" strokeLinecap="round"/>
                </svg>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BrowsePage;
