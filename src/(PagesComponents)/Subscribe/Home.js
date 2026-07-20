import { getSubData } from "@/Helpers/Controlers";
import { useRouter } from "next/router";
import React, { useEffect, useState, useMemo } from "react";
import UserProfilePic from "@/Components/UserProfilePic";
import { SelectTabs } from "@/Components/SelectTabs";
import "./Subscribe.css";
import NumberShrink from "@/Components/NumberShrink";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { getSubscriptionLink } from "@/Helpers/Endpoints/creators";
import Spinner from "@/Components/Spinner";
import { store } from "@/Store/Store";
import { setToast } from "@/Store/Slides/Publishers";
import HorizontalScrollWrapper from "@/Components/HorizontalScrollWrapper";
import PaymentGateway from "@/Components/PaymentGateway";
import { checkForLUDS } from "@/Helpers/Encryptions";
import { iconsNames } from "@/Content/IconV2URL";
import useUserProfile from "@/Hooks/useUsersProfile";
import Badge from "@/Helpers/Badge";
import Icon from "@/Components/Icon";

export default function Home() {
  const { t } = useTranslation();
  const { query } = useRouter();
  const pubkey = query.p;
  const [isLoading, setIsLoading] = useState(true);
  const { userProfile: metadata, isNip05Verified, isLoading: userIsLoading, proUser } = useUserProfile(pubkey, true)
  const [rawPlans, setRawPlans] = useState(null);
  const [selectedMethodIndex, setSelectedMethodIndex] = useState(0);
  const gatewayPubkey = useMemo(() => {
    return rawPlans?.tags?.find((tag) => tag[0] === "gateway")?.[1];
  }, [rawPlans]);

  useEffect(() => {
    if (pubkey) {
      getData();
    }
  }, [pubkey]);

  const getData = async () => {
    setIsLoading(true);
    let identifier = process.env.NEXT_PUBLIC_GATEWAY_PUBKEY;
    let data = await getSubData([
      {
        kinds: [30164],
        authors: [pubkey],
        "#d": [identifier],
        limit: 1,
      },
    ]);

    let p = data.data.find((_) => _.kind === 30164);
    if (p) setRawPlans(p.rawEvent());
    setIsLoading(false);
  };

  const methods = useMemo(() => {
    if (!rawPlans || !rawPlans.tags) return [];
    const methodsMap = new Map();
    const prices = [];
    const currencies = {};

    rawPlans.tags.forEach((tag) => {
      const [key, ...values] = tag;
      if (key === "method") {
        methodsMap.set(values[0], {
          id: values[0],
          display_name: values[1],
          plans: [],
        });
      } else if (key === "price") {
        prices.push({
          method: values[0],
          id: values[1],
          name: values[2],
          amount: values[3],
          interval: values[4],
        });
      } else if (key === "currency") {
        currencies[values[0]] = values[1];
      }
    });

    const parsedMethods = Array.from(methodsMap.values());
    parsedMethods.forEach((m) => {
      m.plans = prices
        .filter((p) => p.method === m.id)
        .map((p) => ({
          ...p,
          currency: currencies[m.id] || "",
        }));
    });

    return parsedMethods;
  }, [rawPlans]);

  const methodTabs = useMemo(
    () => methods.map((m) => m.display_name),
    [methods],
  );

  if (isLoading || userIsLoading) {
    return (
      <div className="subscribe-container fx-centered">
        <div className="loader"></div>
      </div>
    );
  }

  const currentMethod = methods[selectedMethodIndex];

  return (
    <div className="fx-centered fx-col">
      <section className="fit-container">
        <div
          className="fit-container fx-centered fx-start-h fx-end-v fx-start-v box-pad-h-s box-pad-v-s bg-img cover-bg"
          style={{
            position: "relative",
            height: metadata?.banner ? "250px" : "150px",
          }}
        >
          <div
            className="fit-container sc-s bg-img cover-bg"
            style={{
              height: "calc(100% - 90px)",
              position: "absolute",
              left: 0,
              top: 0,
              backgroundImage: metadata?.banner ? `url(${metadata?.banner})` : "",
              backgroundColor: "var(--very-dim-gray)",
              overflow: "visible",
              zIndex: 0,

              cursor: metadata?.banner ? "zoom-in" : "default",
            }}
          ></div>
          <div
            className="fx-centered fx-col fx-start-v fit-container"
            style={{ position: "relative", zIndex: 200 }}
          >
            <div
              className="fx-centered fx-end-v fit-container"
              style={{ columnGap: "16px" }}
            >
              <div style={{
                outline: "6px solid var(--white)",
                borderRadius: "var(--border-r-50)",
              }}>

                <UserProfilePic user_id={pubkey} size={150} img={metadata?.picture} />
              </div>
            </div>
          </div>
        </div>
        <div className="fx-centered fx-col gap-s">
          <div className="fx-centered" style={{ gap: "6px" }}>

            <h3>{metadata?.display_name || metadata?.name || t("AbFJKUc")}</h3>
            {isNip05Verified && (
              <Icon name="checkmark-c1" size={24} isColored />
            )}
            {proUser.isProUser && <Badge data={proUser} size={24} />}
          </div>
          {metadata?.about && (
            <p className="p-centered p-big">{metadata.about}</p>
          )}
        </div>
      </section>

      {methods.length > 0 && (
        <section className="fx-centered fx-col fit-container box-pad-v-m">
          <div>
            <SelectTabs
              selectedTab={selectedMethodIndex}
              tabs={methodTabs}
              setSelectedTab={setSelectedMethodIndex}
            />
          </div>
          <p className="gray-c box-pad-v-s box-pad-h p-centered">
            {t("AUIVQgL", { name: metadata.display_name || metadata.name })}
          </p>
          <div className="fit-container">
            <HorizontalScrollWrapper centerIfSmall={true}>
              {currentMethod?.plans.map((plan, idx) => (
                <PlanCard
                  key={plan.id || idx}
                  plan={plan}
                  creatorPubkey={pubkey}
                  metadata={metadata}
                  gatewayPubkey={gatewayPubkey}
                />
              ))}
            </HorizontalScrollWrapper>
          </div>
        </section>
      )}

      {methods.length === 0 && !isLoading && (
        <p className="gray-c">
          {t("AHtIZDO")}
        </p>
      )}
    </div>
  );
}

