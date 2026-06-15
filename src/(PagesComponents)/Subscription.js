import React, { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import axios from "axios";
import Icon from "@/Components/Icon";
import Overlay from "@/Components/Overlay";
import LoadingDots from "@/Components/LoadingDots";
import Spinner from "@/Components/Spinner";
import LoginWithAPI from "@/Components/LoginWithAPI";
import useSubscription from "@/Hooks/useSubscription";
import useUsage from "@/Hooks/useUsage";
import useLightningPayment from "@/Hooks/useLightningPayment";
import { getSubscriptionLink } from "@/Endpoints/Subscription";
import QRCode from "react-qr-code";
import { copyText } from "@/Helpers/Helpers";
import { iconsNames } from "@/Content/IconV2URL";
import ProgressBar from "@/Components/ProgressBar";
import { SelectTabs } from "@/Components/SelectTabs";
import { useTranslation } from "react-i18next";

const PLANS = [
  {
    id: "basic",
    price_id: "price_1TXxor8f5pgfcSH1UwpipjP6",
    name: "Basic",
    price: "9",
    sats: "18,000",
    period: "/ month",
    descKey: "Asc3VDr",
    ctaKey: "Ac2yDI1",
    highlighted: false,
    features: [
      { textKey: "AU1WBSd", dim: false },
      { textKey: "ANhrPjf", dim: false },
      { textKey: "AVQsKA5", dim: false },
      { textKey: "A50fFes", dim: false },
      { textKey: "A8ksMlO", dim: false },
      { textKey: "Ao2SIvH", dim: false },
      { textKey: "ADO4Yfl", dim: false },
      { textKey: "AEpny9c", dim: false },
      { textKey: "Ada9y3u", dim: true },
      { textKey: "A8Nj6tx", dim: true },
      { textKey: "A5A5LVD", dim: true },
    ],
  },
  {
    id: "premium",
    price_id: "price_1TXyHO8f5pgfcSH1W1jqzsuk",
    name: "Premium",
    price: "19",
    sats: "38,000",
    period: "/ month",
    descKey: "AIIFml1",
    ctaKey: "ACPuCzH",
    highlighted: true,
    features: [
      { textKey: "ASLOpzl", dim: false },
      { textKey: "AhCQAkq", dim: false },
      { textKey: "AeFrGDi", dim: false },
      { textKey: "A74eLZx", dim: false },
      { textKey: "Ai1B3HF", dim: false },
      { textKey: "AyquzYg", dim: false },
      { textKey: "Az5xfx5", dim: false },
      { textKey: "AXvNUU1", dim: false },
      { textKey: "AMUKeIv", dim: false },
    ],
  },
];

const COMPARE_ROWS = [
  { labelKey: "ALx6onZ", creator: true, pro: true },
  { labelKey: "ASL87jw", creator: true, pro: true },
  { labelKey: "AAHCjSA", creator: true, pro: true },
  { labelKey: "A50fFes", creator: true, pro: true },
  { labelKey: "A2o7YV8", creator: true, pro: true },
  { labelKey: "A8SkkKn", creator: "50 GB", pro: "100 GB" },
  { labelKey: "AxpgMtE", creator: "3 months", pro: "3 years" },
  { labelKey: "Av9K4Uc", creator: false, pro: true },
  { labelKey: "Ada9y3u", creator: false, pro: "60/week" },
  { labelKey: "AiJc9Ml", creator: false, pro: "30/week" },
  { labelKey: "A5A5LVD", creator: false, pro: "20/week" },
  { labelKey: "AC03DMc", creator: false, pro: true },
];

const FAQ_ITEMS = [
  { qKey: "AIBil2L", aKey: "AT7x2DG" },
  { qKey: "AEUWsw2", aKey: "Aeb4LuD" },
  { qKey: "AfJMzCG", aKey: "AcuJc5A" },
  { qKey: "AZcdCkV", aKey: "AbJvLWu" },
  { qKey: "AKvEPn9", aKey: "AIZxnGr" },
];

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

const planOrder = (id) => PLANS.findIndex((p) => p.id === id);

function useReveal(dep) {
  useEffect(() => {
    const els = document.querySelectorAll(".ip-reveal");
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("is-visible"); io.unobserve(e.target); } });
    }, { threshold: 0.08 });
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [dep]);
}

