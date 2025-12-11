import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { InitEvent } from "@/Helpers/Controlers";
import { useTranslation } from "react-i18next";
import { setToPublish } from "@/Store/Slides/Publishers";
import axios from "axios";
import CommunityFeed from "./CommunityFeed";
import RelaysFeed from "./RelaysFeed";

const mixedContentDefaultCF = [
  ["top", true],
  ["network", true],
  ["global", true],
];
const NotesDefaultCF = [
  ["recent", true],
  ["recent_with_replies", true],
  ["global", true],
  ["paid", true],
  ["widgets", true],
];

export default function CustomizeContentSource({
  exit,
  optionsList = [],
  type,
}) {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const userAppSettings = useSelector((state) => state.userAppSettings);
  const [sources, setSources] = useState(optionsList);
  const [category, setCategory] = useState(1);
  const [allRelays, setAllRelays] = useState([]);
  const optionsToSave = useMemo(() => {
    let communityIndex = sources.findIndex((_) => _.value === "cf");
    let communityList =
      sources[communityIndex].list.map((_) => [_.value, _.enabled]) ||
      (type === 1 ? mixedContentDefaultCF : NotesDefaultCF);

    return {
      ...userAppSettings?.settings,
      content_sources: {
        ...userAppSettings?.settings?.content_sources,
        [type === 1 ? "mixed_content" : "notes"]: {
          community: {
            index: communityIndex,
            list: communityList,
          },
        },
      },
    };
  }, [userAppSettings, sources]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await axios.get(
          "https://cache-v2.yakihonne.com/api/v1/relays"
        );
        setAllRelays(data.data);
      } catch {}
    };
    fetchData();
  }, []);

  useEffect(() => {
    setSources(optionsList);
  }, [optionsList]);

  const updateCommunityFeed = async () => {
    try {
      let tempSettings = structuredClone(optionsToSave);

      delete tempSettings.content_sources[
        type === "1" ? "mixed_content" : "notes"
      ].relays;

      const event = {
        kind: 30078,
        content: JSON.stringify(tempSettings),
        tags: [
          [
            "client",
            "Yakihonne",
            "31990:20986fb83e775d96d188ca5c9df10ce6d613e0eb7e5768a0f0b12b37cdac21b3:1700732875747",
          ],
          ["d", "YakihonneAppSettings"],
        ],
      };

      let eventInitEx = await InitEvent(
        event.kind,
        event.content,
        event.tags,
        undefined
      );
      if (!eventInitEx) {
        return;
      }
      dispatch(
        setToPublish({
          eventInitEx,
          allRelays: [],
        })
      );
      exit();
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div
      className="fixed-container box-pad-h fx-centered fx-start-v"
      onClick={(e) => {
        e.stopPropagation();
        exit();
      }}
    >
      <div
        className="fx-centered fx-col fx-start-h f-start-v  sc-s bg-sp"
        style={{
          minHeight: "30vh",
          overflow: "visible",
          position: "relative",
          marginTop: "3rem",
          width: "min(100%, 500px)",
          gap: 0,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="sticky fit-container"
          style={{ padding: 0, borderRadius: "var(--border-r-32)" }}
        >
          <div className="fit-container fx-scattered box-pad-h box-pad-v-m">
            <h4>{t("AH4Mub1")}</h4>
            <div className="fx-centered">
              <div
                className="close"
                style={{ position: "static" }}
                onClick={exit}
              >
                <div></div>
              </div>
            </div>
          </div>
          <div
            className="fit-container fx-even"
            style={{
              paddingTop: 0,
              paddingBottom: 0,
              columnGap: 0,
              borderBottom: "1px solid var(--very-dim-gray)",
              borderTop: "1px solid var(--very-dim-gray)",
            }}
          >
            <div
              className={`list-item-b fx-centered fx ${
                category === 1 ? "selected-list-item-b" : ""
              }`}
              onClick={() => setCategory(1)}
            >
              {t("AhSpIKN")}
            </div>
            <div
              className={`list-item-b fx-centered fx ${
                category === 2 ? "selected-list-item-b" : ""
              }`}
              onClick={() => setCategory(2)}
            >
              {t("A8Y9rVt")}
            </div>
          </div>
        </div>
        {category === 1 && <RelaysFeed allRelays={allRelays} exit={exit} />}
        {/* {category === 1 && (
          <RelaysFeed
            selectedRelaysFeed={selectedRelaysFeed}
            setSelectedRelaysFeed={setSelectedRelaysFeed}
            allRelays={allRelays}
            update={updateRelaysFeed}
            setSources={setSources}
          />
        )} */}
        {category === 2 && (
          <CommunityFeed
            sources={sources}
            setSources={setSources}
            update={updateCommunityFeed}
          />
        )}
      </div>
    </div>
  );
}
