import React, { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import Icon from "@/Components/Icon";
import Overlay from "@/Components/Overlay";
import Spinner from "@/Components/Spinner";
import UserProfilePic from "@/Components/UserProfilePic";
import useYakiChestConnect from "@/Hooks/useYakiChestConnect";
import { setToast } from "@/Store/Slides/Publishers";
import { minimizeKey } from "@/Helpers/Encryptions";
import { iconsNames } from "@/Content/IconV2URL";
import {
  getSubscriberBillingPortal,
  getSubscriberSubscriptions,
} from "@/Endpoints/Subscription";

const fmtDate = (ts, naLabel) => {
  if (!ts) return naLabel;
  return new Date(ts * 1000).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const fmtAmount = (amount, currency, locale) => {
  if (amount === null || amount === undefined) return "—";
  if (!currency) return amount ? `${amount}` : "—";
  if (currency.toLowerCase() === "sats") return `${amount} ${currency.toLowerCase()}`;
  try {
    return new Intl.NumberFormat(locale || undefined, {
      style: "currency",
      currency: currency.toUpperCase(),
    }).format(amount);
  } catch {
    return `${amount} ${currency.toUpperCase()}`;
  }
};

const DISPLAY_STATUS = {
  active: { key: "Amt1sHd", sticker: "sticker-green-side" },
  canceling: { key: "Amt1sHd", sticker: "sticker-orange-side" },
  canceled: { key: "AgR3uT4", sticker: "sticker-gray-gray" },
  expired: { key: "AgR3uT4", sticker: "sticker-gray-gray" },
  past_due: { key: "AVi5BAq", sticker: "sticker-red-side" },
  unpaid: { key: "AVi5BAq", sticker: "sticker-red-side" },
  incomplete: { key: "AVi5BAq", sticker: "sticker-red-side" },
};

const resolveStatus = (subscription) => {
  const displayStatus = subscription.display_status || subscription.status;
  if (DISPLAY_STATUS[displayStatus])
    return { ...DISPLAY_STATUS[displayStatus], name: displayStatus };
  return subscription.active
    ? { ...DISPLAY_STATUS.active, name: "active" }
    : { ...DISPLAY_STATUS.expired, name: "expired" };
};

const getLastPayment = (subscription) =>
  (subscription.history || []).reduce(
    (latest, entry) =>
      !latest || (entry.subscribed_at || 0) > (latest.subscribed_at || 0) ? entry : latest,
    null
  );

const getCreatorName = (profile, pubkey) =>
  profile?.display_name || profile?.name || minimizeKey(pubkey || "");

function SkeletonCard() {
  return (
    <div className="sub-card" style={{ display: "flex", flexDirection: "column", rowGap: "12px" }}>
      {[80, 60, 100].map((w, i) => (
        <div
          key={i}
          style={{
            width: `${w}%`,
            height: "14px",
            borderRadius: "8px",
            backgroundColor: "var(--dim-gray)",
            opacity: 0.4,
          }}
        />
      ))}
    </div>
  );
}

function UserRow({ pubkey, profile, children }) {
  return (
    <div
      className="fit-container round-corner-m border-all box-pad-h-m box-pad-v-m fx-scattered"
      style={{ columnGap: "16px" }}
    >
      <div className="fx-centered fx-start-h" style={{ columnGap: "12px", minWidth: 0 }}>
        <UserProfilePic size={42} img={profile?.picture} user_id={pubkey} />
        <div className="fx-col fx-start-v" style={{ gap: "2px", minWidth: 0 }}>
          <p className="p-bold p-one-line">{getCreatorName(profile, pubkey)}</p>
          {profile?.name && <p className="gray-c p-one-line">@{profile.name}</p>}
        </div>
      </div>
      {children}
    </div>
  );
}

function StatusSticker({ subscription }) {
  const { t } = useTranslation();
  const status = resolveStatus(subscription);
  return <div className={`sticker sticker-big ${status.sticker}`}>{t(status.key)}</div>;
}

function PaymentMeta({ entry }) {
  const isLightning =
    entry.provider === "lightning" || entry.payment_method === "lightning";
  const method = isLightning ? "lightning" : entry.payment_method;
  if (!method) return null;
  return (
    <div
      className={`sticker sticker-big ${isLightning ? "sticker-orange-side" : "sticker-blue-side"}`}
    >
      {method}
    </div>
  );
}

function PaymentRow({ entry, creator }) {
  const { t, i18n } = useTranslation();
  const paid = entry.status === "paid";
  return (
    <div className="fit-container round-corner-m border-all box-pad-h-m box-pad-v-m fx-col">
      <div className="fit-container fx-scattered" style={{ columnGap: "16px" }}>
        <div className="fx-col fx-start-v" style={{ gap: "2px", minWidth: 0 }}>
          <p className="p-bold p-big p-one-line">
            {fmtAmount(entry.amount, entry.currency, i18n.language)}
          </p>
          <p className="gray-c p-one-line">{fmtDate(entry.subscribed_at, t("AvGdwjI"))}</p>
        </div>
        <div className="fx-centered fx-end-h" style={{ columnGap: "10px", flexShrink: 0 }}>
          <PaymentMeta entry={entry} />
          <div
            className={`sticker sticker-big ${paid ? "sticker-green-side" : "sticker-red-side"}`}
          >
            {paid ? t("AAg9D6c") : t("AOxW08J")}
          </div>
          {entry.hosted_invoice_url && (
            <a href={entry.hosted_invoice_url} target="_blank" rel="noreferrer">
              <button className="btn btn-gray btn-small">{t("AYO6i7Y")}</button>
            </a>
          )}
        </div>
      </div>
      {creator && (
        <>
          <div
            className="fit-container"
            style={{ borderTop: "1px solid var(--pale-gray)", margin: "14px 0" }}
          />
          <div className="fit-container fx-centered fx-start-h" style={{ columnGap: "8px" }}>
            <p className="gray-c">{t("ABV6ffy")}</p>
            <UserProfilePic size={24} img={creator.profile?.picture} user_id={creator.pubkey} />
            <p className="p-one-line">{getCreatorName(creator.profile, creator.pubkey)}</p>
          </div>
        </>
      )}
    </div>
  );
}

function ManageOverlay({ subscription, onClose }) {
  const { t, i18n } = useTranslation();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const history = subscription.history || [];
  const lastPayment = getLastPayment(subscription);
  const creatorName = getCreatorName(subscription.creator_profile, subscription.creator_pubkey);
  const showBillingPortal = subscription.has_stripe && lastPayment?.provider === "stripe";
  const status = resolveStatus(subscription);

  const openPortal = async () => {
    setLoading(true);
    try {
      const data = await getSubscriberBillingPortal({
        creator_pubkey: subscription.creator_pubkey,
        return_url: typeof window !== "undefined" ? window.location.href : undefined,
      });
      if (data?.url) window.location.href = data.url;
      else setLoading(false);
    } catch (err) {
      dispatch(setToast({ type: 2, desc: err?.response?.data?.error || t("AKxHz6k") }));
      setLoading(false);
    }
  };

  return (
    <Overlay exit={onClose} width={560}>
      <div className="fx-centered fx-col fx-start-v box-pad-h box-pad-v" style={{ rowGap: "24px" }}>
        <div className="fit-container fx-centered fx-end-h" style={{ marginBottom: "-16px" }}>
          <div className="round-icon-tooltip" data-tooltip={t("Ais0q3D")} onClick={onClose}>
            <Icon name={iconsNames.close_sm} size={18} v={2} />
          </div>
        </div>

        <div className="fit-container fx-centered fx-col" style={{ rowGap: "12px" }}>
          <UserProfilePic
            size={72}
            img={subscription.creator_profile?.picture}
            user_id={subscription.creator_pubkey}
          />
          <h4 className="p-centered">{creatorName}</h4>
          <StatusSticker subscription={subscription} />
        </div>

        <div className="fit-container fx-col" style={{ rowGap: "18px" }}>
          <div className="fit-container fx-scattered">
            <p className="gray-c">{t("AcDgXKI")}</p>
            <p className="p-bold p-big">
              {fmtAmount(subscription.amount, subscription.currency, i18n.language)}
            </p>
          </div>
          <div className="fit-container fx-scattered">
            <p className="gray-c">{t("ArUKrGp")}</p>
            <p>{fmtDate(subscription.last_subscription, t("AvGdwjI"))}</p>
          </div>
          {status.name === "active" && subscription.next_subscription && (
            <div className="fit-container fx-scattered">
              <p className="gray-c">{t("AMHtfN5")}</p>
              <p>{fmtDate(subscription.next_subscription, t("AvGdwjI"))}</p>
            </div>
          )}
          {status.name === "canceling" && subscription.cancel_at && (
            <div className="fit-container fx-scattered">
              <p className="gray-c">{t("AmikACu")}</p>
              <p className="orange-c">
                {t("Am6X1Yl", { date: fmtDate(subscription.cancel_at, t("AvGdwjI")) })}
              </p>
            </div>
          )}
          {lastPayment && (
            <div className="fit-container fx-scattered">
              <p className="gray-c">{t("A0SiY0R")}</p>
              <PaymentMeta entry={lastPayment} />
            </div>
          )}
        </div>

        {showBillingPortal && (
          <button className="btn btn-gray btn-full" onClick={openPortal} disabled={loading}>
            {loading ? <Spinner /> : t("AW1X59p")}
          </button>
        )}

        <div className="fit-container fx-centered fx-col fx-start-v" style={{ rowGap: "12px" }}>
          <h4>{t("AwL4Oin")}</h4>
          {history.length === 0 ? (
            <div className="fit-container fx-centered box-pad-v"><p className="gray-c">{t("AvGdwjI")}</p></div>
          ) : (
            <div className="fit-container fx-centered fx-col" style={{ rowGap: "12px" }}>
              {history.map((entry, i) => (
                <PaymentRow key={entry.invoice_id || i} entry={entry} />
              ))}
            </div>
          )}
        </div>
      </div>
    </Overlay>
  );
}

function CreatorRow({ subscription, onManage }) {
  const { t } = useTranslation();
  const status = resolveStatus(subscription);
  const ending = status.name === "canceling" && subscription.cancel_at;
  const endDate = ending
    ? subscription.cancel_at
    : status.name === "active" && subscription.next_subscription;
  return (
    <UserRow
      pubkey={subscription.creator_pubkey}
      profile={subscription.creator_profile}
    >
      <div className="fx-centered fx-end-h" style={{ columnGap: "10px", flexShrink: 0 }}>
        {endDate ? (
          <p className={ending ? "orange-c p-one-line" : "gray-c p-one-line"}>
            {ending
              ? t("Am6X1Yl", { date: fmtDate(endDate, t("AvGdwjI")) })
              : `${t("AMHtfN5")} ${fmtDate(endDate, t("AvGdwjI"))}`}
          </p>
        ) : null}
        <StatusSticker subscription={subscription} />
        <button className="btn btn-gray btn-small" onClick={() => onManage(subscription)}>
          {t("AW1X59p")}
        </button>
      </div>
    </UserRow>
  );
}

export default function CreatorsSubscriptionsPage() {
  const { t } = useTranslation();
  const isConnectedToYaki = useSelector((state) => state.isConnectedToYaki);
  const { connect: connectToYaki, isConnecting } = useYakiChestConnect();
  const [subscriptions, setSubscriptions] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [selected, setSelected] = useState(null);
  const selectedSubscription = selected
    ? subscriptions.find((_) => _.creator_pubkey === selected) || null
    : null;

  const fetch = useCallback(async (silent = false) => {
    if (!silent) {
      setLoading(true);
      setError(false);
    }
    try {
      const data = await getSubscriberSubscriptions();
      setSubscriptions(data?.subscriptions || []);
      setPayments(data?.payments || []);
      setError(false);
    } catch {
      if (!silent) setError(true);
    } finally {
      if (!silent) setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isConnectedToYaki) fetch();
  }, [isConnectedToYaki, fetch]);

  useEffect(() => {
    if (!isConnectedToYaki) return;
    const refresh = () => {
      if (document.visibilityState === "visible") fetch(true);
    };
    window.addEventListener("focus", refresh);
    document.addEventListener("visibilitychange", refresh);
    return () => {
      window.removeEventListener("focus", refresh);
      document.removeEventListener("visibilitychange", refresh);
    };
  }, [isConnectedToYaki, fetch]);

  return (
    <>
      <div
        className="fx-centered fx-col fx-start-v"
        style={{ maxWidth: 720, margin: "0 auto", padding: "24px 16px 48px", rowGap: "32px" }}
      >
        {!isConnectedToYaki ? (
          <div className="sub-card fx-centered fx-col" style={{ rowGap: "20px", textAlign: "center" }}>
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: "50%",
                backgroundColor: "rgba(247,88,22,0.1)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Icon name="cup" size={28} />
            </div>
            <div style={{ display: "flex", flexDirection: "column", rowGap: "8px" }}>
              <h4>{t("AxxV7ZQ")}</h4>
              <p className="gray-c p-centered">{t("AvvW4bY")}</p>
            </div>
            <button className="btn btn-normal" onClick={connectToYaki} disabled={isConnecting}>
              {isConnecting ? <Spinner /> : t("AdimVMk")}
            </button>
          </div>
        ) : loading ? (
          <>
            <SkeletonCard />
            <SkeletonCard />
          </>
        ) : error ? (
          <div className="sub-card fx-centered fx-col" style={{ rowGap: "12px" }}>
            <Icon name="warning" size={32} />
            <p className="gray-c p-centered">{t("AKxHz6k")}</p>
            <button className="btn btn-gst" onClick={fetch}>
              {t("AcdxgMi")}
            </button>
          </div>
        ) : subscriptions.length === 0 && payments.length === 0 ? (
          <div
            className="fit-container fx-centered fx-col"
            style={{ rowGap: "16px", minHeight: "60vh" }}
          >
            <Icon name="crown" size={64} />
            <h3 className="p-centered">{t("AC8k2xO")}</h3>
            <p className="gray-c p-centered" style={{ maxWidth: "420px" }}>
              {t("Atx65xp")}
            </p>
          </div>
        ) : (
          <>
            <div className="fit-container fx-centered fx-col fx-start-v" style={{ rowGap: "14px" }}>
              <h4>{t("Az3laUH")}</h4>
              {subscriptions.length === 0 ? (
                <div className="fit-container fx-centered box-pad-v"><p className="gray-c">{t("AvGdwjI")}</p></div>
              ) : (
                <div className="fit-container fx-centered fx-col" style={{ rowGap: "12px" }}>
                  {subscriptions.map((subscription) => (
                    <CreatorRow
                      key={subscription.creator_pubkey}
                      subscription={subscription}
                      onManage={(_) => setSelected(_.creator_pubkey)}
                    />
                  ))}
                </div>
              )}
            </div>

            <div className="fit-container fx-centered fx-col fx-start-v" style={{ rowGap: "14px" }}>
              <h4>{t("AwL4Oin")}</h4>
              {payments.length === 0 ? (
                <div className="fit-container fx-centered box-pad-v"><p className="gray-c">{t("AvGdwjI")}</p></div>
              ) : (
                <div className="fit-container fx-centered fx-col" style={{ rowGap: "12px" }}>
                  {payments.map((entry, i) => (
                    <PaymentRow
                      key={entry.invoice_id || `${entry.creator_pubkey}-${i}`}
                      entry={entry}
                      creator={{
                        pubkey: entry.creator_pubkey,
                        profile: entry.creator_profile,
                        name: getCreatorName(entry.creator_profile, entry.creator_pubkey),
                      }}
                    />
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {selectedSubscription && (
        <ManageOverlay
          subscription={selectedSubscription}
          onClose={() => setSelected(null)}
        />
      )}
    </>
  );
}
