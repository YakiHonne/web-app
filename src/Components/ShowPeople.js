import React, { useEffect, useMemo, useState } from "react";
import relaysOnPlatform from "@/Content/Relays";
import { getParsedAuthor } from "@/Helpers/Encryptions";
import LoadingScreen from "@/Components/LoadingScreen";
import Follow from "@/Components/Follow";
import UserProfilePic from "@/Components/UserProfilePic";
import { useDispatch, useSelector } from "react-redux";
import { setToPublish } from "@/Store/Slides/Publishers";
import { ndkInstance } from "@/Helpers/NDKInstance";
import { useTranslation } from "react-i18next";

const getBulkListStats = (list) => {
  let toFollow = list.filter((item) => item.to_follow).length;
  let toUnfollow = list.length - toFollow;
  return { toFollow, toUnfollow };
};

export default function ShowPeople({ exit, list, type = "following" }) {
  const dispatch = useDispatch();
  const userKeys = useSelector((state) => state.userKeys);
  const userRelays = useSelector((state) => state.userRelays);
  const { t } = useTranslation();
  const userFollowings = useSelector((state) => state.userFollowings);
  const [people, setPeople] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [bulkList, setBulkList] = useState([]);
  const bulkListStats = useMemo(() => {
    return getBulkListStats(bulkList);
  }, [bulkList]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (type !== "following") {
          setPeople(list);
          if (list.length > 0) setIsLoaded(true);
          return;
        }

        let sub = ndkInstance.subscribe([{ kinds: [0], authors: list }], {
          closeOnEose: true,
          cacheUsage: "CACHE_FIRST",
          groupable: false,
        });

        sub.on("event", (event) => {
          setPeople((data) => {
            let newF = [...data, getParsedAuthor(event)];
            let netF = newF.filter((item, index, newF) => {
              if (
                newF.findIndex((_item) => item.pubkey === _item.pubkey) ===
                index
              )
                return item;
            });
            return netF;
          });
          setIsLoaded(true);
        });
      } catch (err) {
        console.log(err);
      }
    };
    fetchData();
  }, [list]);

  const followUnfollow = async () => {
    try {
      const toUnfollowList = bulkList
        .filter((item) => !item.to_follow)
        .map((item) => item.pubkey);

      let tempTags = Array.from(
        userFollowings
          ?.filter((item) => !toUnfollowList.includes(item))
          .map((item) => ["p", item]) || []
      );
      for (let item of bulkList) {
        if (item.to_follow)
          tempTags.push(["p", item.pubkey, relaysOnPlatform[0]]);
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
              <h4 className="p-caps">{type}</h4>
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
                      <p>{item.display_name}</p>
                      <p className="gray-c p-medium p-four-lines">
                        {item.about}
                      </p>
                    </div>
                  </div>
                  <Follow
                    toFollowKey={item.pubkey}
                    toFollowName={item.display_name}
                    bulk={true}
                    bulkList={bulkList}
                    setBulkList={setBulkList}
                    icon={false}
                    size={"small"}
                  />
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {bulkList.length > 0 && (
        <div
          className="fit-container fx-centered fx-col slide-up"
          style={{
            position: "fixed",
            bottom: 0,
            left: "0",
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
