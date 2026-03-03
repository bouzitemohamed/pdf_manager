import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/api';

// ─── Thunks ───────────────────────────────────────────────────────────────────
export const fetchFiles = createAsyncThunk('files/fetchAll', async (params = {}, { rejectWithValue }) => {
  try {
    const { data } = await api.get('/files', { params });
    return data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch files');
  }
});

export const uploadFile = createAsyncThunk('files/upload', async ({ formData, onProgress }, { rejectWithValue }) => {
  try {
    const { data } = await api.post('/files', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (e) => {
        const pct = Math.round((e.loaded * 100) / e.total);
        onProgress?.(pct);
      },
    });
    return data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Upload failed');
  }
});

export const deleteFile = createAsyncThunk('files/delete', async (fileId, { rejectWithValue }) => {
  try {
    await api.delete(`/files/${fileId}`);
    return fileId;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Delete failed');
  }
});

export const fetchFileDetail = createAsyncThunk('files/fetchOne', async (fileId, { rejectWithValue }) => {
  try {
    const { data } = await api.get(`/files/${fileId}`);
    return data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch file');
  }
});

// ─── Slice ────────────────────────────────────────────────────────────────────
const filesSlice = createSlice({
  name: 'files',
  initialState: {
    items: [],
    total: 0,
    selectedFile: null,
    loading: false,
    uploading: false,
    uploadProgress: 0,
    error: null,
    searchQuery: '',
  },
  reducers: {
    setSearchQuery: (state, action) => { state.searchQuery = action.payload; },
    clearError: (state) => { state.error = null; },
    setUploadProgress: (state, action) => { state.uploadProgress = action.payload; },
    clearSelectedFile: (state) => { state.selectedFile = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchFiles.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchFiles.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.files;
        state.total = action.payload.total;
      })
      .addCase(fetchFiles.rejected, (state, action) => { state.loading = false; state.error = action.payload; })

      .addCase(uploadFile.pending, (state) => { state.uploading = true; state.uploadProgress = 0; state.error = null; })
      .addCase(uploadFile.fulfilled, (state, action) => {
        state.uploading = false;
        state.uploadProgress = 100;
        state.items.unshift(action.payload);
        state.total += 1;
      })
      .addCase(uploadFile.rejected, (state, action) => { state.uploading = false; state.error = action.payload; })

      .addCase(deleteFile.fulfilled, (state, action) => {
        state.items = state.items.filter((f) => f.id !== action.payload);
        state.total -= 1;
      })

      .addCase(fetchFileDetail.pending, (state) => { state.loading = true; })
      .addCase(fetchFileDetail.fulfilled, (state, action) => { state.loading = false; state.selectedFile = action.payload; })
      .addCase(fetchFileDetail.rejected, (state, action) => { state.loading = false; state.error = action.payload; });
  },
});

export const { setSearchQuery, clearError, setUploadProgress, clearSelectedFile } = filesSlice.actions;
export default filesSlice.reducer;