function CellValue({ value, t }) {
  if (value === true) return <Icon name="check" size={20} v={2} isBoldThemeColor />;
  if (value === false) return <span style={{ color: "rgba(139,148,158,0.3)", fontSize: "0.9rem" }}>–</span>;
  if (value === "50 GB") return <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--c1)" }}>{t("ASR1V0c")}</span>;
  if (value === "100 GB") return <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--c1)" }}>{t("AJXhgWC")}</span>;
  if (value === "3 months") return <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--c1)" }}>{t("AVnJlbF")}</span>;
  if (value === "3 years") return <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--c1)" }}>{t("AN9MDu8")}</span>;
  if (value === "60/week") return <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--c1)" }}>{t("AJeNfeN")}</span>;
  if (value === "30/week") return <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--c1)" }}>{t("AObhDYm")}</span>;
  if (value === "20/week") return <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--c1)" }}>{t("AsTcBNN")}</span>;
  return <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--c1)" }}>{value}</span>;
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
      <Overlay exit={onClose} width={420}>
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
    <Overlay exit={onClose} width={420}>
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

function PricingCards({ isLn, setIsLn, userPub, onClose }) {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  const [lightningInvoice, setLightningInvoice] = useState(null);
  const [activePlan, setActivePlan] = useState(null);

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
    setIsLoading(true);
    try {
      if (isLn) {
        const invoice = await generateLightningInvoice(plan);
        if (invoice) { setActivePlan(plan); setLightningInvoice(invoice); }
      } else {
        await getSubscriptionLink({ price_id: plan.price_id, plan: plan.id });
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
          sats={activePlan.sats}
          userPub={userPub}
          onClose={() => { setLightningInvoice(null); setActivePlan(null); }}
        />
      )}

      <div style={{ display: "flex", justifyContent: "center", marginBottom: "32px" }}>
        <div className="sub-pricing-toggle">
          <button className={`sub-pricing-toggle-btn${!isLn ? " active" : ""}`} onClick={() => setIsLn(false)}>{t("Az5mbB1")}</button>
          <button className={`sub-pricing-toggle-btn${isLn ? " active" : ""}`} onClick={() => setIsLn(true)}>{t("AQv2Hnr")}</button>
        </div>
      </div>

      <div className="lp-pricing-cards ip-reveal" style={{ maxWidth: 780, margin: "0 auto" }}>
        {PLANS.map((plan) => (
          <div key={plan.id} className={`lp-plan-card bg-dropdown${plan.highlighted ? " lp-plan-card-pro" : ""}`}>
            <div>
              <div className="lp-plan-name">{plan.name}</div>
              <div className="lp-plan-price-row">
                {isLn ? (
                  <><span className="lp-plan-amount" style={{ fontSize: "2.2rem" }}>{plan.sats}</span><span className="lp-plan-period"> {t("AQv2Hnr").toLowerCase()}{plan.period}</span></>
                ) : (
                  <><span className="lp-plan-amount">${plan.price}</span><span className="lp-plan-period">{plan.period}</span></>
                )}
              </div>
              <div className="lp-plan-sats">
                {isLn ? <span>~${plan.price} / month</span> : <span>~{plan.sats} {t("AUQUggV")}</span>}
              </div>
              <p className="lp-plan-desc">{t(plan.descKey)}</p>
            </div>
            <div className="lp-plan-divider" />
            <ul className="lp-plan-features">
              {plan.features.map((f) => (
                <li key={f.textKey} className={`lp-plan-feature${f.dim ? " lp-plan-feature-dim" : ""}`}>
                  <span className="lp-plan-feature-icon">{f.dim ? "–" : <Icon name="check" size={20} v={2} isBoldThemeColor />}</span>
                  {t(f.textKey)}
                </li>
              ))}
            </ul>
            <button
              className={`lp-btn lp-btn-lg${plan.highlighted ? " lp-btn-primary" : " lp-btn-outline"}`}
              style={{ width: "100%", borderRadius: 8 }}
              disabled={isLoading}
              onClick={() => handleCheckout(plan)}
            >
              {isLoading ? <LoadingDots /> : t(plan.ctaKey)}
            </button>
          </div>
        ))}
      </div>
    </>
  );
}

