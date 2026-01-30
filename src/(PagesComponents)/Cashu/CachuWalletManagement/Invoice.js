import { shortenKey } from "@/Helpers/Encryptions";
import { copyText } from "@/Helpers/Helpers";
import { useTranslation } from "react-i18next";
import QRCode from "react-qr-code";

export default function Invoice({
  invoice,
  exit,
  message,
  title,
  description,
}) {
  const { t } = useTranslation();
  return (
    <div className="fixed-container fx-centered box-pad-h">
      <div
        className="fx-centered fx-col fit-container sc-s bg-sp box-pad-h-m box-pad-v-m"
        style={{ width: "max-content", height: "max-content" }}
      >
        <div className="close" onClick={exit}>
          <div></div>
        </div>
        <h4>{title || t("AvEHTiP")}</h4>
        <p className="gray-c box-pad-v-s box-pad-h p-centered">
          {description || t("ASopYJK")}
        </p>
        <div
          style={{ backgroundColor: "white" }}
          className="sc-s-18 box-pad-h-m box-pad-v-m fx-centered fit-container"
        >
          <QRCode size={320} value={invoice} />
        </div>
        <div
          className="fx-scattered if pointer dashed-onH fit-container"
          style={{ borderStyle: "dashed" }}
          onClick={() => copyText(invoice, message || t("AQmhos7"))}
        >
          <p>{shortenKey(invoice)}</p>
          <div className="copy-24"></div>
        </div>

        <div className="fit-container fx-centered">
          <button
            className="btn btn-normal btn-full"
            onClick={() => {
              exit();
            }}
          >
            {t("AI67awJ")}
          </button>
        </div>
      </div>
    </div>
  );
}
