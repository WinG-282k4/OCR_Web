import { configureStore } from '@reduxjs/toolkit';
import canvasReducer from './slices/canvasSlice';
import uiReducer from './slices/uiSlice';
import authReducer from './slices/authSlice';
import sessionReducer from './slices/sessionSlice';

export const store = configureStore({
  reducer: {
    canvas: canvasReducer,
    ui: uiReducer,
    auth: authReducer,
    session: sessionReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
