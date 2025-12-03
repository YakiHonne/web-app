import React, { useMemo, useRef, useState, useEffect } from "react";
import MarkdownPreview from "@uiw/react-markdown-preview";
import katex from "katex";
import {
  checkForLUDS,
  convertDate,
  getParsedRepEvent,
  minimizeKey,
  detectDirection,
} from "@/Helpers/Encryptions";
import { getComponent } from "@/Helpers/ClientHelpers";
import { shuffleArray } from "@/Helpers/Helpers";
import UserProfilePic from "@/Components/UserProfilePic";
import Date_ from "@/Components/Date_";
import Follow from "@/Components/Follow";
import ZapTip from "@/Components/ZapTip";
import ShowUsersList from "@/Components/ShowUsersList";
import ArrowUp from "@/Components/ArrowUp";
import CheckNOSTRClient from "@/Components/CheckNOSTRClient";
import { useDispatch, useSelector } from "react-redux";
import TopicsTags from "@/Content/TopicsTags";
import DynamicIndicator from "@/Components/DynamicIndicator";
import useRepEventStats from "@/Hooks/useRepEventStats";
import RepEventCommentsSection from "@/Components/RepEventCommentsSection";
import Backbar from "@/Components/Backbar";
import { useTranslation } from "react-i18next";
import { translate } from "@/Helpers/Controlers";
import LoadingDots from "@/Components/LoadingDots";
import { setToast } from "@/Store/Slides/Publishers";
import PagePlaceholder from "@/Components/PagePlaceholder";
import bannedList from "@/Content/BannedList";
import ZapAd from "@/Components/ZapAd";
import useUserProfile from "@/Hooks/useUsersProfile";
import { saveUsers } from "@/Helpers/DB";
import useIsMute from "@/Hooks/useIsMute";
import EventOptions from "@/Components/ElementOptions/EventOptions";
import { getSubData } from "@/Helpers/Controlers";
import Link from "next/link";
import { customHistory } from "@/Helpers/History";
import PostReaction from "@/Components/PostReaction";
import { useTheme } from "next-themes";
import LoadingLogo from "@/Components/LoadingLogo";

