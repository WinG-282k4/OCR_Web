import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface UIState {
  showComponentPalette: boolean;
  showPropertiesPanel: boolean;
  mode: "design" | "export";
  showOCRUpload: boolean;
  ocrLoading: boolean;
  ocrError: string | null;
}

const initialState: UIState = {
  showComponentPalette: true,
  showPropertiesPanel: true,
  mode: "design",
  showOCRUpload: false,
  ocrLoading: false,
  ocrError: null,
};

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    toggleComponentPalette: (state) => {
      state.showComponentPalette = !state.showComponentPalette;
    },

    togglePropertiesPanel: (state) => {
      state.showPropertiesPanel = !state.showPropertiesPanel;
    },

    setMode: (state, action: PayloadAction<"design" | "export">) => {
      state.mode = action.payload;
    },

    toggleOCRUpload: (state) => {
      state.showOCRUpload = !state.showOCRUpload;
    },

    setOCRLoading: (state, action: PayloadAction<boolean>) => {
      state.ocrLoading = action.payload;
    },

    setOCRError: (state, action: PayloadAction<string | null>) => {
      state.ocrError = action.payload;
    },

    resetOCRState: (state) => {
      state.ocrLoading = false;
      state.ocrError = null;
      state.showOCRUpload = false;
    },
  },
});

export const {
  toggleComponentPalette,
  togglePropertiesPanel,
  setMode,
  toggleOCRUpload,
  setOCRLoading,
  setOCRError,
  resetOCRState,
} = uiSlice.actions;

export default uiSlice.reducer;
