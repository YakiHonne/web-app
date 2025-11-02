import React, { useState, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useDispatch } from "react-redux";
import i18next from "i18next";
import { setToast } from "../../Store/Slides/Publishers";

import Select from "../../Components/Select";
import AddNewTranslationService from "./AddNewTranslationService";
import { translationServices, translationServicesEndpoints } from "@/Content/TranslationServices";
import { getCustomServices } from "@/Helpers/ClientHelpers";
import { getAppLang, getContentTranslationConfig, handleAppDirection, updateContentTranslationConfig } from "@/Helpers/Helpers";
import {supportedLanguage, supportedLanguageKeys} from "@/Content/SupportedLanguages";

export function LanguagesManagement({ selectedTab, setSelectedTab, userKeys }) {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const [selectedAppLang, setSelectedAppLang] = useState(getAppLang());
  const [selectedTransService, setSelectedTransService] = useState("lt");
  const [transServicePlan, setTransServicePlan] = useState(false);
  const [showAPIKey, setShowAPIKey] = useState(false);
  const [transServiceAPIKey, setTransServiceAPIKey] = useState("");
  const [customServicesPlan, setCustomServicesPlan] = useState(
    getCustomServices()
  );
  const customServices = useMemo(() => {
    if (Object.entries(customServicesPlan).length === 0)
      return translationServices;
    return [
      ...translationServices,
      ...Object.entries(customServicesPlan).map(([key, value]) => ({
        display_name: value.label,
        value: key,
        right_el: (
          <div
            className="round-icon-small"
            onClick={(e) => {
              e.stopPropagation();
              handleRemoveService(key);
            }}
          >
            <p className="red-c">&minus;</p>
          </div>
        ),
      })),
    ];
  }, [customServicesPlan]);
  const [showAddCustomService, setShowAddCustomService] = useState(false);
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

  useEffect(() => {
    let transService = getContentTranslationConfig();
    setSelectedTransService(transService.service);
    setTransServicePlan(transService.plan);
    if (!transService.plan) setTransServiceAPIKey(transService.freeApikey);
    if (transService.plan) setTransServiceAPIKey(transService.proApikey);
  }, [selectedTransService]);

  const handleSwitchLang = (value) => {
    if (supportedLanguageKeys.includes(value)) {
      setSelectedAppLang(value);
      i18next.changeLanguage(value);
      localStorage?.setItem("app-lang", value);
      handleAppDirection(value);
    } else {
      dispatch(
        setToast({
          type: 3,
          desc: t("A9WT6DE"),
        })
      );
    }
  };

  const handleTransServices = (value, plan, apikey) => {
    setSelectedTransService(value);
    updateContentTranslationConfig(
      value,
      plan,
      !plan ? apikey : undefined,
      plan ? apikey : undefined
    );
  };
  const handleTransServicesPlan = (value) => {
    setTransServicePlan(value);
    updateContentTranslationConfig(selectedTransService, value);
    let transService = getContentTranslationConfig();
    if (!value) setTransServiceAPIKey(transService.freeApikey);
    if (value) setTransServiceAPIKey(transService.proApikey);
  };
  const handleTransServicesAPIKey = (e) => {
    let value = e.target.value;
    setTransServiceAPIKey(value);
    updateContentTranslationConfig(
      selectedTransService,
      undefined,
      !transServicePlan ? value : undefined,
      transServicePlan ? value : undefined
    );
  };
  const refreshServices = (data) => {
    let data_ = {
      ...data.newService,
    };
    setShowAddCustomService(false);
    handleTransServices(data_.id, data_.plans, data_.apiKey);
    setTransServiceAPIKey(data_.apiKey);
    setTransServicePlan(data_.plans);
    setCustomServicesPlan(data.allServices);
  };
  const handleRemoveService = (value) => {
    let newCustomServicesSet = {
      ...customServicesPlan,
    };
    delete newCustomServicesSet[value];
    setCustomServicesPlan(newCustomServicesSet);
    let oldServices = getContentTranslationConfig();
    try {
      oldServices = JSON.parse(oldServices);
    } catch (err) {
      oldServices = [];
    }
    localStorage?.setItem(
      `custom-lang-services-${userKeys.pub}`,
      JSON.stringify(newCustomServicesSet)
    );
    localStorage?.setItem(
      "content-lang-config",
      JSON.stringify(oldServices.filter((_) => _.service !== value))
    );
    if (value === selectedTransService) {
      handleTransServices("lt");
    }
  };

  return (
    <>
      {showAddCustomService && (
        <AddNewTranslationService
          exit={() => setShowAddCustomService(false)}
          refreshServices={refreshServices}
          services={customServicesPlan}
          userKeys={userKeys}
        />
      )}
      <div
        className={`fit-container fx-scattered fx-col pointer ${selectedTab === "lang" ? "sc-s box-pad-h-s box-pad-v-s" : ""}`}
        style={{
          borderBottom: "1px solid var(--very-dim-gray)",
          gap: 0,
          borderColor: "var(--very-dim-gray)",
          transition: "0.2s ease-in-out",
          borderRadius: 0,
          overflow: "visible"
        }}
      >
        <div
          className="fx-scattered fit-container  box-pad-h-m box-pad-v-m "
          onClick={() =>
            selectedTab === "lang" ? setSelectedTab("") : setSelectedTab("lang")
          }
        >
          <div className="fx-centered fx-start-h fx-start-v">
            <div className="box-pad-v-s">
              <div className="translate-24"></div>
            </div>
            <div>
              <p>{t("ALGYjOG")}</p>
              <p className="p-medium gray-c">{t("A0yvMQi")}</p>
            </div>
          </div>
          <div className="arrow"></div>
        </div>
        {selectedTab === "lang" && (
          <div className="fit-container fx-col fx-centered  box-pad-h-m box-pad-v-m ">
            <div className="fit-container">
              <p className="gray-c">{t("AfwKx9Q")}</p>
            </div>
            <div className="fx-scattered fit-container">
              <div>
                <p>{t("AfwKx9Q")}</p>
                <p className="p-medium gray-c">{t("AjTNn13")}</p>
              </div>
              <div className="fx-centered" style={{ minWidth: "max-content" }}>
                <Select
                  options={supportedLanguage}
                  value={selectedAppLang}
                  setSelectedValue={handleSwitchLang}
                />
              </div>
            </div>
            <hr />
            <div className="fit-container">
              <p className="gray-c">{t("AFz9bzq")}</p>
            </div>
            <div className="fx-scattered fit-container">
              <div>
                <p>{t("AFz9bzq")}</p>
                <p className="p-medium gray-c">{t("A21tdwK")}</p>
              </div>
              <div className="fx-centered">
                <Select
                  options={customServices}
                  value={selectedTransService}
                  setSelectedValue={handleTransServices}
                />
                <div
                  className="round-icon-small"
                  onClick={() => setShowAddCustomService(true)}
                >
                  <div className="plus-sign"></div>
                </div>
              </div>
            </div>
            <div className="fit-container fx-centered fx-col">
              {{ ...translationServicesEndpoints, ...customServicesPlan }[
                selectedTransService
              ]?.plans && (
                <div className="fx-scattered fit-container">
                  <div>
                    <p>{t("AFLFvbx")}</p>
                    <p className="p-medium gray-c">{t("AsYLJGY")}</p>
                  </div>
                  <Select
                    options={transServicesPlans}
                    value={transServicePlan}
                    setSelectedValue={handleTransServicesPlan}
                  />
                </div>
              )}
              {!(selectedTransService === "lt" && !transServicePlan) && (
                <>
                  <label
                    htmlFor="ser-apikey"
                    className="if fit-container fx-scattered"
                  >
                    <input
                      type={showAPIKey ? "text" : "password"}
                      className="if ifs-full if-no-border"
                      style={{ paddingLeft: 0 }}
                      placeholder={t("AMbIPen")}
                      value={transServiceAPIKey}
                      onChange={handleTransServicesAPIKey}
                    />
                    {showAPIKey && (
                      <div
                        className="eye-opened"
                        onClick={() => setShowAPIKey(!showAPIKey)}
                      ></div>
                    )}
                    {!showAPIKey && (
                      <div
                        className="eye-closed"
                        onClick={() => setShowAPIKey(!showAPIKey)}
                      ></div>
                    )}
                  </label>
                  <a
                    href={
                      {
                        ...translationServicesEndpoints,
                        ...customServicesPlan,
                      }[selectedTransService]?.url
                    }
                    className="c1-c p-medium"
                    style={{ textDecoration: "underline" }}
                  >
                    {t("AJKDh94")}
                  </a>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default LanguagesManagement;
