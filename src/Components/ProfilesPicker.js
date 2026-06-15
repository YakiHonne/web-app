import React, { useEffect, useRef, useState } from "react";
import { getConnectedAccounts } from "@/Helpers/ClientHelpers";
import { useSelector } from "react-redux";
import UserProfilePic from "@/Components/UserProfilePic";
import Icon from "@/Components/Icon";

const PIC_SIZE = 34;
const ROW_GAP = 4;
const ROW_HEIGHT = PIC_SIZE + ROW_GAP;
const VISIBLE_ROWS = 3;
const SETTLE_DELAY = 280;

const WHEEL_STYLES = `
  @keyframes pp-row-in {
    0%   { opacity: 0; transform: scale(0.6) translateY(6px); }
    100% { opacity: var(--pp-row-opacity, 1); transform: scale(var(--pp-row-scale, 1)) translateY(0); }
  }

  .pp-anchor {
    position: relative;
    width: ${PIC_SIZE}px;
    height: ${PIC_SIZE}px;
  }

  /* Drum viewport — fixed size matching the avatar when closed, expands downward when open */
  .pp-drum {
    position: absolute;
    top: -${ROW_GAP / 2}px;
    left: 0;
    width: ${PIC_SIZE}px;
    height: ${PIC_SIZE + ROW_GAP}px;
    border-radius: 17px;
    cursor: pointer;
    transition: height 0.38s cubic-bezier(0.22, 1, 0.36, 1);
    overflow: hidden;
    z-index: 1;
  }
  .pp-drum.pp-open {
    height: ${ROW_HEIGHT * VISIBLE_ROWS}px;
    cursor: default;
    z-index: 9999;
  }

  /* The closed-state avatar — fades out as the drum opens */
  .pp-closed-pic {
    position: absolute;
    left: 0;
    top: ${ROW_GAP / 2}px;
    width: ${PIC_SIZE}px;
    height: ${PIC_SIZE}px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: opacity 0.18s ease, transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
    z-index: 2;
  }
  .pp-drum.pp-open .pp-closed-pic {
    opacity: 0;
    transform: scale(0.6);
    pointer-events: none;
  }
  .pp-drum:not(.pp-open) .pp-closed-pic:active {
    transform: scale(0.9);
  }

  /* Selection ring pulse on closed avatar to hint interactivity */
  .pp-closed-pic-ring {
    position: absolute;
    inset: -3px;
    border-radius: 50%;
    border: 2px solid var(--c1);
    opacity: 0;
    transform: scale(0.8);
    transition: opacity 0.2s ease, transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
    pointer-events: none;
  }
  .pp-anchor:hover .pp-closed-pic-ring {
    opacity: 0.55;
    transform: scale(1);
  }

  .pp-wheel {
    position: absolute;
    inset: 0;
    overflow-y: auto;
    scroll-snap-type: y mandatory;
    scroll-padding-top: ${ROW_GAP / 2}px;
    scroll-behavior: smooth;
    scrollbar-width: none;
    -ms-overflow-style: none;
    opacity: 0;
    transition: opacity 0.2s ease 0.08s;
    -webkit-overflow-scrolling: touch;
  }
  .pp-drum.pp-open .pp-wheel {
    opacity: 1;
  }
  .pp-wheel::-webkit-scrollbar { display: none; }

  .pp-wheel-inner {
    padding: ${ROW_GAP / 2}px 0;
  }

  .pp-row {
    height: ${PIC_SIZE}px;
    margin-bottom: ${ROW_GAP}px;
    display: flex;
    align-items: center;
    justify-content: center;
    scroll-snap-align: start;
    cursor: pointer;
    box-sizing: content-box;
    position: relative;
    z-index: 1;
    animation: pp-row-in 0.26s cubic-bezier(0.22, 1, 0.36, 1) both;
  }
  .pp-row:last-child { margin-bottom: 0; }

  .pp-row-pic {
    transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1),
                opacity 0.2s ease,
                filter 0.2s ease;
    opacity: var(--pp-row-opacity, 0.45);
    transform: scale(var(--pp-row-scale, 0.86));
    filter: saturate(var(--pp-row-sat, 0.6));
    border-radius: 50%;
  }
  .pp-row.pp-row-active .pp-row-pic {
    opacity: 1;
    transform: scale(1);
    filter: saturate(1);
  }

  /* Chevron hint below the avatar — signals the picker is expandable */
  .pp-arrow {
    position: absolute;
    top: ${PIC_SIZE + 6}px;
    left: 50%;
    transform: translateX(-50%) rotate(180deg);
    width: 20px;
    height: 20px;
    opacity: 0.6;
    transition: top 0.38s cubic-bezier(0.22, 1, 0.36, 1), transform 0.32s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.2s ease;
    z-index: 0;
    pointer-events: none;
  }
  .pp-anchor:hover .pp-arrow {
    opacity: 1;
    transform: translateX(-50%) rotate(180deg) translateY(3px);
  }
  .pp-arrow.pp-arrow-open {
    top: ${ROW_HEIGHT * VISIBLE_ROWS + 6}px;
    opacity: 0.6;
  }
`;

