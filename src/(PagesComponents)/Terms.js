import React from "react";
import Footer from "@/Components/Footer";
import Link from "next/link";

export default function Terms() {
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
            <div
                className="yakihonne-logo"
                style={{ filter: "brightness(0) invert()", height: "64px" }}
              ></div>
            </Link>
          </div>
          <h2 style={{ color: "white" }}>
            End-User License Agreement (EULA) for YakiHonne
          </h2>
          <p>Last updated: October 26, 2023</p>
          <p>
            Please read this End-User License Agreement ("'EULA") carefully
            before downloading, installing, or using the YakiHonne. By using the
            App, you agree to be bound by the terms and conditions of this EULA.
            If you do not agree to the terms and conditions of this EULA, do not
            download, install, or use the App.
          </p>

          <h3 style={{ color: "white" }}>Prohibited Content and Activities</h3>
          <ol className="fx-centered fx-col fx-start-h fx-start-v">
            <li>
              <p>
                Prohibited Content: Users are strictly prohibited from
                uploading, sharing, or promoting content that is illegal,
                offensive, discriminatory, or violates the rights of others,
                including intellectual property rights.
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
                Spamming: The App prohibits spamming activities, including but
                not limited to unsolicited messages, advertisements, or any form
                of intrusive communication.
              </p>
            </li>
          </ol>
          <h3 style={{ color: "white" }}>
            Misrepresentation and Illegal Activities
          </h3>
          <ol className="fx-centered fx-col fx-start-h fx-start-v">
            <li>
              <p>
                <strong>Account</strong> means a unique account created for You
                to access our Service or parts of our Service.
              </p>
            </li>
            <li>
              <p>
                Misrepresentation: Users shall not engage in any form of
                misrepresentation, impersonation, or fraudulent activities
                within the App.
              </p>
            </li>
            <li>
              <p>
                Illegal Activities: The App must not be used for any illegal
                activities, and users are responsible for complying with all
                applicable laws and regulations.
              </p>
            </li>
          </ol>

          <h3 style={{ color: "white" }}>User Content Responsibility</h3>
          <ol>
            <li>
              <p>
                User Content: Users are solely responsible for the content they
                upload, share, or distribute through the App. YakiHonne
                disclaims any liability for user-generated content.
              </p>
            </li>
            <li>
              <p>
                Moderation: YakiHonne reserves the right to moderate, remove, or
                disable content that violates this EULA or is deemed
                inappropriate without prior notice.
              </p>
            </li>
          </ol>
          <h3 style={{ color: "white" }}>Intellectual Property</h3>
          <ol>
            <li>
              <p>
                Ownership: YakiHonne retains all rights, title, and interest in
                and to the App, including its intellectual property. This EULA
                does not grant users any rights to use YakiHonne's trade names,
                trademarks, service marks, logos, domain names, or other
                distinctive brand features.
              </p>
            </li>
          </ol>
          <h3 style={{ color: "white" }}>Governing Law</h3>
          <ol>
            <li>
              <p>
                Applicable Law: This EULA is governed by and construed in
                accordance with the laws of Singapore, without regard to its
                conflict of law principles.
              </p>
            </li>
          </ol>
          <h3 style={{ color: "white" }}>Disclaimer of Warranty</h3>
          <ol>
            <li>
              <p>
                As-Is Basis: The App is provided "as is" without any warranty,
                express or implied, including but not limited to the implied
                warranties of fitness for a particular purpose, or
                non-infringement.
              </p>
            </li>
            <li>
              <p>
                No Warranty of Security: YakiHonne does not warrant that the App
                will be error-free or uninterrupted, and YakiHonne does not make
                any warranty regarding the quality, accuracy, reliability, or
                suitability of our app for any particular purpose.
              </p>
            </li>
          </ol>

          <p>
            For questions or concerns about this EULA, please contact Yakihonne
            at{" "}
            <span className="orange-c">dev@yakihonne.com</span>
          </p>
        </div>
        <div className="fit-container box-pad-v" style={{filter: "brightness(0) invert()"}}>
          <Footer />
        </div>
      </div>
    </div>
  );
}
