import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/api';

export const uploadPdfFile   = createAsyncThunk('pdfFiles/upload', async ({ formData, onProgress }, { rejectWithValue }) => {
  try {
    const { data } = await api.post('/files', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: e => onProgress && onProgress(Math.round((e.loaded * 100) / e.total))
    });
    return data;
  } catch (e) { return rejectWithValue(e.response?.data?.message || 'Upload failed'); }
});

export const fetchMyFiles    = createAsyncThunk('pdfFiles/fetchMy', async (params = {}, { rejectWithValue }) => {
  try { const { data } = await api.get('/files/my', { params }); return data; }
  catch (e) { return rejectWithValue(e.response?.data?.message || 'Failed'); }
});

export const fetchRecentFiles = createAsyncThunk('pdfFiles/fetchRecent', async (_, { rejectWithValue }) => {
  try { const { data } = await api.get('/files/recent'); return data; }
  catch (e) { return rejectWithValue(e.response?.data?.message || 'Failed'); }
});

export const fetchPdfFile    = createAsyncThunk('pdfFiles/fetchOne', async (id, { rejectWithValue }) => {
  try { const { data } = await api.get(`/files/${id}`); return data; }
  catch (e) { return rejectWithValue(e.response?.data?.message || 'Failed'); }
});

export const fetchFolderFiles = createAsyncThunk('pdfFiles/fetchByFolder', async (folderId, { rejectWithValue }) => {
  try { const { data } = await api.get('/files', { params: { folderId } }); return data; }
  catch (e) { return rejectWithValue(e.response?.data?.message || 'Failed'); }
});

export const updatePdfFile   = createAsyncThunk('pdfFiles/update', async ({ id, formData }, { rejectWithValue }) => {
  try {
    const { data } = await api.put(`/files/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return data;
  } catch (e) { return rejectWithValue(e.response?.data?.message || 'Update failed'); }
});

export const deletePdfFile   = createAsyncThunk('pdfFiles/delete', async (id, { rejectWithValue }) => {
  try { await api.delete(`/files/${id}`); return id; }
  catch (e) { return rejectWithValue(e.response?.data?.message || 'Failed'); }
});

export const searchFiles     = createAsyncThunk('pdfFiles/search', async (q, { rejectWithValue }) => {
  try { const { data } = await api.get('/files/search', { params: { q } }); return data; }
  catch (e) { return rejectWithValue(e.response?.data?.message || 'Failed'); }
});

const pdfFilesSlice = createSlice({
  name: 'pdfFiles',
  initialState: {
    myFiles: [], myTotal: 0,
    recentFiles: [],
    folderFiles: [], folderTotal: 0,
    currentFile: null,
    searchResults: null,
    uploadProgress: 0,
    loading: false, uploading: false, error: null
  },
  reducers: {
    clearError: s => { s.error = null; },
    clearSearch: s => { s.searchResults = null; },
    setProgress: (s, a) => { s.uploadProgress = a.payload; }
  },
  extraReducers: builder => {
    builder
      .addCase(uploadPdfFile.pending,    s => { s.uploading = true; s.uploadProgress = 0; s.error = null; })
      .addCase(uploadPdfFile.fulfilled,  (s, a) => { s.uploading = false; s.uploadProgress = 100; s.myFiles.unshift(a.payload); s.myTotal += 1; })
      .addCase(uploadPdfFile.rejected,   (s, a) => { s.uploading = false; s.error = a.payload; })
      .addCase(fetchMyFiles.fulfilled,   (s, a) => { s.loading = false; s.myFiles = a.payload.files; s.myTotal = a.payload.total; })
      .addCase(fetchRecentFiles.fulfilled,(s, a) => { s.loading = false; s.recentFiles = a.payload; })
      .addCase(fetchPdfFile.fulfilled,   (s, a) => { s.loading = false; s.currentFile = a.payload; })
      .addCase(fetchFolderFiles.fulfilled,(s, a) => { s.loading = false; s.folderFiles = a.payload.files; s.folderTotal = a.payload.total; })
      .addCase(updatePdfFile.fulfilled,  (s, a) => { s.loading = false; s.currentFile = a.payload; s.myFiles = s.myFiles.map(f => f.id === a.payload.id ? a.payload : f); })
      .addCase(deletePdfFile.fulfilled,  (s, a) => { s.loading = false; s.myFiles = s.myFiles.filter(f => f.id !== a.payload); s.myTotal = Math.max(0, s.myTotal - 1); })
      .addCase(searchFiles.fulfilled,    (s, a) => { s.loading = false; s.searchResults = a.payload; })
      .addMatcher(a => a.type.startsWith('pdfFiles/') && !a.type.includes('upload') && a.type.endsWith('/pending'),  s => { s.loading = true; s.error = null; })
      .addMatcher(a => a.type.startsWith('pdfFiles/') && a.type.endsWith('/rejected'), (s, a) => { s.loading = false; s.uploading = false; s.error = a.payload; });
  }
});

export const { clearError, clearSearch, setProgress } = pdfFilesSlice.actions;
export default pdfFilesSlice.reducer;
