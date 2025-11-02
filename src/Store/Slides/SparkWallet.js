'use client';
import { createSlice } from "@reduxjs/toolkit";

/**
 * Spark Wallet Redux State
 *
 * Manages state for the Breez Spark self-custodial Lightning wallet
 */

// Connection status slice
const sparkConnectedSlice = createSlice({
  name: "sparkConnected",
  initialState: false,
  reducers: {
    setSparkConnected(state, action) {
      return action.payload;
    },
  },
});

// Connection in progress slice
const sparkConnectingSlice = createSlice({
  name: "sparkConnecting",
  initialState: false,
  reducers: {
    setSparkConnecting(state, action) {
      return action.payload;
    },
  },
});

// Balance in satoshis slice
const sparkBalanceSlice = createSlice({
  name: "sparkBalance",
  initialState: null,
  reducers: {
    setSparkBalance(state, action) {
      return action.payload;
    },
  },
});

// Lightning address (e.g., user@breez.tips) slice
const sparkLightningAddressSlice = createSlice({
  name: "sparkLightningAddress",
  initialState: null,
  reducers: {
    setSparkLightningAddress(state, action) {
      return action.payload;
    },
  },
});

// Wallet info (full GetInfoResponse from SDK) slice
const sparkWalletInfoSlice = createSlice({
  name: "sparkWalletInfo",
  initialState: null,
  reducers: {
    setSparkWalletInfo(state, action) {
      return action.payload;
    },
  },
});

// Last sync timestamp slice
const sparkLastSyncSlice = createSlice({
  name: "sparkLastSync",
  initialState: null,
  reducers: {
    setSparkLastSync(state, action) {
      return action.payload;
    },
  },
});

// Payment list slice
const sparkPaymentsSlice = createSlice({
  name: "sparkPayments",
  initialState: [],
  reducers: {
    setSparkPayments(state, action) {
      return action.payload;
    },
  },
});

// Export actions
export const { setSparkConnected } = sparkConnectedSlice.actions;
export const { setSparkConnecting } = sparkConnectingSlice.actions;
export const { setSparkBalance } = sparkBalanceSlice.actions;
export const { setSparkLightningAddress } = sparkLightningAddressSlice.actions;
export const { setSparkWalletInfo } = sparkWalletInfoSlice.actions;
export const { setSparkLastSync } = sparkLastSyncSlice.actions;
export const { setSparkPayments } = sparkPaymentsSlice.actions;

// Export reducers
export const SparkConnectedReducer = sparkConnectedSlice.reducer;
export const SparkConnectingReducer = sparkConnectingSlice.reducer;
export const SparkBalanceReducer = sparkBalanceSlice.reducer;
export const SparkLightningAddressReducer = sparkLightningAddressSlice.reducer;
export const SparkWalletInfoReducer = sparkWalletInfoSlice.reducer;
export const SparkLastSyncReducer = sparkLastSyncSlice.reducer;
export const SparkPaymentsReducer = sparkPaymentsSlice.reducer;
