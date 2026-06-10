import React, { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import axios from "axios";
import Icon from "@/Components/Icon";
import Overlay from "@/Components/Overlay";
import LoadingDots from "@/Components/LoadingDots";
import Spinner from "@/Components/Spinner";
import LoginWithAPI from "@/Components/LoginWithAPI";
import useSubscription from "@/Hooks/useSubscription";
import useLightningPayment from "@/Hooks/useLightningPayment";
import { getSubscriptionLink } from "@/Endpoints/Subscription";
import QRCode from "react-qr-code";
import { copyText } from "@/Helpers/Helpers";
import { iconsNames } from "@/Content/IconV2URL";

const PLANS = [
  {
    id: "basic",
    price_id: "price_1TXxor8f5pgfcSH1UwpipjP6",
    name: "Creator",
    price: "9",
    sats: "18,000",
    period: "/ month",
    desc: "For writers who want to publish, monetize, and understand their audience.",
    cta: "Get Creator",
    highlighted: false,
    features: [
      { text: "Unlimited articles & notes publishing", dim: false },
      { text: "Nostr-native identity (npub / nsec)", dim: false },
      { text: "Premium content gating (NIP-63)", dim: false },
      { text: "Subscriber management", dim: false },
      { text: "Lightning paywall — no commission", dim: false },
      { text: "Creator Analytics — up to 3 months", dim: false },
      { text: "50 GB Blossom media storage", dim: false },
      { text: "YakiPro for creators", dim: false },
      { text: "AI Writing Assistant", dim: true },
      { text: "Second Reader AI (5 personas)", dim: true },
      { text: "Energy Mapper", dim: true },
    ],
  },
  {
    id: "premium",
    price_id: "price_1TXyHO8f5pgfcSH1W1jqzsuk",
    name: "Pro",
    price: "19",
    sats: "38,000",
    period: "/ month",
    desc: "For serious creators who want AI in their corner and the full analytics picture.",
    cta: "Get Pro",
    highlighted: true,
    badge: "Most popular",
    features: [
      { text: "Everything in Creator", dim: false },
      { text: "AI Writing Assistant — unlimited", dim: false },
      { text: "Second Reader AI (all 5 personas)", dim: false },
      { text: "Energy Mapper — per-sentence emotion graph", dim: false },
      { text: "Inline diff viewer — accept / reject changes", dim: false },
      { text: "Analytics — up to 3 years of history", dim: false },
      { text: "Click-through bar drill-down per note/article", dim: false },
      { text: "100 GB Blossom media storage", dim: false },
      { text: "Early access to new features", dim: false },
    ],
  },
];

const COMPARE_ROWS = [
  { label: "Articles & Notes publishing", creator: true, pro: true },
  { label: "Nostr-native identity", creator: true, pro: true },
  { label: "Premium content gating", creator: true, pro: true },
  { label: "Subscriber management", creator: true, pro: true },
  { label: "Lightning paywall", creator: true, pro: true },
  { label: "Blossom media storage", creator: "50 GB", pro: "100 GB" },
  { label: "Creator Analytics history", creator: "3 months", pro: "3 years" },
  { label: "Drill-down bar click", creator: false, pro: true },
  { label: "AI Writing Assistant", creator: false, pro: "Unlimited" },
  { label: "Second Reader AI", creator: false, pro: "5 personas" },
  { label: "Energy Mapper", creator: false, pro: true },
  { label: "Inline diff — accept / reject", creator: false, pro: true },
];

const FAQ_ITEMS = [
  { q: "Do I need a Nostr account?", a: "Yes — your keypair (npub / nsec) is your identity on YakiPro. You can generate one in-app or import an existing one. Your private key is never stored on our servers." },
  { q: "How do Lightning payments work?", a: "Premium content is gated via NIP-63. Your subscribers pay you directly via Lightning invoice — we never touch the funds. You keep 100% of every sat." },
  { q: "What is Blossom storage?", a: "Blossom is a Nostr-native media hosting protocol. YakiPro gives you a dedicated Blossom server for images and files used in your articles — 50 GB on Creator, 100 GB on Pro." },
  { q: "Can I switch plans?", a: "Yes, upgrade or downgrade at any time. Your published content, subscriber list, and analytics history are always yours regardless of plan." },
  { q: "Is my content portable?", a: "Completely. Every article is a signed Nostr event on relays you control. You can read and republish your content with any Nostr-compatible client." },
  { q: "Can I pay in Bitcoin?", a: "Yes. Pay via Lightning and get a 10% discount on any plan. Invoices are generated instantly — no custodial wallets required." },
];

const fmtDate = (ts) => {
  if (!ts) return "N/A";
  return new Date(ts * 1000).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
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

function CellValue({ value }) {
  if (value === true) return <span style={{ color: "#2FBF71", fontWeight: 900, fontSize: "1rem" }}>✓</span>;
  if (value === false) return <span style={{ color: "rgba(139,148,158,0.3)", fontSize: "0.9rem" }}>–</span>;
  return <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#8b9cf4" }}>{value}</span>;
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
            <h3 style={{ color: "#2FBF71", margin: 0 }}>Payment confirmed!</h3>
            <p className="gray-c" style={{ margin: 0, fontSize: "0.85rem" }}>
              {planName} plan activated{expiryDate && <> · renews <strong style={{ color: "inherit" }}>{expiryDate}</strong></>}
            </p>
          </div>
          <p className="gray-c" style={{ fontSize: "0.78rem", margin: 0 }}>Reloading your session…</p>
        </div>
      </Overlay>
    );
  }

  return (
    <Overlay exit={onClose} width={420}>
      <div className="fx-centered fx-col box-pad-h box-pad-v" style={{ rowGap: "24px" }}>
        <div className="fx-centered fx-col fit-container" style={{ rowGap: "6px", textAlign: "center" }}>
          <div style={{ width: 44, height: 44, borderRadius: "50%", background: "rgba(247,88,22,0.12)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.4rem" }}>⚡</div>
          <h3 style={{ marginTop: "8px" }}>Pay with Lightning</h3>
          <p className="gray-c" style={{ fontSize: "0.85rem", margin: 0 }}>
            {planName} plan &nbsp;·&nbsp;<span style={{ color: "var(--c1)", fontWeight: 700 }}>{sats} sats</span>
          </p>
        </div>
        <div style={{ background: "#ffffff", padding: "16px", borderRadius: "16px", display: "flex", boxShadow: "0 4px 24px rgba(247,88,22,0.12)" }}>
          <QRCode value={invoice} size={220} />
        </div>
        <div
          className="fit-container fx-scattered round-corner border-all box-pad-h-m box-pad-v-s"
          style={{ cursor: "pointer", columnGap: "12px" }}
          onClick={() => copyText(invoice, "Invoice copied!")}
        >
          <p className="gray-c" style={{ fontSize: "0.72rem", fontFamily: "monospace", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", flex: 1, margin: 0 }}>
            {invoice.slice(0, 48)}…
          </p>
          <span style={{ color: "var(--c1)", fontSize: "0.8rem", fontWeight: 600, flexShrink: 0 }}>Copy</span>
        </div>
        <div className="fx-centered fit-container" style={{ columnGap: "10px" }}>
          <Spinner size={16} />
          <p style={{ color: "var(--c1)", fontSize: "0.82rem", fontWeight: 600, margin: 0 }}>Waiting for payment...</p>
        </div>
        {status === "error" && (
          <p className="gray-c" style={{ fontSize: "0.78rem", margin: 0, textAlign: "center" }}>Connection lost. Please refresh if payment was sent.</p>
        )}
        <button className="btn btn-gst btn-full" onClick={onClose}>Cancel</button>
      </div>
    </Overlay>
  );
}

function PricingCards({ isLn, setIsLn, userPub, onClose }) {
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
          <button className={`sub-pricing-toggle-btn${!isLn ? " active" : ""}`} onClick={() => setIsLn(false)}>$ USD</button>
          <button className={`sub-pricing-toggle-btn${isLn ? " active" : ""}`} onClick={() => setIsLn(true)}>⚡ Sats</button>
        </div>
      </div>

      <div className="lp-pricing-cards ip-reveal" style={{ maxWidth: 780, margin: "0 auto" }}>
        {PLANS.map((plan) => (
          <div key={plan.id} className={`lp-plan-card bg-dropdown${plan.highlighted ? " lp-plan-card-pro" : ""}`}>
            {plan.badge && (
              <div style={{ position: "absolute", top: plan.highlighted ? 18 : 16, right: 20 }}>
                <span className="lp-plan-badge">{plan.badge}</span>
              </div>
            )}
            <div>
              <div className="lp-plan-name">{plan.name}</div>
              <div className="lp-plan-price-row">
                {isLn ? (
                  <><span className="lp-plan-amount" style={{ fontSize: "2.2rem" }}>{plan.sats}</span><span className="lp-plan-period"> sats{plan.period}</span></>
                ) : (
                  <><span className="lp-plan-amount">${plan.price}</span><span className="lp-plan-period">{plan.period}</span></>
                )}
              </div>
              <div className="lp-plan-sats">
                <span>⚡</span>
                {isLn ? <span>~${plan.price} / month</span> : <span>~{plan.sats} sats / month</span>}
                {!isLn && <span style={{ color: "rgba(139,148,158,0.4)", fontSize: "0.68rem", fontWeight: 400 }}>· 10% off with Lightning</span>}
              </div>
              <p className="lp-plan-desc">{plan.desc}</p>
            </div>
            <div className="lp-plan-divider" />
            <ul className="lp-plan-features">
              {plan.features.map((f) => (
                <li key={f.text} className={`lp-plan-feature${f.dim ? " lp-plan-feature-dim" : ""}`}>
                  <span className="lp-plan-feature-icon">{f.dim ? "–" : "✓"}</span>
                  {f.text}
                </li>
              ))}
            </ul>
            <button
              className={`lp-btn lp-btn-lg${plan.highlighted ? " lp-btn-primary" : " lp-btn-outline"}`}
              style={{ width: "100%", borderRadius: 8 }}
              disabled={isLoading}
              onClick={() => handleCheckout(plan)}
            >
              {isLoading ? <LoadingDots /> : plan.cta}
            </button>
          </div>
        ))}
      </div>

      <div className="ip-reveal ip-reveal-d1" style={{ maxWidth: 780, margin: "24px auto 0", padding: "16px 22px", borderRadius: 10, background: "rgba(247,88,22,0.06)", border: "1px solid rgba(247,88,22,0.15)", display: "flex", alignItems: "center", gap: 14 }}>
        <span style={{ fontSize: "1.4rem", flexShrink: 0 }}>⚡</span>
        <p style={{ margin: 0, fontSize: "0.875rem", color: "rgba(139,148,158,0.85)", lineHeight: 1.55 }}>
          {isLn ? "⚡ Sats prices already include a 10% Lightning discount." : <><strong style={{ color: "#E6EDF3" }}>Pay with Bitcoin Lightning</strong> and get a 10% discount on any plan. Invoices are generated instantly — no custodial wallets, no KYC.</>}
        </p>
      </div>
    </>
  );
}

function CompareTable() {
  return (
    <div style={{ marginTop: "48px" }}>
      <div className="ip-reveal" style={{ textAlign: "center", marginBottom: 32 }}>
        <p style={{ fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--c1)", marginBottom: 8 }}>Compare plans</p>
        <h2 style={{ margin: 0 }}>Everything side by side</h2>
      </div>
      <div className="lp-compare-table ip-reveal ip-reveal-d1" style={{ maxWidth: 780, margin: "0 auto" }}>
        <div className="lp-compare-row header">
          <div className="lp-compare-cell header-cell">Feature</div>
          <div className="lp-compare-cell center header-cell">Creator</div>
          <div className="lp-compare-cell center header-cell" style={{ color: "#F75816" }}>Pro</div>
        </div>
        {COMPARE_ROWS.map((row) => (
          <div key={row.label} className="lp-compare-row">
            <div className="lp-compare-cell">{row.label}</div>
            <div className="lp-compare-cell center"><CellValue value={row.creator} /></div>
            <div className="lp-compare-cell center"><CellValue value={row.pro} /></div>
          </div>
        ))}
      </div>
    </div>
  );
}

function FaqSection() {
  const [openFaq, setOpenFaq] = useState(null);
  return (
    <div style={{ marginTop: "48px" }}>
      <div className="ip-reveal" style={{ textAlign: "center", marginBottom: 32 }}>
        <p style={{ fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--c1)", marginBottom: 8 }}>FAQ</p>
        <h2 style={{ margin: 0 }}>Common questions</h2>
      </div>
      <div className="lp-faq ip-reveal ip-reveal-d1" style={{ maxWidth: 780, margin: "0 auto" }}>
        {FAQ_ITEMS.map((item, i) => (
          <div key={i} className="lp-faq-item" onClick={() => setOpenFaq(openFaq === i ? null : i)}>
            <div className="lp-faq-trigger">
              <p className="lp-faq-q">{item.q}</p>
              <span className={`lp-faq-icon${openFaq === i ? " open" : ""}`}>+</span>
            </div>
            {openFaq === i && <p className="lp-faq-a">{item.a}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}

function UpgradeOverlay({ onClose, userPub }) {
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
          <h2 style={{ margin: 0 }}>Upgrade your plan</h2>
          <p className="gray-c" style={{ fontSize: "1rem", lineHeight: 1.6, maxWidth: 480, margin: 0 }}>
            Unlock more features with YakiPro and take full control of your creative future.
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
  if (method === "lightning") return <span style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}><Icon name="bolt" size={18} /><span>Lightning</span></span>;
  if (method === "stripe") return <span style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}><Icon name="wallet" size={18} /><span>Card</span></span>;
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

function CancelConfirmModal({ endDate, onConfirm, onClose, loading }) {
  return (
    <Overlay exit={onClose} width={440}>
      <div className="fx-centered fx-col box-pad-h box-pad-v" style={{ rowGap: "16px" }}>
        <div style={{ width: 48, height: 48, borderRadius: "50%", backgroundColor: "rgba(239,68,68,0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Icon name="warning" size={22} />
        </div>
        <h4 className="p-centered">Cancel subscription?</h4>
        <p className="gray-c p-centered">Your subscription will end on <strong>{endDate}</strong>. You'll keep full access until then.</p>
        <div className="fit-container fx-centered" style={{ columnGap: "12px" }}>
          <button className="btn btn-gst fit-container" onClick={onClose}>Keep subscription</button>
          <button className="btn btn-red fit-container" onClick={onConfirm} disabled={loading}>{loading ? <LoadingDots /> : "Yes, cancel"}</button>
        </div>
      </div>
    </Overlay>
  );
}

function CurrentPlanCard({ status, onCancel, onResume, cancelling, resuming, onUpgrade }) {
  const [showCancelModal, setShowCancelModal] = useState(false);
  const isStripeActive = status.last_payment_method === "stripe" && status.active;
  const isFree = !status.plan || status.plan === "free";

  return (
    <>
      {showCancelModal && (
        <CancelConfirmModal
          endDate={fmtDate(status.next_subscription)}
          loading={cancelling}
          onClose={() => setShowCancelModal(false)}
          onConfirm={async () => { await onCancel(); setShowCancelModal(false); }}
        />
      )}
      <div className="sub-card fx-centered fx-col" style={{ rowGap: "14px" }}>
        <div className="fit-container fx-scattered">
          <h4>Current plan</h4>
          <PlanBadge plan={status.plan || "free"} />
        </div>

        {status.in_trial && (
          <div
            className="fit-container round-corner-m box-pad-h-m box-pad-v-m fx-scattered sc-s"
            style={{ gap: "12px" }}
          >
            <div style={{ display: "flex", flexDirection: "column", rowGap: "2px" }}>
              <p style={{ fontWeight: 600 }}>Trial active</p>
              <p className="gray-c p-medium">Ends {fmtDate(status.trial_ends_at)}</p>
            </div>
            <button className="btn btn-normal" style={{ flexShrink: 0 }} onClick={onUpgrade}>
              Upgrade
            </button>
          </div>
        )}

        {status.cancel_at_period_end && (
          <div className="fit-container round-corner fx-centered box-pad-h-m box-pad-v-s" style={{ backgroundColor: "rgba(247,88,22,0.08)", border: "1px solid var(--c1)" }}>
            <p style={{ color: "var(--c1)" }}>Subscription ending on {fmtDate(status.next_subscription)} — will revert to Free</p>
          </div>
        )}

        {!status.cancel_at_period_end && status.active && status.next_subscription > 0 && (
          <div className="fit-container fx-scattered">
            <p className="gray-c">Next renewal</p>
            <p>{fmtDate(status.next_subscription)}</p>
          </div>
        )}

        {status.last_payment_method && (
          <div className="fit-container fx-scattered">
            <p className="gray-c">Payment method</p>
            <PaymentMethodIcon method={status.last_payment_method} />
          </div>
        )}

        {status.last_subscription > 0 && status.history?.length > 0 && (
          <div className="fit-container fx-scattered">
            <p className="gray-c">Last payment</p>
            <p>{fmtDate(status.last_subscription)}</p>
          </div>
        )}

        {isFree && (
          <button className="btn btn-normal btn-full" onClick={onUpgrade}>Upgrade plan</button>
        )}

        {isStripeActive && (
          <>
            <div className="fit-container" style={{ borderTop: "1px solid var(--dim-gray)" }} />
            {status.cancel_at_period_end ? (
              <div className="fit-container fx-centered fx-col" style={{ rowGap: "8px" }}>
                <p className="gray-c p-centered p-medium">Your subscription ends on {fmtDate(status.next_subscription)}. Resume to keep access after that date.</p>
                <button className="btn btn-normal btn-full" onClick={onResume} disabled={resuming}>{resuming ? <LoadingDots /> : "Resume subscription"}</button>
              </div>
            ) : (
              <div className="fit-container fx-centered fx-col" style={{ rowGap: "8px" }}>
                <button className="btn btn-red btn-full" onClick={() => setShowCancelModal(true)} disabled={cancelling}>{cancelling ? <LoadingDots /> : "Cancel subscription"}</button>
                <p className="gray-c p-centered p-medium">Cancelling will keep your access until the end of the current billing period.</p>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}

function PendingChangeCard({ status, onCancelChange, cancellingChange }) {
  if (!status.pending_plan) return null;
  return (
    <div className="sub-card fx-centered fx-col" style={{ rowGap: "12px", border: "1px solid var(--c1)" }}>
      <div className="fit-container fx-scattered">
        <h4>Pending plan change</h4>
        <PlanBadge plan={status.pending_plan} />
      </div>
      <div className="fit-container fx-centered fx-col" style={{ rowGap: "6px" }}>
        <div className="fit-container fx-scattered">
          <p className="gray-c">Change</p>
          <div className="fx-centered" style={{ columnGap: "6px" }}>
            <PlanBadge plan={status.plan} /><span className="gray-c">→</span><PlanBadge plan={status.pending_plan} />
          </div>
        </div>
        <div className="fit-container fx-scattered"><p className="gray-c">Takes effect on</p><p>{fmtDate(status.next_subscription)}</p></div>
        <div className="fit-container fx-scattered"><p className="gray-c">Scheduled on</p><p>{fmtDate(status.pending_plan_since)}</p></div>
      </div>
      <button className="btn btn-gst btn-full" onClick={onCancelChange} disabled={cancellingChange}>{cancellingChange ? <LoadingDots /> : "Cancel this change"}</button>
    </div>
  );
}

function ActionsCard({ status, onChangePlan, changingPlan }) {
  if (status.last_payment_method !== "stripe" || !status.active) return null;

  const hasPending = !!status.pending_plan;
  const currentPlanIdx = planOrder(status.plan);

  return (
    <div className="sub-card fx-centered fx-col fx-start-v" style={{ rowGap: "16px" }}>
      <h4>Manage plans</h4>
      <div className="fit-container fx-centered fx-stretch" style={{ gap: "12px", alignItems: "stretch" }}>
        {PLANS.map((plan) => {
          const isCurrent = plan.id === status.plan;
          const isUpgrade = planOrder(plan.id) > currentPlanIdx;
          const isLoading = changingPlan === plan.id;
          return (
            <div key={plan.id} className="sub-plan-card bg-dropdown" style={isCurrent ? { outline: "1px solid var(--c1)", outlineOffset: "-1px" } : {}}>
              {isCurrent && (
                <div style={{ position: "absolute", top: 14, right: 16 }}>
                  <span style={{ fontWeight: 700, fontSize: "0.72rem", color: "var(--c1)", background: "rgba(247,88,22,0.12)", borderRadius: "999px", padding: "2px 10px" }}>Current plan</span>
                </div>
              )}
              <div>
                <div className="sub-plan-name">{plan.name}</div>
                <div className="sub-plan-price-row">
                  <span className="sub-plan-amount">${plan.price}</span>
                  <span className="gray-c" style={{ fontSize: "0.875rem" }}>{plan.period}</span>
                </div>
                <p style={{ fontSize: "0.78rem", color: "var(--c1)", fontWeight: 600 }}>~{plan.sats} sats / month</p>
                <p className="sub-plan-desc">{plan.desc}</p>
              </div>
              <div className="sub-plan-divider" />
              <ul className="sub-plan-features">
                {plan.features.map((f) => (
                  <li key={f.text} className={`sub-plan-feature${f.dim ? " sub-plan-feature-dim" : ""}`}>
                    <span className="sub-plan-feature-icon">{f.dim ? "–" : "✓"}</span>
                    {f.text}
                  </li>
                ))}
              </ul>
              <button
                className={`btn ${plan.highlighted ? "btn-normal" : "btn-gst"} btn-full`}
                style={{ opacity: isCurrent || (hasPending && !isCurrent) ? 0.5 : 1 }}
                disabled={isCurrent || hasPending || isLoading}
                onClick={() => !isCurrent && !hasPending && onChangePlan({ new_plan: plan.id, new_price_id: plan.price_id })}
              >
                {isLoading ? <LoadingDots /> : isCurrent ? "Current plan" : isUpgrade ? "Upgrade" : "Downgrade"}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function PaymentHistoryCard({ history }) {
  if (!history || history.length === 0) return null;
  return (
    <div className="sub-card fx-centered fx-col fx-start-v" style={{ rowGap: "12px" }}>
      <h4>Payment history</h4>
      <div className="fit-container fx-centered fx-col" style={{ rowGap: "8px" }}>
        {[...history].reverse().map((entry, i) => (
          <div key={i} className="fit-container fx-scattered sc-s box-pad-h-m box-pad-v-s">
            <div className="fx-centered" style={{ columnGap: "10px" }}>
              <PlanBadge plan={entry.plan} />
              <PaymentMethodIcon method={entry.last_payment_method} />
            </div>
            <p className="gray-c">{fmtDate(entry.last_subscription)}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function SubscriptionPage() {
  const isConnectedToYaki = useSelector((state) => state.isConnectedToYaki);
  const userKeys = useSelector((state) => state.userKeys);
  const [showLoginWithAPI, setShowLoginWithAPI] = useState(false);
  const [showUpgrade, setShowUpgrade] = useState(false);

  const { status, loading, error, fetch, cancel, cancelling, resume, resuming, changePlan, changingPlan, cancelChange, cancellingChange } = useSubscription();

  useEffect(() => {
    if (isConnectedToYaki) fetch();
  }, [isConnectedToYaki]);

  return (
    <>
      {showLoginWithAPI && <LoginWithAPI exit={() => setShowLoginWithAPI(false)} />}
      {showUpgrade && <UpgradeOverlay onClose={() => setShowUpgrade(false)} userPub={userKeys?.pub} />}

      <div className="fx-centered fx-col fx-start-v" style={{ maxWidth: 720, margin: "0 auto", padding: "24px 16px 48px", rowGap: "16px" }}>
        {!isConnectedToYaki ? (
          <div className="sub-card fx-centered fx-col" style={{ rowGap: "20px", textAlign: "center" }}>
            <div style={{ width: 56, height: 56, borderRadius: "50%", backgroundColor: "rgba(247,88,22,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Icon name="cup" size={28} />
            </div>
            <div style={{ display: "flex", flexDirection: "column", rowGap: "8px" }}>
              <h4>Not connected to Yaki Platform</h4>
              <p className="gray-c p-centered">Connect to the Yaki platform to view and manage your subscription.</p>
            </div>
            <button className="btn btn-normal" onClick={() => setShowLoginWithAPI(true)}>Connect to Yaki</button>
          </div>
        ) : loading ? (
          <><SkeletonCard /><SkeletonCard /><SkeletonCard /></>
        ) : error ? (
          <div className="sub-card fx-centered fx-col" style={{ rowGap: "12px" }}>
            <Icon name="warning" size={32} />
            <p className="gray-c p-centered">Failed to load subscription data. Please try again.</p>
            <button className="btn btn-gst" onClick={fetch}>Retry</button>
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
                  <p style={{ fontWeight: 600 }}>Note</p>
                  <p className="gray-c p-medium">{status.last_payment_method === "lightning" ? "You can upgrade your plan or switch payment methods once your current billing cycle ends." : "Changing your payment method requires a cancellation of your current subscription, then simply resubscribe once your current billing cycle ends."}</p>
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
