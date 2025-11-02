import React, { useState } from "react";
import { useTranslation } from "react-i18next";

export default function WOTExplanation({ exit }) {
  const { t } = useTranslation();
  const [isBriefly, setIsBriefly] = useState(true);
  return (
    <div
      className="fixed-container fx-centered box-pad-h"
      onClick={(e) => {
        e.stopPropagation();
        exit();
      }}
    >
      <div
        className="box-pad-h-s box-pad-v-s sc-s bg-sp"
        style={{ width: "min(100%, 550px)", position: "relative", maxHeight: "80vh" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="close" onClick={exit}>
          <div></div>
        </div>
        <div className="box-pad-h fx-centered" style={{ paddingTop: "1rem" }}>
          <h4 className="p-centered">{t("ANBz1p0")}</h4>
        </div>
        <div className="fit-container fx-scattered">
          <div
            className={`list-item-b fx-centered fx ${
              isBriefly ? "selected-list-item-b" : ""
            }`}
            onClick={() => setIsBriefly(true)}
          >
            {t("AvniZu9")}
          </div>
          <div
            className={`list-item-b fx-centered fx ${
              !isBriefly ? "selected-list-item-b" : ""
            }`}
            onClick={() => setIsBriefly(false)}
          >
            {t("AWFqgaZ")}
          </div>
        </div>
        <div className="box-pad-h box-pad-v-m" style={{ overflow: "scroll", maxHeight: "60vh" }}>
          {isBriefly ? (
            <ul>
              <li>
                Your trust score is based on how many of the people you follow
                trust or mute another user.
              </li>
              <li>
                Direct connections — you or someone you follow — are always
                fully trusted.
              </li>
              <li>
                The more trusted contacts that follow someone, the higher their
                score.
              </li>
              <li>
                Being muted by your trusted contacts slightly reduces the score.
              </li>
              <li>
                Scores range from <strong>0–8</strong>, with <strong>10</strong>{" "}
                reserved for directly trusted users.
              </li>
              <li>
                A higher score means the user is generally more trusted within
                your network.
              </li>
            </ul>
          ) : (
            <ul>
              <li>
                <strong>Disabled / direct trust</strong> — Score <code>10</code>{" "}
                if WOT is off, or if the pubkey is you or someone you follow.
              </li>
              <li>
                <strong>Network basis</strong> — Uses your followings’ data
                (each contact's <code>followings</code> and <code>muted</code>{" "}
                lists).
              </li>
              <li>
                <strong>Trust count</strong> — Number of your contacts who
                follow the user (<code>totalTrusting</code>).
              </li>
              <li>
                <strong>Mute count</strong> — Number of your contacts who muted
                the user (<code>totalMuted</code>).
              </li>
              <li>
                <strong>Ratios</strong>
                <ul>
                  <li>
                    <code>trust_ratio = totalTrusting / network_size</code>
                  </li>
                  <li>
                    <code>
                      mute_penalty = (totalMuted / network_size) * 0.5
                    </code>
                  </li>
                </ul>
              </li>
              <li>
                <strong>Base formula</strong> —
                <code>
                  baseScore = (log(1 + trust_ratio * 100) / log(11)) * 8
                </code>
                (gives fast early gains then slows near the top).
              </li>
              <li>
                <strong>Final score</strong> —
                <code>score = clamp(baseScore - mute_penalty, 0, 8)</code>
              </li>
              <li>
                <strong>Trust status</strong> — Considered trusted if{" "}
                <code>score ≥ minScore</code> (default <code>3</code>).
              </li>
              <li>
                <strong>Meaning</strong> — More trusted contacts raise the
                score; mutes slightly reduce it. The score reflects how widely
                the user is trusted within your network.
              </li>
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
