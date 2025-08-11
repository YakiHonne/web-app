import React from "react";
let screenOne = "https://yakihonne.s3.ap-east-1.amazonaws.com/media/images/NewFeature/Leveling/screen-1.png";
let screenTwo = "https://yakihonne.s3.ap-east-1.amazonaws.com/media/images/NewFeature/Leveling/screen-2.png";
let screenThreeOne = "https://yakihonne.s3.ap-east-1.amazonaws.com/media/images/NewFeature/Leveling/screen-3-1.png";
let screenThreeTwo = "https://yakihonne.s3.ap-east-1.amazonaws.com/media/images/NewFeature/Leveling/screen-3-2.png";
let screenFourOne = "https://yakihonne.s3.ap-east-1.amazonaws.com/media/images/NewFeature/Leveling/screen-4-1.png";
let screenFourTwo = "https://yakihonne.s3.ap-east-1.amazonaws.com/media/images/NewFeature/Leveling/screen-4-2.png";
let screenFive = "https://yakihonne.s3.ap-east-1.amazonaws.com/media/images/NewFeature/Leveling/screen-5.png";
let screenSix = "https://yakihonne.s3.ap-east-1.amazonaws.com/media/images/NewFeature/Leveling/screen-6.png";
let screenSeven = "https://yakihonne.s3.ap-east-1.amazonaws.com/media/images/NewFeature/Leveling/screen-7.png";
let screenSevenTwo = "https://yakihonne.s3.ap-east-1.amazonaws.com/media/images/NewFeature/Leveling/screen-7-2.png";

