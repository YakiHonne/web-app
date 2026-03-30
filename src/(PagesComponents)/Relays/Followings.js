import React, { useEffect } from "react";
import RelayPreview from "./RelayPreview/RelayPreview";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import Link from "next/link";
import Icon from "@/Components/Icon";

export default function Followings({
  relays,
  relaysBatch,
  setRelaysBatch,
  favoredList = false,
}) {
  const { t } = useTranslation();
  const userKeys = useSelector((state) => state.userKeys);
  const userFollowings = useSelector((state) => state.userFollowings);

  useEffect(() => {
    if (relaysBatch.length === 0 && relays.length > 0) {
      setRelaysBatch(relays.slice(0, 8));
    }
  }, [relaysBatch, relays]);

  const handleRelayClick = () => {
    let newRelays = relays.slice(relaysBatch.length, relaysBatch.length + 8);
    setRelaysBatch((prev) => [...prev, ...newRelays]);
  };

  if (!userKeys) {
    return (
      <div
        className="fit-container fx-centered fx-col box-pad-v fx-col"
        style={{ height: "60vh" }}
      >
        <Icon name="orbit" size={58} />
        <div className="fx-centered fx-col box-pad-v-m">
          <h4>{t("AADL1TO")}</h4>
          <p className="gray-c p-centered" style={{ maxWidth: "300px" }}>
            {t("AtkCver")}
          </p>
        </div>
        <Link href={"/login"}>
          <button className="btn btn-normal">{t("AmOtzoL")}</button>
        </Link>
      </div>
    );
  }
  return (
    <div className="fit-container fx-centered fx-col box-pad-v">
      {userFollowings && userFollowings?.length < 5 && (
        <div className="fit-container ">
          <div className="fit-container fx-centered fx-start-h fx-start-v box-pad-h box-marg-s">
            <div>
              <Icon name="eye-opened" size={24} />
            </div>
            <div>
              <p>{t("AZKoEWL")}</p>
              <p className="gray-c">{t("AstvJYT")}</p>
            </div>
          </div>
        </div>
      )}
      {relaysBatch.map((relay) => {
        return (
          <RelayPreview
            url={relay.url}
            key={relay.url}
            favoredList={favoredList ? relay.pubkeys : []}
          />
        );
      })}
      {relaysBatch.length < relays.length && (
        <button className="btn btn-normal" onClick={handleRelayClick}>
          {t("AxJRrkn")}
        </button>
      )}
    </div>
  );
}
