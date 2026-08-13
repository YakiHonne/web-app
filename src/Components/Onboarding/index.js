import React, { useCallback, useState } from "react";
import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";
import Icon from "@/Components/Icon";
import { iconsNames } from "@/Content/IconV2URL";
import useOnboarding from "@/Hooks/useOnboarding";
import {
  USERNAME_MAX,
  USERNAME_MIN,
  validateUsername,
} from "@/Endpoints/Account";
import styles from "./styles.module.css";

const FIELD_ORDER = ["username", "nip05", "wallet"];

const FIELD_META = {
  username: { label: "Username", prefix: "yakihonne.com/", suffix: "" },
  nip05: { label: "NIP-05 address", prefix: "", suffix: "@yakihonne.com" },
  wallet: {
    label: "Lightning address",
    prefix: "",
    suffix: "@wallet.yakihonne.com",
  },
};

function StatusIcon({ state }) {
  if (state === "checking") return <span className={styles.spinner} />;
  if (state === "available" || state === "owned")
    return (
      <span className={styles.check}>
        <Icon name="check" size={18} isColored />
      </span>
    );
  if (state === "taken" || state === "invalid" || state === "error")
    return (
      <span className={styles.cross}>
        <Icon name={iconsNames.close_sm} size={16} v={2} />
      </span>
    );
  return null;
}

function hintFor(field, value) {
  if (!value) return null;
  if (field?.state === "invalid") {
    if (field.reason === "length")
      return {
        text: `Must be between ${USERNAME_MIN} and ${USERNAME_MAX} characters.`,
        ok: false,
      };
    return {
      text: "Only lowercase letters, numbers, _ and - are allowed.",
      ok: false,
    };
  }
  if (field?.state === "taken")
    return {
      text: field.reason || "This name is already taken, pick another one.",
      ok: false,
    };
  if (field?.state === "error")
    return {
      text: field.reason || "Could not check availability, try again.",
      ok: false,
    };
  if (field?.state === "owned")
    return {
      text: field.reason || "This one is already yours.",
      ok: true,
    };
  if (field?.state === "available") return { text: "Available", ok: true };
  return null;
}

function OnboardingField({
  name,
  value,
  field,
  disabled,
  displayValue,
  onChange,
}) {
  const meta = FIELD_META[name];
  const hint = disabled ? null : hintFor(field, value);
  const stateClass =
    field?.state === "available" || field?.state === "owned"
      ? ` ${styles.available}`
      : field?.state === "taken" || field?.state === "invalid"
        ? ` ${styles.taken}`
        : "";

  return (
    <div className={`${styles.field}${stateClass}`}>
      <div className={styles.fieldLabel}>{meta.label}</div>
      <div className={styles.inputRow}>
        {meta.prefix && <span className={styles.affix}>{meta.prefix}</span>}
        <input
          className={styles.input}
          type="text"
          value={disabled ? displayValue : value}
          disabled={disabled}
          placeholder="yourname"
          spellCheck={false}
          autoCapitalize="none"
          autoCorrect="off"
          maxLength={USERNAME_MAX}
          onChange={(e) => onChange(e.target.value)}
        />
        {meta.suffix && <span className={styles.affix}>{meta.suffix}</span>}
        <span className={styles.status}>
          {!disabled && <StatusIcon state={field?.state} />}
        </span>
      </div>
      {hint && (
        <p
          className={`${styles.hint} ${hint.ok ? styles.hintOk : styles.hintError}`}
        >
          {hint.text}
        </p>
      )}
    </div>
  );
}

const REMAINING_LABELS = {
  username: "your profile link",
  nip05: "your NIP-05 address",
  wallet: "your Lightning address",
};

function listRemaining(targets) {
  const parts = targets.map((name) => REMAINING_LABELS[name]);
  if (parts.length <= 1) return parts[0] || "";
  return `${parts.slice(0, -1).join(", ")} and ${parts[parts.length - 1]}`;
}

function SettledField({ name, value }) {
  const meta = FIELD_META[name];
  return (
    <div className={`${styles.field} ${styles.settled}`}>
      <div className={styles.fieldLabel}>{meta.label}</div>
      <div className={styles.inputRow}>
        <span className={styles.settledValue}>
          {`${meta.prefix}${value}${meta.suffix}`}
        </span>
        <span className={styles.status}>
          <span className={styles.check}>
            <Icon name="check" size={18} isColored />
          </span>
        </span>
      </div>
      <p className={`${styles.hint} ${styles.hintOk}`}>Already set</p>
    </div>
  );
}

