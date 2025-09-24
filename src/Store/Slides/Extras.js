"use client";
import { createSlice } from "@reduxjs/toolkit";

const initialState = null;

const initDMSSlice = createSlice({
  name: "initDMS",
  initialState,
  reducers: {
    setInitDMS(state, action) {
      return action.payload;
    },
  },
});
const isDarkModeSlice = createSlice({
  name: "isDarkMode",
  initialState: "0",
  reducers: {
    setIsDarkMode(state, action) {
      return action.payload;
    },
  },
});
const followersCountSLSlice = createSlice({
  name: "followersCountSL",
  initialState: [],
  reducers: {
    setFollowersCountSL(state, action) {
      return action.payload;
    },
  },
});

const importantFlashNewsSlice = createSlice({
  name: "importantFlashNews",
  initialState: [],
  reducers: {
    setImportantFlashNews(state, action) {
      return action.payload;
    },
  },
});

const trendingUsersSlice = createSlice({
  name: "trendingUsersNews",
  initialState: [],
  reducers: {
    setTrendingUsers(state, action) {
      return action.payload;
    },
  },
});

const recentTagsSlice = createSlice({
  name: "recentTagsNews",
  initialState: [],
  reducers: {
    setRecentTags(state, action) {
      return action.payload;
    },
  },
});

const homeSavedNotesSlice = createSlice({
  name: "homeSavedNotes",
  initialState: { scrollTo: 0, notes: [] },
  reducers: {
    setHomeSavedNotes(state, action) {
      return action.payload;
    },
  },
});
const homeCarouselPostsSlice = createSlice({
  name: "homeCarouselPosts",
  initialState: [],
  reducers: {
    setHomeCarouselPosts(state, action) {
      return action.payload;
    },
  },
});
const relaysStatsSlice = createSlice({
  name: "relaysStats",
  initialState: [],
  reducers: {
    setRelaysStats(state, action) {
      return action.payload;
    },
  },
});

export const { setInitDMS } = initDMSSlice.actions;
export const { setIsDarkMode } = isDarkModeSlice.actions;
export const { setFollowersCountSL } = followersCountSLSlice.actions;
export const { setImportantFlashNews } = importantFlashNewsSlice.actions;
export const { setTrendingUsers } = trendingUsersSlice.actions;
export const { setRecentTags } = recentTagsSlice.actions;
export const { setHomeSavedNotes } = homeSavedNotesSlice.actions;
export const { setHomeCarouselPosts } = homeCarouselPostsSlice.actions;
export const { setRelaysStats } = relaysStatsSlice.actions;

export const InitDMSReducer = initDMSSlice.reducer;
export const IsDarkModeReducer = isDarkModeSlice.reducer;
export const FollowersCountSLReducer = followersCountSLSlice.reducer;
export const ImportantFlashNewsReducer = importantFlashNewsSlice.reducer;
export const TrendingUsersReducer = trendingUsersSlice.reducer;
export const RecentTagsReducer = recentTagsSlice.reducer;
export const HomeSavedNotesReducer = homeSavedNotesSlice.reducer;
export const HomeCarouselPostsReducer = homeCarouselPostsSlice.reducer;
export const RelaysStatsReducer = relaysStatsSlice.reducer;
