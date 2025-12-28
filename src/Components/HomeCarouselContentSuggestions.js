import React, { useState, useEffect } from "react";
import Slider from "@/Components/Slider";
import RepEventPreviewCard from "@/Components/RepEventPreviewCard";
import OptionsDropdown from "@/Components/OptionsDropdown";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import {
  filterContent,
  getParsedRepEvent,
  removeEventsDuplicants,
} from "@/Helpers/Encryptions";
import { getDefaultFilter, getSubData } from "@/Helpers/Controlers";
import { saveUsers } from "@/Helpers/DB";
import { localStorage_ } from "@/Helpers/utils/clientLocalStorage";
import { setHomeCarouselPosts } from "@/Store/Slides/Extras";
import { useDispatch } from "react-redux";

export default function HomeCarouselContentSuggestions() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const userKeys = useSelector((state) => state.userKeys);
  const homeCarouselPosts = useSelector((state) => state.homeCarouselPosts);
  const [hide, setHide] = useState(!localStorage_.getItem("hsuggest"));
  const [content, setContentSuggestions] = useState(homeCarouselPosts);

  useEffect(() => {
    const fetchContentSuggestions = async () => {
      let content = await getSubData(
        [{ kinds: [16], limit: 100, "#k": ["30023"] }],
        100,
        undefined,
        undefined
      );
      if (content.data.length > 0) {
        let data = content.data
          .map((event) =>
            event.content ? getParsedRepEvent(JSON.parse(event.content)) : false
          )
          .filter((event) => {
            if (event && event.title) return event;
          });
        let defaultFilter = getDefaultFilter();
        let posts = filterContent(defaultFilter, removeEventsDuplicants(data));
        setContentSuggestions(posts);
        dispatch(setHomeCarouselPosts(posts));
        saveUsers(data.map((_) => _.pubkey));
      }
    };
    if (!hide && homeCarouselPosts.length === 0) fetchContentSuggestions();
  }, [hide]);

  let getItems = () => {
    return content.map((item) => (
      <RepEventPreviewCard item={item} key={item.id} minimal={true} />
    ));
  };

  const handleHideSuggestion = () => {
    localStorage_.setItem("hsuggest", `${Date.now()}`);
    setHide(true);
  };

  if (hide) return null;
  let items = getItems();
  if (content.length === 0)
    return (
      <div
        className="fit-container box-pad-v skeleton-container "
        style={{ height: "285px" }}
      ></div>
    );
  return (
    <div className="fit-container box-marg-s">
      <div className="fit-container fx-scattered box-pad-v-s ">
        <p className="gray-c box-pad-h-m">{t("AoO5zem")}</p>
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
      <Slider items={items} slideBy={200} />
    </div>
  );
}
