import React, { useState, useRef, useEffect } from "react";
import CommentsSection from "./CommentsSection";
import { getNoteTree } from "@/Helpers/ClientHelpers";
import useUserProfile from "@/Hooks/useUsersProfile";
import EventOptions from "./ElementOptions/EventOptions";
import Date_ from "./Date_";
import UserProfilePic from "./UserProfilePic";
import PostReaction from "./PostReaction";
import ZapAd from "./ZapAd";
import LoadingDots from "./LoadingDots";
import useVideoVolume from "@/Hooks/useVideoVolume";

const getParsedContent = (item) => {
  let content = "";
  if (item.description) content = getNoteTree(item.description);
  if (item.content) content = getNoteTree(item.content);
  return content;
};
export default function MediaOverlay({ item, postActions, full = false }) {
  const { userProfile, isNip05Verified } = useUserProfile(item.pubkey);
  const content = getParsedContent(item);
  const [openComment, setOpenComment] = useState(false);
  return (
    <div
      style={{
        width: "min(100%, 1400px)",
        height: full ? "100vh" : "85vh",
        gap: 0,
      }}
      className="fx-centered fx-stretch media-overlay"
      onClick={(e) => {
        e.stopPropagation();
      }}
    >
      <div
        className="fx-scattered fit-container desk-hide-1000 box-pad-h-m box-pad-v-m sc-s-18 fx-shrink"
        style={{
          backgroundColor: "var(--white)",
          borderBottomLeftRadius: 0,
          borderBottomRightRadius: 0,
          border: full ? "none" : "",
          overflow: "visible",
        }}
      >
        <div className="fx-centered fx-start-v fx-start-h">
          <div>
            <UserProfilePic
              size={48}
              mainAccountUser={false}
              user_id={userProfile.pubkey}
              img={userProfile.picture}
              metadata={userProfile}
            />
          </div>
          <div
            className="fx-centered fx-start-h fx-start-v"
            style={{ gap: "3px" }}
          >
            <div>
              <div className="fx-centered" style={{ gap: "3px" }}>
                <p className="p-bold p-one-line" style={{ margin: 0 }}>
                  {userProfile.display_name || userProfile.name}
                </p>
                {isNip05Verified && <div className="checkmark-c1"></div>}
              </div>
              <p className="gray-c p-medium" style={{ margin: 0 }}>
                <Date_
                  toConvert={new Date(item.created_at * 1000)}
                  time={true}
                />
              </p>
            </div>
          </div>
        </div>
        <div className="fx-centered">
          <EventOptions event={item} component="media" />
        </div>
      </div>
      {item.kind === 20 && <Image item={item} border={!full} />}
      {item.kind !== 20 && <Video src={item.url} />}

      <div
        className="sc-s-18 bg-sp media-overlay-r-side"
        style={{
          border: full ? "none" : "",
          borderRight: full ? "1px solid var(--dim-gray)" : "",
        }}
      >
        <div
          className={
            "fit-container fx-centered fx-start-h fx-start-v fx-col box-pad-h box-pad-v "
          }
          style={{ gap: "16px" }}
        >
          <div className="fx-scattered fit-container mb-hide-1000">
            <div className="fx-centered fx-start-v fx-start-h">
              <div>
                <UserProfilePic
                  size={48}
                  mainAccountUser={false}
                  user_id={userProfile.pubkey}
                  img={userProfile.picture}
                  metadata={userProfile}
                />
              </div>
              <div
                className="fx-centered fx-start-h fx-start-v"
                style={{ gap: "3px" }}
              >
                <div>
                  <div className="fx-centered" style={{ gap: "3px" }}>
                    <p className="p-bold p-one-line" style={{ margin: 0 }}>
                      {userProfile.display_name || userProfile.name}
                    </p>
                    {isNip05Verified && <div className="checkmark-c1"></div>}
                  </div>
                  <p className="gray-c p-medium" style={{ margin: 0 }}>
                    <Date_
                      toConvert={new Date(item.created_at * 1000)}
                      time={true}
                    />
                  </p>
                </div>
              </div>
            </div>
            <div className="fx-centered">
              <EventOptions event={item} component="media" />
            </div>
          </div>
          <div>
            <div className="p-six-lines">{content}</div>
          </div>
          {postActions?.zaps?.zaps?.length > 0 && (
            <div className="fit-container">
              <ZapAd
                zappers={postActions.zaps.zaps}
                onClick={() =>
                  setUsersList({
                    title: t("AVDZ5cJ"),
                    list: postActions.zaps.zaps.map((item) => item.pubkey),
                    extras: postActions.zaps.zaps,
                  })
                }
              />
            </div>
          )}
          <div className="fit-container fx-scattered">
            <PostReaction
              event={item}
              setOpenComment={setOpenComment}
              openComment={openComment}
              postActions={postActions}
              userProfile={userProfile}
            />
          </div>
        </div>
        <CommentsSection
          id={item.id}
          noteTags={item.tags}
          eventPubkey={item.pubkey}
          postActions={postActions}
          author={userProfile}
          //   isRoot={true}
          tagKind={"e"}
        />
      </div>
    </div>
  );
}

const Image = ({ item, border }) => {
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <div
      className="fx-centered sc-s-18 bg-sp media-overlay-l-side"
      style={{
        position: "relative",
        border: border ? "" : "none",
        borderRight: !border ? "1px solid var(--dim-gray)" : "",
      }}
    >
      {!isLoaded && (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
          }}
          className="fx-centered"
        >
          <LoadingDots />
        </div>
      )}
      <img
        style={{
          maxWidth: "100%",
          maxHeight: "100%",
          width: "100%",
          height: "auto",
          objectFit: "contain",
        }}
        onLoad={() => setIsLoaded(true)}
        src={item.url}
      />
    </div>
  );
};

function Video({ src }) {
  const [isLoaded, setIsLoaded] = useState(false);
  const { videoVolume, handleMutedVideos } = useVideoVolume();

  return (
    <div
      className="fx-centered sc-s-18 bg-sp media-overlay-l-side"
      style={{ position: "relative" }}
    >
      {!isLoaded && (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
          }}
          className="fx-centered"
        >
          <LoadingDots />
        </div>
      )}
      <video
        src={src}
        controls={isLoaded}
        playsInline
        loop
        autoPlay
        onLoadedData={() => setIsLoaded(true)}
        style={{
          maxWidth: "100%",
          maxHeight: "100%",
          width: "100%",
          height: "100%",
          display: "block",
        }}
        muted={videoVolume}
        onVolumeChange={handleMutedVideos}
      />
    </div>
  );
}
