import React, { useState } from "react";
import LoadingDots from "@/Components/LoadingDots";
import NProfilePreviewer from "@/Components/NProfilePreviewer";
import UserSearchBar from "@/Components/UserSearchBar";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { sendMessage } from "@/Helpers/DMHelpers";

export default function InitiConvo({ exit, receiver = false }) {
  const { t } = useTranslation();
  const userKeys = useSelector((state) => state.userKeys);
  const [selectedPerson, setSelectedPerson] = useState(receiver || "");
  const [message, setMessage] = useState("");
  const [legacy, setLegacy] = useState(
    userKeys.sec || window?.nostr?.nip44
      ? localStorage.getItem("legacy-dm")
      : true
  );
  const [isLoading, setIsLoading] = useState(false);

  const handleSendMessage = async () => {
    if (!message || !selectedPerson) return;
    setIsLoading(true);
    let response = await sendMessage(selectedPerson, message);
    if (response) {
      exit();
    }
    setIsLoading(false);
  };

  const handleLegacyDMs = () => {
    if (legacy) {
      localStorage.removeItem("legacy-dm");
      setLegacy(false);
    } else {
      localStorage.setItem("legacy-dm", `${Date.now()}`);
      setLegacy(true);
    }
  };

  return (
    <div className="fixed-container fx-centered box-pad-h">
      <div
        className="box-pad-h box-pad-v sc-s bg-sp"
        style={{
          position: "relative",
          width: "min(100%, 500px)",
          borderColor: !legacy ? "var(--green-main)" : "",
          transition: ".2s ease-in-out",
        }}
      >
        <div className="close" onClick={exit}>
          <div></div>
        </div>
        <h4 className="box-marg-s">{t("AuUoz1R")}</h4>
        <div
          className="fx-centered fx-col fit-container"
          style={{ pointerEvents: isLoading ? "none" : "auto" }}
        >
          {!selectedPerson && <UserSearchBar onClick={setSelectedPerson} />}
          {selectedPerson && (
            <NProfilePreviewer
              pubkey={selectedPerson}
              margin={false}
              close={receiver ? false : true}
              onClose={() => setSelectedPerson("")}
            />
          )}
          <textarea
            className="txt-area ifs-full"
            placeholder={t("ATjclmk")}
            style={{ height: "200px" }}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            disabled={isLoading}
          ></textarea>

          <div className="fit-container fx-scattered">
            <button
              className="btn btn-normal"
              onClick={handleSendMessage}
              disabled={isLoading}
            >
              {isLoading ? <LoadingDots /> : t("AsEtDNy")}
            </button>
            {(userKeys.sec || window?.nostr?.nip44) && (
              <div
                className="fx-centered round-icon-tooltip"
                data-tooltip={legacy ? t("Al6NH4U") : t("AfN9sMV")}
              >
                <p className="p-medium slide-left">{t("ATta6yb")}</p>

                <div
                  className={`toggle ${legacy ? "toggle-dim-gray" : ""} ${
                    !legacy ? "toggle-green" : "toggle-dim-gray"
                  }`}
                  onClick={handleLegacyDMs}
                ></div>
              </div>
            )}
          </div>
          {legacy && (
            <div className="box-pad-h-m box-pad-v-m fx-centered fx-start-h fit-container sc-s-18">
              <div className="info-tt-24"></div>
              <div>
                <p className="c1-c p-medium">{t("AakbxOk")}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
