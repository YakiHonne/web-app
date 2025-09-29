import React, { useEffect, useState } from "react";
import ArrowUp from "@/Components/ArrowUp";
import axiosInstance from "@/Helpers/HTTP_Client";
import ProgressBar from "@/Components/ProgressBar";
import UserProfilePic from "@/Components/UserProfilePic";
import { chartActionKeys } from "@/Content/ActionKeys";
import ProgressCirc from "@/Components/ProgressCirc";
import PagePlaceholder from "@/Components/PagePlaceholder";
import { getCurrentLevel, levelCount } from "@/Helpers/Helpers";
import { userLogout } from "@/Helpers/Controlers";
import { useSelector } from "react-redux";
import LoadingLogo from "@/Components/LoadingLogo";
import { useTranslation } from "react-i18next";
import { timeAgo } from "@/Helpers/Encryptions";
import Link from "next/link";

let chart_ = [
  { action: "flashnews_post", all_time_points: 0, last_updated: null },
  { action: "un_write", all_time_points: 0, last_updated: null },
  { action: "un_rate", all_time_points: 0, last_updated: null },
  { action: "curation_post", all_time_points: 0, last_updated: null },
  { action: "article_post", all_time_points: 0, last_updated: null },
  { action: "article_draft", all_time_points: 0, last_updated: null },
  { action: "video_post", all_time_points: 0, last_updated: null },
  { action: "bookmark", all_time_points: 0, last_updated: null },
  { action: "zap", all_time_points: 0, last_updated: null },
  { action: "reaction", all_time_points: 0, last_updated: null },
  { action: "dms", all_time_points: 0, last_updated: null },
  { action: "user_impact", all_time_points: 0, last_updated: null },
  { action: "comment_post", all_time_points: 0, last_updated: null },
];

let tiersIcons = ["bronze-tier", "silver-tier", "gold-tier", "platinum-tier"];

const getCooldown = (userLastUpdated, cooldownTime) => {
  let currentTime = Math.floor(new Date().getTime() / 1000);
  let diffTime = userLastUpdated + cooldownTime - currentTime;
  let cooldown = 0;
  if (diffTime <= 0) return cooldown;

  return Math.ceil(diffTime / 60);
};

const orderChart = (array) => {
  let tempArray = [];
  for (let chart of chart_) {
    let el = array.find((item) => item.action === chart.action);
    tempArray.push(el);
  }
  return tempArray;
};

