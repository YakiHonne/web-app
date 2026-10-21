import React, { useEffect, useState } from "react";
import { getEmptyuserMetadata } from "@/Helpers/Encryptions";
import UserProfilePic from "@/Components/UserProfilePic";
import KindOne from "@/Components/KindOne";
import { useSelector } from "react-redux";
import ShowUsersList from "@/Components/ShowUsersList";
import { useTranslation } from "react-i18next";
import useIsMute from "@/Hooks/useIsMute";
import Icon from "@/Components/Icon";
import RepEventPreviewCard from "@/Components/RepEventPreviewCard";
import LinkRepEventPreview from "@/Components/LinkRepEventPreview";
import { getSubData, getUser } from "@/Helpers/Controlers";
import { getParsedRepostedEvent } from "@/Helpers/ClientHelpers";
import { getEventFromCache, setEventFromCache } from "@/Helpers/utils/eventsCache";

const NOTE_KINDS = [1, 1111, 9802];
const REP_EVENT_KINDS = [30023, 30004, 30005, 34235];

export default function KindSix({ event }) {
  const { t } = useTranslation();
  const nostrAuthors = useSelector((state) => state.nostrAuthors);
  const [user, setUser] = useState(getEmptyuserMetadata(event.pubkey));
  const [reposts, setResposts] = useState([]);
  const [showReposts, setShowReposts] = useState(false);
  const [relatedEvent, setRelatedEvent] = useState(() => {
    if (event.relatedEvent) return event.relatedEvent;
    const cached = event.repostedATag ? getEventFromCache(event.repostedATag) : null;
    return cached ? getParsedRepostedEvent(cached) : false;
  });
  const { isMuted: isMutedId } = useIsMute(relatedEvent?.id, "e");
  const { isMuted: isMutedComment } = useIsMute(
    relatedEvent?.isComment,
    "e"
  );
  const { isMuted: isMutedRoot } = useIsMute(
    relatedEvent?.rootData ? relatedEvent.rootData[1] : false,
    "e"
  );

  useEffect(() => {
    if (relatedEvent || !event.repostedATag) return;
    const [kind, pubkey, ...identifier] = event.repostedATag.split(":");
    if (!kind || !pubkey) return;
    let cancelled = false;
    const fetchRepostedEvent = async () => {
      try {
        const res = await getSubData(
          [{ kinds: [parseInt(kind)], authors: [pubkey], "#d": [identifier.join(":")] }],
          2500
        );
        const found = res.data[0];
        if (!found || cancelled) return;
        const raw = (found.rawEvent && found.rawEvent()) || found;
        setEventFromCache(event.repostedATag, raw);
        const parsed = getParsedRepostedEvent(raw);
        if (parsed) setRelatedEvent(parsed);
      } catch (err) {
        console.log(err);
      }
    };
    fetchRepostedEvent();
    return () => {
      cancelled = true;
    };
  }, [event.repostedATag]);
  useEffect(() => {
    let auth = getUser(event.pubkey);
    if (auth) {
      setUser(auth);
    }
  }, [nostrAuthors]);

  if (isMutedId || isMutedComment || isMutedRoot || !relatedEvent) return null;

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
          className="fx-centered fx-start-h bg-dropdown box-pad-h-s  round-icon-tooltip pointer"
          style={{
            overflow: "visible",
            // marginLeft: "1rem",
            marginTop: "1rem",
            marginBottom: ".5rem",
            // backgroundColor: "transparent",
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
          <Icon name="arrow_reload_02" v={2} />
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
        {NOTE_KINDS.includes(relatedEvent.kind) && (
          <KindOne
            event={relatedEvent}
            border={true}
            getReposts={setResposts}
          />
        )}
        {REP_EVENT_KINDS.includes(relatedEvent.kind) && (
          <RepEventPreviewCard item={relatedEvent} />
        )}
        {!NOTE_KINDS.includes(relatedEvent.kind) &&
          !REP_EVENT_KINDS.includes(relatedEvent.kind) && (
            <div className="fit-container box-pad-v-s">
              <LinkRepEventPreview event={relatedEvent} />
            </div>
          )}
      </div>
    </>
  );
}
