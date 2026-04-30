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
import LoadingDots from "@/Components/LoadingDots";
import { store } from "@/Store/Store";
import { setToast } from "@/Store/Slides/Publishers";
import HorizontalScrollWrapper from "@/Components/HorizontalScrollWrapper";
import PaymentGateway from "@/Components/PaymentGateway";
import { checkForLUDS } from "@/Helpers/Encryptions";

export default function Home() {
  const { t } = useTranslation();
  const { query } = useRouter();
  const pubkey = query.p;
  const [isLoading, setIsLoading] = useState(true);
  const [metadata, setMetadata] = useState(null);
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
      {
        kinds: [0],
        authors: [pubkey],
        limit: 1,
      },
    ]);

    let m = data.data.find((_) => _.kind === 0);
    let p = data.data.find((_) => _.kind === 30164);
    if (m) setMetadata(JSON.parse(m.content));
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
          methodId: values[0],
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
        .filter((p) => p.methodId === m.id)
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

  if (isLoading) {
    return (
      <div className="subscribe-container fx-centered">
        <div className="loader"></div>
      </div>
    );
  }

  const currentMethod = methods[selectedMethodIndex];

  return (
    <div className="subscribe-container">
      {/* Section 1: User Metadata */}
      <section className="user-metadata-section">
        <UserProfilePic user_id={pubkey} size={80} img={metadata?.picture} />
        <div className="fx-centered fx-col gap-s">
          <h3>{metadata?.display_name || metadata?.name || "Nostr Creator"}</h3>
          {metadata?.name && metadata?.display_name && (
            <p className="gray-c p-centered p-big">@{metadata.name}</p>
          )}
        </div>
      </section>

      {/* Section 2: Plans */}
      {methods.length > 0 && (
        <section className="fx-centered fx-col fit-container">
          <div>
            <SelectTabs
              selectedTab={selectedMethodIndex}
              tabs={methodTabs}
              setSelectedTab={setSelectedMethodIndex}
            />
          </div>
          <p className="gray-c box-pad-v-m box-pad-h p-centered">
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
          No subscription plans available for this creator.
        </p>
      )}
    </div>
  );
}

function PlanCard({ plan, creatorPubkey, metadata, gatewayPubkey }) {
  const isPremium = false;
  const userKeys = useSelector((state) => state.userKeys);
  const [isLoading, setIsLoading] = useState(false);
  const [showPaymentGateway, setShowPaymentGateway] = useState(false);
  const recipientAddr = useMemo(() => {
    return checkForLUDS(metadata.lud06, metadata.lud16);
  }, [metadata]);
  const handleSubscription = () => {
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
        setToast({ type: 2, desc: "Could not initiate subscription" }),
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
      <div className={`plan-card fx-shrink ${isPremium ? "premium" : ""}`}>
        {isPremium && <div className="plan-badge">Most Popular</div>}
        <div className="plan-name">{plan.name}</div>
        <div className="plan-price-container">
          <span className="plan-currency">{plan.currency}</span>
          <span className="plan-price">
            <NumberShrink value={plan.amount} />
          </span>
          <span className="plan-interval">/ {plan.interval}</span>
        </div>
        {plan.discount > 0 && (
          <div className="plan-discount">{plan.discount}% Off</div>
        )}

        <button
          className={`btn btn-full plan-cta ${plan.method === "lightning" && !recipientAddr ? "btn-disabled" : "btn-gst"}`}
          onClick={handleSubscription}
          disabled={plan.method === "lightning" && !recipientAddr}
        >
          {isLoading ? <LoadingDots /> : "Subscribe Now"}
        </button>
      </div>
    </>
  );
}
