import React, { useEffect, useMemo, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import CustomizeContentSource from "./CustomizeContentSource";
import ShareRelay from "./ShareRelay";
import CFCategoryPreview from "./CFCategoryPreview";

export default function ContentSource({
  selectedCategory,
  setSelectedCategory,
  type = 1,
}) {
  const { t } = useTranslation();
  const userAppSettings = useSelector((state) => state.userAppSettings);
  const userFavRelays = useSelector((state) => state.userFavRelays);
  const userKeys = useSelector((state) => state.userKeys);
  const [showOptions, setShowOptions] = useState(false);
  const [showFeedMarketplace, setShowFeedMarketPlace] = useState(false);
  const [showRelaySharing, setshowRelaySharing] = useState(false);
  const optionsRef = useRef(null);

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
              {
                group_name: t("AhSpIKN"),
                value: "af",
                list: [],
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
              {
                group_name: t("AhSpIKN"),
                value: "af",
                list: [],
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
            {
              group_name: t("AhSpIKN"),
              value: "af",
              list: userFavRelays.relays
                ? userFavRelays.relays.map((_) => {
                    return {
                      display_name: _.replace("wss://", "").replace(
                        "ws://",
                        ""
                      ),
                      value: _,
                      enabled: true,
                      fav: true,
                    };
                  })
                : [],
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
            {
              group_name: t("AhSpIKN"),
              value: "af",
              list: userFavRelays.relays
                ? userFavRelays.relays.map((_) => {
                    return {
                      display_name: _.replace("wss://", "").replace(
                        "ws://",
                        ""
                      ),
                      value: _,
                      enabled: true,
                      fav: true,
                    };
                  })
                : [],
            },
          ];
    if (
      type === 1 &&
      userAppSettings?.settings?.content_sources?.mixed_content
    ) {
      let sources = userAppSettings?.settings?.content_sources?.mixed_content;
      return getSourcesArray(sources, options[0].list, t, userFavRelays.relays);
    }
    if (type === 2 && userAppSettings?.settings?.content_sources?.notes) {
      let sources = userAppSettings?.settings?.content_sources?.notes;
      return getSourcesArray(sources, options[0].list, t, userFavRelays.relays);
    }
    return options;
  }, [userAppSettings, userKeys, userFavRelays]);
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
          style={{ height: "40px", padding: "0 .5rem", maxWidth: "300px", border: "none" }}
          onClick={(e) => {
            e.stopPropagation();
            setShowOptions(!showOptions);
          }}
        >
          <CFCategoryPreview category={selectedCategory} minimal={true} />

          <div className="arrow"></div>
        </div>
        {showOptions && (
          <div
            style={{
              position: "absolute",
              top: "110%",
              backgroundColor: "var(--dim-gray)",
              width: "350px",
              maxHeight: "40vh",
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
                let checkVisibility = !(
                  option.list.length === 0 ||
                  !option.list.find((_) => _.enabled)
                );
                if (checkVisibility)
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
                                <CFCategoryPreview
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
            </div>
          </div>
        )}
      </div>
    </>
  );
}

const getSourcesArray = (sources, cfBackup, t, favRelays = []) => {
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
        return {
          display_name: community_feed_keys[_[0]] || "N/A",
          value: _[0],
          enabled: _[1],
        };
      }) || cfBackup,
  };
  sourcesArray[1] = {
    group_name: t("AhSpIKN"),
    value: "af",
    list:
      [
        ...favRelays.map((_) => {
          return {
            display_name: _.replace("wss://", "").replace("ws://", ""),
            value: _,
            enabled: true,
            fav: true,
          };
        }),
      ] || [],
  };

  return sourcesArray;
};
