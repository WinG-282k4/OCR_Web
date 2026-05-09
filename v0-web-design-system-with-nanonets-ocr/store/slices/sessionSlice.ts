import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { BEProject, BEScreen } from '@/lib/types';

interface SessionState {
  currentProjectId: string | null;
  currentProject: BEProject | null;
  currentScreenId: string | null;
  currentScreen: BEScreen | null;
  screens: BEScreen[];
  projects: BEProject[];
  isSaving: boolean;
  lastSavedAt: string | null;
  saveError: string | null;
}

const initialState: SessionState = {
  currentProjectId: null,
  currentProject: null,
  currentScreenId: null,
  currentScreen: null,
  screens: [],
  projects: [],
  isSaving: false,
  lastSavedAt: null,
  saveError: null,
};

const sessionSlice = createSlice({
  name: 'session',
  initialState,
  reducers: {
    setProjects: (state, action: PayloadAction<BEProject[]>) => {
      state.projects = action.payload;
    },

    addProject: (state, action: PayloadAction<BEProject>) => {
      state.projects.unshift(action.payload);
    },

    removeProject: (state, action: PayloadAction<string>) => {
      state.projects = state.projects.filter((p) => p.id !== action.payload);
    },

    setCurrentProject: (state, action: PayloadAction<BEProject | null>) => {
      state.currentProject = action.payload;
      state.currentProjectId = action.payload?.id ?? null;
      // Reset screen context when switching projects
      state.currentScreenId = null;
      state.currentScreen = null;
      state.screens = [];
    },

    setScreens: (state, action: PayloadAction<BEScreen[]>) => {
      state.screens = action.payload;
    },

    addScreen: (state, action: PayloadAction<BEScreen>) => {
      state.screens.push(action.payload);
      // Update count on current project
      if (state.currentProject) {
        state.currentProject = {
          ...state.currentProject,
          screen_count: (state.currentProject.screen_count ?? 0) + 1,
        };
      }
    },

    removeScreen: (state, action: PayloadAction<string>) => {
      state.screens = state.screens.filter((s) => s.id !== action.payload);
      if (state.currentScreenId === action.payload) {
        state.currentScreenId = null;
        state.currentScreen = null;
      }
    },

    setCurrentScreen: (state, action: PayloadAction<BEScreen | null>) => {
      state.currentScreen = action.payload;
      state.currentScreenId = action.payload?.id ?? null;
    },

    updateScreenInList: (state, action: PayloadAction<BEScreen>) => {
      const idx = state.screens.findIndex((s) => s.id === action.payload.id);
      if (idx !== -1) {
        state.screens[idx] = action.payload;
      }
      if (state.currentScreenId === action.payload.id) {
        state.currentScreen = action.payload;
      }
    },

    savingStart: (state) => {
      state.isSaving = true;
      state.saveError = null;
    },

    savingSuccess: (state) => {
      state.isSaving = false;
      state.lastSavedAt = new Date().toISOString();
      state.saveError = null;
    },

    savingFailure: (state, action: PayloadAction<string>) => {
      state.isSaving = false;
      state.saveError = action.payload;
    },

    clearSession: (state) => {
      state.currentProjectId = null;
      state.currentProject = null;
      state.currentScreenId = null;
      state.currentScreen = null;
      state.screens = [];
      state.projects = [];
    },
  },
});

export const {
  setProjects,
  addProject,
  removeProject,
  setCurrentProject,
  setScreens,
  addScreen,
  removeScreen,
  setCurrentScreen,
  updateScreenInList,
  savingStart,
  savingSuccess,
  savingFailure,
  clearSession,
} = sessionSlice.actions;

export default sessionSlice.reducer;
