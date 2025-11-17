import React, { useEffect, useState } from "react";
import { getEmptyuserMetadata } from "@/Helpers/Encryptions";
import UserProfilePic from "@/Components/UserProfilePic";
import KindOne from "@/Components/KindOne";
import { useSelector } from "react-redux";
import { getUser } from "@/Helpers/Controlers";
import ShowUsersList from "@/Components/ShowUsersList";
import { useTranslation } from "react-i18next";
import useIsMute from "@/Hooks/useIsMute";

export default function KindSix({ event }) {
  const { t } = useTranslation();
  const nostrAuthors = useSelector((state) => state.nostrAuthors);
  const [user, setUser] = useState(getEmptyuserMetadata(event.pubkey));
  const [reposts, setResposts] = useState([]);
  const [showReposts, setShowReposts] = useState(false);
  const { isMuted: isMutedId } = useIsMute(event.relatedEvent?.id, "e");
  const { isMuted: isMutedComment } = useIsMute(
    event.relatedEvent?.isComment,
    "e"
  );
  const { isMuted: isMutedRoot } = useIsMute(
    event.relatedEvent.rootData ? event.relatedEvent.rootData[1] : false,
    "e"
  );
  useEffect(() => {
    let auth = getUser(event.pubkey);
    if (auth) {
      setUser(auth);
    }
  }, [nostrAuthors]);

  if (isMutedId || isMutedComment || isMutedRoot) return null;

  return (
    <>
      {showReposts && (
        <ShowUsersList
          exit={() => setShowReposts(false)}
          title={t("Aai65RJ")}
          list={reposts.map((item) => item.pubkey)}
          extras={[]}
        />
      )}
      <div
        className="fx-centered fx-col fx-start-v fit-container"
        style={{
          rowGap: "0px",
          overflow: "visible",
        }}
      >
        <div
          className="fx-centered fx-start-h sc-s-18 box-pad-h-s  round-icon-tooltip pointer"
          style={{
            overflow: "visible",
            marginLeft: "1rem",
            marginTop: "1rem",
            backgroundColor: "transparent",
            height: "32px",
          }}
          data-tooltip={
            reposts.length > 1
              ? `${reposts.length} people reposted this`
              : `${user.display_name} reposted this on ${new Date(
                  event.created_at * 1000
                ).toLocaleDateString()}, ${new Date(
                  event.created_at * 1000
                ).toLocaleTimeString()}`
          }
          onClick={() => (reposts.length > 1 ? setShowReposts(true) : null)}
        >
          <div className="switch-arrows"></div>
          <UserProfilePic
            size={18}
            mainAccountUser={false}
            user_id={user.pubkey}
            img={user.picture}
          />
          <div className="fx-centered">
            <p className="p-bold">{user.display_name || user.name}</p>
            {reposts.length > 1 && (
              <p className="gray-c">& {reposts.length - 1} others</p>
            )}
          </div>
        </div>
        <KindOne
          event={event.relatedEvent}
          border={true}
          getReposts={setResposts}
        />
      </div>
    </>
  );
}
