import React from "react";
import { useRouter } from "next/router";
import Overlay from "./Overlay";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";

const FEATURE_META = {
  ai: {
    labelKey: "AiGateLabel",
    descKey: "AiGateDesc",
    perksKeys: ["AiGatePerk1", "AiGatePerk2", "AiGatePerk3", "AiGatePerk4"],
  },
  editor: {
    labelKey: "EditorGateLabel",
    descKey: "EditorGateDesc",
    perksKeys: ["EditorGatePerk1", "EditorGatePerk2", "EditorGatePerk3"],
  },
};

export default function PremiumFeatureGate({ feature, onClose }) {
  const router = useRouter();
  const { t } = useTranslation();
  const meta = FEATURE_META[feature] || FEATURE_META.ai;
  const subscription = useSelector((state) => state.subscription);
  const plan = subscription?.status?.plan;
  const planLabel = plan === "basic"
    ? "You're on the Basic plan"
    : "You're on the Free plan";

  const handleUpgrade = () => {
    onClose();
    router.push("/settings");
  };

  return (
    <Overlay exit={onClose} width={460}>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          padding: "2rem 1.75rem",
          rowGap: "24px",
          textAlign: "center",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", rowGap: "10px", alignItems: "center" }}>
          <span
            style={{
              fontSize: "0.68rem",
              fontWeight: 700,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: "var(--c1)",
              background: "rgba(247, 88, 22, 0.1)",
              border: "1px solid rgba(247,88,22,0.2)",
              borderRadius: "999px",
              padding: "3px 12px",
            }}
          >
            {planLabel}
          </span>
          <h3 style={{ margin: 0 }}>{t(meta.labelKey)}</h3>
          <p
            className="gray-c"
            style={{ margin: 0, fontSize: "0.875rem", lineHeight: 1.65, maxWidth: "360px" }}
          >
            {t(meta.descKey)}
          </p>
        </div>

        <div
          className="fit-container"
          style={{
            background: "var(--dim-bg)",
            border: "1px solid var(--dim-border)",
            borderRadius: "12px",
            padding: "14px 16px",
            display: "flex",
            flexDirection: "column",
            rowGap: "10px",
            textAlign: "left",
          }}
        >
          {meta.perksKeys.map((key) => (
            <div key={key} style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <span
                style={{
                  width: "18px",
                  height: "18px",
                  borderRadius: "50%",
                  background: "rgba(247, 88, 22, 0.1)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  fontSize: "0.7rem",
                  color: "var(--c1)",
                  fontWeight: 900,
                }}
              >
                ✓
              </span>
              <p style={{ margin: 0, fontSize: "0.84rem" }}>{t(key)}</p>
            </div>
          ))}
        </div>

        <div style={{ display: "flex", flexDirection: "column", width: "100%", rowGap: "10px" }}>
          <button
            className="btn btn-normal"
            style={{ width: "100%", fontWeight: 700 }}
            onClick={handleUpgrade}
          >
            {t("AiGateUpgrade")}
          </button>
          <button
            className="btn btn-gst"
            style={{ width: "100%" }}
            onClick={onClose}
          >
            {t("AiGateLater")}
          </button>
        </div>
      </div>
    </Overlay>
  );
}
