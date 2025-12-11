
import { createSlice } from "@reduxjs/toolkit";

const initialState = false;

const userFirstLoginYakiChestSlice = createSlice({
  name: "userFirstLoginYakiChest",
  initialState,
  reducers: {
    setUserFirstLoginYakiChest(state, action) {
      return action.payload;
    },
  },
});

const isConnectedToYakiSlice = createSlice({
  name: "isConnectedToYaki",
  initialState: false,
  reducers: {
    setIsConnectedToYaki(state, action) {
      return action.payload;
    },
  },
});

const yakiChestStatsSlice = createSlice({
  name: "yakiChestStats",
  initialState,
  reducers: {
    setYakiChestStats(state, action) {
      return action.payload;
    },
  },
});

const isYakiChestLoadedSlice = createSlice({
  name: "isYakiChestLoaded",
  initialState,
  reducers: {
    setIsYakiChestLoaded(state, action) {
      return action.payload;
    },
  },
});

const updatedActionFromYakiChestSlice = createSlice({
  name: "updatedActionFromYakiChest",
  initialState,
  reducers: {
    setUpdatedActionFromYakiChest(state, action) {
      return action.payload;
    },
  },
});

export const { setUserFirstLoginYakiChest } =
  userFirstLoginYakiChestSlice.actions;
export const { setIsConnectedToYaki } = isConnectedToYakiSlice.actions;
export const { setYakiChestStats } = yakiChestStatsSlice.actions;
export const { setIsYakiChestLoaded } = isYakiChestLoadedSlice.actions;
export const { setUpdatedActionFromYakiChest } = updatedActionFromYakiChestSlice.actions;

export const UserFirstLoginYakiChestReducer =
  userFirstLoginYakiChestSlice.reducer;
export const IsConnectedToYakiReducer = isConnectedToYakiSlice.reducer;
export const YakiChestStatsReducer = yakiChestStatsSlice.reducer;
export const IsYakiChestLoadedReducer = isYakiChestLoadedSlice.reducer;
export const UpdatedActionFromYakiChestSliceReducer = updatedActionFromYakiChestSlice.reducer;
