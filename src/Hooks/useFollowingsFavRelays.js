import { useState, useEffect } from "react";
import { getFollowingsFavRelays } from "@/Helpers/DB";
import { useLiveQuery } from "dexie-react-hooks";
import { useSelector } from "react-redux";
import { getBackupWOTList } from "@/Helpers/Encryptions";
import { getSubData } from "@/Helpers/Controlers";

const useFollowingsFavRelays = () => {
  const [followingsFavRelays, setFollowingsFavRelays] = useState([]);
  const userFollowings = useSelector((state) => state.userFollowings);
  const followingsFavRelaysList =
    useLiveQuery(async () => {
      let relays = await getFollowingsFavRelays();
      return relays;
    }, []) || [];

  useEffect(() => {
    if (!(followingsFavRelaysList.length > 0 && userFollowings.length > 5)) {
      useBackupWot();
      return;
    }
    useFollowingsList();
  }, [followingsFavRelaysList, userFollowings]);

  const useFollowingsList = () => {
    let onlyFavRelays = followingsFavRelaysList.filter((relay) =>
      userFollowings.includes(relay.pubkey)
    );
    if (onlyFavRelays.length === 0) return;
    let allRelays = [
      ...new Set(onlyFavRelays.map((relay) => relay.relays).flat()),
    ];
    let relaysStats = allRelays
      .map((relay) => {
        return {
          url: relay,
          pubkeys: onlyFavRelays
            .filter((user) => user.relays.includes(relay))
            .map((user) => user.pubkey),
        };
      })
      .sort((a, b) => b.pubkeys.length - a.pubkeys.length);
    setFollowingsFavRelays(relaysStats);
  };

  const useBackupWot = async () => {
    let pubkeys = getBackupWOTList();
    if (pubkeys.length === 0) setFollowingsFavRelays([]);
    let favLists = await getSubData(
      [{ kinds: [10012], authors: pubkeys.splice(0, 100) }],
      200
    );
    if (favLists.data.length === 0) setFollowingsFavRelays([]);
    let userFavRelays = favLists.data.map((list) => {
      return {
        pubkey: list.pubkey,
        relays: list.tags.filter((_) => _[0] === "relay").map((_) => _[1]),
      };
    });
    let relays = userFavRelays.map((_) => _.relays).flat();
    setFollowingsFavRelays(
      [...new Set(relays)]
        .map((relay) => {
          return {
            url: relay,
            pubkeys: userFavRelays
              .filter((user) => user.relays.includes(relay))
              .map((user) => user.pubkey),
          };
        })
        .sort((a, b) => b.pubkeys.length - a.pubkeys.length)
    );
  };
  // console.log(followingsFavRelays)
  return { followingsFavRelays };
};

export default useFollowingsFavRelays;
