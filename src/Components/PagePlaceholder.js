import React, { useState } from "react";
import { useSelector } from "react-redux";
import { userLogout } from "@/Helpers/Controlers";
import { redirectToLogin } from "@/Helpers/Helpers";
import { useTranslation } from "react-i18next";
let Hero404 =
  "https://yakihonne.s3.ap-east-1.amazonaws.com/media/images/404-hero.png";
let HeroNostrNotConnected =
  "https://yakihonne.s3.ap-east-1.amazonaws.com/media/images/nostr-not-connected.png";
let HeroNostrunauthorized =
  "https://yakihonne.s3.ap-east-1.amazonaws.com/media/images/nostr-unauthorized.png";
let HeroNostrNoUN =
  "https://yakihonne.s3.ap-east-1.amazonaws.com/media/images/un-hero.png";
let HeroNostrunauthorizedMessages =
  "https://yakihonne.s3.ap-east-1.amazonaws.com/media/images/unauthorized-messages.png";
let HeroDMS =
  "https://yakihonne.s3.ap-east-1.amazonaws.com/media/images/DMS.png";
let HeroDMSWaiting =
  "https://yakihonne.s3.ap-east-1.amazonaws.com/media/images/DMS-waiting.gif";
let HeroYakiChest =
  "https://yakihonne.s3.ap-east-1.amazonaws.com/media/images/trophy.png";
let HeroWallet =
  "https://yakihonne.s3.ap-east-1.amazonaws.com/media/images/wallet.png";
let HeroWidgets =
  "https://yakihonne.s3.ap-east-1.amazonaws.com/media/images/widgets.png";
let HeroWidgetsDraft =
  "https://yakihonne.s3.ap-east-1.amazonaws.com/media/images/draft.png";
let HeroUnsupported =
  "https://yakihonne.s3.ap-east-1.amazonaws.com/media/images/unsupported.png";
let HeroMutedUser =
  "https://yakihonne.s3.ap-east-1.amazonaws.com/media/images/muted-user.png";
let HeroMaintenance =
  "https://yakihonne.s3.ap-east-1.amazonaws.com/media/images/maintenance.png";
let HeroAI = "https://yakihonne.s3.ap-east-1.amazonaws.com/media/images/ai.png";
import LoginWithAPI from "@/Components/LoginWithAPI";
import AddWallet from "@/Components/AddWallet";

