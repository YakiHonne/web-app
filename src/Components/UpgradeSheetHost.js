import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import UpgradeOverlay from "@/Components/UpgradeOverlay";
import { closeUpgradeSheet } from "@/Store/Slides/Upgrade";
import { getPlans } from "@/Endpoints/Subscription";
import usePoints from "@/Hooks/usePoints";

export default function UpgradeSheetHost() {
  const dispatch = useDispatch();
  const isOpen = useSelector((state) => state.upgrade?.open);
  const userKeys = useSelector((state) => state.userKeys);
  const [plans, setPlans] = useState([]);
  const {
    config: pointsConfig,
    fetchConfig,
    eligibility,
    fetchEligibility,
    redeemingPlan,
    redeemSubscription,
  } = usePoints();

  useEffect(() => {
    if (!isOpen) return;
    getPlans().then(setPlans).catch(() => setPlans([]));
    fetchConfig();
    fetchEligibility();
  }, [isOpen, fetchConfig, fetchEligibility]);

  if (!isOpen) return null;

  return (
    <UpgradeOverlay
      plans={plans}
      onClose={() => dispatch(closeUpgradeSheet())}
      userPub={userKeys?.pub}
      eligibility={eligibility}
      pointsConfig={pointsConfig}
      redeemingPlan={redeemingPlan}
      onRedeemSubscription={(plan) => redeemSubscription(plan)}
    />
  );
}
