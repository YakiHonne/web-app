import useCreatorSubscription from "@/Hooks/useCreatorSubscription";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import Icon from "./Icon";
import Overlay from "./Overlay";
import useUserProfile from "@/Hooks/useUsersProfile";
import UserProfilePic from "./UserProfilePic";
import Link from "next/link";
import HorizontalScrollWrapper from "./HorizontalScrollWrapper";

export default function SubscriptionButton({ pubkey }) {
  const { t } = useTranslation();
  const { isSubChekingLoading, providers } = useCreatorSubscription({ pubkey });
  const [showProviders, setShowProviders] = useState(false);
  if (isSubChekingLoading) return;
  if (providers.length === 0) return;
  return (
    <>
      {showProviders && (
        <Providers providers={providers} exit={() => setShowProviders(false)} />
      )}
      <button
        className="btn btn-normal btn-full fx-centered"
        onClick={() => setShowProviders(true)}
      >
        <Icon name={"crown"} />
        {t("AvD6FbL")}
      </button>
    </>
  );
}

const Providers = ({ providers, exit }) => {
  const { t } = useTranslation();
  return (
    <Overlay exit={exit} width={500}>
      <div className="fx-centered fx-col box-pad-h-m box-pad-v">
        <h4>{t("AYFLfRf")}</h4>
        <p className="gray-c p-centered">{t("Am6p1hr")}</p>
        <HorizontalScrollWrapper centerIfSmall={true}>
          {providers.map((provider) => (
            <ProviderCard key={provider.pubkey} provider={provider} />
          ))}
        </HorizontalScrollWrapper>
      </div>
    </Overlay>
  );
};

const ProviderCard = ({ provider }) => {
  const { t } = useTranslation();
  const { userProfile } = useUserProfile(provider.pubkey);
  return (
    <div className="bg-dropdown box-pad-h box-pad-v fx-centered fx-col">
      <UserProfilePic img={userProfile?.picture} size={80} />
      <p className="p-big">{userProfile.display_name}</p>
      {userProfile.about && (
        <p className="gray-c p-centered">{userProfile.about}</p>
      )}
      <Link href={provider.url} target="_blank">
        <button className="btn btn-normal fx-centered">
          {t("AaNDAmV")}
          <Icon name={"share-icon"} strokeWidth={2} />
        </button>
      </Link>
    </div>
  );
};
