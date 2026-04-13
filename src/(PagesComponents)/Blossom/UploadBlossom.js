import Overlay from "@/Components/Overlay";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import FileDragAndDropWrapper from "./FileDragAndDropWrapper";

export default function UploadBlossom({ exit }) {
  const { t } = useTranslation();
  const [fileUrl, setFileUrl] = useState("");
  const [file, setFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  return (
    <Overlay exit={exit}>
      <div className="fx-centered fx-col box-pad-h-m box-pad-v-m">
        <h4>{t("AiINSld")}</h4>
        <FileDragAndDropWrapper
          title={t("A5AaVbz")}
          description={t("AGrXxV8")}
          isLoading={isLoading}
          onChange={() => null}
          fileUrl={fileUrl}
        />
      </div>
    </Overlay>
  );
}
