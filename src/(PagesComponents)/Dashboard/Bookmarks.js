import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import AddBookmark from "@/Components/AddBookMark";
import { saveBookmarks } from "@/Helpers/DB";
import ToDeleteGeneral from "@/Components/ToDeleteGeneral";
import { useTranslation } from "react-i18next";
import BookmarkCard from "./BookmarkCard";
import BookmarkContent from "./BookmarkContent";

export default function Bookmarks() {
  const userKeys = useSelector((state) => state.userKeys);
  const userBookmarks = useSelector((state) => state.userBookmarks);
  const { t } = useTranslation();
  const [showDetails, setShowDetails] = useState(false);
  const [showAddBookmark, setShowAddBookmark] = useState(false);
  const [editBookmark, setEditBookmark] = useState(false);
  const [deleteBookmark, setDeleteBookmark] = useState(false);

  useEffect(() => {
    if (userKeys) setShowDetails(false);
  }, [userKeys]);

  const handleBookmarkDeletion = () => {
    let tempArr = Array.from(userBookmarks);
    let index = tempArr.findIndex(
      (bookmark) => bookmark.id === deleteBookmark.id,
    );
    tempArr.splice(index, 1);
    saveBookmarks(tempArr, userKeys.pub);
    setDeleteBookmark(false);
  };

  return (
    <>
      {showAddBookmark && (
        <AddBookmark exit={() => setShowAddBookmark(false)} />
      )}
      {editBookmark && (
        <AddBookmark
          bookmark={editBookmark}
          tags={editBookmark.tags}
          exit={() => setEditBookmark(false)}
        />
      )}
      {deleteBookmark && (
        <ToDeleteGeneral
          eventId={deleteBookmark.id}
          title={deleteBookmark.title}
          kind={t("AtlqBGm")}
          refresh={handleBookmarkDeletion}
          cancel={() => setDeleteBookmark(false)}
          aTag={deleteBookmark.aTag}
          description={t("AaTanJf")}
        />
      )}
      <div className="fit-container">
        <div className="fit-container fx-scattered  box-pad-v-m box-pad-h">
          <h4 className="p-caps">{t("AqwEL0G")}</h4>
          <button
            className="btn btn-normal"
            onClick={() => setShowAddBookmark(true)}
          >
            <div className="plus-sign"></div>
          </button>
        </div>
        <div className="fit-container fx-centered fx-col fx-start-v box-pad-h">
          {!showDetails &&
            userBookmarks.map((event) => {
              return (
                <BookmarkCard
                  event={event}
                  key={event.id}
                  showDetails={setShowDetails}
                  deleteEvent={setDeleteBookmark}
                  editEvent={setEditBookmark}
                />
              );
            })}
          {showDetails && (
            <BookmarkContent
              bookmark={showDetails}
              exit={() => setShowDetails(false)}
              setToDeleteBoormark={() => null}
              setToEditBookmark={() => null}
            />
          )}
        </div>
      </div>
    </>
  );
}
