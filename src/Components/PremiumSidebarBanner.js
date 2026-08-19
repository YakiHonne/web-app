import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { openUpgradeSheet } from "@/Store/Slides/Upgrade";
import useAccess from "@/Hooks/useAccess";
import { customHistory } from "@/Helpers/History";

const BANNER_URL =
  "https://yakihonne.s3.ap-east-1.amazonaws.com/media/images/premium-banner.png";

export const getTrialDaysLeft = (trialEndsAt) => {
  if (!trialEndsAt) return 0;
  const end = Number(trialEndsAt) * 1000;
  if (!Number.isFinite(end)) return 0;
  return Math.max(0, Math.ceil((end - Date.now()) / (24 * 60 * 60 * 1000)));
};

export default function PremiumSidebarBanner() {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const userKeys = useSelector((state) => state.userKeys);
  const status = useSelector((state) => state.subscription?.status);
  const { isFree, inTrial } = useAccess();

  if (!isFree && !inTrial) return null;

  const openUpgrade = () => {
    if (!userKeys) {
      customHistory("/login");
      return;
    }
    dispatch(openUpgradeSheet({ source: "sidebar-banner" }));
  };

  const onKeyDown = (e) => {
    if (e.key === "Enter" || e.key === " ") openUpgrade();
  };

  if (inTrial) {
    const daysLeft = getTrialDaysLeft(status?.trial_ends_at);
    return (
      <div className="premium-sidebar-slot">
        <div
          className="premium-sidebar-trial pointer"
          onClick={openUpgrade}
          role="button"
          tabIndex={0}
          onKeyDown={onKeyDown}
        >
          <p className="premium-trial-text">
            {t("A190iaq", { count: daysLeft })}
          </p>
          <span className="btn btn-normal btn-small premium-trial-cta">
            {t("AApRZBN")}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="premium-sidebar-slot">
      <div
        className="premium-sidebar-banner pointer"
        onClick={openUpgrade}
        role="button"
        tabIndex={0}
        onKeyDown={onKeyDown}
      >
        <img src={BANNER_URL} alt={t("AApRZBN")} loading="lazy" />
      </div>
    </div>
  );
}
