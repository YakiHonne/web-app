import React from "react";
import { useDispatch } from "react-redux";
import { openUpgradeSheet } from "@/Store/Slides/Upgrade";
import useAccess from "@/Hooks/useAccess";

export const fmtResetIn = (ts) => {
  const diffMs = ts * 1000 - Date.now();
  if (diffMs <= 0) return "shortly";
  const minutes = Math.round(diffMs / 60000);
  if (minutes < 60) return `${minutes} minute${minutes === 1 ? "" : "s"}`;
  const hours = Math.round(diffMs / 3600000);
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"}`;
  const days = Math.round(diffMs / 86400000);
  return `${days} day${days === 1 ? "" : "s"}`;
};

export default function QuotaBanner({ locked, resetAt, context = "ai" }) {
  const dispatch = useDispatch();
  const { isPremium } = useAccess();

  return (
    <div className="ai-quota-banner">
      <p className="ai-quota-banner-text">
        {locked
          ? "Your plan does not include this feature."
          : resetAt
            ? `Quota exceeded — renews in ${fmtResetIn(resetAt)}.`
            : "Quota exceeded."}
      </p>
      {!isPremium && (
        <button
          className="ai-quota-banner-btn"
          onClick={() => dispatch(openUpgradeSheet({ context }))}
        >
          Upgrade
        </button>
      )}
    </div>
  );
}