export default function Article({ event, userProfile, naddrData }) {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const userKeys = useSelector((state) => state.userKeys);
  const { resolvedTheme } = useTheme();
  const isDarkMode = ["dark", "gray", "system"].includes(resolvedTheme);
  const [isLoading, setIsLoading] = useState(event ? false : true);
  const [post, setPost] = useState(event);
  const [usersList, setUsersList] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [showCommentsSection, setShowCommentsSections] = useState(false);
  const [translatedTitle, setTranslatedTitle] = useState("");
  const [translatedDescription, setTranslatedDescription] = useState("");
  const [translatedDir, setTranslatedDir] = useState(false);
  const [translatedContent, setTranslatedContent] = useState("");
  const [showTranslation, setShowTranslation] = useState(false);
  const [isContentTranslating, setIsContentTranslating] = useState(false);
  const containerRef = useRef(null);
  const { muteUnmute, isMuted } = useIsMute(
    naddrData ? naddrData.pubkey : null
  );

  useEffect(() => {
    const handleScroll = () => {
      if (containerRef.current) {
        setShowPreview(containerRef.current.scrollTop >= 200);
      }
    };

    const observer = new MutationObserver((mutations) => {
      for (let mutation of mutations) {
        if (mutation.type === "childList") {
          const container = document.querySelector(".page-container");
          if (container) {
            containerRef.current = container;
            container.addEventListener("scroll", handleScroll);
            observer.disconnect();
          }
        }
      }
    });

    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      if (containerRef.current) {
        containerRef.current.removeEventListener("scroll", handleScroll);
      }
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    const fetchPost = async () => {
      setIsLoading(true);
      const res = await getSubData(
        [
          {
            authors: naddrData.pubkey ? [naddrData.pubkey] : undefined,
            kinds: [naddrData.kind],
            "#d": [naddrData.identifier],
          },
        ],
        5000,
        naddrData.relays || undefined,
        undefined,
        1
      );
      if (res.data.length === 0) {
        setIsLoading(false);
        return;
      }
      let post_ = {
        ...res.data[0],
      };
      let parsedPost = getParsedRepEvent(post_);
      saveUsers([post_.pubkey]);
      setPost(parsedPost);
      setIsLoading(false);
    };
    if (!event && naddrData) fetchPost();
    if (!event && !naddrData) setIsLoading(false);
  }, []);

  const translateArticle = async () => {
    setIsContentTranslating(true);
    if (translatedContent) {
      setShowTranslation(true);
      setIsContentTranslating(false);
      return;
    }
    try {
      let res = await translate(
        [post.title, post.description || " ", post.content].join(" ABCAF ")
      );
      if (res.status === 500) {
        dispatch(
          setToast({
            type: 2,
            desc: t("AZ5VQXL"),
          })
        );
      }
      if (res.status === 400) {
        dispatch(
          setToast({
            type: 2,
            desc: t("AJeHuH1"),
          })
        );
      }
      if (res.status === 200) {
        setTranslatedTitle(res.res.split("ABCAF")[0]);
        setTranslatedDescription(res.res.split("ABCAF")[1]);
        setTranslatedContent(res.res.split("ABCAF")[2]);
        setTranslatedDir(detectDirection(res.res.split("ABCAF")[2]));
        setShowTranslation(true);
      }
      setIsContentTranslating(false);
    } catch (err) {
      setShowTranslation(false);
      setIsContentTranslating(false);
      dispatch(
        setToast({
          type: 2,
          desc: t("AZ5VQXL"),
        })
      );
    }
  };

  if (bannedList.includes(post?.pubkey)) {
    customHistory("/");
    return;
  }
  if (isLoading)
    return (
      <div
        className="fit-container fx-centered fx-col"
        style={{ height: "100vh" }}
      >
        <LoadingLogo />
      </div>
    );

  if (!post && !isLoading)
    return (
      <div
        className="fit-container fx-centered fx-col"
        style={{ height: "100vh" }}
      >
        <h4>{t("AH90wGL")}</h4>
        <p className="gray-c p-centered">{t("Agge1Vg")}</p>
        <Link href="/">
          <button className="btn btn-normal btn-small">{t("AWroZQj")}</button>
        </Link>
      </div>
    );
  return (
    <div>
      {usersList && (
        <ShowUsersList
          exit={() => setUsersList(false)}
          title={usersList.title}
          list={usersList.list}
          extras={usersList.extras}
          extrasType={usersList.extrasType}
        />
      )}

      <ArrowUp />
      {post.title && (
        <>
          <div
            className="fit-container fx-centered fx-start-v box-pad-h-m"
            style={{ minHeight: "100vh" }}
          >
            {isMuted && (
              <PagePlaceholder page={"muted-user"} onClick={muteUnmute} />
            )}
            {!isMuted && (
              <div
                className={`fit-container fx-centered fx-wrap  main-middle`}
              >
                {showCommentsSection && (
                  <RepEventCommentsSection
                    id={post.aTag}
                    author={userProfile}
                    eventPubkey={post.pubkey}
                    leaveComment={showCommentsSection.comment}
                    exit={() => setShowCommentsSections(false)}
                    kind={post.kind}
                    event={post}
                  />
                )}
                {!showCommentsSection && (
                  <div
                    className="fit-container fx-centered fx-start-h fx-start-v fx-col nostr-article"
                    style={{ gap: 0 }}
                  >
                    <Backbar />
                    {showPreview && (
                      <>
                        <div
                          className="fx-centered fx-col fx-start-h fx-start-v fit-container box-pad-v sticky slide-down"
                          style={{
                            paddingBottom: 0,
                          }}
                        >
                          <div className="fx-centered">
                            <UserProfilePic
                              size={20}
                              img={userProfile.picture}
                              mainAccountUser={false}
                              user_id={userProfile.pubkey}
                              allowClick={true}
                            />
                            <div className="fx-centered fx-start-h">
                              <div>
                                <p className="p-caps">
                                  {t("AsXpL4b", {
                                    name:
                                      userProfile.display_name ||
                                      userProfile.name ||
                                      minimizeKey(post.pubkey),
                                  })}
                                </p>
                              </div>
                              <p className="gray-c p-medium">&#8226;</p>
                              <p className="gray-c">
                                <Date_
                                  toConvert={new Date(post.created_at * 1000)}
                                />
                              </p>
                            </div>
                          </div>
                          <h4>
                            {showTranslation ? translatedTitle : post.title}
                          </h4>
                          <div style={{ height: ".125rem" }}></div>
                          <ReaderIndicator />
                        </div>
                      </>
                    )}
                    {!showPreview && (
                      <div
                        className="fx-scattered fit-container box-pad-v"
                        style={{
                          paddingTop: 0,
                          borderBottom: "1px solid var(--very-dim-gray)",
                        }}
                      >
                        <AuthPreview pubkey={post.pubkey} />
                        {userKeys.pub !== post.pubkey && (
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
                              aTag={post.naddr}
                              forContent={post.title}
                            />
                          </div>
                        )}
                        {userKeys.pub === post.pubkey && (
                          <Link
                            href={"/write-article?edit=" + post.naddr}
                            onClick={() => {
                              localStorage.setItem(
                                "ArticleToEdit",
                                JSON.stringify({
                                  post_pubkey: post.pubkey,
                                  post_id: post.id,
                                  post_kind: post.kind,
                                  post_title: post.title,
                                  post_desc: post.description,
                                  post_thumbnail: post.image,
                                  post_tags: post.items,
                                  post_d: post.d,
                                  post_content: post.content,
                                  post_published_at: post.published_at,
                                })
                              );
                            }}
                          >
                            <button className="btn btn-gray">
                              {t("Aig65l1")}
                            </button>
                          </Link>
                        )}
                      </div>
                    )}
                    <div
                      className="fit-container fx-scattered fx-start-v fx-col box-pad-v"
                      style={{ columnGap: "10px" }}
                    >
                      <h3 dir={showTranslation ? translatedDir : post.dir}>
                        {showTranslation ? translatedTitle : post.title}
                      </h3>
                      <div
                        className="fx-centered fit-container fx-start-h"
                        style={{ minWidth: "max-content" }}
                      >
                        <p className="gray-c">{t("AHhPGax", { date: "" })}</p>
                        <span
                          className="orange-c p-one-line"
                          style={{ maxWidth: "200px" }}
                        >
                          <CheckNOSTRClient client={post.client} />
                        </span>
                        <p className="gray-c p-medium">&#8226;</p>
                        <div className="fx-start-h fx-centered">
                          <p
                            className="gray-c pointer round-icon-tooltip"
                            data-tooltip={t("AOsxQxu", {
                              cdate: convertDate(post.published_at * 1000),
                              edate: convertDate(post.created_at * 1000),
                            })}
                          >
                            <Date_
                              toConvert={new Date(post.created_at * 1000)}
                            />
                          </p>
                        </div>
                      </div>
                      {post.description && (
                        <div
                          className="fit-container "
                          dir={showTranslation ? translatedDir : post.dir}
                        >
                          {showTranslation
                            ? translatedDescription
                            : post.description}
                        </div>
                      )}
                      {post.tTags?.length > 0 && (
                        <div
                          className="fx-centered fx-start-h fx-wrap"
                          style={{ marginLeft: 0 }}
                        >
                          {post.tTags?.map((tag, index) => {
                            return (
                              <Link
                                key={`${tag}-${index}`}
                                style={{
                                  textDecoration: "none",
                                  color: "white",
                                }}
                                className="sticker sticker-c1 sticker-small"
                                href={`/search?keyword=${tag.replace(
                                  "#",
                                  "%23"
                                )}`}
                                state={{ tab: "articles" }}
                                // target={"_blank"}
                              >
                                {tag}
                              </Link>
                            );
                          })}
                        </div>
                      )}
                    </div>
                    {post.image && (
                      <div className="box-marg-s fit-container">
                        <div
                          className="sc-s-18 bg-img cover-bg fit-container"
                          style={{
                            backgroundImage: `url(${post.image})`,
                            backgroundColor: "var(--very-dim-gray)",
                            height: "auto",
                            aspectRatio: "20/9",
                          }}
                        ></div>
                      </div>
                    )}
                    <div
                      className="article fit-container"
                      dir={showTranslation ? translatedDir : post.dir}
                    >
                      <MarkdownPreview
                        wrapperElement={{
                          "data-color-mode": isDarkMode ? "dark" : "light",
                        }}
                        source={
                          showTranslation ? translatedContent : post.content
                        }
                        rehypeRewrite={(node, index, parent) => {
                          if (
                            node.tagName === "a" &&
                            parent &&
                            /^h(1|2|3|4|5|6)/.test(parent.tagName)
                          ) {
                            parent.children = parent.children.slice(1);
                          }
                        }}
                        components={{
                          p: ({ children }) => {
                            return <div className="box-marg-s">{getComponent(children)}</div>;
                          },
                          h1: ({ children }) => {
                            return <h1>{children}</h1>;
                          },
                          h2: ({ children }) => {
                            return <h2>{children}</h2>;
                          },
                          h3: ({ children }) => {
                            return <h3>{children}</h3>;
                          },
                          h4: ({ children }) => {
                            return <h4>{children}</h4>;
                          },
                          h5: ({ children }) => {
                            return <h5>{children}</h5>;
                          },
                          h6: ({ children }) => {
                            return <h6>{children}</h6>;
                          },
                          li: ({ children }) => {
                            return <li>{children}</li>;
                          },
                          code: ({ inline, children, className, ...props }) => {
                            if (!children) return;
                            const txt = children[0] || "";

                            if (inline) {
                              if (
                                typeof txt === "string" &&
                                /^\$\$(.*)\$\$/.test(txt)
                              ) {
                                const html = katex.renderToString(
                                  txt.replace(/^\$\$(.*)\$\$/, "$1"),
                                  {
                                    throwOnError: false,
                                  }
                                );
                                return (
                                  <code
                                    dangerouslySetInnerHTML={{
                                      __html: html,
                                    }}
                                  />
                                );
                              }
                              return (
                                <code
                                  dangerouslySetInnerHTML={{
                                    __html: txt,
                                  }}
                                />
                              );
                            }
                            if (
                              typeof txt === "string" &&
                              typeof className === "string" &&
                              /^language-katex/.test(
                                className.toLocaleLowerCase()
                              )
                            ) {
                              const html = katex.renderToString(txt, {
                                throwOnError: false,
                              });
                              return (
                                <code
                                  dangerouslySetInnerHTML={{
                                    __html: html,
                                  }}
                                />
                              );
                            }

                            return (
                              <code className={String(className)}>
                                {children}
                              </code>
                            );
                          },
                        }}
                      />
                    </div>
                    <ReadMore />
                  </div>
                )}
              </div>
            )}
          </div>
          {!showCommentsSection && !isMuted && (
            <div
              className="fit-container fx-centered fx-col sticky-to-fixed"
              style={{
                bottom: 0,
                borderTop: "1px solid var(--very-dim-gray)",
              }}
            >
              <div
                style={{ position: "relative" }}
                className="slide-up fx-centered fit-container"
              >
                {!isContentTranslating && !showTranslation && (
                  <button
                    className="btn btn-normal slide-up"
                    style={{
                      position: "absolute",
                      top: "-50px",
                      borderRadius: "45px",
                      minWidth: "max-content",
                    }}
                    onClick={translateArticle}
                  >
                    {t("AdHV2qJ")}
                  </button>
                )}
                {!isContentTranslating && showTranslation && (
                  <button
                    className="btn btn-red slide-up"
                    style={{
                      position: "absolute",
                      top: "-50px",
                      borderRadius: "45px",
                      minWidth: "max-content",
                    }}
                    onClick={() => setShowTranslation(false)}
                  >
                    {t("AE08Wte")}
                  </button>
                )}
                {isContentTranslating && (
                  <button
                    className="btn btn-normal slide-up"
                    style={{
                      position: "absolute",
                      top: "-50px",
                      borderRadius: "45px",
                      minWidth: "max-content",
                    }}
                  >
                    <LoadingDots />
                  </button>
                )}
              </div>
              <PostStats
                post={post}
                userProfile={userProfile}
                showCommentsSection={showCommentsSection}
                setShowCommentsSections={setShowCommentsSections}
              />
            </div>
          )}
        </>
      )}
      {!post.title && (
        <div
          className="fit-container fx-centered fx-col"
          style={{ height: "100vh" }}
        >
          <h4>{t("AawvPaR")}</h4>
          <p className="gray-c p-centered">{t("AwARx3K")}</p>
          <Link href="/discover">
            <button className="btn btn-normal btn-small">{t("AJGu0M0")}</button>
          </Link>
        </div>
      )}
    </div>
  );
}