export default function Onboarding({
  pubkey,
  username,
  hasUsername,
  hasWallet,
  walletAddress,
  hasNip05,
  nip05Name,
  onClose,
}) {
  const { t } = useTranslation();
  const [exiting, setExiting] = useState(false);
  const {
    values,
    fields,
    detached,
    targets,
    setValue,
    canSubmit,
    submitting,
    done,
    hasExistingMetadata,
    publishConsent,
    setPublishConsent,
    submit,
    skip,
  } = useOnboarding({
    pubkey,
    hasUsername,
    hasWallet,
    walletAddress,
    hasNip05,
    nip05Name,
  });

  const close = useCallback(() => {
    setExiting(true);
    setTimeout(() => onClose?.(), 280);
  }, [onClose]);

  const handleSkip = useCallback(async () => {
    await skip();
    close();
  }, [skip, close]);

  const handleSubmit = useCallback(async () => {
    const ok = await submit();
    if (ok) setTimeout(() => close(), 2600);
  }, [submit, close]);

  const sharedInvalid = targets.some((name) => validateUsername(values[name]));

  const content = (
    <div className={`${styles.backdrop}${exiting ? ` ${styles.exiting}` : ""}`}>
      <div className={`${styles.card}${exiting ? ` ${styles.exiting}` : ""}`}>
        <div className={styles.glow} />

        {done ? (
          <div className={styles.success}>
            <div className={styles.successRing}>
              <Icon name="check" size={40} isColored />
            </div>
            <div>
              <h3 className={styles.title}>You're all set</h3>
              <p className={styles.subtitle}>
                Your identity is ready across Yakihonne.
              </p>
            </div>
            <div className={styles.successList}>
              {FIELD_ORDER.map((name) => {
                const meta = FIELD_META[name];
                const settled = {
                  username: hasUsername ? username : "",
                  nip05: hasNip05 ? nip05Name : "",
                  wallet: hasWallet ? walletAddress : "",
                }[name];
                const final = settled || values[name];
                if (!final) return null;
                return (
                  <div key={name} className={styles.successItem}>
                    <span className={styles.check}>
                      <Icon name="check" size={16} isColored />
                    </span>
                    {`${meta.prefix}${final}${meta.suffix}`}
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <>
            <div className={styles.header}>
              <span className={styles.badge}>Welcome aboard</span>
              <h3 className={styles.title}>Claim your name</h3>
              <p className={styles.subtitle}>
                {targets.length > 1
                  ? `Pick one name and we'll set up ${listRemaining(targets)} at once.`
                  : `Pick a name to set up ${listRemaining(targets)}.`}
              </p>
            </div>

            <div className={styles.fields}>
              {FIELD_ORDER.map((name) => {
                const settledValue = {
                  username: hasUsername ? username : "",
                  nip05: hasNip05 ? nip05Name : "",
                  wallet: hasWallet ? walletAddress : "",
                }[name];

                if (settledValue)
                  return (
                    <SettledField key={name} name={name} value={settledValue} />
                  );

                if (!targets.includes(name)) return null;

                return (
                  <OnboardingField
                    key={name}
                    name={name}
                    value={values[name]}
                    field={fields[name]}
                    onChange={(next) => setValue(name, next)}
                  />
                );
              })}
            </div>

            <p className={styles.note}>
              Usernames are lowercase, {USERNAME_MIN}–{USERNAME_MAX} characters,
              letters, numbers, _ and - only. They cannot be changed once set.
            </p>

            {hasExistingMetadata && (
              <div className={styles.consent}>
                <label className={styles.consentRow}>
                  <input
                    className={styles.checkboxInput}
                    type="checkbox"
                    checked={publishConsent}
                    onChange={(e) => setPublishConsent(e.target.checked)}
                  />
                  <span
                    className={`${styles.checkbox}${publishConsent ? ` ${styles.checkboxOn}` : ""}`}
                  >
                    {publishConsent && (
                      <Icon name="check" size={13} isColored />
                    )}
                  </span>
                  <span className={styles.consentLabel}>
                    Update my Nostr profile with these addresses
                  </span>
                </label>
                {!publishConsent && (
                  <p className={`${styles.hint} ${styles.consentHint}`}>
                    No problem — your NIP-05 and Lightning address stay
                    available anytime from the profile edit page.
                  </p>
                )}
              </div>
            )}

            <div className={styles.actions}>
              <button
                className={styles.primary}
                disabled={!canSubmit || !!sharedInvalid}
                onClick={handleSubmit}
              >
                {submitting ? <span className={styles.spinner} /> : "Claim my name"}
              </button>
              <button className={styles.skip} onClick={handleSkip}>
                {t("A1LK8nl")}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );

  if (typeof window === "undefined") return null;

  return createPortal(
    content,
    document.getElementById("portal-root") || document.body,
  );
}
