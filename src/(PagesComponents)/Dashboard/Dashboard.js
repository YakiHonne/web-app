import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { getPopularNotes, getUserStats } from "@/Helpers/WSInstance";
import axios from "axios";
import { getSubData } from "@/Helpers/Controlers";
import { getParsedRepEvent, sortEvents } from "@/Helpers/Encryptions";
import { sleepTimer } from "@/Helpers/Helpers";
import { getArticleDraft, getNoteDraft } from "@/Helpers/ClientHelpers";
import PostAsNote from "@/Components/PostAsNote";
import LoadingLogo from "@/Components/LoadingLogo";
import { useRouter } from "next/router";
import SideMenu from "./SideMenu";
import Content from "./Content";
import Widgets from "./Widgets";
import Bookmarks from "./Bookmarks";
import Interests from "./Interests";
import HomeTab from "./HomeTab";
import Scheduled from "./Scheduled";

const getLocalDrafts = () => {
  try {
    const artDraft = getArticleDraft();
    const noteDraft = getNoteDraft("root");
    let smartWidgetDraft = localStorage?.getItem("swv2-cdraft");
    try {
      smartWidgetDraft = smartWidgetDraft
        ? JSON.parse(smartWidgetDraft)
        : false;
    } catch (err) {
      smartWidgetDraft = false;
    }

    let localDraft = {
      noteDraft: noteDraft
        ? { kind: 11, content: noteDraft, created_at: false }
        : false,
      // smartWidgetDraft: false,
      smartWidgetDraft: smartWidgetDraft
        ? {
            kind: 300331,
            content: smartWidgetDraft,
            created_at: smartWidgetDraft.created_at,
          }
        : false,
      artDraft: artDraft.default
        ? false
        : artDraft.title || artDraft.content
          ? {
              created_at: artDraft.created_at || Math.floor(Date.now() / 1000),
              kind: 30024,
              title: artDraft.title || "Untitled",
              content: artDraft.content || "Untitled",
              local: true,
            }
          : false,
    };
    return localDraft.artDraft ||
      localDraft.smartWidgetDraft ||
      localDraft.noteDraft
      ? localDraft
      : false;
  } catch (err) {
    return false;
  }
};

