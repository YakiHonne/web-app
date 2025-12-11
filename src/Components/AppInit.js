import { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLiveQuery } from "dexie-react-hooks";
import {
  setIsUserFollowingsLoaded,
  setUserAllRelays,
  setUserAppSettings,
  setUserBlossomServers,
  setUserBookmarks,
  setUserChatrooms,
  setUserFavRelays,
  setUserFollowings,
  setUserFollowingsInboxRelays,
  setUserFollowingsRelays,
  setUserInboxRelays,
  setUserInterestList,
  setUserKeys,
  setUserMetadata,
  setUserMutedList,
  setUserRelays,
  setUserRelaysSet,
  setUserSavedTools,
  setUserSearchRelays,
  setUserWotList,
} from "@/Store/Slides/UserData";
import {
  getBookmarks,
  getChatrooms,
  getClients,
  getFollowings,
  getFollowingsRelays,
  getInterestsList,
  getMutedlist,
  getRelays,
  getUsers,
  saveBookmarks,
  saveChatrooms,
  saveFollowings,
  saveMutedlist,
  saveNostrClients,
  saveRelays,
  saveInterests,
  getAppSettings,
  saveAppSettings,
  getFavRelays,
  saveFavRelays,
  saveWotlist,
  getWotlist,
  getBlossomServers,
  saveBlossomServers,
  getInboxRelays,
  saveInboxRelays,
  getFollowingsInboxRelays,
  getRelaysStats,
  saveUsers,
  getSearchRelays,
  saveSearchRelays,
  getRelaysSet,
  saveRelaysSet,
} from "@/Helpers/DB";
import {
  addConnectedAccounts,
  getSubData,
  saveFavRelaysListsForUsers,
  saveInboxRelaysListsForUsers,
  saveRelayMetadata,
  saveRelaysListsForUsers,
  updateYakiChestStats,
  userLogout,
} from "@/Helpers/Controlers";
import {
  setInitDMS,
  setIsDarkMode,
  setRelaysStats,
  setTrendingUsers,
} from "@/Store/Slides/Extras";
import { addExplicitRelays, ndkInstance } from "@/Helpers/NDKInstance";
import {
  changePrimary,
  handleAppDirection,
  toggleColorScheme,
} from "@/Helpers/Helpers";
import {
  getConnectedAccounts,
  getKeys,
  getMetadataFromCachedAccounts,
} from "@/Helpers/ClientHelpers";
import { setNostrAuthors, setNostrClients } from "@/Store/Slides/Profiles";
import {
  decrypt04,
  getEmptyuserMetadata,
  getParsedAuthor,
  getParsedRepEvent,
  getWOTScoreForPubkeyLegacy,
  unwrapGiftWrap,
} from "@/Helpers/Encryptions";
import axiosInstance from "@/Helpers/HTTP_Client";
import {
  setIsConnectedToYaki,
  setIsYakiChestLoaded,
} from "@/Store/Slides/YakiChest";
import { relaysOnPlatform } from "@/Content/Relays";
import {
  NDKNip07Signer,
  NDKNip46Signer,
  NDKPrivateKeySigner,
  NDKRelayAuthPolicies,
} from "@nostr-dev-kit/ndk";
import { getTrendingUsers24h } from "@/Helpers/WSInstance";
import { savedToolsIdentifier } from "@/Content/Extras";
import { decryptDMSWorker } from "@/workers/decryptDMWorker";