export default function ProfilesPicker({ setSelectedProfile }) {
  const userKeys = useSelector((state) => state.userKeys);
  const userMetadata = useSelector((state) => state.userMetadata);
  const connectedAccounts = getConnectedAccounts();
  const [chosenAccount, setChosenAccount] = useState(false);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const containerRef = useRef(null);
  const wheelRef = useRef(null);
  const scrollTimer = useRef(null);

  const activePubkey = chosenAccount ? chosenAccount.pubkey : userKeys?.pub;

  const allAccounts = [
    {
      pubkey: userKeys?.pub,
      picture: userMetadata?.picture,
      name: userMetadata?.display_name || userMetadata?.name,
      userKeys: false,
      isMain: true,
    },
    ...connectedAccounts.filter((acc) => acc.pubkey !== userKeys?.pub),
  ];

  useEffect(() => {
    const idx = Math.max(0, allAccounts.findIndex((acc) => acc.pubkey === activePubkey));
    setActiveIndex(idx);
  }, [activePubkey, connectedAccounts.length]);

  useEffect(() => {
    const handleOffClick = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOffClick);
    return () => document.removeEventListener("mousedown", handleOffClick);
  }, []);

  useEffect(() => {
    if (!open) return;
    const el = wheelRef.current;
    if (!el) return;
    el.scrollTop = activeIndex * ROW_HEIGHT;
  }, [open]);

  const confirmSelection = (index) => {
    const account = allAccounts[index];
    if (!account) return;
    setChosenAccount(account.isMain ? false : account);
    if (!account.isMain && account?.userKeys) setSelectedProfile(account.userKeys);
    if (account.isMain) setSelectedProfile(false);
    setOpen(false);
  };

  const handleWheelScroll = () => {
    clearTimeout(scrollTimer.current);
    scrollTimer.current = setTimeout(() => {
      const el = wheelRef.current;
      if (!el) return;
      const idx = Math.max(
        0,
        Math.min(Math.round(el.scrollTop / ROW_HEIGHT), allAccounts.length - 1)
      );
      setActiveIndex(idx);
      confirmSelection(idx);
    }, SETTLE_DELAY);
  };

  const handleRowClick = (index) => {
    const el = wheelRef.current;
    setActiveIndex(index);
    if (el) el.scrollTo({ top: index * ROW_HEIGHT, behavior: "smooth" });
    clearTimeout(scrollTimer.current);
    setTimeout(() => confirmSelection(index), 240);
  };

  const togglePanel = () => {
    if (allAccounts.length < 2) return;
    setOpen((o) => !o);
  };

  return (
    <div className="pp-anchor" ref={containerRef}>
      <style>{WHEEL_STYLES}</style>

      {allAccounts.length > 1 && (
        <div className={`pp-arrow ${open ? "pp-arrow-open" : ""}`}>
          <Icon name="arrow" size={20} />
        </div>
      )}

      <div className={`pp-drum ${open ? "pp-open" : ""}`}>
        <div className="pp-closed-pic" onClick={togglePanel}>
          <div className="pp-closed-pic-ring" />
          <UserProfilePic
            size={PIC_SIZE}
            mainAccountUser={!chosenAccount}
            allowClick={false}
            allowPropagation={true}
            img={chosenAccount ? chosenAccount.picture : ""}
          />
        </div>

        {allAccounts.length > 1 && (
          <div className="pp-wheel" ref={wheelRef} onScroll={handleWheelScroll}>
            <div className="pp-wheel-inner">
              {allAccounts.map((account, index) => {
                const distance = Math.abs(index - activeIndex);
                const scale = Math.max(0.9, 1 - distance * 0.08);
                const opacity = Math.max(0.45, 1 - distance * 0.3);
                const saturation = Math.max(0.55, 1 - distance * 0.25);
                return (
                  <div
                    key={account.pubkey || index}
                    className={`pp-row ${index === activeIndex ? "pp-row-active" : ""}`}
                    style={{
                      "--pp-row-scale": scale,
                      "--pp-row-opacity": opacity,
                      "--pp-row-sat": saturation,
                      animationDelay: `${index * 0.025}s`,
                    }}
                    onClick={() => handleRowClick(index)}
                  >
                    <div className="pp-row-pic">
                      <UserProfilePic
                        size={PIC_SIZE}
                        mainAccountUser={false}
                        allowClick={false}
                        allowPropagation={true}
                        img={account.picture}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
