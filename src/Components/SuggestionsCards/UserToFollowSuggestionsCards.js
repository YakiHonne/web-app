import React, { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import UserProfilePic from "@/Components/UserProfilePic";
import Follow from "@/Components/Follow";
import OptionsDropdown from "@/Components/OptionsDropdown";
import Slider from "@/Components/Slider";
import { NDKUser } from "@nostr-dev-kit/ndk";
import { ndkInstance } from "@/Helpers/NDKInstance";
import { useTranslation } from "react-i18next";

const getUsersCard = (users, userFollowings) => {
  if (users.length === 0) return [];
  let tempUsers = users.filter((_) => !userFollowings.includes(_.pubkey));
  if (tempUsers.length === 0) return [];
  return tempUsers.map((user) => {
    return <UserCard user={user} key={user.pubkey} />;
  });
};

export default function UserToFollowSuggestionsCards() {
  const { t } = useTranslation();
  const userFollowings = useSelector((state) => state.userFollowings);
  const userKeys = useSelector((state) => state.userKeys);
  const trendingUsers = useSelector((state) => state.trendingUsers);
  const [hide, setHide] = useState(localStorage.getItem("hsuggest1"));
  const users = useMemo(() => {
    return getUsersCard(trendingUsers, userFollowings);
  }, [trendingUsers, userFollowings]);

  const handleHideSuggestion = () => {
    localStorage.setItem("hsuggest1", `${Date.now()}`);
    setHide(true);
  };

  if (hide) return;
  if (users.length === 0) return;
  return (
    <div
      className="fit-container"
      style={{
        paddingBottom: "1rem",
        borderBottom: "1px solid var(--very-dim-gray)",
      }}
    >
      <div className="fit-container fx-scattered box-pad-v-m">
        <h4 className="box-pad-h-m">{t("AIus9gb")}</h4>
        {userKeys && (
          <OptionsDropdown
            options={[
              <p className="gray-c" onClick={handleHideSuggestion}>
                {t("A2qCLTm")}
              </p>,
            ]}
            vertical={false}
            tooltip={false}
          />
        )}
      </div>
      <Slider gap={10} items={users} slideBy={200} />
    </div>
  );
}

const UserCard = ({ user }) => {
  const [isNip05Verified, setIsNip05Verified] = useState(false);
  useEffect(() => {
    const fetchData = async () => {
      try {
        let ndkUser = new NDKUser({ pubkey: user.pubkey });
        ndkUser.ndk = ndkInstance;
        let checknip05 = user.nip05
          ? await ndkUser.validateNip05(user.nip05)
          : false;

        if (checknip05) setIsNip05Verified(true);
      } catch (err) {
        console.log(err);
      }
    };
    fetchData();
  }, []);
  return (
    <div
      className="sc-s-18 box-pad-h-m box-pad-v-m fx-scattered fx-col fit-height"
      style={{ minWidth: "176px", maxWidth: "176px" }}
      key={user.pubkey}
    >
      <div className="fx-centered fx-col">
        <UserProfilePic
          mainAccountUser={false}
          img={user.picture}
          size={84}
          user_id={user.pubkey}
        />
        <div className="fx-centered fx-col" style={{ gap: 0 }}>
          <div className="fx-centered" style={{ gap: "3px" }}>
            <p className="p-bold p-one-line">
              {user.display_name || user.name}
            </p>
            {isNip05Verified && <span className="checkmark-c1"></span>}
          </div>
          <p className="gray-c p-medium p-two-lines p-centered">
            {user.about || "N/A"}
          </p>
        </div>
      </div>
      <Follow
        toFollowKey={user.pubkey}
        toFollowName={user.display_name || user.name}
        size="small"
        full={true}
        icon={false}
      />
    </div>
  );
};
