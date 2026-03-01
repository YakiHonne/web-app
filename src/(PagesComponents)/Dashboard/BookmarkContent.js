import React, { useEffect, useMemo, useState } from "react";
import Date_ from "@/Components/Date_";
import { getSubData } from "@/Helpers/Controlers";
import { convertDate, getParsedRepEvent } from "@/Helpers/Encryptions";
import { getParsedNote } from "@/Helpers/ClientHelpers";
import Select from "@/Components/Select";
import BookmarkEvent from "@/Components/BookmarkEvent";
import LoadingLogo from "@/Components/LoadingLogo";
import { useTranslation } from "react-i18next";
import Link from "next/link";

export default function BookmarkContent({ bookmark, exit }) {
  const { t } = useTranslation();
  const [content, setContent] = useState([]);
  const [showFilter, setShowFilter] = useState(false);
  const [postKind, setPostKind] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const bookmarkTags = useMemo(() => {
    return bookmark.tags
      .filter((tag) => ["r", "t"].includes(tag[0]))
      .map((tag) => ({ value: tag, kind: tag[0] === "r" ? 2 : 3 }));
  }, [bookmark]);
  const itemsNumber = useMemo(() => {
    let allCount = bookmarkTags.length + content.length;
    if (postKind === 0)
      return allCount >= 10 || allCount === 0 ? allCount : `0${allCount}`;
    let num =
      content.filter((item) => item.kind === postKind).length +
      bookmarkTags.filter((tag) => tag.kind === postKind).length;
    return num >= 10 || num === 0 ? num : `0${num}`;
  }, [postKind, content, bookmarkTags]);
  const eventKindsDisplayName = {
    1: t("Az5ftet"),
    11: t("Az5ftet"),
    7: t("Alz0E9Y"),
    6: t("Aai65RJ"),
    30023: t("AyYkCrS"),
    30024: t("AsQyoY0"),
    30004: t("Ac6UnVb"),
    30005: t("Ac6UnVb"),
    34235: t("AVdmifm"),
    22: t("AVdmifm"),
    21: t("AVdmifm"),
    20: t("Aa73Zgk"),
    34236: t("AVdmifm"),
    300331: t("AkvXmyz"),
    30033: t("AkvXmyz"),
    2: t("ArBFIr1"),
    3: t("AUupZYw"),
  };
  const bookmarkFilterOptions = [
    {
      display_name: "All content",
      value: 0,
    },
    {
      display_name: t("AesMg52"),
      value: 30023,
    },
    {
      display_name: "Articles curations",
      value: 30004,
    },
    {
      display_name: "Video curations",
      value: 30005,
    },
    {
      display_name: "Notes",
      value: 1,
    },
    {
      display_name: "Videos",
      value: 34235,
    },
    {
      display_name: "Links",
      value: 2,
    },
    {
      display_name: "Hashtags",
      value: 3,
    },
  ];
  useEffect(() => {
    const fetchData = async () => {
      let tags = bookmark.tags.filter((tag) => ["a", "e"].includes(tag[0]));
      let aDs = [];
      let aKinds = [];
      let eIDs = [];
      for (let tag of tags) {
        tag[0] === "a" &&
          aDs.push(tag[1].split(":").splice(2, 100).join(":")) &&
          aKinds.push(parseInt(tag[1].split(":")[0]));
        tag[0] === "e" && eIDs.push(tag[1]);
      }
      aKinds = [...new Set(aKinds)];

      let filter = [];
      aDs.length > 0 && filter.push({ kinds: aKinds, "#d": aDs });
      eIDs.length > 0 && filter.push({ kinds: [1], ids: eIDs });
      setIsLoading(true);
      let events = await getSubData(filter);

      events = events.data.map((event) => {
        if ([30004, 30005, 30023, 34235, 21, 22, 20].includes(event.kind)) {
          let parsedEvent = getParsedRepEvent(event);
          return parsedEvent;
        }
        let parsedEvent = getParsedNote(event, undefined, false);
        return parsedEvent;
      });
      setContent(events);
      setIsLoading(false);
    };
    fetchData();
  }, []);
  return (
    <div
      className="fit-container fx-centered"
      onClick={(e) => {
        e.stopPropagation();
        setShowFilter(false);
      }}
    >
      <div style={{ flex: 1 }}>
        <div className="fit-container fx-scattered box-marg-s">
          <div className="fx-centered fx-start-h pointer" onClick={exit}>
            <div className="round-icon">
              <div
                className="arrow"
                style={{ transform: "rotate(90deg)" }}
              ></div>
            </div>
            <p>{t("A8VdJyb")}</p>
          </div>
        </div>
        <div className="fx-centered fx-start-h  fx-col fx-stretch">
          <div
            className="fit-container bg-img cover-bg sc-s-18 fx-centered fx-end-v box-marg-s"
            style={{
              backgroundImage: `url(${bookmark.image})`,
              aspectRatio: "10 / 3",
            }}
          ></div>
          <div className="fx-scattered fx-col fx-start-v">
            <div className="fx-centered fx-col fx-start-v">
              <h4 className="p-caps">{bookmark.title}</h4>
              <p className="gray-c">{bookmark.description}</p>
            </div>
            <p className="gray-c">
              {bookmark.items.length} item(s) &#8226;{" "}
              <span className="orange-c">
                Edited{" "}
                <Date_ toConvert={new Date(bookmark.created_at * 1000)} />
              </span>
            </p>
          </div>
        </div>
        {!isLoading && (
          <div className="fx-centered fx-col" style={{ marginTop: "1rem" }}>
            <div className="box-marg-s fit-container fx-scattered">
              <h4 className="gray-c fx-start-h">List</h4>
              <Select
                options={bookmarkFilterOptions}
                setSelectedValue={setPostKind}
                value={postKind}
                revert={true}
              />
            </div>
            {itemsNumber === 0 && (
              <div
                className="fx-centered fx-col fit-container"
                style={{ height: "20vh" }}
              >
                <h4>{t("AklxVKp")}</h4>
                <p className="gray-c p-centered" style={{ maxWidth: "350px" }}>
                  {t("APCvbSy")}
                </p>
              </div>
            )}
            {content.map((item) => {
              if (
                !postKind &&
                [30004, 30023, 30005, 34235, 21, 22, 20].includes(item.kind)
              )
                return (
                  <div
                    className="sc-s-18 bg-sp fit-container fx-scattered box-pad-h-s box-pad-v-s"
                    style={{ position: "relative" }}
                    key={item.id}
                  >
                    <div className={`fx-centered `}>
                      <div
                        className="bg-img cover-bg sc-s-18"
                        style={{
                          aspectRatio: "1 / 1",
                          minWidth: "64px",
                          backgroundImage: `url(${item.image})`,
                          backgroundColor: "var(--dim-gray)",
                        }}
                      ></div>
                      <div>
                        <p className="p-medium gray-c">
                          {t("AHhPGax", {
                            date: convertDate(new Date(item.created_at * 1000)),
                          })}
                        </p>
                        <p className="p-one-line">{item.title}</p>
                        <div className="sticker sticker-normal sticker-gray-black">
                          {eventKindsDisplayName[item.kind]}
                        </div>
                      </div>
                    </div>
                    <div className="box-pad-h-s fx-centered">
                      <Link
                        target={"_blank"}
                        href={`/${item.naddr || item.nevent}`}
                      >
                        <div className="share-icon-24"></div>
                      </Link>
                      <BookmarkEvent
                        pubkey={item.pubkey}
                        kind={item.kind}
                        d={item.d}
                        image={item.image}
                      />
                    </div>
                  </div>
                );
              if (
                (!postKind && item.kind === 1) ||
                (postKind && postKind === 1 && item.kind === 1)
              )
                return (
                  <div
                    className="sc-s-18 bg-sp fit-container fx-scattered box-pad-h-s box-pad-v-s"
                    style={{ position: "relative" }}
                    key={item.id}
                  >
                    <div className="fx-centered">
                      <div
                        className="sc-s-18 fx-centered"
                        style={{
                          aspectRatio: "1 / 1",
                          minWidth: "64px",
                        }}
                      >
                        <div className="note-24"></div>
                      </div>
                      <div>
                        <p className="p-medium gray-c">
                          {t("AHhPGax", {
                            date: convertDate(new Date(item.created_at * 1000)),
                          })}
                        </p>
                        <p className="p-one-line">
                          {item.content.substring(0, 100)}
                        </p>
                        <div className="sticker sticker-normal sticker-gray-black">
                          {eventKindsDisplayName[item.kind]}
                        </div>
                      </div>
                    </div>
                    <div className="box-pad-h-s fx-centered">
                      <Link
                        target={"_blank"}
                        href={`/${item.naddr || item.nevent}`}
                      >
                        <div className="share-icon-24"></div>
                      </Link>
                      <BookmarkEvent
                        pubkey={item.id}
                        kind={item.kind}
                        itemType="e"
                      />
                    </div>
                  </div>
                );
              if (item.kind === postKind)
                return (
                  <div
                    className="sc-s-18 bg-sp fit-container fx-scattered box-pad-h-s box-pad-v-s"
                    style={{ position: "relative" }}
                    key={item.id}
                  >
                    <div className={`fx-centered`}>
                      <div
                        className="bg-img cover-bg sc-s-18"
                        style={{
                          aspectRatio: "1 / 1",
                          minWidth: "64px",
                          backgroundImage: `url(${item.image})`,
                          backgroundColor: "var(--dim-gray)",
                        }}
                      ></div>
                      <div>
                        <p className="p-medium gray-c">
                          {t("AHhPGax", {
                            date: convertDate(new Date(item.created_at * 1000)),
                          })}
                        </p>
                        <p className="p-one-line">{item.title}</p>
                        <div className="sticker sticker-normal sticker-gray-black">
                          {eventKindsDisplayName[item.kind]}
                        </div>
                      </div>
                    </div>
                    <div className="box-pad-h-s fx-centered">
                      <Link
                        target={"_blank"}
                        href={`/${item.naddr || item.nevent}`}
                      >
                        <div className="share-icon-24"></div>
                      </Link>
                      <BookmarkEvent
                        pubkey={item.pubkey}
                        kind={item.kind}
                        d={item.d}
                        image={item.image}
                      />
                    </div>
                  </div>
                );
            })}
            {bookmarkTags.map((tag) => {
              if (!postKind || postKind === tag.kind)
                return (
                  <div
                    className="sc-s-18 bg-sp fit-container fx-scattered box-pad-h-s box-pad-v-s"
                    style={{ position: "relative" }}
                    key={tag.value[1]}
                  >
                    <div className={`fx-centered`}>
                      <div
                        className="sc-s-18 fx-centered"
                        style={{
                          aspectRatio: "1 / 1",
                          minWidth: "64px",
                        }}
                      >
                        {tag.kind === 2 ? (
                          <div className="link-24"></div>
                        ) : (
                          <div className="hashtag-24"></div>
                        )}
                      </div>
                      <div>
                        {tag.kind === 2 && (
                          <div>
                            <p className="p-one-line">{tag.value[2]}</p>
                            {tag.value.length > 2 && (
                              <p className="blue-c">{tag.value[1]}</p>
                            )}
                          </div>
                        )}
                        {tag.kind === 3 && (
                          <div>
                            <p className="p-one-line">{tag.value[1]}</p>
                          </div>
                        )}
                        <div className="sticker sticker-normal sticker-gray-black">
                          {eventKindsDisplayName[tag.kind]}
                        </div>
                      </div>
                    </div>
                    <div className="box-pad-h-s fx-centered">
                      <Link
                        target={"_blank"}
                        href={
                          tag.kind === 2
                            ? tag.value[1]
                            : `/search?keyword=${tag.value[1]}`
                        }
                      >
                        <div className="share-icon-24"></div>
                      </Link>
                      <BookmarkEvent
                        pubkey={tag.value[1]}
                        itemType={tag.value[0]}
                      />
                    </div>
                  </div>
                );
            })}
          </div>
        )}
        {(content.length === 0 || bookmarkTags.length === 0) && !isLoading && (
          <div
            className="fx-centered fx-col fit-container"
            style={{ height: "30vh" }}
          >
            <h4>{t("AklxVKp")}</h4>
            <p className="gray-c p-centered" style={{ maxWidth: "350px" }}>
              {t("AwtoZdf")}
            </p>
          </div>
        )}
        {isLoading && (
          <div className="fx-centered fit-container" style={{ height: "30vh" }}>
            <LoadingLogo />
          </div>
        )}
      </div>
    </div>
  );
}