function CompareTable() {
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
          <div className="lp-compare-cell center header-cell">{PLANS[0].name}</div>
          <div className="lp-compare-cell center header-cell" style={{ color: "#F75816" }}>{PLANS[1].name}</div>
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

function UpgradeOverlay({ onClose, userPub }) {
  const { t } = useTranslation();
  const [isLn, setIsLn] = useState(false);
  useReveal(true);

  return (
    <div
      className="bg-dropdown"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1200,
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

        <PricingCards isLn={isLn} setIsLn={setIsLn} userPub={userPub} onClose={onClose} />
        <div style={{ height: "1px", background: "var(--dim-gray)", margin: "48px 0" }} />
        <CompareTable />
        <div style={{ height: "1px", background: "var(--dim-gray)", margin: "48px 0" }} />
        <FaqSection />
        <div style={{ height: "48px" }} />
      </div>
    </div>
  );
}

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
  if (method === "stripe") return <span style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}><Icon name="wallet" size={18} /><span>{t("AKSZkTI")}</span></span>;
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

const USAGE_ORDER = ["chat-articles", "second-reader", "energy-mapper", "translate-lt", "wallet-creation"];

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
        <div className="fit-container fx-scattered round-corner box-pad-h-m box-pad-v-s">
          <div className="fx-centered" style={{ columnGap: "8px" }}>
            <Icon name={iconsNames.lock} size={16} />
            <p className="gray-c p-medium">{t("AHPptdT")}</p>
          </div>
          <button className="btn btn-gst" onClick={onUpgrade}>{t("AGo17y4")}</button>
        </div>
      ) : isUnlimited ? null : (
        <ProgressBar percentage={percentage} full />
      )}

      {resetText && (
        <div className="fx-centered" style={{ columnGap: "6px" }}>
          <Icon name={iconsNames.clock} size={14} />
          <span className="gray-c p-medium">{resetText}</span>
        </div>
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
          <button className="btn btn-red fit-container" onClick={onConfirm} disabled={loading}>{loading ? <LoadingDots /> : t("AsZQ11Q")}</button>
        </div>
      </div>
    </Overlay>
  );
}

