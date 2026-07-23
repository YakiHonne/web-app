import React, { useEffect, useState } from "react";
import Lottie from "lottie-react";
import { useRouter } from "next/router";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import Spinner from "@/Components/Spinner";
import PagePlaceholder from "@/Components/PagePlaceholder";
import LoginWithAPI from "@/Components/LoginWithAPI";
import Icon from "@/Components/Icon";
import successJSON from "@/JSONs/success.json";
import { setToast } from "@/Store/Slides/Publishers";
import { getWorkshop, registerToWorkshop } from "@/Endpoints/Workshops";

const STATUS_LABELS = {
  upcoming: "Aa1Sg7o",
  live: "AMVmRrR",
  ended: "An2GM1i",
};

export default function WorkshopRegistration() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const userKeys = useSelector((state) => state.userKeys);
  const isConnectedToYaki = useSelector((state) => state.isConnectedToYaki);

  const [isLoaded, setIsLoaded] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [data, setData] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [showAPILogin, setShowAPILogin] = useState(false);
  const [justRegistered, setJustRegistered] = useState(false);

  const wid = router.query.wid;

  const fetchWorkshop = async () => {
    try {
      setIsLoaded(false);
      setNotFound(false);
      const res = await getWorkshop(wid);
      setData(res);
      setIsLoaded(true);
    } catch (err) {
      if (err?.response?.status === 404) setNotFound(true);
      setIsLoaded(true);
    }
  };

  useEffect(() => {
    if (!router.isReady) return;
    if (!wid) {
      setNotFound(true);
      setIsLoaded(true);
      return;
    }
    fetchWorkshop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.isReady, wid, userKeys, isConnectedToYaki]);

  const register = async () => {
    try {
      setIsRegistering(true);
      await registerToWorkshop(wid);
      setJustRegistered(true);
    } catch (err) {
      const status = err?.response?.status;
      const message = err?.response?.data?.message;
      dispatch(
        setToast({
          type: 2,
          desc: message || (status === 401 ? t("ANeWQTV") : t("A3iUgAD")),
        })
      );
      // Re-fetch so the page reflects the definitive backend state
      // (already registered here/elsewhere, or registration just closed).
      if (status === 409 || status === 403) fetchWorkshop();
    } finally {
      setIsRegistering(false);
    }
  };

  const Shell = ({ children }) => (
    <div className="fit-container fx-centered fx-start-h">
      <div style={{ width: "min(100%,1400px)" }} className="fx-centered fx-start-v">
        <div className="fx-centered fx-wrap box-pad-h main-middle">{children}</div>
      </div>
    </div>
  );

  if (!isLoaded)
    return (
      <Shell>
        <div className="fit-container fx-centered" style={{ height: "80vh" }}>
          <Spinner size={32} />
        </div>
      </Shell>
    );

  // Workshop doesn't exist / bad wid
  if (notFound || !data?.workshop)
    return (
      <Shell>
        <div className="fx-centered fx-col" style={{ height: "80vh" }}>
          <div className="round-icon" style={{ width: "64px", height: "64px" }}>
            <Icon name="warning" size={28} />
          </div>
          <h3 className="box-marg-s p-centered">{t("AZzIzKT")}</h3>
          <p className="p-centered gray-c" style={{ maxWidth: "450px" }}>
            {t("AQUunTD")}
          </p>
        </div>
      </Shell>
    );

  const { workshop, authenticated, eligible, registration_state } = data;

  // Not connected to Nostr at all → reuse the app's standard login prompt.
  const nostrConnected = userKeys && (userKeys.ext || userKeys.sec || userKeys.bunker);
  if (!nostrConnected)
    return (
      <Shell>
        <PagePlaceholder page="nostr-not-connected" />
      </Shell>
    );

  // Logged into Nostr but not connected to the yaki API → API-connect CTA.
  if (!authenticated)
    return (
      <>
        {showAPILogin && <LoginWithAPI exit={() => setShowAPILogin(false)} />}
        <Shell>
          <div className="fx-centered fx-col" style={{ height: "80vh" }}>
            <div className="round-icon" style={{ width: "64px", height: "64px" }}>
              <Icon name="user" size={28} />
            </div>
            <h3 className="box-marg-s p-centered">{t("AmWCI0f")}</h3>
            <p className="p-centered gray-c box-marg-s" style={{ maxWidth: "450px" }}>
              {t("A1BQc8y")}
            </p>
            <button className="btn btn-normal" onClick={() => setShowAPILogin(true)}>
              {t("ApdtHwe")}
            </button>
          </div>
        </Shell>
      </>
    );

  // Success right after registering, or already registered for THIS workshop
  if (justRegistered || registration_state === "registered_here")
    return (
      <Shell>
        <div
          className="fx-centered fx-col"
          style={{ height: "80vh", maxWidth: "500px" }}
        >
          <div style={{ maxHeight: "90px", maxWidth: "90px" }}>
            <Lottie animationData={successJSON} loop={false} />
          </div>
          <h3 className="p-centered">
            {justRegistered ? t("ARHNjDd") : t("AKYnati")}
          </h3>
          <p className="p-centered gray-c" style={{ maxWidth: "450px" }}>
            {justRegistered ? t("ASrwOa1") : t("AAlcW6A")}
          </p>
          {workshop.link && (
            <a
              href={workshop.link}
              target="_blank"
              rel="noopener noreferrer"
              className="fx-centered"
              style={{ marginTop: "16px" }}
            >
              <button className="btn btn-normal fx-centered">
                <Icon name="external_link" size={16} /> {t("AXGI2L0")}
              </button>
            </a>
          )}
        </div>
      </Shell>
    );

  // Already registered for ANOTHER workshop
  if (registration_state === "registered_elsewhere")
    return (
      <Shell>
        <div className="fx-centered fx-col" style={{ height: "80vh" }}>
          <div className="round-icon" style={{ width: "64px", height: "64px" }}>
            <Icon name="warning" size={28} />
          </div>
          <h3 className="box-marg-s p-centered">{t("AZsxLvg")}</h3>
          <p className="p-centered gray-c" style={{ maxWidth: "450px" }}>
            {t("A6vVcNY")}
          </p>
        </div>
      </Shell>
    );

  const canRegister =
    workshop.registration_open === true &&
    workshop.status !== "ended" &&
    eligible === true &&
    registration_state === "none";

  // Registration closed (deadline passed, admin closed it, or the workshop ended)
  // → centered full-page message, matching the "workshop not found" state.
  if (!canRegister)
    return (
      <Shell>
        <div className="fx-centered fx-col" style={{ height: "80vh" }}>
          <div className="round-icon" style={{ width: "64px", height: "64px" }}>
            <Icon name="warning" size={28} />
          </div>
          <h3 className="box-marg-s p-centered">{t("AWrD7J4")}</h3>
          <p className="p-centered gray-c" style={{ maxWidth: "450px" }}>
            {t("AjTrvbR")}
          </p>
        </div>
      </Shell>
    );

  return (
    <Shell>
      <div
        className="fx-centered fx-col box-pad-v"
        style={{ maxWidth: "600px", width: "100%", rowGap: "20px" }}
      >
        {workshop.cover_image && (
          <div
            className="bg-img cover-bg fit-container sc-s-18"
            style={{
              backgroundImage: `url(${workshop.cover_image})`,
              height: "220px",
            }}
          ></div>
        )}

        <div className="fit-container fx-centered fx-col fx-start-v" style={{ rowGap: "10px" }}>
          <div className="fx-centered fx-wrap">
            {STATUS_LABELS[workshop.status] && (
              <span
                className={`sticker sticker-small ${
                  workshop.status === "live"
                    ? "sticker-green"
                    : workshop.status === "ended"
                    ? "sticker-gray"
                    : "sticker-c1"
                }`}
              >
                {t(STATUS_LABELS[workshop.status])}
              </span>
            )}
            {workshop.registrations_count > 0 && (
              <span className="gray-c p-medium">
                {t("ArJBJ7U", { count: workshop.registrations_count })}
              </span>
            )}
          </div>

          <h2>{workshop.title}</h2>

          {workshop.description && (
            <p className="gray-c" style={{ whiteSpace: "pre-wrap" }}>
              {workshop.description}
            </p>
          )}
        </div>

        <button
          className="btn btn-normal btn-full fx-centered"
          onClick={register}
          disabled={isRegistering}
        >
          {isRegistering ? <Spinner /> : t("AeR0YfC")}
        </button>
      </div>
    </Shell>
  );
}
