'use client';
import React, { useEffect, useState } from "react";
import LoadingScreen from "@/Components/LoadingScreen";
import LoadingDots from "@/Components/LoadingDots";
import Date_ from "@/Components/Date_";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { nip19 } from "nostr-tools";
import { getImagePlaceholder } from "@/Content/NostrPPPlaceholder";
import { setToast, setToPublish } from "@/Store/Slides/Publishers";
import { useDispatch, useSelector } from "react-redux";
import { ndkInstance } from "@/Helpers/NDKInstance";
import { useTranslation } from "react-i18next";

export default function AddArticlesToCuration({
  curation,
  tags,
  exit,
  curationKind = 30004,
  postKind = 30023,
}) {
  const { title, image, description } = curation;
  const dispatch = useDispatch();
  const userKeys = useSelector((state) => state.userMetadata);

  const { t } = useTranslation();
  const [posts, setPosts] = useState([]);
  const [NostrPosts, setNostrPosts] = useState([]);
  const [searchedPostsByNaddr, setSearchedPostByNaddr] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [searchedPost, setSearchedPost] = useState("");
  const [searchRes, setSearchRes] = useState([]);
  const [contentFrom, setContentFrom] = useState("relays");
  const [initScreen, setInitScreen] = useState(true);
  const [lastEventTime, setLastEventTime] = useState(undefined);
  const arts = postKind === 30023;

  useEffect(() => {
    getPostsInNOSTR();
  }, [contentFrom, lastEventTime]);

  useEffect(() => {
    getPostsInCuration();
  }, []);

  const getPostsInNOSTR = async () => {
    let sub = ndkInstance.subscribe(
      [
        {
          kinds: [postKind],
          authors: [userKeys.pubkey],
          limit: 10,
          until: lastEventTime,
        },
      ],
      { closeOnEose: true, cacheUsage: "CACHE_FIRST" }
    );

    sub.on("event", (event) => {
      onEvent(event);
    });
    sub.on("eose", () => {
      setIsLoaded(true);
      setIsLoading(false);
    });
  };
  const onEvent = (event) => {
    let author_pubkey = event.pubkey;
    let thumbnail = "";
    let title = "";
    let d = "";
    let added_date = new Date(event.created_at * 1000);
    for (let tag of event.tags) {
      if (tag[0] === "image" || tag[0] === "thumb") thumbnail = tag[1];
      if (tag[0] === "title") title = tag[1];
      if (tag[0] === "d") d = tag[1];
    }

    setNostrPosts((_posts) => {
      let newP = [
        ..._posts,
        {
          id: event.id,
          thumbnail: thumbnail || getImagePlaceholder(),
          author_pubkey,
          title,
          d,
          added_date,
          created_at: event.created_at,
        },
      ];
      newP.sort((el_1, el_2) => el_2.created_at - el_1.created_at);
      return newP;
    });

    setIsLoaded(true);
  };
  const getPostsInCuration = async () => {
    let dRefs = getDRef();
    let articlesOnCuration =
      dRefs.length > 0
        ? await Promise.all(
            dRefs.map((dref) => {
              let ev = ndkInstance.fetchEvent(
                {
                  kinds: [postKind],
                  "#d": [dref],
                },
                { closeOnEose: true, cacheUsage: "CACHE_FIRST" }
              );
              return ev;
            })
          )
        : [];

    let postsOnCuration = articlesOnCuration.map((event) => {
      let author_pubkey = event.pubkey;
      let thumbnail = "";
      let title = "";
      let d = "";
      let added_date = new Date(event.created_at * 1000);
      for (let tag of event.tags) {
        if (tag[0] === "image" || tag[0] === "thumb") thumbnail = tag[1];
        if (tag[0] === "title") title = tag[1];
        if (tag[0] === "d") d = tag[1];
      }
      return {
        id: event.id,
        thumbnail: thumbnail || getImagePlaceholder(),
        author_pubkey,
        title,
        d,
        added_date,
      };
    });

    setPosts(sortPostsOnCuration(postsOnCuration));
  };

  const saveUpdate = async () => {
    setIsLoading(true);
    let tempTags = [
      [
        "client",
        "Yakihonne",
        "31990:20986fb83e775d96d188ca5c9df10ce6d613e0eb7e5768a0f0b12b37cdac21b3:1700732875747",
      ],
    ];
    let is_published_at = tags.find((item) => item[0] === "published_at");
    let published_at = is_published_at
      ? is_published_at[1]
      : `${Math.floor(Date.now() / 1000)}`;
    tempTags.push(["d", tags.find((item) => item[0] === "d")[1]]);

    tempTags.push(["title", tags.find((item) => item[0] === "title")[1]]);
    tempTags.push(["published_at", published_at]);
    tempTags.push([
      "description",
      tags.find((item) => item[0] === "description")[1],
    ]);
    tempTags.push(["image", tags.find((item) => item[0] === "image")[1]]);

    for (let post of posts) {
      tempTags.push(["a", `${postKind}:${post.author_pubkey}:${post.d}`, ""]);
    }

    dispatch(
      setToPublish({
        userKeys: userKeys,
        kind: curationKind,
        content: "",
        tags: tempTags,
        allRelays: [],
      })
    );
    exit();
    setIsLoading(false);
  };

  const handleAddArticle = (post) => {
    let tempArray = Array.from(posts);
    let index = tempArray.findIndex((item) => item.id === post.id);
    if (index === -1) {
      setPosts([...posts, post]);
      return;
    }
    tempArray.splice(index, 1);
    setPosts(tempArray);
  };

  const checkIfBelongs = (post_id) => {
    return posts.find((post) => post.id === post_id) ? true : false;
  };

  const getDRef = () => {
    let tempArray = [];
    for (let tag of tags) {
      if (tag[0] === "a") {
        tempArray.push(tag[1].split(":").splice(2, 100).join(":"));
      }
    }
    return tempArray;
  };

  const handleDragEnd = (res) => {
    if (!res.destination) return;
    let tempArr = Array.from(posts);
    let [reorderedArr] = tempArr.splice(res.source.index, 1);
    tempArr.splice(res.destination.index, 0, reorderedArr);

    setPosts(tempArr);
  };

  const sortPostsOnCuration = (toSort) => {
    let original = getDRef();
    let tempArray = [];
    for (let post of original) {
      tempArray.push(toSort.find((item) => item.d === post));
    }
    return tempArray;
  };

  const handleSearchPostInNOSTR = (e) => {
    let search = e.target.value;
    setSearchedPost(search);
    if (!search) {
      setSearchRes([]);
      return;
    }
    let tempArray = Array.from(
      NostrPosts.filter((item) =>
        item.title.toLowerCase().includes(search.toLowerCase())
      )
    );
    setSearchRes(tempArray);
  };

  const switchContentSource = (source) => {
    setNostrPosts([]);
    setLastEventTime(undefined);
    setSearchRes([]);
    setSearchedPost("");
    if (contentFrom === source) return;
    setContentFrom(source);
  };

  const handleSearchByNaddr = async (e) => {
    let input = e.target.value;
    if (!input) return;
    try {
      let parsedData = nip19.decode(input);
      setIsLoading(true);
      let post = await ndkInstance.fetchEvent(
        {
          kinds: [postKind],
          authors: [parsedData.data.pubkey],
          "#d": [parsedData.data.identifier],
        },
        { closeOnEose: true, cacheUsage: "CACHE_FIRST" }
      );

      if (post) {
        let author_pubkey = post.pubkey;
        let thumbnail = "";
        let title = "";
        let d = "";
        let added_date = new Date(post.created_at * 1000);
        for (let tag of post.tags) {
          if (tag[0] === "image" || tag[0] === "thumb") thumbnail = tag[1];
          if (tag[0] === "title") title = tag[1];
          if (tag[0] === "d") d = tag[1];
        }

        setSearchedPostByNaddr((prev) => [
          {
            id: post.id,
            thumbnail: thumbnail || getImagePlaceholder(),
            author_pubkey,
            title,
            d,
            added_date,
            created_at: post.created_at,
          },
          ...prev,
        ]);
      } else {
        dispatch(
          setToast({
            type: 2,
            desc: t(arts ? "A7ggsnQ" : "AzAG7f8"),
          })
        );
      }
      setIsLoading(false);
    } catch (err) {
      dispatch(
        setToast({
          type: 2,
          desc: t("As0d1J3"),
        })
      );
    }
  };

  if (!isLoaded) return <LoadingScreen />;
  return (
    <>
      <section
        className="fixed-container fx-centered fx-col fx-start-h"
        style={{ overflow: "scroll" }}
        onClick={(e) => {
          e.stopPropagation();
          exit();
        }}
      >
        <div
          className="fx-centered fx-col sc-s-19 bg-sp  art-t-cur-container"
          style={{
            width: "min(100%, 800px)",
            height: "100vh",
            borderRadius: "0",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {!initScreen && (
            <>
              <div
                style={{
                  width: "min(100%, 800px)",
                  height: "100%",
                  overflow: "hidden",
                  backgroundColor: "var(--white)",
                }}
              >
                <div className="fit-container fx-centered box-pad-h-m box-pad-v-s fx-start-h">
                  <div
                    className="bg-img cover-bg sc-s"
                    style={{
                      backgroundImage: `url(${image})`,
                      minWidth: "100px",
                      minHeight: "100px",
                      backgroundColor: "var(--dim-gray)",
                    }}
                  ></div>
                  <div className=" box-pad-v box-pad-h">
                    <div className="fit-container fx-centered fx-start-v fx-col">
                      <h4 className="p-maj">{title}</h4>
                      <p className="p-three-lines p-medium">{description}</p>
                    </div>
                  </div>
                </div>
                <hr />
                <div
                  style={{
                    height: "100%",
                    overflow: "scroll",
                    overflowX: "hidden",
                  }}
                  className="posts-container fx-centered fx-start-v"
                >
                  {posts.length === 0 && (
                    <div
                      className="fit-container fx-centered fx-col"
                      style={{ height: "25vh", width: "min(100%,500px)" }}
                    >
                      <p className="gray-c italic-txt">
                        {t(arts ? "AuF5ZyB" : "AjjZpHF")}
                      </p>
                    </div>
                  )}
                  {posts.length > 0 && (
                    <div
                      className={`fx-centered fx-wrap fx-start-v box-pad-h box-pad-v fit-container`}
                    >
                      <p className="gray-c">
                        {t(arts ? "AesMg52" : "AStkKfQ")}
                      </p>
                      <DragDropContext onDragEnd={handleDragEnd}>
                        <Droppable droppableId="set-carrousel">
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              style={{
                                borderRadius: "var(--border-r-18)",
                                transition: ".2s ease-in-out",
                                backgroundColor: snapshot.isDraggingOver
                                  ? "var(--very-dim-gray)"
                                  : "",
                                height: "100%",
                                ...provided.droppableProps.style,
                              }}
                              className="box-pad-v-m fit-container fx-centered fx-start-h fx-start-v fx-col"
                            >
                              {posts.map((item, index) => {
                                return (
                                  <Draggable
                                    key={item.id}
                                    draggableId={`${item.id}`}
                                    index={index}
                                  >
                                    {(provided, snapshot) => (
                                      <div
                                        {...provided.draggableProps}
                                        {...provided.dragHandleProps}
                                        ref={provided.innerRef}
                                        style={{
                                          borderRadius: "var(--border-r-18)",
                                          boxShadow: snapshot.isDragging
                                            ? "14px 12px 105px -41px rgba(0, 0, 0, 0.55)"
                                            : "",
                                          ...provided.draggableProps.style,
                                        }}
                                        className="fit-container"
                                      >
                                        <div
                                          className="sc-s fx-scattered box-pad-v-s box-pad-h-s fit-container"
                                          style={{
                                            borderColor: snapshot.isDragging
                                              ? "var(--c1)"
                                              : "",
                                          }}
                                        >
                                          <div
                                            className="bg-img cover-bg"
                                            style={{
                                              minWidth: "50px",
                                              minHeight: "50px",
                                              backgroundImage: `url(${item.thumbnail})`,
                                              borderRadius:
                                                "var(--border-r-50)",
                                            }}
                                          ></div>
                                          <div
                                            className="fit-container fx-centered fx-start-h fx-start-v fx-col"
                                            style={{ rowGap: 0 }}
                                          >
                                            <p className="gray-c p-medium">
                                              <Date_
                                                toConvert={item.added_date}
                                              />
                                            </p>
                                            <p className="p-one-line">
                                              {item.title}
                                            </p>
                                          </div>
                                          <div
                                            className="box-pad-h-m"
                                            onClick={() =>
                                              handleAddArticle(item)
                                            }
                                          >
                                            <div className="trash"></div>
                                          </div>
                                        </div>
                                      </div>
                                    )}
                                  </Draggable>
                                );
                              })}
                              {provided.placeholder}
                            </div>
                          )}
                        </Droppable>
                      </DragDropContext>
                    </div>
                  )}
                </div>
              </div>
              <div className="fx-centered fit-container box-pad-v-m">
                <button className="btn btn-gst-red" onClick={exit}>
                  {t("AB4BSCe")}
                </button>
                <button
                  className="btn btn-normal fx-centered"
                  onClick={() => setInitScreen(true)}
                >
                  <div
                    className="arrow"
                    style={{ filter: "invert()", transform: "rotate(90deg)" }}
                  ></div>
                  {t(arts ? "AMrMfye" : "Aaq7HdF")}
                </button>
                <button className="btn btn-normal" onClick={() => saveUpdate()}>
                  {isLoading ? <LoadingDots /> : t("ACjCNlv")}
                </button>
              </div>
            </>
          )}
          {initScreen && (
            <>
              <div
                className="box-pad-h"
                style={{
                  width: "min(100%, 800px)",
                  height: "100%",
                  overflow: "hidden",
                  backgroundColor: "var(--white)",
                }}
                onClick={(e) => {
                  e.stopPropagation();
                }}
              >
                <div
                  className="fx-scattered fit-container"
                  style={{ paddingTop: "1rem" }}
                >
                  <div className="fit-container fx-centered fx-start-h">
                    <button
                      className={`btn btn-small fx-centered fx-shrink ${
                        contentFrom === "relays"
                          ? "btn-normal-gray"
                          : "btn-gst-nc"
                      }`}
                      onClick={() => switchContentSource("relays")}
                    >
                      {t("AR9ctVs")}
                    </button>
                    <button
                      className={`btn btn-small fx-centered fx-shrink ${
                        contentFrom === "user"
                          ? "btn-normal-gray"
                          : "btn-gst-nc"
                      }`}
                      onClick={() => switchContentSource("user")}
                    >
                      {t(arts ? "AB9K6IK" : "AEfGUaR")}
                    </button>
                    <button
                      className={`btn btn-small fx-centered fx-shrink ${
                        contentFrom === "search"
                          ? "btn-normal-gray"
                          : "btn-gst-nc"
                      }`}
                      onClick={() => switchContentSource("search")}
                    >
                      {t("AVv3kNf")}
                    </button>
                  </div>
                </div>
                {contentFrom !== "search" && (
                  <>
                    <div className="fit-container box-pad-v-s">
                      <input
                        type="search"
                        value={searchedPost}
                        className="if ifs-full"
                        placeholder={t("Apqlout", { count: NostrPosts.length })}
                        onChange={handleSearchPostInNOSTR}
                        style={{ backgroundColor: "var(--white)" }}
                      />
                    </div>
                    {searchedPost ? (
                      <>
                        {searchRes.length === 0 && (
                          <div className="fit-container box-marg-full fx-centered">
                            <p className="gray-c italic-txt">
                              {t(arts ? "AH90wGL" : "AQIAfYS")}
                            </p>
                          </div>
                        )}
                        {searchRes.length > 0 && (
                          <div
                            className={`fx-centered fx-start-h fx-col posts-cards ${
                              isLoading ? "flash" : ""
                            }`}
                            style={{
                              overflow: "scroll",
                              overflowX: "hidden",
                            }}
                          >
                            {searchRes.map((item) => {
                              let status = checkIfBelongs(item.id);
                              return (
                                <div
                                  key={item.id}
                                  className="fx-scattered sc-s fx-shrink fit-container box-pad-h-s box-pad-v-s pointer"
                                  onClick={() => handleAddArticle(item)}
                                  style={{
                                    borderColor: status
                                      ? "var(--green-main)"
                                      : "",
                                  }}
                                >
                                  <div
                                    className="bg-img cover-bg"
                                    style={{
                                      minWidth: "50px",
                                      minHeight: "50px",
                                      backgroundImage: `url(${item.thumbnail})`,
                                      borderRadius: "var(--border-r-50)",
                                    }}
                                  ></div>
                                  <div
                                    className="fit-container fx-centered fx-start-h fx-start-v fx-col"
                                    style={{ rowGap: 0 }}
                                  >
                                    <p className="gray-c p-medium">
                                      <Date_ toConvert={item.added_date} />
                                    </p>
                                    <p className="p-one-line fit-container">
                                      {item.title}
                                    </p>
                                  </div>
                                  {status ? (
                                    <div className="box-pad-h-m">
                                      <p className="green-c p-big">&#10003;</p>
                                    </div>
                                  ) : (
                                    <div className="box-pad-h-m">
                                      <p className="p-big">&#43;</p>
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </>
                    ) : (
                      <>
                        {NostrPosts.length > 0 && (
                          <div
                            className={`fx-centered fx-start-h fx-col ${
                              isLoading ? "flash" : ""
                            }`}
                            style={{
                              height: "87%",
                              overflow: "scroll",
                              overflowX: "hidden",
                              marginBottom: "1rem",
                            }}
                          >
                            {NostrPosts.map((item) => {
                              let status = checkIfBelongs(item.id);
                              return (
                                <div
                                  key={item.id}
                                  className="fx-scattered sc-s fx-shrink fit-container box-pad-h-s box-pad-v-s pointer"
                                  onClick={() => handleAddArticle(item)}
                                  style={{
                                    borderColor: status
                                      ? "var(--green-main)"
                                      : "",
                                  }}
                                >
                                  <div
                                    className="bg-img cover-bg"
                                    style={{
                                      minWidth: "50px",
                                      minHeight: "50px",
                                      backgroundImage: `url(${item.thumbnail})`,
                                      backgroundColor: "vaR(--dim-gray)",
                                      borderRadius: "var(--border-r-50)",
                                    }}
                                  ></div>
                                  <div
                                    className="fit-container fx-centered fx-start-h fx-start-v fx-col"
                                    style={{ rowGap: 0 }}
                                  >
                                    <p className="gray-c p-medium">
                                      <Date_ toConvert={item.added_date} />
                                    </p>
                                    <p className="p-one-line">{item.title}</p>
                                  </div>
                                  {status ? (
                                    <div className="box-pad-h-m">
                                      <p className="green-c p-big">&#10003;</p>
                                    </div>
                                  ) : (
                                    <div className="box-pad-h-m">
                                      <p className="p-big">&#43;</p>
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        )}
                        {isLoading && (
                          <div className="fx-centered fit-container">
                            <div className="gray-c">
                              {t("AKvHyxG")}
                              <LoadingDots />
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </>
                )}
                {contentFrom === "search" && (
                  <>
                    <div className="fit-container box-pad-v-s">
                      <input
                        type="search"
                        className="if ifs-full"
                        placeholder={t("AVv3kNf")}
                        onChange={handleSearchByNaddr}
                        style={{ backgroundColor: "var(--white)" }}
                      />
                    </div>
                    <div
                      className={`fit-container fx-centered fx-start-h fx-col ${
                        isLoading ? "flash" : ""
                      }`}
                      style={{
                        overflow: "scroll",
                        overflowX: "hidden",
                      }}
                    >
                      {searchedPostsByNaddr.map((item) => {
                        let status = checkIfBelongs(item.id);
                        return (
                          <div
                            key={item.id}
                            className="fx-scattered sc-s fx-shrink fit-container box-pad-h-s box-pad-v-s pointer"
                            onClick={() => handleAddArticle(item)}
                            style={{
                              borderColor: status ? "var(--green-main)" : "",
                            }}
                          >
                            <div
                              className="bg-img cover-bg"
                              style={{
                                minWidth: "50px",
                                minHeight: "50px",
                                backgroundImage: `url(${item.thumbnail})`,
                                borderRadius: "var(--border-r-50)",
                              }}
                            ></div>
                            <div
                              className="fit-container fx-centered fx-start-h fx-start-v fx-col"
                              style={{ rowGap: 0 }}
                            >
                              <p className="gray-c p-medium">
                                <Date_ toConvert={item.added_date} />
                              </p>
                              <p className="p-one-line fit-container">
                                {item.title}
                              </p>
                            </div>
                            {status ? (
                              <div className="box-pad-h-m">
                                <p className="green-c p-big">&#10003;</p>
                              </div>
                            ) : (
                              <div className="box-pad-h-m">
                                <p className="p-big">&#43;</p>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </>
                )}
              </div>
              <div className="fx-centered box-pad-v-m">
                <button className="btn btn-gst-red" onClick={exit}>
                  {t("AB4BSCe")}
                </button>
                {!isLoading && (
                  <button
                    className="btn btn-gst"
                    onClick={() => {
                      setLastEventTime(
                        NostrPosts[NostrPosts.length - 1].created_at
                      );
                      setIsLoading(true);
                    }}
                  >
                    {t("AxJRrkn")}
                  </button>
                )}
                <button
                  className="btn btn-normal fx-centered"
                  onClick={() => setInitScreen(false)}
                >
                  {t("AJ1uWra")}
                  <div
                    className="arrow"
                    style={{ filter: "invert()", rotate: "-90deg" }}
                  ></div>
                </button>
              </div>
            </>
          )}
        </div>
      </section>
    </>
  );
}
