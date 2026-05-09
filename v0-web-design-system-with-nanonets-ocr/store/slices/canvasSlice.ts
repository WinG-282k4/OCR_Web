import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { CanvasComponent, CanvasState, ComponentStyle } from "@/lib/types";

const initialState: CanvasState = {
  components: {},
  order: [],
  selectedId: null,
  isDragging: false,
};

const canvasSlice = createSlice({
  name: "canvas",
  initialState,
  reducers: {
    // 100% Original Export Name Restored
    addComponent: (state, action: PayloadAction<CanvasComponent>) => {
      const comp = action.payload;
      state.components[comp.id] = {
        ...comp,
        style: comp.style || {},
        attributes: comp.attributes || {},
        events: comp.events || {},
      };
      state.order.push(comp.id);
      state.selectedId = comp.id;
    },

    updateComponent: (state, action: PayloadAction<{ id: string; updates: Partial<CanvasComponent> }>) => {
      const { id, updates } = action.payload;
      if (state.components[id]) {
        state.components[id] = { ...state.components[id], ...updates };
      }
    },

    updateComponentStyle: (state, action: PayloadAction<{ id: string; style: Partial<ComponentStyle> }>) => {
      const { id, style } = action.payload;
      if (state.components[id]) {
        state.components[id].style = { ...state.components[id].style, ...style };
      }
    },

    moveComponent: (state, action: PayloadAction<{ id: string; x: number; y: number }>) => {
      const { id, x, y } = action.payload;
      if (state.components[id]) {
        state.components[id].x = x;
        state.components[id].y = y;
      }
    },

    loadComponents: (state, action: PayloadAction<CanvasComponent[]>) => {
      state.components = {};
      state.order = [];
      action.payload.forEach((comp) => {
        state.components[comp.id] = {
          ...comp,
          style: comp.style || {},
          attributes: comp.attributes || {},
        };
        state.order.push(comp.id);
      });
    },

    selectComponent: (state, action: PayloadAction<string | null>) => {
      state.selectedId = action.payload;
    },

    removeComponent: (state, action: PayloadAction<string>) => {
      delete state.components[action.payload];
      state.order = state.order.filter((id) => id !== action.payload);
      if (state.selectedId === action.payload) state.selectedId = null;
    },

    setDragging: (state, action: PayloadAction<boolean>) => {
      state.isDragging = action.payload;
    },

    clearCanvas: (state) => {
      state.components = {};
      state.order = [];
      state.selectedId = null;
    },
  },
});

export const {
  addComponent,
  removeComponent,
  updateComponent,
  updateComponentStyle,
  selectComponent,
  setDragging,
  moveComponent,
  clearCanvas,
  loadComponents,
} = canvasSlice.actions;

export default canvasSlice.reducer;