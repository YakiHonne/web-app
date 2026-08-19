import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { openUpgradeSheet } from "@/Store/Slides/Upgrade";
import useAccess from "@/Hooks/useAccess";
import Icon from "@/Components/Icon";
import { getTrialDaysLeft } from "@/Components/PremiumSidebarBanner";

const storageKey = (pubkey) => `trial-banner-dismissed-${pubkey}`;

export default function TrialBanner() {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const userKeys = useSelector((state) => state.userKeys);
  const status = useSelector((state) => state.subscription?.status);
  const { inTrial } = useAccess();
  const [dismissed, setDismissed] = useState(true);

  const pubkey = userKeys?.pub;

  useEffect(() => {
    if (!pubkey) {
      setDismissed(true);
      return;
    }
    try {
      setDismissed(!!localStorage.getItem(storageKey(pubkey)));
    } catch {
      setDismissed(false);
    }
  }, [pubkey]);

  if (!inTrial || !pubkey || dismissed) return null;

  const daysLeft = getTrialDaysLeft(status?.trial_ends_at);

  const handleDismiss = (e) => {
    e.stopPropagation();
    try {
      localStorage.setItem(storageKey(pubkey), `${Date.now()}`);
    } catch { }
    setDismissed(true);
  };

  return (
    <div className="trial-banner bg-dropdown-t">
      <div className="trial-banner-body">
        <div className="fx-centered" style={{ columnGap: "6px" }}>
          <p className="p-bold">{t("A49RYTk")}</p>
          <Icon name="party_popper" size={22} v={2} isBoldThemeColor />
        </div>
        <p className="trial-banner-desc">{t("AL4BoyB", { count: daysLeft })}</p>
        <button
          className="btn btn-normal btn-small"
          onClick={() => dispatch(openUpgradeSheet({ source: "trial-banner" }))}
        >
          {t("AApRZBN")}
        </button>
      </div>
      <div
        className="close trial-banner-close"
        onClick={handleDismiss}
        title={t("AB4BSCe")}
      >
        <div></div>
      </div>
    </div>
  );
}
