import useCreatorSubscription from "@/Hooks/useCreatorSubscription";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import Icon from "./Icon";
import Overlay from "./Overlay";
import useUserProfile from "@/Hooks/useUsersProfile";
import UserProfilePic from "./UserProfilePic";
import { useRouter } from "next/router";
import HorizontalScrollWrapper from "./HorizontalScrollWrapper";
import { useIsSubscribedToCreator } from "@/Hooks/useSubscriberSubscriptions";

export default function SubscriptionButton({ pubkey }) {
  const { t } = useTranslation();
  const router = useRouter();
  const userKeys = useSelector((state) => state.userKeys);
  const { isSubChekingLoading, providers } = useCreatorSubscription({ pubkey });
  const isSubscribed = useIsSubscribedToCreator(pubkey);
  const [showProviders, setShowProviders] = useState(false);
  const [showSelfSubWarning, setShowSelfSubWarning] = useState(false);
  const isSelf = userKeys?.pub === pubkey;
  if (isSubChekingLoading) return;
  if (providers.length === 0) return;

  const handleClick = () => {
    if (isSubscribed) {
      router.push("/creators-subscriptions");
      return;
    }
    if (isSelf) setShowSelfSubWarning(true);
    else setShowProviders(true);
  };

  return (
    <>
      {showProviders && (
        <Providers providers={providers} exit={() => setShowProviders(false)} />
      )}
      {showSelfSubWarning && (
        <SelfSubscriptionWarning exit={() => setShowSelfSubWarning(false)} />
      )}
      <button
        className={`btn btn-full fx-centered ${isSubscribed ? "btn-green" : "btn-normal"}`}
        onClick={handleClick}
      >
        {isSubscribed ? (
          <Icon name={"check"} size={20} strokeWidth={3.5} />
        ) : (
          <Icon name={"crown"} size={22} strokeWidth={2.5} />
        )}
        {isSubscribed ? t("AwhPdGu") : t("AvD6FbL")}
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

const isYakihonneGateway = (provider) => {
  if (provider.pubkey === process.env.NEXT_PUBLIC_GATEWAY_PUBKEY) return true;
  try {
    return (
      new URL(provider.url, window.location.origin).origin ===
      window.location.origin
    );
  } catch (err) {
    return false;
  }
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
            <ProviderCard
              key={provider.pubkey}
              provider={provider}
              exit={exit}
            />
          ))}
        </HorizontalScrollWrapper>
      </div>
    </Overlay>
  );
};

const ProviderCard = ({ provider, exit }) => {
  const { t } = useTranslation();
  const router = useRouter();
  const { userProfile } = useUserProfile(provider.pubkey);

  const handleSubscribe = () => {
    if (isYakihonneGateway(provider)) {
      exit();
      try {
        const url = new URL(provider.url, window.location.origin);
        router.push(`${url.pathname}${url.search}${url.hash}`);
      } catch (err) {
        window.location.href = provider.url;
      }
      return;
    }
    window.open(provider.url, "_blank", "noopener,noreferrer");
    exit();
  };

  return (
    <div className="bg-dropdown box-pad-h box-pad-v fx-centered fx-col">
      <UserProfilePic img={userProfile?.picture} size={80} />
      <p className="p-big">{userProfile.display_name}</p>
      {userProfile.about && (
        <p className="gray-c p-centered">{userProfile.about}</p>
      )}
      <button className="btn btn-normal fx-centered" onClick={handleSubscribe}>
        {t("AaNDAmV")}
        {!isYakihonneGateway(provider) && (
          <Icon name={"share-icon"} strokeWidth={2} />
        )}
      </button>
    </div>
  );
};