export default function UserLevels() {
  const userKeys = useSelector((state) => state.userKeys);
  const isConnectedToYaki = useSelector((state) => state.isConnectedToYaki);
  const { t } = useTranslation();
  const [oneTimeRewardStats, setOneTimeRewardStats] = useState([]);
  const [repeatedRewardsStats, setRepeatedRewardsStats] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [headerStats, setHeaderStats] = useState(false);
  const [maxValueInChart, setMaxValueInChart] = useState(0);
  const [chart, setChart] = useState([]);
  const [tiers, setTiers] = useState([]);
  const [currentTier, setCurrentTier] = useState("");
  const [showTier, setShowTier] = useState(false);
  const [showPointsDesc, setShowPointsDesc] = useState(false);
  const levels = {
    new_account: t("AjL3AJ5"),
    username: t("A7g67SU"),
    bio: t("AIAFmnp"),
    profile_picture: t("AWeQ0fR"),
    cover: t("AFMUPwE"),
    nip05: t("AOW0Bki"),
    luds: t("AviCcwU"),
    relays_setup: t("AWAKD1j"),
    topics_setup: t("AQQFa7F"),
    follow_yaki: t("AyIwX8s"),
    flashnews_post: t("AIbcFuI"),
    un_write: t("AZYR1td"),
    un_rate: t("AiUEDe3"),
    curation_post: t("AP6dp7w"),
    article_post: t("ATFKth1"),
    article_draft: t("Aweyw6L"),
    video_post: t("A5qKCQ4"),
    bookmark: t("AuOVsg9"),
    zap: t("AetoahH"),
    reaction: t("Alz0E9Y"),
    dms: t("AwpwbAl"),
    user_impact: t("Ag6EZcj"),
    comment_post: t("AsCfe1h"),
  };
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoaded(false);
        const data = await axiosInstance.get("/api/v1/yaki-chest/stats");
        if (data.data.user_stats.pubkey !== userKeys.pub) {
          userLogout();
          setIsLoaded(false);
          return;
        }
        let { user_stats, platform_standards, tiers } = data.data;
        let xp = user_stats.xp;
        let currentLevel = getCurrentLevel(xp);
        let nextLevel = currentLevel + 1;
        let toCurrentLevelPoints = levelCount(currentLevel);
        let toNextLevelPoints = levelCount(nextLevel);
        let totalPointInLevel = toNextLevelPoints - toCurrentLevelPoints;
        let inBetweenLevelPoints = xp - toCurrentLevelPoints;
        let remainingPointsToNextLevel =
          totalPointInLevel - inBetweenLevelPoints;
        let max = 0;
        let tempChart = [];
        for (let action of user_stats.actions) {
          if (chartActionKeys.includes(action.action)) {
            if (action.all_time_points > max) max = action.all_time_points;
            tempChart.push({
              ...action,
              display_name: platform_standards[action.action].display_name,
            });
          }
        }
        let tempActionKeys = tempChart.map((action) => action.action);
        let tempStats = Object.entries(platform_standards).map((action) => {
          let user_stat = user_stats.actions.find(
            (_action) => _action.action === action[0]
          );
          return {
            action: action[0],
            ...action[1],
            user_stat,
          };
        });

        let currentTierDisplayName = tiers.find((tier) => {
          if (
            tier.max > -1 &&
            tier.min <= currentLevel &&
            tier.max >= currentLevel
          ) {
            return tier;
          }
          if (tier.max == -1 && tier.min <= currentLevel) return tier;
        }).display_name;
        setTiers(tiers);
        setCurrentTier(currentTierDisplayName);
        setOneTimeRewardStats(
          tempStats.filter((item) => item.cooldown === 0 && item.count > 0)
        );

        setRepeatedRewardsStats(
          tempStats.filter(
            (item) =>
              item.cooldown > 0 || (item.cooldown === 0 && item.count === 0)
          )
        );
        setChart(
          orderChart([
            ...tempChart,
            ...chart_
              .filter((action) => !tempActionKeys.includes(action.action))
              .map((action) => {
                return {
                  ...action,
                  display_name: platform_standards[action.action].display_name,
                };
              }),
          ])
        );
        setMaxValueInChart(max);
        setHeaderStats({
          xp,
          consumablePoints: user_stats.current_points.points,
          consumablePointsLU: user_stats.current_points.last_updated,
          currentLevel,
          nextLevel,
          toCurrentLevelPoints,
          toNextLevelPoints,
          totalPointInLevel,
          inBetweenLevelPoints,
          remainingPointsToNextLevel,
        });
        setIsLoaded(true);
      } catch (err) {
        console.log(err);
        setIsLoaded(false);
      }
    };
    if (userKeys && isConnectedToYaki) fetchData();
  }, [userKeys, isConnectedToYaki]);

  useEffect(() => {
    if (!userKeys) {
      setOneTimeRewardStats([]);
      setRepeatedRewardsStats([]);
      setHeaderStats(false);
      setChart([]);
    }
  }, [isConnectedToYaki]);

  return (
    <div>
      {showTier && <TierDemo tier={showTier} exit={() => setShowTier(false)} />}
      {showPointsDesc && <PointsDesc exit={() => setShowPointsDesc(false)} />}

      <ArrowUp />
      <div className="fit-container fx-centered fx-start-h">
        <div
          style={{ width: "min(100%,1400px)" }}
          className="fx-centered fx-start-v"
        >
          <div
            // style={{ width: "min(100%, 700px)" }}
            className={`fx-centered  fx-wrap box-pad-h main-middle`}
          >
            {isConnectedToYaki && (
              <>
                {isLoaded && (
                  <>
                    <div className="box-pad-v fit-container">
                      <h4>{t("Ae2D51K")}</h4>
                    </div>
                    <div
                      className="fit-container fx-centered fx-col"
                      style={{ rowGap: "16px" }}
                    >
                      <div
                        className="fit-container fx-centered fx-start-h sc-s-18 box-pad-h box-pad-v"
                        style={{
                          backgroundColor: "var(--c1-side)",
                          border: "none",
                          columnGap: "24px",
                          overflow: "visible",
                        }}
                      >
                        <div>
                          <UserProfilePic
                            size={100}
                            mainAccountUser={true}
                            allowClick={false}
                          />
                        </div>

                        <div className="fit-container fx-centered fx-col fx-start-v">
                          <div className="fit-container fx-scattered">
                            <div className="fx-centered fx-end-v">
                              <h3>{headerStats.xp}</h3>
                              <p className="p-big gray-c">xp</p>
                              <h3>
                                {t("AdLQkic", { level: "" })}{" "}
                                <span className="orange-c">
                                  {headerStats.currentLevel}
                                </span>
                              </h3>
                            </div>
                            <div className="fx-centered ">
                              {tiers.map((tier, index) => {
                                return (
                                  <div
                                    className="round-icon-tooltip"
                                    data-tooltip={tier.display_name}
                                    key={index}
                                    onClick={() =>
                                      setShowTier({
                                        ...tier,
                                        currentLevel: headerStats.currentLevel,
                                        image: tiersIcons[index],
                                        locked: !(
                                          currentTier === tier.display_name
                                        ),
                                      })
                                    }
                                  >
                                    <div
                                      style={{
                                        width: "28px",
                                        filter:
                                          currentTier === tier.display_name
                                            ? ""
                                            : "grayscale(100%)",
                                        opacity:
                                          currentTier === tier.display_name
                                            ? 1
                                            : 0.5,
                                      }}
                                      className={tiersIcons[index]}
                                    ></div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>

                          <hr style={{ margin: ".5rem auto" }} />
                          <div className="fit-container fx-centered fx-col">
                            <div className="fit-container fx-scattered">
                              <div>
                                <p className="gray-c">
                                  {t("AehNuZK", {
                                    points:
                                      headerStats.remainingPointsToNextLevel,
                                  })}
                                </p>
                              </div>
                              <div>
                                <p className="orange-c">
                                  {t("AdLQkic", {
                                    level: headerStats.nextLevel,
                                  })}
                                </p>
                              </div>
                            </div>
                            <ProgressBar
                              full={true}
                              total={headerStats.totalPointInLevel}
                              current={headerStats.inBetweenLevelPoints}
                            />
                          </div>
                        </div>
                      </div>
                      <div
                        className="fit-container fx-centered  fx-col sc-s-18 box-pad-h box-pad-v"
                        style={{
                          backgroundColor: "var(--c1-side)",
                          border: "none",
                          rowGap: "24px",
                          overflow: "visible",
                        }}
                      >
                        <div className="fit-container fx-scattered">
                          <div>
                            <div className="fx-centered fx-start-h">
                              <h3>
                                {headerStats.consumablePoints}{" "}
                                <span className="gray-c">
                                  / {headerStats.xp}
                                </span>{" "}
                              </h3>
                              <p className="gray-c">{t("A4IGG0z")}</p>
                            </div>
                          </div>
                          <div>
                            <button
                              className="btn btn-gst btn-small"
                              onClick={() => setShowPointsDesc(!showPointsDesc)}
                            >
                              {t("AfRZ5lx")}
                            </button>
                          </div>
                        </div>
                        <div className="fx-centered fit-container fx-wrap">
                          <ProgressBar
                            full={true}
                            total={headerStats.xp}
                            current={headerStats.consumablePoints}
                          />
                          <div className="fit-container fx-scattered">
                            <p className="gray-c p-medium">{t("AetHYzn")}</p>
                            <p className="gray-c p-medium">
                              {t("ABcjNuL", {
                                date:
                                  headerStats.xp ===
                                  headerStats.consumablePoints
                                    ? "N/A"
                                    : timeAgo(
                                        new Date(
                                          headerStats.consumablePointsLU * 1000
                                        )
                                      ),
                              })}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div
                        className="fit-container fx-centered fx-col sc-s-18 box-pad-h box-pad-v"
                        style={{
                          backgroundColor: "var(--c1-side)",
                          border: "none",
                          rowGap: "24px",
                          overflow: "visible",
                        }}
                      >
                        <div
                          className="fit-container fx-centered fx-end-v"
                          style={{
                            height: "30vh",
                            borderBottom: "1px solid var(--dim-gray)",
                          }}
                        >
                          <div
                            className="box-pad-h fx-scattered fx-end-v fit-container"
                            style={{ height: "100%" }}
                          >
                            {chart.map((item, index) => {
                              return (
                                <div
                                  className="fx-centered fx-col fx-end-h pointer tooltip-on-hover"
                                  style={{
                                    height: "100%",
                                    width: `calc(100% / ${chart_.length})`,
                                    overflow: "visible",
                                  }}
                                  key={item.action}
                                >
                                  <p className="p-medium gray-c">
                                    {item.all_time_points} xp
                                  </p>
                                  <div
                                    style={{
                                      height: `${
                                        (item.all_time_points * 100) /
                                        maxValueInChart
                                      }%`,
                                      minHeight: "5px",
                                      backgroundColor:
                                        item.all_time_points === maxValueInChart
                                          ? "var(--c1)"
                                          : "var(--c1-side)",
                                      borderBottomLeftRadius: "0",
                                      borderBottomRightRadius: "0",
                                      overflow: "visible",
                                      position: "relative",
                                      borderBottom: "none",
                                    }}
                                    className="fit-container sc-s-18 chart-bar"
                                  >
                                    <div
                                      className="fx-centered fx-start-v fx-col tooltip box-pad-h-m box-pad-v-s sc-s-18"
                                      style={{
                                        rowGap: 0,
                                        left:
                                          index + 4 > chart.length
                                            ? "100%"
                                            : "initial",
                                        transform:
                                          index + 4 > chart.length
                                            ? "translateX(-100%)"
                                            : "translateX(0)",
                                      }}
                                    >
                                      <div className="fx-centered">
                                        <p className="p-medium">
                                          {item.display_name}
                                        </p>
                                        <p className="p-small gray-c">
                                          &#9679;
                                        </p>
                                        <p className="orange-c p-medium">
                                          {item.all_time_points}{" "}
                                          <span className="gray-c">xp</span>
                                        </p>
                                      </div>
                                      <p className="gray-c p-small">
                                        {t("As6hkOH", {
                                          date: !item.last_updated
                                            ? "N/A"
                                            : timeAgo(
                                                new Date(
                                                  item.last_updated * 1000
                                                )
                                              ),
                                        })}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                        <h4 className="gray-c">{t("At2CFSI")}</h4>
                      </div>
                      <div
                        className="fit-container fx-centered fx-col box-marg-s"
                        // style={{ rowGap: "24px" }}
                      >
                        <div className="fit-container">
                          <p className=" gray-c">{t("A2Tafrd")}</p>
                        </div>
                        {oneTimeRewardStats.map((item) => {
                          return (
                            <div
                              className="fit-container fx-col fx-centered sc-s-18 box-pad-h-m box-pad-v-s"
                              style={{
                                backgroundColor: "var(--c1-side)",
                                border: "none",
                              }}
                              key={item.action}
                            >
                              <div className="fit-container fx-scattered">
                                <div>
                                  <p>{levels[item.action]}</p>
                                </div>
                                <div className="fx-centered">
                                  <p className="orange-c">
                                    {item.user_stat?.all_time_points || 0}
                                    <span className="gray-c">
                                      {" "}
                                      /{" "}
                                      {item.points[0] *
                                        (item.user_stat?.count || 1)}
                                    </span>
                                  </p>
                                  {(item.user_stat?.all_time_points || 0) ===
                                    item.points[0] *
                                      (item.user_stat?.count || 1) && (
                                    <div className="checkmark"></div>
                                  )}
                                </div>
                              </div>

                              <div className="fit-container fx-centered fx-col fx-start-v">
                                <ProgressBar
                                  full={true}
                                  total={item.points[0]}
                                  current={item.user_stat?.all_time_points || 0}
                                />
                                <p className="gray-c p-medium">
                                  {t("ARLmGSB")}{" "}
                                  <span
                                    className={
                                      item.count -
                                        (item.user_stat?.count || 0) ===
                                      0
                                        ? "red-c"
                                        : "green-c"
                                    }
                                  >
                                    ({item.count - (item.user_stat?.count || 0)}
                                    )
                                  </span>
                                </p>
                              </div>
                            </div>
                          );
                        })}
                        <div className="fit-container">
                          <p className="gray-c">{t("A6gfLc1")}</p>
                        </div>

                        {repeatedRewardsStats.map((item) => {
                          let cooldown = item.user_stat
                            ? getCooldown(
                                item.user_stat.last_updated,
                                item.cooldown
                              )
                            : 0;
                          return (
                            <div
                              className="fit-container  fx-centered sc-s-18 "
                              style={{
                                backgroundColor: "var(--c1-side)",
                                border: "none",
                                overflow: "visible",
                              }}
                              key={item.action}
                            >
                              <div className="fit-container fx-scattered box-pad-h-m">
                                <div>
                                  <p>{levels[item.action]}</p>
                                  <div className="fx-centered">
                                    <p className="gray-c p-medium">
                                      {levels[item.action]} {t("AdFp9UM")}{" "}
                                      <span className="orange-c">
                                        {item.points[0] || 0} xp
                                      </span>
                                    </p>
                                  </div>
                                </div>
                                <div className="fx-centered">
                                  <ProgressCirc
                                    size={54}
                                    percentage={
                                      item.cooldown > 0
                                        ? Math.floor(
                                            (cooldown * 100) /
                                              (item.cooldown / 60)
                                          )
                                        : 100
                                    }
                                    inversed={item.cooldown > 0 ? true : false}
                                    innerComp={
                                      item.cooldown > 0 ? (
                                        <p className="gray-c p-small">
                                          {t("ARagjJY", {
                                            time: cooldown,
                                          })}
                                        </p>
                                      ) : (
                                        <div className="infinity"></div>
                                      )
                                    }
                                    tooltip={
                                      item.cooldown > 0
                                        ? t("Ap5dxlJ")
                                        : t("AwQyQTs")
                                    }
                                  />
                                </div>
                              </div>
                              <div
                                className=" box-pad-v-m box-pad-h-m fx-centered fx-col"
                                style={{
                                  minWidth: "max-content",
                                  borderLeft: "1px solid var(--dim-gray)",
                                }}
                              >
                                <h4 className="orange-c">
                                  {item.user_stat?.all_time_points || 0}
                                </h4>
                                <p className="gray-c p-small">{t("A4IGG0z")}</p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </>
                )}
                {!isLoaded && (
                  <div
                    className="fit-container fx-centered"
                    style={{ height: "80vh" }}
                  >
                    <LoadingLogo size={100} />
                  </div>
                )}
              </>
            )}
            {!isConnectedToYaki && (
              <PagePlaceholder page={"nostr-yaki-chest"} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

const TierDemo = ({ tier, exit }) => {
  const { t } = useTranslation();
  return (
    <div
      className="fixed-container fx-centered box-pad-h"
      onClick={(e) => {
        e.stopPropagation();
        exit();
      }}
    >
      <div
        className="box-pad-h box-pad-v sc-s bg-sp fx-centered fx-col fx-start-h slide-up"
        style={{ width: "min(100%, 450px)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="box-pad-h-s box-pad-v-s">
          <div className={tier.image} style={{ width: "180px" }}></div>
        </div>
        <div className="fx-centered fx-col  fit-container">
          {/* <h3>{tier.display_name}</h3> */}
          <div
            className="fx-centered fx-col fit-container"
            style={{ rowGap: "5px" }}
          >
            {!tier.locked && <p style={{ fontSize: "30px" }}>🎉</p>}
            {tier.locked && (
              <div className="round-icon">
                <p style={{ fontSize: "30px", filter: "grayscale(100%)" }}>
                  🔒
                </p>
              </div>
            )}

            {!tier.locked && <p className="green-c">{t("As4WVRZ")}</p>}
            {tier.locked && <p className="gray-c">{t("ARAXdTM")}</p>}
            <h3>{t("AdLQkic", { level: tier.min })}</h3>
            {tier.locked && (
              <div className="box-pad-h box-pad-v-s fit-container fx-centered fx-col">
                <ProgressBar
                  total={tier.min}
                  current={tier.currentLevel}
                  full={true}
                />
                <p className="orange-c p-medium">
                  {t("AfDrjvB", { level: tier.min - tier.currentLevel })}
                </p>
              </div>
            )}
          </div>
          <ul>
            {tier.description.map((description, index) => {
              return (
                <p className="gray-c p-centered" key={index}>
                  {description}
                </p>
              );
            })}
          </ul>
          <Link href={`/points-system#${tier.display_name.toLowerCase()}`}>
            <button className="btn btn-small btn-text-gray">
              {t("AArGqN7")}
            </button>
          </Link>
          <button className="btn btn-normal btn-full" onClick={exit}>
            {t("AGLUuNR")}
          </button>
        </div>
      </div>
    </div>
  );
};
const PointsDesc = ({ exit }) => {
  const { t } = useTranslation();
  return (
    <div
      className="fixed-container fx-centered box-pad-h"
      onClick={(e) => {
        e.stopPropagation();
        exit();
      }}
    >
      <div
        className="box-pad-h box-pad-v sc-s bg-sp fx-centered fx-col fx-start-h slide-up"
        style={{ width: "min(100%, 450px)" }}
        onClick={(e) => {
          e.stopPropagation();
        }}
      >
        <h3 className="p-centered box-pad-h box-marg-s">{t("AIdLWAb")}</h3>
        <p className="p-centered gray-c">{t("AIjkhSn")}</p>
          <p className="p-centered gray-c">{"> " + t("A6fM6gw") + " <"}</p>
          <p className="p-centered gray-c">{"> " + t("AaZQAOK") + " <"}</p>
          <p className="p-centered gray-c">{"> " + t("Av0e6zQ") + " <"}</p>
        <p className="green-c p-centered box-pad-h box-marg-s">{t("A3moqWy")}</p>
        <div className="fx-centered fx-col fit-container">
          <button className="btn btn-normal btn-full" onClick={exit}>
            {t("AGLUuNR")}
          </button>
        </div>
      </div>
    </div>
  );
};
