import React, { useState } from "react";
import ProgressBar from "../Components/ProgressBar";
import Link from "next/link";
let screenOne =
  "https://yakihonne.s3.ap-east-1.amazonaws.com/media/images/NewFeature/Leveling/screen-1.png";
let screenTwo =
  "https://yakihonne.s3.ap-east-1.amazonaws.com/media/images/NewFeature/Leveling/screen-2.png";
let screenThreeOne =
  "https://yakihonne.s3.ap-east-1.amazonaws.com/media/images/NewFeature/Leveling/screen-3-1.png";
let screenThreeTwo =
  "https://yakihonne.s3.ap-east-1.amazonaws.com/media/images/NewFeature/Leveling/screen-3-2.png";
let screenFourOne =
  "https://yakihonne.s3.ap-east-1.amazonaws.com/media/images/NewFeature/Leveling/screen-4-1.png";
let screenFourTwo =
  "https://yakihonne.s3.ap-east-1.amazonaws.com/media/images/NewFeature/Leveling/screen-4-2.png";
let screenFive =
  "https://yakihonne.s3.ap-east-1.amazonaws.com/media/images/NewFeature/Leveling/screen-5.png";
let screenSix =
  "https://yakihonne.s3.ap-east-1.amazonaws.com/media/images/NewFeature/Leveling/screen-6.png";
let screenSeven =
  "https://yakihonne.s3.ap-east-1.amazonaws.com/media/images/NewFeature/Leveling/screen-7.png";
let screenSevenTwo =
  "https://yakihonne.s3.ap-east-1.amazonaws.com/media/images/NewFeature/Leveling/screen-7-2.png";

