import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import axios from "axios";
import Icon from "@/Components/Icon";
import Overlay from "@/Components/Overlay";
import Spinner from "@/Components/Spinner";
import QRCode from "react-qr-code";
import { getSubscriptionLink } from "@/Endpoints/Subscription";
import { copyText } from "@/Helpers/Helpers";
import { iconsNames } from "@/Content/IconV2URL";
import NumberShrink from "@/Components/NumberShrink";
import useLightningPayment from "@/Hooks/useLightningPayment";
import { useTranslation } from "react-i18next";

const COMPARE_ROWS = [
  { labelKey: "ALx6onZ", creator: true, pro: true },
  { labelKey: "ASL87jw", creator: true, pro: true },
  { labelKey: "AAHCjSA", creator: true, pro: true },
  { labelKey: "A50fFes", creator: true, pro: true },
  { labelKey: "A2o7YV8", creator: true, pro: true },
  { labelKey: "A8SkkKn", creator: "50 GB", pro: "100 GB" },
  { labelKey: "AxpgMtE", creator: "3 months", pro: "3 years" },
  { labelKey: "Av9K4Uc", creator: false, pro: true },
  { labelKey: "Ada9y3u", creator: "weekly limit", pro: "more limit" },
  { labelKey: "AiJc9Ml", creator: "weekly limit", pro: "more limit" },
  { labelKey: "A5A5LVD", creator: "weekly limit", pro: "more limit" },
  { labelKey: "AC03DMc", creator: true, pro: true },
];

const FAQ_ITEMS = [
  { qKey: "AIBil2L", aKey: "AT7x2DG" },
  { qKey: "AEUWsw2", aKey: "Aeb4LuD" },
  { qKey: "AfJMzCG", aKey: "AcuJc5A" },
  { qKey: "AZcdCkV", aKey: "AbJvLWu" },
  { qKey: "AKvEPn9", aKey: "AIZxnGr" },
];

function useReveal(dep, rootRef) {
  useEffect(() => {
    if (rootRef && !rootRef.current) return;
    const scope = rootRef?.current || document;
    const els = scope.querySelectorAll(".ip-reveal");
    if (els.length === 0) return;
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("is-visible"); io.unobserve(e.target); } });
    }, { root: rootRef?.current || null, threshold: 0.08 });
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [dep, rootRef]);
}

function CellValue({ value, t }) {
  if (value === true) return <Icon name="check" size={20} v={2} isBoldThemeColor />;
  if (value === false) return <span style={{ color: "rgba(139,148,158,0.3)", fontSize: "0.9rem" }}>–</span>;
  if (value === "50 GB") return <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--c1)" }}>{t("ASR1V0c")}</span>;
  if (value === "100 GB") return <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--c1)" }}>{t("AJXhgWC")}</span>;
  if (value === "3 months") return <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--c1)" }}>{t("AVnJlbF")}</span>;
  if (value === "3 years") return <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--c1)" }}>{t("AN9MDu8")}</span>;
  if (value === "weekly limit") return <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--c1)" }}>{t("AJeNfeN")}</span>;
  if (value === "more limit") return <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--c1)" }}>{t("AckR4Vd")}</span>;
}

function WaitingDots() {
  return (
    <span style={{ display: "inline-flex", gap: "5px", alignItems: "center" }}>
      {[0, 1, 2].map((i) => (
        <span key={i} style={{ width: "7px", height: "7px", borderRadius: "50%", backgroundColor: "var(--c1)", display: "inline-block", animation: "flash 1.2s ease-in-out infinite", animationDelay: `${i * 0.2}s` }} />
      ))}
    </span>
  );
}

