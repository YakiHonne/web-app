import { useState, useEffect, useMemo } from "react";
import { getSubData } from "@/Helpers/Controlers";
import { getEmptyRelaysStats } from "@/Helpers/Encryptions";
import { saveRelaysStats } from "@/Helpers/DB";
import getCountryFlag from "@/Helpers/countryFlags";
import { useSelector } from "react-redux";

const getMonitorData = (event, since, oldVersion) => {
  if (!event)
    return {
      countryCode: "",
      isAuthRequired: false,
      isPaymentRequired: false,
      rttOpen: null,
      since: undefined,
    };

  let countryCode = event.tags.find(
    (tag) => tag[0] === "l" && tag.length > 2 && tag[2] === "countryCode"
  );
  let isAuthRequired = event.tags.find(
    (tag) => tag[0] === "R" && ["auth", "!auth"].includes(tag[1])
  );
  let isPaymentRequired = event.tags.find(
    (tag) => tag[0] === "R" && ["payment", "!payment"].includes(tag[1])
  );
  let rttOpen = event.tags.find((tag) => tag[0] === "rtt-open");

  countryCode = countryCode ? countryCode[1] : "";
  let countryFlag = countryCode ? getCountryFlag(countryCode) : "";
  isAuthRequired = isAuthRequired
    ? isAuthRequired[1] === "auth"
      ? true
      : false
    : false;
  isPaymentRequired = isPaymentRequired
    ? isPaymentRequired[1] === "payment"
      ? true
      : false
    : false;
  rttOpen = rttOpen ? parseInt(rttOpen[1]) : null;

  return {
    countryCode: countryCode ? countryCode : oldVersion.countryCode,
    countryFlag: countryFlag ? countryFlag : oldVersion.countryFlag,
    isAuthRequired,
    isPaymentRequired,
    rttOpen,
    since,
  };
};

const getRelaysFullStats = (statsList, url, peopleList) => {
  if (!statsList || statsList.length === 0) return getEmptyRelaysStats(url);
  if (!url) return getEmptyRelaysStats(url);

  let _monitor = statsList.find((_) => _.url === url);

  return {
    url,
    followings: {
      pubkeys: peopleList
        .filter((_) => _.relays.find((__) => __.url === url))
        .map((_) => _.pubkey),
    },
    monitor: {
      ..._monitor,
    },
  };
};

const useRelaysStats = (_url) => {
  let url = _url.endsWith("/") ? _url : _url + "/";
  const [isLoading, setIsLoading] = useState(true);
  const relaysStats = useSelector((state) => state.relaysStats);
  const userFollowingsRelays = useSelector(
    (state) => state.userFollowingsRelays
  );
  const relayStats = useMemo(() => {
    return getRelaysFullStats(relaysStats, url, userFollowingsRelays || []);
  }, [relaysStats, userFollowingsRelays]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        let _monitor = relaysStats.find((_) => _.url === url);
        let monitorLastUpdated = _monitor?.since || undefined;

        let _30166 = await getSubData(
          [
            {
              kinds: [30166],
              authors: [
                "9ba0ce3dcc28c26da0d0d87fa460c78b602a180b61eb70b62aba04505c6331f4",
                "9bbbb845e5b6c831c29789900769843ab43bb5047abe697870cb50b6fc9bf923",
                "9bb7cd94d7b688a4070205d9fb5e9cca6bd781fe7cabe780e19fdd23a036e0a1",
                "abcde937081142db0d50d29bf92792d4ee9b3d79a83c483453171a6004711832",
              ],
              "#d": [url, url + "/", url + "/%7C"],
              since: monitorLastUpdated,
            },
          ],
          50
        );

        _30166 = _30166.data;
        monitorLastUpdated =
          _30166.length > 0
            ? _30166[_30166.length - 1].created_at + 1
            : monitorLastUpdated;
        let monitor =
          _30166.length > 0
            ? getMonitorData(
                _30166.length > 1
                  ? _30166.sort((a, b) => b.tags.length - a.tags.length)[0]
                  : _30166[0],
                monitorLastUpdated,
                _monitor
              )
            : _monitor;

        saveRelaysStats(url, { url, ...monitor });
        setIsLoading(false);
      } catch (err) {
        console.log(err);
      } finally {
        setIsLoading(false);
      }
    };

    if (url) fetchData();
  }, [url]);

  return { relayStats, isLoading };
};

export default useRelaysStats;