import { getSubData } from "@/Helpers/Controlers";
import { getParsedPacksEvent } from "@/Helpers/Encryptions";
import React, { useEffect, useState } from "react";

export default function useRecommendedPacks() {
  const [recommendedStarterPacks, setRecommendedStarterPacks] = useState([]);
  const packsIds = [
    "streamersFollowPackh8Kz3P2q",
    "szxs0ra5tqzu",
    "6715ef40-2d95-4f86-8277-bd4efb0fa56b",
    "tp9hnqpnccco",
    "b2c75381-0335-48bd-a579-553df86903af",
    "b56c8b24-e33b-4c32-8ca0-63a1bb7577b4",
    "7g0zvf7gv59j",
    "ardt92mr1e2i",
    "m36yukpd5kts",
    "y156932o9xfh",
    "cioc58duuftq",
    "cld28teq2js4",
    "xv7j4mgavera",
    "h308e7fzkjff",
  ];
  useEffect(() => {
    getSubData([{ kinds: [39089], "#d": packsIds }])
      .then((data) => {
        let parsedData = data.data.map((_) => getParsedPacksEvent(_));
        setRecommendedStarterPacks(parsedData);
      })
      .catch((err) => {
        console.log(err);
      });
  }, []);
  return { recommendedStarterPacks };
}
