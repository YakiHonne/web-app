import React from "react";
import { useTranslation } from "react-i18next";
import Icon from "@/Components/Icon";
import Spinner from "@/Components/Spinner";
import { USERNAME_MAX, USERNAME_MIN } from "@/Endpoints/Account";

export const nameHint = ({ state, reason }, t) => {
  if (state === "invalid")
    return {
      text:
        reason === "length"
          ? t("A9GLxxm", { min: USERNAME_MIN, max: USERNAME_MAX })
          : t("AkKWqjV"),
      ok: false,
    };
  if (state === "taken") return { text: reason || t("AMRVrtu"), ok: false };
  if (state === "error") return { text: t("AyaICrT"), ok: false };
  if (state === "owned") return { text: reason || t("Anrpmju"), ok: true };
  if (state === "available") return { text: t("AfiIYCI"), ok: true };
  return null;
};

export default function YakiNameField({
  label,
  suffix,
  prefix,
  value,
  state,
  reason,
  disabled,
  placeholder = "yourname",
  badge = false,
  action,
  onChange,
}) {
  const { t } = useTranslation();
  const hint = disabled ? null : nameHint({ state, reason }, t);
  const accent = disabled
    ? ""
    : state === "available" || state === "owned"
      ? "var(--green-main)"
      : state === "taken" || state === "invalid" || state === "error"
        ? "var(--red-main)"
        : "";

  return (
    <div
      className="fit-container sc-s-18 no-bg box-pad-v-s"
      style={accent ? { borderColor: `color-mix(in srgb, ${accent} 35%, transparent)` } : undefined}
    >
      <div className="fx-centered fx-start-h box-pad-h-m" style={{ gap: "4px" }}>
        <p className="p-medium gray-c">{label}</p>
        {badge && <Icon name="crown" size={14} isColored />}
      </div>
      <div className="fx-centered fit-container box-pad-h-m" style={{ gap: 0 }}>
        {prefix && (
          <p className="gray-c" style={{ minWidth: "max-content" }}>
            {prefix}
          </p>
        )}
        <input
          className="if ifs-full if-no-border"
          style={{
            height: "36px",
            paddingLeft: 0,
            paddingRight: 0,
            flex: "1 1 auto",
            width: "auto",
            minWidth: 0,
          }}
          placeholder={placeholder}
          value={value}
          disabled={disabled}
          spellCheck={false}
          autoCapitalize="none"
          autoCorrect="off"
          maxLength={USERNAME_MAX}
          onChange={(e) => onChange?.(e.target.value)}
        />
        {suffix && (
          <p className="gray-c" style={{ minWidth: "max-content" }}>
            {suffix}
          </p>
        )}
        <div
          className="fx-centered"
          style={{ minWidth: "24px", paddingLeft: ".5rem" }}
        >
          {!disabled && state === "checking" && (
            <Spinner size={16} color="var(--c1)" />
          )}
          {!disabled && (state === "available" || state === "owned") && (
            <Icon name="check" size={16} isColored />
          )}
          {action}
        </div>
      </div>
      {hint && (
        <div className="box-pad-h-m">
          <p className={`p-medium ${hint.ok ? "green-c" : "red-c"}`}>
            {hint.text}
          </p>
        </div>
      )}
    </div>
  );
}
