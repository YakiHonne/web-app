
import { createSlice } from "@reduxjs/toolkit";

const initialState = [];

const nostrAuthorsSlice = createSlice({
  name: "nostrAuthors",
  initialState,
  reducers: {
    setNostrAuthors(state, action) {
      return action.payload;
    },
  },
});
const nostrClientsSlice = createSlice({
  name: "nostrClients",
  initialState,
  reducers: {
    setNostrClients(state, action) {
      return action.payload;
    },
  },
});

export const { setNostrAuthors } = nostrAuthorsSlice.actions;
export const { setNostrClients } = nostrClientsSlice.actions;

export const NostrAuthorsReducer = nostrAuthorsSlice.reducer;
export const NostrClientsReducer = nostrClientsSlice.reducer;
