import React, { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import CustomizeContentSource from "./CustomizeContentSource";
import ShareRelay from "./ShareRelay";
import ContentFeedCategoryPreview from "./ContentFeedCategoryPreview";
import useRelaysSet from "@/Hooks/useRelaysSet";
import { getParsedRelaySet } from "@/Helpers/Encryptions";
import usePacks from "@/Hooks/usePacks";
import SharePackLink from "./SharePackLink";
import Icon from "@/Components/Icon";
import { iconsNames } from "@/Content/IconV2URL";
import MobileSheet from "@/Components/MobileSheet";
import useIsMobile from "@/Hooks/useIsMobile";

export default function ContentSource({
  selectedCategory,
  setSelectedCategory,
  type = 1,
  barRef,
}) {
  const { t } = useTranslation();
  const userAppSettings = useSelector((state) => state.userAppSettings);
  const userFavRelays = useSelector((state) => state.userFavRelays);
  const userKeys = useSelector((state) => state.userKeys);
  const { userStarterPacksSimplified, userMediaPacksSimplified } = usePacks();
  const { userRelaysSet } = useRelaysSet();
  const [showOptions, setShowOptions] = useState(false);
  const [showFeedMarketplace, setShowFeedMarketPlace] = useState(false);
  const [showRelaySharing, setshowRelaySharing] = useState(false);
  const [showPackSharing, setShowPackSharing] = useState(false);
  const optionsRef = useRef(null);
  const relaysSet = useMemo(() => {
    let favSet = userFavRelays.tags
      ? [
        ...new Set(
          userFavRelays.tags.filter((_) => _[0] === "a").map((_) => _[1]),
        ),
      ]
      : [];
    if (favSet.length === 0) return [];
    let relaysSet = favSet
      .map((_) =>
        userRelaysSet[_] ? getParsedRelaySet(userRelaysSet[_]) : null,
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
      let options = [
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
      ];
      if (type === 2)
        options = [
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
      if (type === 3)
        options = [
          {
            group_name: t("A8Y9rVt"),
            value: "cf",
            list: [
              {
                display_name: t("A0gGIxM"),
                value: "global",
                enabled: true,
              },
            ],
          },
        ];
      return options;
    }
    let options = [
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
    ];
    if (type === 2)
      options = [
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
            { display_name: t("AMxeg1d"), value: "trending", enabled: true },
            { display_name: t("A0gGIxM"), value: "global", enabled: true },
            { display_name: t("AAg9D6c"), value: "paid", enabled: true },
            { display_name: t("AM4vyRX"), value: "widgets", enabled: true },
          ],
        },
      ];
    if (type === 3)
      options = [
        {
          group_name: t("A8Y9rVt"),
          value: "cf",
          list: [
            { display_name: t("AiAJcg1"), value: "recent", enabled: true },
            { display_name: t("A0gGIxM"), value: "global", enabled: true },
          ],
        },
      ];
    if (
      type === 1 &&
      userAppSettings?.settings?.content_sources?.mixed_content
    ) {
      let sources = userAppSettings?.settings?.content_sources?.mixed_content;
      return getSourcesArray(sources, options[0].list, t, type);
    }
    if (type === 2 && userAppSettings?.settings?.content_sources?.notes) {
      let sources = userAppSettings?.settings?.content_sources?.notes;
      return getSourcesArray(sources, options[0].list, t, type);
    }
    if (type === 3 && userAppSettings?.settings?.content_sources?.media) {
      let sources = userAppSettings?.settings?.content_sources?.media;
      return getSourcesArray(sources, options[0].list, t, type);
    }
    return options;
  }, [userAppSettings, userKeys]);

  const [dismissingSource, setDismissingSource] = useState(false);
  const isMobile = useIsMobile();

  const closeSource = () => {
    if (isMobile) { setShowOptions(false); return; }
    setDismissingSource(true);
    setTimeout(() => { setShowOptions(false); setDismissingSource(false); }, 220);
  };


  useEffect(() => {
    let categoryHistory;
    try {
      categoryHistory = JSON.parse(
        localStorage.getItem(`selectedCategorySource-${type}`),
      );
    } catch { }
    let selectedCategory_ = {
      group: optionsList[0].value,
      ...optionsList[0].list[0],
    };
    setSelectedCategory(
      userKeys ? categoryHistory || selectedCategory_ : selectedCategory_,
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
      }),
    );
    closeSource();
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
      {showPackSharing && (
        <SharePackLink
          d={showPackSharing}
          exit={(e) => {
            e.stopPropagation();
            setShowPackSharing();
          }}
          type={type}
        />
      )}
      <div ref={optionsRef}>
        <div
          className="fx-scattered if pointer"
          style={{
            height: "40px",
            padding: "0 .5rem",
            maxWidth: "300px",
            border: "none",
          }}
          onClick={(e) => {
            e.stopPropagation();
            showOptions ? closeSource() : setShowOptions(true);
          }}
        >
          <ContentFeedCategoryPreview
            category={selectedCategory}
            minimal={true}
          />
          <Icon name="arrow" />
        </div>
        {isMobile ? (
          <MobileSheet
            open={showOptions}
            onClose={closeSource}
            title={type === 1 ? t("AuUadPD") : t("A84qogb")}
            titleRight={userKeys && (userKeys?.sec || userKeys?.ext || userKeys?.bunker) && (
              <div onClick={() => setShowFeedMarketPlace(!showFeedMarketplace)} style={{ padding: "4px" }}>
                <Icon v={2} name={iconsNames.settings} size={20} opacity=".5" />
              </div>
            )}
          >
            <div className="fx-centered fx-col fx-start-v fit-container" style={{ gap: 0, padding: "0 8px" }}>
              {optionsList.map((option, index) => (
                <div key={index} className="fx-centered fx-col fx-start-v fit-container">
                  {optionsList.length > 1 && (
                    <p className="c1-c p-medium" style={{ padding: "8px 12px 4px", alignSelf: "flex-start" }}>{option.group_name}</p>
                  )}
                  {option.list.map((_, _index) => _.enabled && (
                    <div
                      key={_index}
                      className="pointer fit-container fx-scattered option-no-scale"
                      style={{ padding: "0.85rem 1rem", borderRadius: "12px", fontSize: "1rem" }}
                      onClick={(e) => handleSelectCategory(e, _, option)}
                    >
                      <ContentFeedCategoryPreview category={{ group: option.value, ..._ }} />
                      <div className="fx-centered" style={{ gap: "8px" }}>
                        {option.value === "af" && (
                          <Icon name="share-icon" onClick={(e) => { e.stopPropagation(); setshowRelaySharing(_.value); }} />
                        )}
                        {selectedCategory.value === _.value && <Icon name="check" size={20} />}
                      </div>
                    </div>
                  ))}
                </div>
              ))}
              {(favRelays.length > 0 || relaysSet.length > 0) && (
                <p className="c1-c p-medium" style={{ padding: "12px 12px 4px", alignSelf: "flex-start" }}>{t("AhSpIKN")}</p>
              )}
              {relaysSet.length > 0 && (
                <div className="fx-centered fx-col fx-start-v fit-container">
                  <p className="gray-c p-medium" style={{ padding: "4px 12px", alignSelf: "flex-start" }}>{t("AgRMPL3")}</p>
                  {relaysSet.map((metadata, _index) => {
                    const isThereRelays = metadata.relays.length > 0;
                    return (
                      <div
                        key={_index}
                        className="pointer fit-container fx-scattered option-no-scale"
                        style={{ padding: "0.85rem 1rem", borderRadius: "12px", opacity: isThereRelays ? 1 : 0.7, cursor: isThereRelays ? "pointer" : "not-allowed", fontSize: "1rem" }}
                        onClick={(e) => isThereRelays ? handleSelectCategory(e, { ...metadata, value: metadata.aTag }, { value: "rsf" }) : null}
                      >
                        <ContentFeedCategoryPreview category={{ ...metadata, group: "rsf" }} />
                        <div className="fx-centered" style={{ gap: "8px" }}>
                          <div className={`sticker sticker-normal sticker-small ${isThereRelays ? "sticker-green-side" : "sticker-red-side"}`} style={{ minWidth: "max-content" }}>
                            {metadata.relays.length} {metadata.relays.length === 1 ? "relay" : "relays"}
                          </div>
                          {selectedCategory.value === metadata.aTag && <Icon name="check" size={20} />}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
              {favRelays.length > 0 && (
                <div className="fx-centered fx-col fx-start-v fit-container">
                  <p className="gray-c p-medium" style={{ padding: "4px 12px", alignSelf: "flex-start" }}>{t("A1NJKQa")}</p>
                  {favRelays.map((_, _index) => (
                    <div
                      key={_index}
                      className="pointer fit-container fx-scattered option-no-scale"
                      style={{ padding: "0.85rem 1rem", borderRadius: "12px", fontSize: "1rem" }}
                      onClick={(e) => handleSelectCategory(e, _, { value: "af" })}
                    >
                      <ContentFeedCategoryPreview category={{ group: "af", ..._ }} />
                      <div className="fx-centered" style={{ gap: "8px" }}>
                        {selectedCategory.value === _.value && <Icon name="check" size={20} />}
                        <Icon name="share-icon" onClick={(e) => { e.stopPropagation(); setshowRelaySharing(_.value); }} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {((userStarterPacksSimplified.length > 0 && type !== 3) || (userMediaPacksSimplified.length > 0 && type === 3)) && (
                <div className="fx-centered fx-col fx-start-v fit-container">
                  <p className="c1-c p-medium" style={{ padding: "12px 12px 4px", alignSelf: "flex-start" }}>{type === 3 ? t("AusIycI") : t("AVzZUeP")}</p>
                  {[...(type === 3 ? userMediaPacksSimplified : userStarterPacksSimplified)].map((metadata, _index) => (
                    <div
                      key={_index}
                      className="pointer fit-container fx-scattered option-no-scale"
                      style={{ padding: "0.85rem 1rem", borderRadius: "12px", fontSize: "1rem" }}
                      onClick={(e) => handleSelectCategory(e, { ...metadata, value: metadata.aTag }, { value: "pf" })}
                    >
                      <ContentFeedCategoryPreview category={{ ...metadata, group: "pf" }} />
                      <div className="fx-centered" style={{ gap: "8px" }}>
                        {selectedCategory.value === metadata.aTag && <Icon name="check" size={20} />}
                        <Icon name="share-icon" onClick={(e) => { e.stopPropagation(); setShowPackSharing(metadata.d); }} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {favRelays.length === 0 && relaysSet.length === 0 && (
                <div className="fit-container fx-centered fx-col" style={{ padding: "16px 12px" }}>
                  <p className="p-centered gray-c">{t("AJbVpAT")}</p>
                  <p className="p-centered gray-c p-medium" style={{ marginTop: "4px" }}>{t("AyV6Rei")}</p>
                  <button className="btn btn-normal btn-small" style={{ marginTop: "12px" }} onClick={() => setShowFeedMarketPlace(!showFeedMarketplace)}>
                    {t("A0zZsLz")}
                  </button>
                </div>
              )}
            </div>
          </MobileSheet>
        ) : (
          showOptions && typeof document !== "undefined" && createPortal(
            <SourceFilterPortalPanel
              barRef={barRef}
              optionsRef={optionsRef}
              dismissing={dismissingSource}
              onClose={closeSource}
              maxHeight={userFavRelays.relays?.length === 0 ? "80vh" : "40vh"}
            >
              <div
                className="fit-container fx-scattered"
                style={{ padding: "10px 12px 6px", position: "sticky", top: 0, zIndex: 1, borderBottom: "1px solid rgba(255,255,255,0.06)" }}
              >
                <p className="gray-c p-medium">{type === 1 ? t("AuUadPD") : t("A84qogb")}</p>
                {userKeys && (userKeys?.sec || userKeys?.ext || userKeys?.bunker) && (
                  <div
                    onClick={() => {
                      setShowFeedMarketPlace(!showFeedMarketplace);
                    }}
                  >
                    <Icon v={2} name={iconsNames.settings} size={16} opacity=".5" />
                  </div>
                )}
              </div>
              <div className="fx-centered fx-col fx-start-v fit-container" style={{ gap: 0, padding: ".25rem .45rem" }}>
                {optionsList.map((option, index) => (
                  <div key={index} className="fx-centered fx-col fx-start-v fit-container">
                    <h5 className="c1-c box-pad-h-s">{option.group_name}</h5>
                    <div className="fit-container fx-centered fx-col fx-start-h fx-start-v" style={{ gap: 0, marginBottom: ".5rem" }}>
                      {option.list.map((_, _index) => _.enabled && (
                        <div key={_index} className="pointer fit-container box-pad-h-s box-pad-v-s fx-scattered option-no-scale" style={{ borderRadius: "var(--border-r-18)" }} onClick={(e) => handleSelectCategory(e, _, option)}>
                          <ContentFeedCategoryPreview category={{ group: option.value, ..._ }} />
                          <div className="fx-centered">
                            {selectedCategory.value === _.value && <Icon name="check" size={24} />}
                            {option.value === "af" && <Icon name="share-icon" onClick={(e) => { e.stopPropagation(); setshowRelaySharing(_.value); }} />}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
                {(favRelays.length > 0 || relaysSet.length > 0) && (
                  <h5 className="c1-c box-pad-h-s">{t("AhSpIKN")}</h5>
                )}
                {relaysSet.length > 0 && (
                  <div className="fit-container fx-centered fx-col fx-start-h fx-start-v" style={{ gap: 0, marginBottom: ".5rem" }}>
                    <p className="gray-c p-medium box-pad-h-s">{t("AgRMPL3")}</p>
                    {relaysSet.map((metadata, _index) => {
                      const isThereRelays = metadata.relays.length > 0;
                      return (
                        <div
                          key={_index}
                          className="pointer fit-container box-pad-h-s box-pad-v-s fx-scattered option-no-scale"
                          style={{ borderRadius: "var(--border-r-18)", opacity: isThereRelays ? 1 : 0.7, cursor: isThereRelays ? "pointer" : "not-allowed" }}
                          onClick={(e) => isThereRelays ? handleSelectCategory(e, { ...metadata, value: metadata.aTag }, { value: "rsf" }) : null}
                        >
                          <ContentFeedCategoryPreview category={{ ...metadata, group: "rsf" }} />
                          <div className="fx-centered" style={{ gap: "8px" }}>
                            <div className={`sticker sticker-normal sticker-small ${isThereRelays ? "sticker-green-side" : "sticker-red-side"}`} style={{ minWidth: "max-content" }}>
                              {metadata.relays.length} {metadata.relays.length === 1 ? "relay" : "relays"}
                            </div>
                            {selectedCategory.value === metadata.aTag && <Icon name="check" size={24} />}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
                {favRelays.length > 0 && (
                  <div className="fit-container fx-centered fx-col fx-start-h fx-start-v" style={{ gap: 0, marginBottom: ".5rem" }}>
                    <p className="gray-c p-medium box-pad-h-s">{t("A1NJKQa")}</p>
                    {favRelays.map((_, _index) => (
                      <div key={_index} className="pointer fit-container box-pad-h-s box-pad-v-s fx-scattered option-no-scale" style={{ borderRadius: "var(--border-r-18)" }} onClick={(e) => handleSelectCategory(e, _, { value: "af" })}>
                        <ContentFeedCategoryPreview category={{ group: "af", ..._ }} />
                        <div className="fx-centered" style={{ gap: "8px" }}>
                          {selectedCategory.value === _.value && <Icon name="check" size={24} />}
                          <Icon name="share-icon" onClick={(e) => { e.stopPropagation(); setshowRelaySharing(_.value); }} />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {((userStarterPacksSimplified.length > 0 && type !== 3) || (userMediaPacksSimplified.length > 0 && type === 3)) && (
                  <div className="fit-container fx-centered fx-col fx-start-v">
                    <h5 className="c1-c box-pad-h-s">{type === 3 ? t("AusIycI") : t("AVzZUeP")}</h5>
                    <div className="fit-container fx-centered fx-col fx-start-h fx-start-v" style={{ gap: 0, marginBottom: ".5rem" }}>
                      {[...(type === 3 ? userMediaPacksSimplified : userStarterPacksSimplified)].map((metadata, _index) => (
                        <div key={_index} className="pointer fit-container box-pad-h-s box-pad-v-s fx-scattered option-no-scale" style={{ borderRadius: "var(--border-r-18)" }} onClick={(e) => handleSelectCategory(e, { ...metadata, value: metadata.aTag }, { value: "pf" })}>
                          <ContentFeedCategoryPreview category={{ ...metadata, group: "pf" }} />
                          <div className="fx-centered" style={{ gap: "8px" }}>
                            {selectedCategory.value === metadata.aTag && <Icon name="check" size={24} />}
                            <Icon name="share-icon" onClick={(e) => { e.stopPropagation(); setShowPackSharing(metadata.d); }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {favRelays.length === 0 && relaysSet.length === 0 && (
                  <div className="fit-container fx-centered fx-col" style={{ padding: "16px 12px" }}>
                    <p className="p-centered gray-c">{t("AJbVpAT")}</p>
                    <p className="p-centered gray-c p-medium" style={{ marginTop: "4px" }}>{t("AyV6Rei")}</p>
                    <button className="btn btn-normal btn-small" style={{ marginTop: "12px" }} onClick={() => { setShowFeedMarketPlace(!showFeedMarketplace); }}>
                      {t("A0zZsLz")}
                    </button>
                  </div>
                )}
              </div>
            </SourceFilterPortalPanel>,
            document.body
          )
        )}
      </div>
    </>
  );
}

function SourceFilterPortalPanel({ barRef, optionsRef, dismissing, onClose, maxHeight, children }) {
  const panelRef = useRef(null);
  const [pos, setPos] = useState(null);

  useEffect(() => {
    if (!barRef?.current) return;
    const bar = barRef.current.getBoundingClientRect();
    setPos({ top: bar.bottom + 6, centerX: bar.left + bar.width / 2 });
  }, [barRef]);

  useEffect(() => {
    const handleClick = (e) => {
      if (
        panelRef.current && !panelRef.current.contains(e.target) &&
        optionsRef.current && !optionsRef.current.contains(e.target)
      ) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [onClose, optionsRef]);

  if (!pos) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: pos.top,
        left: pos.centerX,
        transform: "translateX(-50%)",
        width: "300px",
        zIndex: 99999,
      }}
    >
      <div
        ref={panelRef}
        className={`bg-dropdown di-wrapper${dismissing ? " dismissing" : ""}`}
        style={{ maxHeight: maxHeight || "60vh", overflowY: "auto", overflowX: "hidden" }}
      >
        {children}
      </div>
    </div>
  );
}

const getSourcesArray = (sources, cfBackup, t, type) => {
  let newSources = [];
  if (type === 2) newSources = ["trending"];
  let sourcesArray = [];
  let community_feed_keys = {
    top: t("AZKPdUC"),
    network: t("AnwFQtj"),
    global: t("A0gGIxM"),
    recent: t("AiAJcg1"),
    trending: t("AMxeg1d"),
    recent_with_replies: t("AgF8nZU"),
    paid: t("AAg9D6c"),
    widgets: t("AM4vyRX"),
  };
  let sourcesList = sources["community"]?.list.map((_) => {
    let value = _[0].replaceAll("-", "_");
    return {
      display_name: community_feed_keys[value] || "N/A",
      value: value,
      enabled: _[1],
    };
  });
  let isNew = newSources.filter((_) => !sourcesList.find((s) => s.value === _));

  if (isNew && newSources.length > 0)
    sourcesList = [
      ...sourcesList,
      ...isNew.map((_) => ({
        display_name: community_feed_keys[_] || "N/A",
        value: _,
        enabled: true,
      })),
    ];
  if (newSources.length === 0) sourcesList = cfBackup;

  sourcesArray[0] = {
    group_name: t("A8Y9rVt"),
    value: "cf",
    list: sourcesList,
  };
  return sourcesArray;
};
