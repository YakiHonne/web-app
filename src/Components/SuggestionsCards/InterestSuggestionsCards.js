import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setToPublish } from "@/Store/Slides/Publishers";
import InterestSuggestions from "@/Content/InterestSuggestions";
import OptionsDropdown from "@/Components/OptionsDropdown";
import { useTranslation } from "react-i18next";

export default function InterestSuggestionsCards({
  list = [],
  update = false,
  expand = false,
  addItemToList,
  limit = 10,
}) {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const userKeys = useSelector((state) => state.userKeys);
  const userInterestList = useSelector((state) => state.userInterestList);
  const [tempInterestList, setTempInterestList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hide, setHide] = useState(!localStorage.getItem("hsuggest3"));
  const isChanged = useMemo(() => {
    return JSON.stringify(list) !== JSON.stringify(tempInterestList);
  }, [list, tempInterestList]);
  const isAll = useMemo(() => {
    return InterestSuggestions.find(
      (_) => !userInterestList.includes(_.main_tag.toLowerCase())
    )
      ? false
      : true;
  }, [userInterestList]);

  useEffect(() => {
    setTempInterestList(list);
  }, [list]);

  const handleContent = (item, isAdded) => {
    if (update) {
      handleAddItems(item, isAdded);
    } else addItemToList(item, isAdded);
  };

  const handleAddItems = (item, isAdded) => {
    if (isAdded) {
      let index = tempInterestList.findIndex(
        (_) => _.item === item.toLowerCase()
      );
      let tempArray = structuredClone(tempInterestList);
      tempArray.splice(index, 1);
      setTempInterestList(tempArray);
    } else {
      setTempInterestList((prev) => [item, ...prev]);
    }
  };

  const saveInterestList = async () => {
    try {
      if (!(isChanged && !isLoading)) return;
      setIsLoading(true);
      let tags = [...new Set([...tempInterestList, ...userInterestList])].map(
        (_) => ["t", _.toLowerCase()]
      );
      dispatch(
        setToPublish({
          userKeys: userKeys,
          kind: 10015,
          content: "",
          tags: tags,
          allRelays: [],
        })
      );
      setIsLoading(false);
      return true;
    } catch (err) {
      setIsLoading(false);
      console.log(err);
      return false;
    }
  };
  const saveSingleInterestList = async (interest) => {
    try {
      setIsLoading(true);
      let tags = [...new Set([interest, ...userInterestList])].map((_) => [
        "t",
        _.toLowerCase(),
      ]);
      dispatch(
        setToPublish({
          userKeys: userKeys,
          kind: 10015,
          content: "",
          tags: tags,
          allRelays: [],
        })
      );
      setIsLoading(false);
      return true;
    } catch (err) {
      setIsLoading(false);
      console.log(err);
      return false;
    }
  };

  const handleHideSuggestion = () => {
    localStorage.setItem("hsuggest3", `${Date.now()}`);
    setHide(true);
  };

  if (isAll && expand) return;
  if (hide && expand) return;
  if (expand)
    return (
      <div className="fit-container box-pad-h fx-centered fx-col fx-start-v box-pad-v">
        <div className="fx-scattered fit-container box-marg-s">
          <h4>{t("A5rtSRh")}</h4>
          {userKeys && (
            <OptionsDropdown
              options={[
                <p className="gray-c" onClick={handleHideSuggestion}>
                  {t("A2qCLTm")}
                </p>,
              ]}
              vertical={false}
              tooltip={false}
            />
          )}
        </div>
        <div className="fit-container fx-centered fx-col fx-start-v">
          {InterestSuggestions.filter((item) => {
            let isAdded = userInterestList.includes(
              item.main_tag.toLowerCase()
            );
            if (!isAdded) return item;
          })
            .splice(0, limit)
            .map((item, index) => {
              let isAdded = tempInterestList.includes(
                item.main_tag.toLowerCase()
              );
              return (
                <div
                  className="fit-container fx-scattered box-pad-h-s box-pad-v-s sc-s-18"
                  style={{ minWidth: "200px" }}
                  key={index}
                  onClick={() =>
                    handleContent(item.main_tag.toLowerCase(), isAdded)
                  }
                >
                  <div className="fx-centered">
                    <div
                      style={{
                        minWidth: `48px`,
                        aspectRatio: "1/1",
                        position: "relative",
                        border: "none",
                      }}
                      className="sc-s-18 fx-centered"
                    >
                      <div
                        style={{
                          position: "absolute",
                          left: 0,
                          top: 0,
                          zIndex: 1,
                          backgroundImage: `url(${item.icon})`,
                        }}
                        className="bg-img cover-bg fit-container fit-height"
                      ></div>
                    </div>
                    <p className="p-bold p-caps">{item.main_tag}</p>
                  </div>
                  <div className="fit-height fx-scattered fx-col fx-start-v">
                    <button
                      className="btn btn-gray btn-small btn-full fx-centered"
                      onClick={() => saveSingleInterestList(item.main_tag)}
                    >
                      <div className="plus-sign"></div> {t("APkD8MP")}
                    </button>
                  </div>
                </div>
              );
            })}
        </div>
      </div>
    );
  return (
    <div className="fit-container box-pad-h fx-centered fx-col fx-start-v box-pad-v">
      <div className="fx-scattered fit-container box-marg-s">
        <h4>{t("A5rtSRh")}</h4>
        {isChanged && update && (
          <button className="btn btn-normal" onClick={saveInterestList}>
            {t("A29aBCD")}
          </button>
        )}
      </div>
      <div
        className="fit-container fx-centered fx-col sc-s-18 box-pad-h-m box-pad-v-m"
        style={{ backgroundColor: "transparent" }}
      >
        {!expand &&
          InterestSuggestions.map((item, index) => {
            let isAdded = tempInterestList.includes(
              item.main_tag.toLowerCase()
            );
            return (
              <div
                className="fit-container fx-scattered"
                key={index}
                onClick={() =>
                  handleContent(item.main_tag.toLowerCase(), isAdded)
                }
              >
                <div className="fx-centered">
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
                  </div>
                  <p className="p-caps">{item.main_tag}</p>
                </div>
                {!isAdded && (
                  <button className=" btn-normal btn-small-round fx-centered">
                    <div className="plus-sign"></div>
                  </button>
                )}
                {isAdded && (
                  <button
                    className=" btn-normal btn-small-round fx-centered"
                    style={{ backgroundColor: "var(--green-main)" }}
                  >
                    <div
                      className="check-24"
                      style={{ filter: "brightness(0) invert()" }}
                    ></div>
                  </button>
                )}
              </div>
            );
          })}
        {expand &&
          InterestSuggestions.filter((item) => {
            let isAdded = userInterestList.includes(
              item.main_tag.toLowerCase()
            );
            if (!isAdded) return item;
          })
            .splice(0, limit)
            .map((item, index) => {
              let isAdded = tempInterestList.includes(
                item.main_tag.toLowerCase()
              );
              return (
                <div
                  className="fit-container fx-scattered"
                  key={index}
                  onClick={() =>
                    handleContent(item.main_tag.toLowerCase(), isAdded)
                  }
                >
                  <div className="fx-centered">
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
                    </div>
                    <p className="p-caps">{item.main_tag}</p>
                  </div>
                  {!isAdded && (
                    <button className=" btn-normal btn-small-round fx-centered">
                      <div className="plus-sign"></div>
                    </button>
                  )}
                  {isAdded && (
                    <button
                      className=" btn-normal btn-small-round fx-centered"
                      style={{ backgroundColor: "var(--green-main)" }}
                    >
                      <div
                        className="check"
                        style={{ filter: "brightness(0) invert()" }}
                      ></div>
                    </button>
                  )}
                </div>
              );
            })}
      </div>
    </div>
  );
}
