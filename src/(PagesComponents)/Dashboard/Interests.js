import React, { useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import ManageInterest from "./ManageInterest";

const getInterestList = (list) => {
  let tempList = [];
  for (let item of list) {
    let icon = InterestSuggestions.find(
      (_) =>
        _.main_tag.toLowerCase() === item.toLowerCase() ||
        _.sub_tags.find(($) => $.toLowerCase() === item.toLowerCase()),
    );
    tempList.push({
      icon: icon?.icon || "",
      item,
      toDelete: false,
    });
  }
  return tempList;
};

export default function Interests() {
  const userInterestList = useSelector((state) => state.userInterestList);
  const { t } = useTranslation();
  const interests = useMemo(() => {
    return getInterestList(userInterestList);
  }, [userInterestList]);

  const [isManage, setIsManage] = useState(false);
  return (
    <div className="fit-container">
      <div className="fit-container fx-scattered  box-pad-v-m box-pad-h">
        <h4 className="p-caps">{t("AvcFYqP")}</h4>
        {userInterestList.length > 0 && !isManage && (
          <button className="btn btn-normal" onClick={() => setIsManage(true)}>
            {t("A8RA6c7")}
          </button>
        )}
      </div>
      {userInterestList.length === 0 && !isManage && (
        <div className="fit-container fx-centered" style={{ padding: "3rem" }}>
          <div
            className="sc-s-18 fit-container  fx-centered fx-col"
            style={{ backgroundColor: "transparent", padding: "3rem" }}
          >
            <h4>{t("AI11KEH")}</h4>
            <p
              className="p-centered gray-c box-pad-v-m"
              style={{ maxWidth: "500px" }}
            >
              {t("A70Zdvz")}
            </p>
            <button
              className="btn btn-normal fx-centered"
              onClick={() => setIsManage(true)}
            >
              <div className="plus-sign"></div>
              {t("AIUAUcP")}
            </button>
          </div>
        </div>
      )}
      {!isManage && (
        <div className="fx-centered fx-col box-pad-h">
          {interests.map((item, index) => {
            return (
              <div
                className="fx-centered fx-start-h sc-s-18 box-pad-h-m box-pad-v-m fit-container"
                style={{ backgroundColor: "transparent" }}
                key={index}
              >
                <div
                  style={{
                    minWidth: `38px`,
                    aspectRatio: "1/1",
                    position: "relative",
                  }}
                  className="sc-s-18 fx-centered"
                >
                  <div
                    style={{
                      position: "absolute",
                      left: 0,
                      top: 0,
                      zIndex: 2,
                      backgroundImage: `url(${item.icon})`,
                    }}
                    className="bg-img cover-bg  fit-container fit-height"
                  ></div>
                  <p
                    className={"p-bold p-caps p-big"}
                    style={{ position: "relative", zIndex: 1 }}
                  >
                    {item.item.charAt(0)}
                  </p>
                </div>
                <p className="p-caps">{item.item}</p>
              </div>
            );
          })}
        </div>
      )}
      {isManage && <ManageInterest exit={() => setIsManage(false)} />}
    </div>
  );
}
