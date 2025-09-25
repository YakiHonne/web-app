import React, { useState, useEffect } from "react";
import {
  checkForLUDS,
  convertDate,
  getParsedRepEvent,
  minimizeKey,
  removeDuplicants,
} from "@/Helpers/Encryptions";
import Date_ from "@/Components/Date_";
import UserProfilePic from "@/Components/UserProfilePic";
import LoadingDots from "@/Components/LoadingDots";
import ZapTip from "@/Components/ZapTip";
import ShowUsersList from "@/Components/ShowUsersList";
import RepEventPreviewCard from "@/Components/RepEventPreviewCard";
import CheckNOSTRClient from "@/Components/CheckNOSTRClient";
import { useDispatch, useSelector } from "react-redux";
import { setToast } from "@/Store/Slides/Publishers";
import { getSubData } from "@/Helpers/Controlers";
import { saveUsers } from "@/Helpers/DB";
import useRepEventStats from "@/Hooks/useRepEventStats";
import Follow from "@/Components/Follow";
import RepEventCommentsSection from "@/Components/RepEventCommentsSection";
import Backbar from "@/Components/Backbar";
import DynamicIndicator from "@/Components/DynamicIndicator";
import { useTranslation } from "react-i18next";
import PagePlaceholder from "@/Components/PagePlaceholder";
import ZapAd from "@/Components/ZapAd";
import EventOptions from "@/Components/ElementOptions/EventOptions";
import useIsMute from "@/Hooks/useIsMute";
import Link from "next/link";
import PostReaction from "@/Components/PostReaction";

