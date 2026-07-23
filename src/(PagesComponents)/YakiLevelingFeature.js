import React, { useEffect, useState } from "react";
import Link from "next/link";
import Icon from "@/Components/Icon";

const IMG_BASE =
  "https://yakihonne.s3.ap-east-1.amazonaws.com/media/images/NewFeature/Leveling";
const screenOne = `${IMG_BASE}/screen-1.png`;
const screenTwo = `${IMG_BASE}/screen-2.png`;
const screenThreeOne = `${IMG_BASE}/screen-3-1.png`;
const screenFourOne = `${IMG_BASE}/screen-4-1.png`;
const screenFive = `${IMG_BASE}/screen-5.png`;
const screenSeven = `${IMG_BASE}/screen-7.png`;

const FEATURES = [
  {
    id: "intro",
    title: "Introducing Yaki Points",
    body: "Where every action brings you closer to amazing rewards. Yaki Points turn the way you use the platform into a rewarding journey.",
    image: screenOne,
    portrait: false,
  },
  {
    id: "interaction",
    title: "Every interaction counts",
    body: "Earn points by engaging in activities and sharing your expertise. Posts, zaps, reactions and more all move you forward.",
    image: screenTwo,
    portrait: false,
    reversed: true,
  },
  {
    id: "meet-pleb",
    title: "Meet Pleb, the newest member",
    body: "From the moment Pleb joined, the rewards started rolling in. See how a fresh account starts stacking points from day one.",
    image: screenThreeOne,
    portrait: true,
  },
  {
    id: "get-started",
    title: "Get started now",
    body: "Unlock the one-time rewards by setting up your account. A complete profile is the fastest way to build early momentum.",
    image: screenFourOne,
    portrait: false,
    reversed: true,
  },
];

const TRACK_POINTS = [
  {
    title: "Track your activities",
    body: "Effortlessly track every action reward and watch your progress soar in real time.",
  },
  {
    title: "Level up and multiply",
    body: "Unlock new tiers and reap multiplied rewards. Transform consistent efforts into exponential gains.",
  },
  {
    title: "Stay on top of your rewards",
    body: "Keep an eye on repeated rewards and make sure no opportunity is ever missed.",
  },
];

const TIERS = [
  {
    id: "bronze",
    name: "Bronze tier",
    art: "bronze-tier",
    range: "Level 1 – 50",
    multiplier: "1× rewards gains",
    perks: ["Starter Pack", "Unique Bronze Tier Badge", "Random SATs Lucky Draw"],
    volume: false,
  },
  {
    id: "silver",
    name: "Silver tier",
    art: "silver-tier",
    range: "Level 51 – 100",
    multiplier: "2× rewards gains",
    perks: ["Unique Silver Tier Badge", "x2 chance of random SATs Lucky Draw"],
    volume: 2,
  },
  {
    id: "gold",
    name: "Gold tier",
    art: "gold-tier",
    range: "Level 101 – 500",
    multiplier: "3× rewards gains",
    perks: [
      "Unique Gold Tier Badge",
      "x3 chance of random SATs Lucky Draw",
      "Guest on The YakiHonne Podcast",
      "High rate of content awareness",
    ],
    volume: 3,
  },
  {
    id: "platinum",
    name: "Platinum tier",
    art: "platinum-tier",
    range: "Level 501 & above",
    multiplier: "3× rewards gains",
    perks: [
      "Unique Platinum Tier Badge",
      "x4 chance of random SATs Lucky Draw",
      "Exclusive events invitations",
      "Part of the YakiHonne Grants Program",
    ],
    volume: 4,
  },
];

