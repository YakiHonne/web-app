'use client';
import React, { useState } from "react";
import AddBookmark from "./AddBookMark";
import { useDispatch, useSelector } from "react-redux";
import { setToPublish } from "@/Store/Slides/Publishers";
import { convertDate } from "@/Helpers/Encryptions";
import { useTranslation } from "react-i18next";

export default function BookmarksPicker({
  kind,
  pubkey,
  d,
  image,
  exit,
  itemType,
  extraData,
}) {
  const dispatch = useDispatch();
  const userKeys = useSelector((state) => state.userKeys);
  const userBookmarks = useSelector((state) => state.userBookmarks);
  const userRelays = useSelector((state) => state.userRelays);
  const { t } = useTranslation();

  const [showAddBookmark, setShowAddBookmark] = useState(false);
  const itemTypes = {
    a: `${kind}:${pubkey}:${d}`,
    e: pubkey,
    r: pubkey,
    t: pubkey,
  };
  const isBookmarked = (bookmark) => {
    return (
      bookmark.tags.filter((item) => item[1] === itemTypes[itemType]).length > 0
    );
  };
  const bookmarkArticle = (status, bookmark) => {
    if (!userKeys) {
      return false;
    }

    let bookmarkD = bookmark.tags.find((item) => item[0] === "d")[1];
    let itemsLeft = bookmark.tags.filter((tag) =>
      ["a", "e", "t", "r"].includes(tag[0])
    ).length;
    let bookmarkImg =
      status && itemsLeft === 1
        ? ""
        : image || bookmark.tags.find((item) => item[0] === "image")[1];

    if (status) {
      dispatch(
        setToPublish({
          userKeys: userKeys,
          kind: 30003,
          content: "",
          tags: [
            [
              "client",
              "Yakihonne",
              "31990:20986fb83e775d96d188ca5c9df10ce6d613e0eb7e5768a0f0b12b37cdac21b3:1700732875747",
            ],
            ["d", bookmarkD],
            ["image", bookmarkImg],
            ...bookmark.tags.filter((item) => {
              if (
                item[0] !== "d" &&
                item[0] !== "image" &&
                item[1] !== itemTypes[itemType]
              )
                return item;
            }),
          ],
          allRelays: userRelays,
        })
      );

      return;
    }
    try {
      dispatch(
        setToPublish({
          userKeys: userKeys,
          kind: 30003,
          content: "",
          tags: [
            [
              "client",
              "Yakihonne",
              "31990:20986fb83e775d96d188ca5c9df10ce6d613e0eb7e5768a0f0b12b37cdac21b3:1700732875747",
            ],
            ["d", bookmarkD],
            ["image", bookmarkImg],
            ...bookmark.tags.filter((item) => {
              if (item[0] !== "d" && item[0] !== "image") return item;
            }),
            [itemType, itemTypes[itemType]],
          ],
          allRelays: userRelays,
        })
      );
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <>
      {showAddBookmark && (
        <AddBookmark exit={() => setShowAddBookmark(false)} />
      )}
      <div className="fixed-container fx-centered box-pad-h">
        <section
          className="sc-s bg-sp box-pad-h box-pad-v fx-centered"
          style={{ width: "min(100%, 500px)", position: "relative" }}
        >
          <div className="close" onClick={exit}>
            <div></div>
          </div>
          <div className="fx-centered fx-col fit-container">
            <h4 className="box-marg-s">{t("AXMpXlH")}</h4>
            {userBookmarks.length === 0 && (
              <div className="fx-centered" style={{ marginBottom: "1rem" }}>
                <p className="gray-c">{t("Aej5MOj")}</p>
              </div>
            )}
            {userBookmarks.map((bookmark) => {
              let status = isBookmarked(bookmark);
              return (
                <div
                  key={bookmark.id}
                  className={`fit-container fx-scattered box-pad-h-s box-pad-v-s sc-s bg-sp fx-shrink pointer option`}
                  onClick={() => bookmarkArticle(status, bookmark)}
                >
                  <div
                    className="fx-centered fx-start-h "
                    style={{ width: "calc(100% - 45px)" }}
                  >
                    <div
                      className="bg-img cover-bg"
                      style={{
                        aspectRatio: "1/1",
                        minWidth: "40px",
                        borderRadius: "var(--border-r-50)",
                        backgroundImage: `url(${bookmark.image})`,
                        backgroundColor: "var(--dim-gray)",
                      }}
                    ></div>
                    <div>
                      <p className="p-one-line">{bookmark.title}</p>
                      <p className="gray-c p-medium">
                        {t("A04okTg", { count: bookmark.items.length })}
                        &#8226;{" "}
                        <span className="orange-c">
                          {t("A1jhS42", {
                            date: convertDate(
                              new Date(bookmark.created_at * 1000)
                            ),
                          })}
                        </span>
                      </p>
                    </div>
                  </div>
                  <div className="box-pad-h-s">
                    <div
                      className={status ? "bookmark-24-b" : "bookmark-24"}
                    ></div>
                  </div>
                </div>
              );
            })}
            <div
              className="sc-s-d fit-container if pointer fx-centered"
              onClick={(e) => {
                e.stopPropagation();
                setShowAddBookmark(true);
              }}
            >
              <p className="gray-c">{t("AxGQiuq")}</p>{" "}
              <p className="gray-c p-big">&#xFF0B;</p>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
