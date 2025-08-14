'use client';
import React, { useEffect, useRef, useState } from "react";
import AddZapPoll from "@/Components/AddZapPoll";
import BrowseZapPolls from "@/Components/BrowseZapPolls";
import BrowseMaciPolls from "@/Components/BrowseMaciPolls";
import { useTranslation } from "react-i18next";
import AddMaciPolls from "@/Components/AddMaciPolls";

export default function AddPolls({ setPollAddr, triggerCP = false }) {
  const { t } = useTranslation();
  const [options, setOptions] = useState(false);
  const [showCreatePoll, setShowCreatePoll] = useState(triggerCP);
  const [showNavigatePolls, setShowNavigatePolls] = useState(false);
  const optionsRef = useRef(null);

  useEffect(() => {
    const handleOffClick = (e) => {
      e.stopPropagation();
      if (optionsRef.current && !optionsRef.current.contains(e.target))
        setOptions(false);
    };
    document.addEventListener("mousedown", handleOffClick);
    return () => {
      document.removeEventListener("mousedown", handleOffClick);
    };
  }, [optionsRef]);

  return (
    <>
      {showCreatePoll && window.keplr && (
        <CreatePoll
          exit={() => setShowCreatePoll(false)}
          switchCategory={() => {
            setShowCreatePoll(false);
            setShowNavigatePolls(true);
          }}
          setPollAddr={setPollAddr}
        />
      )}
      {showCreatePoll && !window.keplr && (
        <CreatePollNK
          exit={() => setShowCreatePoll(false)}
          setPollAddr={setPollAddr}
        />
      )}
      {showNavigatePolls && (
        <NavigatePolls
          exit={() => setShowNavigatePolls(false)}
          switchCategory={() => {
            setShowCreatePoll(true);
            setShowNavigatePolls(false);
          }}
          setPollAddr={setPollAddr}
        />
      )}
      <div style={{ position: "relative" }} ref={optionsRef}>
        {options && (
          <div
            style={{
              position: "absolute",
              bottom: "calc(100% + 10px)",
              left: "0",
              backgroundColor: "var(--dim-gray)",
              border: "none",
              minWidth: "150px",
              width: "max-content",
              zIndex: 1000,
              rowGap: "10px",
            }}
            className="box-pad-h-m box-pad-v-s sc-s-18 fx-centered fx-col fx-start-v pointer drop-down"
          >
            <p
              onClick={() => setShowCreatePoll(true)}
              className="fit-container"
            >
              {t("A91LHJy")}
            </p>
            <p
              onClick={() => setShowNavigatePolls(true)}
              className="fit-container"
            >
              {t("ADNeql1")}
            </p>
          </div>
        )}
        <div
          className="polls"
          onClick={(e) => {
            e.stopPropagation();
            setShowCreatePoll(true);
          }}
        ></div>
      </div>
    </>
  );
}

const CreatePollNK = ({ exit, setPollAddr }) => {
  const { t } = useTranslation();
  const [selectedPollType, setSelectedPollType] = useState(false);
  return (
    <div className="fixed-container box-pad-h fx-centered">
      <div
        style={{ width: "min(100%, 500px)", position: "relative" }}
        className=""
      >
        {!selectedPollType && (
          <div className="close" onClick={exit}>
            <div></div>
          </div>
        )}
        {!selectedPollType && (
          <div
            style={{ width: "min(100%, 500px)" }}
            className="box-pad-h-m box-pad-v-m sc-s-18 bg-sp fx-centered fx-col slide-up"
          >
            <div className="fx-centered fit-container box-marg-s">
              <h4>{t("AhAwwFJ")}</h4>
            </div>
            <div className="fx-centered fit-container fx-stretch">
              <div
                className="fx option fx-centered fx-col  box-pad-v pointer"
                style={{
                  borderRadius: "var(--border-r-18)",
                  border: "1px solid var(--pale-gray)",
                }}
                onClick={() => setSelectedPollType(1)}
              >
                <div className="plus-sign-24"></div>
                <p>{t("A91LHJy")}</p>
              </div>
              <div
                className="fx option fx-centered fx-col  box-pad-v pointer"
                style={{
                  borderRadius: "var(--border-r-18)",
                  border: "1px solid var(--pale-gray)",
                }}
                onClick={() => setSelectedPollType(2)}
              >
                <div className="polls-24"></div>
                <p>{t("ADNeql1")}</p>
              </div>
            </div>
          </div>
        )}
        {selectedPollType === 1 && (
          <AddZapPoll
            exit={() => setSelectedPollType(false)}
            setNevent={(data) => {
              setPollAddr(data);
              exit();
            }}
          />
        )}
        {selectedPollType === 2 && (
          <BrowseZapPolls
            exit={() => setSelectedPollType(false)}
            setNevent={(data) => {
              setPollAddr(data);
              exit();
            }}
          />
        )}
      </div>
    </div>
  );
};

