import { createSlice } from "@reduxjs/toolkit";

const upgradeSlice = createSlice({
  name: "upgrade",
  initialState: {
    open: false,
    context: null,
  },
  reducers: {
    openUpgradeSheet(state, action) {
      state.open = true;
      state.context = action.payload || null;
    },
    closeUpgradeSheet(state) {
      state.open = false;
      state.context = null;
    },
  },
});

const onboardingSlice = createSlice({
  name: "onboarding",
  initialState: {
    open: false,
  },
  reducers: {
    openOnboarding(state) {
      state.open = true;
    },
    closeOnboarding(state) {
      state.open = false;
    },
  },
});

export const { openUpgradeSheet, closeUpgradeSheet } = upgradeSlice.actions;
export const { openOnboarding, closeOnboarding } = onboardingSlice.actions;
export const UpgradeReducer = upgradeSlice.reducer;
export const OnboardingReducer = onboardingSlice.reducer;
