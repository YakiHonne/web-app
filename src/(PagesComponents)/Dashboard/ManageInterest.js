import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import LoadingDots from "@/Components/LoadingDots";
import { setToPublish } from "@/Store/Slides/Publishers";
import InterestSuggestions from "@/Content/InterestSuggestions";
import InterestSuggestionsCards from "@/Components/SuggestionsCards/InterestSuggestionsCards";
import { useTranslation } from "react-i18next";
import { DraggableComp } from "@/Components/DraggableComp";
import InterestItem from "./InterestItem";

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
export default function ManageInterest({ exit }) {
  const dispatch = useDispatch();
  const userKeys = useSelector((state) => state.userKeys);
  const userInterestList = useSelector((state) => state.userInterestList);
  const { t } = useTranslation();
  const [interests, setInterest] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [newInterest, setNewInterest] = useState("");
  const oldState = useMemo(() => {
    return getInterestList(userInterestList);
  }, [userInterestList]);
  const isChanged = useMemo(() => {
    return JSON.stringify(interests) !== JSON.stringify(oldState);
  }, [interests, oldState]);

  useEffect(() => {
    let tempList = getInterestList(userInterestList);
    setInterest(tempList);
    setIsLoading(false);
  }, [userInterestList]);

  const handleItemInList = (action, index) => {
    let tempArray = structuredClone(interests);
    if (action) {
      tempArray[index].toDelete = false;
      setInterest(tempArray);
    } else {
      tempArray[index].toDelete = true;
      setInterest(tempArray);
    }
  };

  const saveInterestList = async () => {
    try {
      if (isLoading || !isChanged) return;
      setIsLoading(true);
      let tags = interests
        .filter((_) => !_.toDelete)
        .map((_) => ["t", _.item.toLowerCase()]);

      dispatch(
        setToPublish({
          userKeys: userKeys,
          kind: 10015,
          content: "",
          tags: tags,
          allRelays: [],
        }),
      );
      return true;
    } catch (err) {
      setIsLoading(false);
      console.log(err);
      return false;
    }
  };

  const addItemToList = (item) => {
    let tempArray = getInterestList([
      item.toLowerCase(),
      ...new Set([...interests.map((_) => _.item)]),
    ]);
    setInterest(tempArray);
    if (newInterest) setNewInterest("");
  };

  const handleItemsFromSuggestion = (item, isAdded) => {
    if (isAdded) {
      let index = interests.findIndex((_) => _.item === item.toLowerCase());
      let tempArray = structuredClone(interests);
      tempArray.splice(index, 1);
      setInterest(tempArray);
    } else {
      addItemToList(item);
    }
  };

  return (
    <div className="fx-centered fit-container fx-col ">
      <div className="fit-container fx-scattered box-marg-s box-pad-h ">
        <div className="fx-centered fx-start-h pointer" onClick={exit}>
          <div className="round-icon">
            <div className="arrow" style={{ transform: "rotate(90deg)" }}></div>
          </div>
          <p>{t("ARsUd9r")}</p>
        </div>
        <button
          className={`btn ${isChanged ? "btn-normal" : "btn-disabled"}`}
          onClick={saveInterestList}
        >
          {isLoading ? <LoadingDots /> : t("A29aBCD")}
        </button>
      </div>
      <div className="fit-container fx-centered fx-col box-pad-h">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (newInterest) addItemToList(newInterest);
          }}
          className="if fit-container fx-scattered"
        >
          <div className="search-24"></div>
          <input
            value={newInterest}
            onChange={(e) => setNewInterest(e.target.value)}
            type="text"
            placeholder={t("AFwnnZA")}
            className="if ifs-full if-no-border"
            style={{ padding: 0 }}
          />
          {newInterest && <p className="gray-c slide-down">&#8626;</p>}
        </form>
        <DraggableComp
          children={interests.map((_) => ({ ..._, id: _?.item }))}
          setNewOrderedList={setInterest}
          component={InterestItem}
          props={{
            handleItemInList,
          }}
          background={false}
        />
      </div>
      <InterestSuggestionsCards
        list={interests.map((_) => _.item)}
        addItemToList={handleItemsFromSuggestion}
      />
    </div>
  );
}
