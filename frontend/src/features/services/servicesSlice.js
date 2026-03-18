import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/api';

export const fetchServices  = createAsyncThunk('services/fetch',  async (_, { rejectWithValue }) => {
  try { const { data } = await api.get('/services'); return data; }
  catch (e) { return rejectWithValue(e.response?.data?.message || 'Failed'); }
});

export const fetchService   = createAsyncThunk('services/fetchOne', async (id, { rejectWithValue }) => {
  try { const { data } = await api.get(`/services/${id}`); return data; }
  catch (e) { return rejectWithValue(e.response?.data?.message || 'Failed'); }
});

export const createService  = createAsyncThunk('services/create', async (payload, { rejectWithValue }) => {
  try { const { data } = await api.post('/services', payload); return data; }
  catch (e) { return rejectWithValue(e.response?.data?.message || 'Failed'); }
});

export const updateService  = createAsyncThunk('services/update', async ({ id, ...payload }, { rejectWithValue }) => {
  try { const { data } = await api.put(`/services/${id}`, payload); return data; }
  catch (e) { return rejectWithValue(e.response?.data?.message || 'Failed'); }
});

export const deleteService  = createAsyncThunk('services/delete', async (id, { rejectWithValue }) => {
  try { await api.delete(`/services/${id}`); return id; }
  catch (e) { return rejectWithValue(e.response?.data?.message || 'Failed'); }
});

const servicesSlice = createSlice({
  name: 'services',
  initialState: { items: [], current: null, loading: false, error: null },
  reducers: { clearError: s => { s.error = null; } },
  extraReducers: builder => {
    builder
      .addCase(fetchServices.fulfilled,  (s, a) => { s.loading = false; s.items = a.payload; })
      .addCase(fetchService.fulfilled,   (s, a) => { s.loading = false; s.current = a.payload; })
      .addCase(createService.fulfilled,  (s, a) => { s.loading = false; s.items.push(a.payload); })
      .addCase(updateService.fulfilled,  (s, a) => { s.loading = false; s.items = s.items.map(i => i.id === a.payload.id ? a.payload : i); })
      .addCase(deleteService.fulfilled,  (s, a) => { s.loading = false; s.items = s.items.filter(i => i.id !== a.payload); })
      .addMatcher(a => a.type.startsWith('services/') && a.type.endsWith('/pending'),  s => { s.loading = true; s.error = null; })
      .addMatcher(a => a.type.startsWith('services/') && a.type.endsWith('/rejected'), (s, a) => { s.loading = false; s.error = a.payload; });
  }
});

export const { clearError } = servicesSlice.actions;
export default servicesSlice.reducer;
