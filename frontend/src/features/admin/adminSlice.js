import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/api';

// ─── Thunks ───────────────────────────────────────────────────────────────────
export const fetchAdminStats   = createAsyncThunk('admin/stats',   async (_, { rejectWithValue }) => {
  try { const { data } = await api.get('/admin/stats'); return data; }
  catch (e) { return rejectWithValue(e.response?.data?.message || 'Failed'); }
});

export const fetchAdminUsers   = createAsyncThunk('admin/users',   async (params = {}, { rejectWithValue }) => {
  try { const { data } = await api.get('/admin/users', { params }); return data; }
  catch (e) { return rejectWithValue(e.response?.data?.message || 'Failed'); }
});

export const fetchAdminFiles   = createAsyncThunk('admin/files',   async (params = {}, { rejectWithValue }) => {
  try { const { data } = await api.get('/admin/files', { params }); return data; }
  catch (e) { return rejectWithValue(e.response?.data?.message || 'Failed'); }
});

export const fetchAuditLog     = createAsyncThunk('admin/audit',   async (params = {}, { rejectWithValue }) => {
  try { const { data } = await api.get('/admin/audit', { params }); return data; }
  catch (e) { return rejectWithValue(e.response?.data?.message || 'Failed'); }
});

export const suspendUser       = createAsyncThunk('admin/suspend', async (userId, { rejectWithValue }) => {
  try { const { data } = await api.patch(`/admin/users/${userId}/suspend`); return data; }
  catch (e) { return rejectWithValue(e.response?.data?.message || 'Failed'); }
});

export const unsuspendUser     = createAsyncThunk('admin/unsuspend', async (userId, { rejectWithValue }) => {
  try { const { data } = await api.patch(`/admin/users/${userId}/unsuspend`); return data; }
  catch (e) { return rejectWithValue(e.response?.data?.message || 'Failed'); }
});

export const deleteAdminUser   = createAsyncThunk('admin/deleteUser', async (userId, { rejectWithValue }) => {
  try { await api.delete(`/admin/users/${userId}`); return userId; }
  catch (e) { return rejectWithValue(e.response?.data?.message || 'Failed'); }
});

export const deleteAdminFile   = createAsyncThunk('admin/deleteFile', async (fileId, { rejectWithValue }) => {
  try { await api.delete(`/admin/files/${fileId}`); return fileId; }
  catch (e) { return rejectWithValue(e.response?.data?.message || 'Failed'); }
});

export const impersonateUser   = createAsyncThunk('admin/impersonate', async (userId, { rejectWithValue }) => {
  try { const { data } = await api.post(`/admin/users/${userId}/impersonate`); return data; }
  catch (e) { return rejectWithValue(e.response?.data?.message || 'Failed'); }
});

// ─── Slice ────────────────────────────────────────────────────────────────────
const adminSlice = createSlice({
  name: 'admin',
  initialState: {
    stats: null,
    users: [], totalUsers: 0,
    files: [], totalFiles: 0,
    auditLogs: [], totalLogs: 0,
    notifications: [],   // real-time socket events
    loading: false,
    error: null,
  },
  reducers: {
    clearError: (state) => { state.error = null; },
    addNotification: (state, action) => {
      state.notifications.unshift({ ...action.payload, id: Date.now(), read: false });
      // Keep max 50 notifications
      if (state.notifications.length > 50) state.notifications.pop();
    },
    markAllRead: (state) => {
      state.notifications = state.notifications.map(n => ({ ...n, read: true }));
    },
    // Realtime: prepend new file to admin file list
    prependFile: (state, action) => {
      state.files.unshift(action.payload);
      state.totalFiles += 1;
    },
  },
  extraReducers: (builder) => {
    const loading = (state) => { state.loading = true; state.error = null; };
    const failed  = (state, a) => { state.loading = false; state.error = a.payload; };

    builder
      .addCase(fetchAdminStats.fulfilled,   (s, a) => { s.loading = false; s.stats = a.payload; })
      .addCase(fetchAdminUsers.fulfilled,   (s, a) => { s.loading = false; s.users = a.payload.users; s.totalUsers = a.payload.total; })
      .addCase(fetchAdminFiles.fulfilled,   (s, a) => { s.loading = false; s.files = a.payload.files; s.totalFiles = a.payload.total; })
      .addCase(fetchAuditLog.fulfilled,     (s, a) => { s.loading = false; s.auditLogs = a.payload.logs; s.totalLogs = a.payload.total; })

      .addCase(suspendUser.fulfilled,       (s, a) => { s.users = s.users.map(u => u.id === a.payload.id ? { ...u, suspended: true } : u); })
      .addCase(unsuspendUser.fulfilled,     (s, a) => { s.users = s.users.map(u => u.id === a.payload.id ? { ...u, suspended: false } : u); })
      .addCase(deleteAdminUser.fulfilled,   (s, a) => { s.users = s.users.filter(u => u.id !== a.payload); s.totalUsers -= 1; })
      .addCase(deleteAdminFile.fulfilled,   (s, a) => { s.files = s.files.filter(f => f.id !== a.payload); s.totalFiles -= 1; })

      .addMatcher(a => a.type.startsWith('admin/') && a.type.endsWith('/pending'),   loading)
      .addMatcher(a => a.type.startsWith('admin/') && a.type.endsWith('/rejected'),  failed);
  },
});

export const { clearError, addNotification, markAllRead, prependFile } = adminSlice.actions;
export default adminSlice.reducer;
