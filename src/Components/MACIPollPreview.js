import { MaciClient } from "@dorafactory/maci-sdk";
import React, { useEffect, useState } from "react";
import { parsedMaciPoll } from "@/Helpers/Encryptions";
import MACIPollsComp from "@/Components/SmartWidget/MACIPollsComp";
import LinkPreview from "@/Components/LinkPreview";

export default function MACIPollPreview({ url }) {
  const [isLoading, setIsLoading] = useState(true);
  const [round, setRound] = useState(false);

  useEffect(() => {
    if (window.keplr) getRound();
  }, []);

  const getRound = async () => {
    try {
      let roundId = url
        .replace("https://vota.dorafactory.org/round/", "")
        .replace("https://vota-test.dorafactory.org/round/", "");

      if (!roundId.startsWith("dora")) return;
      setIsLoading(true);
      const client = new MaciClient({
        network: process.env.REACT_APP_NETWORK,
      });
      let poll = await client.getRoundInfo({ contractAddress: roundId });
      if (poll) {
        let parsedPoll = parsedMaciPoll(poll);
        setRound(parsedPoll);
      }
      setIsLoading(false);
    } catch (err) {
      console.log(err);
      setIsLoading(false);
    }
  };

  if (!window.keplr) return <LinkPreview url={url} />;
  if (isLoading)
    return (
      <div
        className={`fit-container sc-s-18 fx-centered fx-start-h fx-stretch skeleton-container`}
        style={{ height: "100px" }}
      ></div>
    );
  if (!round && !isLoading) return <LinkPreview url={url} />;
  return (
    <div>
      <MACIPollsComp poll={round} url={url} />
    </div>
  );
}