export default function YakiLevelingFeature() {
  const [showRewards, setShowRewards] = useState(false);

  const LevelingSystem = [
    <ScreenOne />,
    <ScreenTwo />,
    <ScreenThree />,
    <ScreenFour />,
    <ScreenSeven />,
    <ScreenFive />,
  ];

  return (
    <div
      className="fx-centered box-pad-h box-pad-v fx-start-v"
      style={{ backgroundColor: "black", minHeight: "100vh" }}
    >
      <div style={{ width: "min(100%, 1000px)", paddingBottom: "3rem" }}>
        <div
          className="fx-centered fx-col fx-start-v fx-start-h"
          style={{ rowGap: "20px" }}
        >
          <div
            className="box-pad-h-s box-pad-v-s sc-s-18 fit-container fx-centered"
            style={{
              backgroundColor: "#202020",
              //   position:  "sticky",
              border: "none",
              top: "1rem",
              zIndex: 100,
            }}
          >
            <Link href={"/"} className="fx-centered">
              <div
                className="yakihonne-logo"
                style={{ filter: "brightness(0) invert()", height: "64px" }}
              ></div>
            </Link>
          </div>
          <div
            className="fx-centered fx-centered fx-col"
            style={{
              width: "min(100%, 1000px)",
              rowGap: "24px",
            }}
          >
            {LevelingSystem.map((item, index) => {
              return (
                <div className="fit-container fit-height" key={index}>
                  {item}
                </div>
              );
            })}
            <div
              className="fit-container fit-height fx-centered box-pad-h fx-wrap sc-s fx-col"
              style={{
                position: "relative",
                overflow: "hidden",
                padding: "2rem 1rem",
                backgroundColor: "#252429",
                border: "none",
              }}
              id="bronze"
            >
              <div className="fit-container fx-col fx-centered fx-start-v">
                <div className="fx-centerd fx-col fit-container">
                  <div
                    className="fx-centered fit-container pointer"
                    style={{ columnGap: "16px" }}
                    onClick={() =>
                      showRewards === "bronze"
                        ? setShowRewards(false)
                        : setShowRewards("bronze")
                    }
                  >
                    <div
                      className="bronze-tier"
                      style={{ minWidth: "90px", aspectRatio: "1/1" }}
                    ></div>
                    <div className="fx-centered fx-col fx-start-v fit-container">
                      <h4 style={{ color: "white" }}>Bronze tier</h4>
                      <div className="fx-centered fx-start-h">
                        <p className="gray-c ">
                          Starter Pack{" "}
                          <span className="p-small gray-c">&#9679;</span>
                          {"  "}
                          1x rewards gains{"  "}
                          <span className="p-small gray-c">&#9679;</span> Unique
                          Bronze Tier Badge{" "}
                          <span className="p-small gray-c">&#9679;</span> Random
                          SATs Lucky Draw{"  "}
                        </p>
                      </div>
                      <div style={{ width: "25%" }} className="fx-centered">
                        <ProgressBar total={100} current={100} full={true} />
                        <div style={{ minWidth: "max-content" }}>
                          <p className="orange-c p-medium">(1 - 50) level</p>
                        </div>
                      </div>
                    </div>
                    <div
                      className="round-icon"
                      style={{
                        rotate: showRewards === "bronze" ? "-180deg" : "0deg",
                        borderColor: "#343434",
                      }}
                    >
                      <div
                        className="arrow"
                        style={{ filter: "brightness(0) invert()" }}
                      ></div>
                    </div>
                  </div>
                  <div
                    className="fit-container"
                    style={{
                      maxHeight: showRewards === "bronze" ? "3000px" : "0",
                      overflow: "hidden",
                      transition: ".5s ease-in-out",
                    }}
                  >
                    {" "}
                    <Rewards />
                  </div>
                  {/* {showRewards === "bronze" && <Rewards />} */}
                </div>
                <hr
                  style={{ margin: "1rem auto", borderColor: "#343434" }}
                  id="silver"
                />
                <div className="fx-centerd fx-col fit-container">
                  <div
                    className="fx-centered fit-container pointer"
                    style={{ columnGap: "16px" }}
                    onClick={() =>
                      showRewards === "silver"
                        ? setShowRewards(false)
                        : setShowRewards("silver")
                    }
                  >
                    <div
                      className="silver-tier"
                      style={{ minWidth: "90px", aspectRatio: "1/1" }}
                    ></div>
                    <div className="fx-centered fx-col fx-start-v fit-container">
                      <h4 style={{ color: "white" }}>Silver tier</h4>
                      <div className="fx-centered fx-start-h">
                        <p className="gray-c ">
                          2x rewards gains{" "}
                          <span className="p-small gray-c">&#9679;</span>
                          {"  "}
                          Unique Silver Tier Badge{"  "}
                          <span className="p-small gray-c">&#9679;</span>{" "}
                          Scheduled SATs Lucky Draw
                        </p>
                      </div>
                      <div style={{ width: "50%" }} className="fx-centered">
                        <ProgressBar total={100} current={100} full={true} />
                        <div style={{ minWidth: "max-content" }}>
                          <p className="orange-c p-medium">(51 - 100) level</p>
                        </div>
                      </div>
                    </div>
                    <div
                      className="round-icon"
                      style={{
                        rotate: showRewards === "silver" ? "-180deg" : "0deg",
                        borderColor: "#343434",
                      }}
                    >
                      <div
                        className="arrow"
                        style={{ filter: "brightness(0) invert()" }}
                      ></div>
                    </div>
                  </div>
                  <div
                    className="fit-container"
                    style={{
                      maxHeight: showRewards === "silver" ? "3000px" : "0",
                      overflow: "hidden",
                      transition: ".5s ease-in-out",
                    }}
                  >
                    <Rewards volume={2} />
                  </div>
                  {/* {showRewards === "silver" && <Rewards volume={2} />} */}
                </div>
                <hr
                  style={{ margin: "1rem auto", borderColor: "#343434" }}
                  id="gold"
                />
                <div className="fx-centerd fx-col fit-container">
                  <div
                    className="fx-centered fit-container pointer"
                    style={{ columnGap: "16px" }}
                    onClick={() =>
                      showRewards === "gold"
                        ? setShowRewards(false)
                        : setShowRewards("gold")
                    }
                  >
                    <div
                      className="gold-tier"
                      style={{ minWidth: "90px", aspectRatio: "1/1" }}
                    ></div>
                    <div className="fx-centered fx-col fx-start-v fit-container">
                      <h4 style={{ color: "white" }}>Gold tier</h4>
                      <div className="fx-centered fx-start-h">
                        <p className="gray-c ">
                          3x rewards gains{" "}
                          <span className="p-small gray-c">&#9679;</span>
                          {"  "}
                          Unique Gold Tier Badge{"  "}
                          <span className="p-small gray-c">&#9679;</span>{" "}
                          Scheduled SATs Draw{" "}
                          <span className="p-small gray-c">&#9679;</span> Become
                          a Guest on The YakiHonne Podcast{"  "}
                          <span className="p-small gray-c">&#9679;</span> High
                          rate of content awareness
                        </p>
                      </div>
                      <div style={{ width: "75%" }} className="fx-centered">
                        <ProgressBar total={100} current={100} full={true} />
                        <div style={{ minWidth: "max-content" }}>
                          <p className="orange-c p-medium">(101 - 500) level</p>
                        </div>
                      </div>
                    </div>
                    <div
                      className="round-icon"
                      style={{
                        rotate: showRewards === "gold" ? "-180deg" : "0deg",
                        borderColor: "#343434",
                      }}
                    >
                      <div
                        className="arrow"
                        style={{ filter: "brightness(0) invert()" }}
                      ></div>
                    </div>
                  </div>
                  <div
                    className="fit-container"
                    style={{
                      maxHeight: showRewards === "gold" ? "3000px" : "0",
                      overflow: "hidden",
                      transition: ".5s ease-in-out",
                    }}
                  >
                    {" "}
                    <Rewards volume={3} />
                  </div>
                  {/* {showRewards === "gold" && <Rewards volume={3} />} */}
                </div>
                <hr
                  style={{ margin: "1rem auto", borderColor: "#343434" }}
                  id="platinum"
                />
                <div className="fx-centerd fx-col fit-container">
                  <div
                    className="fx-centered fit-container pointer"
                    style={{ columnGap: "16px" }}
                    onClick={() =>
                      showRewards === "platinum"
                        ? setShowRewards(false)
                        : setShowRewards("platinum")
                    }
                  >
                    <div
                      className="platinum-tier"
                      style={{ minWidth: "90px", aspectRatio: "1/1" }}
                    ></div>
                    <div className="fx-centered fx-col fx-start-v fit-container">
                      <h4 style={{ color: "white" }}>Platinum tier</h4>
                      <div className="fx-centered fx-start-h">
                        <p className="gray-c ">
                          3x rewards gains{" "}
                          <span className="p-small gray-c">&#9679;</span>
                          {"  "}
                          Unique Platinum Tier Badge{"  "}
                          <span className="p-small gray-c">&#9679;</span>{" "}
                          Scheduled SATs Draw{" "}
                          <span className="p-small gray-c">&#9679;</span>{" "}
                          Exlusive Events invitations{"  "}
                          <span className="p-small gray-c">&#9679;</span> Become
                          a Part of YakiHonne Grants Program
                        </p>
                      </div>
                      <div style={{ width: "100%" }} className="fx-centered">
                        <ProgressBar total={100} current={100} full={true} />
                        <div style={{ minWidth: "max-content" }}>
                          <p className="orange-c p-medium">
                            (501 and above) level
                          </p>
                        </div>
                      </div>
                    </div>
                    <div
                      className="round-icon"
                      style={{
                        rotate: showRewards === "platinum" ? "-180deg" : "0deg",
                        borderColor: "#343434",
                      }}
                    >
                      <div
                        className="arrow"
                        style={{ filter: "brightness(0) invert()" }}
                      ></div>
                    </div>
                  </div>
                  <div
                    className="fit-container"
                    style={{
                      maxHeight: showRewards === "platinum" ? "3000px" : "0",
                      overflow: "hidden",
                      transition: ".5s ease-in-out",
                    }}
                  >
                    <Rewards volume={4} />
                  </div>
                  {/* {showRewards === "platinum" && <Rewards volume={4}/>} */}
                </div>
              </div>
            </div>
            <ScreenSix />
          </div>
        </div>
      </div>
    </div>
  );
}