const ReaderIndicator = () => {
  const [scrollPercent, setScrollPercent] = useState(0);
  useEffect(() => {
    const handleScroll = (container) => {
      if (container) {
        const scrollHeight = container.scrollHeight;
        const clientHeight = window.innerHeight;
        const scrollTop = container.scrollTop;

        const remaining =
          100 - (1 - scrollTop / (scrollHeight - clientHeight)) * 100;

        setScrollPercent(remaining);
      }
    };

    const container = document.querySelector(".page-container");

    if (container) {
      container.addEventListener("scroll", () => handleScroll(container));
    }

    return () => {
      if (container) {
        container.removeEventListener("scroll", () => handleScroll(container));
      }
    };
  }, []);

  return (
    <div className="fit-container">
      <div
        style={{
          width: `${scrollPercent}%`,
          height: "4px",
          backgroundColor: "var(--c1)",
          transition: ".05s linear",
        }}
      ></div>
    </div>
  );
};

const AuthPreview = ({ pubkey }) => {
  const { t } = useTranslation();
  const { userProfile, isNip05Verified } = useUserProfile(pubkey);

  return (
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
          <div className="fx-centered" style={{ gap: "3px" }}>
            <p className="p-big p-caps">
              {userProfile.display_name || userProfile.name}
            </p>
            {isNip05Verified && <div className="checkmark-c1-24"></div>}
          </div>
        </div>
      </div>
    </div>
  );
};

