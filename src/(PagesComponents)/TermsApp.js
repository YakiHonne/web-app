import React from "react";
import LegalDoc from "@/(PagesComponents)/LegalDoc";

const SECTIONS = [
  { id: "acknowledgement", label: "Acknowledgement" },
  { id: "scope", label: "Scope of license" },
  { id: "conduct", label: "Prohibited conduct" },
  { id: "content", label: "User content & IP" },
  { id: "support", label: "Maintenance and support" },
  { id: "subscriptions", label: "Subscriptions" },
  { id: "payment-methods", label: "Payment methods" },
  { id: "cancellation", label: "Cancellation" },
  { id: "yaki-points", label: "Yaki Points" },
  { id: "warranty", label: "Warranty" },
  { id: "product-claims", label: "Product claims" },
  { id: "legal-compliance", label: "Legal compliance" },
  { id: "third-party-terms", label: "Third party terms" },
  { id: "third-party-beneficiary", label: "Third party beneficiary" },
  { id: "law", label: "Governing law" },
  { id: "contact", label: "Contact" },
];

export default function TermsApp() {
  return (
    <LegalDoc
      eyebrow="Legal"
      title="End User License Agreement"
      updated="August 20, 2026"
      sections={SECTIONS}
      hideNav
    >
      <p>
        These Terms and Conditions ("Terms" or "EULA") govern Your use of the YakiHonne
        mobile application (the "App"), operated by{" "}
        <strong>JUSTHONNE TECHNOLOGY SDN BHD</strong> ("Company", "We", "Us", or "You" as
        the developer).
      </p>

      <h2 id="acknowledgement" data-legal-heading>Acknowledgement</h2>
      <p>
        This EULA is concluded solely between You (the end user) and JUSTHONNE TECHNOLOGY
        SDN BHD, and <strong>not with Apple Inc. ("Apple")</strong>. JUSTHONNE TECHNOLOGY
        SDN BHD, not Apple, is solely responsible for the App and the content thereof. This
        EULA does not provide for usage rules for the App that are in conflict with the
        Apple Media Services Terms and Conditions.
      </p>

      <h2 id="scope" data-legal-heading>Scope of license</h2>
      <p>
        The Company grants You a limited, non-transferable, non-exclusive, revocable license
        to use the App on any Apple-branded products that You own or control, and as
        permitted by the Usage Rules set forth in the Apple Media Services Terms and
        Conditions. This license does not allow You to use the App on any device that You do
        not own or control, and You may not distribute or make the App available over a
        network where it could be used by multiple devices at the same time. The App may be
        accessed and used by other accounts associated with the purchaser via Family Sharing
        or volume purchasing.
      </p>

      <h2 id="conduct" data-legal-heading>Prohibited conduct</h2>
      <p>You agree not to:</p>
      <ul>
        <li>Upload, share, or promote content that is illegal, offensive, discriminatory, or violates the rights of others, including intellectual property rights.</li>
        <li>Engage in activities that compromise the security of the App, its users, or any associated networks.</li>
        <li>Send unsolicited messages, advertisements, or any form of intrusive communication (spamming).</li>
        <li>Impersonate others or engage in fraudulent activity within the App.</li>
        <li>Use the App for any illegal purpose. You are solely responsible for complying with all applicable laws.</li>
      </ul>
      <p>
        The Company has zero tolerance for objectionable content or abusive users and
        reserves the right to remove content and/or terminate accounts that violate these
        Terms.
      </p>

      <h2 id="content" data-legal-heading>User content &amp; intellectual property</h2>
      <p>
        You are solely responsible for any content You upload, share, or publish through the
        App. The Company disclaims any liability for user-generated content and reserves the
        right to moderate, remove, or disable content that violates these Terms.
      </p>
      <p>
        The Company retains all rights, title, and interest in and to the App, including its
        intellectual property. These Terms do not grant You any rights to use YakiHonne's
        trade names, trademarks, service marks, logos, or other distinctive brand features.
      </p>
      <p>
        In the event of any third-party claim that the App or Your possession and use of the
        App infringes that third party's intellectual property rights, JUSTHONNE TECHNOLOGY
        SDN BHD, <strong>not Apple</strong>, will be solely responsible for the
        investigation, defense, settlement, and discharge of any such intellectual property
        infringement claim.
      </p>

      <h2 id="support" data-legal-heading>Maintenance and support</h2>
      <p>
        JUSTHONNE TECHNOLOGY SDN BHD is solely responsible for providing any maintenance and
        support services with respect to the App. You and the Company acknowledge that{" "}
        <strong>Apple has no obligation whatsoever</strong> to furnish any maintenance and
        support services with respect to the App.
      </p>

      <h2 id="subscriptions" data-legal-heading>Subscriptions</h2>
      <p>
        YakiHonne may offer subscription plans that unlock additional features and tools.
      </p>
      <ul>
        <li><strong>Free trial:</strong> new users may receive a free trial of certain plans. The Company may, at its sole discretion, grant, extend, withhold, or decline to grant a trial to any user.</li>
        <li><strong>Price changes:</strong> the Company may change subscription prices at any time. If a price changes, any active subscription under the old price will continue until the end of its current billing period; continued access thereafter requires the user to resubscribe under the new pricing.</li>
        <li><strong>Renewal notices:</strong> for all payment methods, the Company will show in-app messages on three consecutive days before a subscription renews or is cancelled/expires.</li>
      </ul>

      <h2 id="payment-methods" data-legal-heading>Payment methods</h2>
      <table className="legal-doc-table">
        <thead>
          <tr><th>Method</th><th>How it works</th></tr>
        </thead>
        <tbody>
          <tr>
            <td>Stripe Checkout (web)</td>
            <td>Card payment completed entirely on Stripe's hosted checkout page; card cancellation and resumption are supported in-app.</td>
          </tr>
          <tr>
            <td>Lightning invoice (QR code)</td>
            <td>Payment is made outside the App using the user's own Lightning wallet and verified by the Company's server once settled. No in-app cancel button; the subscription is simply not renewed and access ends at period end.</td>
          </tr>
        </tbody>
      </table>

      <h2 id="cancellation" data-legal-heading>Cancellation</h2>
      <p>
        Subscriptions paid by card support explicit in-app cancellation and resumption at any
        time before the period ends. Subscriptions paid via Lightning do not have an explicit
        cancellation control, since there is no stored payment method to charge again; they
        simply expire automatically at the end of the paid period unless a new invoice is
        paid.
      </p>

      <h2 id="yaki-points" data-legal-heading>Yaki Points</h2>
      <p>
        Yaki Points are awarded for engaging with the platform (publishing, reactions, zaps,
        and other qualifying actions) and reflect a user's level and standing. They have no
        cash value, cannot be purchased, transferred, or exchanged for cash, and are not a
        means of payment for subscriptions or any other feature of the App.
      </p>

      <h2 id="warranty" data-legal-heading>Warranty</h2>
      <p>
        The App is provided "as is" and "as available" without any warranty, express or
        implied, including but not limited to the implied warranties of merchantability,
        fitness for a particular purpose, or non-infringement. The Company does not warrant
        that the App will be error-free or uninterrupted.
      </p>
      <p>
        To the maximum extent permitted by applicable law, JUSTHONNE TECHNOLOGY SDN BHD is
        solely responsible for any product warranties. In the event of any failure of the App
        to conform to any applicable warranty, You may notify Apple, and Apple will refund
        the purchase price for the App to You. To the maximum extent permitted by applicable
        law, Apple will have no other warranty obligation whatsoever with respect to the App,
        and any other claims, losses, liabilities, damages, costs, or expenses attributable
        to any failure to conform to any warranty will be JUSTHONNE TECHNOLOGY SDN BHD's sole
        responsibility.
      </p>

      <h2 id="product-claims" data-legal-heading>Product claims</h2>
      <p>
        You and the Company acknowledge that JUSTHONNE TECHNOLOGY SDN BHD,{" "}
        <strong>not Apple</strong>, is responsible for addressing any claims of Yours or any
        third party relating to the App or Your possession and/or use of the App, including
        but not limited to: (i) product liability claims; (ii) any claim that the App fails
        to conform to any applicable legal or regulatory requirement; and (iii) claims
        arising under consumer protection, privacy, or similar legislation. This EULA does
        not limit JUSTHONNE TECHNOLOGY SDN BHD's liability to You beyond what is permitted by
        applicable law.
      </p>

      <h2 id="legal-compliance" data-legal-heading>Legal compliance</h2>
      <p>
        You represent and warrant that (i) You are not located in a country that is subject
        to a U.S. Government embargo, or that has been designated by the U.S. Government as a
        "terrorist supporting" country; and (ii) You are not listed on any U.S. Government
        list of prohibited or restricted parties.
      </p>

      <h2 id="third-party-terms" data-legal-heading>Third party terms of agreement</h2>
      <p>
        You must comply with applicable third-party terms of agreement when using the App
        (for example, Your wireless data service agreement or any other third-party service
        terms that apply to Your use of the App).
      </p>

      <h2 id="third-party-beneficiary" data-legal-heading>Third party beneficiary</h2>
      <p>
        You and the Company acknowledge and agree that Apple, and Apple's subsidiaries, are
        third-party beneficiaries of this EULA, and that, upon Your acceptance of the terms
        and conditions of this EULA, Apple will have the right (and will be deemed to have
        accepted the right) to enforce this EULA against You as a third-party beneficiary
        thereof.
      </p>

      <h2 id="law" data-legal-heading>Governing law</h2>
      <p>
        These Terms are governed by and construed in accordance with the laws of Malaysia,
        without regard to conflict of law principles.
      </p>

      <h2 id="contact" data-legal-heading>Contact</h2>
      <p>
        Questions, complaints, or claims with respect to the App should be directed to:
      </p>
      <p>
        <strong>JUSTHONNE TECHNOLOGY SDN BHD</strong>
        <br />
        V Office 1, Lingkaran SV, Sunway Velocity, 55100 Kuala Lumpur, Wilayah Persekutuan
        Kuala Lumpur, Malaysia
        <br />
        Email: <span className="legal-doc-code">info@yakihonne.com</span>
        <br />
        Phone: <span className="legal-doc-code">+601153919618</span>
      </p>
    </LegalDoc>
  );
}
