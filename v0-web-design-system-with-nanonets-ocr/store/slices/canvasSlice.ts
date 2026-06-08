import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { CanvasComponent, CanvasState, ComponentStyle } from "@/lib/types";

const initialState: CanvasState = {
  components: {},
  order: [],
  selectedId: null,
  isDragging: false,
  editingId: null,
  past: [],
  future: [],
};

// Helper function to save snapshot to history stack
const pushToHistory = (state: CanvasState) => {
  const snap = {
    components: JSON.parse(JSON.stringify(state.components)),
    order: [...state.order],
  };
  state.past.push(snap);
  
  // Limit history length to 50 steps
  if (state.past.length > 50) {
    state.past.shift();
  }
  
  // Clear the redo stack whenever a new action is performed
  state.future = [];
};

const canvasSlice = createSlice({
  name: "canvas",
  initialState,
  reducers: {
    addComponent: (state, action: PayloadAction<CanvasComponent>) => {
      pushToHistory(state);
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
      pushToHistory(state);
      const { id, updates } = action.payload;
      if (state.components[id]) {
        state.components[id] = { ...state.components[id], ...updates };
      }
    },

    updateComponentStyle: (state, action: PayloadAction<{ id: string; style: Partial<ComponentStyle> }>) => {
      pushToHistory(state);
      const { id, style } = action.payload;
      if (state.components[id]) {
        state.components[id].style = { ...state.components[id].style, ...style };
      }
    },

    moveComponent: (state, action: PayloadAction<{ id: string; x: number; y: number }>) => {
      pushToHistory(state);
      const { id, x, y } = action.payload;
      if (state.components[id]) {
        state.components[id].x = x;
        state.components[id].y = y;
      }
    },

    loadComponents: (state, action: PayloadAction<CanvasComponent[]>) => {
      // For loadComponents, we reset history to keep it clean for a new screen
      state.past = [];
      state.future = [];
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

    updateOrder: (state, action: PayloadAction<string[]>) => {
      pushToHistory(state);
      state.order = action.payload;
    },

    selectComponent: (state, action: PayloadAction<string | null>) => {
      if (state.selectedId !== action.payload) {
        state.selectedId = action.payload;
        state.editingId = null;
      }
    },

    setEditingId: (state, action: PayloadAction<string | null>) => {
      state.editingId = action.payload;
    },

    removeComponent: (state, action: PayloadAction<string>) => {
      pushToHistory(state);
      delete state.components[action.payload];
      state.order = state.order.filter((id) => id !== action.payload);
      if (state.selectedId === action.payload) state.selectedId = null;
    },

    setDragging: (state, action: PayloadAction<boolean>) => {
      state.isDragging = action.payload;
    },

    clearCanvas: (state) => {
      pushToHistory(state);
      state.components = {};
      state.order = [];
      state.selectedId = null;
    },

    undo: (state) => {
      if (state.past.length === 0) return;

      const current = {
        components: JSON.parse(JSON.stringify(state.components)),
        order: [...state.order],
      };
      state.future.push(current);

      const previous = state.past.pop();
      if (previous) {
        state.components = previous.components;
        state.order = previous.order;
        if (state.selectedId && !state.components[state.selectedId]) {
          state.selectedId = null;
        }
      }
    },

    redo: (state) => {
      if (state.future.length === 0) return;

      const current = {
        components: JSON.parse(JSON.stringify(state.components)),
        order: [...state.order],
      };
      state.past.push(current);

      const nextState = state.future.pop();
      if (nextState) {
        state.components = nextState.components;
        state.order = nextState.order;
      }
    },
  },
});

export const {
  addComponent,
  removeComponent,
  updateComponent,
  updateComponentStyle,
  selectComponent,
  setEditingId,
  setDragging,
  moveComponent,
  clearCanvas,
  loadComponents,
  updateOrder,
  undo,
  redo,
} = canvasSlice.actions;

export default canvasSlice.reducer;