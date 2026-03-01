import React, { useState } from "react";
import UserProfilePic from "@/Components/UserProfilePic";
import { useSelector } from "react-redux";
import NumberShrink from "@/Components/NumberShrink";
import { convertDate } from "@/Helpers/Encryptions";
import { nip19 } from "nostr-tools";
import AddCuration from "@/Components/AddCuration";
import ToDeleteGeneral from "@/Components/ToDeleteGeneral";
import { useTranslation } from "react-i18next";
import ShowPeople from "@/Components/ShowPeople";
import UserFollowers from "@/Components/UserFollowers";
import Link from "next/link";
import ContentCard from "./ContentCard";

export default function HomeTab({
  data,
  setPostToNote,
  setSelectedTab,
  handleUpdate,
}) {
  const userMetadata = useSelector((state) => state.userMetadata);
  const userFollowings = useSelector((state) => state.userFollowings);
  const { t } = useTranslation();
  const [deleteEvent, setDeleteEvent] = useState(false);
  const [showCurationCreator, setShowCurationCreator] = useState(false);
  const [editEvent, setEditEvent] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(0);
  const [showPeople, setShowPeople] = useState(false);

  const handleEditItem = (event) => {
    if ([30004, 30005].includes(event.kind)) {
      setShowCurationCreator(true);
    }
    setEditEvent(event);
  };

  const handleUpdateEvent = () => {
    let timer = setTimeout(() => {
      setShowCurationCreator(false);
      setEditEvent(false);
      setDeleteEvent(false);
      handleUpdate();
      clearTimeout(timer);
    }, [1000]);
  };

  return (
    <>
      {deleteEvent && (
        <ToDeleteGeneral
          eventId={deleteEvent.id}
          title={deleteEvent.title}
          refresh={handleUpdateEvent}
          cancel={() => setDeleteEvent(false)}
          aTag={deleteEvent.aTag}
        />
      )}
      {showCurationCreator && (
        <AddCuration
          exit={handleUpdateEvent}
          curation={editEvent ? editEvent : null}
          tags={editEvent.tags}
          relaysToPublish={[]}
        />
      )}
      {showPeople === "followers" && (
        <UserFollowers
          id={userMetadata.pubkey}
          exit={() => setShowPeople(false)}
          expand={true}
        />
      )}
      {showPeople === "following" && (
        <ShowPeople
          exit={() => setShowPeople(false)}
          list={userFollowings}
          type={"following"}
        />
      )}
      <div className="fit-container box-pad-h">
        <div className="fit-container fx-scattered">
          {/* <h4>{t("AJDdA3h")}</h4> */}
          {/* <div style={{ width: "150px" }}>
          <WriteNew exit={() => null} />
        </div> */}
        </div>
        <div className="fit-container fx-centered fx-col box-pad-v">
          <div className="fit-container fx-centered fx-stretch fx-wrap">
            <div
              className="sc-s-18 box-pad-v fx"
              style={{ position: "relative", flex: "1 1 400px" }}
            >
              <div
                style={{
                  backgroundImage: `url(${userMetadata.banner})`,
                  position: "absolute",
                  left: 0,
                  top: 0,
                  zIndex: 0,
                  height: "40%",
                  width: "100%",
                }}
                className="bg-img cover-bg"
              ></div>
              <div
                className="box-pad-h fx fx-centered fx-start-h fx-end-v"
                style={{ position: "relative", zIndex: 1 }}
              >
                <div
                  style={{
                    border: "6px solid var(--c1-side)",
                    borderRadius: "22px",
                  }}
                >
                  <UserProfilePic mainAccountUser={true} size={150} />
                </div>
                <div className="box-pad-v-s fit-container fx-scattered fx-wrap">
                  <div className="fx-centered fx-col fx-start-v">
                    <h4>{userMetadata.display_name || userMetadata.name}</h4>
                    <p className="gray-c">
                      {t("AcqUGhB", {
                        date: convertDate(
                          new Date(data.userProfile.time_joined * 1000),
                        ),
                      })}{" "}
                      {/* <Date_
                      toConvert={new Date(data.userProfile.time_joined * 1000)}
                      /> */}
                    </p>
                  </div>
                  <Link href={`/yaki-points`}>
                    <button className="btn btn-small btn-normal fx-centered">
                      <div className="cup"></div> Yaki {t("A4IGG0z")}
                    </button>
                  </Link>
                </div>
              </div>
            </div>
            <div
              className="fx-centered fit-container fx-wrap"
              style={{ flex: "1 1 400px" }}
            >
              <div
                className="fx-centered fx-wrap"
                style={{ flex: "1 1 300px" }}
              >
                <div
                  className="sc-s-18 option pointer fx-centered fx-col fx-start-h fx-start-v box-pad-h box-pad-v fit-height"
                  style={{
                    backgroundColor: "transparent",
                    gap: "16px",
                    flex: "1 1 100px",
                  }}
                  onClick={() => setShowPeople("following")}
                >
                  <div
                    className="user-followed-24"
                    style={{ minWidth: "32px", minHeight: "32px" }}
                  ></div>
                  <div className="fx-centered fx-wrap fx-start-h">
                    <p className="p-big">
                      {data.userProfile?.follows_count || 0}
                    </p>
                    <p className="gray-c">{t("A9TqNxQ")}</p>
                  </div>
                </div>
                <div
                  className="sc-s-18 option pointer fx-centered fx-col fx-start-h fx-start-v box-pad-h box-pad-v fit-height"
                  style={{
                    backgroundColor: "transparent",
                    gap: "16px",
                    flex: "1 1 100px",
                  }}
                  onClick={() => setShowPeople("followers")}
                >
                  <div
                    className="user-followed-24"
                    style={{ minWidth: "32px", minHeight: "32px" }}
                  ></div>
                  <div className="fx-centered fx-wrap fx-start-h">
                    <p className="p-big">
                      {data.userProfile?.followers_count || 0}
                    </p>
                    <p className="gray-c">{t("A6huCnT")}</p>
                  </div>
                </div>
              </div>
              <div
                className="fx fx-centered fx-wrap"
                style={{ flex: "1 1 300px" }}
              >
                <Link
                  className="sc-s-18 option pointer fx-centered fx-col fx-start-v box-pad-h box-pad-v fit-height"
                  style={{
                    backgroundColor: "transparent",
                    gap: "16px",
                    flex: "1 1 100px",
                  }}
                  href={`/profile/${nip19.nprofileEncode({
                    pubkey: userMetadata.pubkey,
                  })}`}
                >
                  <div
                    className="note-24"
                    style={{ minWidth: "32px", minHeight: "32px" }}
                  ></div>
                  <div className="fx-centered fx-wrap fx-start-h">
                    <p className="p-big">{data.userProfile?.note_count || 0}</p>
                    <p className="gray-c">{t("AYIXG83")}</p>
                  </div>
                </Link>
                <Link
                  className="sc-s-18 option pointer fx-centered fx-col fx-start-v box-pad-h box-pad-v fit-height"
                  style={{
                    backgroundColor: "transparent",
                    gap: "16px",
                    flex: "1 1 100px",
                  }}
                  href={{
                    pathname: `/profile/${nip19.nprofileEncode({
                      pubkey: userMetadata.pubkey,
                    })}`,
                    query: { contentType: "replies" },
                  }}
                >
                  <div
                    className="comment-icon"
                    style={{ minWidth: "32px", minHeight: "32px" }}
                  ></div>
                  <div className="fx-centered fx-wrap fx-start-h">
                    <p className="p-big">
                      {data.userProfile?.reply_count || 0}
                    </p>
                    <p className="gray-c">{t("AENEcn9")}</p>
                  </div>
                </Link>
              </div>
            </div>
          </div>
          <div className="fit-container fx-centered fx-wrap">
            <div
              className="sc-s-18  fx-centered fx-col fx-start-h fx-start-v box-pad-h box-pad-v "
              style={{
                backgroundColor: "transparent",
                gap: "16px",
                flex: "1 1 200px",
              }}
            >
              <div
                className="bolt-24"
                style={{ minWidth: "32px", minHeight: "32px" }}
              ></div>
              <div className="fx-centered">
                <div>
                  <p className="p-big">
                    <NumberShrink
                      value={data.userProfile?.total_zap_count || 0}
                    />
                  </p>
                  <p className="gray-c">{t("AFk1EBA")}</p>
                </div>
                <p className="gray-c p-medium">&#8226; </p>
                <div>
                  <p className="p-big">
                    <NumberShrink
                      value={data.userProfile?.total_satszapped || 0}
                    />
                  </p>
                  <p className="gray-c">{t("AUb1YTL")}</p>
                </div>
              </div>
            </div>
            <div
              className="sc-s-18  fx-centered fx-col fx-start-h fx-start-v box-pad-h box-pad-v "
              style={{
                backgroundColor: "transparent",
                gap: "16px",
                flex: "1 1 200px",
              }}
            >
              <div
                className="bolt-24"
                style={{ minWidth: "32px", minHeight: "32px" }}
              ></div>
              <div className="fx-centered">
                <div>
                  <p className="p-big">
                    {
                      <NumberShrink
                        value={data.userProfile?.zaps_sent?.count || 0}
                      />
                    }
                  </p>
                  <p className="gray-c">{t("AmdnVra")}</p>
                </div>
                <p className="gray-c p-medium">&#8226; </p>
                <div>
                  <p className="p-big">
                    <NumberShrink
                      value={(data.userProfile?.zaps_sent?.msats || 0) / 1000}
                    />
                  </p>
                  <p className="gray-c">{t("AUb1YTL")}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div
          className="fit-container fx-even sticky box-pad-h"
          style={{
            top: "-1px",
            // padding: "1rem",
            paddingTop: 0,
            paddingBottom: 0,
            columnGap: 0,
            borderBottom: "1px solid var(--very-dim-gray)",
            borderTop: "1px solid var(--very-dim-gray)",
          }}
        >
          <div
            className={`list-item-b fx-centered fx ${
              selectedCategory === 0 ? "selected-list-item-b" : ""
            }`}
            onClick={() => setSelectedCategory(0)}
          >
            {t("At9t6yz")}
          </div>
          <div
            className={`list-item-b fx-centered fx ${
              selectedCategory === 1 ? "selected-list-item-b" : ""
            }`}
            onClick={() => setSelectedCategory(1)}
          >
            {t("Ayh5F4w")}
          </div>
          <div
            className={`list-item-b fx-centered fx ${
              selectedCategory === 2 ? "selected-list-item-b" : ""
            }`}
            onClick={() => setSelectedCategory(2)}
          >
            {t("AU2yMBa")}
          </div>
        </div>
        {selectedCategory === 0 && (
          <div>
            {data.latestPublished.length > 0 && (
              <div className="fit-container fx-centered fx-start-v fx-col box-pad-v-m">
                <div className="fit-container fx-centered fx-col fx-start-v">
                  {data.latestPublished.map((event) => {
                    return (
                      <ContentCard
                        key={event.id}
                        event={event}
                        setPostToNote={setPostToNote}
                      />
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
        {selectedCategory === 1 && (
          <div>
            {(data.localDraft || data.drafts.length > 0) && (
              <div className="fit-container fx-centered fx-start-v fx-col box-pad-v-m">
                <div className="fit-container fx-centered fx-col fx-start-v">
                  {data.localDraft && (
                    <>
                      <p className="c1-c">{t("A7noclE")}</p>
                      {data.localDraft.noteDraft && (
                        <ContentCard
                          event={data.localDraft.noteDraft}
                          setPostToNote={setPostToNote}
                        />
                      )}
                      {data.localDraft.artDraft && (
                        <ContentCard event={data.localDraft.artDraft} />
                      )}
                      {data.localDraft.smartWidgetDraft && (
                        <ContentCard event={data.localDraft.smartWidgetDraft} />
                      )}
                    </>
                  )}
                  {data.drafts.length > 0 && (
                    <>
                      <div className="fit-container fx-scattered">
                        <p>{t("AQG30hM")}</p>
                        {data.drafts.length > 4 && (
                          <p
                            className="btn-text-gray pointer"
                            onClick={() => {
                              setSelectedTab(1);
                            }}
                          >
                            {t("A4N51J3")}
                          </p>
                        )}
                      </div>
                      {data.drafts.slice(0, 4).map((event) => {
                        return <ContentCard key={event.id} event={event} />;
                      })}
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
        {selectedCategory === 2 && (
          <div>
            {data.popularNotes.length > 0 && (
              <div className="fit-container fx-centered fx-start-v fx-col box-pad-v-m">
                <div className="fit-container fx-centered fx-col">
                  {data.popularNotes.map((event) => {
                    return <ContentCard key={event.id} event={event} />;
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}
