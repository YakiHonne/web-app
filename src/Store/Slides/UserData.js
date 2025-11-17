'use client';
import { createSlice } from "@reduxjs/toolkit";

const userMetadataSlice = createSlice({
  name: "userMetadata",
  initialState: false,
  reducers: {
    setUserMetadata(state, action) {
      return action.payload;
    },
  },
});
const userKeysSlice = createSlice({
  name: "userData",
  initialState: false,
  reducers: {
    setUserKeys(state, action) {
      return action.payload;
    },
  },
});
const userBookmarksSlice = createSlice({
  name: "userBookmarks",
  initialState: [],
  reducers: {
    setUserBookmarks(state, action) {
      return action.payload;
    },
  },
});
const userRelaysSlice = createSlice({
  name: "userRelays",
  initialState: [],
  reducers: {
    setUserRelays(state, action) {
      return action.payload;
    },
  },
});
const userAllRelaysSlice = createSlice({
  name: "userAllRelays",
  initialState: [],
  reducers: {
    setUserAllRelays(state, action) {
      return action.payload;
    },
  },
});
const userInterestList = createSlice({
  name: "userInterestList",
  initialState: [],
  reducers: {
    setUserInterestList(state, action) {
      return action.payload;
    },
  },
});
const userChatroomsSlice = createSlice({
  name: "userChatrooms",
  initialState: [],
  reducers: {
    setUserChatrooms(state, action) {
      return action.payload;
    },
  },
});
const userChatContactsSlice = createSlice({
  name: "userChatContacts",
  initialState: [],
  reducers: {
    setUserChatContacts(state, action) {
      return action.payload;
    },
  },
});
const userFollowingsSlice = createSlice({
  name: "userFollowings",
  initialState: [],
  reducers: {
    setUserFollowings(state, action) {
      return action.payload;
    },
  },
});
const isUserFollowingsLoadedSlice = createSlice({
  name: "isUserFollowingsLoaded",
  initialState: false,
  reducers: {
    setIsUserFollowingsLoaded(state, action) {
      return action.payload;
    },
  },
});
const userMutedListSlice = createSlice({
  name: "userMutedList",
  initialState: { userMutedList: [], allTags: [] },
  reducers: {
    setUserMutedList(state, action) {
      return action.payload;
    },
  },
});
const userBalanceSlice = createSlice({
  name: "userBalance",
  initialState: "N/A",
  reducers: {
    setUserBalance(state, action) {
      return action.payload;
    },
  },
});
const walletsSlice = createSlice({
  name: "wallets",
  initialState: [],
  reducers: {
    setWallets(state, action) {
      return action.payload;
    },
  },
});
const selectedWalletSlice = createSlice({
  name: "selectedWallet",
  initialState: null,
  reducers: {
    setSelectedWallet(state, action) {
      return action.payload;
    },
  },
});
const userFollowingsRelaysSlice = createSlice({
  name: "userFollowingsRelays",
  initialState: [],
  reducers: {
    setUserFollowingsRelays(state, action) {
      return action.payload;
    },
  },
});
const userFollowingsInboxRelaysSlice = createSlice({
  name: "userFollowingsInboxRelays",
  initialState: [],
  reducers: {
    setUserFollowingsInboxRelays(state, action) {
      return action.payload;
    },
  },
});
const userSavedToolsSlice = createSlice({
  name: "userSavedTools",
  initialState: [],
  reducers: {
    setUserSavedTools(state, action) {
      return action.payload;
    },
  },
});
const userAppSettingsSlice = createSlice({
  name: "userAppSettings",
  initialState: false,
  reducers: {
    setUserAppSettings(state, action) {
      return action.payload;
    },
  },
});

