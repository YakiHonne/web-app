import useRecentNotes from "@/Hooks/useRecentNotes";
import React, { useMemo } from "react";
import useRecentPosts from "@/Hooks/useRecentPosts";
import UsersGroupProfilePicture from "./UsersGroupProfilePicture";

export default function RecentPosts({
  filter,
  contentFrom,
  since,
  onClick,
  selectedFilter,
  kind = "notes",
}) {
  const { recentNotes } =
    kind === "notes"
      ? useRecentNotes(filter, contentFrom, since, selectedFilter)
      : useRecentPosts(filter, since, selectedFilter);
  const pubkeys = useMemo(() => {
    return [...new Set(recentNotes.map((note) => note.pubkey))];
  }, [recentNotes]);
  if (recentNotes.length === 0) return null;
  return (
    <RecentPostsContent
      pubkeys={pubkeys}
      notesLength={recentNotes.length}
      onClick={() => onClick(recentNotes)}
    />
  );
}

const RecentPostsContent = ({ pubkeys, notesLength, onClick }) => {
  return (
    <div className="fit-container fx-centered recent-post-container">
      <div className="main-container">
        <main
          style={{ height: "auto" }}
          className="fx-centered fx-end-h box-pad-h-s"
        >
          <div className="main-page-nostr-container fx-centered">
            <div className="fit-container fx-centered">
              <div
                className="sc-s  box-pad-h-s box-pad-v-s fx-scattered slide-down pointer"
                style={{ backgroundColor: "var(--c1)", border: "none" }}
                onClick={onClick}
              >
                <UsersGroupProfilePicture pubkeys={pubkeys} />
                <div
                  className="fx-centered"
                  style={{
                    minWidth: "max-content",
                  }}
                >
                  <p className="white-c">
                    {notesLength > 99 ? "+99" : notesLength} New
                  </p>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};
