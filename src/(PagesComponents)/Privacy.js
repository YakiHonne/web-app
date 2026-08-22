import React from "react";
import LegalDoc from "@/(PagesComponents)/LegalDoc";

const SECTIONS = [
  { id: "intro", label: "Introduction" },
  { id: "definitions", label: "Definitions" },
  { id: "data-collected", label: "Data we collect" },
  { id: "data-use", label: "How we use it" },
  { id: "data-sharing", label: "Sharing" },
  { id: "rights", label: "Your rights" },
  { id: "children", label: "Children's privacy" },
  { id: "changes", label: "Changes" },
  { id: "contact", label: "Contact" },
];

export default function Privacy() {
  return (
    <LegalDoc
      eyebrow="Legal"
      title="Privacy Policy"
      updated="July 15, 2026"
      current="/privacy"
      sections={SECTIONS}
    >
      <h2 id="intro" data-legal-heading>Introduction</h2>
      <p>
        This Privacy Policy describes how Yakihonne LLC ("the Company", "We", "Us", "Our")
        collects, uses, and discloses information when You use the YakiHonne application
        (the "Service"), and explains Your privacy rights. By using the Service, You agree
        to the collection and use of information in accordance with this Policy.
      </p>

      <h2 id="definitions" data-legal-heading>Definitions</h2>
      <ul>
        <li><strong>Company</strong> refers to Yakihonne LLC, 140 East Broadway, Jackson Hole, Wyoming, United States.</li>
        <li><strong>Country</strong> refers to: United States (Wyoming).</li>
        <li><strong>Application / Service</strong> refers to YakiHonne, the software provided by the Company.</li>
        <li><strong>Account</strong> means a unique account created for You to access the Service.</li>
        <li><strong>Yaki Points</strong> means the non-monetary, in-app engagement points earned by interacting with the Service, redeemable for certain plan or paid-note perks as described in the Terms and Conditions.</li>
        <li><strong>Service Provider</strong> means a third party that processes data on the Company's behalf to help provide the Service.</li>
        <li><strong>You</strong> means the individual or entity accessing or using the Service.</li>
      </ul>

      <h2 id="data-collected" data-legal-heading>Data we collect</h2>

      <h3>Usage Data</h3>
      <p>
        The Service uses <strong>Umami</strong>, a third-party analytics provider, to understand
        how the Service is used. Umami collects aggregate, non-identifying analytics such as
        the pages most visited, regional visit data (country-level), and time of visit.
        Consistent with Umami's own privacy practices, the Company does not collect or retain
        IP addresses, device identifiers, or cookies through this analytics tool, and Umami
        does not track individual users across websites.
      </p>

      <h3>Payment &amp; Subscription Data</h3>
      <p>
        Subscription plan, billing status, renewal date, and payment method used (card via
        Stripe, Lightning, Yaki Points, or in-app purchase). The Company does not receive,
        process, or store card numbers, billing addresses, or identity documents: card
        payments are completed entirely on Stripe's hosted Checkout page, and Stripe performs
        any identity or KYC verification independently of the Company.
      </p>

      <h3>Lightning Payment Data</h3>
      <p>
        For Lightning-based payments, the Company receives and verifies a Lightning
        invoice/payment confirmation from its own node or payment processor; the underlying
        wallet used to pay is external to the Service and outside the Company's control.
      </p>

      <h3>Google Account Data</h3>
      <p>
        If You choose to sign in with Google, authentication is handled through the Company's
        Pomegranate login flow. The Company receives only the authentication token issued by
        Pomegranate's central server and Your email address from Google — no other Google
        profile data is received. On first sign-in, a Nostr key pair is generated for Your
        Account; on subsequent sign-ins, if a remote signer ("bunker") has already been set
        up, a bunker URL is used to sign events instead of exposing a private key to the
        Company.
      </p>

      <h2 id="data-use" data-legal-heading>How we use it</h2>
      <p>The Company uses collected data to:</p>
      <ul>
        <li>Provide, maintain, and improve the Service;</li>
        <li>Manage Your Account and registration;</li>
        <li>Process, verify, grant, renew, downgrade, or cancel subscriptions and payments;</li>
        <li>Send renewal and billing-related notices;</li>
        <li>Detect and prevent fraud or abuse of Yaki Points, redeem codes, or paid-note publishing;</li>
        <li>Understand aggregate usage trends through Umami analytics.</li>
      </ul>

      <h2 id="data-sharing" data-legal-heading>Sharing of your information</h2>
      <p>The Company shares information only as needed to operate the Service:</p>
      <ul>
        <li><strong>Stripe, Inc.</strong> — as the Company's payment processor for card-based Checkout sessions and in-app purchase billing where applicable.</li>
        <li><strong>Lightning Network infrastructure/providers</strong> — solely to verify that a Lightning invoice issued to You has been paid.</li>
        <li><strong>Umami</strong> — as the Company's analytics provider, for aggregate, non-identifying usage statistics.</li>
        <li><strong>Google / Pomegranate</strong> — for authentication purposes only, when You choose Google Sign-In; limited to Your email address and an authentication token.</li>
        <li><strong>With other users</strong> — content You post or share in public areas of the Service, consistent with the public and pseudonymous nature of the Nostr protocol.</li>
      </ul>
      <p>The Company does not sell Your Personal Data.</p>

      <h2 id="rights" data-legal-heading>Your rights</h2>
      <p>
        You may update, amend, or delete Your account information at any time through Your
        account settings, or by contacting Us. Depending on where You reside, You may have
        additional rights under US state privacy laws (such as the right to know, delete, or
        opt out of certain uses of Your data). To exercise these rights, contact Us using the
        details below.
      </p>

      <h2 id="children" data-legal-heading>Children's privacy</h2>
      <p>
        The Service does not address anyone under the age of 13. The Company does not
        knowingly collect personal data from anyone under 13. If You are a parent or guardian
        aware that Your child has provided Us with personal data, please contact Us so it can
        be removed.
      </p>

      <h2 id="changes" data-legal-heading>Changes to this policy</h2>
      <p>
        We may update this Privacy Policy from time to time. Changes are posted on this page
        and the "Last updated" date above is revised accordingly. You are advised to review
        this Policy periodically.
      </p>

      <h2 id="contact" data-legal-heading>Contact us</h2>
      <p>
        Questions about this Privacy Policy can be sent to{" "}
        <span className="legal-doc-code">info@yakihonne.com</span>
      </p>
    </LegalDoc>
  );
}
