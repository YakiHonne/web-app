import React, { useState } from "react";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import PostAsNote from "@/Components/PostAsNote";
import { customHistory } from "@/Helpers/History";
import Icon from "@/Components/Icon";
import Overlay from "@/Components/Overlay";

export default function PostNoteWithWidget({ widget, exit, onlyNext = true }) {
  const [next, setNext] = useState(onlyNext);
  const { t } = useTranslation();

  return (
    <Overlay exit={exit} width={500}>
      <div
        style={{
          gap: 0,
        }}
        className="fx-centered fx-centered fx-wrap"
      >
        <div
          className="fit-container fx-scattered sticky"
          style={{ padding: "1rem", backgroundColor: "var(--c1-side)" }}
        >
          {next && (
            <div>
              <h4>{t("AQLVrCw")}</h4>
              <p className="gray-c">{t("AWuY5Lk")}</p>
            </div>
          )}
          {!next && (
            <div className="fit-container fx-centered">
              <h4>{t("AVYs3Uq")}</h4>
            </div>
          )}
          <div className="close" style={{ position: "static" }} onClick={exit}>
            <div></div>
          </div>
        </div>
        {next && (
          <>
            <PostAsNote
              exit={() => customHistory("/smart-widgets")}
              content={widget}
            />
          </>
        )}
        {!next && (
          <div className="box-pad-h box-pad-v fx-centered fit-container">
            <Link
              className="fx fx-centered fx-col sc-s-18 option pointer"
              style={{ height: "200px" }}
              href={"/smart-widgets"}
            >
              <Icon name="arrow" size={36} transform="rotate(-90deg)" />
              <p className="gray-c">{t("AJCyqKE")}</p>
            </Link>
            <div
              className="fx fx-centered fx-col sc-s-18 option pointer"
              style={{ height: "200px" }}
              onClick={() => setNext(true)}
            >
              <Icon name="note" size={36} />
              <h4>{t("ALNe7ey")}</h4>
              <p className="gray-c p-centered box-pad-h">{t("AztCQ11")}</p>
            </div>
          </div>
        )}
      </div>
    </Overlay>
  );
}
