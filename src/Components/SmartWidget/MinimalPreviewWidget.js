import React, { useState } from "react";
import PreviewWidget from "@/Components/SmartWidget/PreviewWidget";
import { useTranslation } from "react-i18next";
import Overlay from "@/Components/Overlay";

export default function MinimalPreviewWidget({ widget }) {
  const [showFullWidget, setShowFullWidget] = useState(false);
  const { t } = useTranslation();
  return (
    <>
      {showFullWidget && (
        <FullWidget
          widget={widget}
          exit={(e) => {
            e.stopPropagation();
            setShowFullWidget(false);
          }}
        />
      )}
      <div className="fit-container fx-scattered sc-s-18 box-pad-h-m box-pad-v-m">
        <div className="fx-centered fx-col fx-start-h fx-start-v">
          <p>{widget?.title || t("AMvUjqZ")}</p>
          {widget.description && (
            <p className="gray-c p-medium p-two-lines">{widget.description}</p>
          )}
        </div>
        <button
          className="btn btn-normal btn-small"
          onClick={(e) => {
            e.stopPropagation();
            setShowFullWidget(true);
          }}
          style={{minWidth: "max-content"}}
        >
          {t("AYO6i7Y")}
        </button>
      </div>
    </>
  );
}

const FullWidget = ({ widget, exit }) => {
  return (
    <Overlay exit={exit} width={600}>
      <div
        style={{
          maxHeight: "95vh",
          overflow: "scroll",
          backgroundColor: "var(--white)",
        }}
        className="box-pad-h-m"
      >
        <div className="sticky fit-container fx-scattered">
          <h4>{widget?.title}</h4>
          <div className="close" style={{ position: "static" }} onClick={exit}>
            <div></div>
          </div>
        </div>
        <div className="fit-container box-marg-s">
          <PreviewWidget widget={widget?.metadata} />
        </div>
      </div>
    </Overlay>
  );
};