function LightningInvoiceModal({ invoice, planName, sats, onClose, userPub }) {
  const { t } = useTranslation();
  const { status, data } = useLightningPayment(userPub);

  useEffect(() => {
    if (status !== "paid") return;
    const t = setTimeout(() => window.location.reload(), 2000);
    return () => clearTimeout(t);
  }, [status]);

  const expiryDate = data?.next_subscription
    ? new Date(data.next_subscription * 1000).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" })
    : null;

  if (status === "paid") {
    return (
      <Overlay exit={onClose} width={420} zIndex={2000000001}>
        <div className="fx-centered fx-col box-pad-h box-pad-v" style={{ rowGap: "20px", textAlign: "center" }}>
          <div style={{ width: 64, height: 64, borderRadius: "50%", background: "rgba(47,191,113,0.15)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "2rem", color: "#2FBF71" }}>✓</div>
          <div className="fx-centered fx-col" style={{ rowGap: "6px" }}>
            <h3 style={{ color: "#2FBF71", margin: 0 }}>{t("AzGrCIb")}</h3>
            <p className="gray-c" style={{ margin: 0, fontSize: "0.85rem" }}>
              {t("AnDRJ44", { plan: planName })}{expiryDate && <> · {t("AMHtfN5")} <strong style={{ color: "inherit" }}>{expiryDate}</strong></>}
            </p>
          </div>
          <p className="gray-c" style={{ fontSize: "0.78rem", margin: 0 }}>{t("AUkcJAr")}</p>
        </div>
      </Overlay>
    );
  }

  return (
    <Overlay exit={onClose} width={420} zIndex={2000000001}>
      <div className="fx-centered fx-col box-pad-h box-pad-v" style={{ rowGap: "24px" }}>
        <div className="fx-centered fx-col fit-container" style={{ rowGap: "6px", textAlign: "center" }}>
          <div style={{ width: 44, height: 44, borderRadius: "50%", background: "rgba(247,88,22,0.12)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.4rem" }}>⚡</div>
          <h3 style={{ marginTop: "8px" }}>{t("ASLKQFy")}</h3>
          <p className="gray-c" style={{ fontSize: "0.85rem", margin: 0 }}>
            {t("Aen7xbl", { plan: planName })} &nbsp;·&nbsp;<span style={{ color: "var(--c1)", fontWeight: 700 }}>{t("ARpXkUv", { sats })}</span>
          </p>
        </div>
        <div style={{ background: "#ffffff", padding: "16px", borderRadius: "16px", display: "flex", boxShadow: "0 4px 24px rgba(247,88,22,0.12)" }}>
          <QRCode value={invoice} size={220} />
        </div>
        <div
          className="fit-container fx-scattered round-corner border-all box-pad-h-m box-pad-v-s"
          style={{ cursor: "pointer", columnGap: "12px" }}
          onClick={() => copyText(invoice, t("A3FRcsM"))}
        >
          <p className="gray-c" style={{ fontSize: "0.72rem", fontFamily: "monospace", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", flex: 1, margin: 0 }}>
            {invoice.slice(0, 48)}…
          </p>
          <span style={{ color: "var(--c1)", fontSize: "0.8rem", fontWeight: 600, flexShrink: 0 }}>{t("Anwd2wT")}</span>
        </div>
        <div className="fx-centered fit-container" style={{ columnGap: "10px" }}>
          <Spinner size={16} />
          <p style={{ color: "var(--c1)", fontSize: "0.82rem", fontWeight: 600, margin: 0 }}>{t("AyWYflA")}</p>
        </div>
        {status === "error" && (
          <p className="gray-c" style={{ fontSize: "0.78rem", margin: 0, textAlign: "center" }}>{t("Ak5bPb9")}</p>
        )}
        <button className="btn btn-gst btn-full" onClick={onClose}>{t("AB4BSCe")}</button>
      </div>
    </Overlay>
  );
}

function PricingCards({ plans, mode, setMode, userPub, onClose, eligibility, pointsConfig, redeemingPlan, onRedeemSubscription, hasAnyPointsEligiblePlan }) {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  const [lightningInvoice, setLightningInvoice] = useState(null);
  const [activePlan, setActivePlan] = useState(null);
  const isLn = mode === "sats";
  const isPoints = mode === "points";

  const generateLightningInvoice = async (plan) => {
    const lnAddr = process.env.NEXT_PUBLIC_YAKIPRO_LIGHTNING_ADDR;
    if (!lnAddr) return null;
    const [username, domain] = lnAddr.split("@");
    const lnurlRes = await axios.get(`https://${domain}/.well-known/lnurlp/${username}`);
    const invoiceRes = await axios.get(lnurlRes.data.callback, {
      params: { amount: 1 * 1000, comment: JSON.stringify({ plan: plan.id, pubkey: userPub }) },
    });
    return invoiceRes.data.pr;
  };

  const handleCheckout = async (plan) => {
    if (isPoints) {
      await onRedeemSubscription(plan.id);
      onClose();
      return;
    }
    setIsLoading(true);
    try {
      if (isLn) {
        const invoice = await generateLightningInvoice(plan);
        if (invoice) { setActivePlan(plan); setLightningInvoice(invoice); }
      } else {
        await getSubscriptionLink({ plan: plan.plan });
      }
    } catch (err) { console.error(err); }
    setIsLoading(false);
  };

  return (
    <>
      {lightningInvoice && activePlan && (
        <LightningInvoiceModal
          invoice={lightningInvoice}
          planName={activePlan.name}
          sats={activePlan.sats_price?.toLocaleString()}
          userPub={userPub}
          onClose={() => { setLightningInvoice(null); setActivePlan(null); }}
        />
      )}

      <div style={{ display: "flex", justifyContent: "center", marginBottom: "32px" }}>
        <div className="sub-pricing-toggle">
          <button className={`sub-pricing-toggle-btn${mode === "fiat" ? " active" : ""}`} onClick={() => setMode("fiat")}>{t("Az5mbB1")}</button>
          <button className={`sub-pricing-toggle-btn${mode === "sats" ? " active" : ""}`} onClick={() => setMode("sats")}>{t("AQv2Hnr")}</button>
          {hasAnyPointsEligiblePlan && (
            <button className={`sub-pricing-toggle-btn${mode === "points" ? " active" : ""}`} onClick={() => setMode("points")}>{t("Apts012")}</button>
          )}
        </div>
      </div>

      <div className="lp-pricing-cards ip-reveal" style={{ maxWidth: 780, margin: "0 auto" }}>
        {plans.map((plan, planIdx) => {
          const isHighlighted = planIdx === plans.length - 1;
          const pointsEligible = !!eligibility?.[plan.id]?.eligible;
          const pointsCost = pointsConfig?.subscription?.[plan.id];
          const isRedeeming = redeemingPlan === plan.id;
          const cardDisabled = isPoints && !pointsEligible;

          return (
            <div
              key={plan.id}
              className={`lp-plan-card bg-dropdown${isHighlighted ? " lp-plan-card-pro" : ""}`}
              style={cardDisabled ? { opacity: 0.5 } : undefined}
            >
              <div>
                <div className="lp-plan-name">{plan.name}</div>
                <div className="lp-plan-price-row">
                  {isPoints ? (
                    <span className="lp-plan-amount" style={{ fontSize: "2.2rem" }}>
                      {typeof pointsCost === "number" ? <NumberShrink value={pointsCost} /> : pointsCost}
                    </span>
                  ) : isLn ? (
                    <><span className="lp-plan-amount" style={{ fontSize: "2.2rem" }}>{plan.sats_price?.toLocaleString()}</span><span className="lp-plan-period"> {t("AQv2Hnr").toLowerCase()} / month</span></>
                  ) : (
                    <><span className="lp-plan-amount">${plan.usd_price}</span><span className="lp-plan-period"> / month</span></>
                  )}
                  {isPoints && <span className="lp-plan-period"> {t("A4IGG0z")} / month</span>}
                </div>
                <div className="lp-plan-sats">
                  {isPoints ? (
                    !pointsEligible && <span>{t("Apts015")}</span>
                  ) : isLn ? (
                    <span>~${plan.usd_price} / month</span>
                  ) : (
                    <span>~{plan.sats_price?.toLocaleString()} {t("AUQUggV")}</span>
                  )}
                </div>
              </div>
              <div className="lp-plan-divider" />
              <ul className="lp-plan-features">
                {(plan.perks ?? []).map((perk, i) => (
                  <li key={i} className="lp-plan-feature">
                    <span className="lp-plan-feature-icon"><Icon name="check" size={20} v={2} isBoldThemeColor /></span>
                    {perk}
                  </li>
                ))}
              </ul>
              <button
                className={`lp-btn lp-btn-lg${cardDisabled ? " btn-disabled" : isHighlighted ? " lp-btn-primary" : " lp-btn-outline"}`}
                style={{ width: "100%", borderRadius: 8 }}
                disabled={isLoading || isRedeeming || cardDisabled}
                onClick={() => !cardDisabled && handleCheckout(plan)}
              >
                {isLoading || isRedeeming ? <Spinner /> : isHighlighted ? t("ACPuCzH") : t("Ac2yDI1")}
              </button>
            </div>
          );
        })}
      </div>
    </>
  );
}

function CompareTable({ plans }) {
  const { t } = useTranslation();
  return (
    <div style={{ marginTop: "48px" }}>
      <div className="ip-reveal" style={{ textAlign: "center", marginBottom: 32 }}>
        <p style={{ fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--c1)", marginBottom: 8 }}>{t("AoFbKNF")}</p>
        <h2 style={{ margin: 0 }}>{t("AJQdVdV")}</h2>
      </div>
      <div className="lp-compare-table ip-reveal ip-reveal-d1" style={{ maxWidth: 780, margin: "0 auto" }}>
        <div className="lp-compare-row header">
          <div className="lp-compare-cell header-cell">{t("ALvzv9F")}</div>
          <div className="lp-compare-cell center header-cell">{plans[0]?.name ?? ""}</div>
          <div className="lp-compare-cell center header-cell" style={{ color: "#F75816" }}>{plans[1]?.name ?? ""}</div>
        </div>
        {COMPARE_ROWS.map((row) => (
          <div key={row.labelKey} className="lp-compare-row">
            <div className="lp-compare-cell">{t(row.labelKey)}</div>
            <div className="lp-compare-cell center"><CellValue value={row.creator} t={t} /></div>
            <div className="lp-compare-cell center"><CellValue value={row.pro} t={t} /></div>
          </div>
        ))}
      </div>
    </div>
  );
}

function FaqSection() {
  const { t } = useTranslation();
  const [openFaq, setOpenFaq] = useState(null);
  return (
    <div style={{ marginTop: "48px" }}>
      <div className="ip-reveal" style={{ textAlign: "center", marginBottom: 32 }}>
        <p style={{ fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--c1)", marginBottom: 8 }}>{t("A8daj48")}</p>
        <h2 style={{ margin: 0 }}>{t("A1wcO5C")}</h2>
      </div>
      <div className="lp-faq ip-reveal ip-reveal-d1" style={{ maxWidth: 780, margin: "0 auto" }}>
        {FAQ_ITEMS.map((item, i) => (
          <div key={i} className="lp-faq-item" onClick={() => setOpenFaq(openFaq === i ? null : i)}>
            <div className="lp-faq-trigger">
              <p className="lp-faq-q">{t(item.qKey)}</p>
              <span className={`lp-faq-icon${openFaq === i ? " open" : ""}`}>+</span>
            </div>
            {openFaq === i && <p className="lp-faq-a">{t(item.aKey)}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}

function UpgradeOverlay({ plans, onClose, userPub, eligibility, pointsConfig, redeemingPlan, onRedeemSubscription }) {
  const { t } = useTranslation();
  const [mode, setMode] = useState("fiat");
  const [mounted, setMounted] = useState(false);
  const hasAnyPointsEligiblePlan = plans.some((plan) => !!eligibility?.[plan.id]?.eligible);
  const scrollRef = useRef(null);
  useReveal(`${mounted}-${plans.length}-${mode}`, scrollRef);

  useEffect(() => {
    setMounted(true);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  const content = (
    <div
      ref={scrollRef}
      className="bg-dropdown"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 2000000000,
        width: "100vw",
        height: "100dvh",
        overflowY: "auto",
        overflowX: "hidden",
        animation: "slideUpFull .35s cubic-bezier(.4,0,.2,1) both",
      }}
    >
      <div style={{ position: "sticky", top: 0, zIndex: 10, display: "flex", justifyContent: "flex-end", padding: "16px 24px" }}>
        <button className="btn btn-gst" style={{ width: 40, height: 40, padding: 0, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "50%" }} onClick={onClose}>
          <Icon name={iconsNames.close_sm} size={18} v={2} />
        </button>
      </div>

      <div style={{ maxWidth: 860, margin: "0 auto", padding: "24px 24px 80px" }}>
        <div className="ip-reveal" style={{ textAlign: "center", marginBottom: "48px", display: "flex", flexDirection: "column", alignItems: "center", gap: "16px" }}>
          <Icon name="checkmark-c1" size={72} isColored />
          <h2 style={{ margin: 0 }}>{t("AqAJ3zy")}</h2>
          <p className="gray-c" style={{ fontSize: "1rem", lineHeight: 1.6, maxWidth: 480, margin: 0 }}>
            {t("ACSRZQI")}
          </p>
        </div>

        <PricingCards
          plans={plans}
          mode={mode}
          setMode={setMode}
          userPub={userPub}
          onClose={onClose}
          eligibility={eligibility}
          pointsConfig={pointsConfig}
          redeemingPlan={redeemingPlan}
          onRedeemSubscription={onRedeemSubscription}
          hasAnyPointsEligiblePlan={hasAnyPointsEligiblePlan}
        />
        <div style={{ height: "1px", background: "var(--dim-gray)", margin: "48px 0" }} />
        <CompareTable plans={plans} />
        <div style={{ height: "1px", background: "var(--dim-gray)", margin: "48px 0" }} />
        <FaqSection />
        <div style={{ height: "48px" }} />
      </div>
    </div>
  );

  if (!mounted) return null;

  return createPortal(
    content,
    document.getElementById("portal-root") || document.body,
  );
}

export {
  COMPARE_ROWS,
  FAQ_ITEMS,
  useReveal,
  CellValue,
  WaitingDots,
  LightningInvoiceModal,
  PricingCards,
  CompareTable,
  FaqSection,
};

export default UpgradeOverlay;