export default function YakiLevelingFeature() {
  const [openTier, setOpenTier] = useState("bronze");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (typeof window !== "undefined" && window.location.hash) {
      const id = window.location.hash.replace("#", "");
      if (TIERS.some((tier) => tier.id === id)) {
        setOpenTier(id);
        setTimeout(() => {
          document
            .getElementById(id)
            ?.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 100);
      }
    }
  }, []);

  const goToApp = () => {
    localStorage?.setItem("feature_showcase", Date.now());
    window.location.href = "/yaki-points";
  };

  return (
    <div className="points-page">
      <div className="points-topbar">
        <div className="points-topbar-inner">
          <Link href="/" className="fx-centered">
            <span
              className="points-brand-mark-wrap"
              style={{ opacity: mounted ? 1 : 0 }}
            >
              <Icon
                name="yaki-logomark"
                className="points-brand-mark"
                width={40}
                height={40}
                isColored
              />
            </span>
          </Link>
          <button
            className="btn btn-normal btn-small points-topbar-cta"
            onClick={goToApp}
          >
            Open Yaki Points
          </button>
        </div>
      </div>

      <div className="points-wrap">
        <header className="points-header">
          <span className="points-eyebrow">Rewards</span>
          <h1 className="points-title">The Yaki Points system</h1>
          <p className="points-lead">
            Track your progress, level up through the tiers, and turn everyday
            engagement into real rewards.
          </p>
        </header>

        {FEATURES.map((feature) => (
          <section
            key={feature.id}
            className={`points-feature${feature.reversed ? " is-reversed" : ""}`}
          >
            <div className="points-feature-media">
              <div
                className={`points-frame${feature.portrait ? " is-portrait" : ""}`}
              >
                <img src={feature.image} alt={feature.title} loading="lazy" />
              </div>
            </div>
            <div className="points-feature-copy">
              <h2>{feature.title}</h2>
              <p>{feature.body}</p>
            </div>
          </section>
        ))}

        <section className="points-feature">
          <div className="points-feature-media">
            <div className="points-frame is-portrait">
              <img src={screenSeven} alt="Track your activities" loading="lazy" />
            </div>
          </div>
          <div className="points-feature-copy">
            <h2>Achieve with Yaki</h2>
            <p>The ultimate leveling and rewards system.</p>
            <ul className="points-feature-points">
              {TRACK_POINTS.map((item) => (
                <li key={item.title}>
                  <strong>{item.title}</strong>
                  <span>{item.body}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="points-feature is-reversed">
          <div className="points-feature-media">
            <div className="points-frame is-portrait">
              <img
                src={screenFive}
                alt="Unlock tiers, multiply rewards"
                loading="lazy"
              />
            </div>
          </div>
          <div className="points-feature-copy">
            <h2>Unlock tiers, multiply rewards</h2>
            <p>
              Level up through the tiers and unlock multiplied rewards with every
              milestone you achieve.
            </p>
          </div>
        </section>

        <section className="points-tiers">
          <div className="points-tiers-head">
            <h2>Tiers &amp; rewards</h2>
            <p>Climb the ranks to multiply your gains and unlock exclusive perks.</p>
          </div>

          {TIERS.map((tier) => {
            const isOpen = openTier === tier.id;
            return (
              <div
                key={tier.id}
                id={tier.id}
                className={`points-tier${isOpen ? " is-open" : ""}`}
                style={{ scrollMarginTop: "5rem" }}
              >
                <button
                  className="points-tier-btn"
                  onClick={() => setOpenTier(isOpen ? "" : tier.id)}
                  aria-expanded={isOpen}
                >
                  <div className={`points-tier-art ${tier.art}`}></div>
                  <div className="points-tier-info">
                    <div className="points-tier-name-row">
                      <p className="points-tier-name">{tier.name}</p>
                      <span className="points-tier-range">{tier.range}</span>
                    </div>
                    <p className="points-tier-multiplier">{tier.multiplier}</p>
                  </div>
                  <span className="points-tier-chevron">
                    <Icon name="arrow" />
                  </span>
                </button>

                <div className="points-tier-panel">
                  <div className="points-perks">
                    {tier.perks.map((perk) => (
                      <span className="points-perk" key={perk}>
                        {perk}
                      </span>
                    ))}
                  </div>
                  <div className="points-tier-panel-inner">
                    <p className="points-rewards-label">Reward actions</p>
                    <RewardsGrid volume={tier.volume} />
                  </div>
                </div>
              </div>
            );
          })}
        </section>

        <div className="points-cta">
          <h2>Start racking up rewards</h2>
          <p>
            Jump into Yaki Points and see how your everyday activity turns into
            levels, tiers, and real rewards.
          </p>
          <button className="btn btn-normal" onClick={goToApp}>
            Take me there
          </button>
        </div>
      </div>
    </div>
  );
}

const RewardsGrid = ({ volume = false }) => {
  return (
    <div className="points-rewards-list">
      {levels.map((reward, index) => (
        <div className="points-reward-row" key={index}>
          <span className="points-reward-icon">
            <Icon name={reward.icon} width={22} height={22} />
          </span>
          <p className="points-reward-name">{reward.display_name}</p>
          <div className="points-reward-value">
            <b>{reward.points[0]}</b>
            <span className="points-reward-xp">xp</span>
            {volume && <span className="points-reward-mult">×{volume}</span>}
          </div>
        </div>
      ))}
    </div>
  );
};

const levels = [
  {
    points: [50],
    count: 1,
    cooldown: 0,
    display_name: "Account creation",
    icon: "user-bold",
  },
  {
    points: [5],
    count: 5,
    cooldown: 0,
    display_name: "Setting a username",
    icon: "user-bold",
  },
  {
    points: [5],
    count: 5,
    cooldown: 0,
    display_name: "Setting a bio",
    icon: "user-bold",
  },
  {
    points: [5],
    count: 5,
    cooldown: 0,
    display_name: "Setting a profile picture",
    icon: "media-bold",
  },
  {
    points: [5],
    count: 5,
    cooldown: 0,
    display_name: "Setting a profile cover",
    icon: "media-bold",
  },
  {
    points: [5],
    count: 3,
    cooldown: 0,
    display_name: "Using a nip05",
    icon: "key-icon",
  },
  {
    points: [15],
    count: 3,
    cooldown: 0,
    display_name: "Using a lightning address",
    icon: "bolt-bold",
  },
  {
    points: [10],
    count: 1,
    cooldown: 0,
    display_name: "Setting favorite relays",
    icon: "orbit-bold",
  },
  {
    points: [10],
    count: 1,
    cooldown: 0,
    display_name: "Choosing favorite topics",
    icon: "discover-bold",
  },
  {
    points: [30],
    count: 1,
    cooldown: 0,
    display_name: "Following Yakihonne official account",
    icon: "user-followed",
  },
  {
    points: [15],
    count: 0,
    cooldown: 0,
    display_name: "Posting flash news",
    icon: "news-bold",
  },
  {
    points: [2],
    count: 0,
    cooldown: 3600,
    display_name: "Uncensored notes writing",
    icon: "note-bold",
  },
  {
    points: [1],
    count: 0,
    cooldown: 3600,
    display_name: "Uncensored notes rating",
    icon: "like-bold",
  },
  {
    points: [2],
    count: 0,
    cooldown: 7200,
    display_name: "Posting curations",
    icon: "curation-bold",
  },
  {
    points: [4],
    count: 0,
    cooldown: 3600,
    display_name: "Posting articles",
    icon: "posts-bold",
  },
  {
    points: [2],
    count: 0,
    cooldown: 3600,
    display_name: "Article drafts",
    icon: "note-2-bold",
  },
  {
    points: [3],
    count: 0,
    cooldown: 7200,
    display_name: "Posting videos",
    icon: "play-bold",
  },
  {
    points: [2],
    count: 0,
    cooldown: 0,
    display_name: "Bookmarking",
    icon: "bookmark-b",
  },
  {
    points: [1, 5, 10, 20],
    count: 0,
    cooldown: 0,
    display_name: "Zapping",
    icon: "bolt-bold",
  },
  {
    points: [2],
    count: 0,
    cooldown: 0,
    display_name: "Reactions",
    icon: "heart-bold",
  },
  {
    points: [5, 10],
    count: 0,
    cooldown: 3600,
    display_name: "Sending messages",
    icon: "env-bold",
  },
  {
    points: [2],
    count: 0,
    cooldown: 900,
    display_name: "Posting comments",
    icon: "comment-icon",
  },
];