function CurrentPlanCard({ status, onCancel, onResume, cancelling, resuming, onUpgrade }) {
  const { t } = useTranslation();
  const [showCancelModal, setShowCancelModal] = useState(false);
  const isStripeActive = status.last_payment_method === "stripe" && status.active;
  const isFree = !status.plan || status.plan === "free";

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

        {status.last_payment_method && (
          <div className="fit-container fx-scattered">
            <p className="gray-c">{t("A0SiY0R")}</p>
            <PaymentMethodIcon method={status.last_payment_method} />
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
                <button className="btn btn-normal btn-full" onClick={onResume} disabled={resuming}>{resuming ? <LoadingDots /> : t("APugHtt")}</button>
              </div>
            ) : (
              <div className="fit-container fx-centered fx-col" style={{ rowGap: "8px" }}>
                <button className="btn btn-red btn-full" onClick={() => setShowCancelModal(true)} disabled={cancelling}>{cancelling ? <LoadingDots /> : t("AL0OUiB")}</button>
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
      <button className="btn btn-gst btn-full" onClick={onCancelChange} disabled={cancellingChange}>{cancellingChange ? <LoadingDots /> : t("AJxtluP")}</button>
    </div>
  );
}

function ActionsCard({ status, onChangePlan, changingPlan }) {
  const { t } = useTranslation();
  if (status.last_payment_method !== "stripe" || !status.active) return null;

  const hasPending = !!status.pending_plan;
  const currentPlanIdx = planOrder(status.plan);

  return (
    <div className="sub-card fx-centered fx-col fx-start-v" style={{ rowGap: "16px" }}>
      <h4>{t("AuxUqLK")}</h4>
      <div className="fit-container fx-centered fx-stretch" style={{ gap: "12px", alignItems: "stretch" }}>
        {PLANS.map((plan) => {
          const isCurrent = plan.id === status.plan;
          const isUpgrade = planOrder(plan.id) > currentPlanIdx;
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
                  <span className="sub-plan-amount">${plan.price}</span>
                  <span className="gray-c" style={{ fontSize: "0.875rem" }}>{plan.period}</span>
                </div>
                <p style={{ fontSize: "0.78rem", color: "var(--c1)", fontWeight: 600 }}>~{plan.sats} {t("AUQUggV")}</p>
                <p className="sub-plan-desc">{t(plan.descKey)}</p>
              </div>
              <div className="sub-plan-divider" />
              <ul className="sub-plan-features">
                {plan.features.map((f) => (
                  <li key={f.textKey} className={`sub-plan-feature${f.dim ? " sub-plan-feature-dim" : ""}`}>
                    {f.dim && <span className="sub-plan-feature-icon">–</span>}
                    {!f.dim && <Icon v={2} name={iconsNames.check} isBoldThemeColor={true} />}
                    {t(f.textKey)}
                  </li>
                ))}
              </ul>
              <button
                className={`btn ${plan.highlighted ? "btn-normal" : "btn-gst"} btn-full`}
                style={{ opacity: isCurrent || (hasPending && !isCurrent) ? 0.5 : 1 }}
                disabled={isCurrent || hasPending || isLoading}
                onClick={() => !isCurrent && !hasPending && onChangePlan({ new_plan: plan.id, new_price_id: plan.price_id })}
              >
                {isLoading ? <LoadingDots /> : isCurrent ? t("A8wDj0f") : isUpgrade ? t("AGo17y4") : t("AVFOoVV")}
              </button>
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
  const [showLoginWithAPI, setShowLoginWithAPI] = useState(false);
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [selectedTab, setSelectedTab] = useState(0);

  const { status, loading, error, fetch, cancel, cancelling, resume, resuming, changePlan, changingPlan, cancelChange, cancellingChange } = useSubscription();

  useEffect(() => {
    if (isConnectedToYaki) fetch();
  }, [isConnectedToYaki]);

  return (
    <>
      {showLoginWithAPI && <LoginWithAPI exit={() => setShowLoginWithAPI(false)} />}
      {showUpgrade && <UpgradeOverlay onClose={() => setShowUpgrade(false)} userPub={userKeys?.pub} />}

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
            <button className="btn btn-normal" onClick={() => setShowLoginWithAPI(true)}>{t("AdimVMk")}</button>
          </div>
        ) : selectedTab === 1 ? (
          <UsageView onUpgrade={() => setShowUpgrade(true)} />
        ) : loading ? (
          <><SkeletonCard /><SkeletonCard /><SkeletonCard /></>
        ) : error ? (
          <div className="sub-card fx-centered fx-col" style={{ rowGap: "12px" }}>
            <Icon name="warning" size={32} />
            <p className="gray-c p-centered">{t("AKxHz6k")}</p>
            <button className="btn btn-gst" onClick={fetch}>{t("AcdxgMi")}</button>
          </div>
        ) : status ? (
          <>
            <CurrentPlanCard status={status} onCancel={cancel} onResume={resume} cancelling={cancelling} resuming={resuming} onUpgrade={() => setShowUpgrade(true)} />
            <PendingChangeCard status={status} onCancelChange={cancelChange} cancellingChange={cancellingChange} />
            <ActionsCard status={status} onChangePlan={changePlan} changingPlan={changingPlan} />
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
    </>
  );
}
