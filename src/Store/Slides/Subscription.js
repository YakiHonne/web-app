import { createSlice } from "@reduxjs/toolkit";

// null  = not yet fetched
// false = fetch failed (fail-open)
// {}    = fetched API response

const subscriptionSlice = createSlice({
  name: "subscription",
  initialState: {
    status: null,
    loaded: false,
  },
  reducers: {
    setSubscriptionStatus(state, action) {
      state.status = action.payload;
      state.loaded = true;
    },
    mergeAccountFields(state, action) {
      if (!action.payload) return;
      state.status = { ...(state.status || {}), ...action.payload };
    },
    clearSubscriptionStatus(state) {
      state.status = null;
      state.loaded = false;
    },
  },
});

export const pickAccountFields = (account) => {
  if (!account) return null;
  const fields = {};
  if (account.username !== undefined) fields.username = account.username;
  if (account.onboarded !== undefined) fields.onboarded = account.onboarded;
  if (account.in_trial !== undefined) fields.in_trial = account.in_trial;
  if (account.plan !== undefined) fields.plan = account.plan;
  if (account.active !== undefined) fields.active = account.active;
  if (account.trial_used !== undefined) fields.trial_used = account.trial_used;
  if (account.trial_ends_at !== undefined) fields.trial_ends_at = account.trial_ends_at;
  if (account.wallets !== undefined) fields.wallets = account.wallets;
  if (account.nip05 !== undefined) fields.nip05 = account.nip05;
  return Object.keys(fields).length ? fields : null;
};

export const {
  setSubscriptionStatus,
  mergeAccountFields,
  clearSubscriptionStatus,
} = subscriptionSlice.actions;
export const SubscriptionReducer = subscriptionSlice.reducer;