const ScreenOne = () => {
  return (
    <div
      className="fit-container fit-height fx-centered box-pad-h fx-wrap box-pad-v "
      style={{ position: "relative" }}
    >
      <div
        className="fx fx-centered fx-col fx-start-v box-pad-h"
        style={{ flex: "1 1 350px" }}
      >
        <h3>Introducing Yaki Points</h3>
        <p className="gray-c">
          Where every action brings you closer to amazing rewards !
        </p>
      </div>
      <div
        className="fx-1-5 fx-centered box-pad-h-m "
        style={{ flex: "1.5 1 350px" }}
      >
        <div
          className="fit-container sc-s box-pad-v box-pad-h"
          style={{ background: "#EEBB6B" }}
        >
          <img src={screenOne} className="fit-container" />
        </div>
      </div>

      <div className="corner-icon mb-hide-800 ">
        <div className="chest" style={{ scale: "-1.5 1.5" }}></div>
      </div>
    </div>
  );
};
const ScreenTwo = () => {
  return (
    <div
      className="fit-container fit-height fx-centered box-pad-h fx-wrap "
      style={{ position: "relative", overflow: "hidden" }}
    >
      <div
        className="fx fx-centered fx-col fx-start-v box-pad-h"
        style={{ flex: "1 1 350px" }}
      >
        <h3>Every Interaction counts</h3>
        <p className="gray-c">
          Earn points by engaging in activities, sharing your expertise.
        </p>
      </div>
      <div
        className="fx-1-5 fx-centered box-pad-h-m "
        style={{ flex: "1.5 1 350px" }}
      >
        <div
          className="fit-container sc-s box-pad-v box-pad-h"
          style={{ background: "var(--c1)" }}
        >
          <img src={screenTwo} className="fit-container" />
        </div>
      </div>

      <div className="corner-icon mb-hide-800">
        <div
          className="bronze-tier"
          style={{ width: "250px", aspectRatio: "1/1" }}
        ></div>
      </div>
    </div>
  );
};
const ScreenThree = () => {
  return (
    <div
      className="fit-container fit-height fx-centered box-pad-h fx-wrap-r "
      style={{ position: "relative", overflow: "hidden" }}
    >
      <div
        className="fx fx-centered box-pad-h-m box-pad-v fit-height mb-hide-800"
        style={{ flex: "1 1 350px" }}
      >
        <div
          className="sc-s box-pad-v box-pad-h fx-centered "
          style={{ background: "#EEBB6B", height: "90%" }}
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
          <h3>Meet Pleb, the newest member!</h3>
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
              }}
            ></div>
            <img src={screenThreeTwo} className="fit-container" />
          </div>
        </div>
      </div>
      <div className="corner-icon mb-hide-800">
        <div
          className="silver-tier"
          style={{ width: "250px", aspectRatio: "1/1" }}
        ></div>
      </div>
    </div>
  );
};
const ScreenFour = () => {
  return (
    <div
      className="fit-container fit-height fx-centered box-pad-h fx-wrap-r "
      style={{ position: "relative", overflow: "hidden" }}
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
          <h3>Get Started Now</h3>
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
            style={{ background: "#EEBB6B", height: "90%", width: "200px" }}
          >
            <img src={screenFourTwo} className="fit-container" />
          </div>
        </div>
      </div>
      <div className="corner-icon mb-hide-800">
        <div
          className="gold-tier"
          style={{ width: "250px", aspectRatio: "1/1" }}
        ></div>
      </div>
    </div>
  );
};
const ScreenFive = () => {
  return (
    <div
      className="fit-container fit-height fx-centered box-pad-h fx-wrap "
      style={{ position: "relative", overflow: "hidden", padding: "2rem 1rem" }}
    >
      <div
        className="fx fx-centered fx-col fx-start-v box-pad-h"
        style={{ flex: "1 1 350px" }}
      >
        <h3>Unlock Tiers, Multiply Rewards</h3>
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
          style={{ background: "var(--c1)", height: "100%" }}
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
          style={{ background: "var(--c1)" }}
        >
          <img
            src={screenFive}
            className="fit-container"
            style={{ aspectRatio: "15/9", objectFit: "contain", width: "100%" }}
          />
        </div>
      </div>

      <div className="corner-icon mb-hide-800">
        <div
          className="bronze-tier"
          style={{ width: "250px", aspectRatio: "1/1" }}
        ></div>
      </div>
    </div>
  );
};
const ScreenSix = () => {
  const skipShowcase = () => {
    localStorage.setItem("feature_showcase", Date.now());
    window.location.href = "/yaki-points";
  };
  return (
    <div
      className="fit-container fit-height fx-centered box-pad-h bg-img cover-bg "
      style={{ position: "relative", backgroundImage: `url(${screenSix})` }}
    >
      <div className="fx fx-centered fx-col fx-start-v box-pad-h">
        <h3>Start racking up rewards! </h3>
        <button className="btn btn-normal" onClick={skipShowcase}>
          Take me there!
        </button>
      </div>
      <div className="fx fx-centered box-pad-h-m box-pad-v fit-height"></div>
    </div>
  );
};
const ScreenSeven = () => {
  return (
    <div
      className="fit-container fit-height fx-centered box-pad-h fx-wrap"
      style={{ position: "relative", overflow: "hidden" }}
    >
      <div
        className="fx fx-centered fx-col fx-start-v box-pad-h"
        style={{ flex: "1 1 300px" }}
      >
        <h3>Achieve with Yaki</h3>
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
          <p>Track Your Activities</p>
          <p className="gray-c p-medium">
            Pleb is on a roll, effortlessly tracking every action reward and
            watching his progress soar!
          </p>
        </div>
        <div
          className="fx-centered fx-col fx-start-v box-pad-h-s"
          style={{ rowGap: "2px" }}
        >
          <p>Level Up and Multiply</p>
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
          <p>Stay on Top of Your Rewards</p>
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
          style={{ background: "#EEBB6B", height: "100%" }}
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
          style={{ background: "#EEBB6B" }}
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
          <p className="p-big p-bold">Track Your Activities</p>
          <p className="gray-c p-medium">
            Pleb is on a roll, effortlessly tracking every action reward and
            watching his progress soar!
          </p>
        </div>
        <div
          className="fx-centered fx-col fx-start-v box-pad-h"
          style={{ rowGap: "2px" }}
        >
          <p className="p-big p-bold">Level Up and Multiply</p>
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
          <p className="p-big p-bold">Stay on Top of Your Rewards</p>
          <p className="gray-c p-medium">
            Pleb is constantly on the lookout, tracking repeated rewards and
            ensuring no opportunity is missed.
          </p>
        </div>
      </div>
      <div className="corner-icon mb-hide-800">
        <div
          className="platinum-tier"
          style={{ width: "250px", aspectRatio: "1/1" }}
        ></div>
      </div>
    </div>
  );
};

const LevelingSystem = [
  <ScreenOne key="screen-one" />,
  <ScreenTwo key="screen-two" />,
  <ScreenThree key="screen-three" />,
  <ScreenFour key="screen-four" />,
  <ScreenSeven key="screen-seven" />,
  <ScreenFive key="screen-five" />,
  <ScreenSix key="screen-six" />,
];

export default LevelingSystem;