export default function Curation({ event, userProfile }) {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const userKeys = useSelector((state) => state.userKeys);
  const [isArtsLoaded, setIsArtsLoaded] = useState(false);
  const curation = event;
  const [articlesOnCuration, setArticlesOnCuration] = useState([]);
  const [usersList, setUsersList] = useState(false);
  const [showCommentsSection, setShowCommentsSections] = useState(false);
  const [morePosts, setMorePosts] = useState([]);
  const { muteUnmute, isMuted } = useIsMute(curation.pubkey);

  const { postActions } = useRepEventStats(curation?.aTag, curation?.pubkey);

  useEffect(() => {
    const fetchData = async () => {
      try {
        let authPubkeys = removeDuplicants(
          getAuthPubkeys(curation?.tags || [])
        );
        saveUsers(authPubkeys);
        let dRefs = getDRef(curation?.tags || []);
        if (dRefs.length === 0) setIsArtsLoaded(true);
        let data = await getSubData(
          [
            {
              kinds: curation.kind === 30004 ? [30023] : [34235, 21, 22],
              "#d": dRefs,
            },
          ],
          100
        );

        let posts = sortPostsOnCuration(
          dRefs,
          data.data.map((post) => getParsedRepEvent(post))
        );
        setArticlesOnCuration(posts);
        setIsArtsLoaded(true);
      } catch (err) {
        console.log(err);
        dispatch(
          setToast({
            type: 2,
            desc: t("AAZJZMU"),
          })
        );
        return;
      }
    };
    if (curation) fetchData();
  }, []);

  useEffect(() => {
    const fetchMoreCurations = async () => {
      try {
        let data = await getSubData(
          [
            {
              kinds: [30004, 30005],
              limit: 5,
            },
          ],
          100
        );
        let posts = data.data
          .splice(0, 5)
          .map((event) => getParsedRepEvent(event))
          .filter((_) => _.id !== curation.id);
        setMorePosts(posts);

        saveUsers(data.pubkeys);
      } catch (err) {
        console.log(err);
      }
    };
    fetchMoreCurations();
  }, []);

  const getDRef = (tags) => {
    let tempArray = [];
    for (let tag of tags) {
      if (tag[0] === "a") {
        tempArray.push(tag[1].split(":").splice(2, 100).join(":"));
      }
    }
    return tempArray;
  };
  const getAuthPubkeys = (tags) => {
    let tempArray = [];
    for (let tag of tags) {
      if (tag[0] === "a") {
        tempArray.push(tag[1].split(":")[1]);
      }
    }
    return tempArray;
  };

  const sortPostsOnCuration = (original, toSort) => {
    let tempArray = [];
    for (let post of original) {
      tempArray.push(toSort.find((item) => item.d === post));
    }
    return tempArray.filter((item) => item);
  };

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
      <div>
        <div
          className="fit-container fx-centered fx-start-v"
          style={{ minHeight: "100vh" }}
        >
          {isMuted && (
            <PagePlaceholder page={"muted-user"} onClick={muteUnmute} />
          )}
          {!isMuted && (
            <div className="fit-container fx-centered fx-start-v fx-col box-pad-h-m main-middle">
              {showCommentsSection && (
                <RepEventCommentsSection
                  id={curation.aTag}
                  author={userProfile}
                  eventPubkey={curation.pubkey}
                  leaveComment={showCommentsSection.comment}
                  exit={() => setShowCommentsSections(false)}
                  kind={curation.kind}
                  event={curation}
                />
              )}
              {!showCommentsSection && (
                <>
                  <Backbar />
                  <div
                    className="fx-scattered fit-container box-pad-v"
                    style={{
                      paddingTop: 0,
                      borderBottom: "1px solid var(--very-dim-gray)",
                    }}
                  >
                    <div className="fx-centered">
                      <UserProfilePic
                        size={48}
                        img={userProfile.picture}
                        mainAccountUser={false}
                        user_id={userProfile.pubkey}
                        allowClick={true}
                      />
                      <div className="fx-centered fx-col fx-start-v">
                        <div>
                          <p className="gray-c">{t("AVG3Uga")}</p>
                          <p className="p-big p-caps">
                            {userProfile.display_name ||
                              userProfile.name ||
                              minimizeKey(curation.pubkey)}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="fx-centered">
                      <Follow
                        toFollowKey={userProfile.pubkey}
                        toFollowName={userProfile.name}
                        bulk={false}
                        bulkList={[]}
                      />
                      <ZapTip
                        recipientLNURL={checkForLUDS(
                          userProfile.lud06,
                          userProfile.lud16
                        )}
                        recipientPubkey={userProfile.pubkey}
                        senderPubkey={userKeys.pub}
                        recipientInfo={{
                          name: userProfile.name,
                          img: userProfile.picture,
                        }}
                        aTag={curation.aTag}
                        forContent={curation.title}
                      />
                    </div>
                  </div>
                  <div
                    className="fit-container fx-scattered fx-start-v fx-col box-pad-v-m"
                    style={{ columnGap: "10px" }}
                    dir="auto"
                  >
                    <h3 dir="auto">{curation.title}</h3>
                    <div
                      className="fx-centered fit-container fx-start-h"
                      style={{ minWidth: "max-content" }}
                    >
                      <p className="gray-c">
                        {t("AHhPGax", {
                          date: convertDate(
                            new Date(curation.published_at * 1000)
                          ),
                        })}
                      </p>
                      <span
                        className="orange-c p-one-line"
                        style={{ maxWidth: "200px" }}
                      >
                        <CheckNOSTRClient client={curation.client} />
                      </span>
                      <p className="gray-c p-medium">&#8226;</p>
                      <div className="fx-start-h fx-centered">
                        <p
                          className="gray-c pointer round-icon-tooltip"
                          data-tooltip={t("AOsxQxu", {
                            cdate: convertDate(curation.published_at * 1000),
                            edate: convertDate(curation.created_at * 1000),
                          })}
                        >
                          <Date_
                            toConvert={new Date(curation.created_at * 1000)}
                          />
                        </p>
                      </div>
                    </div>
                    {curation.description && (
                      <div className="fit-container ">
                        {curation.description}
                      </div>
                    )}
                  </div>
                  {curation.image && (
                    <div className="box-marg-s fit-container">
                      <div
                        className="sc-s-18 bg-img cover-bg fit-container"
                        style={{
                          backgroundImage: `url(${curation.image})`,
                          backgroundColor: "var(--very-dim-gray)",
                          height: "auto",
                          aspectRatio: "20/9",
                        }}
                      ></div>
                    </div>
                  )}
                  <div className="fx-centered fx-start-v fx-col fit-container ">
                    {!articlesOnCuration.length && !isArtsLoaded && (
                      <div
                        className="fx-centered fit-container"
                        style={{ height: "20vh" }}
                      >
                        <p className="gray-c p-medium">{t("AKvHyxG")}</p>
                        <LoadingDots />
                      </div>
                    )}
                    {articlesOnCuration.length > 0 && isArtsLoaded && (
                      <div className="fit-container box-marg-s fx-start-h fx-centered">
                        <h4>
                          {t("A04okTg", {
                            count: articlesOnCuration.length,
                          })}
                        </h4>
                      </div>
                    )}
                    <div
                      className="fit-container fx-scattered"
                      style={{
                        borderTop:
                          articlesOnCuration.length > 0
                            ? "1px solid var(--very-dim-gray)"
                            : "",
                      }}
                    >
                      {articlesOnCuration.length > 0 && (
                        <div
                          className="fx-centered fit-container fx-start-h fx-wrap"
                          style={{ gap: 0 }}
                        >
                          {articlesOnCuration.map((item, index) => {
                            return (
                              <RepEventPreviewCard item={item} key={item.id} />
                            );
                          })}
                        </div>
                      )}

                      {articlesOnCuration.length === 0 && isArtsLoaded && (
                        <div className="fx-centered fx-col">
                          <p className="gray-c box-pad-v-s">{t("AghKyAt")}</p>
                        </div>
                      )}
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
                        {morePosts.map((curation_) => {
                          if (
                            curation_.id !== curation.id &&
                            curation_.items.length > 0
                          )
                            return (
                              <Link
                                key={curation_.id}
                                className="fit-container fx-centered fx-start-h"
                                href={`/curation/${curation_.naddr}`}
                                target="_blank"
                              >
                                <div
                                  style={{
                                    minWidth: "48px",
                                    aspectRatio: "1/1",
                                    borderRadius: "var(--border-r-6)",
                                    backgroundImage: `url(${curation_.image})`,
                                    backgroundColor: "black",
                                    position: "relative",
                                  }}
                                  className="bg-img cover-bg fx-centered fx-end-v fx-end-h box-pad-h-s box-pad-v-s"
                                ></div>
                                <div>
                                  <p className=" p-two-lines">
                                    {curation_.title || t("AMvUjqZ")}
                                  </p>
                                  <p className="p-small gray-c">
                                    <DynamicIndicator item={curation_} />
                                  </p>
                                </div>
                              </Link>
                            );
                        })}
                      </div>
                    </div>
                  )}
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
              <div className="main-middle">
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
            <div className="main-middle fx-scattered">
              <PostReaction
                event={curation}
                userProfile={userProfile}
                postActions={postActions}
                openComment={showCommentsSection.comment}
                setShowComments={(status) =>
                  setShowCommentsSections({ comment: status })
                }
              />
              <EventOptions
                event={curation}
                eventActions={postActions}
                component="repEventsCard"
              />
            </div>
          </div>
        )}
      </div>
    </>
  );
}
