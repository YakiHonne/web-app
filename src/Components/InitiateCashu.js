import React, { useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { Wallet } from "@cashu/cashu-ts";
import { decrypt44 } from "@/Helpers/Encryptions";
import { ndkInstance } from "@/Helpers/NDKInstance";
import {
  getCashuHistory,
  getCashuTokens,
  getCashuWallet,
  getNutZaps,
  saveCashuHistory,
  saveCashuTokens,
  saveCashuWallet,
  saveNutZaps,
  saveUsers,
} from "@/Helpers/DB";
import { useDispatch } from "react-redux";
import {
  setUserCashuHistory,
  setUserCashuTokens,
  setUserCashuWallet,
  setUserNutZaps,
} from "@/Store/Slides/UserData";
import { useLiveQuery } from "dexie-react-hooks";
import { getSubData } from "@/Helpers/Controlers";

export default function InitiateCashu() {
  const dispatch = useDispatch();
  const userKeys = useSelector((state) => state.userKeys);
  const cashuWallet = useLiveQuery(
    async () =>
      userKeys
        ? await getCashuWallet(userKeys.pub)
        : { last_timestamp: undefined, wallet: false },
    [userKeys],
  ) || {
    last_timestamp: undefined,
    wallet: false,
  };
  const cashuTokens = useLiveQuery(
    async () =>
      userKeys
        ? await getCashuTokens(userKeys.pub)
        : { last_timestamp: undefined, tokens: [] },
    [userKeys],
  ) || { last_timestamp: undefined, tokens: [] };
  const cashuHistory = useLiveQuery(
    async () =>
      userKeys
        ? await getCashuHistory(userKeys.pub)
        : {
            last_timestamp: undefined,
            history: [],
          },
    [userKeys],
  ) || {
    last_timestamp: undefined,
    history: [],
  };
  const cashuNutZaps = useLiveQuery(
    async () =>
      userKeys
        ? await getNutZaps(userKeys.pub)
        : { lastTimestamp: undefined, zaps: [] },
    [userKeys],
  ) || { lastTimestamp: undefined, zaps: [] };
  const previousCashuWallet = useRef({
    last_timestamp: undefined,
    wallet: false,
  });
  const previousCashuTokens = useRef({ last_timestamp: undefined, tokens: [] });
  const previousCashuHistory = useRef({
    last_timestamp: undefined,
    history: [],
  });
  const previousCashuNutZaps = useRef({ lastTimestamp: undefined, zaps: [] });

  useEffect(() => {
    if (
      JSON.stringify(previousCashuWallet.current) !==
      JSON.stringify(cashuWallet)
    ) {
      previousCashuWallet.current = cashuWallet;
      dispatch(setUserCashuWallet(cashuWallet));
    }
    if (
      JSON.stringify(previousCashuTokens.current) !==
      JSON.stringify(cashuTokens)
    ) {
      previousCashuTokens.current = cashuTokens;
      dispatch(setUserCashuTokens(cashuTokens));
    }
    if (
      JSON.stringify(previousCashuHistory.current) !==
      JSON.stringify(cashuHistory)
    ) {
      previousCashuHistory.current = cashuHistory;
      dispatch(setUserCashuHistory(cashuHistory));
    }
    if (
      JSON.stringify(previousCashuNutZaps.current) !==
      JSON.stringify(cashuNutZaps)
    ) {
      previousCashuNutZaps.current = cashuNutZaps;
      dispatch(setUserNutZaps(cashuNutZaps));
    }
  }, [cashuWallet, cashuTokens, cashuHistory, cashuNutZaps]);

  //   useEffect(() => {
  //     const init = async () => {
  //       const mintUrl = "https://mint.minibits.cash/Bitcoin";
  //       const wallet1 = new Wallet(mintUrl); // unit is 'sat'
  //       await wallet1.loadMint(); // wallet is now ready to use

  //       // Persist these in your app
  //       const keychainCache = wallet1.keyChain.cache; // KeyChainCache
  //       const mintInfoCache = wallet1.getMintInfo().cache; // GetInfoResponse

  //       console.log(keychainCache);
  //       console.log(mintInfoCache);

  //       // Advanced: With cached mint data (avoids network calls on startup)
  //       const wallet2 = new Wallet(keychainCache.mintUrl, {
  //         unit: keychainCache.unit,
  //       });
  //       wallet2.loadMintFromCache(mintInfoCache, keychainCache);

  //       //   const wallet = new Wallet("https://mint.minibits.cash/Bitcoin", {
  //       //     // keysetId:
  //       //     //   "1677eb314fc5618af396c1523344138b8da1554c0d8c716d72cbbb4b89e366a4",
  //       //   }); // unit is 'sat'
  //       //   await wallet.loadMint(); // wallet is now ready to use

  //       console.log(wallet1);
  //       console.log(wallet2);
  //       //   console.log(await wallet.getBalance());
  //     };
  //     if (userKeys) {
  //       init();
  //     }
  //   }, [userKeys]);

  useEffect(() => {
    let decryptQueue = [];
    let isProcessing = false;
    let subscription = null;
    const processQueue = async () => {
      if (isProcessing || decryptQueue.length === 0) return;

      isProcessing = true;
      const event = decryptQueue.shift();

      try {
        let result = await decrypt44(userKeys, userKeys.pub, event.content);
        result = {
          id: event.id,
          content: JSON.parse(result),
          created_at: event.created_at,
          pubkey: event.pubkey,
          kind: event.kind,
          tags: event.tags,
        };

        if (result.kind === 17375) {
          saveCashuWallet(result, userKeys.pub);
        }
        if (result.kind === 7375) {
          saveCashuTokens(result, userKeys.pub);
        }
        if (result.kind === 7376) {
          saveCashuHistory(result, userKeys.pub);
        }
      } finally {
        isProcessing = false;
        processQueue();
      }
    };

    const queueDecrypt = (event) => {
      decryptQueue.push(event);
      processQueue();
    };
    const fetchNewerNutZaps = async (lastTimestamp) => {
      const events = await getSubData(
        [
          {
            kinds: [9321],
            "#p": [userKeys.pub],
            since: lastTimestamp ? lastTimestamp + 1 : lastTimestamp,
          },
        ],
        500,
        undefined,
        undefined,
        undefined,
        true,
      );
      if (events.data.length > 0) {
        console.log(events.pubkeys);
        saveUsers(events.pubkeys);
        saveNutZaps(events.data, userKeys.pub);
      }
    };
    const fetchData = async () => {
      let [tokens, history, wallet, nutzap] = await Promise.all([
        getCashuTokens(userKeys.pub),
        getCashuHistory(userKeys.pub),
        getCashuWallet(userKeys.pub),
        getNutZaps(userKeys.pub),
      ]);

      fetchNewerNutZaps(nutzap.last_timestamp);

      subscription = ndkInstance.subscribe([
        {
          kinds: [17375],
          authors: [userKeys.pub],
          since: wallet.last_timestamp
            ? wallet.last_timestamp + 1
            : wallet.last_timestamp,
        },
        {
          kinds: [7375],
          authors: [userKeys.pub],
          since: tokens.last_timestamp
            ? tokens.last_timestamp + 1
            : tokens.last_timestamp,
        },
        {
          kinds: [7376],
          authors: [userKeys.pub],
          since: history.last_timestamp
            ? history.last_timestamp + 1
            : history.last_timestamp,
        },
        {
          kinds: [9321],
          "#p": [userKeys.pub],
          since: Math.floor(Date.now() / 1000),
        },
      ]);

      subscription.on("event", async (event) => {
        if (event.kind !== 9321) queueDecrypt(event);
        else {
          saveUsers([event.pubkey]);
          saveNutZaps([event.rawEvent()], userKeys.pub);
        }
      });
    };

    if (userKeys) {
      fetchData();
    }
    return () => {
      subscription?.stop();
    };
  }, [userKeys]);
  return null;
}
