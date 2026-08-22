import { getSubData } from "@/Helpers/Controlers";
import { saveUsers } from "@/Helpers/DB";
import React, { useEffect, useState } from "react";

export default function useCreatorSubscription({ pubkey }) {
  const [isSubChekingLoading, setIsSubCheckingLoading] = useState(true);
  const [providers, setProviders] = useState([]);
  useEffect(() => {
    fetchData();
  }, []);
  const fetchData = async () => {
    let data = await getSubData(
      [{ kinds: [30164], authors: [pubkey] }],
      200,
      undefined,
      undefined,
      undefined,
      true,
    );
    let providersPubkeys = [];
    let providers = data.data
      .filter((_) => _.tags.find((_) => _[0] === "gateway"))
      .filter((_) => _.tags.find((_) => _[0] === "method"))
      .map((_) => {
        let url = _.tags.find((_) => _[0] === "u")?.[1];
        let pubkey = _.tags.find((_) => _[0] === "gateway")?.[1];
        providersPubkeys.push(pubkey);
        return { url, pubkey };
      })
      .filter((el, index, arr) => {
        if (arr.findIndex((_) => _.pubkey === el.pubkey) === index) return true;
        return false;
      });
    console.log(data.data);
    saveUsers(providersPubkeys);
    setProviders(providers);
    setIsSubCheckingLoading(false);
  };
  return { isSubChekingLoading, providers };
}
