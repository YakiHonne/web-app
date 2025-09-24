import { useTranslation } from "react-i18next";

const RelayRtt = ({ rtt }) => {
    const { t } = useTranslation();
    let rttColor = rtt < 500 ? "green-c" : "";
    rttColor = rtt < 1000 && rtt >= 500 ? "c1-c" : rttColor;
    rttColor = rtt >= 1000 ? "red-c" : rttColor;
    if (!rtt) return null;
    return (
      <div className="round-icon-tooltip" data-tooltip={t("AWN0GAu")}>
        <p className={`${rttColor} p-medium`}>{rtt}ms</p>
      </div>
    );
  };

export default RelayRtt;