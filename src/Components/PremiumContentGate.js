import React from "react";
import { useTranslation } from "react-i18next";
import { useRouter } from "next/router";
import { nip19 } from "nostr-tools";
import Icon from "@/Components/Icon";
import UserProfilePic from "@/Components/UserProfilePic";
import useUserProfile from "@/Hooks/useUsersProfile";
import Badge from "@/Helpers/Badge";
import { minimizeKey } from "@/Helpers/Encryptions";

export default function PremiumContentGate({ pubkey }) {
  const { t } = useTranslation();
  const router = useRouter();
  const { userProfile, isNip05Verified, proUser } = useUserProfile(pubkey);

  const goToProfile = () => {
    try {
      router.push(`/profile/${nip19.nprofileEncode({ pubkey })}`);
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div
      className="fit-container fx-centered fx-col box-pad-h box-pad-v"
      style={{ minHeight: "60vh", rowGap: "12px" }}
    >
      <div className="premium-glass-tag premium-glass-tag-lg">
        <Icon name="crown" size={16} isColored />
        {t("AW299l2")}
      </div>
      <p className="gray-c p-centered box-pad-h">{t("AIPE1iI")}</p>
      <UserProfilePic
        img={userProfile?.picture}
        user_id={pubkey}
        size={80}
        allowClick={false}
      />
      <div className="fx-centered" style={{ gap: "3px" }}>
        <p className="p-big p-bold">
          {userProfile?.display_name ||
            userProfile?.name ||
            minimizeKey(pubkey || "")}
        </p>
        {isNip05Verified && <Icon name="checkmark-c1" isColored />}
        {proUser?.isProUser && <Badge data={proUser} size={18} />}
      </div>
      <button className="btn btn-normal fx-centered" onClick={goToProfile}>
        {t("AsoXDr9")}
      </button>
    </div>
  );
}
