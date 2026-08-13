import React, { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import Icon from "@/Components/Icon";
import Overlay from "@/Components/Overlay";
import Spinner from "@/Components/Spinner";
import UpgradeOverlay from "@/Components/UpgradeOverlay";
import useSubscription from "@/Hooks/useSubscription";
import useYakiChestConnect from "@/Hooks/useYakiChestConnect";
import useUsage from "@/Hooks/useUsage";
import useLightningWallets from "@/Hooks/useLightningWallets";
import LightningWalletsSelect from "@/Components/LightningWalletsSelect";
import usePoints from "@/Hooks/usePoints";
import useRedeemCodes from "@/Hooks/useRedeemCodes";
import { getPlans, openBillingPortal } from "@/Endpoints/Subscription";
import { useDispatch } from "react-redux";
import { setToast } from "@/Store/Slides/Publishers";
import { copyText, createLightningInvoice } from "@/Helpers/Helpers";
import { iconsNames } from "@/Content/IconV2URL";
import ProgressBar from "@/Components/ProgressBar";
import { SelectTabs } from "@/Components/SelectTabs";
import NumberShrink from "@/Components/NumberShrink";
import { useTranslation } from "react-i18next";

const fmtDate = (ts, naLabel) => {
  if (!ts) return naLabel;
  return new Date(ts * 1000).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
};

const fmtResetIn = (ts, t) => {
  if (!ts) return null;
  const diffMs = ts * 1000 - Date.now();
  if (diffMs <= 0) return t("ACQpwGH");
  const minutes = Math.round(diffMs / 60000);
  if (minutes < 60) return t("APwGSMO", { count: minutes });
  const hours = Math.round(diffMs / 3600000);
  if (hours < 24) return t("AeDw1O8", { count: hours });
  const days = Math.round(diffMs / 86400000);
  return t("AUrDmZm", { count: days });
};

const planOrder = (plans, id) => plans.findIndex((p) => p.id === id);

function PlanBadge({ plan }) {
  const styles = {
    free: { bg: "rgba(255,255,255,0.06)", color: "var(--gray-main)" },
    basic: { bg: "rgba(247,88,22,0.12)", color: "var(--c1)" },
    premium: { bg: "rgba(105,123,216,0.15)", color: "#697BD8" },
  };
  const s = styles[plan] || styles.free;
  return (
    <span style={{ backgroundColor: s.bg, color: s.color, textTransform: "capitalize", border: `1px solid ${s.color}33`, borderRadius: "999px", padding: "2px 12px", fontSize: "0.8rem", fontWeight: 600 }}>
      {plan}
    </span>
  );
}

function PaymentMethodIcon({ method }) {
  const { t } = useTranslation();
  if (method === "lightning") return <span style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}><Icon name="bolt" size={18} /><span>{t("AnX8qpd")}</span></span>;
  if (method === "stripe" || method === "airwallex") return <span style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}><Icon name="wallet" size={18} /><span>{t("AKSZkTI")}</span></span>;
  if (method === "points") return <span style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}><Icon name="cup" size={18} /><span>{t("A4IGG0z")}</span></span>;
  return <span className="gray-c">—</span>;
}

function SkeletonCard() {
  return (
    <div className="sub-card" style={{ display: "flex", flexDirection: "column", rowGap: "12px" }}>
      {[80, 60, 100].map((w, i) => (
        <div key={i} style={{ width: `${w}%`, height: "14px", borderRadius: "8px", backgroundColor: "var(--dim-gray)", opacity: 0.4 }} />
      ))}
    </div>
  );
}

const USAGE_ORDER = ["chat-articles", "second-reader", "energy-mapper", "translate-lt", "wallet-creation", "redeem-codes"];