function PlanCard({ plan, creatorPubkey, metadata, gatewayPubkey }) {
  const { t } = useTranslation();
  const isPremium = false;
  const userKeys = useSelector((state) => state.userKeys);
  const [isLoading, setIsLoading] = useState(false);
  const [showPaymentGateway, setShowPaymentGateway] = useState(false);
  const recipientAddr = useMemo(() => {
    return checkForLUDS(metadata.lud06, metadata.lud16);
  }, [metadata]);
  const handleSubscription = () => {
    console.log(plan);
    if (plan.method === "fiat") handleFiatSubscribe();
    else handleLightningSubscribe();
  };

  const handleLightningSubscribe = async () => {
    setShowPaymentGateway(true);
  };

  const handleFiatSubscribe = async () => {
    setIsLoading(true);
    let res = await getSubscriptionLink({
      creator_pubkey: creatorPubkey,
      subscriber_pubkey: userKeys.pub,
      price_id: plan.id,
    });
    if (res) window.open(res);
    else
      store.dispatch(
        setToast({ type: 2, desc: t("ALqvxJv") }),
      );
    setIsLoading(false);
  };

  const handleConfirmPayment = (data) => {
    console.log(data);
  };

  return (
    <>
      {showPaymentGateway && (
        <PaymentGateway
          recipientAddr={recipientAddr}
          recipientPubkey={creatorPubkey}
          extraMetadataTags={[
            ["P", gatewayPubkey],
            ["interval", plan.interval],
          ]}
          paymentAmount={plan.amount}
          setConfirmPayment={handleConfirmPayment}
          exit={() => setShowPaymentGateway(false)}
          specificRelays={["wss://nostr-01.yakihonne.com"]}
        />
      )}
      <div className={`bg-dropdown plan-card fx-shrink ${isPremium ? "premium" : ""}`}>
        {isPremium && <div className="plan-badge">{t("ASFj1cj")}</div>}
        <div className="plan-name">{plan.name}</div>
        <div className="plan-price-container">
          <span className="plan-currency">{plan.currency}</span>
          <span className="plan-price">
            <NumberShrink value={plan.amount} />
          </span>
          <span className="plan-interval">/ {plan.interval}</span>
        </div>
        {plan.discount > 0 && (
          <div className="plan-discount">{t("AGMpTe0", { discount: plan.discount })}</div>
        )}

        <button
          className={`btn btn-full  ${plan.method === "lightning" && !recipientAddr ? "btn-disabled" : "btn-normal"}`}
          onClick={handleSubscription}
          disabled={plan.method === "lightning" && !recipientAddr}
        >
          {isLoading ? <Spinner /> : t("AfGdsaA")}
        </button>
      </div>
    </>
  );
}
