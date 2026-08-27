import { createSlice } from "@reduxjs/toolkit";

const ACTIVE_STATUSES = ["active", "canceling"];

const creatorsSubscriptionsSlice = createSlice({
  name: "creatorsSubscriptions",
  initialState: {
    subscriptions: [],
    loaded: false,
  },
  reducers: {
    setCreatorsSubscriptions(state, action) {
      state.subscriptions = action.payload || [];
      state.loaded = true;
    },
    clearCreatorsSubscriptions(state) {
      state.subscriptions = [];
      state.loaded = false;
    },
  },
});

export const isActiveCreatorSubscription = (subscription) => {
  if (!subscription) return false;
  const displayStatus = subscription.display_status || subscription.status;
  if (displayStatus) return ACTIVE_STATUSES.includes(displayStatus);
  return Boolean(subscription.active);
};

export const { setCreatorsSubscriptions, clearCreatorsSubscriptions } =
  creatorsSubscriptionsSlice.actions;
export const CreatorsSubscriptionsReducer = creatorsSubscriptionsSlice.reducer;
