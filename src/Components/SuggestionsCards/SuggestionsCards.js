import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { getParsedRepEvent } from "@/Helpers/Encryptions";
import { saveUsers } from "@/Helpers/DB";
import UserToFollowSuggestionsCards from "./UserToFollowSuggestionsCards";
import ContentSuggestionsCards from "./ContentSuggestionCards";
import DonationBoxSuggestionCards from "./DonationBoxSuggestionCards";
import ProfileShareSuggestionCards from "./ProfileShareSuggestionCards";
import InterestSuggestions from "@/Content/InterestSuggestions";
import { getSubData } from "@/Helpers/Controlers";
import InterestSuggestionsCards from "./InterestSuggestionsCards";

export default function SuggestionsCards({ index }) {
  if (![10, 20, 30, 40, 50].includes(index)) return null;
  const userInterestList = useSelector((state) => state.userInterestList);
  const [articlesSuggestions, setArticlesSuggestions] = useState([]);

  useEffect(() => {
    let checkHiddenSuggestions = localStorage.getItem("hsuggest2");
    const fetchContentSuggestions = async () => {
      let tags = InterestSuggestions.sort(() => 0.5 - Math.random()).slice(
        0,
        3
      );
      tags = tags.map((_) => [_.main_tag, ..._.sub_tags]).flat();

      let content = await getSubData(
        [
          {
            kinds: [30023],
            limit: 10,
            "#t": tags,
          },
        ],
        200
      );
      if (content.data.length > 0) {
        let data = content.data
          .map((event) => getParsedRepEvent(event))
          .filter((event) => {
            if (event.title && event.image) return event;
          });
        if (data.length >= 3) {
          setArticlesSuggestions(data.slice(0, 5));
          saveUsers(content.pubkeys);
        }
      }
    };
    if (checkHiddenSuggestions) fetchContentSuggestions();
  }, []);

  const getContentCard = () => {
    if (index === 10)
      return (
        <ContentSuggestionsCards
          content={articlesSuggestions}
          kind="articles"
        />
      );
    if (index === 20) return <UserToFollowSuggestionsCards />;
    if (index === 30)
      return (
        <InterestSuggestionsCards
          limit={5}
          list={userInterestList}
          update={true}
          expand={true}
        />
      );
    if (index === 40) return <DonationBoxSuggestionCards />;
    if (index === 50) return <ProfileShareSuggestionCards />;
  };

  return <>{getContentCard()}</>;
}
