import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getSubData, getUser } from "@/Helpers/Controlers";
import { useTranslation } from "react-i18next";
import { NDKUser } from "@nostr-dev-kit/ndk";
import { ndkInstance } from "@/Helpers/NDKInstance";
import { setToast } from "@/Store/Slides/Publishers";
import UserProfilePic from "@/Components/UserProfilePic";
import OptionsDropdown from "@/Components/OptionsDropdown";
import { compactContent, nEventEncode } from "@/Helpers/Helpers";
import Slider from "@/Components/Slider";
import Link from "next/link";
import { getEmptyuserMetadata } from "@/Helpers/Encryptions";

export default function NotesFromPeopleYouFollow() {
    const { t } = useTranslation();
  const userFollowings = useSelector((state) => state.userFollowings);
  const [notes, setNotes] = useState([]);
  useEffect(() => {
    const fetchData = async () => {
      let pubkeys = Array.from(userFollowings);
      pubkeys = pubkeys.sort(() => 0.5 - Math.random()).slice(0, 10);
      let data = await getSubData([{ kinds: [1], authors: pubkeys, limit: 5 }]);
      setNotes(data.data.slice(0, 10));
    };
    if (notes.length > 0 || userFollowings.length === 0) return;
    fetchData();
  }, [userFollowings]);
  if (userFollowings.length === 0) return;
  return (
    <div
      className="fit-container"
      style={{
        paddingBottom: "1rem",
        borderBottom: "1px solid var(--very-dim-gray)",
      }}
    >
      <div className="fit-container fx-scattered box-pad-v-m">
        <h4 className=" box-pad-h-m">
          { t("An8c8QZ")}
        </h4>
      </div>
      <Slider
        gap={10}
        items={[
          ...notes.map((note) => {
            return <NoteCard event={note} />;
          }),
        ]}
        slideBy={200}
      />
    </div>
  );
}

const NoteCard = ({ event }) => {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const nostrAuthors = useSelector((state) => state.nostrAuthors);
  const [user, setUser] = useState(getEmptyuserMetadata(event.pubkey));
  const [isNip05Verified, setIsNip05Verified] = useState(false);

  useEffect(() => {
    const fetchAuthor = async () => {
      let auth = await getUser(event.pubkey);
      if (auth) {
        setUser(auth);
        let ndkUser = new NDKUser({ pubkey: event.pubkey });
        ndkUser.ndk = ndkInstance;
        let checknip05 = auth.nip05
          ? await ndkUser.validateNip05(auth.nip05)
          : false;

        if (checknip05) setIsNip05Verified(true);
      }
    };
    fetchAuthor();
  }, [nostrAuthors]);

  const copyID = (e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(nEventEncode(event.id));
    dispatch(
      setToast({
        type: 1,
        desc: `${t("ARJICtS")} 👏`,
      })
    );
  };

  return (
    <div
      className="sc-s-18 box-pad-h-m box-pad-v-m fx-centered fx-start-v fx-start-h fx-col fit-height"
      style={{ width: "300px", overflow: "visible" }}
    >
      <div className="fit-container fx-scattered">
        <div className="fx-centered" style={{ gap: "3px" }}>
          <UserProfilePic
            size={24}
            mainAccountUser={false}
            user_id={user.pubkey}
            img={user.picture}
            metadata={user}
          />
          <div className="fx-centered" style={{ gap: "3px" }}>
            <p className="p-bold p-one-line" style={{ width: "max-content" }}>
              {user.display_name || user.name}
            </p>
            {isNip05Verified && <div className="checkmark-c1"></div>}
          </div>
        </div>
        <OptionsDropdown
          vertical={false}
          options={[
            <div onClick={copyID} className="pointer">
              <p>{t("AYFAFKs")}</p>
            </div>,
          ]}
        />
      </div>
      <Link href={`/notes/${nEventEncode(event.id)}`}>
        <p className="p-three-lines">{compactContent(event.content, event.pubkey)}</p>
      </Link>
    </div>
  );
};
