import React, { useEffect, useState } from "react";
import { getStorageEstimate } from "@/Helpers/Helpers";
import { useTranslation } from "react-i18next";
import Link from "next/link";

export default function WarningBar() {
  const { t } = useTranslation();
  const [show, setShow] = useState(false);

  useEffect(() => {
    const checkStorage = async () => {
      let isClosed = localStorage.getItem("warning-bar-closed") || false;
      if (isClosed) return;
      let size = await getStorageEstimate();
      if (size > 1200) {
        setShow(true);
      } else {
        setShow(false);
      }
    };
    checkStorage();
  }, []);

  const handleCloseWarningBar = () => {
    localStorage.setItem("warning-bar-closed", `${Date.now()}`);
    setShow(false);
  };

  if (!show) return null;
  return (
    <div
      style={{
        position: "fixed",
        left: 0,
        bottom: 0,
        backgroundColor: "var(--c1)",
        zIndex: 1000,
      }}
      className="box-pad-h fx-centered fit-container slide-up"
    >
      <div className="fit-container fx-centered">
        <p style={{ color: "white" }}>
          {t("AG1GvYp")}{" "}
          <Link href="/settings" state={{tab: "cache"}}>
            <button className="btn btn-text-gray" style={{ color: "black" }}>
              {t("AAazvst")}
            </button>
          </Link>
        </p>
      </div>
      <div>
        <div
          className="close pointer"
          style={{ position: "static", filter: "invert()" }}
          onClick={handleCloseWarningBar}
        >
          <div></div>
        </div>
      </div>
    </div>
  );
}
