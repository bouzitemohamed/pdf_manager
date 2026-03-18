import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/api';

// ── Boxes ─────────────────────────────────────────────────────────────────────
export const fetchBoxes  = createAsyncThunk('boxes/fetch',  async (params = {}, { rejectWithValue }) => {
  try { const { data } = await api.get('/boxes', { params }); return data; }
  catch (e) { return rejectWithValue(e.response?.data?.message || 'Failed'); }
});
export const fetchBox    = createAsyncThunk('boxes/fetchOne', async (id, { rejectWithValue }) => {
  try { const { data } = await api.get(`/boxes/${id}`); return data; }
  catch (e) { return rejectWithValue(e.response?.data?.message || 'Failed'); }
});
export const createBox   = createAsyncThunk('boxes/create', async (payload, { rejectWithValue }) => {
  try { const { data } = await api.post('/boxes', payload); return data; }
  catch (e) { return rejectWithValue(e.response?.data?.message || 'Failed'); }
});
export const deleteBox   = createAsyncThunk('boxes/delete', async (id, { rejectWithValue }) => {
  try { await api.delete(`/boxes/${id}`); return id; }
  catch (e) { return rejectWithValue(e.response?.data?.message || 'Failed'); }
});

// ── Folders ───────────────────────────────────────────────────────────────────
export const fetchFolders  = createAsyncThunk('folders/fetch',  async (params = {}, { rejectWithValue }) => {
  try { const { data } = await api.get('/folders', { params }); return data; }
  catch (e) { return rejectWithValue(e.response?.data?.message || 'Failed'); }
});
export const fetchFolder   = createAsyncThunk('folders/fetchOne', async (id, { rejectWithValue }) => {
  try { const { data } = await api.get(`/folders/${id}`); return data; }
  catch (e) { return rejectWithValue(e.response?.data?.message || 'Failed'); }
});
export const createFolder  = createAsyncThunk('folders/create', async (payload, { rejectWithValue }) => {
  try { const { data } = await api.post('/folders', payload); return data; }
  catch (e) { return rejectWithValue(e.response?.data?.message || 'Failed'); }
});
export const deleteFolder  = createAsyncThunk('folders/delete', async (id, { rejectWithValue }) => {
  try { await api.delete(`/folders/${id}`); return id; }
  catch (e) { return rejectWithValue(e.response?.data?.message || 'Failed'); }
});

const browseSlice = createSlice({
  name: 'browse',
  initialState: {
    boxes: [], currentBox: null,
    folders: [], currentFolder: null,
    loading: false, error: null
  },
  reducers: { clearError: s => { s.error = null; } },
  extraReducers: builder => {
    builder
      .addCase(fetchBoxes.fulfilled,   (s, a) => { s.loading = false; s.boxes = a.payload; })
      .addCase(fetchBox.fulfilled,     (s, a) => { s.loading = false; s.currentBox = a.payload; })
      .addCase(createBox.fulfilled,    (s, a) => { s.loading = false; s.boxes.push(a.payload); })
      .addCase(deleteBox.fulfilled,    (s, a) => { s.loading = false; s.boxes = s.boxes.filter(b => b.id !== a.payload); })
      .addCase(fetchFolders.fulfilled, (s, a) => { s.loading = false; s.folders = a.payload; })
      .addCase(fetchFolder.fulfilled,  (s, a) => { s.loading = false; s.currentFolder = a.payload; })
      .addCase(createFolder.fulfilled, (s, a) => { s.loading = false; s.folders.push(a.payload); })
      .addCase(deleteFolder.fulfilled, (s, a) => { s.loading = false; s.folders = s.folders.filter(f => f.id !== a.payload); })
      .addMatcher(a => ['boxes/', 'folders/'].some(p => a.type.startsWith(p)) && a.type.endsWith('/pending'),  s => { s.loading = true; s.error = null; })
      .addMatcher(a => ['boxes/', 'folders/'].some(p => a.type.startsWith(p)) && a.type.endsWith('/rejected'), (s, a) => { s.loading = false; s.error = a.payload; });
  }
});

export const { clearError: clearBrowseError } = browseSlice.actions;
export default browseSlice.reducer;