const ScreenOne = () => {
  return (
    <div
      className="fit-container fit-height fx-centered box-pad-h fx-wrap box-pad-v sc-s"
      style={{
        position: "relative",
        backgroundColor: "#252429",
        border: "none",
      }}
    >
      <div
        className="fx fx-centered fx-col fx-start-v box-pad-h"
        style={{ flex: "1 1 350px" }}
      >
        <h3 style={{ color: "white" }}>Introducing Yaki Points</h3>
        <p className="gray-c">
          Where every action brings you closer to amazing rewards !
        </p>
      </div>
      <div
        className="fx-1-5 fx-centered box-pad-h-m "
        style={{ flex: "1.5 1 350px" }}
      >
        <div
          className="fit-container sc-s box-pad-v"
          style={{ background: "#EEBB6B", border: "none" }}
        >
          <img src={screenOne} className="fit-container" />
        </div>
      </div>
    </div>
  );
};
const ScreenTwo = () => {
  return (
    <div
      className="fit-container fit-height fx-centered box-pad-h fx-wrap-r sc-s box-pad-v"
      style={{
        position: "relative",
        overflow: "hidden",
        backgroundColor: "#252429",
        border: "none",
      }}
    >
      <div
        className="fx-1-5 fx-centered box-pad-h-m "
        style={{ flex: "1.5 1 350px" }}
      >
        <div
          className="fit-container sc-s box-pad-v"
          style={{ background: "var(--c1)", border: "none" }}
        >
          <img src={screenTwo} className="fit-container" />
        </div>
      </div>
      <div
        className="fx fx-centered fx-col fx-start-v box-pad-h"
        style={{ flex: "1 1 350px" }}
      >
        <h3 style={{ color: "white" }}>Every Interaction counts</h3>
        <p className="gray-c">
          Earn points by engaging in activities, sharing your expertise.
        </p>
      </div>
    </div>
  );
};
const ScreenThree = () => {
  return (
    <div
      className="fit-container fit-height fx-centered box-pad-h fx-wrap-r sc-s"
      style={{
        position: "relative",
        overflow: "hidden",
        height: "45vh",
        backgroundColor: "#252429",
        border: "none",
      }}
    >
      <div
        className="fx fx-centered box-pad-h-m box-pad-v fit-height mb-hide-800"
        style={{ flex: "1 1 350px" }}
      >
        <div
          className="sc-s box-pad-v box-pad-h fx-centered "
          style={{ background: "#EEBB6B", height: "90%", border: "none" }}
        >
          <img
            src={screenThreeOne}
            style={{
              aspectRatio: "9/16",
              objectFit: "contain",
              height: "100%",
            }}
          />
        </div>
      </div>
      <div
        className="fx fx-centered box-pad-h-m  home-fn-mobile"
        style={{ flex: "1 1 350px" }}
      >
        <div
          className="sc-s box-pad-v box-pad-h fx-centered fit-container"
          style={{ background: "#EEBB6B" }}
        >
          <img
            src={screenThreeOne}
            style={{ aspectRatio: "15/9", objectFit: "contain", width: "100%" }}
          />
        </div>
      </div>
      <div
        className="fx-1-5 fx-centered fx-col fx-start-v box-pad-h"
        style={{ position: "relative", flex: "1.5 1 350px" }}
      >
        <div className="fx-centered fx-col fx-start-v box-pad-h">
          <h3 style={{ color: "white" }}>Meet Pleb, the newest member!</h3>
          <p className="gray-c">
            From the moment Pleb joined, the rewards started rolling in.
          </p>
          <div className="box-marg-full mb-hide-800"></div>
        </div>
        <div
          className="mb-hide-800"
          style={{
            position: "absolute",
            right: "0",
            top: "60%",
            transform: "translateX(20%)",
          }}
        >
          <div className="fit-container" style={{ position: "relative" }}>
            <div
              className="sc-s"
              style={{
                zIndex: "-1",
                background: "var(--c1)",
                height: "80%",
                position: "absolute",
                width: "85%",
                left: "50%",
                transform: "translateX(-50%)",
                bottom: 0,
                border: "none",
              }}
            ></div>
            <img src={screenThreeTwo} className="fit-container" />
          </div>
        </div>
      </div>
    </div>
  );
};
const ScreenFour = () => {
  return (
    <div
      className="fit-container fit-height fx-centered box-pad-h fx-wrap-r sc-s"
      style={{
        position: "relative",
        overflow: "hidden",
        height: "45vh",
        backgroundColor: "#252429",
        border: "none",
      }}
    >
      <div
        className="fx-1-5 fx-centered box-pad-h-m "
        style={{ flex: "1 1 350px" }}
      >
        <div className="fit-container" style={{ position: "relative" }}>
          <div
            className="sc-s"
            style={{
              zIndex: "-1",
              background: "var(--c1)",
              height: "80%",
              position: "absolute",
              width: "85%",
              left: "50%",
              transform: "translateX(-50%)",
              bottom: 0,
            }}
          ></div>
          <img src={screenFourOne} className="fit-container" />
        </div>
      </div>
      <div
        className="fx fx-centered fx-col fx-start-v box-pad-h"
        style={{ position: "relative", flex: "1 1 350px" }}
      >
        <div className="fx-centered fx-col fx-start-v box-pad-h">
          <h3 style={{ color: "white" }}>Get Started Now</h3>
          <p className="gray-c">
            Unlock the one-time rewards by setting up your account.
          </p>
          <div className="box-marg-full mb-hide-800"></div>
        </div>
        <div
          className="mb-hide-800"
          style={{
            position: "absolute",
            right: "0",
            top: "60%",
            transform: "translateX(-20%)",
          }}
        >
          <div
            className="sc-s box-pad-v box-pad-h "
            style={{
              background: "#EEBB6B",
              height: "90%",
              width: "200px",
              border: "none",
            }}
          >
            <img src={screenFourTwo} className="fit-container" />
          </div>
        </div>
      </div>
    </div>
  );
};
const ScreenFive = () => {
  return (
    <div
      className="fit-container fit-height fx-centered box-pad-h fx-wrap sc-s"
      style={{
        position: "relative",
        overflow: "hidden",
        padding: "2rem 1rem",
        height: "50vh",
        backgroundColor: "#252429",
        border: "none",
      }}
    >
      <div
        className="fx fx-centered fx-col fx-start-v box-pad-h"
        style={{ flex: "1 1 350px" }}
      >
        <h3 style={{ color: "white" }}>Unlock Tiers, Multiply Rewards</h3>
        <p className="gray-c">
          Level up through the tiers and unlock multiplied rewards with every
          milestone you achieve.
        </p>
      </div>
      <div
        className="fx fx-centered box-pad-h-m fit-height  mb-hide-800"
        style={{ flex: "1 1 350px" }}
      >
        <div
          className="fit-container fx-centered sc-s box-pad-v"
          style={{ background: "var(--c1)", height: "100%", border: "none" }}
        >
          <img
            src={screenFive}
            className="fit-container"
            style={{
              height: "100%",
              aspectRatio: "9/16",
              objectFit: "contain",
            }}
          />
        </div>
      </div>
      <div
        className="fx fx-centered box-pad-h-m home-fn-mobile"
        style={{ flex: "1 1 350px" }}
      >
        <div
          className="fit-container fx-centered sc-s box-pad-v "
          style={{ background: "var(--c1)", border: "none" }}
        >
          <img
            src={screenFive}
            className="fit-container"
            style={{ aspectRatio: "15/9", objectFit: "contain", width: "100%" }}
          />
        </div>
      </div>
    </div>
  );
};

