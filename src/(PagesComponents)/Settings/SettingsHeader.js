import React from "react";
import { useTranslation } from "react-i18next";
import { nip19 } from "nostr-tools";
import Link from "next/link";
import UserProfilePic from "@/Components/UserProfilePic";

export function SettingsHeader({ userKeys }) {
  const { t } = useTranslation();
  return (
    <div
      className="fit-container fx-scattered pointer box-pad-v-m box-pad-h-m"
      style={{
        borderBottom: "1px solid var(--very-dim-gray)",
        borderTop: "1px solid var(--very-dim-gray)",
      }}
    >
      <UserProfilePic mainAccountUser={true} size={64} />
      <div className="fx-centered">
        <Link
          href={`/profile/${nip19.nprofileEncode({
            pubkey: userKeys.pub,
          })}`}
        >
          <button className="btn btn-normal">{t("ACgjh46")}</button>
        </Link>
        <Link href={"/settings/profile"}>
          <button className="btn btn-gray">{t("AfxwB6z")}</button>
        </Link>
      </div>
    </div>
  );
}

export default SettingsHeader;
