import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchServices, createService, deleteService } from '../services/servicesSlice';
import { fetchBoxes, createBox, deleteBox } from '../browse/browseSlice';

const COLORS = ['#f59e0b','#10b981','#3b82f6','#8b5cf6','#ef4444','#ec4899','#06b6d4','#84cc16'];

const AdminServicesPage = () => {
  const dispatch = useDispatch();
  const { items: services, loading } = useSelector(s => s.services);
  const { boxes } = useSelector(s => s.browse);

  const [selectedService, setSelected] = useState(null);
  const [showSvcForm, setSvcForm]       = useState(false);
  const [showBoxForm, setBoxForm]       = useState(false);

  // Service form
  const [svcName, setSvcName]   = useState('');
  const [svcDesc, setSvcDesc]   = useState('');
  const [svcColor, setSvcColor] = useState(COLORS[0]);
  const [svcError, setSvcError] = useState('');
  const [svcSaving, setSvcSave] = useState(false);

  // Box form
  const [boxName, setBoxName]   = useState('');
  const [boxDesc, setBoxDesc]   = useState('');
  const [boxError, setBoxError] = useState('');
  const [boxSaving, setBoxSave] = useState(false);

  useEffect(() => { dispatch(fetchServices()); }, [dispatch]);

  const handleSelectService = (svc) => {
    setSelected(svc);
    dispatch(fetchBoxes({ serviceId: svc.id }));
  };

  const handleCreateService = async () => {
    if (!svcName.trim()) return;
    setSvcSave(true); setSvcError('');
    const result = await dispatch(createService({ name: svcName.trim(), description: svcDesc.trim(), color: svcColor }));
    setSvcSave(false);
    if (!result.error) { setSvcName(''); setSvcDesc(''); setSvcForm(false); }
    else setSvcError(result.payload);
  };

  const handleDeleteService = async (id, name) => {
    if (!window.confirm(`Delete service "${name}" and ALL its boxes/folders/files?`)) return;
    await dispatch(deleteService(id));
    if (selectedService?.id === id) setSelected(null);
  };

  const handleCreateBox = async () => {
    if (!boxName.trim() || !selectedService) return;
    setBoxSave(true); setBoxError('');
    const result = await dispatch(createBox({ name: boxName.trim(), description: boxDesc.trim(), serviceId: selectedService.id }));
    setBoxSave(false);
    if (!result.error) { setBoxName(''); setBoxDesc(''); setBoxForm(false); }
    else setBoxError(result.payload);
  };

  const handleDeleteBox = async (id, name) => {
    if (!window.confirm(`Delete box "${name}" and all its folders/files?`)) return;
    dispatch(deleteBox(id));
  };

  const inputStyle = { width: '100%', background: 'var(--bg3)', border: '1px solid var(--border2)', borderRadius: 10, padding: '10px 14px', color: 'var(--t1)', fontFamily: 'DM Sans, sans-serif', fontSize: 14, outline: 'none' };

  return (
    <div className="px-6 py-6">
      <div className="mb-6">
        <h2 className="font-display text-2xl" style={{ color: 'var(--t1)' }}>Services & Boxes</h2>
        <p className="text-sm mt-1" style={{ color: 'var(--t3)' }}>Create and manage services and their boxes</p>
      </div>

      <div className="grid grid-cols-2 gap-5">

        {/* Services panel */}
        <div className="rounded-2xl border overflow-hidden" style={{ background: 'var(--bg2)', borderColor: 'var(--border)' }}>
          <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: 'var(--border)', background: 'var(--bg3)' }}>
            <div>
              <h3 className="font-display text-lg" style={{ color: 'var(--t1)' }}>Services</h3>
              <p className="text-xs" style={{ color: 'var(--t3)' }}>{services.length} total</p>
            </div>
            <button onClick={() => setSvcForm(!showSvcForm)}
              className="px-3 py-1.5 rounded-lg text-xs font-sans font-semibold"
              style={{ background: 'var(--accent)', color: 'var(--bg)' }}>
              + New Service
            </button>
          </div>

          {/* Create service form */}
          {showSvcForm && (
            <div className="px-5 py-4 border-b space-y-3" style={{ borderColor: 'var(--border)', background: 'rgba(245,158,11,.04)' }}>
              {svcError && <p className="text-xs" style={{ color: '#ef4444' }}>{svcError}</p>}
              <input style={inputStyle} placeholder="Service name *" value={svcName} onChange={e => setSvcName(e.target.value)}/>
              <input style={inputStyle} placeholder="Description (optional)" value={svcDesc} onChange={e => setSvcDesc(e.target.value)}/>
              <div>
                <p className="text-xs mb-2" style={{ color: 'var(--t3)' }}>Color</p>
                <div className="flex gap-2 flex-wrap">
                  {COLORS.map(c => (
                    <button key={c} onClick={() => setSvcColor(c)}
                      className="w-7 h-7 rounded-full transition-transform"
                      style={{ background: c, transform: svcColor === c ? 'scale(1.3)' : 'scale(1)', outline: svcColor === c ? `2px solid ${c}` : 'none', outlineOffset: 2 }}/>
                  ))}
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={handleCreateService} disabled={!svcName.trim() || svcSaving}
                  className="flex-1 py-2 rounded-lg text-xs font-sans font-semibold disabled:opacity-40"
                  style={{ background: 'var(--accent)', color: 'var(--bg)' }}>
                  {svcSaving ? 'Creating…' : 'Create Service'}
                </button>
                <button onClick={() => { setSvcForm(false); setSvcName(''); setSvcError(''); }}
                  className="px-4 py-2 rounded-lg text-xs font-sans border"
                  style={{ borderColor: 'var(--border)', color: 'var(--t2)' }}>
                  Cancel
                </button>
              </div>
            </div>
          )}

          <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
            {services.length === 0 && (
              <p className="text-center py-12 text-sm" style={{ color: 'var(--t3)' }}>No services yet</p>
            )}
            {services.map(svc => (
              <div key={svc.id}
                onClick={() => handleSelectService(svc)}
                className="flex items-center gap-3 px-5 py-3.5 cursor-pointer transition-colors group"
                style={{
                  background: selectedService?.id === svc.id ? 'rgba(245,158,11,.06)' : 'transparent',
                  borderLeft: `3px solid ${selectedService?.id === svc.id ? svc.color : 'transparent'}`
                }}
                onMouseEnter={e => { if (selectedService?.id !== svc.id) e.currentTarget.style.background = 'var(--bg3)'; }}
                onMouseLeave={e => { if (selectedService?.id !== svc.id) e.currentTarget.style.background = 'transparent'; }}
              >
                <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
                  style={{ background: `${svc.color}20` }}>
                  {svc.name[0].toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate" style={{ color: 'var(--t1)' }}>{svc.name}</p>
                  <p className="text-xs" style={{ color: 'var(--t3)' }}>
                    {svc._count?.boxes || 0} boxes
                    {svc.description && ` · ${svc.description}`}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ background: svc.color }}/>
                  <button onClick={e => { e.stopPropagation(); handleDeleteService(svc.id, svc.name); }}
                    className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{ background: 'rgba(239,68,68,.1)', color: '#ef4444' }}>
                    🗑
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Boxes panel */}
        <div className="rounded-2xl border overflow-hidden" style={{ background: 'var(--bg2)', borderColor: 'var(--border)' }}>
          <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: 'var(--border)', background: 'var(--bg3)' }}>
            <div>
              <h3 className="font-display text-lg" style={{ color: 'var(--t1)' }}>
                {selectedService ? `${selectedService.name} — Boxes` : 'Boxes'}
              </h3>
              <p className="text-xs" style={{ color: 'var(--t3)' }}>
                {selectedService ? `${boxes.length} boxes` : 'Select a service first'}
              </p>
            </div>
            {selectedService && (
              <button onClick={() => setBoxForm(!showBoxForm)}
                className="px-3 py-1.5 rounded-lg text-xs font-sans font-semibold"
                style={{ background: 'var(--accent)', color: 'var(--bg)' }}>
                + New Box
              </button>
            )}
          </div>

          {/* Create box form */}
          {showBoxForm && selectedService && (
            <div className="px-5 py-4 border-b space-y-3" style={{ borderColor: 'var(--border)', background: 'rgba(245,158,11,.04)' }}>
              {boxError && <p className="text-xs" style={{ color: '#ef4444' }}>{boxError}</p>}
              <input style={inputStyle} placeholder="Box name *" value={boxName} onChange={e => setBoxName(e.target.value)}/>
              <input style={inputStyle} placeholder="Description (optional)" value={boxDesc} onChange={e => setBoxDesc(e.target.value)}/>
              <div className="flex gap-2">
                <button onClick={handleCreateBox} disabled={!boxName.trim() || boxSaving}
                  className="flex-1 py-2 rounded-lg text-xs font-sans font-semibold disabled:opacity-40"
                  style={{ background: 'var(--accent)', color: 'var(--bg)' }}>
                  {boxSaving ? 'Creating…' : 'Create Box'}
                </button>
                <button onClick={() => { setBoxForm(false); setBoxName(''); setBoxError(''); }}
                  className="px-4 py-2 rounded-lg text-xs font-sans border"
                  style={{ borderColor: 'var(--border)', color: 'var(--t2)' }}>
                  Cancel
                </button>
              </div>
            </div>
          )}

          <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
            {!selectedService && (
              <p className="text-center py-12 text-sm" style={{ color: 'var(--t3)' }}>← Select a service</p>
            )}
            {selectedService && boxes.length === 0 && !showBoxForm && (
              <p className="text-center py-12 text-sm" style={{ color: 'var(--t3)' }}>No boxes yet</p>
            )}
            {boxes.map(box => (
              <div key={box.id} className="flex items-center gap-3 px-5 py-3.5 group transition-colors"
                onMouseEnter={e => e.currentTarget.style.background = 'var(--bg3)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
                  style={{ background: 'var(--bg3)' }}>
                  📦
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate" style={{ color: 'var(--t1)' }}>{box.name}</p>
                  <p className="text-xs" style={{ color: 'var(--t3)' }}>
                    {box._count?.folders || 0} folders
                    {box.description && ` · ${box.description}`}
                  </p>
                </div>
                <button onClick={() => handleDeleteBox(box.id, box.name)}
                  className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ background: 'rgba(239,68,68,.1)', color: '#ef4444' }}>
                  🗑
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminServicesPage;
