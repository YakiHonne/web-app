import React, { useEffect, useState } from "react";
import { getEmptyuserMetadata } from "@/Helpers/Encryptions";
import ArrowUp from "@/Components/ArrowUp";
import UserProfilePic from "@/Components/UserProfilePic";
import ShowUsersList from "@/Components/ShowUsersList";
import Date_ from "@/Components/Date_";
import { getVideoContent, getVideoFromURL } from "@/Helpers/Helpers";
import Follow from "@/Components/Follow";
import AddArticleToCuration from "@/Components/AddArticleToCuration";
import { useDispatch, useSelector } from "react-redux";
import { getSubData, getUser } from "@/Helpers/Controlers";
import { saveUsers } from "@/Helpers/DB";
import useRepEventStats from "@/Hooks/useRepEventStats";
import RepEventCommentsSection from "@/Components/RepEventCommentsSection";
import { setToPublish } from "@/Store/Slides/Publishers";
import Backbar from "@/Components/Backbar";
import { useTranslation } from "react-i18next";
import PagePlaceholder from "@/Components/PagePlaceholder";
import ZapAd from "@/Components/ZapAd";
import EventOptions from "@/Components/ElementOptions/EventOptions";
import useIsMute from "@/Hooks/useIsMute";
import Link from "next/link";
import PostReaction from "@/Components/PostReaction";