export default function AppInit() {
  const dispatch = useDispatch();
  const userKeys = useSelector((state) => state.userKeys);
  const isConnectedToYaki = useSelector((state) => state.isConnectedToYaki);
  const chatrooms =
    useLiveQuery(
      async () => (userKeys ? await getChatrooms(userKeys.pub) : []),
      [userKeys]
    ) || [];
  const relays =
    useLiveQuery(
      async () => (userKeys ? await getRelays(userKeys.pub) : []),
      [userKeys]
    ) || [];
  const appSettings =
    useLiveQuery(
      async () => (userKeys ? await getAppSettings(userKeys.pub) : []),
      [userKeys]
    ) || false;
  const followings =
    useLiveQuery(
      async () => (userKeys ? await getFollowings(userKeys.pub) : []),
      [userKeys]
    ) || [];
  const interestsList =
    useLiveQuery(
      async () => (userKeys ? await getInterestsList(userKeys.pub) : []),
      [userKeys]
    ) || [];
  const bookmarks =
    useLiveQuery(
      async () => (userKeys ? await getBookmarks(userKeys.pub) : []),
      [userKeys]
    ) || [];
  const mutedlist =
    useLiveQuery(
      async () => (userKeys ? await getMutedlist(userKeys.pub) : []),
      [userKeys]
    ) || [];
  const favRelays =
    useLiveQuery(
      async () =>
        userKeys ? await getFavRelays(userKeys.pub) : { relays: [] },
      [userKeys]
    ) || [];
  const inboxRelays =
    useLiveQuery(
      async () => (userKeys ? await getInboxRelays(userKeys.pub) : []),
      [userKeys]
    ) || [];
  const relaysSet = useLiveQuery(
    async () => (userKeys ? await getRelaysSet(userKeys.pub) : []),
    [userKeys]
  ) || { last_timestamp: undefined };
  const searchRelays =
    useLiveQuery(
      async () => (userKeys ? await getSearchRelays(userKeys.pub) : []),
      [userKeys]
    ) || [];
  const wotList =
    useLiveQuery(
      async () => (userKeys ? await getWotlist(userKeys.pub) : []),
      [userKeys]
    ) || [];
  const blossomServers =
    useLiveQuery(
      async () => (userKeys ? await getBlossomServers(userKeys.pub) : []),
      [userKeys]
    ) || [];
  const users = useLiveQuery(async () => await getUsers(), []);
  const followingsRelays =
    useLiveQuery(async () => await getFollowingsRelays(), []) || [];
  const followingsInboxRelays =
    useLiveQuery(async () => await getFollowingsInboxRelays(), []) || [];
  const nostrClients = useLiveQuery(async () => await getClients(), []);
  const relaysStats = useLiveQuery(async () => await getRelaysStats(), []);

  const previousChatrooms = useRef([]);
  const previousRelays = useRef([]);
  const previousSearchRelays = useRef([]);
  const previousAppSettings = useRef(false);
  const previousInterests = useRef([]);
  const previousFollowings = useRef([]);
  const previousMutedList = useRef([]);
  const previousBookmarks = useRef([]);
  const previousUsers = useRef([]);
  const previousFollowingsRelays = useRef([]);
  const previousFollowingsInboxRelays = useRef([]);
  const previousNostrClients = useRef([]);
  const previousWotList = useRef([]);
  const previousBlossomServers = useRef([]);
  const previousInboxRelays = useRef([]);
  const previousRelaysStats = useRef([]);
  const previousFavRelays = useRef({ relays: [] });
  const previousRelaysSet = useRef({ last_timestamp: undefined });

  useEffect(() => {
    if (
      JSON.stringify(previousChatrooms.current) !== JSON.stringify(chatrooms)
    ) {
      previousChatrooms.current = chatrooms;
      dispatch(setUserChatrooms(chatrooms));
    }
    if (JSON.stringify(previousRelays.current) !== JSON.stringify(relays)) {
      previousRelays.current = relays;
      let relaysURLsToRead =
        relays.relays
          ?.filter((relay) => relay.read)
          .map((relay) => relay.url) || relaysOnPlatform;
      let relaysURLsToWrite =
        relays.relays
          ?.filter((relay) => relay.write)
          .map((relay) => relay.url) || relaysOnPlatform;
      relaysURLsToRead =
        relaysURLsToRead.length > 0 ? relaysURLsToRead : relaysOnPlatform;
      relaysURLsToWrite =
        relaysURLsToWrite.length > 0 ? relaysURLsToWrite : relaysOnPlatform;
      dispatch(setUserRelays(relaysURLsToWrite));
      dispatch(setUserAllRelays(relays.relays));
      // addExplicitRelays(relaysURLsToRead);
    }
    if (
      JSON.stringify(previousFavRelays.current) !== JSON.stringify(favRelays)
    ) {
      previousFavRelays.current = favRelays;
      dispatch(setUserFavRelays(favRelays));
      saveRelayMetadata(favRelays.relays || []);
    }
    if (
      JSON.stringify(previousSearchRelays.current) !==
      JSON.stringify(searchRelays)
    ) {
      previousSearchRelays.current = searchRelays;
      dispatch(setUserSearchRelays(searchRelays.relays));
      saveRelayMetadata(searchRelays.relays || []);
    }
    if (
      JSON.stringify(previousInboxRelays.current) !==
      JSON.stringify(inboxRelays)
    ) {
      previousInboxRelays.current = inboxRelays;
      dispatch(setUserInboxRelays(inboxRelays.relays));
      addExplicitRelays(inboxRelays.relays || []);
    }
    if (JSON.stringify(previousWotList.current) !== JSON.stringify(wotList)) {
      previousWotList.current = wotList;
      dispatch(setUserWotList(wotList));
    }
    if (
      JSON.stringify(previousFollowings.current) !== JSON.stringify(followings)
    ) {
      previousFollowings.current = followings;
      dispatch(setUserFollowings(followings?.followings || []));
      if (followings?.followings) dispatch(setIsUserFollowingsLoaded(true));
    }

    if (
      JSON.stringify(previousBlossomServers.current) !==
      JSON.stringify(blossomServers)
    ) {
      previousBlossomServers.current = blossomServers;

      dispatch(setUserBlossomServers(blossomServers?.servers || []));
    }
    if (
      JSON.stringify(previousAppSettings.current) !==
      JSON.stringify(appSettings)
    ) {
      previousAppSettings.current = appSettings;
      dispatch(setUserAppSettings(appSettings || false));
    }
    if (
      JSON.stringify(previousRelaysSet.current) !== JSON.stringify(relaysSet)
    ) {
      previousRelaysSet.current = relaysSet;
      dispatch(setUserRelaysSet(relaysSet));
    }
    if (
      JSON.stringify(previousInterests.current) !==
      JSON.stringify(interestsList)
    ) {
      previousInterests.current = interestsList;
      dispatch(setUserInterestList(interestsList?.interestsList || []));
    }
    if (
      JSON.stringify(previousMutedList.current) !== JSON.stringify(mutedlist)
    ) {
      previousMutedList.current = mutedlist;
      dispatch(
        setUserMutedList({
          userMutedList: mutedlist?.mutedlist || [],
          allTags: mutedlist?.allTags || [],
        })
      );
      saveUsers(mutedlist?.mutedlist || []);
      ndkInstance.muteFilter = (event) => {
        if (mutedlist?.mutedlist?.includes(event.pubkey)) return true;
        return false;
      };
    }
    if (
      JSON.stringify(previousBookmarks.current) !== JSON.stringify(bookmarks)
    ) {
      previousBookmarks.current = bookmarks;
      let onlyRegular = bookmarks.filter((_) => _.d !== savedToolsIdentifier);
      let onlySWST = bookmarks.find((_) => _.d === savedToolsIdentifier);
      onlySWST = onlySWST ? onlySWST.items : [];
      dispatch(setUserBookmarks(onlyRegular));
      dispatch(setUserSavedTools(onlySWST));
    }
    if (JSON.stringify(previousUsers.current) !== JSON.stringify(users)) {
      previousUsers.current = users;
      dispatch(setNostrAuthors(users));
    }
    if (
      JSON.stringify(previousFollowingsRelays.current) !==
      JSON.stringify(followingsRelays)
    ) {
      previousFollowingsRelays.current = followingsRelays;
      dispatch(setUserFollowingsRelays(followingsRelays));
    }
    if (
      JSON.stringify(previousFollowingsInboxRelays.current) !==
      JSON.stringify(followingsInboxRelays)
    ) {
      previousFollowingsInboxRelays.current = followingsInboxRelays;
      dispatch(setUserFollowingsInboxRelays(followingsInboxRelays));
    }
    if (
      JSON.stringify(previousNostrClients.current) !==
      JSON.stringify(nostrClients)
    ) {
      previousNostrClients.current = nostrClients;
      dispatch(setNostrClients(nostrClients));
    }
    if (
      JSON.stringify(previousRelaysStats.current) !==
      JSON.stringify(relaysStats)
    ) {
      previousRelaysStats.current = relaysStats;
      dispatch(setRelaysStats(relaysStats));
    }
  }, [
    chatrooms,
    relays,
    followings,
    mutedlist,
    followingsRelays,
    followingsInboxRelays,
    users,
    bookmarks,
    interestsList,
    appSettings,
    blossomServers,
    inboxRelays,
    relaysStats,
    favRelays,
    searchRelays,
    relaysSet,
  ]);

  useEffect(() => {
    let previousDarkMode = localStorage.getItem("yaki-theme");
    let previousAppLang = localStorage.getItem("app-lang");
    let previousIsConnectedToYaki = localStorage.getItem("connect_yc")
      ? true
      : false;

    if (previousDarkMode === "0") {
      setIsDarkMode("1");
      toggleColorScheme(false);
    }
    if (previousDarkMode === "1") {
      setIsDarkMode("0");
      toggleColorScheme(true);
    }
    if (previousIsConnectedToYaki) {
      dispatch(setIsConnectedToYaki(true));
    }
    saveNostrClients();
    getTrendingProfiles();
    handleAppDirection(previousAppLang);
    changePrimary();

    let keys = getKeys();
    if (keys) {
      dispatch(setUserMetadata(getMetadataFromCachedAccounts(keys.pub)));
      dispatch(setUserKeys(keys));
    }

    // Add global error handler for NDK relay errors
    const handleGlobalError = (event) => {
      const error = event.error || event.reason;
      if (error && typeof error === 'object') {
        const errorMsg = error.message || String(error);
        // Suppress common relay errors that shouldn't break the app
        if (errorMsg.includes('already authenticated') ||
            errorMsg.includes('user unauthorized') ||
            errorMsg.includes('restricted') ||
            (errorMsg.includes('Relay') && errorMsg.includes('disconnected')) ||
            (errorMsg.includes('WebSocket') && errorMsg.includes('closed'))) {
          console.warn('[AppInit] Suppressing NDK relay error:', errorMsg);
          event.preventDefault();
          event.stopPropagation();
        }
      }
    };

    window.addEventListener('error', handleGlobalError);
    window.addEventListener('unhandledrejection', handleGlobalError);

    return () => {
      window.removeEventListener('error', handleGlobalError);
      window.removeEventListener('unhandledrejection', handleGlobalError);
    };
  }, []);

  useEffect(() => {
    let handleUseRKeys = async () => {
      let signer = ndkInstance.signer;
      if (signer) {
        signer = await ndkInstance.signer.user();
        signer = signer._pubkey;
      }
      if (signer !== userKeys.pub) {
        if (userKeys.ext) {
          const signer = new NDKNip07Signer(undefined, ndkInstance);
          ndkInstance.signer = signer;
        }
        if (userKeys.sec) {
          const signer = new NDKPrivateKeySigner(userKeys.sec);
          ndkInstance.signer = signer;
        }
        if (userKeys.bunker) {
          const localKeys = new NDKPrivateKeySigner(userKeys.localKeys.sec);
          const signer = new NDKNip46Signer(
            ndkInstance,
            userKeys.bunker,
            localKeys
          );
          ndkInstance.signer = signer;
        }
      }

      // Custom auth policy that doesn't throw on authentication errors
      ndkInstance.relayAuthDefaultPolicy = async (relay) => {
        try {
          // Attempt standard sign-in
          const policy = NDKRelayAuthPolicies.signIn({ ndk: ndkInstance });
          if (typeof policy === 'function') {
            await policy(relay);
          }
        } catch (error) {
          // Suppress auth errors silently
          const errorMsg = error?.message || String(error);
          if (errorMsg.includes('already authenticated') ||
              errorMsg.includes('user unauthorized') ||
              errorMsg.includes('restricted')) {
            console.warn('[NDK Auth] Suppressing relay auth error:', relay.url, errorMsg);
            // Don't throw - just continue without auth
            return;
          }
          // Re-throw other errors
          throw error;
        }
      };
    };
    if (userKeys) {
      handleUseRKeys();
      dispatch(setUserMetadata(getMetadataFromCachedAccounts(userKeys.pub)));
      localStorage.setItem("_nostruserkeys", JSON.stringify(userKeys));
    }
    dispatch(setIsUserFollowingsLoaded(false));
    dispatch(setUserFollowings([]));
  }, [userKeys]);

  useEffect(() => {
    let subscription = null;
    const fetchData = async () => {
      let [
        RELAYS,
        FOLLOWINGS,
        MUTEDLIST,
        INTERESTSLIST,
        APPSETTINGS,
        FAVRELAYS,
        BLOSSOMSERVERS,
        INBOXRELAYS,
        SEARCHRELAYS,
        RELAYSSET,
      ] = await Promise.all([
        getRelays(userKeys.pub),
        getFollowings(userKeys.pub),
        getMutedlist(userKeys.pub),
        getInterestsList(userKeys.pub),
        getAppSettings(userKeys.pub),
        getFavRelays(userKeys.pub),
        getBlossomServers(userKeys.pub),
        getInboxRelays(userKeys.pub),
        getSearchRelays(userKeys.pub),
        getRelaysSet(userKeys.pub),
      ]);
      let lastRelaysTimestamp = RELAYS?.last_timestamp || undefined;
      let lastFollowingsTimestamp = FOLLOWINGS?.last_timestamp || undefined;
      let lastInterestsTimestamp = INTERESTSLIST?.last_timestamp || undefined;
      let lastRelaysSetTimestamp = RELAYSSET?.last_timestamp || undefined;
      let lastMutedTimestamp = MUTEDLIST?.last_timestamp || undefined;
      let lastAppSettingsTimestamp = APPSETTINGS?.last_timestamp || undefined;
      let lastInboxRelaysTimestamp = INBOXRELAYS?.last_timestamp || undefined;
      let lastFavRelaysTimestamp = FAVRELAYS?.last_timestamp || undefined;
      let lastSearchRelaysTimestamp = SEARCHRELAYS?.last_timestamp || undefined;
      let lastBlossomServersTimestamp =
        BLOSSOMSERVERS?.last_timestamp || undefined;
      let lastUserMetadataTimestamp =
        getMetadataFromCachedAccounts(userKeys.pub).created_at || undefined;
      dispatch(setInitDMS(true));
      let tempUserFollowings;
      let tempUserInterests;
      let tempBlossomServers;
      let tempMutedList;
      let tempRelays;
      let tempSearchRelays;
      let tempInboxRelays;
      let tempFavRelays;
      let tempAppSettings;
      let tempBookmarks = [];
      let tempRelaysSet = [];
      let tempAuthMetadata = false;
      let eose = false;
      subscription = ndkInstance.subscribe(
        [
          {
            kinds: [3],
            authors: [userKeys.pub],
            since: lastFollowingsTimestamp
              ? lastFollowingsTimestamp + 1
              : lastFollowingsTimestamp,
          },
          {
            kinds: [10015],
            authors: [userKeys.pub],
            since: lastInterestsTimestamp
              ? lastInterestsTimestamp + 1
              : lastInterestsTimestamp,
          },
          {
            kinds: [10000],
            authors: [userKeys.pub],
            since: lastMutedTimestamp
              ? lastMutedTimestamp + 1
              : lastMutedTimestamp,
          },
          {
            kinds: [10002],
            authors: [userKeys.pub],
            since: lastRelaysTimestamp
              ? lastRelaysTimestamp + 1
              : lastRelaysTimestamp,
          },
          {
            kinds: [10007],
            authors: [userKeys.pub],
            since: lastSearchRelaysTimestamp
              ? lastSearchRelaysTimestamp + 1
              : lastSearchRelaysTimestamp,
          },
          {
            kinds: [10050],
            authors: [userKeys.pub],
            since: lastInboxRelaysTimestamp
              ? lastInboxRelaysTimestamp + 1
              : lastInboxRelaysTimestamp,
          },
          {
            kinds: [10063],
            authors: [userKeys.pub],
            since: lastBlossomServersTimestamp
              ? lastBlossomServersTimestamp + 1
              : lastBlossomServersTimestamp,
          },
          {
            kinds: [10012],
            authors: [userKeys.pub],
            since: lastFavRelaysTimestamp
              ? lastFavRelaysTimestamp + 1
              : lastFavRelaysTimestamp,
          },
          {
            kinds: [30002],
            authors: [userKeys.pub],
            since: lastRelaysSetTimestamp
              ? lastRelaysSetTimestamp + 1
              : lastRelaysSetTimestamp,
          },
          {
            kinds: [30078],
            authors: [userKeys.pub],
            "#d": ["YakihonneAppSettings"],
            since: lastAppSettingsTimestamp
              ? lastAppSettingsTimestamp + 1
              : lastAppSettingsTimestamp,
          },
          {
            kinds: [30003],
            authors: [userKeys.pub],
          },
          {
            kinds: [0],
            authors: [userKeys.pub],
            since: lastUserMetadataTimestamp
              ? lastUserMetadataTimestamp + 1
              : lastUserMetadataTimestamp,
          },
        ],
        {
          cacheUsage: "CACHE_FIRST",
          groupable: false,

          subId: "user-essentials",
        }
      );
      subscription.on("event", async (event) => {
        if (event.kind === 3) {
          tempUserFollowings = { ...event };
          if (eose) saveFollowings(event, userKeys.pub);
        }
        if (event.kind === 10063) {
          tempBlossomServers = { ...event };
          if (eose) saveBlossomServers(event, userKeys.pub);
        }
        if (event.kind === 10015) {
          tempUserInterests = { ...event };
          if (eose) saveInterests(event, userKeys.pub);
        }
        if (event.kind === 10000) {
          tempMutedList = { ...event };
          if (eose) saveMutedlist(event, userKeys.pub);
        }
        if (event.kind === 10002) {
          tempRelays = { ...event };
          if (eose) saveRelays(event, userKeys.pub);
        }
        if (event.kind === 10007) {
          tempSearchRelays = { ...event };
          if (eose) saveSearchRelays(event, userKeys.pub);
        }
        if (event.kind === 10050) {
          tempInboxRelays = { ...event };
          if (eose) saveInboxRelays(event, userKeys.pub);
        }
        if (event.kind === 10012) {
          tempFavRelays = { ...event.rawEvent() };
          if (eose) saveFavRelays(event.rawEvent(), userKeys.pub);
        }
        if (event.kind === 30078) {
          tempAppSettings = { ...event };
          if (eose) saveAppSettings(tempAppSettings, userKeys.pub);
        }
        if (event.kind === 30003) {
          let parsedEvent = getParsedRepEvent(event);
          let index = tempBookmarks.findIndex(
            (bookmark) => bookmark.d === parsedEvent.d
          );
          if (index === -1) tempBookmarks.push(parsedEvent);
          else tempBookmarks.splice(index, 1, parsedEvent);
          if (eose) saveBookmarks(tempBookmarks, userKeys.pub);
        }
        if (event.kind === 30002) {
          let tempEvent = { ...event.rawEvent() };
          tempRelaysSet.push(tempEvent);
          if (eose) saveRelaysSet(tempRelaysSet, userKeys.pub);
        }
        if (event.kind === 0) {
          if (
            (lastUserMetadataTimestamp &&
              event.created_at > lastUserMetadataTimestamp) ||
            !lastUserMetadataTimestamp
          ) {
            lastUserMetadataTimestamp = event.created_at;
            let parsedEvent = getParsedAuthor(event);
            tempAuthMetadata = true;
            dispatch(setUserMetadata(parsedEvent));
            addConnectedAccounts(parsedEvent, userKeys);
          }
        }
      });
      subscription.on("eose", () => {
        saveFollowings(
          tempUserFollowings,
          userKeys.pub,
          lastFollowingsTimestamp
        );
        saveInterests(tempUserInterests, userKeys.pub, lastInterestsTimestamp);
        saveMutedlist(tempMutedList, userKeys.pub, lastMutedTimestamp);
        saveRelays(tempRelays, userKeys.pub, lastRelaysTimestamp);
        saveInboxRelays(
          tempInboxRelays,
          userKeys.pub,
          lastInboxRelaysTimestamp
        );
        saveFavRelays(tempFavRelays, userKeys.pub, lastFavRelaysTimestamp);
        saveSearchRelays(
          tempSearchRelays,
          userKeys.pub,
          lastSearchRelaysTimestamp
        );
        saveBlossomServers(
          tempBlossomServers,
          userKeys.pub,
          lastBlossomServersTimestamp
        );
        saveAppSettings(
          tempAppSettings,
          userKeys.pub,
          lastAppSettingsTimestamp
        );
        saveAppSettings(
          tempAppSettings,
          userKeys.pub,
          lastAppSettingsTimestamp
        );
        saveBookmarks(tempBookmarks, userKeys.pub);
        saveRelaysSet(tempRelaysSet, userKeys.pub);
        if (!(tempAuthMetadata && lastUserMetadataTimestamp)) {
          let emptyMetadata = getEmptyuserMetadata(userKeys.pub);
          dispatch(setUserMetadata(emptyMetadata));
          addConnectedAccounts(emptyMetadata, userKeys);
        }
        eose = true;
      });
    };

    if (userKeys && (userKeys.ext || userKeys.sec || userKeys.bunker)) {
      fetchData();
    }
    return () => {
      subscription && subscription.stop();
    };
  }, [userKeys]);

  useEffect(() => {
    let subscription = null;
    const fetchData = async () => {
      let INBOX = await getChatrooms(userKeys.pub);
      let lastMessageTimestamp =
        INBOX.length > 0
          ? INBOX.sort(
              (conv_1, conv_2) => conv_2.last_message - conv_1.last_message
            )[0].last_message
          : Math.floor(Date.now() / 1000);

      let tempInbox = [];
      let tempAuthors = [];
      let eose = false;
      subscription = ndkInstance.subscribe(
        [
          {
            kinds: [4],
            authors: [userKeys.pub],
            since: lastMessageTimestamp
              ? lastMessageTimestamp + 1
              : lastMessageTimestamp,
          },
          {
            kinds: [4],
            "#p": [userKeys.pub],
            since: lastMessageTimestamp
              ? lastMessageTimestamp + 1
              : lastMessageTimestamp,
          },
          {
            kinds: [1059],
            "#p": [userKeys.pub],
            since: lastMessageTimestamp
              ? lastMessageTimestamp - 432000
              : lastMessageTimestamp,
          },
        ],
        {
          cacheUsage: "CACHE_FIRST",
          groupable: false,
          skipVerification: false,
          skipValidation: false,
          subId: "user-essentials",
        }
      );
      subscription.on("event", async (event) => {
        let tempEvent = userKeys.ext
          ? await decryptDMS([event.rawEvent()], userKeys)
          : await decryptDMSWorker([event.rawEvent()], userKeys);
        tempInbox = [...tempInbox, ...tempEvent.inbox];
        tempAuthors = [...tempAuthors, ...tempEvent.authors];
        if (eose) {
          saveChatrooms(tempInbox, userKeys.pub);
          saveUsers(tempAuthors);
        }
      });
      subscription.on("eose", () => {
        saveChatrooms(tempInbox, userKeys.pub);
        saveUsers(tempAuthors);
        eose = true;
      });
    };

    if (userKeys && (userKeys.ext || userKeys.sec)) {
      fetchData();
    }
    return () => {
      subscription && subscription.stop();
    };
  }, [userKeys]);

  useEffect(() => {
    if (!userKeys || (!userKeys.ext && !userKeys.sec)) return;

    let isCancelled = false;

    const fetchData = async () => {
      const timeFrames = [
        604800, 1209600, 2592000, 7776000, 15552000, 31536000,
      ];
      dispatch(setInitDMS(true));
      try {
        const INBOX = await getChatrooms(userKeys.pub);
        if (isCancelled) return;

        let until =
          INBOX.length > 0
            ? INBOX.map((convo) => {
                if (convo.convo.length > 0) {
                  return convo.convo[0].created_at;
                } else Math.floor(Date.now() / 1000);
              }).sort((a, b) => a - b)[0] - 1
            : undefined;

        let since = until ? until - 604800 : until;

        dispatch(setInitDMS(true));

        let timePeriodIndex = 0;
        let endOfData = false;

        while (!endOfData) {
          if (isCancelled) return;
          const dmsData = await getSubData(
            [
              {
                kinds: [4],
                authors: [userKeys.pub],
                until,
                since,
                limit: 100,
              },
              {
                kinds: [4],
                "#p": [userKeys.pub],
                until,
                since,
                limit: 100,
              },
              {
                kinds: [1059],
                "#p": [userKeys.pub],
                until: until ? until - 432000 : until,
                since: since ? since - 432000 : since,
                limit: 100,
              },
            ],
            undefined,
            undefined,
            undefined,
            undefined,
            true
          );

          if (isCancelled) return;

          if (dmsData.data.length > 0) {
            const tempInbox = userKeys.ext
              ? await decryptDMS(dmsData.data, userKeys)
              : await decryptDMSWorker(dmsData.data, userKeys);
            if (isCancelled) return;
            await saveChatrooms(tempInbox.inbox, userKeys.pub);
            saveUsers(tempInbox.authors);
            until = tempInbox.until ? tempInbox.until : until;
            since = until ? until - 604800 : since;
            timePeriodIndex = 0;
          } else if (
            dmsData.data.length === 0 &&
            timePeriodIndex < timeFrames.length - 1
          ) {
            timePeriodIndex++;
            until = until ? until - timeFrames[timePeriodIndex] : until;
            since = until ? until - 604800 : since;
          } else {
            endOfData = true;
            dispatch(setInitDMS(false));
          }
        }
      } catch (err) {
        if (!isCancelled) console.error("fetchData failed:", err);
      }
    };

    fetchData();

    return () => {
      isCancelled = true;
    };
  }, [userKeys]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        dispatch(setIsYakiChestLoaded(false));
        const data = await axiosInstance.get("/api/v1/yaki-chest/stats");
        if (data.data.user_stats.pubkey !== userKeys.pub) {
          userLogout();
          localStorage.removeItem("connect_yc");
          dispatch(setIsYakiChestLoaded(true));
          return;
        }
        let { user_stats } = data.data;
        updateYakiChestStats(user_stats);
        dispatch(setIsYakiChestLoaded(true));
      } catch (err) {
        console.log(err);
        localStorage.removeItem("connect_yc");
        dispatch(setIsYakiChestLoaded(true));
      }
    };
    if (userKeys && isConnectedToYaki) fetchData();
    if (userKeys && !isConnectedToYaki) dispatch(setIsYakiChestLoaded(true));
  }, [userKeys, isConnectedToYaki]);

  useEffect(() => {
    const buildWOTList = async () => {
      let prevData = localStorage.getItem(`network_${userKeys.pub}`);
      prevData = prevData
        ? JSON.parse(prevData)
        : {
            last_updated: undefined,
          };
      if (
        prevData.last_updated &&
        followings?.last_timestamp < prevData.last_updated
      )
        return;

      let followinglist = followings?.followings.slice(0, 100);
      let batches = [];
      for (let i = 0; i < followinglist.length; i += 50) {
        batches.push({ bundled: followinglist.slice(i, i + 50) });
      }
      let networkData = [];
      for (let b of batches) {
        let d = await getSubData(
          [
            {
              kinds: [3, 10000],
              authors: b.bundled,
            },
          ],
          100,
          undefined,
          undefined,
          undefined,
          true
        );
        networkData.push(d);
      }
      networkData = networkData.map((_) => _.data).flat();
      if (networkData.length === 0) return;
      let network = structuredClone(networkData);
      network = followings?.followings.map((_) => {
        return {
          pubkey: _,
          followings:
            [
              ...new Set(
                network
                  .find((__) => __.kind === 3 && __.pubkey === _)
                  ?.tags.filter((tag) => tag[0] === "p")
                  .map((tag) => tag[1])
              ),
            ] || [],
          muted:
            [
              ...new Set(
                network
                  .find((__) => __.kind === 10000 && __.pubkey === _)
                  ?.tags.filter((tag) => tag[0] === "p")
                  .map((tag) => tag[1])
              ),
            ] || [],
        };
      });
      saveWotlist(network, userKeys.pub);

      let allPubkeys = [...new Set(network.map((_) => _.followings).flat())];
      let wotPubkeys = allPubkeys
        .map((_) => {
          return { pubkey: _, ...getWOTScoreForPubkeyLegacy(_, true, 5) };
        })
        .sort((a, b) => b.score - a.score)
        .filter((_) => _.status)
        .map((_) => _.pubkey)
        .slice(0, 200);
      localStorage.setItem(
        `network_${userKeys.pub}`,
        JSON.stringify({
          last_updated: Math.floor(Date.now() / 1000),
          wotPubkeys,
        })
      );
    };
    const buildBackupWOTList = async () => {
      let prevData = localStorage.getItem(`backup_wot`);
      prevData = prevData
        ? JSON.parse(prevData)
        : {
            last_updated: undefined,
          };
      const backupFollowings = await getSubData(
        [
          {
            kinds: [3],
            authors: [process.env.NEXT_PUBLIC_YAKI_PUBKEY],
            until: prevData.last_updated,
          },
        ],
        800,
        undefined,
        undefined,
        undefined,
        true
      );
      if (backupFollowings.data.length === 0) return;
      let followinglist = backupFollowings.data[0].tags
        .filter((_) => _[0] === "p")
        .map((_) => _[1]);
      followinglist = followinglist.slice(0, 200);
      let batches = [];

      for (let i = 0; i < followinglist.length; i += 50) {
        batches.push({ bundled: followinglist.slice(i, i + 50) });
      }

      let networkData = [];
      for (let b of batches) {
        let d = await getSubData(
          [
            {
              kinds: [3],
              authors: b.bundled,
            },
          ],
          100,
          undefined,
          undefined,
          undefined,
          true
        );
        networkData.push(d);
      }
      networkData = networkData.map((_) => _.data).flat();
      if (networkData.length === 0) return;
      let network = structuredClone(networkData);
      network = followinglist.map((_) => {
        return {
          pubkey: _,
          followings:
            [
              ...new Set(
                network
                  .find((__) => __.kind === 3 && __.pubkey === _)
                  ?.tags.filter((tag) => tag[0] === "p")
                  .map((tag) => tag[1])
              ),
            ] || [],
          muted: [],
        };
      });

      let allPubkeys = [...new Set(network.map((_) => _.followings).flat())];

      let wotPubkeys = allPubkeys
        .map((_) => {
          return { pubkey: _, ...getWOTScoreForPubkeyLegacy(_, true, 5) };
        })
        .sort((a, b) => b.score - a.score)
        .filter((_) => _.status)
        .map((_) => _.pubkey)
        .slice(0, 200);
      localStorage.setItem(
        `backup_wot`,
        JSON.stringify({
          last_updated: backupFollowings.data[0].created_at + 1,
          wotPubkeys,
        })
      );
    };
    if (followings && followings?.followings?.length > 0) {
      saveRelaysListsForUsers(followings?.followings);
      saveInboxRelaysListsForUsers(followings?.followings);
      saveFavRelaysListsForUsers(followings?.followings);
    }
    if (followings && followings?.followings?.length >= 5) {
      buildWOTList();
    } else if (followings && followings?.followings?.length < 5) {
      buildBackupWOTList();
    }
  }, [followings]);

  const decryptDMS = async (inbox, userKeys) => {
    let authors = [];
    let until = Math.floor(Date.now() / 1000);
    let tempInbox = await Promise.all(
      inbox.map(async (event) => {
        if (event.kind === 4 && !userKeys.bunker) {
          let decryptedMessage = "";
          authors = [...new Set([...authors, event.pubkey])];
          let peer =
            event.pubkey === userKeys.pub
              ? event.tags.find((tag) => tag[0] === "p" && tag[1])[1]
              : "";
          let reply = event.tags.find((tag) => tag[0] === "e");
          let replyID = reply ? reply[1] : "";

          decryptedMessage = await decrypt04(event, userKeys);
          let tempEvent = {
            id: event.id,
            created_at: event.created_at,
            content: decryptedMessage,
            pubkey: event.pubkey,
            kind: event.kind,
            peer,
            replyID,
          };
          until = until > event.created_at ? event.created_at : until;
          return tempEvent;
        }

        if (
          event.kind === 1059 &&
          (userKeys.sec || window?.nostr?.nip44) &&
          !userKeys.bunker
        ) {
          try {
            let unwrappedEvent = await unwrapGiftWrap(event, userKeys);

            if (unwrappedEvent && unwrappedEvent.kind === 14) {
              authors = [...new Set([...authors, unwrappedEvent.pubkey])];
              let peer =
                unwrappedEvent.pubkey === userKeys.pub
                  ? unwrappedEvent.tags.find((tag) => tag[0] === "p")[1]
                  : "";
              let reply = unwrappedEvent.tags.find((tag) => tag[0] === "e");
              let replyID = reply ? reply[1] : "";
              let tempEvent = {
                id: unwrappedEvent.id,
                created_at: unwrappedEvent.created_at,
                content: unwrappedEvent.content,
                pubkey: unwrappedEvent.pubkey,
                kind: unwrappedEvent.kind,
                peer,
                replyID,
              };
              until = until > event.created_at ? event.created_at : until;
              return tempEvent;
            }
          } catch (err) {
            console.log(err);
          }
        }
      })
    );
    await saveUsers(authors);
    return { inbox: tempInbox.filter((_) => _), authors, until: until - 1 };
  };

  const getTrendingProfiles = async () => {
    try {
      let users = await getTrendingUsers24h();
      dispatch(setTrendingUsers(users));
    } catch (err) {
      console.log(err);
    }
  };

  return null;
}