const ReadMore = () => {
  const { t } = useTranslation();
  const [readMore, setReadMore] = useState([]);
  useEffect(() => {
    const fetchData = async () => {
      try {
        let tempArray = shuffleArray(TopicsTags);
        let tempArray_2 = tempArray.splice(0, 5);
        let tags = shuffleArray(
          tempArray_2.map((item) => [item.main_tag, ...item.sub_tags]).flat()
        );
        let recommendedPosts = await getSubData(
          [
            {
              kinds: [30023],
              "#t": tags,
              limit: 5,
            },
          ],
          50,
          undefined,
          undefined,
          5
        );
        if (recommendedPosts.data.length > 0) {
          setReadMore(recommendedPosts.data.map((_) => getParsedRepEvent(_)));
          saveUsers(recommendedPosts.pubkeys);
        }
      } catch (err) {
        console.log(err);
      }
    };
    fetchData();
  }, []);

  return (
    <>
      {readMore.length > 0 && (
        <div className="fx-centered fx-start-h fx-wrap fit-container box-marg-s box-pad-v">
          <hr />
          <p className="p-big">{t("AArGqN7")}</p>
          {readMore.map((post) => {
            if (post.image)
              return (
                <Link
                  className="fit-container fx-scattered"
                  key={post.id}
                  style={{
                    textDecoration: "none",
                    color: "var(--black)",
                  }}
                  href={`/article/${post.naddr}`}
                  target="_blank"
                >
                  <div className="fx-centered">
                    {post.image && (
                      <div
                        className=" bg-img cover-bg sc-s-18 "
                        style={{
                          backgroundImage: `url(${post.image})`,
                          minWidth: "48px",
                          aspectRatio: "1/1",
                          borderRadius: "var(--border-r-18)",
                          border: "none",
                        }}
                      ></div>
                    )}
                    <div>
                      <p className="p-one-line">{post.title}</p>
                      <DynamicIndicator item={post} />
                    </div>
                  </div>
                </Link>
              );
          })}
        </div>
      )}
    </>
  );
};

const PostStats = ({
  post,
  userProfile,
  showCommentsSection,
  setShowCommentsSections,
}) => {
  const { postActions } = useRepEventStats(post.aTag, post.pubkey);

  return (
    <>
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
          event={post}
          userProfile={userProfile}
          postActions={postActions}
          openComment={showCommentsSection.comment}
          setShowComments={() => setShowCommentsSections({ comment: false })}
          setOpenComment={() => setShowCommentsSections({ comment: true })}
        />
        <EventOptions event={post} component="repEvents" />
      </div>
    </>
  );
};
