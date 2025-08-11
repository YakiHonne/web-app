import React, { useEffect, useMemo, useState } from "react";
import { getEmptyuserMetadata, getParsedAuthor } from "@/Helpers/Encryptions";
import LoadingScreen from "@/Components/LoadingScreen";
import Follow from "@/Components/Follow";
import UserProfilePic from "@/Components/UserProfilePic";
import ShortenKey from "@/Components/ShortenKey";
import NumberShrink from "@/Components/NumberShrink";
import EmojiImg from "@/Components/EmojiImg";
import { useDispatch, useSelector } from "react-redux";
import { setToPublish } from "@/Store/Slides/Publishers";
import { useTranslation } from "react-i18next";
import { getSubData } from "@/Helpers/Controlers";

const getBulkListStats = (list) => {
  let toFollow = list.filter((item) => item.to_follow).length;
  let toUnfollow = list.length - toFollow;
  return { toFollow, toUnfollow };
};

export default function ShowUsersList({
  exit,
  list,
  title,
  extras,
  extrasType = "zap",
}) {
  const dispatch = useDispatch();
  const userFollowings = useSelector((state) => state.userFollowings);
  const userRelays = useSelector((state) => state.userRelays);
  const userKeys = useSelector((state) => state.userKeys);
  const { t } = useTranslation();

  const [people, setPeople] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [bulkList, setBulkList] = useState([]);
  const bulkListStats = useMemo(() => {
    return getBulkListStats(bulkList);
  }, [bulkList]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        let authorsPubkeys = [...new Set(list)];
        let data = await getSubData([{ kinds: [0], authors: authorsPubkeys }]);
        let returnedPubkeys = data.pubkeys;
        let returnedData = data.data;
        returnedData = data.data.sort(
          (ev1, ev2) => ev2.created_at - ev1.created_at
        );
        returnedData = data.data.filter((item, index, arr) => {
          if (arr.findIndex((_item) => item.pubkey === _item.pubkey) === index)
            return item;
        });
        let tempUsers = authorsPubkeys.map((_) => {
          let zapperData =  getZaps(_) || {};
          return returnedPubkeys.includes(_)
            ? {
                ...getParsedAuthor(returnedData.find((__) => __.pubkey === _)),
                created_at: _.created_at,
                zapContent: zapperData.content,
                amount:
                  extras.length > 0 && extrasType === "zap"
                    ? zapperData.amount
                    : 0,
                reaction:
                  extras.length > 0 && extrasType === "reaction"
                    ? getReactions(_)
                    : "",
              }
            : {
                ...getEmptyuserMetadata(_),
                created_at: 0,
                zapContent: zapperData.content,
                amount: zapperData.amount,
                reaction:
                  extras.length > 0 && extrasType === "reaction"
                    ? getReactions(_)
                    : "",
              };
        });
        tempUsers = tempUsers.sort((a, b) => b.amount - a.amount);
        setPeople(tempUsers);
        setIsLoaded(true);
      } catch (err) {
        console.log(err);
      }
    };
    fetchData();
  }, []);

  const getZaps = (pubkey) => {
    let sats = extras.reduce(
      (total, item) =>
        item.pubkey === pubkey ? (total += item.amount) : (total = total),
      0
    );
    let content = extras
      .filter((_) => _.pubkey === pubkey)
      .find((_) => _.content);
    return { amount: Math.floor(sats), content: content?.content || "" };
  };
  const getReactions = (pubkey) => {
    let reaction = extras.find((_) => _.pubkey === pubkey)?.content || "+";
    return reaction;
  };

  const followUnfollow = async () => {
    try {
      const toUnfollowList = bulkList
        .filter((item) => !item.to_follow)
        .map((item) => item.pubkey);

      let tempTags = Array.from(
        userFollowings
          ?.filter((item) => !toUnfollowList.includes(item))
          .map((_) => ["p", _]) || []
      );
      for (let item of bulkList) {
        if (item.to_follow) tempTags.push(["p", item.pubkey]);
      }

      dispatch(
        setToPublish({
          userKeys: userKeys,
          kind: 3,
          content: "",
          tags: tempTags,
          allRelays: userRelays,
        })
      );
      exit();
    } catch (err) {
      console.log(err);
    }
  };

  if (!isLoaded) return <LoadingScreen onClick={exit} />;
  return (
    <>
      <ArrowUp />
      <div
        className="fixed-container fx-centered fx-start-v"
        onClick={(e) => {
          e.stopPropagation();
          exit();
        }}
      >
        <div
          className="fx-centered fx-col fx-start-v fx-start-h sc-s-18 bg-sp"
          style={{
            overflow: "scroll",
            scrollBehavior: "smooth",
            height: "100vh",
            width: "min(100%, 550px)",
            position: "relative",
            borderRadius: 0,
            gap: 0,
          }}
        >
          <div
            className="fit-container fx-centered sticky"
            style={{ borderBottom: "1px solid var(--very-dim-gray)" }}
          >
            <div className="fx-scattered fit-container box-pad-h">
              <h4 className="p-caps">{title}</h4>
              <div
                className="close"
                style={{ position: "static" }}
                onClick={exit}
              >
                <div></div>
              </div>
            </div>
          </div>
          <div
            className="fit-container fx-centered fx-start-v fx-col box-pad-h box-pad-v "
            style={{ rowGap: "24px" }}
            onClick={(e) => {
              e.stopPropagation();
            }}
          >
            {people.map((item) => {
              return (
                <div
                  className="fx-scattered fit-container fx-start-v "
                  key={item.pubkey + item.name}
                >
                  <div className="fx-centered fx-start-v">
                    {extras.length > 0 && extrasType === "zap" && (
                      <div
                        className="fx-centered  round-icon"
                        style={{ gap: "6px", border: "none" }}
                      >
                        <div
                          className="bolt-bold"
                          style={{ minWidth: "16px", minHeight: "16px" }}
                        ></div>
                        <span className="c1-c p-bold">
                          <NumberShrink value={item.amount} />
                        </span>
                      </div>
                    )}
                    {extras.length > 0 && extrasType === "reaction" && (
                      <div
                        className="fx-centered  round-icon"
                        style={{ gap: "6px", border: "none" }}
                      >
                        <EmojiImg content={item.reaction} />
                      </div>
                    )}
                    <div
                      className="fx-centered fx-start-v"
                      style={{ columnGap: "24px" }}
                    >
                      <UserProfilePic
                        size={48}
                        img={item.picture}
                        user_id={item.pubkey}
                      />
                      <div className="fx-centered fx-col fx-start-v">
                        <ShortenKey id={item.pubkeyhashed} />
                        <p>{item.name}</p>
                        {/* <p className="gray-c p-medium p-two-lines">
                          {extras.length > 0 && extrasType === "zap"
                            ? item.zapContent
                            : item.about}
                        </p> */}
                        {extras.length > 0 && extrasType === "zap" ? (
                          <>
                            {item.zapContent && (
                              <div
                                className="sc-s box-pad-h-m box-pad-v-s"
                                style={{ border: "none" }}
                              >
                                <p className="p-medium">{item.zapContent}</p>
                              </div>
                            )}
                          </>
                        ) : (
                          <p className="gray-c p-medium p-two-lines">
                            {item.about}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="fx-centered">
                    <Follow
                      toFollowKey={item.pubkey}
                      toFollowName={item.name}
                      bulk={true}
                      bulkList={bulkList}
                      setBulkList={setBulkList}
                      icon={false}
                      size={"small"}
                    />
                  </div>
                </div>
              );
            })}
          </div>
          {bulkList.length > 0 && <div className="box-pad-v"></div>}
        </div>
      </div>
      {bulkList.length > 0 && (
        <div
          className="fit-container fx-centered fx-col slide-up"
          style={{
            position: "fixed",
            bottom: 0,
            left: "0",
            // transform: "translateX(-50%)",
            // background: "var(--white)",
            // width: "min(100%, 800px)",
            zIndex: 10000,
          }}
        >
          <div
            className="box-pad-h-m box-pad-v-m fx-centered"
            style={{ width: "min(100%, 400px)" }}
          >
            <button
              className="btn btn-normal fit-container"
              onClick={followUnfollow}
            >
              {bulkListStats.toFollow > 0 &&
                t("Ae7ofjr", { count: bulkListStats.toFollow })}{" "}
              {bulkListStats.toFollow > 0 &&
                bulkListStats.toUnfollow > 0 &&
                " | "}
              {bulkListStats.toUnfollow > 0 &&
                t("AdZjMMb", { count: bulkListStats.toUnfollow })}
            </button>
          </div>
        </div>
      )}
    </>
  );
}

const ArrowUp = () => {
  const [showArrow, setShowArrow] = useState(false);

  useEffect(() => {
    const handleScroll = (e) => {
      if (document.querySelector(".fixed-container").scrollTop >= 600)
        setShowArrow(true);
      else setShowArrow(false);
    };
    window.addEventListener("scroll", handleScroll, true);
    return () => window.removeEventListener("scroll", handleScroll, true);
  }, []);

  const straightUp = () => {
    document.querySelector(".fixed-container").scrollTop = 0;
  };

  if (!showArrow) return null;
  return (
    <div
      style={{
        position: "fixed",
        right: "32px",
        bottom: "32px",
        minWidth: "40px",
        aspectRatio: "1/1",
        borderRadius: "var(--border-r-50)",
        backgroundColor: "var(--white)",
        filter: "invert()",
        zIndex: 100000,
        // transform: "rotate(180deg)",
      }}
      className="pointer fx-centered slide-up"
      onClick={straightUp}
    >
      <div className="arrow" style={{ transform: "rotate(180deg)" }}></div>
    </div>
  );
};