function UsageRow({ item, onUpgrade }) {
  const { t } = useTranslation();
  const { label, period_type, limit, percentage, reset_at } = item;
  const isUnlimited = limit === -1;
  const isLocked = limit === 0;
  const resetText = !isUnlimited && (period_type === "weekly" || period_type === "daily") ? fmtResetIn(reset_at, t) : null;

  return (
    <div className="fit-container fx-centered fx-col fx-start-v" style={{ rowGap: "10px" }}>
      <div className="fit-container fx-scattered">
        <p style={{ fontWeight: 600 }}>{label}</p>
        {isUnlimited ? (
          <span className="gray-c p-medium">{t("AUlM6c3")}</span>
        ) : isLocked ? null : (
          <span className="gray-c p-medium">{t("AnJK4iL", { percentage })}</span>
        )}
      </div>

      {isLocked ? (
        <div className="fit-container fx-scattered round-corner  box-pad-v-s">
          <div className="fx-centered fx-start-h" style={{ columnGap: "8px" }}>
            <Icon name={iconsNames.lock} v={2} opacity=".5" size={20} />
            <p className="gray-c">{t("AHPptdT")}</p>
          </div>
          <button className="btn btn-normal btn-small" onClick={onUpgrade}>{t("AGo17y4")}</button>
        </div>
      ) : isUnlimited ? null : (
        <ProgressBar percentage={percentage} full />
      )}

      {resetText && !isLocked && (
        <div className="fx-centered" style={{ columnGap: "6px" }}>
          <Icon name={iconsNames.clock} size={14} />
          <span className="gray-c p-medium">{resetText}</span>
        </div>
      )}
    </div>
  );
}

function RedeemAddressOverlay({ onClose, onSubmit, loading }) {
  const { t } = useTranslation();
  const [lightningAddr, setLightningAddr] = useState("");
  const [validating, setValidating] = useState(false);
  const { wallets, setWallets, selectedWallet, setSelectedWallet } = useLightningWallets();
  const savedWallets = wallets.filter((wallet) => wallet.kind !== 1);

  const handleSelectWallet = (wallet) => {
    setSelectedWallet(wallet);
    setLightningAddr(wallet.entitle);
  };

  const handleSubmit = async () => {
    setValidating(true);
    try {
      const invoice = await createLightningInvoice({ amount: 1, message: "", recipientAddr: lightningAddr });
      if (!invoice) {
        setValidating(false);
        return;
      }
      setValidating(false);
      onSubmit(lightningAddr);
    } catch (err) {
      console.log(err);
      setValidating(false);
    }
  };

  return (
    <Overlay exit={onClose} width={420}>
      <div className="fx-centered fx-col box-pad-h box-pad-v" style={{ rowGap: "16px" }}>
        <h4>{t("Apts005")}</h4>
        {savedWallets.length > 0 && (
          <LightningWalletsSelect
            label={t("ARXDO1q")}
            selectedWallet={selectedWallet}
            setSelectedWallet={handleSelectWallet}
            wallets={savedWallets}
            setWallets={setWallets}
          />
        )}
        {savedWallets.length > 0 && <p className="gray-c p-medium p-centered">{t("Ax46s4g")}</p>}
        <input
          type="text"
          className="if ifs-full"
          placeholder={t("A40BuYB")}
          value={lightningAddr}
          onChange={(e) => setLightningAddr(e.target.value?.toLowerCase())}
        />
        <button
          className="btn btn-normal btn-full"
          disabled={!lightningAddr || loading || validating}
          onClick={handleSubmit}
        >
          {loading || validating ? <Spinner /> : t("Apts014")}
        </button>
      </div>
    </Overlay>
  );
}

