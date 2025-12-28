import {
  removeDuplicants,
  removeEventsDuplicants,
} from "@/Helpers/Encryptions";
import { checkEventType } from "@/Helpers/NotificationsHelpers";
import { createSlice } from "@reduxjs/toolkit";

const initDMSSlice = createSlice({
  name: "initDMS",
  initialState: true,
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
const refreshAppSettingsSlice = createSlice({
  name: "refreshAppSettings",
  initialState: Date.now(),
  reducers: {
    setRefreshAppSettings(state, action) {
      return action.payload;
    },
  },
});
const notificationsSlice = createSlice({
  name: "notifications",
  initialState: [],
  reducers: {
    setNotifications(state, action) {
      let data = action.payload.data.map((_) => {
        let type = checkEventType(_, action.payload.pubkey);
        return { ..._, type: { ...type } };
      });
      data = removeEventsDuplicants([...data, ...state]);
      return data;
    },
    updateNotifications(state, action) {
      return action.payload;
    },
    clearNotifications() {
      return [];
    },
  },
});
const isNotificationsLoadingSlice = createSlice({
  name: "isNotificationsLoading",
  initialState: false,
  reducers: {
    setIsNotificationsLoading(state, action) {
      return action.payload;
    },
  },
});
const refreshNotificationsSlice = createSlice({
  name: "refreshNotifications",
  initialState: Date.now(),
  reducers: {
    setRefreshNotifications(state, action) {
      return action.payload;
    },
  },
});

const videoVolumeSlice = createSlice({
  name: "videoVolume",
  initialState: "",
  reducers: {
    setVideoVolume(state, action) {
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
export const { setRefreshAppSettings } = refreshAppSettingsSlice.actions;
export const { setNotifications, updateNotifications, clearNotifications } =
  notificationsSlice.actions;
export const { setIsNotificationsLoading } =
  isNotificationsLoadingSlice.actions;
export const { setRefreshNotifications } = refreshNotificationsSlice.actions;
export const { setVideoVolume } = videoVolumeSlice.actions;

export const InitDMSReducer = initDMSSlice.reducer;
export const IsDarkModeReducer = isDarkModeSlice.reducer;
export const FollowersCountSLReducer = followersCountSLSlice.reducer;
export const ImportantFlashNewsReducer = importantFlashNewsSlice.reducer;
export const TrendingUsersReducer = trendingUsersSlice.reducer;
export const RecentTagsReducer = recentTagsSlice.reducer;
export const HomeSavedNotesReducer = homeSavedNotesSlice.reducer;
export const HomeCarouselPostsReducer = homeCarouselPostsSlice.reducer;
export const RelaysStatsReducer = relaysStatsSlice.reducer;
export const RefreshAppSettingsReducer = refreshAppSettingsSlice.reducer;
export const NotificationsReducer = notificationsSlice.reducer;
export const IsNotificationsLoadingReducer =
  isNotificationsLoadingSlice.reducer;
export const RefreshNotificationsReducer = refreshNotificationsSlice.reducer;
export const VideoVolumeReducer = videoVolumeSlice.reducer;
