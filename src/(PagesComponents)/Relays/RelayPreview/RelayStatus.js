import { useTranslation } from "react-i18next";

const RelayStatus = ({ status }) => {
  const { t } = useTranslation();
  if (!status) return null;
  return (
    <div className="sticker sticker-green-side sticker-small fx-centered">
      <div
        style={{
          backgroundColor: "var(--green-main)",
          padding: ".25rem",
          borderRadius: "50%",
        }}
        className="green-pulse"
      ></div>
      {t("Ag1jpnx")}
    </div>
  );
};

export default RelayStatus;
