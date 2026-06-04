import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import Overlay from "@/Components/Overlay";

export default function RelayJoinRequest({ handleJoinRequest, exit }) {
  const { t } = useTranslation();
  const [invitCode, setInvitCode] = useState("");

  return (
    <Overlay exit={exit} width={500}>
      <div
        className="box-pad-h box-pad-v fx-centered fx-col slide-up"
      >
        <div className="close" onClick={exit}>
          <div></div>
        </div>
        <h4>{t("AZs7Pyp")}</h4>
        <p className="gray-c p-centered">{t("AMCh0MA")}</p>
        <input
          type="text"
          className="if ifs-full p-centered"
          placeholder={t("AsiB5O1")}
          value={invitCode}
          onChange={(e) => setInvitCode(e.target.value)}
        />
        <button
          className="btn btn-normal btn-full"
          onClick={() => invitCode && handleJoinRequest(invitCode)}
        >
          {t("AUVn44G")}
        </button>
      </div>
    </Overlay>
  );
}
