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
  position = "top",
}) {
  const { recentNotes } = useRecentNotes(filter, contentFrom, since, selectedFilter, kind);
  const { recentPosts } = useRecentPosts(filter, since, selectedFilter, kind);
  const pubkeys = useMemo(() => {
    return [
      ...new Set([
        ...recentNotes.map((note) => note.pubkey),
        ...recentPosts.map((note) => note.pubkey),
      ]),
    ];
  }, [recentNotes, recentPosts]);
  if (recentNotes.length === 0 && recentPosts.length === 0) return null;
  return (
    <RecentPostsContent
      pubkeys={pubkeys}
      notesLength={recentNotes.length + recentPosts.length}
      onClick={() => onClick([...recentNotes, ...recentPosts])}
      position={position}
    />
  );
}

const RecentPostsContent = ({ pubkeys, notesLength, onClick, position = "top" }) => {
  return (
    <div className={`fit-container fx-centered recent-post-${position}-container`}>
      <div className="main-container">
        <main
          style={{ height: "auto" }}
          className="fx-centered fx-end-h box-pad-h-s"
        >
          <div className="main-page-nostr-container fx-centered">
            <div className="fit-container fx-centered">
              <div
                className="sc-s  box-pad-h-s box-pad-v-s fx-scattered slide-down pointer"
                style={{
                  backgroundColor: "var(--c1)",
                  border: "none",
                  gap: "10px",
                }}
                onClick={onClick}
              >
                <UsersGroupProfilePicture pubkeys={pubkeys} />
                <div
                  className="fx-centered"
                  style={{
                    minWidth: "max-content",
                    gap: "0",
                  }}
                >
                  <p className="white-c">
                    {notesLength > 99 ? "+99" : notesLength} new{" "}
                    {notesLength === 1 ? "post" : "posts"}
                  </p>
                  <p className="white-c box-pad-h-s">&#8593;</p>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};
