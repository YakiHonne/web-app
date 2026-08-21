import React from "react";
import Footer from "@/Components/Footer";
import Link from "next/link";
import Icon from "@/Components/Icon";

export default function TermsAppLegacy() {
  return (
    <div
      className="fx-centered box-pad-h box-pad-v fx-start-v"
      style={{ backgroundColor: "black", minHeight: "100vh" }}
    >
      <div style={{ width: "min(100%, 1000px)",}}>
        <div
          className="fx-centered fx-col fx-start-v fx-start-h"
          style={{ rowGap: "20px", color: "white" }}
        >
          <div
            className="box-pad-h-s box-pad-v-s sc-s-18 fit-container fx-centered"
            style={{
              backgroundColor: "#202020",
              position: "sticky",
              border: "none",
              top: "1rem",
              zIndex: 100,
            }}
          >
            <Link href={"/"} className="fx-centered">
              <Icon
                name="yakihonne-logo"
                className="yakihonne-logo"
                style={{ filter: "brightness(0) invert()", height: "64px" }}
              />
            </Link>
          </div>
          <h2 style={{ color: "white" }}>
            YakiHonne End User License Agreement (EULA)
          </h2>
          <p>Effective Date: August 20, 2026</p>
          <p>
            These Terms and Conditions ("Terms" or "EULA") govern Your use of the
            YakiHonne mobile application (the "App"), operated by JUSTHONNE
            TECHNOLOGY SDN BHD ("Company", "We", "Us", or "You" as the developer).
          </p>

          <h3 style={{ color: "white" }}>Acknowledgement</h3>
          <ol className="fx-centered fx-col fx-start-h fx-start-v">
            <li>
              <p>
                This EULA is concluded solely between You (the end user) and
                JUSTHONNE TECHNOLOGY SDN BHD, and not with Apple Inc. ("Apple").
                JUSTHONNE TECHNOLOGY SDN BHD, not Apple, is solely responsible for
                the App and the content thereof. This EULA does not provide for
                usage rules for the App that are in conflict with the Apple Media
                Services Terms and Conditions.
              </p>
            </li>
          </ol>

          <h3 style={{ color: "white" }}>Scope of License</h3>
          <ol className="fx-centered fx-col fx-start-h fx-start-v">
            <li>
              <p>
                The Company grants You a limited, non-transferable, non-exclusive,
                revocable license to use the App on any Apple-branded products that
                You own or control, and as permitted by the Usage Rules set forth in
                the Apple Media Services Terms and Conditions. This license does not
                allow You to use the App on any device that You do not own or
                control, and You may not distribute or make the App available over a
                network where it could be used by multiple devices at the same time.
                The App may be accessed and used by other accounts associated with
                the purchaser via Family Sharing or volume purchasing.
              </p>
            </li>
          </ol>

          <h3 style={{ color: "white" }}>Prohibited Conduct</h3>
          <ol className="fx-centered fx-col fx-start-h fx-start-v">
            <li>
              <p>
                Prohibited Content: Users shall not upload, share, or promote
                content that is illegal, offensive, discriminatory, or violates the
                rights of others, including intellectual property rights.
              </p>
            </li>
            <li>
              <p>
                Security Compromise: Users shall not engage in activities that
                compromise the security of the App, its users, or any associated
                networks.
              </p>
            </li>
            <li>
              <p>
                Spamming: Users shall not send unsolicited messages,
                advertisements, or any form of intrusive communication.
              </p>
            </li>
            <li>
              <p>
                Misrepresentation: Users shall not impersonate others or engage in
                fraudulent activity within the App.
              </p>
            </li>
            <li>
              <p>
                Illegal Activities: The App must not be used for any illegal
                purpose. Users are solely responsible for complying with all
                applicable laws.
              </p>
            </li>
          </ol>
          <p>
            The Company has zero tolerance for objectionable content or abusive
            users and reserves the right to remove content and/or terminate
            accounts that violate these Terms.
          </p>

          <h3 style={{ color: "white" }}>User Content and Intellectual Property</h3>
          <ol className="fx-centered fx-col fx-start-h fx-start-v">
            <li>
              <p>
                User Content: You are solely responsible for any content You upload,
                share, or publish through the App. The Company disclaims any
                liability for user-generated content and reserves the right to
                moderate, remove, or disable content that violates these Terms.
              </p>
            </li>
            <li>
              <p>
                Ownership: The Company retains all rights, title, and interest in
                and to the App, including its intellectual property. These Terms do
                not grant You any rights to use YakiHonne's trade names, trademarks,
                service marks, logos, or other distinctive brand features.
              </p>
            </li>
            <li>
              <p>
                Infringement Claims: In the event of any third-party claim that the
                App or Your possession and use of the App infringes that third
                party's intellectual property rights, JUSTHONNE TECHNOLOGY SDN BHD,
                not Apple, will be solely responsible for the investigation,
                defense, settlement, and discharge of any such intellectual property
                infringement claim.
              </p>
            </li>
          </ol>

          <h3 style={{ color: "white" }}>Maintenance and Support</h3>
          <ol className="fx-centered fx-col fx-start-h fx-start-v">
            <li>
              <p>
                JUSTHONNE TECHNOLOGY SDN BHD is solely responsible for providing any
                maintenance and support services with respect to the App. You and
                the Company acknowledge that Apple has no obligation whatsoever to
                furnish any maintenance and support services with respect to the
                App.
              </p>
            </li>
          </ol>

          <h3 style={{ color: "white" }}>Subscriptions</h3>
          <p>
            YakiHonne may offer subscription plans that unlock additional features
            and tools.
          </p>
          <ol className="fx-centered fx-col fx-start-h fx-start-v">
            <li>
              <p>
                Free trial: New users may receive a free trial of certain plans. The
                Company may, at its sole discretion, grant, extend, withhold, or
                decline to grant a trial to any user.
              </p>
            </li>
            <li>
              <p>
                Price changes: The Company may change subscription prices at any
                time. If a price changes, any active subscription under the old
                price will continue until the end of its current billing period;
                continued access thereafter requires the user to resubscribe under
                the new pricing.
              </p>
            </li>
            <li>
              <p>
                Renewal notices: For all payment methods, the Company will show
                in-app messages on three consecutive days before a subscription
                renews or is cancelled/expires.
              </p>
            </li>
          </ol>

          <h3 style={{ color: "white" }}>Payment Methods</h3>
          <ol className="fx-centered fx-col fx-start-h fx-start-v">
            <li>
              <p>
                Stripe Checkout (web): Card payment completed entirely on Stripe's
                hosted checkout page; card cancellation and resumption are supported
                in-app.
              </p>
            </li>
            <li>
              <p>
                Lightning invoice (QR code): Payment is made outside the App using
                the user's own Lightning wallet and verified by the Company's server
                once settled. No in-app cancel button; the subscription is simply
                not renewed and access ends at period end.
              </p>
            </li>
          </ol>

          <h3 style={{ color: "white" }}>Cancellation</h3>
          <ol className="fx-centered fx-col fx-start-h fx-start-v">
            <li>
              <p>
                Subscriptions paid by card support explicit in-app cancellation and
                resumption at any time before the period ends. Subscriptions paid
                via Lightning do not have an explicit cancellation control, since
                there is no stored payment method to charge again; they simply
                expire automatically at the end of the paid period unless a new
                invoice is paid.
              </p>
            </li>
          </ol>

          <h3 style={{ color: "white" }}>Yaki Points</h3>
          <ol className="fx-centered fx-col fx-start-h fx-start-v">
            <li>
              <p>
                Yaki Points are awarded for engaging with the platform (publishing,
                reactions, zaps, and other qualifying actions) and reflect a user's
                level and standing. They have no cash value, cannot be purchased,
                transferred, or exchanged for cash, and are not a means of payment
                for subscriptions or any other feature of the App.
              </p>
            </li>
          </ol>

          <h3 style={{ color: "white" }}>Warranty</h3>
          <ol className="fx-centered fx-col fx-start-h fx-start-v">
            <li>
              <p>
                As-Is Basis: The App is provided "as is" and "as available" without
                any warranty, express or implied, including but not limited to the
                implied warranties of merchantability, fitness for a particular
                purpose, or non-infringement. The Company does not warrant that the
                App will be error-free or uninterrupted.
              </p>
            </li>
            <li>
              <p>
                To the maximum extent permitted by applicable law, JUSTHONNE
                TECHNOLOGY SDN BHD is solely responsible for any product warranties.
                In the event of any failure of the App to conform to any applicable
                warranty, You may notify Apple, and Apple will refund the purchase
                price for the App to You. To the maximum extent permitted by
                applicable law, Apple will have no other warranty obligation
                whatsoever with respect to the App, and any other claims, losses,
                liabilities, damages, costs, or expenses attributable to any failure
                to conform to any warranty will be JUSTHONNE TECHNOLOGY SDN BHD's
                sole responsibility.
              </p>
            </li>
          </ol>

          <h3 style={{ color: "white" }}>Product Claims</h3>
          <ol className="fx-centered fx-col fx-start-h fx-start-v">
            <li>
              <p>
                You and the Company acknowledge that JUSTHONNE TECHNOLOGY SDN BHD,
                not Apple, is responsible for addressing any claims of Yours or any
                third party relating to the App or Your possession and/or use of the
                App, including but not limited to: (i) product liability claims;
                (ii) any claim that the App fails to conform to any applicable legal
                or regulatory requirement; and (iii) claims arising under consumer
                protection, privacy, or similar legislation. This EULA does not
                limit JUSTHONNE TECHNOLOGY SDN BHD's liability to You beyond what is
                permitted by applicable law.
              </p>
            </li>
          </ol>

          <h3 style={{ color: "white" }}>Legal Compliance</h3>
          <ol className="fx-centered fx-col fx-start-h fx-start-v">
            <li>
              <p>
                You represent and warrant that (i) You are not located in a country
                that is subject to a U.S. Government embargo, or that has been
                designated by the U.S. Government as a "terrorist supporting"
                country; and (ii) You are not listed on any U.S. Government list of
                prohibited or restricted parties.
              </p>
            </li>
          </ol>

          <h3 style={{ color: "white" }}>Third Party Terms of Agreement</h3>
          <ol className="fx-centered fx-col fx-start-h fx-start-v">
            <li>
              <p>
                You must comply with applicable third-party terms of agreement when
                using the App (for example, Your wireless data service agreement or
                any other third-party service terms that apply to Your use of the
                App).
              </p>
            </li>
          </ol>

          <h3 style={{ color: "white" }}>Third Party Beneficiary</h3>
          <ol className="fx-centered fx-col fx-start-h fx-start-v">
            <li>
              <p>
                You and the Company acknowledge and agree that Apple, and Apple's
                subsidiaries, are third-party beneficiaries of this EULA, and that,
                upon Your acceptance of the terms and conditions of this EULA, Apple
                will have the right (and will be deemed to have accepted the right)
                to enforce this EULA against You as a third-party beneficiary
                thereof.
              </p>
            </li>
          </ol>

          <h3 style={{ color: "white" }}>Governing Law</h3>
          <ol className="fx-centered fx-col fx-start-h fx-start-v">
            <li>
              <p>
                Applicable Law: These Terms are governed by and construed in
                accordance with the laws of Malaysia, without regard to conflict of
                law principles.
              </p>
            </li>
          </ol>

          <h3 style={{ color: "white" }}>Contact</h3>
          <p>
            Questions, complaints, or claims with respect to the App should be
            directed to:
          </p>
          <p>
            JUSTHONNE TECHNOLOGY SDN BHD
            <br />
            V Office 1, Lingkaran SV, Sunway Velocity, 55100 Kuala Lumpur, Wilayah
            Persekutuan Kuala Lumpur, Malaysia
            <br />
            Email: <span className="orange-c">info@yakihonne.com</span>
            <br />
            Phone: <span className="orange-c">+601153919618</span>
          </p>
        </div>
        <div className="fit-container box-pad-v" style={{filter: "brightness(0) invert()"}}>
          <Footer />
        </div>
      </div>
    </div>
  );
}