const ScreenSeven = () => {
  return (
    <div
      className="fit-container fit-height fx-centered box-pad-h fx-wrap sc-s"
      style={{
        position: "relative",
        overflow: "hidden",
        height: "55vh",
        backgroundColor: "#252429",
        border: "none",
      }}
    >
      <div
        className="fx fx-centered fx-col fx-start-v box-pad-h"
        style={{ flex: "1 1 300px" }}
      >
        <h3 style={{ color: "white" }}>Achieve with Yaki</h3>
        <p className="gray-c">The Ultimate Leveling and Rewards System!</p>
      </div>
      <div
        className="fx fx-centered  fx-start-v box-pad-h home-fn-mobile"
        style={{ flex: "1 1 400px", columnGap: 0 }}
      >
        <div
          className="fx-centered fx-col fx-start-v box-pad-h-s"
          style={{ rowGap: "2px" }}
        >
          <p style={{ color: "white" }}>Track Your Activities</p>
          <p className="gray-c p-medium">
            Pleb is on a roll, effortlessly tracking every action reward and
            watching his progress soar!
          </p>
        </div>
        <div
          className="fx-centered fx-col fx-start-v box-pad-h-s"
          style={{ rowGap: "2px" }}
        >
          <p style={{ color: "white" }}>Level Up and Multiply</p>
          <p className="gray-c p-medium">
            Pleb is on a mission, leveling up to unlock new tiers and reap
            multiplied rewards. Transform consistent efforts into exponential
            gains.
          </p>
        </div>
        <div
          className="fx-centered fx-col fx-start-v box-pad-h-s"
          style={{ rowGap: "2px" }}
        >
          <p style={{ color: "white" }}>Stay on Top of Your Rewards</p>
          <p className="gray-c p-medium">
            Pleb is constantly on the lookout, tracking repeated rewards and
            ensuring no opportunity is missed.
          </p>
        </div>
      </div>
      <div
        className="fx fx-centered box-pad-h-m box-pad-v fit-height mb-hide-800"
        style={{ flex: "1 1 300px" }}
      >
        <div
          className="fit-container fx-centered sc-s box-pad-v"
          style={{ background: "#EEBB6B", height: "100%", border: "none" }}
        >
          <img
            src={screenSeven}
            className="fit-container"
            style={{
              height: "100%",
              aspectRatio: "9/16",
              objectFit: "contain",
            }}
          />
        </div>
      </div>
      <div
        className="fx fx-centered box-pad-h-m home-fn-mobile"
        style={{ flex: "1 1 300px" }}
      >
        <div
          className="fit-container fx-centered sc-s box-pad-v"
          style={{ background: "#EEBB6B", border: "none" }}
        >
          <img
            src={screenSevenTwo}
            className="fit-container"
            style={{ aspectRatio: "23/9", objectFit: "contain", width: "100%" }}
          />
        </div>
      </div>
      <div
        className="fx fx-centered fx-col fx-start-v box-pad-h mb-hide-800"
        style={{ rowGap: "32px", flex: "1 1 300px" }}
      >
        <div
          className="fx-centered fx-col fx-start-v box-pad-h"
          style={{ rowGap: "2px" }}
        >
          <p className="p-big p-bold" style={{ color: "white" }}>
            Track Your Activities
          </p>
          <p className="gray-c p-medium">
            Pleb is on a roll, effortlessly tracking every action reward and
            watching his progress soar!
          </p>
        </div>
        <div
          className="fx-centered fx-col fx-start-v box-pad-h"
          style={{ rowGap: "2px" }}
        >
          <p className="p-big p-bold" style={{ color: "white" }}>
            Level Up and Multiply
          </p>
          <p className="gray-c p-medium">
            Pleb is on a mission, leveling up to unlock new tiers and reap
            multiplied rewards. Transform consistent efforts into exponential
            gains.
          </p>
        </div>
        <div
          className="fx-centered fx-col fx-start-v box-pad-h"
          style={{ rowGap: "2px" }}
        >
          <p className="p-big p-bold" style={{ color: "white" }}>
            Stay on Top of Your Rewards
          </p>
          <p className="gray-c p-medium">
            Pleb is constantly on the lookout, tracking repeated rewards and
            ensuring no opportunity is missed.
          </p>
        </div>
      </div>
    </div>
  );
};

