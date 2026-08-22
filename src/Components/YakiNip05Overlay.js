import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";
import Overlay from "@/Components/Overlay";
import Icon from "@/Components/Icon";
import Spinner from "@/Components/Spinner";
import YakiNameField from "@/Components/YakiNameField";
import useNameClaim from "@/Hooks/useNameClaim";
import useQuotaGuard from "@/Hooks/useQuotaGuard";
import { claimNip05 } from "@/Endpoints/Account";
import { setToast } from "@/Store/Slides/Publishers";

const NIP05_DOMAIN = "@yakihonne.com";

export default function YakiNip05Overlay({
  pubkey,
  nip05Name,
  isActive,
  currentNip05,
  onUse,
  exit,
}) {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const { handleAccessError } = useQuotaGuard();
  const [claiming, setClaiming] = useState(false);

  const owned = !!nip05Name;
  const fullAddress = owned ? `${nip05Name}${NIP05_DOMAIN}` : "";
  const inUse = owned && currentNip05 === fullAddress;

  const [editing, setEditing] = useState(!owned);
  const claim = useNameClaim({
    kind: "nip05",
    initial: nip05Name || "",
    enabled: editing,
  });

  const handleUse = () => {
    onUse(fullAddress);
    exit();
  };

  const handleClaim = async () => {
    if (!claim.claimable || claiming) return;
    setClaiming(true);
    try {
      await claimNip05({ name: claim.value, pubkey });
      onUse(`${claim.value}${NIP05_DOMAIN}`);
      exit();
    } catch (err) {
      if (!handleAccessError(err, "nip05")) {
        dispatch(
          setToast({
            type: 3,
            desc:
              err?.response?.data?.message ||
              t("AUk09tF"),
          }),
        );
      }
      setClaiming(false);
    }
  };

  return (
    <Overlay width={480} exit={exit}>
      <div
        className="fx-centered fx-col box-pad-h box-pad-v fit-container fx-start-v"
        style={{ gap: "1rem" }}
      >
        <div className="fit-container fx-scattered">
          <h4>{t("AikNyQn")}</h4>
          <div className="close" onClick={exit}>
            <div></div>
          </div>
        </div>

        {owned && !editing && (
          <div
            className="fit-container fx-centered fx-col"
            style={{ gap: ".5rem" }}
          >
            <div className="fit-container sc-s-18 box-pad-h-m box-pad-v-m">
              <div className="fit-container fx-scattered">
                <div className="fx-centered fx-start-h" style={{ minWidth: 0 }}>
                  <Icon name="yaki-logomark" size={24} />
                  <p className="p-one-line">{fullAddress}</p>
                </div>
                {isActive ? (
                  <div className="sticker sticker-small sticker-green">
                    {t("Amt1sHd")}
                  </div>
                ) : (
                  <div className="sticker sticker-small sticker-orange">
                    {t("AVi5BAq")}
                  </div>
                )}
              </div>
            </div>

            <p className="p-medium gray-c fit-container">
              {inUse
                ? t("AvW5dTF")
                : t("A5KCCXP")}
            </p>

            <div className="fit-container fx-centered">
              {!inUse && isActive && (
                <button className="btn btn-normal fx" onClick={handleUse}>
                  {t("AdrMY4n")}
                </button>
              )}
              <button
                className="btn btn-gst fx"
                onClick={() => {
                  setEditing(true);
                  claim.reset(nip05Name || "");
                }}
              >
                {t("AY6vWMY")}
              </button>
            </div>
          </div>
        )}

        {editing && (
          <div
            className="fit-container fx-centered fx-col"
            style={{ gap: ".5rem" }}
          >
            <YakiNameField
              label={t("A8NkddD")}
              suffix={NIP05_DOMAIN}
              value={claim.value}
              state={claim.state}
              reason={claim.reason}
              onChange={claim.onChange}
            />

            <p className="p-medium gray-c fit-container">
              {t("ASSSMw5")}
            </p>

            <div className="fit-container fx-centered">
              <button
                className={`btn fx ${claim.claimable ? "btn-normal" : "btn-disabled"}`}
                disabled={!claim.claimable || claiming}
                onClick={handleClaim}
              >
                {claiming ? <Spinner /> : t("AtmJMYt")}
              </button>
              {owned && (
                <button
                  className="btn btn-gst fx"
                  onClick={() => {
                    setEditing(false);
                    claim.reset(nip05Name || "");
                  }}
                >
                  {t("Ap06Zt4")}
                </button>
              )}
            </div>
          </div>
        )}

        {!owned && !editing && (
          <p className="gray-c fit-container">
            {t("A0XxG3E")}
          </p>
        )}
      </div>
    </Overlay>
  );
}
