import React, { useEffect, useMemo, useRef, useState } from "react";
import Toggle from "@/Components/Toggle";
import { useDispatch, useSelector } from "react-redux";
import {
  getDefaultFilter,
  getUsersFromPubkeys,
  InitEvent,
} from "@/Helpers/Controlers";
import UserProfilePic from "@/Components/UserProfilePic";
import UserSearchBar from "@/Components/UserSearchBar";
import Select from "@/Components/Select";
import { setToast, setToPublish } from "@/Store/Slides/Publishers";
import OptionsDropdown from "@/Components/OptionsDropdown";
import { useTranslation } from "react-i18next";

export default function ContentFilter({
  selectedFilter,
  setSelectedFilter,
  type = 1,
}) {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const userKeys = useSelector((state) => state.userKeys);
  const userAppSettings = useSelector((state) => state.userAppSettings);
  const [showAddFilter, setShowAddFilter] = useState(false);
  const [filterToEdit, setFilterToEdit] = useState(false);
  const filters = useMemo(() => {
    if (userAppSettings && userAppSettings?.settings?.content_filters) {
      let filters = userAppSettings.settings.content_filters.filter(
        (_) => _.type === type
      );
      return filters;
    }
    return [];
  }, [userAppSettings]);
  const [showFilters, setShowFilters] = useState(false);
  const filtersRef = useRef(null);

  useEffect(() => {
    const handleOffClick = (e) => {
      e.stopPropagation();
      if (filtersRef.current && !filtersRef.current.contains(e.target))
        setShowFilters(false);
    };
    document.addEventListener("mousedown", handleOffClick);
    return () => {
      document.removeEventListener("mousedown", handleOffClick);
    };
  }, [filtersRef]);

  useEffect(() => {
    let checkFilter = localStorage.getItem(`${type}-selectedFilter`);
    if (!checkFilter) return;
    if (selectedFilter.default && filters.length > 0) {
      setSelectedFilter({ ...filters[0], index: 0 });
    } else if (!selectedFilter.default && filters.length > 0) {
      let checkFilter = filters.find(
        (_) => JSON.stringify(_) === JSON.stringify(selectedFilter)
      );
      if (!checkFilter) setSelectedFilter({ ...filters[0], index: 0 });
    } else {
      setSelectedFilter(getDefaultFilter(type));
    }
  }, [filters]);

  const handleFilters = () => {
    if (filters.length === 0) setShowAddFilter(true);
    if (filters.length > 0) setShowFilters(!showFilters);
  };

  const handleDeleteFilter = async (index) => {
    try {
      const contentFilter = {
        ...(userAppSettings.settings || { content_sources: {} }),
        content_filters: [
          ...(userAppSettings?.settings?.content_filters.filter(
            (_, _index) => _index !== index
          ) || []),
        ],
      };
      const event = {
        kind: 30078,
        content: JSON.stringify(contentFilter),
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
      setShowFilters(false);
    } catch (err) {
      console.log(err);
    }
  };

  if (!(userKeys && (userKeys?.sec || userKeys?.ext || userKeys?.bunker)))
    return null;

  return (
    <>
      {showAddFilter && (
        <div
          className="fixed-container box-pad-h fx-centered"
          onClick={(e) => {
            e.stopPropagation();
            setShowAddFilter(!showAddFilter);
            setFilterToEdit(false);
          }}
        >
          <div
            style={{
              width: "min(100%,450px)",
              position: "relative",
              overflow: "scroll",
              maxHeight: "75vh",
            }}
            className="sc-s bg-sp box-pad-h box-pad-v slide-up"
            onClick={(e) => {
              e.stopPropagation();
            }}
          >
            <div
              className="close"
              onClick={(e) => {
                setShowAddFilter(!showAddFilter);
                setFilterToEdit(false);
              }}
            >
              <div></div>
            </div>
            <HandleFilter
              exit={() => {
                setShowAddFilter(!showAddFilter);
                setFilterToEdit(false);
              }}
              filter={filterToEdit}
              prevSettings={userAppSettings}
              type={type}
            />
          </div>
        </div>
      )}
      <div
        style={{ position: "relative" }}
        className="fx-centered"
        ref={filtersRef}
      >
        {!selectedFilter.default && (
          <div
            className="if fx-scattered"
            style={{
              borderColor: "var(--very-dim-gray)",
              paddingRight: ".25rem",
              maxWidth: "200px",
            }}
          >
            <p className="p-one-line">{selectedFilter.title}</p>
            <div
              className="close"
              style={{ position: "static" }}
              onClick={() => {
                setShowFilters(false);
                setSelectedFilter(getDefaultFilter());
                localStorage.removeItem(`${type}-selectedFilter`);
              }}
            >
              <div style={{ backgroundColor: "transparent" }}></div>
            </div>
          </div>
        )}
        <div
          className="fx-centered if option pointer"
          style={{
            height: "40px",
            width: "40px",
            borderRadius: "50px",
            // width: !selectedFilter.default ? "max-content" : "40px",
            // borderRadius: !selectedFilter.default ? "" : "50px",
          }}
          onClick={handleFilters}
        >
          {/* {!selectedFilter.default && (
            <>
              <p className="p-maj">{selectedFilter.title}</p>
              <p className="gray-c">|</p>
            </>
          )} */}
          <div className="filter"></div>
        </div>
        {showFilters && (
          <div
            style={{
              position: "absolute",
              top: "110%",
              // right: "0",
              backgroundColor: "var(--dim-gray)",
              width: "300px",
              zIndex: 1000,
              rowGap: "4px",
              overflow: "visible",
            }}
            className="sc-s-18 bg-sp fx-centered fx-col fx-start-v pointer drop-down slide-down"
            onClick={() => setShowFilters(false)}
          >
            <div
              className="box-pad-h-s box-pad-v-s sc-s-18 fit-container fx-scattered"
              style={{
                backgroundColor: "var(--pale-gray)",
                borderRadius: "0",
                borderTopRightRadius: "var(--border-r-18)",
                borderTopLeftRadius: "var(--border-r-18)",
              }}
            >
              <p className="gray-c">{t("AMx89Qm")}</p>
              <div onClick={() => setShowAddFilter(true)}>
                <div className="plus-sign"></div>
              </div>
            </div>
            <div
              className="fx-centered fx-col fx-start-v fit-container"
              style={{ gap: 0, padding: ".25rem .45rem" }}
            >
              {filters.map((filter, index) => {
                return (
                  <div
                    key={index}
                    className={`pointer fit-container fx-scattered box-pad-h-s box-pad-v-s option-no-scale`}
                    style={{
                      height: "35px",
                      borderRadius: "var(--border-r-18)",
                      overflow: "visible",
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedFilter({ ...filter, index });
                      setShowFilters(false);
                      localStorage.setItem(`${type}-selectedFilter`, "true");
                    }}
                  >
                    <p className="p-maj p-one-line">{filter.title}</p>
                    <div className="fx-centered">
                      {selectedFilter.index === index && (
                        <div className="check-24"></div>
                      )}
                      <OptionsDropdown
                        vertical={false}
                        options={[
                          <div className="fit-container fx-centered fx-start-h option-no-scale box-pad-h-s box-pad-v-s">
                            <div className="edit"></div>
                            <p
                              onClick={(e) => {
                                e.stopPropagation();
                                setShowAddFilter(true);
                                setFilterToEdit({ ...filter, index });
                              }}
                            >
                              {t("AsXohpb")}
                            </p>
                          </div>,
                          <hr style={{ margin: "4px 0", padding: "0 5px" }} />,
                          <div className="fit-container fx-centered fx-start-h option-no-scale box-pad-h-s box-pad-v-s">
                            <div className="trash"> </div>
                            <p
                              className="red-c"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteFilter(index);
                              }}
                            >
                              {t("Almq94P")}
                            </p>
                          </div>,
                        ]}
                      />
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

const HandleFilter = ({ type = 1, filter, exit, prevSettings }) => {
  if (type === 1)
    return (
      <MixedContentFilter
        exit={exit}
        filter={filter}
        prevSettings={prevSettings}
      />
    );
  if (type === 2)
    return (
      <NotesFilter exit={exit} filter={filter} prevSettings={prevSettings} />
    );
};

const MixedContentFilter = ({ exit, filter, prevSettings }) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const [title, setTitle] = useState(filter.title || "");
  const [tempIncludedWord, setTempIncludedWord] = useState("");
  const [includedWords, setIncludedWords] = useState(
    filter.included_words || []
  );
  const [tempExcludedWord, setTempExcludedWord] = useState("");
  const [excludedWords, setExcludedWords] = useState(
    filter.excluded_words || []
  );
  const [postedBy, setPostedBy] = useState(
    getUsersFromPubkeys(filter.posted_by) || []
  );
  const [hideSensitive, setHideSensitive] = useState(
    filter.hide_sensitive || false
  );
  const [thumbnail, setThumbnail] = useState(filter.thumbnail || false);
  const [artMinWord, setArtMinWord] = useState(
    filter.for_articles?.min_words || 150
  );
  const [artWithMedia, setArtWithMedia] = useState(
    filter.for_articles?.media_only || false
  );
  const [curtItemCount, setCurtItemCount] = useState(
    filter.for_curations?.min_items || 4
  );
  const [curtType, setCurtType] = useState(filter.for_curations?.type || "all");
  const [vidSource, setVidSource] = useState(
    filter.for_videos?.source || "all"
  );
  const [from, setFrom] = useState(filter.from || null);
  const [to, setTo] = useState(filter.to || null);
  const [isLoading, setIsLoading] = useState(false);

  const handleIncludeWords = (e) => {
    if (e) e.preventDefault();
    if (!tempIncludedWord) return;
    let tempString = tempIncludedWord.trim().toLowerCase();
    if (excludedWords.includes(tempString)) {
      dispatch(
        setToast({
          type: 2,
          desc: t("A49050m"),
        })
      );
      return;
    }
    setIncludedWords((prev) => [...new Set([...prev, tempString])]);
    setTempIncludedWord("");
  };
  const handleIExcludeWords = (e) => {
    if (e) e.preventDefault();
    if (!tempExcludedWord) return;
    let tempString = tempExcludedWord.trim().toLowerCase();
    if (includedWords.includes(tempString)) {
      dispatch(
        setToast({
          type: 2,
          desc: t("AobQ9pm"),
        })
      );
      return;
    }
    setExcludedWords((prev) => [...new Set([...prev, tempString])]);
    setTempExcludedWord("");
  };
  const updateFilter = async () => {
    if (!title) {
      dispatch(
        setToast({
          type: 2,
          desc: t("AxzAeS0"),
        })
      );
      return;
    }
    try {
      setIsLoading(true);
      const toInject = {
        title,
        type: 1,
        included_words: includedWords,
        excluded_words: excludedWords,
        hide_sensitive: hideSensitive,
        from: from || null,
        to: to || null,
        thumbnail,
        posted_by: postedBy.map((_) => _.pubkey),
        for_articles: {
          min_words: artMinWord,
          media_only: artWithMedia,
        },
        for_curations: {
          type: curtType,
          min_items: curtItemCount,
        },
        for_videos: {
          source: vidSource,
        },
      };
      const contentFilter = {
        ...(prevSettings.settings || { content_sources: {} }),
        content_filters: [...(prevSettings?.settings?.content_filters || [])],
      };
      if (!filter) contentFilter.content_filters.push(toInject);
      else contentFilter.content_filters[filter.index] = toInject;
      const event = {
        kind: 30078,
        content: JSON.stringify(contentFilter),
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
        setIsLoading(false);
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
      setIsLoading(false);
    }
  };

  return (
    <div className="fit-container fx-centered fx-start-h fx-start-v fx-col">
      <h4>{filter ? t("AvUZCrj") : t("ANtvfQr")}</h4>
      <div className="fit-container fx-centered fx-col">
        <input
          type="text"
          className="if ifs-full"
          placeholder={t("AZ0I7NJ")}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <div className="fit-container fx-centered">
          <div className=" fx">
            <p className="gray-c">{t("AZFMiVf")}</p>
            <input
              type="date"
              value={from ? new Date(from * 1000).toJSON()?.split("T")[0] : ""}
              onChange={(e) => {
                setFrom(Math.floor(new Date(e.target.value).getTime() / 1000));
              }}
              className="if ifs-full"
            />
          </div>
          <div className=" fx">
            <p className="gray-c">{t("AWUmU6P")}</p>
            <input
              type="date"
              value={to ? new Date(to * 1000).toJSON()?.split("T")[0] : ""}
              onChange={(e) => {
                setTo(Math.floor(new Date(e.target.value).getTime() / 1000));
              }}
              className="if ifs-full"
            />
          </div>
        </div>
        <form
          className="fit-container fx-scattered"
          onSubmit={handleIncludeWords}
        >
          <input
            type="text"
            className="if ifs-full"
            placeholder={t("A492vpu")}
            value={tempIncludedWord}
            onChange={(e) => setTempIncludedWord(e.target.value)}
          />
          <div className="round-icon-small" onClick={handleIncludeWords}>
            <div className="plus-sign"></div>
          </div>
        </form>
        {includedWords.length > 0 && (
          <div className="fit-container fx-centered fx-wrap fx-start-h fx-start-v">
            {includedWords.map((tag, index) => {
              return (
                <div
                  key={index}
                  className="fx-centered box-pad-h-s box-pad-v-s sc-s-18"
                >
                  <p>{tag}</p>
                  <div
                    style={{ rotate: "-45deg" }}
                    className="box-pad-h-s"
                    onClick={() =>
                      setIncludedWords((prev) => prev.filter((_) => _ !== tag))
                    }
                  >
                    <div className="plus-sign"></div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
        <form
          className="fit-container fx-scattered"
          onSubmit={handleIExcludeWords}
        >
          <input
            type="text"
            className="if ifs-full"
            placeholder={t("A07kVBP")}
            value={tempExcludedWord}
            onChange={(e) => setTempExcludedWord(e.target.value)}
          />
          <div className="round-icon-small" onClick={handleIExcludeWords}>
            <div className="plus-sign"></div>
          </div>
        </form>
        {excludedWords.length > 0 && (
          <div className="fit-container fx-centered fx-wrap fx-start-h fx-start-v">
            {excludedWords.map((tag, index) => {
              return (
                <div
                  key={index}
                  className="fx-centered box-pad-h-s box-pad-v-s sc-s-18"
                >
                  <p>{tag}</p>
                  <div
                    style={{ rotate: "-45deg" }}
                    className="box-pad-h-s"
                    onClick={() =>
                      setExcludedWords((prev) => prev.filter((_) => _ !== tag))
                    }
                  >
                    <div className="plus-sign"></div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="fit-container fx-scattered if">
          <p>{t("ATTdCzC")}</p>
          <Toggle status={hideSensitive} setStatus={setHideSensitive} />
        </div>
        <div className="fit-container fx-scattered if">
          <p>{t("AihWcTv")}</p>
          <Toggle status={thumbnail} setStatus={setThumbnail} />
        </div>
        <UserSearchBar
          placeholder={t("AY0XZEx")}
          full={true}
          getUserMetadata={(data) =>
            setPostedBy((prev) => [...new Set([...prev, data])])
          }
        />
        {postedBy.length > 0 && (
          <div className="fit-container fx-centered fx-start-h fx-start-v fx-wrap">
            {postedBy.map((_) => {
              return (
                <div style={{ position: "relative" }}>
                  <div
                    className="close"
                    style={{ top: "-5px", right: "-5px" }}
                    onClick={() =>
                      setPostedBy((prev) =>
                        prev.filter((__) => __.pubkey !== _.pubkey)
                      )
                    }
                  >
                    <div></div>
                  </div>
                  <UserProfilePic
                    user_id={_.pubkey}
                    allowClick={false}
                    size={50}
                    mainAccountUser={false}
                    img={_.picture}
                  />
                </div>
              );
            })}
          </div>
        )}
        <div className="fit-container">
          <p className="gray-c">{t("AJzDBYE")}</p>
        </div>
        <div
          className="fit-container fx-scattered fx-col fx-start-v"
          style={{ gap: 0 }}
        >
          <p>{t("ACWuAA0")}</p>
          <div className="fit-container fx-scattered">
            <input
              type="range"
              className="ifs-full"
              value={artMinWord}
              onChange={(e) => setArtMinWord(e.target.value)}
              max={1000}
            />
            <div className="round-icon-small">
              <p className="p-medium gray-c">{artMinWord}</p>
            </div>
          </div>
        </div>
        <div className="fit-container fx-scattered if">
          <p>{t("AWKxOl9")}</p>
          <Toggle status={artWithMedia} setStatus={setArtWithMedia} />
        </div>
        <div className="fit-container">
          <p className="gray-c">{t("ArqivBc")}</p>
        </div>
        <div className="fit-container fx-scattered">
          <p>{t("AhkzJxL")}</p>
          <Select
            options={[
              { display_name: t("AR9ctVs"), value: "all" },
              { display_name: "YouTube", value: "youtube" },
              { display_name: "Vimeo", value: "vimeo" },
              { display_name: t("AnGyWRY"), value: "other" },
            ]}
            value={vidSource}
            setSelectedValue={setVidSource}
          />
        </div>
        <div className="fit-container">
          <p className="gray-c">{t("ATVduCp")}</p>
        </div>
        <div className="fit-container fx-scattered">
          <p>{t("AivzJL3")}</p>
          <Select
            options={[
              { display_name: t("AR9ctVs"), value: "all" },
              { display_name: "Articles", value: "articles" },
              { display_name: "Videos", value: "videos" },
            ]}
            value={curtType}
            setSelectedValue={setCurtType}
          />
        </div>
        <div
          className="fit-container fx-scattered fx-col fx-start-v"
          style={{ gap: 0 }}
        >
          <p>{t("AjreNgk")}</p>
          <div className="fit-container fx-scattered">
            <input
              type="range"
              className="ifs-full"
              value={curtItemCount}
              onChange={(e) => setCurtItemCount(e.target.value)}
              max={10}
            />
            <div className="round-icon-small">
              <p className="p-medium gray-c">{curtItemCount}</p>
            </div>
          </div>
        </div>

        <button className="btn btn-normal btn-full" onClick={updateFilter}>
          {filter ? t("AvUZCrj") : t("ANtvfQr")}
        </button>
      </div>
    </div>
  );
};
const NotesFilter = ({ exit, filter, prevSettings }) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const [title, setTitle] = useState(filter.title || "");
  const [tempIncludedWord, setTempIncludedWord] = useState("");
  const [includedWords, setIncludedWords] = useState(
    filter.included_words || []
  );
  const [tempExcludedWord, setTempExcludedWord] = useState("");
  const [excludedWords, setExcludedWords] = useState(
    filter.excluded_words || []
  );
  const [postedBy, setPostedBy] = useState(
    getUsersFromPubkeys(filter.posted_by) || []
  );
  const [mediaOnly, setMediaOnly] = useState(filter.media_only || false);
  const [from, setFrom] = useState(filter.from || false);
  const [to, setTo] = useState(filter.to || false);
  const [isLoading, setIsLoading] = useState(false);

  const handleIncludeWords = (e) => {
    if (e) e.preventDefault();
    if (!tempIncludedWord) return;
    let tempString = tempIncludedWord.trim().toLowerCase();
    if (excludedWords.includes(tempString)) {
      dispatch(
        setToast({
          type: 2,
          desc: t("A49050m"),
        })
      );
      return;
    }
    setIncludedWords((prev) => [...new Set([...prev, tempString])]);
    setTempIncludedWord("");
  };
  const handleIExcludeWords = (e) => {
    if (e) e.preventDefault();
    if (!tempExcludedWord) return;
    let tempString = tempExcludedWord.trim().toLowerCase();
    if (includedWords.includes(tempString)) {
      dispatch(
        setToast({
          type: 2,
          desc: t("AobQ9pm"),
        })
      );
      return;
    }
    setExcludedWords((prev) => [...new Set([...prev, tempString])]);
    setTempExcludedWord("");
  };
  const updateFilter = async () => {
    if (!title) {
      dispatch(
        setToast({
          type: 2,
          desc: t("AxzAeS0"),
        })
      );
      return;
    }
    try {
      setIsLoading(true);
      const toInject = {
        title,
        type: 2,
        included_words: includedWords,
        excluded_words: excludedWords,
        posted_by: postedBy.map((_) => _.pubkey),
        media_only: mediaOnly,
        from: from || null,
        to: to || null,
      };
      const contentFilter = {
        ...(prevSettings.settings || { content_sources: {} }),
        content_filters: [...(prevSettings?.settings?.content_filters || [])],
      };
      if (!filter) contentFilter.content_filters.push(toInject);
      else contentFilter.content_filters[filter.index] = toInject;
      const event = {
        kind: 30078,
        content: JSON.stringify(contentFilter),
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
        setIsLoading(false);
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
      setIsLoading(false);
    }
  };

  return (
    <div className="fit-container fx-centered fx-start-h fx-start-v fx-col">
      <h4>{filter ? t("AvUZCrj") : t("ANtvfQr")}</h4>
      <div className="fit-container fx-centered fx-col">
        <input
          type="text"
          className="if ifs-full"
          placeholder={t("AZ0I7NJ")}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <div className="fit-container fx-centered">
          <div className=" fx">
            <p className="gray-c">{t("AZFMiVf")}</p>
            <input
              type="date"
              value={from ? new Date(from * 1000).toJSON()?.split("T")[0] : ""}
              onChange={(e) => {
                setFrom(Math.floor(new Date(e.target.value).getTime() / 1000));
              }}
              className="if ifs-full"
            />
          </div>
          <div className=" fx">
            <p className="gray-c">{t("AWUmU6P")}</p>
            <input
              type="date"
              value={to ? new Date(to * 1000).toJSON()?.split("T")[0] : ""}
              onChange={(e) => {
                setTo(Math.floor(new Date(e.target.value).getTime() / 1000));
              }}
              className="if ifs-full"
            />
          </div>
        </div>
        <form
          className="fit-container fx-scattered"
          onSubmit={handleIncludeWords}
        >
          <input
            type="text"
            className="if ifs-full"
            placeholder={t("A492vpu")}
            value={tempIncludedWord}
            onChange={(e) => setTempIncludedWord(e.target.value)}
          />
          <div className="round-icon-small" onClick={handleIncludeWords}>
            <div className="plus-sign"></div>
          </div>
        </form>
        {includedWords.length > 0 && (
          <div className="fit-container fx-centered fx-wrap fx-start-h fx-start-v">
            {includedWords.map((tag, index) => {
              return (
                <div
                  key={index}
                  className="fx-centered box-pad-h-s box-pad-v-s sc-s-18"
                >
                  <p>{tag}</p>
                  <div
                    style={{ rotate: "-45deg" }}
                    className="box-pad-h-s"
                    onClick={() =>
                      setIncludedWords((prev) => prev.filter((_) => _ !== tag))
                    }
                  >
                    <div className="plus-sign"></div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
        <form
          className="fit-container fx-scattered"
          onSubmit={handleIExcludeWords}
        >
          <input
            type="text"
            className="if ifs-full"
            placeholder={t("A07kVBP")}
            value={tempExcludedWord}
            onChange={(e) => setTempExcludedWord(e.target.value)}
          />
          <div className="round-icon-small" onClick={handleIExcludeWords}>
            <div className="plus-sign"></div>
          </div>
        </form>
        {excludedWords.length > 0 && (
          <div className="fit-container fx-centered fx-wrap fx-start-h fx-start-v">
            {excludedWords.map((tag, index) => {
              return (
                <div
                  key={index}
                  className="fx-centered box-pad-h-s box-pad-v-s sc-s-18"
                >
                  <p>{tag}</p>
                  <div
                    style={{ rotate: "-45deg" }}
                    className="box-pad-h-s"
                    onClick={() =>
                      setExcludedWords((prev) => prev.filter((_) => _ !== tag))
                    }
                  >
                    <div className="plus-sign"></div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="fit-container fx-scattered if">
          <p>{t("A3COVRL")}</p>
          <Toggle status={mediaOnly} setStatus={setMediaOnly} />
        </div>
        <UserSearchBar
          placeholder={t("AY0XZEx")}
          full={true}
          getUserMetadata={(data) =>
            setPostedBy((prev) => [...new Set([...prev, data])])
          }
          displayAbove={true}
        />
        {postedBy.length > 0 && (
          <div className="fit-container fx-centered fx-start-h fx-start-v fx-wrap">
            {postedBy.map((_) => {
              return (
                <div style={{ position: "relative" }}>
                  <div
                    className="close"
                    style={{ top: "-5px", right: "-5px" }}
                    onClick={() =>
                      setPostedBy((prev) =>
                        prev.filter((__) => __.pubkey !== _.pubkey)
                      )
                    }
                  >
                    <div></div>
                  </div>
                  <UserProfilePic
                    user_id={_.pubkey}
                    allowClick={false}
                    size={50}
                    mainAccountUser={false}
                    img={_.picture}
                  />
                </div>
              );
            })}
          </div>
        )}
        <button className="btn btn-normal btn-full" onClick={updateFilter}>
          {filter ? t("AvUZCrj") : t("ANtvfQr")}
        </button>
      </div>
    </div>
  );
};