const ScreenSix = () => {
  const skipShowcase = () => {
    localStorage?.setItem("feature_showcase", Date.now());
    window.location.href = "/yaki-points";
  };
  return (
    <div
      className="fit-container fit-height fx-centered box-pad-h bg-img cover-bg sc-s"
      style={{
        position: "relative",
        backgroundImage: `url(${screenSix})`,
        height: "50vh",
        backgroundColor: "#252429",
        border: "none",
      }}
    >
      <div className="fx fx-centered fx-col fx-start-v box-pad-h">
        <h3 style={{ color: "white" }}>Start racking up rewards! </h3>
        <button className="btn btn-normal" onClick={skipShowcase}>
          Take me there!
        </button>
      </div>
      <div className="fx fx-centered box-pad-h-m box-pad-v fit-height"></div>
    </div>
  );
};

const Rewards = ({ volume = false }) => {
  return (
    <div className="fit-container fx-centered fx-wrap fx-stretch box-pad-v">
      {levels.map((reward, index) => {
        return (
          <div
            key={index}
            className="box-pad-h box-pad-v-m sc-s fx-centered fx-col option"
            style={{
              width: "24%",
              backgroundColor: "#252429",
              borderColor: "#343434",
            }}
          >
            <div
              className={reward.icon}
              style={{
                minWidth: "32px",
                minHeight: "32px",
                filter: "invert()",
              }}
            ></div>
            <div className="fx-centered " style={{ filter: "invert()" }}>
              <h4>{reward.points[0]}</h4>
              <p className="gray-c">xp</p>
              {volume && (
                <p className="p-big orange-c" style={{ filter: "invert()" }}>
                  x{volume}
                </p>
              )}
            </div>
            <p className="p-centered gray-c p-medium">{reward.display_name}</p>
          </div>
        );
      })}
    </div>
  );
};

