import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import Icon from "@/Components/Icon";
import Spinner from "@/Components/Spinner";
import { PricingCards, CompareTable, FaqSection } from "@/Components/UpgradeOverlay";
import { getPlans } from "@/Endpoints/Subscription";
import usePoints from "@/Hooks/usePoints";

export default function Pricing() {
  const { t } = useTranslation();
  const userKeys = useSelector((state) => state.userKeys);
  const [plans, setPlans] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [mode, setMode] = useState("fiat");
  const {
    config: pointsConfig,
    fetchConfig,
    eligibility,
    fetchEligibility,
    redeemingPlan,
    redeemSubscription,
  } = usePoints();

  useEffect(() => {
    let cancelled = false;
    getPlans()
      .then((data) => {
        if (!cancelled) setPlans(Array.isArray(data) ? data : []);
      })
      .catch(() => {
        if (!cancelled) setPlans([]);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!userKeys) return;
    fetchConfig();
    fetchEligibility();
  }, [userKeys, fetchConfig, fetchEligibility]);

  const hasAnyPointsEligiblePlan = plans.some(
    (plan) => !!eligibility?.[plan.id]?.eligible
  );

  useEffect(() => {
    if (isLoading || plans.length === 0) return;
    const els = document.querySelectorAll(".ip-reveal");
    if (els.length === 0) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("is-visible");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.01, rootMargin: "0px 0px -10% 0px" }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [isLoading, plans.length, mode]);

  return (
    <div className="fit-container fx-centered fx-col">
      <div className="fit-container" style={{ padding: "24px 16px 80px" }}>
        <div
          style={{
            textAlign: "center",
            marginBottom: "48px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "16px",
          }}
        >
          <Icon name="checkmark-c1" size={72} isColored />
          <h2 style={{ margin: 0 }}>{t("APrcTtl")}</h2>
          <p
            className="gray-c"
            style={{ fontSize: "1rem", lineHeight: 1.6, maxWidth: 480, margin: 0 }}
          >
            {t("APrcSub")}
          </p>
        </div>

        {isLoading && (
          <div className="fit-container fx-centered box-pad-v">
            <Spinner />
          </div>
        )}

        {!isLoading && plans.length > 0 && (
          <>
            <PricingCards
              plans={plans}
              mode={mode}
              setMode={setMode}
              userPub={userKeys?.pub}
              eligibility={eligibility}
              pointsConfig={pointsConfig}
              redeemingPlan={redeemingPlan}
              onRedeemSubscription={(plan) => redeemSubscription(plan)}
              hasAnyPointsEligiblePlan={hasAnyPointsEligiblePlan}
            />
            <div style={{ height: "1px", background: "var(--dim-gray)", margin: "48px 0" }} />
            <CompareTable plans={plans} />
            <div style={{ height: "1px", background: "var(--dim-gray)", margin: "48px 0" }} />
            <FaqSection />
          </>
        )}
      </div>
    </div>
  );
}
