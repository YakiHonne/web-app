import useCreatorSubscription from "@/Hooks/useCreatorSubscription";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import Icon from "./Icon";
import Overlay from "./Overlay";
import useUserProfile from "@/Hooks/useUsersProfile";
import UserProfilePic from "./UserProfilePic";
import Link from "next/link";
import HorizontalScrollWrapper from "./HorizontalScrollWrapper";

export default function SubscriptionButton({ pubkey }) {
  const { t } = useTranslation();
  const userKeys = useSelector((state) => state.userKeys);
  const { isSubChekingLoading, providers } = useCreatorSubscription({ pubkey });
  const [showProviders, setShowProviders] = useState(false);
  const [showSelfSubWarning, setShowSelfSubWarning] = useState(false);
  const isSelf = userKeys?.pub === pubkey;
  if (isSubChekingLoading) return;
  if (providers.length === 0) return;
  return (
    <>
      {showProviders && (
        <Providers providers={providers} exit={() => setShowProviders(false)} />
      )}
      {showSelfSubWarning && (
        <SelfSubscriptionWarning exit={() => setShowSelfSubWarning(false)} />
      )}
      <button
        className="btn btn-normal btn-full fx-centered"
        onClick={() =>
          isSelf ? setShowSelfSubWarning(true) : setShowProviders(true)
        }
      >
        <Icon name={"crown"} size={22} strokeWidth={2.5} />
        {t("AvD6FbL")}
      </button>
    </>
  );
}

const SelfSubscriptionWarning = ({ exit }) => {
  const { t } = useTranslation();
  return (
    <Overlay exit={exit} width={450}>
      <section className="fx-centered fx-col box-pad-h box-pad-v">
        <div
          className="fx-centered box-marg-s"
          style={{
            minWidth: "54px",
            minHeight: "54px",
            borderRadius: "var(--border-r-50)",
            backgroundColor: "var(--c1)",
          }}
        >
          <Icon name={"crown"} />
        </div>
        <h4 className="p-centered">{t("AFtyh1A")}</h4>
        <p className="p-centered gray-c box-pad-v-m">{t("Az7PJTe")}</p>
        <button className="btn btn-normal btn-full" onClick={exit}>
          {t("AvtdLIG")}
        </button>
      </section>
    </Overlay>
  );
};

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
