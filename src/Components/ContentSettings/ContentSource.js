import React, { useEffect, useMemo, useRef, useState } from "react";
import Toggle from "@/Components/Toggle";
import { useDispatch, useSelector } from "react-redux";
import { getSubData, InitEvent } from "@/Helpers/Controlers";
import { useTranslation } from "react-i18next";
import UserProfilePic from "@/Components/UserProfilePic";
import LoadingDots from "@/Components/LoadingDots";
import { setToPublish } from "@/Store/Slides/Publishers";
import RelayImage from "@/Components/RelayImage";
import { DraggableComp } from "@/Components/DraggableComp";
import { mixedContentDVMs, notesContentDVMs } from "@/Content/DVMs";
import { copyText } from "@/Helpers/Helpers";
import axios from "axios";
import RelaysPicker from "@/Components/RelaysPicker";

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

export default function ContentSource({
  mixedContent = true,
  selectedCategory,
  setSelectedCategory,
  type = 1,
}) {
  const { t } = useTranslation();
  const [list, setList] = useState([]);
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
                group_name: t("ANDYDtu"),
                value: "mf",
                list: [
                  {
                    display_name:
                      "96945c769ef9e91be05570fef1003633f5bb9d072ba2453781b5140013ab35b3",
                    value:
                      "96945c769ef9e91be05570fef1003633f5bb9d072ba2453781b5140013ab35b3",
                    enabled: true,
                  },
                ],
              },
              {
                group_name: t("AhSpIKN"),
                value: "af",
                list: [
                  {
                    display_name: "algo.utxo.one",
                    value: "wss://algo.utxo.one",
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
              {
                group_name: t("ANDYDtu"),
                value: "mf",
                list: [
                  {
                    display_name:
                      "96945c769ef9e91be05570fef1003633f5bb9d072ba2453781b5140013ab35b3",
                    value:
                      "96945c769ef9e91be05570fef1003633f5bb9d072ba2453781b5140013ab35b3",
                    enabled: true,
                  },
                ],
              },
              {
                group_name: t("AhSpIKN"),
                value: "af",
                list: [
                  {
                    display_name: "algo.utxo.one",
                    value: "wss://algo.utxo.one",
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
            {
              group_name: t("ANDYDtu"),
              value: "mf",
              list: [
                {
                  display_name:
                    "df3fd2ad2f13b692f76abf533c0c1275c00c774c5d121c9c46ec74f80f08b224",
                  value:
                    "df3fd2ad2f13b692f76abf533c0c1275c00c774c5d121c9c46ec74f80f08b224",
                  enabled: true,
                },
              ],
            },
            {
              group_name: t("AhSpIKN"),
              value: "af",
              list: [
                {
                  display_name: "algo.utxo.one",
                  value: "wss://algo.utxo.one",
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
              group_name: t("ANDYDtu"),
              value: "mf",
              list: [
                {
                  display_name:
                    "9e09a914f41db178ba442b7372944b021135c08439516464a9bd436588af0b58",
                  value:
                    "9e09a914f41db178ba442b7372944b021135c08439516464a9bd436588af0b58",
                  enabled: true,
                },
              ],
            },
            {
              group_name: t("AhSpIKN"),
              value: "af",
              list: [
                {
                  display_name: "algo.utxo.one",
                  value: "wss://algo.utxo.one",
                  enabled: true,
                },
              ],
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
    const fetchData = async () => {
      try {
        let cachedDvmsList = localStorage.getItem("dvmsList") || {
          list: [],
          until: undefined,
        };
        try {
          cachedDvmsList = JSON.parse(cachedDvmsList);
        } catch (err) {
          cachedDvmsList = {
            list: [],
            until: undefined,
          };
        }
        if (cachedDvmsList.list?.length > 0) {
          let onlyDVMTypes = cachedDvmsList.list.filter((_, index, arr) => {
            if (
              arr.findIndex((__) => __.value === _.value) === index &&
              (type === 1
                ? mixedContentDVMs.includes(_.value)
                : notesContentDVMs.includes(_.value))
            )
              return _;
          });

          setList(onlyDVMTypes);
        }
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
        let prevDVMs = optionsList.find((_) => _.value === "mf");
        prevDVMs = prevDVMs?.list || [];
        let data = await getSubData([
          {
            kinds: [31990],
            "#k": ["5300"],
            until: cachedDvmsList?.until || undefined,
          },
          { kinds: [31990], "#k": ["5300"], authors: prevDVMs },
        ]);

        let filteredData = data.data
          .map((_) => {
            return { ...JSON.parse(_.content), value: _.pubkey, enabled: true };
          })
          .filter((_) => _.amount === "free");

        if (filteredData.length > 0) {
          localStorage.setItem(
            "dvmsList",
            JSON.stringify({
              list: [...filteredData, ...cachedDvmsList.list],
              until: data.data[data.data.length - 1].created_at + 1,
            })
          );
          let onlyDVMTypes = [...filteredData, ...cachedDvmsList.list].filter(
            (_, index, arr) => {
              if (
                arr.findIndex((__) => __.value === _.value) === index &&
                (type === 1
                  ? mixedContentDVMs.includes(_.value)
                  : notesContentDVMs.includes(_.value))
              )
                return _;
            }
          );

          setList(onlyDVMTypes);
        }
      } catch (err) {
        console.log(err);
      }
    };
    fetchData();
  }, [optionsList]);

  const getCategoryPreview = (category, minimal = false) => {
    if (category.group === "cf") {
      return (
        <div className="fx-centered">
          {category.value === "top" && (
            <div
              className="round-icon"
              style={{
                minWidth: minimal ? "28px" : "34px",
                minHeight: minimal ? "28px" : "34px",
              }}
            >
              <div className="medal"></div>
            </div>
          )}
          {category.value === "widgets" && (
            <div
              className="round-icon"
              style={{
                minWidth: minimal ? "28px" : "34px",
                minHeight: minimal ? "28px" : "34px",
              }}
            >
              <div className="smart-widget"></div>
            </div>
          )}
          {category.value === "recent" && (
            <div
              className="round-icon"
              style={{
                minWidth: minimal ? "28px" : "34px",
                minHeight: minimal ? "28px" : "34px",
              }}
            >
              <div className="posts"></div>
            </div>
          )}
          {category.value === "recent_with_replies" && (
            <div
              className="round-icon"
              style={{
                minWidth: minimal ? "28px" : "34px",
                minHeight: minimal ? "28px" : "34px",
              }}
            >
              <div className="note"></div>
            </div>
          )}
          {category.value === "paid" && (
            <div
              className="round-icon"
              style={{
                minWidth: minimal ? "28px" : "34px",
                minHeight: minimal ? "28px" : "34px",
              }}
            >
              <div className="sats"></div>
            </div>
          )}
          {category.value === "network" && (
            <div
              className="round-icon"
              style={{
                minWidth: minimal ? "28px" : "34px",
                minHeight: minimal ? "28px" : "34px",
              }}
            >
              <div className="posts"></div>
            </div>
          )}
          {category.value === "global" && (
            <div
              className="round-icon"
              style={{
                minWidth: minimal ? "28px" : "34px",
                minHeight: minimal ? "28px" : "34px",
              }}
            >
              <div className="globe"></div>
            </div>
          )}
          <p className="p-maj p-one-line">{category.display_name}</p>
        </div>
      );
    }
    if (category.group === "af")
      return (
        <div className="fx-centered">
          <div style={{ position: "relative" }}>
            {category.fav && (
              <div
                style={{
                  position: "absolute",
                  bottom: "5px",
                  right: "5px",
                  width: "10px",
                  height: "10px",
                  zIndex: 10,
                }}
              >
                ⭐️
              </div>
            )}
            <RelayImage url={category.value} size={minimal ? 28 : 32} />
          </div>
          <div>
            <p className="p-one-line">{category.display_name}</p>
            {!minimal && <p className="gray-c p-one-line">{category.value}</p>}
          </div>
        </div>
      );
    let metadata = list.find((_) => _.value === category.value);
    if (metadata) {
      return (
        <div className="fx-centered">
          <UserProfilePic
            img={metadata.picture}
            mainAccountUser={false}
            size={minimal ? 28 : 34}
            allowClick={false}
          />
          <div>
            <p>{metadata.name || category.value.substring(0, 15)}</p>
            {!minimal && <p className="gray-c">{metadata.about || "N/A"}</p>}
          </div>
        </div>
      );
    }
    return null;
  };

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
          list={list}
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
          style={{ height: "40px", padding: "0 .5rem", maxWidth: "300px" }}
          onClick={(e) => {
            e.stopPropagation();
            setShowOptions(!showOptions);
          }}
        >
          {getCategoryPreview(selectedCategory, true)}
          <div className="arrow-12"></div>
        </div>
        {showOptions && (
          <div
            style={{
              position: "absolute",
              top: "110%",
              // left: "0",
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
                                className={`pointer fit-container box-pad-h-s box-pad-v-s fx-scattered ${
                                  selectedCategory.value === _.value
                                    ? "sc-s-18"
                                    : ""
                                }`}
                                style={{
                                  borderRadius: "var(--border-r-18)",
                                }}
                                onClick={(e) =>
                                  handleSelectCategory(e, _, option)
                                }
                              >
                                {getCategoryPreview({
                                  group: option.value,
                                  ..._,
                                })}
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

const CustomizeContentSource = ({
  exit,
  optionsList = [],
  list = [],
  type,
}) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const userAppSettings = useSelector((state) => state.userAppSettings);
  const userFavRelays = useSelector((state) => state.userFavRelays);
  const [sources, setSources] = useState(optionsList);
  const [category, setCategory] = useState(1);
  const [allRelays, setAllRelays] = useState([]);
  const [selectedDvms, setSelectedDvms] = useState(
    optionsList
      .find((_) => _.value === "mf")
      ?.list?.map((_) => {
        return {
          ...(list.find((__) => __.value === _.value) || {
            picture: "",
            value: _.value,
            name: "N/A",
            about: "N/A",
            enabled: _.enabled,
          }),
          enabled: _.enabled,
        };
      }) || []
  );
  const [selectedRelaysFeed, setSelectedRelaysFeed] = useState(
    optionsList.find((_) => _.value === "af")?.list || []
  );

  const optionsToSave = useMemo(() => {
    let communityIndex = sources.findIndex((_) => _.value === "cf");
    let dvmsIndex = sources.findIndex((_) => _.value === "mf");
    let relaysIndex = sources.findIndex((_) => _.value === "af");
    let dvmsList =
      sources[dvmsIndex].list.map((_) => [_.value, _.enabled]) || [];
    let relaysList =
      sources[relaysIndex].list.map((_) => [_.value, _.enabled]) || [];

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
          dvms: {
            index: dvmsIndex,
            list: dvmsList,
          },
          relays: {
            index: relaysIndex,
            list: relaysList,
          },
        },
      },
    };
  }, [userAppSettings, sources]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await axios.get("https://api.nostr.watch/v1/online");
        setAllRelays(data.data);
      } catch {}
    };
    fetchData();
  }, []);

  useEffect(() => {
    setSources(optionsList);
  }, [optionsList]);

  useEffect(() => {
    let tempSources = structuredClone([...sources]);
    let dvmsIndex = tempSources.findIndex((_) => _.value === "mf");
    let relaysIndex = tempSources.findIndex((_) => _.value === "af");
    let dvmsList = tempSources[dvmsIndex].list;
    let relaysList = tempSources[relaysIndex].list;

    let sortedDvms = selectedDvms.map((_, index) => {
      let checkIndex = dvmsList.findIndex((__) => __.value === _.value);
      if (checkIndex !== -1) {
        let check = dvmsList[checkIndex];
        return {
          display_name: check.value,
          value: check.value,
          enabled: check.enabled,
          index: checkIndex,
        };
      } else {
        return {
          display_name: _.value,
          value: _.value,
          enabled: true,
          index: selectedDvms.length + index,
        };
      }
    });
    sortedDvms = sortedDvms
      .sort((a, b) => a.index - b.index)
      .map((_) => {
        delete _.index;
        return _;
      });

    let sortedRelaysFeed = selectedRelaysFeed.map((_, index) => {
      let checkIndex = relaysList.findIndex((__) => __.value === _.value);
      if (checkIndex !== -1) {
        let check = relaysList[checkIndex];
        return { ...check, index: checkIndex };
      } else {
        return {
          ..._,
          enabled: true,
          index: selectedRelaysFeed.length + index,
        };
      }
    });
    sortedRelaysFeed = sortedRelaysFeed
      .sort((a, b) => a.index - b.index)
      .map((_) => {
        delete _.index;
        return _;
      });

    tempSources[dvmsIndex].list = sortedDvms;
    tempSources[relaysIndex].list = sortedRelaysFeed;

    setSources(tempSources);
  }, [selectedDvms, selectedRelaysFeed]);

  const handleUpdateSettings = async () => {
    try {
      const event = {
        kind: 30078,
        content: JSON.stringify(optionsToSave),
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
      await updateFavRelays();
      exit();
    } catch (err) {
      console.log(err);
    }
  };

  const updateFavRelays = async () => {
    let aTags = userFavRelays.tags.filter((_) => _[0] !== "relay");
    let relays = selectedRelaysFeed
      .filter((_) => _.fav)
      .map((_) => {
        return ["relay", _.value];
      });
    let tags = [...aTags, ...relays];
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
      return;
    }
    dispatch(
      setToPublish({
        eventInitEx,
        allRelays: [],
      })
    );
  };

  return (
    <div className="fixed-container box-pad-h fx-centered fx-start-v">
      <div
        className="fx-centered fx-col fx-start-h f-start-v  sc-s-18 bg-sp"
        style={{
          maxHeight: "70vh",
          minHeight: "30vh",
          overflow: "scroll",
          position: "relative",
          marginTop: "3rem",
          width: "min(100%, 500px)",
          gap: 0,
        }}
      >
        <div className="close" onClick={exit}>
          <div></div>
        </div>
        <div className="fit-container fx-scattered box-pad-h-m box-pad-v-m">
          <h4>{t("AH4Mub1")}</h4>
          <div className="box-pad-h" style={{ paddingRight: "2.5rem" }}>
            <button
              className="btn btn-small btn-normal"
              onClick={handleUpdateSettings}
            >
              {t("A8alhKV")}
            </button>
          </div>
        </div>
        <div
          className="fit-container fx-even sticky box-pad-h"
          style={{
            top: "-1px",
            // padding: "1rem",
            paddingTop: 0,
            paddingBottom: 0,
            columnGap: 0,
            borderBottom: "1px solid var(--very-dim-gray)",
            borderTop: "1px solid var(--very-dim-gray)",
          }}
        >
          <div
            className={`list-item-b fx-centered fx-shrink ${
              category === 1 ? "selected-list-item-b" : ""
            }`}
            onClick={() => setCategory(1)}
          >
            {t("ANDYDtu")}
          </div>
          <div
            className={`list-item-b fx-centered fx-shrink ${
              category === 2 ? "selected-list-item-b" : ""
            }`}
            onClick={() => setCategory(2)}
          >
            {t("AhSpIKN")}
          </div>
          <div
            className={`list-item-b fx-centered fx-shrink ${
              category === 3 ? "selected-list-item-b" : ""
            }`}
            onClick={() => setCategory(3)}
          >
            {t("ABtsLBp")}
          </div>
        </div>
        {category === 1 && (
          <FeedMarketPlace
            list={list}
            selectedDvms={selectedDvms}
            setSelectedDvms={setSelectedDvms}
          />
        )}
        {category === 2 && (
          <RelaysFeed
            selectedRelaysFeed={selectedRelaysFeed}
            setSelectedRelaysFeed={setSelectedRelaysFeed}
            allRelays={allRelays}
          />
        )}
        {category === 3 && (
          <Settings sources={sources} dvmList={list} setSources={setSources} />
        )}
      </div>
    </div>
  );
};

const FeedMarketPlace = ({ list, selectedDvms, setSelectedDvms }) => {
  const { t } = useTranslation();
  const [selectedDvmsPubkeys, setSelectedDvmsPubkeys] = useState(
    selectedDvms.map((_) => _.value) || []
  );

  const handleRemoveSelected = (pubkey) => {
    setSelectedDvms((prev) => prev.filter((_) => _.value !== pubkey));
    setSelectedDvmsPubkeys((prev) => prev.filter((_) => _ !== pubkey));
  };

  return (
    <div className="box-pad-h box-pad-v fx-centered fx-start-h fx-start-v fx-col fit-container">
      {selectedDvms.length > 0 && (
        <div className="fit-container fx-centered fx-start-h fx-start-v fx-col">
          <p className="c1-c">{t("At4Hrf6")}</p>
          {selectedDvms.map((_, index) => {
            return (
              <div
                key={index}
                className="fit-container sc-s-18 bg-sp fx-scattered box-pad-h-s box-pad-v-s fx-shrink option pointer"
                onClick={() => handleRemoveSelected(_.value)}
              >
                <div className="fx-centered">
                  <UserProfilePic
                    img={_.picture}
                    mainAccountUser={false}
                    size={34}
                    allowClick={false}
                  />
                  <div>
                    <p>{_.name}</p>
                    <p className="gray-c">{_.about}</p>
                  </div>
                </div>
                <div className="round-icon-small">
                  <div className="trash"></div>
                </div>
              </div>
            );
          })}
          <hr />
          <hr />
        </div>
      )}
      {selectedDvms.length > 0 && <p className="c1-c">{t("AbaD7kM")}</p>}
      {selectedDvms.length === 0 && <p className="gray-c">{t("AapPcmb")}</p>}
      {list.map((_, index) => {
        if (!selectedDvmsPubkeys.includes(_.value))
          return (
            <div
              key={index}
              className="fit-container sc-s-18 bg-sp fx-scattered box-pad-h-s box-pad-v-s fx-shrink option pointer"
              onClick={() => {
                setSelectedDvms((prev) => [...new Set([...prev, _])]);
                setSelectedDvmsPubkeys((prev) => [
                  ...new Set([...prev, _.value]),
                ]);
              }}
            >
              <div className="fx-centered">
                <UserProfilePic
                  img={_.picture}
                  mainAccountUser={false}
                  size={34}
                  allowClick={false}
                />
                <div>
                  <p>{_.name}</p>
                  <p className="gray-c">{_.about}</p>
                </div>
              </div>
              <div>
                <div className="round-icon-small">
                  <div className="plus-sign"></div>
                </div>
              </div>
            </div>
          );
      })}
      {list.length === 0 && (
        <div style={{ height: "300px" }} className="fx-centered fit-container">
          <LoadingDots />
        </div>
      )}
    </div>
  );
};

const RelaysFeed = ({
  selectedRelaysFeed,
  setSelectedRelaysFeed,
  allRelays,
}) => {
  const { t } = useTranslation();
  // const dispatch = useDispatch();
  // const userFavRelays = useSelector((state) => state.userFavRelays);
  const [tempRelaysFeed, setTempRelaysFeed] = useState("");

  const handleAddRelaysFeed = (data) => {
    // e?.preventDefault();
    if (!data) return;
    let tempString = data.trim().includes("ws://")
      ? data.trim().toLowerCase()
      : "wss://" + data.trim().replace("wss://", "").toLowerCase();
    setSelectedRelaysFeed((prev) => {
      if (prev.find((_) => _.value === tempString)) {
        return prev;
      }
      return [
        ...prev,
        {
          display_name: tempString
            .replaceAll("wss://", "")
            .replaceAll("ws://", ""),
          value: tempString,
          enabled: true,
        },
      ];
    });
    // setTempRelaysFeed("");
  };

  const removeRelay = (index) => {
    setSelectedRelaysFeed((prev) =>
      prev.filter((_, _index) => _index !== index)
    );
  };

  const updateFavRelaysList = async (relay, action) => {
    // let aTags = userFavRelays.tags.filter((_) => _[0] !== "relay");
    // let relays =
    //   action === "add"
    //     ? [...userFavRelays.relays, relay].map((_) => ["relay", _])
    //     : userFavRelays.relays
    //         .filter((_) => _ !== relay)
    //         .map((_) => ["relay", _]);
    // let tags = [...aTags, ...relays];
    // let event = {
    //   kind: 10012,
    //   content: "",
    //   tags: tags,
    // };
    // let eventInitEx = await InitEvent(
    //   event.kind,
    //   event.content,
    //   event.tags,
    //   undefined
    // );
    // if (!eventInitEx) {
    //   return;
    // }
    // dispatch(
    //   setToPublish({
    //     eventInitEx,
    //     allRelays: [],
    //   })
    // );
    setSelectedRelaysFeed((prev) => {
      return prev.map((item) => {
        if (item.value === relay) {
          return { ...item, fav: action === "add" };
        }
        return item;
      });
    });
  };

  // if (list.length === 0)
  //   return (
  //     <div className="fit-container fx-centered" style={{ height: "300px" }}>
  //       <div className="fx-centered fx-col box-pad-h box-pad-v">
  //         <p>No algo relays</p>
  //         <p className="gray-c p-centered box-pad-h">
  //           Add your algo relay list to enjoy a clean and custom feed
  //         </p>
  //         <button className="btn btn-normal btn-small">Add relay</button>
  //       </div>
  //     </div>
  //   );

  return (
    <div className="fit-container fx-centered fx-start-h fx-start-v fx-col box-pad-h-m box-pad-v-m">
      {/* <form
        className="fit-container fx-scattered "
        onSubmit={handleAddRelaysFeed}
      >
        <input
          type="text"
          className="if ifs-full"
          placeholder={t("AHAYC3d")}
          value={tempRelaysFeed}
          onChange={(e) => setTempRelaysFeed(e.target.value)}
        />
        <div className="round-icon-small" onClick={handleAddRelaysFeed}>
          <div className="plus-sign"></div>
        </div>
      </form> */}
      <RelaysPicker
        allRelays={allRelays}
        addRelay={handleAddRelaysFeed}
        showMessage={false}
      />
      {selectedRelaysFeed.length > 0 && (
        <div className="fit-container fx-col fx-scattered fx-start-h fx-start-v">
          <p className="c1-c">{t("At4Hrf6")}</p>
          {selectedRelaysFeed.map((item, index) => {
            return (
              <div
                className="fx-scattered fit-container sc-s-18 bg-sp box-pad-h-s box-pad-v-s"
                style={{ overflow: "visible" }}
                key={index}
              >
                <div className="fx-centered">
                  <RelayImage url={item.value} size={32} />
                  <div>
                    <p className="p-maj">{item.display_name}</p>
                    <p className="gray-c">{item.value}</p>
                  </div>
                </div>
                <div className="fx-centered">
                  <div
                    className="round-icon-small round-icon-tooltip"
                    data-tooltip={item.fav ? t("Am4QHzR") : t("AdT5mza")}
                    onClick={() =>
                      updateFavRelaysList(
                        item.value,
                        item.fav ? "remove" : "add"
                      )
                    }
                  >
                    {item.fav ? (
                      <div className="star-bold"></div>
                    ) : (
                      <div className="star"></div>
                    )}
                  </div>
                  <div
                    className="round-icon-small round-icon-tooltip"
                    data-tooltip={t("Almq94P")}
                    onClick={() => removeRelay(index)}
                  >
                    <div className="trash"></div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
      {selectedRelaysFeed.length === 0 && (
        <div className="fit-container fx-centered" style={{ height: "150px" }}>
          <div className="fx-centered fx-col box-pad-h box-pad-v">
            <p>{t("AcRP9Vs")}</p>
            <p className="gray-c p-centered box-pad-h">{t("AV1iUL2")}</p>
          </div>
        </div>
      )}
    </div>
  );
};

const Settings = ({ sources, setSources, dvmList }) => {
  const { t } = useTranslation();
  const handleToggleOption = (group, option) => {
    setSources((prev) => {
      let tempSources = structuredClone(prev);
      let groupIndex = tempSources.findIndex((_) => _.value === group);
      let gourpList = tempSources[groupIndex].list;
      let optionIndex = gourpList.findIndex((_) => _.value === option);
      if (group === "cf" && tempSources[groupIndex].list[optionIndex].enabled) {
        let checkList = gourpList
          .filter((_, index) => index !== optionIndex)
          .filter((_) => !_.enabled);
        if (checkList.length > gourpList.length - 2) {
          tempSources[groupIndex].list.forEach((_, index) => {
            if (index === optionIndex) _.enabled = false;
            else _.enabled = true;
          });
          return tempSources;
        }
      }
      tempSources[groupIndex].list[optionIndex].enabled =
        !tempSources[groupIndex].list[optionIndex].enabled;
      return tempSources;
    });
  };

  const hanleDragInternalITems = (newList, groupIndex) => {
    setSources((prev) => {
      let tempSources = structuredClone(prev);
      tempSources[groupIndex].list = newList;
      return tempSources;
    });
  };

  return (
    <div className="fit-container fx-centered fx-start-h fx-start-v fx-col box-pad-h-m box-pad-v-m">
      <p className="gray-c">{t("AJYvlq1")}</p>
      {sources.map((_, index) => {
        if (_.list?.length > 0)
          return (
            <div
              key={index}
              className="fit-container  fx-scattered  fx-col fx-shrink pointer"
            >
              <div className="fit-container fx-scattered">
                <p className="c1-c">{_.group_name}</p>
              </div>
              <div className="fit-container  fx-col fx-scattered ">
                <DraggableComp
                  children={_.list}
                  setNewOrderedList={(data) =>
                    hanleDragInternalITems(data, index)
                  }
                  component={ContentSourceSettingsItem}
                  props={{
                    dvmList,
                    handleToggleOption,
                    group: _,
                  }}
                  background={false}
                />
              </div>
            </div>
          );
      })}
    </div>
  );
};

const ContentSourceSettingsItem = ({
  group,
  item,
  handleToggleOption,
  dvmList,
}) => {
  if (group.value === "mf") {
    let metadata = dvmList.find((_) => _.value === item.value);
    return (
      <div className="fx-scattered fit-container sc-s-18 bg-sp box-pad-h-s box-pad-v-s">
        <div className="fx-centered">
          <UserProfilePic
            img={metadata.picture}
            mainAccountUser={false}
            size={34}
            allowClick={false}
          />
          <div>
            <p>{metadata.name}</p>
            <p className="gray-c">{metadata.about}</p>
          </div>
        </div>
        <div className="fx-centered">
          <Toggle
            status={item.enabled}
            setStatus={() => handleToggleOption(group.value, item.value)}
          />
          <div
            className="drag-el"
            style={{ minWidth: "16px", aspectRatio: "1/1" }}
          ></div>
        </div>
      </div>
    );
  }
  if (group.value === "af") {
    return (
      <div className="fx-scattered fit-container sc-s-18 bg-sp box-pad-h-s box-pad-v-s">
        <div className="fx-centered">
          <RelayImage url={item.value} size={32} />
          <div>
            <p>{item.display_name}</p>
            <p className="gray-c">{item.value}</p>
          </div>
        </div>
        <div className="fx-centered">
          <Toggle
            status={item.enabled}
            setStatus={() => handleToggleOption(group.value, item.value)}
          />
          <div
            className="drag-el"
            style={{ minWidth: "16px", aspectRatio: "1/1" }}
          ></div>
        </div>
      </div>
    );
  }
  return (
    <div className="fx-scattered fit-container sc-s-18 bg-sp box-pad-h-s box-pad-v-s">
      <p>{item.display_name}</p>
      <div className="fx-centered">
        <Toggle
          status={item.enabled}
          setStatus={() => handleToggleOption(group.value, item.value)}
        />
        <div
          className="drag-el"
          style={{ minWidth: "16px", aspectRatio: "1/1" }}
        ></div>
      </div>
    </div>
  );
};

const getSourcesArray = (sources, cfBackup, t, favRelays = []) => {
  let relaysList = sources["relays"]?.list.map((_) => _[0]);
  let filteredFavRelays = favRelays.filter((_) => !relaysList.includes(_));
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

  sourcesArray[sources["community"]?.index || 0] = {
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
  sourcesArray[sources["relays"]?.index || 2] = {
    group_name: t("AhSpIKN"),
    value: "af",
    list:
      [
        ...sources["relays"]?.list.map((_) => {
          return {
            display_name: _[0].replace("wss://", "").replace("ws://", ""),
            value: _[0],
            enabled: _[1],
            fav: favRelays.includes(_[0]),
          };
        }),
        ...filteredFavRelays.map((_) => {
          return {
            display_name: _.replace("wss://", "").replace("ws://", ""),
            value: _,
            enabled: true,
            fav: true,
          };
        }),
      ] || [],
  };

  sourcesArray[sources["dvms"]?.index || 1] = {
    group_name: t("ANDYDtu"),
    value: "mf",
    list:
      sources["dvms"]?.list.map((_) => {
        return {
          display_name: _[0],
          value: _[0],
          enabled: _[1],
        };
      }) || [],
  };

  return sourcesArray;
};

const ShareRelay = ({ relay, exit, type = 1 }) => {
  const { t } = useTranslation();
  let fullURL = `${window.location.protocol}//${window.location.host}/r/${
    type === 1 ? "discover" : "notes"
  }?r=${relay}`;
  return (
    <div className="fixed-container fx-centered box-pad-h">
      <div
        className="sc-s-18 bg-sp box-pad-h-m box-pad-v-m fx-centered fx-col fx-start-h fx-start-v"
        style={{ width: "min(100%, 400px)", position: "relative" }}
      >
        <div className="fit-container fx-scattered">
          <div className="fx-centered">
            <RelayImage url={relay} size={30} />
            <h4 className="p-one-line">{relay}</h4>
          </div>
          <div className="close" style={{ position: "static" }} onClick={exit}>
            <div></div>
          </div>
        </div>
        <div className="box-pad-v-s"></div>
        <p className="c1-c box-pad-h-s">{t("A5DDopE")}</p>
        <div className="fit-container fx-centered fx-col">
          <div
            className="sc-s-d fit-container fx-scattered box-pad-h-m box-pad-v-s pointer"
            style={{ borderRadius: "var(--border-r-18)" }}
            onClick={() => copyText(fullURL, "URL is copied")}
          >
            <div>
              <p className="gray-c p-medium">{t("AhWzd8L")}</p>
              <p className="p-two-lines">{fullURL}</p>
            </div>
            <div className="copy"></div>
          </div>
          <div
            className="sc-s-d fit-container fx-scattered box-pad-h-m box-pad-v-s pointer"
            style={{ borderRadius: "var(--border-r-18)" }}
            onClick={() => copyText(relay, "URL is copied")}
          >
            <div>
              <p className="gray-c p-medium">{t("A6JlaiX")}</p>
              <p className="p-two-lines">{relay}</p>
            </div>
            <div className="copy"></div>
          </div>
        </div>
      </div>
    </div>
  );
};