function CodeRow({ item, onUseNow }) {
  const { t } = useTranslation();
  const isRedeemed = item.status && item.preImage;
  const isPending = item.status && !item.preImage;
  const isUnused = !item.status;

  return (
    <div className="fit-container fx-scattered sc-s box-pad-h-m box-pad-v-s">
      <div className="fx-centered fx-col fx-start-v" style={{ rowGap: "4px" }}>
        <p className="p-big">{item.code}</p>
        <span className="gray-c p-medium">
          {t("Apts018")} <NumberShrink value={item.amount} /> {t("A8ck81V")}
          {" · "}
          {isRedeemed ? t("Apts003") : isPending ? t("Apts004") : t("Apts002")}
        </span>
      </div>
      <div className="fx-centered" style={{ columnGap: "8px" }}>
        {isUnused && (
          <button className="btn btn-normal btn-small" onClick={() => onUseNow(item.code)}>{t("Apts005")}</button>
        )}
        <button className="btn btn-gst btn-small" onClick={() => copyText(item.code, t("AwszVHZ"))}>{t("Anwd2wT")}</button>
      </div>
    </div>
  );
}

function MyCodesSection({ redeemCooldownActive, redeemResetText, refreshUsage }) {
  const { t } = useTranslation();
  const { codes, loading, fetch, requesting, requestCode, redeeming, redeem } = useRedeemCodes();
  const { config, fetchConfig, refreshBalance } = usePoints();
  const consumablePoints = useSelector((state) => state.yakiChestStats?.consumablePoints);
  const [activeCode, setActiveCode] = useState(null);

  useEffect(() => {
    fetch();
    fetchConfig();
    refreshBalance();
  }, [fetch, fetchConfig, refreshBalance]);

  const redeemCodeCost = config?.redeem_code?.cost;
  const noLimit = config?.redeem_code?.limit === 0;
  const insufficientPoints = typeof redeemCodeCost === "number" && typeof consumablePoints === "number" && consumablePoints < redeemCodeCost;
  const requestDisabled = noLimit || insufficientPoints || redeemCooldownActive || requesting;

  const tooltip = noLimit
    ? t("Apts009")
    : insufficientPoints
      ? t("Apts008")
      : redeemCooldownActive
        ? t("Apts007")
        : undefined;

  const refreshAfterRequest = async () => {
    await refreshBalance();
    if (refreshUsage) await refreshUsage();
  };

  const handleRedeem = async (lightning_address) => {
    const ok = await redeem({ code: activeCode, lightning_address }, refreshAfterRequest);
    if (ok) setActiveCode(null);
  };

  return (
    <div className="fit-container fx-centered fx-col fx-start-v" style={{ rowGap: "16px" }}>
      {activeCode && (
        <RedeemAddressOverlay
          onClose={() => setActiveCode(null)}
          onSubmit={handleRedeem}
          loading={redeeming}
        />
      )}
      <div className="fit-container fx-centered fx-col fx-start-v" style={{ rowGap: "8px" }}>
        <div className="fit-container fx-scattered">
          <h4>{t("Apts001")}</h4>
          <button
            className={`btn ${requestDisabled ? "btn-disabled" : "btn-gst"}`}
            disabled={requestDisabled}
            data-tooltip={tooltip}
            onClick={() => requestCode(refreshAfterRequest)}
          >
            {requesting ? (
              <Spinner />
            ) : (
              <>{t("Apts006")} {typeof redeemCodeCost === "number" && <NumberShrink value={redeemCodeCost} />} {t("A4IGG0z")}</>
            )}
          </button>
        </div>
        {redeemCooldownActive && redeemResetText && (
          <p className="gray-c p-medium">{redeemResetText}</p>
        )}
      </div>
      {loading ? (
        <Spinner />
      ) : (
        codes.map((item, i) => (
          <CodeRow key={item.code || i} item={item} onUseNow={setActiveCode} />
        ))
      )}
    </div>
  );
}