export default function PagePlaceholder({ page, onClick = null }) {
  const userKeys = useSelector((state) => state.userKeys);
  const { t } = useTranslation();
  const [showYakiChest, setShowYakiChest] = useState(false);
  const [showAddWallet, setShowAddWallet] = useState(false);

  if (page === "404")
    return (
      <div className="fit-container">
        <div className="fx-centered fx-col" style={{ height: "100vh" }}>
          <h2 className="box-marg-s p-centered">{t("ABEx38g")}</h2>
          <p
            className="p-centered gray-c box-pad-h"
            style={{ maxWidth: "450px" }}
          >
            {t("AYTKHbY")}
          </p>
          <div
            className="bg-img contained-bg"
            style={{
              backgroundImage: `url(${Hero404})`,
              width: "min(300px, 500px)",
              height: "300px",
            }}
          ></div>
          <button
            className="btn btn-normal"
            onClick={() => (window.location = "/")}
          >
            {t("A9Un0Og")}
          </button>
        </div>
      </div>
    );
  if (page === "nostr-not-connected")
    return (
      <>
        <div className="fit-container fx-centered">
          <div className="fx-centered fx-col" style={{ height: "80vh" }}>
            <h2 className="box-marg-s p-centered">{t("AADL1TO")}</h2>
            <p className="p-centered gray-c" style={{ maxWidth: "450px" }}>
              {t("AD0otkO")}
            </p>
            <div
              className="bg-img contained-bg"
              style={{
                backgroundImage: `url(${HeroNostrNotConnected})`,
                width: "min(300px, 500px)",
                height: "300px",
              }}
            ></div>
            <button
              className="btn btn-normal"
              onClick={() => redirectToLogin()}
            >
              {t("AmOtzoL")}
            </button>
          </div>
        </div>
      </>
    );
  if (page === "nostr-unauthorized")
    return (
      <div className="fit-container">
        <div className="fx-centered fx-col" style={{ height: "80vh" }}>
          <h2 className="box-marg-s p-centered">{t("AEm25j4")}</h2>
          <p className="p-centered gray-c" style={{ maxWidth: "450px" }}>
            {t("ApcEX6u")}
          </p>
          <div
            className="bg-img contained-bg"
            style={{
              backgroundImage: `url(${HeroNostrunauthorized})`,
              width: "min(300px, 500px)",
              height: "300px",
            }}
          ></div>
          <button className="btn btn-normal" onClick={userLogout}>
            {t("AVEtnb9")}
          </button>
        </div>
      </div>
    );

  if (page === "nostr-un")
    return (
      <div className="fit-container">
        <div className="fx-centered fx-col" style={{ height: "20vh" }}>
          <div
            className="bg-img contained-bg"
            style={{
              backgroundImage: `url(${HeroNostrNoUN})`,
              width: "min(300px, 500px)",
              height: "200px",
            }}
          ></div>
          <p className="p-centered gray-c" style={{ maxWidth: "450px" }}>
            {t("Ax1Hh4U")}
          </p>
        </div>
      </div>
    );
  if (page === "nostr-unauthorized-messages")
    return (
      <div className="fit-container">
        <div className="fx-centered fx-col" style={{ height: "80vh" }}>
          <h2 className="box-marg-s p-centered">{t("AEm25j4")}</h2>
          <p className="p-centered gray-c" style={{ maxWidth: "450px" }}>
            {t("AthLKvF")}
          </p>
          <div
            className="bg-img contained-bg"
            style={{
              backgroundImage: `url(${HeroNostrunauthorizedMessages})`,
              width: "min(300px, 500px)",
              height: "300px",
            }}
          ></div>
          <button className="btn btn-normal" onClick={userLogout}>
            {t("AyXwdfE")}
          </button>
        </div>
      </div>
    );
  if (page === "nostr-bunker-dms")
    return (
      <div className="fit-container">
        <div className="fx-centered fx-col" style={{ height: "100vh" }}>
          <h2 className="box-marg-s p-centered">{t("AlNe9hu")}</h2>
          <p className="p-centered gray-c" style={{ maxWidth: "450px" }}>
            {t("AIJ7nCM")}
          </p>
          <div
            className="bg-img contained-bg"
            style={{
              backgroundImage: `url(${HeroNostrunauthorizedMessages})`,
              width: "min(300px, 500px)",
              height: "300px",
            }}
          ></div>
        </div>
      </div>
    );
  if (page === "nostr-DMS")
    return (
      <div className="fit-container">
        <div className="fx-centered fx-col" style={{ height: "90vh" }}>
          <h2 className="box-marg-s p-centered">{t("AWEqHfP")}</h2>
          <p className="p-centered gray-c" style={{ maxWidth: "450px" }}>
            {t("AzfjyGO")}
          </p>
          <div
            className="bg-img contained-bg"
            style={{
              backgroundImage: `url(${HeroDMS})`,
              width: "min(300px, 500px)",
              height: "300px",
            }}
          ></div>
        </div>
      </div>
    );
  if (page === "nostr-DMS-waiting")
    return (
      <div className="fit-container">
        <div className="fx-centered fx-col" style={{ height: "80vh" }}>
          <h2 className="box-marg-s p-centered">{t("A0sXNyM")}</h2>
          <p className="p-centered gray-c" style={{ maxWidth: "450px" }}>
            {t("AVyHzwC")}
          </p>
          <div
            className="bg-img contained-bg"
            style={{
              backgroundImage: `url(${HeroDMSWaiting})`,
              width: "min(300px, 500px)",
              height: "300px",
            }}
          ></div>
        </div>
      </div>
    );
  if (page === "nostr-yaki-chest")
    return (
      <>
        {showYakiChest && <LoginWithAPI exit={() => setShowYakiChest(false)} />}
        <div className="fit-container">
          <div className="fx-centered fx-col" style={{ height: "80vh" }}>
            <div
              className="bg-img contained-bg"
              style={{
                backgroundImage: `url(${HeroYakiChest})`,
                width: "min(300px, 500px)",
                height: "300px",
              }}
            ></div>
            <h3 className="box-marg-s p-centered">{t("AXYiu6Y")}</h3>
            <p
              className="p-centered gray-c box-marg-s "
              style={{ maxWidth: "450px" }}
            >
              {t("ATSLvF2")}
            </p>
            {userKeys && (userKeys.ext || userKeys.sec || userKeys.bunker) && (
              <button
                className="btn btn-normal"
                onClick={() => setShowYakiChest(true)}
              >
                {t("Ag1xrtA")}
              </button>
            )}
          </div>
        </div>
      </>
    );
  if (page === "nostr-wallet")
    return (
      <>
        <div className="fit-container fx-centered">
          <div className="fx-centered fx-col" style={{ height: "80vh" }}>
            <div
              className="bg-img contained-bg"
              style={{
                backgroundImage: `url(${HeroWallet})`,
                width: "min(300px, 500px)",
                height: "300px",
              }}
            ></div>
            <h3 className=" p-centered">{t("ALRlj3f")}</h3>
            <p className="p-centered gray-c" style={{ maxWidth: "450px" }}>
              {t("AwxZeBC")}
            </p>
            <button
              className="btn btn-normal"
              onClick={() => (userKeys ? userLogout() : redirectToLogin())}
            >
              {userKeys ? t("Ak2D1hf") : t("AmOtzoL")}
            </button>
          </div>
        </div>
      </>
    );
  if (page === "nostr-add-wallet")
    return (
      <>
        {showAddWallet && (
          <AddWallet
            exit={() => setShowAddWallet(false)}
            refresh={onClick ? onClick : () => null}
          />
        )}
        <div className="fit-container fx-centered">
          <div
            className="fx-centered fx-col"
            style={{ height: onClick ? "80vh" : "auto", rowGap: "24px" }}
          >
            <div style={{ position: "relative" }}>
              <div className="round-icon" style={{ width: "140px" }}>
                <div
                  className="wallet-add"
                  style={{ width: "60px", height: "60px" }}
                ></div>
              </div>
              <div
                className="box-pad-h-s box-pad-v-s"
                style={{
                  borderRadius: "var(--border-r-50)",
                  backgroundColor: "var(--white)",
                  position: "absolute",
                  top: 0,
                  left: 0,
                }}
              >
                <div
                  className="alby-logo-24"
                  style={{ width: "32px", height: "32px" }}
                ></div>
              </div>
              <div
                className="box-pad-h-s box-pad-v-s"
                style={{
                  borderRadius: "var(--border-r-50)",
                  backgroundColor: "var(--white)",
                  position: "absolute",
                  right: 0,
                  bottom: 0,
                }}
              >
                <div
                  className="nwc-logo-24"
                  style={{ width: "32px", height: "32px" }}
                ></div>
              </div>
            </div>

            <p className="p-centered gray-c" style={{ maxWidth: "400px" }}>
              {t("AToSVHy")}
            </p>
            {onClick && (
              <button
                className="btn btn-orange fx-centered"
                onClick={() => setShowAddWallet(!showAddWallet)}
              >
                <div className="plus-sign"></div> {t("A8fEwNq")}
              </button>
            )}
          </div>
        </div>
      </>
    );
  if (page === "widgets")
    return (
      <>
        {showYakiChest && <LoginWithAPI exit={() => setShowYakiChest(false)} />}
        <div className="fit-container">
          <div className="fx-centered fx-col" style={{ height: "60vh" }}>
            <div
              className="bg-img contained-bg"
              style={{
                backgroundImage: `url(${HeroWidgets})`,
                width: "500px",
                height: "280px",
              }}
            ></div>
            <h4>Smart widget checker</h4>
            <p className="p-centered gray-c" style={{ maxWidth: "450px" }}>
              {t("Ax7qE5o")}
            </p>
          </div>
        </div>
      </>
    );
  if (page === "widgets-draft")
    return (
      <>
        <div className="fit-container">
          <div className="fx-centered fx-col" style={{ height: "80vh" }}>
            <div
              className="bg-img contained-bg"
              style={{
                backgroundImage: `url(${HeroWidgetsDraft})`,
                width: "500px",
                height: "280px",
              }}
            ></div>
            <h4>{t("A14HHPP")}</h4>
            <p className="p-centered gray-c" style={{ maxWidth: "450px" }}>
              {t("A4hlacc")}
            </p>
            <button className="btn btn-normal" onClick={onClick}>
              {t("AxgWICf")}
            </button>
          </div>
        </div>
      </>
    );
  if (page === "muted-user")
    return (
      <>
        <div className="fit-container">
          <div className="fx-centered fx-col" style={{ height: "80vh" }}>
            <div
              className="bg-img contained-bg"
              style={{
                backgroundImage: `url(${HeroMutedUser})`,
                width: "500px",
                height: "280px",
              }}
            ></div>
            <h4>{t("AineCS4")}</h4>
            <p className="p-centered gray-c" style={{ maxWidth: "450px" }}>
              {t("Ao4Segq")}
            </p>
            <button className="btn btn-normal" onClick={onClick}>
              {t("AKELUbQ")}
            </button>
          </div>
        </div>
      </>
    );
  if (page === "unsupported")
    return (
      <>
        <div className="fit-container">
          <div className="fx-centered fx-col" style={{ height: "80vh" }}>
            <div
              className="bg-img contained-bg"
              style={{
                backgroundImage: `url(${HeroUnsupported})`,
                width: "500px",
                height: "280px",
              }}
            ></div>
            <h4>{t("AcFjmGe")}</h4>
          </div>
        </div>
      </>
    );
  if (page === "maintenance")
    return (
      <>
        <div className="fit-container">
          <div className="fx-centered fx-col" style={{ height: "80vh" }}>
            <div
              className="bg-img contained-bg"
              style={{
                backgroundImage: `url(${HeroMaintenance})`,
                width: "500px",
                height: "280px",
              }}
            ></div>
            <h4>{t("ACdkpXG")}</h4>
            <p className="gray-c p-centered" style={{ maxWidth: "500px" }}>
              {t("AmQnhHL")}
            </p>
          </div>
        </div>
      </>
    );
  if (page === "ai")
    return (
      <>
        <div className="fit-container">
          <div className="fx-centered fx-col" style={{ height: "80vh" }}>
            <div
              className="bg-img contained-bg"
              style={{
                backgroundImage: `url(${HeroAI})`,
                width: "500px",
                height: "280px",
              }}
            ></div>
            <h4>{t("AE9O5YE")}</h4>
            <p className="p-centered gray-c" style={{ maxWidth: "450px" }}>
              {t("AtQ0dJT")}
            </p>
          </div>
        </div>
      </>
    );
  if (page === "user-not-found")
    return (
      <>
        <div className="fit-container">
          <div className="fx-centered fx-col" style={{ height: "80vh" }}>
            <div
              className="fx-centered box-marg-s"
              style={{
                minWidth: "54px",
                minHeight: "54px",
                borderRadius: "var(--border-r-50)",
                backgroundColor: "var(--red-main)",
              }}
            >
              <div className="warning-24"></div>
            </div>
            <h4>{t("AawvPaR")}</h4>
          </div>
        </div>
      </>
    );
}