const CreatePoll = ({ exit, setPollAddr, switchCategory }) => {
  const [selectedPollType, setSelectedPollType] = useState(false);
  return (
    <div className="fixed-container box-pad-h fx-centered">
      <div
        style={{ width: "min(100%, 500px)", position: "relative" }}
        className=""
      >
        {!selectedPollType && (
          <div className="close" onClick={exit}>
            <div></div>
          </div>
        )}
        {!selectedPollType && (
          <PollTypes
            setSelectedPollType={setSelectedPollType}
            category={1}
            switchCategory={switchCategory}
          />
        )}
        {selectedPollType === 1 && (
          <AddZapPoll
            exit={() => setSelectedPollType(false)}
            setNevent={(data) => {
              setPollAddr(data);
              exit();
            }}
          />
        )}
        {selectedPollType === 2 && (
          <AddMaciPolls
            exit={() => setSelectedPollType(false)}
            setPollAddr={(data) => {
              setPollAddr(
                `https://vota${
                  process.env.NEXT_PUBLIC_NETWORK === "testnet" ? "-test" : ""
                }.dorafactory.org/round/${data}`
              );
              exit();
            }}
          />
        )}
      </div>
    </div>
  );
};
const NavigatePolls = ({ exit, setPollAddr, switchCategory }) => {
  const [selectedPollType, setSelectedPollType] = useState(false);
  return (
    <div className="fixed-container box-pad-h fx-centered">
      <div
        style={{ width: "min(100%, 500px)", position: "relative" }}
        className=""
      >
        {!selectedPollType && (
          <div className="close" onClick={exit}>
            <div></div>
          </div>
        )}
        {!selectedPollType && (
          <PollTypes
            setSelectedPollType={setSelectedPollType}
            category={2}
            switchCategory={switchCategory}
          />
        )}
        {selectedPollType === 1 && (
          <BrowseZapPolls
            exit={() => setSelectedPollType(false)}
            setNevent={(data) => {
              setPollAddr(data);
              exit();
            }}
          />
        )}
        {selectedPollType === 2 && (
          <BrowseMaciPolls
            exit={() => setSelectedPollType(false)}
            setPollAddr={(data) => {
              setPollAddr(data);
              exit();
            }}
          />
        )}
      </div>
    </div>
  );
};

const PollTypes = ({ setSelectedPollType, category = 1, switchCategory }) => {
  const { t } = useTranslation();
  return (
    <div
      style={{ width: "min(100%, 500px)" }}
      className="box-pad-h-m box-pad-v-m sc-s-18 bg-sp fx-centered fx-col slide-up"
    >
      <div className="fx-centered fit-container box-marg-s">
        <h4>{category === 1 ? t("A91LHJy") : t("ADNeql1")}</h4>
      </div>
      <div className="fx-centered fit-container fx-stretch">
        <div
          className="fx option fx-centered fx-col  box-pad-v pointer"
          style={{
            borderRadius: "var(--border-r-18)",
            border: "1px solid var(--pale-gray)",
          }}
          onClick={() => setSelectedPollType(1)}
        >
          <div className="bolt-24"></div>
          <p>{t("AhAwwFJ")}</p>
        </div>
        <div
          className="fx option fx-centered fx-col  box-pad-v pointer"
          style={{
            borderRadius: "var(--border-r-18)",
            border: "1px solid var(--pale-gray)",
          }}
          onClick={() => setSelectedPollType(2)}
        >
          <div className="bolt-24"></div>
          <p>{t("AfVdphT")}</p>
          <div className="sticker sticker-small sticker-gray-black">
            {t("A7YVOVL")}
          </div>
        </div>
      </div>
      <button
        className="btn btn-gray btn-full fx-centered"
        onClick={() => switchCategory(category === 1 ? 2 : 1)}
      >
        {category === 2 && (
          <div className="arrow" style={{ rotate: "90deg" }}></div>
        )}
        {category === 1 ? t("ADNeql1") : t("A91LHJy")}
        {category === 1 && (
          <div className="arrow" style={{ rotate: "-90deg" }}></div>
        )}
      </button>
    </div>
  );
};