function UsageView({ onUpgrade }) {
  const { t } = useTranslation();
  const { usage, loading, error, fetch } = useUsage();

  useEffect(() => {
    fetch();
  }, [fetch]);

  if (loading) {
    return <><SkeletonCard /><SkeletonCard /><SkeletonCard /></>;
  }

  if (error) {
    return (
      <div className="sub-card fx-centered fx-col" style={{ rowGap: "12px" }}>
        <Icon name="warning" size={32} />
        <p className="gray-c p-centered">{t("AOE8oDg")}</p>
        <button className="btn btn-gst" onClick={fetch}>{t("AcdxgMi")}</button>
      </div>
    );
  }

  if (!usage) return null;

  const entries = USAGE_ORDER
    .map((key) => usage.usage?.[key] && { key, ...usage.usage[key] })
    .filter(Boolean);

  const redeemCodesUsage = usage.usage?.["redeem-codes"];
  const redeemCooldownActive = !!redeemCodesUsage && redeemCodesUsage.limit > 0 && redeemCodesUsage.used >= redeemCodesUsage.limit;
  const redeemMonthlyCapActive = !!redeemCodesUsage && redeemCodesUsage.monthly_limit > 0 && redeemCodesUsage.monthly_used >= redeemCodesUsage.monthly_limit;
  const redeemResetText = redeemMonthlyCapActive
    ? fmtResetIn(redeemCodesUsage.monthly_reset_at, t)
    : redeemCooldownActive
      ? fmtResetIn(redeemCodesUsage.reset_at, t)
      : null;

  return (
    <div className="sub-card fx-centered fx-col fx-start-v" style={{ rowGap: "24px" }}>
      <div className="fit-container fx-scattered">
        <h4>{t("AOrYFC7")}</h4>
        <PlanBadge plan={usage.plan || "free"} />
      </div>
      {entries.map((item, i) => (
        <React.Fragment key={item.key}>
          {i > 0 && <div className="fit-container" style={{ borderTop: "1px solid var(--dim-gray)" }} />}
          <UsageRow item={item} onUpgrade={onUpgrade} />
        </React.Fragment>
      ))}
      <div className="fit-container" style={{ borderTop: "1px solid var(--dim-gray)" }} />
      <MyCodesSection
        redeemCooldownActive={redeemCooldownActive || redeemMonthlyCapActive}
        redeemResetText={redeemResetText}
        refreshUsage={fetch}
      />
    </div>
  );
}

