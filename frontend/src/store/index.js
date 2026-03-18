import { configureStore } from '@reduxjs/toolkit';
import authReducer     from '../features/auth/authSlice';
import themeReducer    from '../features/theme/themeSlice';
import adminReducer    from '../features/admin/adminSlice';
import servicesReducer from '../features/services/servicesSlice';
import browseReducer   from '../features/browse/browseSlice';
import pdfFilesReducer from '../features/files/pdfFilesSlice';

export const store = configureStore({
  reducer: {
    auth:     authReducer,
    theme:    themeReducer,
    admin:    adminReducer,
    services: servicesReducer,
    browse:   browseReducer,
    pdfFiles: pdfFilesReducer,
  }
});

export default store;
