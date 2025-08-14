'use client';
import React, { useEffect, useState } from "react";
import LoadingDots from "@/Components/LoadingDots";
import { useTranslation } from "react-i18next";
import { MaciClient } from "@dorafactory/maci-sdk";
import MACIPollsComp from "@/Components/SmartWidget/MACIPollsComp";
import { parsedMaciPoll } from "@/Helpers/Encryptions";

export default function BrowseMaciPolls({ setPollAddr, exit }) {
  const { t } = useTranslation();
  const [rounds, setRounds] = useState([]);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [cursor, setCursor] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const status = {
    tallying: (
      <div
        className="sticker sticker-normal sticker-gray-black"
        style={{ minWidth: "max-content" }}
      >
        {t("Aw1EitS")}
      </div>
    ),
    created: (
      <div
        className="sticker sticker-normal sticker-c1 "
        style={{ minWidth: "max-content" }}
      >
        {t("ANBowSq")}
      </div>
    ),
    ended: (
      <div
        className="sticker sticker-normal sticker-red"
        style={{ minWidth: "max-content" }}
      >
        {t("Azctwg8")}
      </div>
    ),
    closed: (
      <div
        className="sticker sticker-normal sticker-red"
        style={{ minWidth: "max-content" }}
      >
        {t("AVhtVJY")}
      </div>
    ),
    ongoing: (
      <div
        className="sticker sticker-normal sticker-green"
        style={{ minWidth: "max-content" }}
      >
        {t("A7noclE")}
      </div>
    ),
  };
  useEffect(() => {
    getRounds();
  }, [cursor]);

  const getRounds = async () => {
    try {
      setIsLoading(true);
      const client = new MaciClient({
        network: process.env.NEXT_PUBLIC_NETWORK,
      });

      let poll = await client.getRounds(cursor, 10);
      setHasNextPage(poll.data.rounds.pageInfo);
      setRounds((prev) => [
        ...prev,
        ...poll.data.rounds.edges.map((_) => parsedMaciPoll(_.node)),
      ]);
      setIsLoading(false);
    } catch (err) {
      console.log(err);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      if (isLoading) return;
      let container = document.querySelector(".overlay-container");
      if (!container) return;
      if (
        container.scrollHeight - container.scrollTop - 60 >
        document.documentElement.offsetHeight
      ) {
        return;
      }
      if (hasNextPage && hasNextPage?.hasNextPage)
        setCursor(hasNextPage.endCursor);
    };
    document
      .querySelector(".overlay-container")
      ?.addEventListener("scroll", handleScroll);
    return () =>
      document
        .querySelector(".overlay-container")
        ?.removeEventListener("scroll", handleScroll);
  }, [isLoading]);

  return (
    <div
      className="fixed-container fx-centered fx-start-v"
      onClick={(e) => {
        e.stopPropagation();
        exit();
      }}
    >
      <div
        className="fit-height overlay-container fx-centered fx-start-v fx-start-h fx-col bg-sp"
        style={{
          width: "min(100%,700px)",
          overflow: "scroll",
          border: "1px solid var(--pale-gray)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="fit-container fx-scattered sticky"
          style={{ padding: "1rem" }}
        >
          <h3>{t("AfVdphT")}</h3>
          <div className="close" style={{ position: "static" }} onClick={exit}>
            <div></div>
          </div>
        </div>
        <div className="fit-container fx-col fx-centered fx-start-h fx-start-v box-marg-s box-pad-h">
          {rounds.map((round) => {
            return (
              <div
                className="fit-container box-pad-h-m box-pad-v sc-s-18 fx-centered fx-col"
                key={round.id}
              >
                <div className="fit-container fx-scattered fx-start-v">
                  <div className="fx-centered fx-col fx-start-v">
                    {status[round.status.toLowerCase()]}
                    <h4>{round.roundTitle}</h4>
                  </div>
                  <div className="fx-centered">
                    <div
                      className="round-icon-small round-icon-tooltip"
                      data-tooltip={t("Afcj438")}
                      onClick={() =>
                        setPollAddr(
                          `https://vota${
                            process.env.NEXT_PUBLIC_NETWORK === "testnet"
                              ? "-test"
                              : ""
                          }.dorafactory.org/round/${round.id}`
                        )
                      }
                    >
                      <div className="plus-sign"></div>
                    </div>
                  </div>
                </div>
                <MACIPollsComp key={round.id} header={false} poll={round} />
              </div>
            );
          })}
          {isLoading && (
            <div
              className="fit-container fx-centered"
              style={{ height: "30vh" }}
            >
              <p className="gray-c">{t("AKvHyxG")}</p>
              <LoadingDots />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
