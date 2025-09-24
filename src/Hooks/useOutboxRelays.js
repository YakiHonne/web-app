import { saveUsers } from "@/Helpers/DB";
import { useState, useEffect } from "react";
import { useSelector } from "react-redux";

const useOutboxRelays = () => {
  const [outboxRelays, setOutboxRelays] = useState([]);
  const userFollowingsRelays = useSelector(state => state.userFollowingsRelays)

  useEffect(() => {
    if (!(userFollowingsRelays.length > 0)) return;
    let allRelays = [
      ...new Set(userFollowingsRelays.map((relay) => relay.relays.map(_ => _.url)).flat().map(_ => _.endsWith("/") ? _ : _ + "/")),
    ];
    let relaysStats = allRelays.map((relay) => {
      return {
        url: relay,
        pubkeys: userFollowingsRelays.filter((user) => user.relays.find( _ => _.url === relay)).map((user) => user.pubkey)
      }
    }).sort((a, b) => b.pubkeys.length - a.pubkeys.length)
    setOutboxRelays(relaysStats);
    saveUsers([...new Set(relaysStats.map(_ => _.pubkeys).flat())])
  }, [userFollowingsRelays]);

  return { outboxRelays };
};

export default useOutboxRelays;
