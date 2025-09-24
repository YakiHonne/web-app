import { useState, useEffect } from "react";
import { getFollowingsFavRelays } from "@/Helpers/DB";
import { useLiveQuery } from "dexie-react-hooks";

const useFollowingsFavRelays = () => {
  const [followingsFavRelays, setFollowingsFavRelays] = useState([]);
  const followingsFavRelaysList =
    useLiveQuery(async () => {
      let relays = await getFollowingsFavRelays();
      return relays;
    }, []) || [];

  useEffect(() => {
    if (!(followingsFavRelaysList.length > 0)) return;
    let allRelays = [
      ...new Set(followingsFavRelaysList.map((relay) => relay.relays).flat()),
    ];
    let relaysStats = allRelays.map((relay) => {
      return {
        url: relay,
        pubkeys: followingsFavRelaysList.filter((user) => user.relays.includes(relay)).map((user) => user.pubkey)
      }
    }).sort((a, b) => b.pubkeys.length - a.pubkeys.length)
    setFollowingsFavRelays(relaysStats);
  }, [followingsFavRelaysList]);

  return { followingsFavRelays };
};

export default useFollowingsFavRelays;