const userInboxRelaysSlice = createSlice({
  name: "userInboxRelays",
  initialState: [],
  reducers: {
    setUserInboxRelays(state, action) {
      return action.payload;
    },
  },
});
const userFavRelaysSlice = createSlice({
  name: "userFavRelays",
  initialState: { relays: [] },
  reducers: {
    setUserFavRelays(state, action) {
      return action.payload;
    },
  },
});
const userSearchRelaysSlice = createSlice({
  name: "userSearchRelays",
  initialState: [],
  reducers: {
    setUserSearchRelays(state, action) {
      return action.payload;
    },
  },
});
const userWotListSlice = createSlice({
  name: "userWotList",
  initialState: [],
  reducers: {
    setUserWotList(state, action) {
      return action.payload;
    },
  },
});
const userBlossomServersSlice = createSlice({
  name: "userBlossomServers",
  initialState: [],
  reducers: {
    setUserBlossomServers(state, action) {
      return action.payload;
    },
  },
});

export const { setUserMetadata } = userMetadataSlice.actions;
export const { setUserKeys } = userKeysSlice.actions;
export const { setUserBookmarks } = userBookmarksSlice.actions;
export const { setUserInterestList } = userInterestList.actions;
export const { setUserRelays } = userRelaysSlice.actions;
export const { setUserAllRelays } = userAllRelaysSlice.actions;
export const { setUserChatrooms } = userChatroomsSlice.actions;
export const { setUserChatContacts } = userChatContactsSlice.actions;
export const { setUserFollowings } = userFollowingsSlice.actions;
export const { setIsUserFollowingsLoaded } = isUserFollowingsLoadedSlice.actions;
export const { setUserMutedList } = userMutedListSlice.actions;
export const { setUserBalance } = userBalanceSlice.actions;
export const { setUserFollowingsRelays } = userFollowingsRelaysSlice.actions;
export const { setUserFollowingsInboxRelays } = userFollowingsInboxRelaysSlice.actions;
export const { setWallets } = walletsSlice.actions;
export const { setSelectedWallet } = selectedWalletSlice.actions;
export const { setUserSavedTools } = userSavedToolsSlice.actions;
export const { setUserAppSettings } = userAppSettingsSlice.actions;
export const { setUserInboxRelays } = userInboxRelaysSlice.actions;
export const { setUserFavRelays } = userFavRelaysSlice.actions;
export const { setUserWotList } = userWotListSlice.actions;
export const { setUserBlossomServers } = userBlossomServersSlice.actions;
export const { setUserSearchRelays } = userSearchRelaysSlice.actions;

export const UserMetadataReducer = userMetadataSlice.reducer;
export const UserKeysReducer = userKeysSlice.reducer;
export const UserInterestListReducer = userInterestList.reducer;
export const UserBookmarksReducer = userBookmarksSlice.reducer;
export const UserRelaysReducer = userRelaysSlice.reducer;
export const UserAllRelaysReducer = userAllRelaysSlice.reducer;
export const UserChatroomsReducer = userChatroomsSlice.reducer;
export const UserChatContactsReducer = userChatContactsSlice.reducer;
export const UserFollowingsReducer = userFollowingsSlice.reducer;
export const UserMutedListReducer = userMutedListSlice.reducer;
export const UserBalanceReducer = userBalanceSlice.reducer;
export const UserFollowingsRelaysReducer = userFollowingsRelaysSlice.reducer;
export const UserFollowingsInboxRelaysReducer = userFollowingsInboxRelaysSlice.reducer;
export const WalletsReducer = walletsSlice.reducer;
export const SelectedWalletReducer = selectedWalletSlice.reducer;
export const UserSavedToolsReducer = userSavedToolsSlice.reducer;
export const UserAppSettingsReducer = userAppSettingsSlice.reducer;
export const UserInboxRelaysReducer = userInboxRelaysSlice.reducer;
export const UserFavRelaysReducer = userFavRelaysSlice.reducer;
export const UserWotListReducer = userWotListSlice.reducer;
export const UserBlossomServersReducer = userBlossomServersSlice.reducer;
export const UserSearchRelaysReducer = userSearchRelaysSlice.reducer;
export const IsUserFollowingsLoadedReducer = isUserFollowingsLoadedSlice.reducer;