export default function Dashboard() {
  const { query } = useRouter();
  const userKeys = useSelector((state) => state.userKeys);
  const [selectedTab, setSelectedTab] = useState(
    query?.tabNumber ? parseInt(query.tabNumber) : 0,
  );
  const [userPreview, setUserPreview] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [postToNote, setPostToNote] = useState(query?.init ? "" : false);

  const getNostrBandStats = async (pubkey) => {
    try {
      let stats = await Promise.race([
        axios.get(`https://api.nostr.band/v0/stats/profile/${pubkey}`),
        sleepTimer(),
      ]);
      return stats;
    } catch (err) {
      return false;
    }
  };

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        let [userProfile, sats, popularNotes, userContent] = await Promise.all([
          Promise.race([getUserStats(userKeys.pub), sleepTimer(2000)]),
          getNostrBandStats(userKeys.pub),
          Promise.race([getPopularNotes(userKeys.pub), sleepTimer(2000)]),
          getSubData([
            {
              kinds: [30023, 30004, 30005, 34235, 21, 22, 20],
              limit: 5,
              authors: [userKeys.pub],
            },
            { kinds: [30024], limit: 5, authors: [userKeys.pub] },
          ]),
        ]);
        userProfile = userProfile
          ? JSON.parse(
              userProfile.find((event) => event.kind === 10000105).content,
            )
          : { time_joined: Math.floor(Date.now() / 1000) };

        let zaps_sent = sats
          ? sats.data.stats[userKeys.pub].zaps_sent
          : { count: 0, msats: 0 };
        let drafts = userContent.data
          .filter((event) => event.kind === 30024)
          .map((event) => getParsedRepEvent(event));
        let latestPublished = userContent.data
          .filter((event) => event.kind !== 30024)
          .map((event) => getParsedRepEvent(event));

        let localDraft = getLocalDrafts();
        setUserPreview({
          userProfile: {
            ...userProfile,
            zaps_sent,
          },
          popularNotes: popularNotes
            ? sortEvents(popularNotes.filter((_) => _.kind === 1))
            : [],
          drafts: sortEvents(drafts),
          latestPublished: sortEvents(latestPublished),
          localDraft,
        });

        setIsLoading(false);
      } catch (err) {
        console.log(err);
      }
    };
    if (userKeys) fetchHomeData();
  }, [userKeys]);

  const handleUpdate = async () => {
    let userContent = await getSubData([
      {
        kinds: [30023, 30004, 30005, 34235, 21, 22, 20],
        limit: 5,
        authors: [userKeys.pub],
      },
      { kinds: [30024], limit: 5, authors: [userKeys.pub] },
    ]);
    let latestPublished = userContent.data
      .filter((event) => event.kind !== 30024)
      .map((event) => getParsedRepEvent(event));

    setUserPreview((prev) => {
      return { ...prev, latestPublished: sortEvents(latestPublished) };
    });
  };
  return (
    <>
      {postToNote !== false && (
        <PostAsNote
          exit={() => setPostToNote(false)}
          content={typeof postToNote === "string" ? postToNote : ""}
          linkedEvent={typeof postToNote !== "string" ? postToNote : ""}
        />
      )}
      <div>
        <div
          className="fx-centered fit-container fx-start-h fx-start-v"
          style={{ gap: 0 }}
        >
          <div className="dahsboard-section fit-container">
            <div
              className="fit-height fit-container feed-container"
              style={{ overflow: "scroll" }}
            >
              <SideMenu
                selectedTab={selectedTab}
                setSelectedTab={setSelectedTab}
              />
              <div className="fit-container">
                {selectedTab === 0 && isLoading && (
                  <div
                    className="fit-container fx-centered"
                    style={{ height: "100vh" }}
                  >
                    <div className="fx-centered">
                      <LoadingLogo />
                    </div>
                  </div>
                )}

                {selectedTab === 0 && userPreview && !isLoading && (
                  <HomeTab
                    data={userPreview}
                    setPostToNote={setPostToNote}
                    setSelectedTab={setSelectedTab}
                    handleUpdate={handleUpdate}
                  />
                )}
                {selectedTab === 1 && (
                  <Content
                    filter={"notes"}
                    localDraft={userPreview.localDraft}
                    init={postToNote || false}
                    setPostToNote={setPostToNote}
                  />
                )}
                {selectedTab === 2 && (
                  <Content
                    filter={query?.filter || "articles"}
                    localDraft={userPreview.localDraft}
                    init={postToNote || false}
                    setPostToNote={setPostToNote}
                  />
                )}
                {selectedTab === 3 && (
                  <Content
                    filter={"curations"}
                    localDraft={userPreview.localDraft}
                    init={postToNote || false}
                    setPostToNote={setPostToNote}
                  />
                )}
                {selectedTab === 4 && (
                  <Content
                    filter={"videos"}
                    localDraft={userPreview.localDraft}
                    init={postToNote || false}
                    setPostToNote={setPostToNote}
                  />
                )}
                {selectedTab === 5 && (
                  <Content
                    filter={"pictures"}
                    localDraft={userPreview.localDraft}
                    init={postToNote || false}
                    setPostToNote={setPostToNote}
                  />
                )}
                {selectedTab === 6 && (
                  <Widgets
                    setPostToNote={setPostToNote}
                    localDraft={userPreview.localDraft}
                  />
                )}
                {selectedTab === 7 && <Bookmarks />}
                {selectedTab === 8 && <Interests />}
                {selectedTab === 9 && <Scheduled />}
                <div style={{ marginBottom: "100px" }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