export default function Video({ event, userProfile }) {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const userKeys = useSelector((state) => state.userKeys);
  const nostrAuthors = useSelector((state) => state.nostrAuthors);

  const video = event;
  const [expandDescription, setExpandDescription] = useState(false);
  const [videoViews, setVideoViews] = useState(0);
  const [usersList, setUsersList] = useState(false);
  const [morePosts, setMorePosts] = useState([]);
  const [showAddArticleToCuration, setShowArticleToCuration] = useState(false);
  const [showCommentsSection, setShowCommentsSections] = useState(false);
  const { postActions } = useRepEventStats(video.aTag, video.pubkey);
  const { muteUnmute, isMuted } = useIsMute(video.pubkey);

  useEffect(() => {
    const fetchData = async () => {
      try {
        let data = await getSubData(
          [
            {
              kinds: [34237],
              "#a": [video.aTag],
            },
          ],
          100
        );
        setVideoViews(data.pubkeys.length);
      } catch (err) {
        console.log(err);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const fetchMoreVideosAuthors = async () => {
      try {
        let data = await getSubData(
          [
            {
              kinds: [21, 22],
              limit: 5,
            },
          ],
          100
        );
        let posts = data.data
          .splice(0, 5)
          .map((post) => getVideoContent(post))
          .filter((_) => _.id !== video.id);
        setMorePosts(posts);
        saveUsers(data.pubkeys);
      } catch (err) {
        console.log(err);
      }
    };
    fetchMoreVideosAuthors();
  }, []);

  useEffect(() => {
    try {
      let auth = getUser(video.pubkey);

      if (auth) {
        setAuthor(auth);
      }
    } catch (err) {
      console.log(err);
    }
  }, [nostrAuthors, video]);

  useEffect(() => {
    if (
      video &&
      userKeys &&
      (userKeys.sec || userKeys.ext || userKeys.bunker)
    ) {
      dispatch(
        setToPublish({
          userKeys: userKeys,
          kind: 34237,
          content: "",
          tags: [
            ["a", `${video.kind}:${video.pubkey}:${video.d}`],
            ["d", `${video.kind}:${video.pubkey}:${video.d}`],
          ],
          allRelays: [],
        })
      );
    }
  }, [video, userKeys]);

  return (
    <>
      {usersList && (
        <ShowUsersList
          exit={() => setUsersList(false)}
          title={usersList.title}
          list={usersList.list}
          extras={usersList.extras}
          extrasType={usersList.extrasType}
        />
      )}
      {showAddArticleToCuration && (
        <AddArticleToCuration
          d={video.aTag}
          exit={() => setShowArticleToCuration(false)}
          kind={30005}
        />
      )}
      <div>
        <ArrowUp />
        <div
          className="fit-container fx-centered fx-start-v"
          style={{ minHeight: "100vh" }}
        >
          {isMuted && (
            <PagePlaceholder page={"muted-user"} onClick={muteUnmute} />
          )}
          {!isMuted && (
            <div className="main-middle box-pad-h-m">
              {showCommentsSection && (
                <RepEventCommentsSection
                  id={video.aTag}
                  author={userProfile}
                  eventPubkey={video.pubkey}
                  leaveComment={showCommentsSection.comment}
                  exit={() => setShowCommentsSections(false)}
                  kind={video.kind}
                  event={video}
                />
              )}
              {!showCommentsSection && (
                <>
                  <Backbar />
                  <div>
                    {getVideoFromURL(video.url)}
                    <div
                      className="fx-centered fx-col fx-start-h fx-start-v"
                      style={{ marginTop: ".5rem" }}
                    >
                      <h4>{video.title}</h4>
                    </div>
                    <div className="fx-scattered fit-container box-pad-v-m">
                      <div className="fx-centered">
                        <UserProfilePic
                          img={userProfile.picture}
                          size={24}
                          user_id={userProfile.pubkey}
                          allowClick={true}
                        />
                        <p>{userProfile.name}</p>
                      </div>
                      <div className="fx-centered">
                        <Follow
                          size="small"
                          icon={false}
                          toFollowKey={userProfile.pubkey}
                          toFollowName={""}
                          bulkList={[]}
                        />
                      </div>
                    </div>
                    <div
                      className="fit-container sc-s-18 box-pad-h-m box-pad-v-m fx-centered fx-start-h fx-start-v fx-wrap pointer"
                      style={{
                        border: "none",
                        backgroundColor: "var(--c1-side)",
                      }}
                      onClick={() => setExpandDescription(!expandDescription)}
                    >
                      <div className="fit-container fx-centered fx-start-h">
                        <p className="gray-c p-medium">
                          {t("AginxGR", { count: videoViews })}
                        </p>
                        <p className="p-small gray-c">&#9679;</p>
                        <p className="gray-c p-medium">
                          <Date_
                            toConvert={new Date(video.published_at * 1000)}
                            time={true}
                          />
                        </p>
                      </div>
                      <p
                        className={`fit-container ${
                          !expandDescription ? "p-four-lines" : ""
                        }`}
                      >
                        {video.content}
                      </p>
                      {!video.content && (
                        <p className="gray-c p-medium p-italic">
                          {t("AtZrjns")}
                        </p>
                      )}

                      <div className="fx-centered fx-start-h fx-wrap">
                        {video.keywords.map((tag, index) => {
                          return (
                            <Link
                              key={index}
                              className="sticker sticker-small sticker-gray-gray pointer"
                              href={`/search?keyword=${tag?.replace(
                                "#",
                                "%23"
                              )}`}
                              state={{ tab: "videos" }}
                            >
                              {tag}
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                    {morePosts.length > 0 && (
                      <div
                        className="fit-container box-pad-v fx-centered fx-col fx-start-v box-marg-s"
                        style={{
                          rowGap: "24px",
                          border: "none",
                        }}
                      >
                        <h4>{t("Aag9u1h")}</h4>
                        <div className="fit-container fx-centered fx-wrap">
                          {morePosts.map((video_) => {
                            if (video_.id !== video.id)
                              return (
                                <Link
                                  key={video_.id}
                                  className="fit-container fx-centered fx-start-h"
                                  href={`/video/${video_.naddr}`}
                                  target="_blank"
                                >
                                  <div
                                    style={{
                                      minWidth: "128px",
                                      aspectRatio: "16/9",
                                      borderRadius: "var(--border-r-6)",
                                      backgroundImage: `url(${video_.image})`,
                                      backgroundColor: "black",
                                      position: "relative",
                                    }}
                                    className="bg-img cover-bg fx-centered fx-end-v fx-end-h box-pad-h-s box-pad-v-s"
                                  >
                                    <div
                                      className="fx-centered"
                                      style={{
                                        position: "absolute",
                                        left: 0,
                                        top: 0,
                                        width: "100%",
                                        height: "100%",
                                      }}
                                    >
                                      <div className="play-vid-58"></div>
                                    </div>
                                  </div>
                                  <div>
                                    <p className="p-small gray-c">
                                      <Date_
                                        toConvert={
                                          new Date(video_.published_at * 1000)
                                        }
                                      />
                                    </p>
                                    <p className="p-medium p-two-lines">
                                      {video_.title}
                                    </p>
                                    <AuthorPreviewExtra
                                      authorPubkey={video_.pubkey}
                                    />
                                  </div>
                                </Link>
                              );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          )}
        </div>
        {!showCommentsSection && !isMuted && (
          <div
            className="fit-container fx-col sticky-to-fixed fx-centered"
            style={{
              bottom: 0,
              borderTop: "1px solid var(--very-dim-gray)",
            }}
          >
            {postActions?.zaps?.zaps?.length > 0 && (
              <div className="main-middle box-pad-h-m">
                <ZapAd
                  zappers={postActions.zaps.zaps}
                  onClick={() =>
                    setUsersList({
                      title: t("AVDZ5cJ"),
                      list: postActions.zaps.zaps.map((item) => item.pubkey),
                      extras: postActions.zaps.zaps,
                    })
                  }
                  margin={false}
                />
              </div>
            )}
            <div className="main-middle fx-scattered box-pad-h-m box-marg-s">
              <PostReaction
                event={video}
                userProfile={userProfile}
                postActions={postActions}
                openComment={showCommentsSection.comment}
                setShowComments={() =>
                  setShowCommentsSections({ comment: false })
                }
                setOpenComment={() =>
                  setShowCommentsSections({ comment: true })
                }
              />
              <EventOptions
                event={video}
                eventActions={postActions}
                component="repEvents"
              />
            </div>
          </div>
        )}
      </div>
    </>
  );
}

const AuthorPreviewExtra = ({ authorPubkey }) => {
  const nostrAuthors = useSelector((state) => state.nostrAuthors);
  const [authorData, setAuthorData] = useState(
    getEmptyuserMetadata(authorPubkey)
  );
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        let auth = getUser(authorPubkey);

        if (auth) {
          setAuthorData(auth);
        }
        return;
      } catch (err) {
        console.log(err);
      }
    };
    fetchData();
  }, [nostrAuthors]);

  return (
    <div className="fx-centered fx-start-h">
      <UserProfilePic
        size={16}
        img={authorData.picture}
        mainAccountUser={false}
        user_id={authorData.pubkey}
      />

      <p className="p-one-line p-medium">
        {authorData.display_name || authorData.name}
      </p>
    </div>
  );
};
