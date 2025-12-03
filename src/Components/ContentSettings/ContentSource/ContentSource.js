import React, { useEffect, useMemo, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import CustomizeContentSource from "./CustomizeContentSource";
import ShareRelay from "./ShareRelay";
import ContentFeedCategoryPreview from "./ContentFeedCategoryPreview";
import useRelaysSet from "@/Hooks/useRelaysSet";
import { getParsedRelaySet } from "@/Helpers/Encryptions";

export default function ContentSource({
  selectedCategory,
  setSelectedCategory,
  type = 1,
}) {
  const { t } = useTranslation();
  const userAppSettings = useSelector((state) => state.userAppSettings);
  const userFavRelays = useSelector((state) => state.userFavRelays);
  const userKeys = useSelector((state) => state.userKeys);
  const { userRelaysSet } = useRelaysSet();
  const [showOptions, setShowOptions] = useState(false);
  const [showFeedMarketplace, setShowFeedMarketPlace] = useState(false);
  const [showRelaySharing, setshowRelaySharing] = useState(false);
  const optionsRef = useRef(null);
  const relaysSet = useMemo(() => {
    let favSet = userFavRelays.tags
      ? [
          ...new Set(
            userFavRelays.tags.filter((_) => _[0] === "a").map((_) => _[1])
          ),
        ]
      : [];
    if (favSet.length === 0) return [];
    let relaysSet = favSet
      .map((_) =>
        userRelaysSet[_] ? getParsedRelaySet(userRelaysSet[_]) : null
      )
      .filter((_) => _);
    return relaysSet;
  }, [userFavRelays, userRelaysSet]);
  const favRelays = useMemo(() => {
    return userFavRelays.relays
      ? userFavRelays.relays.map((_) => {
          return {
            display_name: _.replace("wss://", "").replace("ws://", ""),
            value: _,
          };
        })
      : [];
  }, [userFavRelays]);
  const optionsList = useMemo(() => {
    if (!(userKeys && (userKeys?.sec || userKeys?.ext || userKeys?.bunker))) {
      let options =
        type === 1
          ? [
              {
                group_name: t("A8Y9rVt"),
                value: "cf",
                list: [
                  { display_name: t("AZKPdUC"), value: "top", enabled: true },
                  {
                    display_name: t("A0gGIxM"),
                    value: "global",
                    enabled: true,
                  },
                ],
              },
            ]
          : [
              {
                group_name: t("A8Y9rVt"),
                value: "cf",
                list: [
                  {
                    display_name: t("A0gGIxM"),
                    value: "global",
                    enabled: true,
                  },
                  { display_name: t("AAg9D6c"), value: "paid", enabled: true },
                  {
                    display_name: t("AM4vyRX"),
                    value: "widgets",
                    enabled: true,
                  },
                ],
              },
            ];
      return options;
    }
    let options =
      type === 1
        ? [
            {
              group_name: t("A8Y9rVt"),
              value: "cf",
              list: [
                { display_name: t("AZKPdUC"), value: "top", enabled: true },
                {
                  display_name: t("AnwFQtj"),
                  value: "network",
                  enabled: true,
                },
                { display_name: t("A0gGIxM"), value: "global", enabled: true },
              ],
            },
          ]
        : [
            {
              group_name: t("A8Y9rVt"),
              value: "cf",
              list: [
                { display_name: t("AiAJcg1"), value: "recent", enabled: true },
                {
                  display_name: t("AgF8nZU"),
                  value: "recent_with_replies",
                  enabled: true,
                },
                { display_name: t("A0gGIxM"), value: "global", enabled: true },
                { display_name: t("AAg9D6c"), value: "paid", enabled: true },
                { display_name: t("AM4vyRX"), value: "widgets", enabled: true },
              ],
            },
          ];
    if (
      type === 1 &&
      userAppSettings?.settings?.content_sources?.mixed_content
    ) {
      let sources = userAppSettings?.settings?.content_sources?.mixed_content;
      return getSourcesArray(sources, options[0].list, t);
    }
    if (type === 2 && userAppSettings?.settings?.content_sources?.notes) {
      let sources = userAppSettings?.settings?.content_sources?.notes;
      return getSourcesArray(sources, options[0].list, t);
    }
    return options;
  }, [userAppSettings, userKeys]);

  useEffect(() => {
    const handleOffClick = (e) => {
      e.stopPropagation();
      if (optionsRef.current && !optionsRef.current.contains(e.target))
        setShowOptions(false);
    };
    document.addEventListener("mousedown", handleOffClick);
    return () => {
      document.removeEventListener("mousedown", handleOffClick);
    };
  }, [optionsRef]);

  useEffect(() => {
    let categoryHistory;
    try {
      categoryHistory = JSON.parse(
        localStorage.getItem(`selectedCategorySource-${type}`)
      );
    } catch {}
    let selectedCategory_ = {
      group: optionsList[0].value,
      ...optionsList[0].list[0],
    };
    setSelectedCategory(
      userKeys ? categoryHistory || selectedCategory_ : selectedCategory_
    );
  }, [optionsList]);

  const handleSelectCategory = (e, _, option) => {
    e.stopPropagation();
    setSelectedCategory({
      ..._,
      group: option.value,
    });
    localStorage.setItem(
      `selectedCategorySource-${type}`,
      JSON.stringify({
        ..._,
        group: option.value,
      })
    );
    setShowOptions(false);
  };

  return (
    <>
      {showFeedMarketplace && (
        <CustomizeContentSource
          exit={() => setShowFeedMarketPlace(false)}
          optionsList={optionsList}
          type={type}
        />
      )}
      {showRelaySharing && (
        <ShareRelay
          relay={showRelaySharing}
          exit={(e) => {
            e.stopPropagation();
            setshowRelaySharing();
          }}
          type={type}
        />
      )}
      <div style={{ position: "relative" }} ref={optionsRef}>
        <div
          className="fx-scattered if option pointer"
          style={{
            height: "40px",
            padding: "0 .5rem",
            maxWidth: "300px",
            border: "none",
          }}
          onClick={(e) => {
            e.stopPropagation();
            setShowOptions(!showOptions);
          }}
        >
          <ContentFeedCategoryPreview category={selectedCategory} minimal={true} />
          <div className="arrow"></div>
        </div>
        {showOptions && (
          <div
            style={{
              position: "absolute",
              top: "110%",
              backgroundColor: "var(--dim-gray)",
              width: "350px",
              maxHeight: userFavRelays.relays?.length === 0 ? "100vh" : "40vh",
              overflowY: "scroll",
              zIndex: 1000,
            }}
            className="sc-s-18 bg-sp fx-centered fx-col fx-start-v fx-start-h pointer drop-down-r slide-down"
            onClick={() => setShowOptions(false)}
          >
            <div
              className="box-pad-h-s sc-s-18 fit-container fx-scattered"
              style={{
                backgroundColor: "var(--pale-gray)",
                borderRadius: "0",
                top: 0,
                position: "sticky",
                zIndex: 1000,
                minHeight: "40px",
              }}
            >
              <p className="gray-c">
                {type === 1 ? t("AuUadPD") : t("A84qogb")}
              </p>
              {userKeys &&
                (userKeys?.sec || userKeys?.ext || userKeys?.bunker) && (
                  <div
                    onClick={() => setShowFeedMarketPlace(!showFeedMarketplace)}
                  >
                    <div className="setting"></div>
                  </div>
                )}
            </div>
            <div
              className="fx-centered fx-col fx-start-v fit-container"
              style={{ gap: 0, padding: ".25rem .45rem" }}
            >
              {optionsList.map((option, index) => {
                return (
                  <div
                    key={index}
                    className={"fx-centered fx-col fx-start-v fit-container"}
                  >
                    <h5 className="c1-c  box-pad-h-s">{option.group_name}</h5>
                    <div
                      className="fit-container fx-centered fx-col fx-start-h fx-start-v"
                      style={{ gap: 0, marginBottom: ".5rem" }}
                    >
                      {option.list.map((_, _index) => {
                        if (_.enabled)
                          return (
                            <div
                              key={_index}
                              className={`pointer fit-container box-pad-h-s box-pad-v-s fx-scattered option-no-scale`}
                              style={{
                                borderRadius: "var(--border-r-18)",
                              }}
                              onClick={(e) =>
                                handleSelectCategory(e, _, option)
                              }
                            >
                              <ContentFeedCategoryPreview
                                category={{
                                  group: option.value,
                                  ..._,
                                }}
                              />
                              <div className="fx-centered">
                                {selectedCategory.value === _.value && (
                                  <div className="check-24"></div>
                                )}
                                {option.value === "af" && (
                                  <div
                                    className="share-icon"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setshowRelaySharing(_.value);
                                    }}
                                  ></div>
                                )}
                              </div>
                            </div>
                          );
                      })}
                    </div>
                  </div>
                );
              })}
              {(favRelays.length > 0 || relaysSet.length > 0) && (
                <div className="fit-container box-marg-s">
                  <h5 className="c1-c box-pad-h-s">{t("AhSpIKN")}</h5>
                </div>
              )}
              {relaysSet.length > 0 && (
                <div className={"fx-centered fx-col fx-start-v fit-container"}>
                  <h5 className="gray-c  box-pad-h-s">{t("AgRMPL3")}</h5>
                  <div
                    className="fit-container fx-centered fx-col fx-start-h fx-start-v"
                    style={{ gap: 0, marginBottom: ".5rem" }}
                  >
                    {relaysSet.map((metadata, _index) => {
                      let isThereRelays = metadata.relays.length > 0;
                      return (
                        <div
                          key={_index}
                          className={`pointer fit-container box-pad-h-s box-pad-v-s fx-scattered option-no-scale`}
                          style={{
                            borderRadius: "var(--border-r-18)",
                            opacity: isThereRelays ? 1 : 0.7,
                            cursor: isThereRelays ? "pointer" : "not-allowed",
                          }}
                          onClick={(e) =>
                            isThereRelays
                              ? handleSelectCategory(
                                  e,
                                  { ...metadata, value: metadata.aTag },
                                  { value: "rsf" }
                                )
                              : null
                          }
                        >
                          <ContentFeedCategoryPreview
                            category={{ ...metadata, group: "rsf" }}
                          />
                          <div className="fx-centered">
                            <div
                              className={`pointer sticker sticker-normal sticker-small ${
                                isThereRelays
                                  ? "sticker-green-side"
                                  : "sticker-red-side"
                              }`}
                              style={{ minWidth: "max-content" }}
                              // onClick={() =>
                              //   seeDetails ? seeDetails(metadata) : null
                              // }
                            >
                              {metadata.relays.length}{" "}
                              {metadata.relays.length === 1
                                ? "relay"
                                : "relays"}
                              {/* <div className="arrow-12"></div> */}
                            </div>
                            {selectedCategory.value === metadata.aTag && (
                              <div className="check-24"></div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
              {favRelays.length > 0 && (
                <div className={"fx-centered fx-col fx-start-v fit-container"}>
                  <h5 className="gray-c  box-pad-h-s">{t("A1NJKQa")}</h5>
                  <div
                    className="fit-container fx-centered fx-col fx-start-h fx-start-v"
                    style={{ gap: 0, marginBottom: ".5rem" }}
                  >
                    {favRelays.map((_, _index) => {
                      return (
                        <div
                          key={_index}
                          className={`pointer fit-container box-pad-h-s box-pad-v-s fx-scattered option-no-scale`}
                          style={{
                            borderRadius: "var(--border-r-18)",
                          }}
                          onClick={(e) => handleSelectCategory(e, _, {value: "af"})}
                        >
                          <ContentFeedCategoryPreview
                            category={{
                              group: "af",
                              ..._,
                            }}
                          />
                          <div className="fx-centered">
                            {selectedCategory.value === _.value && (
                              <div className="check-24"></div>
                            )}
                            <div
                              className="share-icon"
                              onClick={(e) => {
                                e.stopPropagation();
                                setshowRelaySharing(_.value);
                              }}
                            ></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
              {(favRelays.length === 0 && relaysSet.length === 0) && (
                <div className="box-pad-h-m fit-container box-marg-s fx-centered">
                  <div className="sc-s-18 box-pad-v fit-container bg-sp fx-centered fx-col">
                    <p className="p-centered box-pad-h">{t("AJbVpAT")}</p>
                    <p className="p-centered box-pad-h gray-c p-medium">
                      {t("AyV6Rei")}
                    </p>
                    <button
                      className="btn btn-normal btn-small"
                      onClick={() =>
                        setShowFeedMarketPlace(!showFeedMarketplace)
                      }
                    >
                      {t("A0zZsLz")}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
}

const getSourcesArray = (sources, cfBackup, t) => {
  let sourcesArray = [];
  let community_feed_keys = {
    top: t("AZKPdUC"),
    network: t("AnwFQtj"),
    global: t("A0gGIxM"),
    recent: t("AiAJcg1"),
    recent_with_replies: t("AgF8nZU"),
    paid: t("AAg9D6c"),
    widgets: t("AM4vyRX"),
  };
  sourcesArray[0] = {
    group_name: t("A8Y9rVt"),
    value: "cf",
    list:
      sources["community"]?.list.map((_) => {
        let value = _[0].replaceAll("-", "_");
        return {
          display_name: community_feed_keys[value] || "N/A",
          value: value,
          enabled: _[1],
        };
      }) || cfBackup,
  };
  return sourcesArray;
};
