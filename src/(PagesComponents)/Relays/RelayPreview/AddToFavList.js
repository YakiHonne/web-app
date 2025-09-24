import { InitEvent } from "@/Helpers/Controlers";
import { setToPublish } from "@/Store/Slides/Publishers";
import React, { useMemo, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";
import LoadingDots from "@/Components/LoadingDots";

export default function AddToFavList({ url }) {
    let relay = url.endsWith("/") ? url : url + "/";
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const userKeys = useSelector((state) => state.userKeys);
  const userFavRelays = useSelector((state) => state.userFavRelays);
  const [isLoading, setIsLoading] = useState(false);
  const relaysList = useMemo(() => {
    if (userFavRelays) {
      return (
        userFavRelays?.tags
          ?.filter((_) => _[0] === "relay")
          .map((_) => (_[1].endsWith("/") ? _[1] : _[1] + "/")) || []
      );
    }
    return [];
  }, [userFavRelays]);
  const isAdded = useMemo(() => {
      return relaysList.includes(relay);
    }, [relaysList]);
    
  const updateRelaysFeed = async (e) => {
    e?.stopPropagation();
    if (isLoading) return;
    setIsLoading(true);
    let aTags = userFavRelays.tags;
    let tags = isAdded
      ? aTags.filter((_) => (_[1].endsWith("/") ? _[1] : _[1] + "/") !== relay)
      : [...aTags, ["relay", relay]];
    let event = {
      kind: 10012,
      content: "",
      tags: tags,
    };
    let eventInitEx = await InitEvent(
      event.kind,
      event.content,
      event.tags,
      undefined
    );
    if (!eventInitEx) {
      setIsLoading(false);
      return;
    }
    dispatch(
      setToPublish({
        eventInitEx,
        allRelays: [],
      })
    );
    setIsLoading(false);
  };

  return (
    <>
      {userKeys && !isAdded && (
        <button
          className="fx-centered btn btn-normal btn-small"
          disabled={isLoading}
          onClick={updateRelaysFeed}
        >
          {isLoading ? (
            <LoadingDots />
          ) : (
            <>
              <div className="plus-sign"></div>
              {t("AZaUNnH")}
            </>
          )}
        </button>
      )}
      {userKeys && isAdded && (
        <button
          className="fx-centered btn btn-red btn-small"
          disabled={isLoading}
          onClick={updateRelaysFeed}
        >
          {isLoading ? (
            <LoadingDots />
          ) : (
            <>
              <p className="p-bold">-</p>
              {t("Am4QHzR")}
            </>
          )}
        </button>
      )}
    </>
  );
}