function CancelConfirmModal({ endDate, onConfirm, onClose, loading }) {
  const { t } = useTranslation();
  return (
    <Overlay exit={onClose} width={440}>
      <div className="fx-centered fx-col box-pad-h box-pad-v" style={{ rowGap: "16px" }}>
        <div style={{ width: 48, height: 48, borderRadius: "50%", backgroundColor: "rgba(239,68,68,0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Icon name="warning" size={22} />
        </div>
        <h4 className="p-centered">{t("AZ7QZK4")}</h4>
        <p className="gray-c p-centered">{t("AG0J3LL", { date: endDate })}</p>
        <div className="fit-container fx-centered" style={{ columnGap: "12px" }}>
          <button className="btn btn-gst fit-container" onClick={onClose}>{t("AlYjdXR")}</button>
          <button className="btn btn-red fit-container" onClick={onConfirm} disabled={loading}>{loading ? <Spinner /> : t("AsZQ11Q")}</button>
        </div>
      </div>
    </Overlay>
  );
}

function RedeemSubscriptionButton({ plan, eligibility, config, redeemingPlan, onRedeem }) {
  const { t } = useTranslation();
  const isEligible = !!eligibility?.[plan.id]?.eligible;
  const isLoading = redeemingPlan === plan.id;
  const cost = config?.subscription?.[plan.id];

  if (!isEligible) return null;

  return (
    <button
      className="btn btn-gst btn-full"
      style={{ height: "auto", minHeight: "var(--40)", whiteSpace: "normal", textAlign: "center", padding: "8px 16px" }}
      disabled={isLoading}
      onClick={() => onRedeem(plan.id)}
    >
      {isLoading ? (
        <Spinner />
      ) : (
        <>{t("Apts010")} {typeof cost === "number" && <NumberShrink value={cost} />} {t("A4IGG0z")}</>
      )}
    </button>
  );
}

function CurrentPlanCard({ status, onCancel, onResume, cancelling, resuming, onUpgrade }) {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [openingPortal, setOpeningPortal] = useState(false);
  const isStripeActive = ["stripe", "airwallex"].includes(status.last_payment_method) && status.active;
  // The billing portal is Stripe-only (airwallex is excluded).
  const isStripePortal = status.last_payment_method === "stripe" && status.active;
  const isFree = !status.plan || status.plan === "free";

  const handleOpenPortal = async () => {
    if (openingPortal) return;
    setOpeningPortal(true);
    try {
      await openBillingPortal();
    } catch (err) {
      const message = err?.response?.data?.message;
      const desc =
        message === "not_a_stripe_subscriber"
          ? t("AwJcN0R")
          : message === "no_stripe_customer"
            ? t("AqHTtA4")
            : t("AFeQkYJ");
      dispatch(setToast({ type: 2, desc }));
    } finally {
      setOpeningPortal(false);
    }
  };

  return (
    <>
      {showCancelModal && (
        <CancelConfirmModal
          endDate={fmtDate(status.next_subscription, t("AvGdwjI"))}
          loading={cancelling}
          onClose={() => setShowCancelModal(false)}
          onConfirm={async () => { await onCancel(); setShowCancelModal(false); }}
        />
      )}
      <div className="sub-card fx-centered fx-col" style={{ rowGap: "14px" }}>
        <div className="fit-container fx-scattered">
          <h4>{t("AwtJ5HS")}</h4>
          <PlanBadge plan={status.plan || "free"} />
        </div>

        {status.in_trial && (
          <div
            className="fit-container round-corner-m box-pad-h-m box-pad-v-m fx-scattered sc-s"
            style={{ gap: "12px" }}
          >
            <div style={{ display: "flex", flexDirection: "column", rowGap: "2px" }}>
              <p style={{ fontWeight: 600 }}>{t("Aoiqy17")}</p>
              <p className="gray-c p-medium">{t("Am6X1Yl", { date: fmtDate(status.trial_ends_at, t("AvGdwjI")) })}</p>
            </div>
            <button className="btn btn-normal" style={{ flexShrink: 0 }} onClick={onUpgrade}>
              {t("AGo17y4")}
            </button>
          </div>
        )}

        {status.cancel_at_period_end && (
          <div className="fit-container round-corner fx-centered box-pad-h-m box-pad-v-s" style={{ backgroundColor: "rgba(247,88,22,0.08)", border: "1px solid var(--c1)" }}>
            <p style={{ color: "var(--c1)" }}>{t("AOvUPSY", { date: fmtDate(status.next_subscription, t("AvGdwjI")) })}</p>
          </div>
        )}

        {!status.cancel_at_period_end && status.active && status.next_subscription > 0 && (
          <div className="fit-container fx-scattered">
            <p className="gray-c">{t("AfLR6HA")}</p>
            <p>{fmtDate(status.next_subscription, t("AvGdwjI"))}</p>
          </div>
        )}

        {status.last_payment_method_display && (
          <div className="fit-container fx-scattered">
            <p className="gray-c">{t("A0SiY0R")}</p>
            <div className="fx-centered" style={{ columnGap: "8px" }}>
              {isStripePortal && (
                <button
                  className="btn btn-gray btn-small"
                  onClick={handleOpenPortal}
                  disabled={openingPortal}
                >
                  {openingPortal ? <Spinner /> : t("AW1X59p")}
                </button>
              )}
              <PaymentMethodIcon method={status.last_payment_method_display} />
            </div>
          </div>
        )}

        {status.last_subscription > 0 && status.history?.length > 0 && (
          <div className="fit-container fx-scattered">
            <p className="gray-c">{t("A6YH5Fa")}</p>
            <p>{fmtDate(status.last_subscription, t("AvGdwjI"))}</p>
          </div>
        )}

        {isFree && (
          <button className="btn btn-normal btn-full" onClick={onUpgrade}>{t("Aqc63x1")}</button>
        )}

        {isStripeActive && (
          <>
            <div className="fit-container" style={{ borderTop: "1px solid var(--dim-gray)" }} />
            {status.cancel_at_period_end ? (
              <div className="fit-container fx-centered fx-col" style={{ rowGap: "8px" }}>
                <p className="gray-c p-centered p-medium">{t("A0TlKu7", { date: fmtDate(status.next_subscription, t("AvGdwjI")) })}</p>
                <button className="btn btn-normal btn-full" onClick={onResume} disabled={resuming}>{resuming ? <Spinner /> : t("APugHtt")}</button>
              </div>
            ) : (
              <div className="fit-container fx-centered fx-col" style={{ rowGap: "8px" }}>
                <button className="btn btn-red btn-full" onClick={() => setShowCancelModal(true)} disabled={cancelling}>{cancelling ? <Spinner /> : t("AL0OUiB")}</button>
                <p className="gray-c p-centered p-medium">{t("AMPyR2N")}</p>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}

function PendingChangeCard({ status, onCancelChange, cancellingChange }) {
  const { t } = useTranslation();
  if (!status.pending_plan) return null;
  return (
    <div className="sub-card fx-centered fx-col" style={{ rowGap: "12px", border: "1px solid var(--c1)" }}>
      <div className="fit-container fx-scattered">
        <h4>{t("Amuehyf")}</h4>
        <PlanBadge plan={status.pending_plan} />
      </div>
      <div className="fit-container fx-centered fx-col" style={{ rowGap: "6px" }}>
        <div className="fit-container fx-scattered">
          <p className="gray-c">{t("AFX6uFu")}</p>
          <div className="fx-centered" style={{ columnGap: "6px" }}>
            <PlanBadge plan={status.plan} /><span className="gray-c">→</span><PlanBadge plan={status.pending_plan} />
          </div>
        </div>
        <div className="fit-container fx-scattered"><p className="gray-c">{t("AEj8km4")}</p><p>{fmtDate(status.next_subscription, t("AvGdwjI"))}</p></div>
        <div className="fit-container fx-scattered"><p className="gray-c">{t("AQNxYoD")}</p><p>{fmtDate(status.pending_plan_since, t("AvGdwjI"))}</p></div>
      </div>
      <button className="btn btn-gst btn-full" onClick={onCancelChange} disabled={cancellingChange}>{cancellingChange ? <Spinner /> : t("AJxtluP")}</button>
    </div>
  );
}

function ActionsCard({ plans, status, onChangePlan, changingPlan, eligibility, pointsConfig, redeemingPlan, onRedeemSubscription }) {
  const { t } = useTranslation();
  if (!["stripe", "airwallex"].includes(status.last_payment_method) || !status.active) return null;

  const hasPending = !!status.pending_plan;
  const currentPlanIdx = planOrder(plans, status.plan);

  return (
    <div className="sub-card fx-centered fx-col fx-start-v" style={{ rowGap: "16px" }}>
      <h4>{t("AuxUqLK")}</h4>
      <div className="fit-container fx-centered fx-stretch" style={{ gap: "12px", alignItems: "stretch" }}>
        {plans.map((plan, planIdx) => {
          const isHighlighted = planIdx === plans.length - 1;
          const isCurrent = plan.id === status.plan;
          const isUpgrade = planOrder(plans, plan.id) > currentPlanIdx;
          const isLoading = changingPlan === plan.id;
          return (
            <div key={plan.id} className="sub-plan-card bg-dropdown" style={isCurrent ? { outline: "1px solid var(--c1)", outlineOffset: "-1px" } : {}}>
              {isCurrent && (
                <div style={{ position: "absolute", top: 14, right: 16 }}>
                  <span style={{ fontWeight: 700, fontSize: "0.72rem", color: "var(--c1)", background: "rgba(247,88,22,0.12)", borderRadius: "999px", padding: "2px 10px" }}>{t("A8wDj0f")}</span>
                </div>
              )}
              <div>
                <div className="sub-plan-name">{plan.name}</div>
                <div className="sub-plan-price-row">
                  <span className="sub-plan-amount">${plan.usd_price}</span>
                  <span className="gray-c" style={{ fontSize: "0.875rem" }}> / month</span>
                </div>
                <p style={{ fontSize: "0.78rem", color: "var(--c1)", fontWeight: 600 }}>~{plan.sats_price?.toLocaleString()} {t("AUQUggV")}</p>
              </div>
              <div className="sub-plan-divider" />
              <ul className="sub-plan-features">
                {(plan.perks ?? []).map((perk, i) => (
                  <li key={i} className="sub-plan-feature">
                    <Icon v={2} name={iconsNames.check} isBoldThemeColor={true} />
                    {perk}
                  </li>
                ))}
              </ul>
              <button
                className={`btn ${isHighlighted ? "btn-normal" : "btn-gst"} btn-full`}
                style={{ opacity: isCurrent || (hasPending && !isCurrent) ? 0.5 : 1 }}
                disabled={isCurrent || hasPending || isLoading}
                onClick={() => !isCurrent && !hasPending && onChangePlan({ new_plan: plan.id, new_price_id: plan.price_id })}
              >
                {isLoading ? <Spinner /> : isCurrent ? t("A8wDj0f") : isUpgrade ? t("AGo17y4") : t("AVFOoVV")}
              </button>
              {!isCurrent && !hasPending && (
                <RedeemSubscriptionButton
                  plan={plan}
                  eligibility={eligibility}
                  config={pointsConfig}
                  redeemingPlan={redeemingPlan}
                  onRedeem={onRedeemSubscription}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function PaymentHistoryCard({ history }) {
  const { t } = useTranslation();
  if (!history || history.length === 0) return null;
  return (
    <div className="sub-card fx-centered fx-col fx-start-v" style={{ rowGap: "12px" }}>
      <h4>{t("AOerrwt")}</h4>
      <div className="fit-container fx-centered fx-col" style={{ rowGap: "8px" }}>
        {[...history].reverse().map((entry, i) => (
          <div key={i} className="fit-container fx-scattered sc-s box-pad-h-m box-pad-v-s">
            <div className="fx-centered" style={{ columnGap: "10px" }}>
              <PlanBadge plan={entry.plan} />
              <PaymentMethodIcon method={entry.last_payment_method} />
            </div>
            <p className="gray-c">{fmtDate(entry.last_subscription, t("AvGdwjI"))}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function SubscriptionPage() {
  const { t } = useTranslation();
  const isConnectedToYaki = useSelector((state) => state.isConnectedToYaki);
  const userKeys = useSelector((state) => state.userKeys);
  const { connect: connectToYaki, isConnecting } = useYakiChestConnect();
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [selectedTab, setSelectedTab] = useState(0);
  const [plans, setPlans] = useState([]);
  const [plansLoading, setPlansLoading] = useState(true);

  const { status, loading, error, fetch, cancel, cancelling, resume, resuming, changePlan, changingPlan, cancelChange, cancellingChange } = useSubscription();
  const { config: pointsConfig, fetchConfig, eligibility, fetchEligibility, redeemingPlan, redeemSubscription } = usePoints();

  useEffect(() => {
    getPlans().then((p) => { setPlans(p); setPlansLoading(false); });
  }, []);

  useEffect(() => {
    if (isConnectedToYaki) fetch();
  }, [isConnectedToYaki]);

  useEffect(() => {
    if (isConnectedToYaki) {
      fetchEligibility();
      fetchConfig();
    }
  }, [isConnectedToYaki, fetchEligibility, fetchConfig]);

  return (
    <>
      <div className="fx-centered fx-col fx-start-v" style={{ maxWidth: 720, margin: "0 auto", padding: "24px 16px 48px", rowGap: "16px" }}>
        {isConnectedToYaki && (
          <div style={{ width: "fit-content", margin: "0 auto" }}>
            <SelectTabs tabs={[t("ArUKrGp"), t("APtVGe1")]} selectedTab={selectedTab} setSelectedTab={setSelectedTab} small={true} />
          </div>
        )}

        {!isConnectedToYaki ? (
          <div className="sub-card fx-centered fx-col" style={{ rowGap: "20px", textAlign: "center" }}>
            <div style={{ width: 56, height: 56, borderRadius: "50%", backgroundColor: "rgba(247,88,22,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Icon name="cup" size={28} />
            </div>
            <div style={{ display: "flex", flexDirection: "column", rowGap: "8px" }}>
              <h4>{t("AxxV7ZQ")}</h4>
              <p className="gray-c p-centered">{t("AvvW4bY")}</p>
            </div>
            <button className="btn btn-normal" onClick={connectToYaki} disabled={isConnecting}>{isConnecting ? <Spinner /> : t("AdimVMk")}</button>
          </div>
        ) : selectedTab === 1 ? (
          <UsageView onUpgrade={() => setSelectedTab(0)} />
        ) : loading || plansLoading ? (
          <><SkeletonCard /><SkeletonCard /><SkeletonCard /></>
        ) : error ? (
          <div className="sub-card fx-centered fx-col" style={{ rowGap: "12px" }}>
            <Icon name="warning" size={32} />
            <p className="gray-c p-centered">{t("AKxHz6k")}</p>
            <button className="btn btn-gst" onClick={fetch}>{t("AcdxgMi")}</button>
          </div>
        ) : status ? (
          <>
            <CurrentPlanCard
              status={status}
              onCancel={cancel}
              onResume={resume}
              cancelling={cancelling}
              resuming={resuming}
              onUpgrade={() => setShowUpgrade(true)}
            />
            <PendingChangeCard status={status} onCancelChange={cancelChange} cancellingChange={cancellingChange} />
            <ActionsCard
              plans={plans}
              status={status}
              onChangePlan={changePlan}
              changingPlan={changingPlan}
              eligibility={eligibility}
              pointsConfig={pointsConfig}
              redeemingPlan={redeemingPlan}
              onRedeemSubscription={(plan) => redeemSubscription(plan, fetch)}
            />
            {status.active && status.last_payment_method && (
              <div className="fit-container round-corner-m box-pad-h-m box-pad-v-m" style={{ background: "rgba(247,88,22,0.06)", border: "1px solid rgba(247,88,22,0.18)", display: "flex", columnGap: "14px", alignItems: "flex-start" }}>
                <div style={{ flexShrink: 0, width: "52px", height: "52px", borderRadius: "10px", background: "rgba(247,88,22,0.12)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--c1)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 21h6" /><path d="M12 3a6 6 0 0 1 6 6c0 2.22-1.2 4.16-3 5.2V17a1 1 0 0 1-1 1H10a1 1 0 0 1-1-1v-2.8C7.2 13.16 6 11.22 6 9a6 6 0 0 1 6-6z" /><path d="M10 17h4" />
                  </svg>
                </div>
                <div style={{ display: "flex", flexDirection: "column", rowGap: "6px" }}>
                  <p style={{ fontWeight: 600 }}>{t("AVvsxau")}</p>
                  <p className="gray-c p-medium">{status.last_payment_method === "lightning" ? t("AUAXp9Y") : t("AoRq7VZ")}</p>
                </div>
              </div>
            )}
            <PaymentHistoryCard history={status.history} />
          </>
        ) : null}
      </div>

      {showUpgrade && (
        <UpgradeOverlay
          plans={plans}
          onClose={() => setShowUpgrade(false)}
          userPub={userKeys?.pub}
          eligibility={eligibility}
          pointsConfig={pointsConfig}
          redeemingPlan={redeemingPlan}
          onRedeemSubscription={(plan) => redeemSubscription(plan, fetch)}
        />
      )}
    </>
  );
}
