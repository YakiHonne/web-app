import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useDispatch } from "react-redux";
import { nanoid } from "nanoid";
import { setToast } from "../../Store/Slides/Publishers";
import Select from "../../Components/Select";

export function AddNewTranslationService({
  services,
  exit,
  refreshServices,
  userKeys,
}) {
  const ref = nanoid();
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const [customService, setCustomService] = useState("");
  const [transServicePlan, setTransServicePlan] = useState(false);
  const [apiKey, setApiKey] = useState("");
  const transServicesPlans = [
    {
      display_name: t("AT4BU58"),
      value: false,
    },
    {
      display_name: t("AEWXA75"),
      value: true,
    },
  ];
  const addNewServer = () => {
    let REGEX = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([\/\w .-]*)*\/?$/;
    if (!REGEX.test(customService)) {
      dispatch(
        setToast({
          type: 2,
          desc: t("A2l1JgC"),
        })
      );
      return;
    }
    const domain =
      customService.split("//")[0] + "//" + customService.split("/")[2];
    const label = customService.split("/")[2];
    const id = `custom-${ref}`;
    let service = {
      id,
      apiKey,
      free: !transServicePlan ? customService : "",
      pro: transServicePlan ? customService : "",
      plans: transServicePlan,
      url: domain,
      label,
    };
    let allServices = { ...services, [id]: service };
    refreshServices({ allServices, newService: service });
    localStorage?.setItem(
      `custom-lang-services-${userKeys.pub}`,
      JSON.stringify(allServices)
    );
  };

  return (
    <div className="fixed-container fx-centered box-pad-h box-pad-v">
      <div
        className="fx-centered fx-col sc-s-18 bg-sp box-pad-h box-pad-v slide-down"
        style={{ width: "min(100%, 400px)", overflow: "visible" }}
      >
        <div className="close" onClick={exit}>
          <div></div>
        </div>
        <h4 className="p-centered">{t("AKYcP6g")}</h4>
        <input
          type="text"
          placeholder={t("A8PtjSa")}
          className="if ifs-full"
          style={{ height: "40px" }}
          value={customService}
          onChange={(e) => setCustomService(e.target.value)}
        />
        <div className="fit-container fx-scattered">
          <input
            type="text"
            placeholder={t("AMbIPen")}
            className={`if ifs-full`}
            style={{ height: "40px" }}
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
          />
          <Select
            options={transServicesPlans}
            value={transServicePlan}
            setSelectedValue={setTransServicePlan}
          />
        </div>

        <button
          className="btn btn-normal btn-full"
          style={{ minWidth: "max-content" }}
          onClick={addNewServer}
        >
          {t("ALyj7Li")}
        </button>
      </div>
    </div>
  );
};

export default AddNewTranslationService;
