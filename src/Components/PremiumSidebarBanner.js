import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { openUpgradeSheet } from "@/Store/Slides/Upgrade";
import useAccess from "@/Hooks/useAccess";
import { customHistory } from "@/Helpers/History";
import Icon from "@/Components/Icon";

const BANNER_URL =
  "https://yakihonne.s3.ap-east-1.amazonaws.com/media/images/premium-banner.png";

export const getTrialDaysLeft = (trialEndsAt) => {
  if (!trialEndsAt) return 0;
  const end = Number(trialEndsAt) * 1000;
  if (!Number.isFinite(end)) return 0;
  return Math.max(0, Math.ceil((end - Date.now()) / (24 * 60 * 60 * 1000)));
};

export function usePremiumBannerState() {
  const dispatch = useDispatch();
  const userKeys = useSelector((state) => state.userKeys);
  const status = useSelector((state) => state.subscription?.status);
  const { isFree, inTrial } = useAccess();

  const openUpgrade = () => {
    if (!userKeys) {
      customHistory("/login");
      return;
    }
    dispatch(openUpgradeSheet({ source: "sidebar-banner" }));
  };

  return {
    visible: Boolean(isFree || inTrial),
    inTrial: Boolean(inTrial),
    daysLeft: inTrial ? getTrialDaysLeft(status?.trial_ends_at) : 0,
    openUpgrade,
  };
}

export default function PremiumSidebarBanner({ variant = "banner", flyoutProps, maxHeight }) {
  const { t } = useTranslation();
  const { visible, inTrial, daysLeft, openUpgrade } = usePremiumBannerState();

  if (!visible) return null;

  const onKeyDown = (e) => {
    if (e.key === "Enter" || e.key === " ") openUpgrade();
  };

  if (variant === "icon") {
    const label = inTrial ? t("AsbTrLf", { count: daysLeft }) : t("AsbGoPr");
    return (
      <button
        type="button"
        className="csb-row csb-premium-icon"
        aria-label={label}
        onClick={openUpgrade}
        {...(flyoutProps ? flyoutProps(label) : {})}
      >
        <span className="csb-row-icon">
          <Icon name="crown" size={22} isBoldThemeColor />
        </span>
      </button>
    );
  }

  if (variant === "compact") {
    return (
      <button type="button" className="csb-premium-strip" onClick={openUpgrade}>
        <span className="csb-premium-strip-text">
          <Icon name="crown" size={16} isBoldThemeColor />
          <span>{inTrial ? t("AsbTrLf", { count: daysLeft }) : t("AsbGoPr")}</span>
        </span>
        <span className="csb-premium-strip-cta">{t("AGo17y4")}</span>
      </button>
    );
  }

  if (inTrial) {
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
        <img
          src={BANNER_URL}
          alt={t("AApRZBN")}
          loading="lazy"
          style={maxHeight ? { maxHeight, width: "auto", maxWidth: "100%", margin: "0 auto", display: "block" } : undefined}
        />
      </div>
    </div>
  );
}
