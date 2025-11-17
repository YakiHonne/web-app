import React, { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import useUserProfile from "@/Hooks/useUsersProfile";
import useIsMute from "@/Hooks/useIsMute";
import UserProfilePic from "@/Components/UserProfilePic";
import { getSubData } from "@/Helpers/Controlers";
import LoadingDots from "@/Components/LoadingDots";
import { getNoteTree } from "@/Helpers/ClientHelpers";
import Date_ from "@/Components/Date_";

export function MutedList({ exit }) {
  const { t } = useTranslation();
  const { userMutedList, allTags } = useSelector(
    (state) => state.userMutedList
  );
  const [contentType, setContentType] = useState("p");
  const [notes, setNotes] = useState(false);
  const [isNotesLoading, setIsNotesLoading] = useState(false);

  const mutedList = useMemo(() => {
    return allTags.filter((_) => _[0] === contentType).map((_) => _[1]);
  }, [contentType, allTags]);

  useEffect(() => {
    const fetchNotes = async () => {
      setIsNotesLoading(true);
      const data = await getSubData([{ kinds: [1], ids: mutedList }]);
      setIsNotesLoading(false);
      setNotes(
        new Map(
          data.data.map((_) => {
            return [_.id, _.rawEvent()];
          })
        )
      );
    };
    if (contentType === "e" && mutedList.length > 0 && !notes) {
      fetchNotes();
    }
  }, [contentType, mutedList]);

  if (!Array.isArray(userMutedList)) return;
  return (
    <div
      className="fixed-container box-pad-h fx-centered"
      onClick={(e) => {
        e.stopPropagation();
        exit();
      }}
    >
      <div
        className="box-pad-h box-pad-v sc-s bg-sp slide-up"
        style={{ width: "min(100%, 500px)", position: "relative" }}
        onClick={(e) => {
          e.stopPropagation();
        }}
      >
        <div className="close" onClick={exit}>
          <div></div>
        </div>
        {userMutedList.length > 0 && (
          <h4 className="p-centered">{t("AX2OYcg")}</h4>
        )}
        {userMutedList.length > 0 && (
          <>
            <div className="fit-container fx-scattered box-marg-s">
              <div
                className={`list-item-b fx-centered fx ${
                  contentType === "p" ? "selected-list-item-b" : ""
                }`}
                onClick={() => setContentType("p")}
              >
                {t("AJ1Zfct")}
              </div>
              <div
                className={`list-item-b fx-centered fx ${
                  contentType === "e" ? "selected-list-item-b" : ""
                }`}
                onClick={() => setContentType("e")}
              >
                {t("AYIXG83")}
              </div>
            </div>
            <div
              className="fit-container fx-centered fx-start-v fx-start-h fx-wrap"
              style={{ maxHeight: "60vh", overflow: "scroll" }}
            >
              {mutedList.map((content) => {
                if (contentType === "p") {
                  return <MutedUser pubkey={content} key={content} />;
                }
                return (
                  <MutedNote
                    event={notes ? notes.get(content) : false}
                    key={content}
                  />
                );
              })}
              {isNotesLoading && (
                <div
                  className="fx-centered fx-col fit-container"
                  style={{ height: "20vh" }}
                >
                  <LoadingDots />
                </div>
              )}
              {(mutedList.length === 0 ||
                (!isNotesLoading && notes && notes.size === 0)) && (
                <div
                  className="fx-centered fx-col fit-container"
                  style={{ height: "20vh" }}
                >
                  <p>{t("ACzeK4g")}</p>
                  <p className="gray-c p-medium p-centered">{t("Ap5S8lY")}</p>
                </div>
              )}
            </div>
          </>
        )}
        {userMutedList.length === 0 && (
          <div
            className="fx-centered fx-col fit-container"
            style={{ height: "20vh" }}
          >
            <div className="user-24"></div>
            <p>{t("ACzeK4g")}</p>
            <p className="gray-c p-medium p-centered">{t("Ap5S8lY")}</p>
          </div>
        )}
      </div>
    </div>
  );
}

const MutedUser = ({ pubkey }) => {
  const { userProfile, isNip05Verified } = useUserProfile(pubkey);
  const { muteUnmute } = useIsMute(pubkey);
  const { t } = useTranslation();

  return (
    <div
      className=" fx-centered fx-col box-pad-v box-pad-h sc-s-18 bg-sp"
      style={{ flex: "1 1 200px" }}
    >
      <UserProfilePic img={userProfile.picture} size={40} user_id={pubkey} />
      <div className="fx-centered" style={{ gap: "3px" }}>
        <p className="p-centered p-one-line">
          {userProfile.display_name || userProfile.name}
        </p>
        {isNip05Verified && <div className="checkmark-c1"></div>}
      </div>
      <p className="gray-c p-medium p-centered p-one-line">
        {userProfile.name || userProfile.display_name}
      </p>
      <button
        onClick={muteUnmute}
        className="btn btn-normal btn-small btn-gst-red fx-centered"
      >
        <div className="unmute"></div>
        {t("AKELUbQ")}
      </button>
    </div>
  );
};

const MutedNote = ({ event }) => {
  const { userProfile, isNip05Verified } = useUserProfile(event?.pubkey);
  const { muteUnmute } = useIsMute(event?.id, "e");
  const { t } = useTranslation();

  if (!event) return;
  return (
    <div className="fit-container fx-scattered fx-start-h fx-start-v box-pad-v box-pad-h sc-s-18 bg-sp">
      <UserProfilePic
        img={userProfile.picture}
        size={40}
        user_id={event.pubkey}
      />
      <div className="fit-container">
        <div className="fx-scattered fit-container">
          <div className="fx-centered" style={{ gap: "3px" }}>
            <div className="fx-centered" style={{ gap: "3px" }}>
              <p className="p-bold p-one-line" style={{ margin: 0 }}>
                {userProfile.display_name || userProfile.name}
              </p>
              {isNip05Verified && <div className="checkmark-c1"></div>}
            </div>
            <p className="gray-c p-medium" style={{ margin: 0 }}>
              &#8226;
            </p>
            <p className="gray-c p-medium" style={{ margin: 0 }}>
              <Date_
                toConvert={new Date(event.created_at * 1000)}
                time={true}
              />
            </p>
          </div>
        </div>
        <div className="box-marg-s">
          <p>{getNoteTree(event.content, true)}</p>
        </div>
        <button
          onClick={muteUnmute}
          className="btn btn-normal btn-small btn-full btn-gst-red fx-centered"
        >
          <div className="unmute"></div>
          {t("AnddeNp")}
        </button>
      </div>
    </div>
  );
};

export default MutedList;
