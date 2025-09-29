import React from "react";
import { useTranslation } from "react-i18next";
import { DraggableComp } from "@/Components/DraggableComp";
import ContentSourceSettingsItem from "./ContentSourceSettingsItem";

export default function CommunityFeed({
  sources,
  setSources,
  update,
}) {
  const { t } = useTranslation();

  const handleToggleOption = (group, option) => {
    setSources((prev) => {
      let tempSources = structuredClone(prev);
      let groupIndex = tempSources.findIndex((_) => _.value === group);
      let gourpList = tempSources[groupIndex].list;
      let optionIndex = gourpList.findIndex((_) => _.value === option);
      if (group === "cf" && tempSources[groupIndex].list[optionIndex].enabled) {
        let checkList = gourpList
          .filter((_, index) => index !== optionIndex)
          .filter((_) => !_.enabled);
        if (checkList.length > gourpList.length - 2) {
          tempSources[groupIndex].list.forEach((_, index) => {
            if (index === optionIndex) _.enabled = false;
            else _.enabled = true;
          });
          return tempSources;
        }
      }
      tempSources[groupIndex].list[optionIndex].enabled =
        !tempSources[groupIndex].list[optionIndex].enabled;
      return tempSources;
    });
  };

  const hanleDragInternalITems = (newList, groupIndex) => {
    setSources((prev) => {
      let tempSources = structuredClone(prev);
      tempSources[groupIndex].list = newList;
      return tempSources;
    });
  };

  return (
    <div className="fit-container fx-centered fx-start-h fx-start-v fx-col box-pad-h box-pad-v">
      <div className="fit-container fx-scattered">
        <p className="c1-c">{t("AJYvlq1")}</p>

        <button className="btn btn-normal btn-small" onClick={update}>
          {t("A8alhKV")}
        </button>
      </div>
      {sources.map((_, index) => {
        {
          console.log(_.list);
        }
        if (_.list?.length > 0 && index === 0)
          return (
            <div
              key={index}
              className="fit-container  fx-scattered  fx-col fx-shrink pointer"
            >
              <div className="fit-container  fx-col fx-scattered">
                <DraggableComp
                  children={_.list.map((_) => ({ ..._, id: _?.value }))}
                  setNewOrderedList={(data) =>
                    hanleDragInternalITems(data, index)
                  }
                  component={ContentSourceSettingsItem}
                  props={{
                    handleToggleOption,
                    group: _,
                  }}
                  background={false}
                />
              </div>
            </div>
          );
      })}
    </div>
  );
}
