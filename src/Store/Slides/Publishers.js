import { createSlice } from "@reduxjs/toolkit";

const initialState = null;

const toastSlice = createSlice({
  name: "toast",
  initialState: [],
  reducers: {
    setToast: (state, action) => {
      const id = Date.now() + Math.random();
      state.push({ ...action.payload, id });
    },
    clearToast: (state, action) => {
      if (action.payload?.id) {
        return state.filter((t) => t.id !== action.payload.id);
      } else {
        return [];
      }
    },
  },
});

const toPublishSlice = createSlice({
  name: "toPublish",
  initialState,
  reducers: {
    setToPublish(state, action) {
      return action.payload;
      // return [action.payload, ...state];
    },
  },
});

const isPublishingSlice = createSlice({
  name: "isPublishing",
  initialState,
  reducers: {
    setIsPublishing(state, action) {
      return action.payload;
    },
  },
});

export const { setToast, clearToast } = toastSlice.actions;
export const { setToPublish } = toPublishSlice.actions;
export const { setIsPublishing } = isPublishingSlice.actions;

export const ToastReducer = toastSlice.reducer;
export const ToPublishReducer = toPublishSlice.reducer;
export const IsPublishingReducer = isPublishingSlice.reducer;
