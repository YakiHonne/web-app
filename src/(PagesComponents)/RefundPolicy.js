import React from "react";
import LegalDoc from "@/(PagesComponents)/LegalDoc";

const SECTIONS = [
  { id: "intro", label: "Introduction" },
  { id: "no-refunds", label: "No refunds for change of mind" },
  { id: "exception", label: "Platform error exception" },
  { id: "table", label: "By payment type" },
  { id: "request", label: "How to request" },
];

export default function RefundPolicy() {
  return (
    <LegalDoc
      eyebrow="Legal"
      title="Refund Policy"
      updated="July 15, 2026"
      current="/refund-policy"
      sections={SECTIONS}
    >
      <h2 id="intro" data-legal-heading>Introduction</h2>
      <p>
        This Refund Policy explains when a payment made to YakiHonne, operated by Yakihonne
        LLC, may be refunded. It applies to subscriptions, Paid Notes, and any other paid
        feature of the Service, and should be read together with the Terms and Conditions.
      </p>

      <h2 id="no-refunds" data-legal-heading>No refunds for change of mind</h2>
      <p>
        All payments — regardless of payment method (Stripe Checkout, Lightning, Yaki
        Points, or in-app purchase) — are final. The Company does not issue refunds because a
        user changes their mind, no longer wants a subscription, or did not use a plan or
        Paid Note they paid for.
      </p>

      <h2 id="exception" data-legal-heading>Platform error exception</h2>
      <p>
        A refund will be issued only when a payment resulted in a loss of money with no
        corresponding value received, because of an error on YakiHonne's platform — for
        example, a payment settled but the subscription or perk it paid for was never
        granted. In that case, the Company will refund the payment (including via a Lightning
        payment back to the user, where the original payment was made via Lightning) or grant
        the entitlement that should have been received, whichever the user prefers.
      </p>

      <h2 id="table" data-legal-heading>By payment type</h2>
      <table className="legal-doc-table">
        <thead>
          <tr><th>Payment type</th><th>Refund rule</th></tr>
        </thead>
        <tbody>
          <tr>
            <td>Subscription — Stripe Checkout (card)</td>
            <td>Not refundable except under the platform-error exception above. Where applicable, refunds are issued by Stripe back to the original payment method.</td>
          </tr>
          <tr>
            <td>Subscription — Lightning</td>
            <td>Not refundable except under the platform-error exception above.</td>
          </tr>
          <tr>
            <td>Subscription — in-app purchase (mobile)</td>
            <td>Not refundable by the Company; also subject to the applicable app store's own refund policy, which the user may pursue independently.</td>
          </tr>
          <tr>
            <td>Paid Notes (sats or Yaki Points)</td>
            <td>Not refundable once published, except under the platform-error exception above.</td>
          </tr>
          <tr>
            <td>Yaki Points redemptions</td>
            <td>No monetary refund, since no money changes hands. If a redemption fails to grant the intended plan or perk due to a platform error, the Company will restore the points or grant the intended benefit.</td>
          </tr>
        </tbody>
      </table>

      <h2 id="request" data-legal-heading>How to request a refund</h2>
      <p>
        To report a platform error that resulted in a loss of money without receiving the
        corresponding value, contact the Company either:
      </p>
      <ul>
        <li>via direct message to the official YakiHonne Nostr account, or</li>
        <li>by email at <span className="legal-doc-code">info@yakihonne.com</span></li>
      </ul>
      <p>
        Include the relevant transaction details (payment method, amount, date, and what was
        expected but not received). The Company will review each report against the rule
        above.
      </p>
    </LegalDoc>
  );
}
