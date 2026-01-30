import { useEffect, useState } from "react";
import axios from "axios";
import {
  getMintFromCache,
  setMintFromCache,
  getMintCustom,
  setMintCustom,
} from "@/Helpers/utils/mintsCache";

export default function useMints() {
  const [mintList, setMintList] = useState([]);
  const [mintUrlsList, setMintUrlsList] = useState([]);
  useEffect(() => {
    let fetchMints = async () => {
      try {
        let data = await axios.get(
          "https://cache-v2.yakihonne.com/api/v1/mints"
        );
        let recommendedMints = data.data;
        setMintList(recommendedMints);
        setMintUrlsList(recommendedMints.map((_) => _.url));
        setMintFromCache(recommendedMints);
      } catch (err) {
        console.log(err);
      }
    };
    let cacheList = getMintFromCache();
    if (cacheList.length > 0) {
      setMintList(cacheList);
      setMintUrlsList(cacheList.map((_) => _.url));
    } else {
      fetchMints();
    }
  }, []);

  const getCustomMints = async (mintsUrls, cb) => {
    let cacheList = getMintCustom();
    let urls = Array.from(mintsUrls);

    let foundMints = cacheList.filter((_) => {
      if (mintsUrls.includes(_.url)) {
        urls.splice(urls.indexOf(_.url), 1);
        return true;
      }
      return false;
    });
    if (urls.length === 0) {
      if (cb) cb((prev) => [...prev, ...foundMints]);
      return foundMints;
    } else {
      try {
        let data = await Promise.allSettled(
          urls.map((url) => axios.get(`${url}/v1/info`))
        );
        let mints = data
          .filter((_) => _.status === "fulfilled")
          .map((_) => ({
            data: _.value.data,
            url: _.value.config.url.replace("/v1/info", ""),
          }));
        if (cb) cb((prev) => [...prev, ...foundMints, ...mints]);
        setMintCustom([...cacheList, ...foundMints, ...mints]);
        return [...foundMints, ...mints];
      } catch (err) {
        if (cb) cb((prev) => [...prev, ...foundMints]);
        setMintCustom([...cacheList, ...foundMints]);
        return [...foundMints];
      }
    }
  };

  return { mintList, mintUrlsList, getCustomMints };
}
