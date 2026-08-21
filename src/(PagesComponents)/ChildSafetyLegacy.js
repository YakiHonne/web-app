import React from "react";
import Footer from "@/Components/Footer";
import Link from "next/link";
import Icon from "@/Components/Icon";

export default function ChildSafetyLegacy() {
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
          <h2 style={{ color: "white" }}>Child Safety Standards</h2>
          <p>Effective Date: August 20, 2026</p>
          <p>Operated by: JUSTHONNE TECHNOLOGY SDN BHD</p>
          <p>
            JUSTHONNE TECHNOLOGY SDN BHD is committed to protecting children and
            maintaining a safe environment on the YakiHonne and YakiPro platforms.
            We have zero tolerance for any form of child sexual abuse and
            exploitation (CSAE).
          </p>

          <h3 style={{ color: "white" }}>
            Prohibition of Child Sexual Abuse and Exploitation (CSAE)
          </h3>
          <p>
            We strictly prohibit any content, behavior, or activity that involves,
            promotes, or facilitates:
          </p>
          <ol className="fx-centered fx-col fx-start-h fx-start-v">
            <li>
              <p>
                Child sexual abuse material (CSAM), including any visual depiction
                (photos, videos, drawings, or computer-generated imagery) of a minor
                engaged in sexually explicit conduct.
              </p>
            </li>
            <li>
              <p>Grooming of children for sexual purposes.</p>
            </li>
            <li>
              <p>Sexual exploitation or trafficking of children.</p>
            </li>
            <li>
              <p>Sextortion or any form of coercion involving minors.</p>
            </li>
            <li>
              <p>
                Any other content or conduct that sexually exploits, abuses, or
                endangers children.
              </p>
            </li>
          </ol>
          <p>
            Any user found creating, uploading, sharing, distributing, or soliciting
            such content will have their account permanently banned, and the content
            will be removed immediately.
          </p>

          <h3 style={{ color: "white" }}>
            Child Sexual Abuse Material (CSAM)
          </h3>
          <p>
            We take appropriate action against CSAM upon obtaining actual knowledge
            of it. This includes:
          </p>
          <ol className="fx-centered fx-col fx-start-h fx-start-v">
            <li>
              <p>Immediate removal of the content.</p>
            </li>
            <li>
              <p>
                Permanent suspension or termination of the responsible account(s).
              </p>
            </li>
            <li>
              <p>Preservation of relevant data as required by law.</p>
            </li>
            <li>
              <p>
                Reporting confirmed CSAM to the appropriate authorities, including
                the National Center for Missing &amp; Exploited Children (NCMEC) or
                the relevant regional authority in the applicable jurisdiction.
              </p>
            </li>
          </ol>

          <h3 style={{ color: "white" }}>Reporting Mechanism</h3>
          <p>
            Users can report any suspected CSAE or CSAM content or behavior through
            the following channels:
          </p>
          <ol className="fx-centered fx-col fx-start-h fx-start-v">
            <li>
              <p>
                In-app reporting tools, available within the YakiHonne and YakiPro
                applications.
              </p>
            </li>
            <li>
              <p>
                Email: <span className="orange-c">info@yakihonne.com</span>
              </p>
            </li>
          </ol>
          <p>
            All reports are reviewed promptly. We encourage users to report any
            concerning content or behavior as soon as possible.
          </p>

          <h3 style={{ color: "white" }}>Compliance with Child Safety Laws</h3>
          <p>
            JUSTHONNE TECHNOLOGY SDN BHD complies with all applicable child safety
            laws and regulations, including but not limited to:
          </p>
          <ol className="fx-centered fx-col fx-start-h fx-start-v">
            <li>
              <p>
                Reporting confirmed CSAM to NCMEC or the relevant regional
                authority.
              </p>
            </li>
            <li>
              <p>Cooperating with law enforcement investigations.</p>
            </li>
            <li>
              <p>
                Maintaining internal processes for the detection, review, and
                removal of prohibited content.
              </p>
            </li>
          </ol>

          <h3 style={{ color: "white" }}>Child Safety Point of Contact</h3>
          <p>
            For any inquiries related to child safety, CSAE, or CSAM on our
            platforms, please contact:
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
          <p>
            This designated contact is authorized to speak about our enforcement
            procedures and take necessary action when required.
          </p>

          <h3 style={{ color: "white" }}>Enforcement</h3>
          <p>We reserve the right to:</p>
          <ol className="fx-centered fx-col fx-start-h fx-start-v">
            <li>
              <p>Remove any content that violates these standards.</p>
            </li>
            <li>
              <p>
                Suspend or permanently ban accounts involved in CSAE or CSAM.
              </p>
            </li>
            <li>
              <p>
                Report illegal activity to the relevant authorities without prior
                notice to the user.
              </p>
            </li>
            <li>
              <p>Cooperate fully with law enforcement agencies.</p>
            </li>
          </ol>
          <p>
            These Child Safety Standards form part of our overall Terms of Service
            and Community Guidelines. Violation of these standards will result in
            the strongest possible enforcement actions.
          </p>
        </div>
        <div className="fit-container box-pad-v" style={{filter: "brightness(0) invert()"}}>
          <Footer />
        </div>
      </div>
    </div>
  );
}
