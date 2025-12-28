import useNoteStats from "@/Hooks/useNoteStats";
import useUserProfile from "@/Hooks/useUsersProfile";
import { useVideoThumbnail } from "@/Hooks/useVideoThumbnail";
import React, { useMemo, useState } from "react";
import { Virtuoso } from "react-virtuoso";
import UserProfilePic from "./UserProfilePic";
import MediaOverlay from "./MediaOverlay";

export default function MediaMasonryList({ events, setLastEventTime }) {
  const media = useMemo(
    (size = 5) => {
      let filteredEvents = events.filter((event, index, arr) => {
        if (
          arr.findIndex(
            (_) => _.url === event.url && _.pubkey === event.pubkey
          ) === index &&
          event.plain
        )
          return event;
      });
      const result = [];
      for (let i = 0; i < filteredEvents.length; i += size) {
        result.push(filteredEvents.slice(i, i + size));
      }
      return result;
    },
    [events]
  );
  return (
    <Virtuoso
      style={{ width: "100%", height: "100vh" }}
      totalCount={media.length}
      increaseViewportBy={1500}
      endReached={(index) => {
        setLastEventTime(events[events.length - 1].created_at - 1);
      }}
      overscan={1500}
      skipAnimationFrameInResizeObserver={true}
      useWindowScroll={true}
      itemContent={(index) => {
        let item = media[index];
        return <RowContent key={item.id} items={item} index={index} />;
      }}
    />
  );
}

