import { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import Icon from "@/Components/Icon";
import styles from "./styles.module.css";
import { iconsNames } from "@/Content/IconV2URL";

export default function ProfileRelayCheck({ missingProfile, missingRelays, onDismiss }) {
  const { t } = useTranslation();
  const [exiting, setExiting] = useState(false);
  const [dontShowAgain, setDontShowAgain] = useState(false);

  const handleDismiss = useCallback(() => {
    setExiting(true);
    setTimeout(() => onDismiss?.(dontShowAgain), 280);
  }, [onDismiss, dontShowAgain]);

  return (
    <div
      className={`${styles.backdrop}${exiting ? ` ${styles.exiting}` : ""}`}
      onClick={(e) => e.target === e.currentTarget && handleDismiss()}
    >
      <div className={`${styles.card}${exiting ? ` ${styles.exiting}` : ""}`}>
        <div className={"fit-container fx-centered box-marg-s"}>
          <h4>{t("A0AbYLi")}</h4>
        </div>

        {missingProfile && (
          <div className={styles.item}>
            <div className={styles.itemIcon}>
              <Icon name={iconsNames.user_01} v={2} size={22} />
            </div>
            <div className={styles.itemText}>
              <h4 className={styles.itemTitle}>{t("ARWGDQh")}</h4>
              <p className={styles.itemDesc}>{t("Aboq6u1")}</p>
            </div>
            <a
              className={styles.ctaButton}
              href="/settings/profile"
              target="_blank"
              rel="noopener noreferrer"
            >
              {t("Axc3AeQ")}
            </a>
          </div>
        )}

        {missingRelays && (
          <div className={styles.item}>
            <div className={styles.itemIcon}>
              <Icon name={iconsNames.data} v={2} size={22} />
            </div>
            <div className={styles.itemText}>
              <h4 className={styles.itemTitle}>{t("AS4YNU4")}</h4>
              <p className={styles.itemDesc}>{t("A5nen21")}</p>
            </div>
            <a
              className={styles.ctaButton}
              href="/settings?tab=relays"
              target="_blank"
              rel="noopener noreferrer"
            >
              {t("ACCB0jX")}
            </a>
          </div>
        )}

        <label className={`if ${styles.checkboxRow} box-marg-s`}>
          <input
            type="checkbox"
            checked={dontShowAgain}
            onChange={(e) => setDontShowAgain(e.target.checked)}
          />
          <span>{t("AgWo5Q7")}</span>
        </label>

        <button className={"btn btn-normal btn-full"} onClick={handleDismiss}>
          {t("A1LK8nl")}
        </button>
      </div>
    </div>
  );
}
