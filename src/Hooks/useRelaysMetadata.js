import { saveRelayMetadata } from "@/Helpers/Controlers";
import { saveUsers } from "@/Helpers/DB";
import { getEmptyRelaysData } from "@/Helpers/Encryptions";
import { getRelayMetadata } from "@/Helpers/utils";
import { useEffect, useState } from "react";

export default function useRelaysMetadata(url) {
  const [relayMetadata, setRelayMetadata] = useState(getEmptyRelaysData(url));
  useEffect(() => {
    const fetchData = async () => {
      try {
        let data = getRelayMetadata(url);
        if (!data) {
          data = await saveRelayMetadata([url]);
          if (data && data.length > 0) {
            data = data[0];
          } else {
            data = getEmptyRelaysData(url);
          }
        }
        setRelayMetadata(data);
        if (data.pubkey) saveUsers([data.pubkey]);
      } catch (err) {
        console.log(err);
      }
    };
    fetchData();
  }, [url]);

  return { relayMetadata };
}