const RowContent = React.memo(({ items, index }) => {
  if (items.length === 0) return;
  return (
    <div
      className="fit-container fx-centered fx-stretch fx-start-v fx-start-h"
      style={{ padding: ".06rem 0", gap: ".12rem" }}
    >
      {items[0] && (
        <div style={{ flex: 1, order: index % 2 ? 2 : 1 }}>
          <ItemContent item={items[0]} />
        </div>
      )}
      <div
        style={{ flex: 2, order: index % 2 ? 1 : 2, gap: ".12rem" }}
        className="fx-centered fx-col"
      >
        <div className="fit-container fx-centered" style={{ gap: ".12rem" }}>
          {items[1] && (
            <div style={{ flex: 1 }}>
              <ItemContent item={items[1]} aspectRatio="1 / 1" />
            </div>
          )}
          {items[2] && (
            <div style={{ flex: 1 }}>
              <ItemContent item={items[2]} aspectRatio="1 / 1" />
            </div>
          )}
        </div>
        <div className="fit-container fx-centered" style={{ gap: ".12rem" }}>
          {items[3] && (
            <div style={{ flex: 1 }}>
              <ItemContent item={items[3]} aspectRatio="1 / 1" />
            </div>
          )}
          {items[4] && (
            <div style={{ flex: 1 }}>
              <ItemContent item={items[4]} aspectRatio="1 / 1" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

const ItemContent = React.memo(({ item, aspectRatio }) => {
  if (item.kind !== 20) {
    return <Video item={item} aspectRatio={aspectRatio} />;
  }
  return <Image item={item} aspectRatio={aspectRatio} />;
});

const Video = React.memo(({ item, aspectRatio }) => {
  const thumbnail = useVideoThumbnail(item.url, 1, 400, item.image);
  const { postActions } = useNoteStats(item.id, item.pubkey);
  const [toExpand, setToExpand] = useState(false);
  const [prevPath, setPrevPath] = useState(window.location.pathname);

  const onExit = () => {
    setToExpand(false);
    window.history.replaceState(null, "", prevPath);
  };

  const onExpand = () => {
    setToExpand(true);
    window.history.replaceState(
      null,
      "",
      `/video/${item.naddr || item.nEvent}`
    );
  };

  if (aspectRatio) {
    return (
      <>
        {toExpand && (
          <ExpandPost item={item} exit={onExit} postActions={postActions} />
        )}
        <div
          style={{ position: "relative", height: "100%" }}
          className="media-item pointer"
          onClick={onExpand}
        >
          <PostOverlay pubkey={item.pubkey} postActions={postActions} />
          <div
            style={{
              position: "absolute",
              top: "16px",
              right: "16px",
            }}
          >
            <svg
              aria-label="Reel"
              fill="white"
              height="24"
              role="img"
              viewBox="0 0 24 24"
              width="24"
              style={{
                boxShadow: "0 0 5px rgba(0, 0, 0, 0.55)",
                borderRadius: "10px",
                backgroundColor: "#888",
              }}
            >
              <path d="M22.942 7.464c-.062-1.36-.306-2.143-.511-2.671a5.366 5.366 0 0 0-1.272-1.952 5.364 5.364 0 0 0-1.951-1.27c-.53-.207-1.312-.45-2.673-.513-1.2-.054-1.557-.066-4.535-.066s-3.336.012-4.536.066c-1.36.062-2.143.306-2.672.511-.769.3-1.371.692-1.951 1.272s-.973 1.182-1.27 1.951c-.207.53-.45 1.312-.513 2.673C1.004 8.665.992 9.022.992 12s.012 3.336.066 4.536c.062 1.36.306 2.143.511 2.671.298.77.69 1.373 1.272 1.952.58.581 1.182.974 1.951 1.27.53.207 1.311.45 2.673.513 1.199.054 1.557.066 4.535.066s3.336-.012 4.536-.066c1.36-.062 2.143-.306 2.671-.511a5.368 5.368 0 0 0 1.953-1.273c.58-.58.972-1.181 1.27-1.95.206-.53.45-1.312.512-2.673.054-1.2.066-1.557.066-4.535s-.012-3.336-.066-4.536Zm-7.085 6.055-5.25 3c-1.167.667-2.619-.175-2.619-1.519V9c0-1.344 1.452-2.186 2.619-1.52l5.25 3c1.175.672 1.175 2.368 0 3.04Z"></path>
            </svg>
          </div>
          <div
            style={{
              backgroundImage: thumbnail ? `url(${thumbnail})` : "none",
              backgroundSize: "cover",
              backgroundPosition: "center",
              aspectRatio: aspectRatio || "unset",
              height: aspectRatio ? "unset" : "100%",
              width: "100%",
              maxHeight: aspectRatio ? "500px" : "unset",
              backgroundColor: "var(--c1-side)",
              border: "none",
            }}
          />
        </div>
      </>
    );
  }
  return (
    <>
      {toExpand && (
        <ExpandPost item={item} exit={onExit} postActions={postActions} />
      )}
      <div
        style={{ position: "relative", height: "100%" }}
        className="media-item pointer"
        onClick={() => {
          setToExpand(true);
          window.history.replaceState(
            null,
            "",
            `/video/${item.naddr || item.nEvent}`
          );
        }}
      >
        <PostOverlay pubkey={item.pubkey} postActions={postActions} />
        <div
          style={{
            position: "absolute",
            top: "16px",
            right: "16px",
          }}
        >
          <svg
            aria-label="Reel"
            fill="white"
            height="24"
            role="img"
            viewBox="0 0 24 24"
            width="24"
            style={{
              boxShadow: "0 0 5px rgba(0, 0, 0, 0.55)",
              borderRadius: "10px",
              backgroundColor: "#888",
            }}
          >
            <path d="M22.942 7.464c-.062-1.36-.306-2.143-.511-2.671a5.366 5.366 0 0 0-1.272-1.952 5.364 5.364 0 0 0-1.951-1.27c-.53-.207-1.312-.45-2.673-.513-1.2-.054-1.557-.066-4.535-.066s-3.336.012-4.536.066c-1.36.062-2.143.306-2.672.511-.769.3-1.371.692-1.951 1.272s-.973 1.182-1.27 1.951c-.207.53-.45 1.312-.513 2.673C1.004 8.665.992 9.022.992 12s.012 3.336.066 4.536c.062 1.36.306 2.143.511 2.671.298.77.69 1.373 1.272 1.952.58.581 1.182.974 1.951 1.27.53.207 1.311.45 2.673.513 1.199.054 1.557.066 4.535.066s3.336-.012 4.536-.066c1.36-.062 2.143-.306 2.671-.511a5.368 5.368 0 0 0 1.953-1.273c.58-.58.972-1.181 1.27-1.95.206-.53.45-1.312.512-2.673.054-1.2.066-1.557.066-4.535s-.012-3.336-.066-4.536Zm-7.085 6.055-5.25 3c-1.167.667-2.619-.175-2.619-1.519V9c0-1.344 1.452-2.186 2.619-1.52l5.25 3c1.175.672 1.175 2.368 0 3.04Z"></path>
          </svg>
        </div>
        <video
          //   autoPlay={false}

          controls={false}
          playsInline
          style={{
            width: "100%",
            // maxWidth: "400px",
            aspectRatio: aspectRatio || "unset",
            height: aspectRatio ? "unset" : "100%",
            backgroundColor: "var(--c1-side)",
            objectFit: "cover",
            display: "block",
            margin: "0 auto",

            // borderRadius: "12px",
          }}
          autoPlay={aspectRatio ? false : true}
          onTimeUpdate={(video) => {
            if (video.currentTarget.currentTime >= 1.5) {
              video.currentTarget.currentTime = 0;
              video.currentTarget.play();
            }
          }}
          loop
          muted
          // preload="none"
        >
          <source src={item.url} type="video/mp4" />
        </video>
      </div>
    </>
  );
});

const Image = React.memo(({ item, aspectRatio }) => {
  const [brokenImage, setBrokenImage] = useState(false);
  const [toExpand, setToExpand] = useState(false);
  const { postActions } = useNoteStats(item.id, item.pubkey);
  const [prevPath, setPrevPath] = useState(window.location.pathname);
  const onExit = () => {
    setToExpand(false);
    window.history.replaceState(null, "", prevPath);
  };

  const onExpand = () => {
    setToExpand(true);

    window.history.replaceState(
      null,
      "",
      `/image/${item.naddr || item.nEvent}`
    );
  };

  if (brokenImage)
    return (
      <div
        style={{
          aspectRatio: aspectRatio || "unset",
          height: aspectRatio ? "unset" : "100%",
          width: "100%",
          maxHeight: aspectRatio ? "500px" : "unset",
          backgroundColor: "var(--c1-side)",
          cursor: "not-allowed",
        }}
        className="fx-centered"
      >
        <div className="broken-image-24"></div>
      </div>
    );
  return (
    <>
      {toExpand && (
        <ExpandPost item={item} exit={onExit} postActions={postActions} />
      )}
      <div
        style={{
          position: "relative",
          height: aspectRatio ? "unset" : "100%",
          width: "100%",
          objectFit: "cover",
          display: "block",
          maxHeight: aspectRatio ? "500px" : "unset",
        }}
        className="media-item pointer"
        onClick={onExpand}
      >
        <PostOverlay pubkey={item.pubkey} postActions={postActions} />
        <img
          src={`https://api.yakihonne.com/api/img?url=${encodeURIComponent(
            item.url
          )}&w=450&q=50`}
          style={{
            aspectRatio: aspectRatio || "unset",
            height: aspectRatio ? "unset" : "100%",
            width: "100%",
            objectFit: "cover",
            display: "block",
            maxHeight: aspectRatio ? "500px" : "unset",
            backgroundColor: "var(--c1-side)",
          }}
          onError={() => setBrokenImage(true)}
          fetchpriority="low"
          importance="low"
          crossOrigin="anonymous"
        />
      </div>
    </>
  );
});

const PostOverlay = ({ postActions, pubkey }) => {
  const { userProfile } = useUserProfile(pubkey, false);

  return (
    <div
      className="fixed-container fx-centered"
      style={{
        backgroundColor: "rgba(0, 0, 0, .85)",
        position: "absolute",
        width: "100%",
        height: "100%",
        top: "0",
        left: "0",
        right: "0",
        bottom: "0",
        zIndex: "1",
        animationDuration: ".1s",
      }}
    >
      <section>
        <div className="fx-centered fx-col box-pad-v-m">
          <UserProfilePic
            img={userProfile.picture}
            size={64}
            user_id={pubkey}
            allowClick={false}
            allowPropagation={true}
          />
          <div className="fx-centered fx-col" style={{ gap: 0 }}>
            <p>{userProfile.display_name || userProfile.name}</p>
            <p className="gray-c">
              @{userProfile.name || userProfile.display_name}
            </p>
          </div>
        </div>
        <div
          className="fit-container fx-centered box-pad-v-m"
          style={{ gap: "1rem" }}
        >
          <div className="fx-centered">
            <div className="heart-24"></div>
            <p>{postActions.likes.likes.length}</p>
          </div>
          <div className="fx-centered">
            <div className="comment-24"></div>
            <p>{postActions.replies.replies.length}</p>
          </div>
          <div className="fx-centered">
            <div className="bolt-24"></div>
            <p>{postActions.zaps.total}</p>
          </div>
        </div>
      </section>
    </div>
  );
};

const ExpandPost = ({ item, exit, postActions }) => {
  return (
    <div
      className="fixed-container box-pad-h box-pad-v fx-centered"
      onClick={(e) => {
        e.stopPropagation();
        exit();
      }}
    >
      <MediaOverlay
        exit={exit}
        item={item}
        postActions={postActions}
        author={{ pubkey: item.pubkey }}
      />
    </div>
  );
};