const levels = [
  {
    points: [50],
    count: 1,
    cooldown: 0,
    display_name: "Account creation",
    icon: "user-24",
  },
  {
    points: [5],
    count: 5,
    cooldown: 0,
    display_name: "Setting a username",
    icon: "user-24",
  },
  {
    points: [5],
    count: 5,
    cooldown: 0,
    display_name: "Setting a bio",
    icon: "user-24",
  },
  {
    points: [5],
    count: 5,
    cooldown: 0,
    display_name: "Setting a profile picture",
    icon: "image-24",
  },
  {
    points: [5],
    count: 5,
    cooldown: 0,
    display_name: "Setting a profile cover",
    icon: "image-24",
  },
  {
    points: [5],
    count: 3,
    cooldown: 0,
    display_name: "Using a nip05",
    icon: "nip05-24",
  },
  {
    points: [15],
    count: 3,
    cooldown: 0,
    display_name: "Using a lightning address",
    icon: "lightning",
  },
  {
    points: [10],
    count: 1,
    cooldown: 0,
    display_name: "Setting favorite relays",
    icon: "server-24",
  },
  {
    points: [10],
    count: 1,
    cooldown: 0,
    display_name: "Choosing favorite topics",
    icon: "comment-24",
  },
  {
    points: [30],
    count: 1,
    cooldown: 0,
    display_name: "Following Yakihonne official account",
    icon: "user-24",
  },
  {
    points: [15],
    count: 0,
    cooldown: 0,
    display_name: "Posting flash news",
    icon: "news-24",
  },
  {
    points: [2],
    count: 0,
    cooldown: 3600,
    display_name: "Uncensored notes writing",
    icon: "note-24",
  },
  {
    points: [1],
    count: 0,
    cooldown: 3600,
    display_name: "Uncensored notes rating",
    icon: "like-24",
  },
  {
    points: [2],
    count: 0,
    cooldown: 7200,
    display_name: "Posting curations",
    icon: "curation-24",
  },
  {
    points: [4],
    count: 0,
    cooldown: 3600,
    display_name: "Posting articles",
    icon: "posts-24",
  },
  {
    points: [2],
    count: 0,
    cooldown: 3600,
    display_name: "Article drafts",
    icon: "posts-24",
  },
  {
    points: [3],
    count: 0,
    cooldown: 7200,
    display_name: "Posting videos",
    icon: "play-24",
  },
  {
    points: [2],
    count: 0,
    cooldown: 0,
    display_name: "Bookmarking",
    icon: "bookmark-24",
  },
  {
    points: [1, 5, 10, 20],
    count: 0,
    cooldown: 0,
    display_name: "Zapping",
    icon: "bolt-24",
  },
  {
    points: [2],
    count: 0,
    cooldown: 0,
    display_name: "Reactions",
    icon: "like-24",
  },
  {
    points: [5, 10],
    count: 0,
    cooldown: 3600,
    display_name: "Sending messages",
    icon: "env-24",
  },
  {
    points: [2],
    count: 0,
    cooldown: 900,
    display_name: "Posting comments",
    icon: "comment-24",
  },
];
