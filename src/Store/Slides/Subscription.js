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
    clearSubscriptionStatus(state) {
      state.status = null;
      state.loaded = false;
    },
  },
});

export const { setSubscriptionStatus, clearSubscriptionStatus } = subscriptionSlice.actions;
export const SubscriptionReducer = subscriptionSlice.reducer;
