'use client';
import React, { useMemo, useState } from "react";
import BookmarksPicker from "@/Components/BookmarksPicker";
import { useSelector } from "react-redux";
import LoginSignup from "@/Components/LoginSignup";

export default function BookmarkEvent({
  pubkey = "",
  d = "",
  kind = 30023,
  image = "",
  itemType = "a",
  extraData = "",
  label = false,
}) {
  const userKeys = useSelector((state) => state.userKeys);
  const userBookmarks = useSelector((state) => state.userBookmarks);
  const [showBookmarksPicker, setShowBookmarksPicker] = useState(false);
  const [isLogin, setIsLogin] = useState(false);
  const itemTypes = {
    a: `${kind}:${pubkey}:${d}`,
    e: pubkey,
    t: extraData,
  };

  const isBookmarked = useMemo(() => {
    return userKeys
      ? userBookmarks.find((bookmark) =>
          bookmark.items.find((item) => item === itemTypes[itemType])
        )
      : false;
  }, [userBookmarks, userKeys]);

  return (
    <>
      {showBookmarksPicker && (
        <BookmarksPicker
          pubkey={pubkey}
          d={d}
          kind={kind}
          exit={() => setShowBookmarksPicker(false)}
          image={image}
          itemType={itemType}
          extraData={extraData}
        />
      )}
      {isLogin && <LoginSignup exit={() => setIsLogin(false)} />}
      <div
        className="fx-scattered fit-container pointer"
        onClick={(e) => {
          e.stopPropagation();
          !userKeys ? setIsLogin(true) : setShowBookmarksPicker(true);
        }}
      >
        {label && <p>{label}</p>}
        <div
          className={isBookmarked ? "bookmark-i-b" : "bookmark-i"}
        ></div>
      </div>
    </>
  );
}
