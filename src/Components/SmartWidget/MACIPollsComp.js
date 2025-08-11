import React, { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  convertDate,
  downloadAsFile,
  getKeplrSigner,
  shortenKey,
} from "@/Helpers/Encryptions";
import { genKeypair, MaciClient } from "@dorafactory/maci-sdk";
import { useDispatch, useSelector } from "react-redux";
import { setToast } from "@/Store/Slides/Publishers";
import { makeReadableNumber, sleepTimer } from "@/Helpers/Helpers";
import LoadingDots from "@/Components/LoadingDots";
import Link from "next/link";
import LoginSignup from "@/Components/LoginSignup";
import { DORA_CONFIG } from "@/Content/MACI";

const getSelectedVoteOptionsFromCache = (pollId) => {
  let selectedVoteOptions = localStorage.getItem("selectedVoteOptions");
  if (selectedVoteOptions) {
    selectedVoteOptions = JSON.parse(selectedVoteOptions);
    if (selectedVoteOptions[pollId]) return selectedVoteOptions[pollId];
  }
  return {};
};

const setSelectedVoteOptionsToCache = (pollId, data) => {
  let selectedVoteOptions = localStorage.getItem("selectedVoteOptions");
  if (selectedVoteOptions) {
    selectedVoteOptions = JSON.parse(selectedVoteOptions);
    selectedVoteOptions[pollId] = data;
    localStorage.setItem(
      "selectedVoteOptions",
      JSON.stringify(selectedVoteOptions)
    );
  } else {
    localStorage.setItem(
      "selectedVoteOptions",
      JSON.stringify({ [pollId]: data })
    );
  }
};

export default function MACIPollsComp({ poll, header = true, url = "" }) {
  const userKeys = useSelector((state) => state.userKeys);
  const [isLogin, setIsLogin] = useState(false);
  const [selectedVoteType, setSelectedVoteType] = useState("v");
  const [showDetails, setShowDetails] = useState(false);
  const [showVotingProcess, setShowVotingProcess] = useState(false);
  const [roundBalance, setRoundBalance] = useState(0);
  const [selectedVoteOptions, setSelectedVoteOptions] = useState(
    getSelectedVoteOptionsFromCache(poll.id)
  );
  const { t } = useTranslation();

  useEffect(() => {
    const init = async () => {
      try {
        const client = new MaciClient({
          network: process.env.REACT_APP_NETWORK,
        });
        const roundBalance_ = await client.maci.queryRoundBalance({
          contractAddress: poll.id,
        });
        setRoundBalance(Number(roundBalance_) / 10 ** 18);
      } catch (err) {
        console.log(err);
      }
    };
    init();
  }, []);

  const status = {
    tallying: (
      <div
        className="sticker sticker-normal sticker-gray-black"
        style={{ minWidth: "max-content" }}
      >
        {t("Aw1EitS")}
      </div>
    ),
    created: (
      <div
        className="sticker sticker-normal sticker-c1 "
        style={{ minWidth: "max-content" }}
      >
        {t("ANBowSq")}
      </div>
    ),
    ended: (
      <div
        className="sticker sticker-normal sticker-red"
        style={{ minWidth: "max-content" }}
      >
        {t("Azctwg8")}
      </div>
    ),
    closed: (
      <div
        className="sticker sticker-normal sticker-red"
        style={{ minWidth: "max-content" }}
      >
        {t("AVhtVJY")}
      </div>
    ),
    ongoing: (
      <div
        className="sticker sticker-normal sticker-green"
        style={{ minWidth: "max-content" }}
      >
        {t("A7noclE")}
      </div>
    ),
  };

  const handleShowVotingProcess = () => {
    if (!userKeys) {
      setIsLogin(true);
      return;
    }
    if (window.keplr) setShowVotingProcess(true);
    if (!window.keplr)
      window.open(`https://vota-vote.dorafactory.org/${poll.id}`, "_blank");
  };

  return (
    <>
      {isLogin && <LoginSignup exit={() => setIsLogin(false)} />}
      {showDetails && (
        <PollDetails
          poll={{ ...poll, roundBalance }}
          exit={(e) => {
            e.stopPropagation();
            setShowDetails(false);
          }}
        />
      )}
      {showVotingProcess && header && (
        <InitMaciVote
          poll={{ ...poll, roundBalance }}
          exit={(e) => {
            e.stopPropagation();
            setShowVotingProcess(false);
          }}
          onVoteSuccess={(data) => {
            setSelectedVoteOptions(data);
            setShowVotingProcess(false);
          }}
        />
      )}
      <div
        className="fit-container fx-centered fx-col"
        onClick={(e) => e.stopPropagation()}
      >
        {header && (
          <div className="fit-container fx-scattered fx-start-v">
            <div className="fx-centered fx-col fx-start-v">
              {status[poll.status.toLowerCase()]}
              <h4>{poll.roundTitle}</h4>
            </div>
            <p
              className="btn-text-gray pointer"
              onClick={() => setShowDetails(true)}
            >
              {t("A4aojw2")}
            </p>
          </div>
        )}
        <div className="fit-container fx-scattered fx-start-v box-pad-v-s">
          <div>
            <h5 className="gray-c">{t("A4MMvEj")}</h5>
            <div className="fx-centered">
              <p>
                {t("AalC1o6", {
                  date: convertDate(new Date(poll.votingStart), true),
                })}
              </p>
              <p>&#8674;</p>
              {poll.votingEnd > new Date().getTime() && (
                <p className="gray-c">
                  {t("ASGLzji", {
                    date: convertDate(new Date(poll.votingEnd), true),
                  })}
                </p>
              )}
              {poll.votingEnd < new Date().getTime() && (
                <p className="red-c p-italic">
                  {t("AfPxJDW", {
                    date: convertDate(new Date(poll.votingEnd), true),
                  })}
                </p>
              )}
            </div>
          </div>
          {!header && (
            <p
              className="btn-text-gray pointer"
              onClick={() => setShowDetails(true)}
            >
              {t("A4aojw2")}
            </p>
          )}
        </div>
        {poll.resultsList.length > 0 && (
          <div
            className="fit-container fx-scattered"
            style={{ position: "relative", zIndex: 10 }}
          >
            <div>
              <h5 className="gray-c">{t("AbB8Gf6")}</h5>
              {selectedVoteType === "v" && (
                <p className="slide-up">{t("AWXfzUx")}</p>
              )}
              {selectedVoteType === "v2" && (
                <p className="slide-up">{t("A0BxU3E")}</p>
              )}
            </div>
            <div
              className="round-icon-small round-icon-tooltip"
              onClick={() =>
                setSelectedVoteType(selectedVoteType === "v" ? "v2" : "v")
              }
              data-tooltip={
                selectedVoteType === "v" ? t("AQa0Y6U") : t("Ao8BzSD")
              }
            >
              <div
                className="switch-arrows"
                style={{
                  rotate: selectedVoteType === "v2" ? "360deg" : "0deg",
                }}
              ></div>
            </div>
          </div>
        )}
        <div className="fx-col fx-centered fit-container">
          {poll.voteOptionMap.map((option, index) => {
            let isSelected = selectedVoteOptions[index] ? true : false;
            return (
              <div
                key={index}
                style={{
                  position: "relative",
                  borderColor: isSelected ? "var(--orange-main)" : "",
                }}
                className={`box-pad-h-m box-pad-v-s sc-s-18 fit-container ${
                  poll.status === "Ongoing" ? "option pointer" : ""
                }`}
                onClick={handleShowVotingProcess}
              >
                {poll.resultsList.length > 0 && (
                  <div
                    className="sc-s-18"
                    style={{
                      position: "absolute",
                      left: 0,
                      top: 0,
                      height: "100%",
                      width: `${poll.resultsList[index][selectedVoteType]}%`,
                      border: "none",
                      backgroundColor: "var(--orange-main)",
                      transition: ".2s ease-in-out",
                      zIndex: 0,
                    }}
                  ></div>
                )}
                <div
                  className="fit-container fx-scattered"
                  style={{
                    position: "relative",
                    zIndex: 2,
                  }}
                >
                  <p>{option || "[OPTION]"}</p>
                  {poll.resultsList.length > 0 && (
                    <>
                      {selectedVoteType === "v" && (
                        <p className="p-medium slide-up">
                          {poll.resultsList[index][selectedVoteType]}%
                        </p>
                      )}
                      {selectedVoteType === "v2" && (
                        <p className="p-medium slide-up">
                          {poll.resultsList[index][selectedVoteType]}%
                        </p>
                      )}
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}

const InitMaciVote = ({ poll, exit, onVoteSuccess }) => {
  const { t } = useTranslation();
  const [isSignedUp, setIsSignedUp] = useState(false);
  if (!window.keplr)
    return (
      <div className="fixed-container fx-centered box-pad-h">
        <div
          className="sc-s-18 bg-sp box-pad-h box-pad-v fx-centered"
          style={{
            width: "min(100%, 400px)",
            height: "auto",
            position: "relative",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="close" onClick={exit}>
            <div></div>
          </div>
          <div className="fit-container fx-centered fx-col">
            <div className="keplr-icon"></div>
            <div className="box-pad-v-s box-pad-h fx-centered fx-col">
              <h4>{t("AatMYp6")}</h4>
              <p className="gray-c p-centered">{t("AMmaqvM")}</p>
            </div>
            <Link href={"https://www.keplr.app/get"} target="_blank">
              <button className="btn btn-gst">{t("AI5mkOW")}</button>
            </Link>
          </div>
        </div>
      </div>
    );
  if (poll.status?.toLowerCase() !== "ongoing") {
    return (
      <div className="fixed-container fx-centered box-pad-h">
        <div
          className="sc-s-18 bg-sp box-pad-h box-pad-v fx-centered"
          style={{
            width: "min(100%, 400px)",
            height: "auto",
            position: "relative",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="close" onClick={exit}>
            <div></div>
          </div>
          <div className="fit-container fx-centered fx-col">
            <div
              className="info-tt-24"
              style={{ minWidth: "48px", minHeight: "48px" }}
            ></div>
            <h4>{t("AwxiSdI")}</h4>
            <p className="gray-c p-centered box-pad-h">{t("AvjemUS")}</p>
          </div>
        </div>
      </div>
    );
  }
  // if (poll.roundBalance < 6 && !isSignedUp) {
  //   return (
  //     <div className="fixed-container fx-centered box-pad-h">
  //       <div
  //         className="sc-s-18 bg-sp box-pad-h box-pad-v fx-centered"
  //         style={{
  //           width: "min(100%, 400px)",
  //           height: "auto",
  //           position: "relative",
  //         }}
  //         onClick={(e) => e.stopPropagation()}
  //       >
  //         <div className="close" onClick={exit}>
  //           <div></div>
  //         </div>
  //         <div className="fit-container fx-centered fx-col">
  //           <div
  //             className="info-tt-24"
  //             style={{ minWidth: "48px", minHeight: "48px" }}
  //           ></div>
  //           <h4>{t("AbhKhNW")}</h4>
  //           <p className="gray-c p-centered box-pad-h">{t("ALfmcyA")}</p>
  //           <button className="btn btn-gst" onClick={() => setIsSignedUp(true)}>
  //             {t("ASxO9bD")}
  //           </button>
  //         </div>
  //       </div>
  //     </div>
  //   );
  // }

  return <MACIPollVote poll={poll} exit={exit} onVoteSuccess={onVoteSuccess} />;
};

const PollDetails = ({ poll, exit }) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const [showGasStation, setShowGasStation] = useState(false);

  const status = {
    tallying: (
      <div
        className="sticker sticker-normal sticker-gray-black"
        style={{ minWidth: "max-content" }}
      >
        {t("Aw1EitS")}
      </div>
    ),
    created: (
      <div
        className="sticker sticker-normal sticker-c1 "
        style={{ minWidth: "max-content" }}
      >
        {t("ANBowSq")}
      </div>
    ),
    ended: (
      <div
        className="sticker sticker-normal sticker-red"
        style={{ minWidth: "max-content" }}
      >
        {t("Azctwg8")}
      </div>
    ),
    closed: (
      <div
        className="sticker sticker-normal sticker-red"
        style={{ minWidth: "max-content" }}
      >
        {t("AVhtVJY")}
      </div>
    ),
    ongoing: (
      <div
        className="sticker sticker-normal sticker-green"
        style={{ minWidth: "max-content" }}
      >
        {t("A7noclE")}
      </div>
    ),
  };

  const downloadProofs = async () => {
    try {
      const client = new MaciClient({
        network: process.env.REACT_APP_NETWORK,
      });
      let proof = await client.getProofByContractAddress(poll.id);
      if (proof.code === 200)
        downloadAsFile(
          proof.data.proofData.nodes,
          undefined,
          `proofs-${poll.id}.json`
        );
      else
        dispatch(
          setToast({
            type: 2,
            desc: t("Ap6NMQn"),
          })
        );
    } catch (err) {
      console.log(err);
      dispatch(
        setToast({
          type: 2,
          desc: t("Ap6NMQn"),
        })
      );
    }
  };

  return (
    <>
      {showGasStation && (
        <PollGasStation poll={poll} exit={() => setShowGasStation(false)} />
      )}
      <div
        className="fixed-container fx-centered box-pad-h"
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="fx-centered fx-col fx-start-v fx-start-h sc-s-18 bg-sp"
          style={{
            overflow: "scroll",
            scrollBehavior: "smooth",
            height: "100%",
            width: "min(100%, 600px)",
            position: "relative",
            borderRadius: 0,
            gap: 0,
          }}
        >
          <div
            className="fit-container fx-centered sticky"
            style={{ borderBottom: "1px solid var(--very-dim-gray)" }}
          >
            <div className="fx-scattered fit-container box-pad-h-m">
              <h4>{poll.roundTitle}</h4>
              <div className="fx-centered">
                {/* {window.keplr &&
                  ["created", "ongoing"].includes(
                    poll.status.toLowerCase()
                  ) && (
                    <div>
                      <button
                        className="fx-centered btn btn-normal btn-small"
                        onClick={() => setShowGasStation(true)}
                      >
                        <div className="plus-sign"></div> {t("A6rbQWS")}
                      </button>
                    </div>
                  )} */}
                <div
                  className="close"
                  style={{ position: "static" }}
                  onClick={exit}
                >
                  <div></div>
                </div>
              </div>
            </div>
          </div>
          <hr />
          <div
            className="fx-centered fx-start-h fx-start-v fit-container box-pad-v-m box-pad-h-m"
            style={{ columnGap: "32px", rowGap: "24px" }}
          >
            <p className="gray-c" style={{ minWidth: "10rem" }}>
              {t("AIGU9F2")}
            </p>
            <p>{poll.roundTitle || "N/A"}</p>
          </div>
          <hr />
          <div
            className="fx-centered fx-start-h fx-start-v fit-container box-pad-v-m box-pad-h-m"
            style={{ columnGap: "32px", rowGap: "24px" }}
          >
            <p className="gray-c" style={{ minWidth: "10rem" }}>
              {t("AM6TPts")}
            </p>
            <p>{poll.roundDescription || "N/A"}</p>
          </div>
          <hr />
          <div
            className="fx-centered fx-start-h fx-start-v fit-container box-pad-v-m box-pad-h-m"
            style={{ columnGap: "32px", rowGap: "24px" }}
          >
            <p className="gray-c" style={{ minWidth: "10rem" }}>
              {t("AmikACu")}
            </p>
            {status[poll.status.toLowerCase()]}
          </div>
          <hr />
          <div
            className="fx-centered fx-start-h fx-start-v fit-container box-pad-v-m box-pad-h-m"
            style={{ columnGap: "32px", rowGap: "24px" }}
          >
            <p className="gray-c" style={{ minWidth: "10rem" }}>
              {t("Ab3i56m")}
            </p>
            {poll.roundLink ? (
              <div className="fx-centered">
                <a
                  className="c1-c pointer"
                  href={poll.roundLink}
                  target="_blank"
                >
                  {poll.roundLink}
                </a>
                <div className="link"></div>
              </div>
            ) : (
              <p>N/A</p>
            )}
          </div>
          <hr />
          <div
            className="fx-centered fx-start-h fx-start-v fit-container box-pad-v-m box-pad-h-m"
            style={{ columnGap: "32px", rowGap: "24px" }}
          >
            <p className="gray-c" style={{ minWidth: "10rem" }}>
              {t("ApdDVfN")}
            </p>
            <p className="c1-c">{poll.circuitName}</p>
          </div>
          <hr />
          <div
            className="fx-centered fx-start-h fx-start-v fit-container box-pad-v-m box-pad-h-m"
            style={{ columnGap: "32px", rowGap: "24px" }}
          >
            <p className="gray-c" style={{ minWidth: "10rem" }}>
              {t("Al483US")}
            </p>
            <p>{t("Ano2XKx")}</p>
          </div>
          <hr />
          <div
            className="fx-centered fx-start-h fx-start-v fit-container box-pad-v-m box-pad-h-m"
            style={{ columnGap: "32px", rowGap: "24px" }}
          >
            <p className="gray-c" style={{ minWidth: "10rem" }}>
              {t("A5xdPz9")}
            </p>
            <p>{poll.certificationSystem}</p>
          </div>
          <hr />
          <div
            className="fx-centered fx-start-h fx-start-v fit-container box-pad-v-m box-pad-h-m"
            style={{ columnGap: "32px", rowGap: "24px" }}
          >
            <p className="gray-c" style={{ minWidth: "10rem" }}>
              Zkey
            </p>
            <div className="fx-centered">
              <a
                className="c1-c pointer"
                href={`https://github.com/DoraFactory/Vota-Circuits/tree/main/zkeys/maci/${
                  poll.certificationSystem
                }/${poll.circuitName.replace("MACI-", "")}/power-${
                  poll.circuitPower
                }`}
                target="_blank"
              >{`maci/${poll.certificationSystem}/${poll.circuitName.replace(
                "MACI-",
                ""
              )}/power-${poll.circuitPower}`}</a>
              <div className="link"></div>
            </div>
          </div>
          <hr />
          <div
            className="fx-centered fx-start-h fx-start-v fit-container box-pad-v-m box-pad-h-m"
            style={{ columnGap: "32px", rowGap: "24px" }}
          >
            <div>
              <p className="gray-c" style={{ minWidth: "10rem" }}>
                {t("A6rbQWS")}
              </p>
              <p className="gray-c" style={{ minWidth: "10rem" }}>
                {t("AIaDGn1")}
              </p>
            </div>
            <p>
              <span className="p-bold">{poll.totalBond} DORA </span>
            </p>
          </div>
          <hr />
          <div
            className="fx-centered fx-start-h fx-start-v fit-container box-pad-v-m box-pad-h-m"
            style={{ columnGap: "32px", rowGap: "24px" }}
          >
            <div>
              <p className="gray-c" style={{ minWidth: "10rem" }}>
                {t("A6rbQWS")}
              </p>
              <p className="gray-c" style={{ minWidth: "10rem" }}>
                {t("AT1E8mx")}
              </p>
            </div>
            <p>
              <span className="green-c p-bold">{poll.roundBalance} DORA</span>
            </p>
          </div>
          <hr />
          <div
            className="fx-centered fx-start-h fx-start-v fit-container box-pad-v-m box-pad-h-m"
            style={{ columnGap: "32px", rowGap: "24px" }}
          >
            <p className="gray-c" style={{ minWidth: "10rem" }}>
              {t("AdYv39Y")}
            </p>
            <p>{convertDate(new Date(poll.votingStart), true)}</p>
          </div>
          <hr />
          <div
            className="fx-centered fx-start-h fx-start-v fit-container box-pad-v-m box-pad-h-m"
            style={{ columnGap: "32px", rowGap: "24px" }}
          >
            <p className="gray-c" style={{ minWidth: "10rem" }}>
              {t("Axqwx5J")}
            </p>
            <p>{convertDate(new Date(poll.votingEnd), true)}</p>
          </div>
          <hr />
          <div
            className="fx-centered fx-start-h fx-start-v fit-container box-pad-v-m box-pad-h-m"
            style={{ columnGap: "32px", rowGap: "24px" }}
          >
            <p className="gray-c" style={{ minWidth: "10rem" }}>
              {t("AmirXom")}
            </p>
            <div className="fx-centered">
              <a
                className="c1-c pointer"
                href={`https://vota-explorer.dorafactory.org/doravota/account/${poll.caller}`}
                target="_blank"
              >
                {poll.caller}
              </a>
              <div className="link"></div>
            </div>
          </div>
          <hr />
          <div
            className="fx-centered fx-start-h fx-start-v fit-container box-pad-v-m box-pad-h-m"
            style={{ columnGap: "32px", rowGap: "24px" }}
          >
            <p className="gray-c" style={{ minWidth: "10rem" }}>
              {t("AA7Srdf")}
            </p>
            <div className="fx-centered">
              <a
                className="c1-c pointer"
                href={`https://vota-explorer.dorafactory.org/doravota/account/${poll.admin}`}
                target="_blank"
              >
                {poll.admin}
              </a>
              <div className="link"></div>
            </div>
          </div>
          <hr />
          <div
            className="fx-centered fx-start-h fx-start-v fit-container box-pad-v-m box-pad-h-m"
            style={{ columnGap: "32px", rowGap: "24px" }}
          >
            <p className="gray-c" style={{ minWidth: "10rem" }}>
              {t("ABbZ7cz")}
            </p>
            <div className="fx-centered">
              <a
                className="c1-c pointer"
                href={`https://vota-explorer.dorafactory.org/doravota/account/${poll.contractAddress}`}
                target="_blank"
              >
                {poll.contractAddress}
              </a>
              <div className="link"></div>
            </div>
          </div>
          <hr />
          <div
            className="fx-centered fx-start-h fx-start-v fit-container box-pad-v-m box-pad-h-m"
            style={{ columnGap: "32px", rowGap: "24px" }}
          >
            <p className="gray-c" style={{ minWidth: "10rem" }}>
              {t("AJALXr6")}
            </p>
            <p>
              {t("AguX9lA", {
                count: makeReadableNumber(poll.blockHeight),
              })}
            </p>
          </div>
          <hr />
          <div
            className="fx-centered fx-start-h fx-start-v fit-container box-pad-v-m box-pad-h-m"
            style={{ columnGap: "32px", rowGap: "24px" }}
          >
            <p className="gray-c" style={{ minWidth: "10rem" }}>
              {t("AmjJB8d")}
            </p>
            <div className="fx-centered pointer" onClick={downloadProofs}>
              <p className="c1-c">{t("AF88iK1")}</p>
              <div className="download-file"></div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

const PollGasStation = ({ poll, exit }) => {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const [signer, setSigner] = useState(false);
  const [gasFee, setGasFee] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const connectWallet = async () => {
    try {
      setIsLoading(true);
      let { signer, address } = (await getKeplrSigner()) || {};
      if (signer) setSigner({ signer, address });
      setIsLoading(false);
    } catch (err) {
      console.log(err);
      setIsLoading(false);
      dispatch(
        setToast({
          type: 3,
          desc: t("Acr4Slu"),
        })
      );
    }
  };
  const addGasFees = async () => {
    try {
      setIsLoading(true);
      let amount = parseInt(gasFee) || 0;
      if (amount < 1) {
        setIsLoading(false);
        dispatch(
          setToast({
            type: 3,
            desc: t("AUytlmo"),
          })
        );
        return;
      }

      const client = new MaciClient({
        network: process.env.REACT_APP_NETWORK,
      });

      const oracleMaciClient = await client.oracleMaciClient({
        signer: signer.signer,
        contractAddress: poll.id,
      });
      amount = amount * 10 ** 18;
      await oracleMaciClient.bond(undefined, undefined, [
        {
          denom: "peaka",
          amount: amount.toString(),
        },
      ]);
      setIsLoading(false);
      dispatch(
        setToast({
          type: 1,
          desc: t("AHpLjVd"),
        })
      );
      exit();
    } catch (err) {
      console.log(err);
      setIsLoading(false);
      dispatch(
        setToast({
          type: 3,
          desc: t("Acr4Slu"),
        })
      );
    }
  };

  return (
    <div
      className="fixed-container fx-centered box-pad-h"
      style={{ zIndex: 1000000 }}
    >
      <div className="fixed-container fx-centered box-pad-h">
        <div
          className="sc-s-18 bg-sp box-pad-h box-pad-v fx-centered"
          style={{
            width: "min(100%, 400px)",
            height: "auto",
            position: "relative",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="close" onClick={exit}>
            <div></div>
          </div>
          <div className="fit-container fx-centered fx-col">
            <h4>{t("A16ox4h")}</h4>
            <p className="gray-c p-centered box-pad-h">{t("AnvJ9Dl")}</p>
            {!signer && (
              <button className="btn btn-gst" onClick={connectWallet}>
                {isLoading ? <LoadingDots /> : t("AsYmYFX")}
              </button>
            )}
            {signer && (
              <div className="fit-container fx-centered box-pad-h-s box-pad-v-s sc-s-18">
                {shortenKey(signer.address, 15)}
              </div>
            )}
            {signer.address !== poll.admin && signer && (
              <>
                <p className="c1-c p-centered box-pad-h">{t("AXJWSge")}</p>
              </>
            )}
            {signer.address === poll.admin && (
              <>
                <input
                  type="number"
                  placeholder={t("AcDgXKI")}
                  value={gasFee}
                  onChange={(e) => setGasFee(e.target.value)}
                  className="if ifs-full"
                />
                <button
                  className="btn btn-normal btn-full"
                  onClick={addGasFees}
                >
                  {isLoading ? <LoadingDots /> : t("AKU6Qm4")}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// const MACIPollVote = ({ poll, exit, onVoteSuccess }) => {
//   const dispatch = useDispatch();
//   const [isLoading, setIsLoading] = useState(true);
//   const [isVotingLoading, setIsVotingLoading] = useState(false);
//   const [vcBalance, setVcBalance] = useState(0);
//   const [selectedOptions, setSelectedOptions] = useState([]);
//   const [ecosystem, setEcosystem] = useState("doravota");
//   const [userConfig, setUserConfig] = useState(false);
//   const [isGasStationForVote, setIsGasStationForVote] = useState(false);
//   const vcBalanceConsumed = useMemo(() => {
//     return selectedOptions.reduce(
//       (acc, curr) =>
//         acc + (poll.circuitName === "MACI-1p1v" ? curr.vc : curr.vc * curr.vc),
//       0
//     );
//   }, [vcBalance, selectedOptions]);
//   const { t } = useTranslation();

//   useEffect(() => {
//     const init = async () => {
//       try {
//         if (poll.roundBalance < 2) {
//           setIsLoading(false);
//           setIsGasStationForVote(true);
//           return;
//         }
//         const client = new MaciClient({
//           network: process.env.REACT_APP_NETWORK,
//         });
//         let { signer, address } = await getKeplrSigner();
//         let vcBalance_ = false;
//         const maciAccount = await getMaciAccount(client, signer, address);

//         let stateIdx = await client.maci.getStateIdxByPubKey({
//           contractAddress: poll.id,
//           pubKey: maciAccount.pubKey,
//         });

//         if (stateIdx === -1) {
//           if (poll.roundBalance < 6) {
//             setIsLoading(false);
//             return;
//           }
//           const oracleClient = await client.oracleMaciClient({
//             signer: signer,
//             contractAddress: poll.id,
//           });
//           const oracleConfig = await oracleClient.queryOracleWhitelistConfig();
//           if (oracleConfig?.ecosystem) setEcosystem(oracleConfig.ecosystem);
//           const certificate = await client.maci.requestOracleCertificate({
//             signer,
//             ecosystem: oracleConfig?.ecosystem || "doravota",
//             address,
//             contractAddress: poll.id,
//           });
//           vcBalance_ = await oracleClient.whiteBalanceOf({
//             amount: certificate.amount,
//             certificate: certificate.signature,
//             sender: address,
//           });

//           if (vcBalance_ == 0) {
//             setIsLoading(false);
//             return;
//           }

//           let allowance = await client.maci.feegrantAllowance({
//             address,
//             contractAddress: poll.id,
//           });
//           allowance = allowance.spend_limit.length > 0 ? true : false;

//           while (!allowance) {
//             allowance = await client.maci.feegrantAllowance({
//               address,
//               contractAddress: poll.id,
//             });
//             allowance = allowance.spend_limit.length > 0 ? true : false;
//             await sleepTimer(1000);
//           }

//           const signupResponse = await client.maci.signup({
//             signer,
//             address,
//             maciAccount,
//             contractAddress: poll.id,
//             oracleCertificate: {
//               amount: certificate.amount,
//               signature: certificate.signature,
//             },
//             gasStation: true,
//           });
//           await sleepTimer(7000);
//           stateIdx = await client.maci.getStateIdxByPubKey({
//             contractAddress: poll.id,
//             pubKey: maciAccount.pubKey,
//           });
//         }
//         if (vcBalance_ === false)
//           vcBalance_ = await client.maci.getVoiceCreditBalance({
//             signer,
//             contractAddress: poll.id,
//             stateIdx,
//           });
//         let config = {
//           client,
//           signer,
//           address,
//           stateIdx,
//           maciAccount,
//         };
//         setUserConfig(config);
//         setVcBalance(parseInt(vcBalance_) > 0 ? 1 : 0);
//         setIsLoading(false);
//       } catch (err) {
//         console.log(err);
//         setIsLoading(false);
//       }
//     };
//     init();
//   }, []);

//   const getMaciAccount = async (client, signer, address) => {
//     try {
//       const stringToBigInt = (ma) => {
//         let tempMa = {
//           // eslint-disable-next-line no-undef
//           formatedPrivKey: BigInt(ma.formatedPrivKey),
//           // eslint-disable-next-line no-undef
//           privKey: BigInt(ma.privKey),
//           // eslint-disable-next-line no-undef
//           pubKey: [BigInt(ma.pubKey[0]), BigInt(ma.pubKey[1])],
//         };
//         return tempMa;
//       };

//       let maciAccount = localStorage.getItem(`maciAccount-${address}`);
//       maciAccount = maciAccount
//         ? stringToBigInt(JSON.parse(maciAccount))
//         : await client.circom.genKeypairFromSign(signer, address);
//       setMaciAccount(address, maciAccount);
//       return maciAccount;
//     } catch (err) {
//       console.log(err);
//     }
//   };
//   const setMaciAccount = (address, maciAccount) => {
//     try {
//       let tempMaciAccount = {
//         formatedPrivKey: maciAccount.formatedPrivKey.toString(),
//         privKey: maciAccount.privKey.toString(),
//         pubKey: [
//           maciAccount.pubKey[0].toString(),
//           maciAccount.pubKey[1].toString(),
//         ],
//       };
//       localStorage.setItem(
//         `maciAccount-${address}`,
//         JSON.stringify(tempMaciAccount)
//       );
//     } catch (err) {
//       console.log(err);
//     }
//   };

//   const handleSelectedOptions = (index, isSelected) => {
//     setSelectedOptions(isSelected ? [] : [{ idx: index, vc: 1 }]);
//   };

//   const handleVC = (index, vc) => {
//     let options = [...selectedOptions];
//     let optionIndex = options.findIndex((_) => _.idx == index);
//     options[optionIndex].vc = (vc && parseInt(vc)) || 0;
//     setSelectedOptions(options);
//   };

//   const pollVote = async () => {
//     if (
//       vcBalanceConsumed === 0 ||
//       vcBalanceConsumed > vcBalance ||
//       vcBalance === 0
//     )
//       return;
//     try {
//       setIsVotingLoading(true);
//       let rejectionCount = 0;
//       let { client, signer, address, stateIdx, maciAccount } = userConfig;
//       let gasStationEnable = await client.maci.queryRoundGasStation({
//         contractAddress: poll.id,
//       });

//       while (!gasStationEnable) {
//         if (rejectionCount > 5) {
//           setIsVotingLoading(false);
//           dispatch(
//             setToast({
//               type: 3,
//               desc: t("AWgG7l1"),
//             })
//           );
//           return;
//         }
//         await sleepTimer(1000);
//         gasStationEnable = await client.maci.queryRoundGasStation({
//           contractAddress: poll.id,
//         });
//         rejectionCount++;
//       }

//       const voteResponse = await client.maci.vote({
//         signer,
//         address,
//         stateIdx,
//         maciAccount,
//         contractAddress: poll.id,
//         selectedOptions: selectedOptions,
//         operatorCoordPubKey: [
//           // eslint-disable-next-line no-undef
//           BigInt(poll.coordinatorPubkeyX),
//           // eslint-disable-next-line no-undef
//           BigInt(poll.coordinatorPubkeyY),
//         ],
//         gasStation: true,
//       });
//       dispatch(
//         setToast({
//           type: 1,
//           desc: t("AxPscQU"),
//         })
//       );
//       let chosenOptionsToSave = Object.fromEntries(
//         selectedOptions
//           .map((_) => {
//             return {
//               [_.idx]: _.vc,
//             };
//           })
//           .flatMap(Object.entries)
//       );
//       setSelectedVoteOptionsToCache(poll.id, chosenOptionsToSave);
//       onVoteSuccess && onVoteSuccess(chosenOptionsToSave);
//       setIsVotingLoading(false);
//     } catch (err) {
//       console.log(err);
//       dispatch(
//         setToast({
//           type: 3,
//           desc: t("AybYQmE"),
//         })
//       );
//       setIsVotingLoading(false);
//     }
//   };

//   if (!isLoading && isGasStationForVote)
//     return (
//       <div className="fixed-container fx-centered box-pad-h">
//         <div
//           className="sc-s-18 bg-sp box-pad-h box-pad-v fx-centered"
//           style={{
//             width: "min(100%, 400px)",
//             height: "auto",
//             position: "relative",
//           }}
//           onClick={(e) => e.stopPropagation()}
//         >
//           <div className="close" onClick={exit}>
//             <div></div>
//           </div>
//           <div className="fit-container fx-centered fx-col">
//             <div
//               className="info-tt-24"
//               style={{ minWidth: "48px", minHeight: "48px" }}
//             ></div>
//             <h4>{t("A128KIp")}</h4>
//             <p className="gray-c p-centered box-pad-h">
//               {t("AoAc0KV", { amount: 2 })}
//             </p>
//           </div>
//         </div>
//       </div>
//     );
//   if (!isLoading && vcBalance === 0 && poll.roundBalance < 6)
//     return (
//       <div className="fixed-container fx-centered box-pad-h">
//         <div
//           className="sc-s-18 bg-sp box-pad-h box-pad-v fx-centered"
//           style={{
//             width: "min(100%, 400px)",
//             height: "auto",
//             position: "relative",
//           }}
//           onClick={(e) => e.stopPropagation()}
//         >
//           <div className="close" onClick={exit}>
//             <div></div>
//           </div>
//           <div className="fit-container fx-centered fx-col">
//             <div
//               className="info-tt-24"
//               style={{ minWidth: "48px", minHeight: "48px" }}
//             ></div>
//             <h4>{t("AbhKhNW")}</h4>
//             <p className="gray-c p-centered box-pad-h">{t("ALfmcyA")}</p>
//           </div>
//         </div>
//       </div>
//     );
//   return (
//     <div
//       className="fixed-container fx-centered box-pad-h"
//       onClick={(e) => {
//         e.stopPropagation();
//         exit(e);
//       }}
//     >
//       <div
//         className="sc-s-18 bg-sp box-pad-h box-pad-v fx-centered"
//         style={{
//           minWidth: "min(100%, 500px)",
//           height: isLoading ? "30vh" : "auto",
//           position: "relative",
//         }}
//         onClick={(e) => e.stopPropagation()}
//       >
//         <div className="close" onClick={exit}>
//           <div></div>
//         </div>
//         {isLoading && <LoadingDots />}
//         {!isLoading && (
//           <div
//             className="fit-container fx-centered fx-start-v fx-col"
//             style={{ gap: "16px" }}
//           >
//             <div className="fx-centered fx-col fx-start-v">
//               <p className="gray-c">{t("A0BxU3E")}</p>
//               <div className="fx-centered">
//                 {vcBalance === 0 && selectedOptions.length === 0 && (
//                   <h2 className="red-c">0</h2>
//                 )}
//                 {vcBalance !== 0 && (
//                   <h2>
//                     <span className="gray-c">{selectedOptions.length}</span>
//                     /1
//                   </h2>
//                 )}
//               </div>
//               {vcBalance === 0 && selectedOptions.length === 0 && (
//                 <div className="fx-centered">
//                   <p className="gray-c p-medium">{t("AGRmJTe")}</p>
//                   <a
//                     target="_blank"
//                     href={
//                       ecosystem === "doravota"
//                         ? "https://vota-explorer.dorafactory.org/doravota/staking/doravaloper1gerunjnh6umehq6zm0gphrc87u37veuv5y9dkw"
//                         : "https://wallet.keplr.app/chains/cosmos-hub?modal=validator&chain=cosmoshub-4&validator_address=cosmosvaloper17w8wc8y2jg2fjnkfxfw8z7a84qtuvyrgd89hm4"
//                     }
//                     className="c1-c p-medium fx-centered"
//                   >
//                     {t("AI81KFU")}
//                     <div
//                       className="share-icon"
//                       style={{ minWidth: "12px", minHeight: "12px" }}
//                     ></div>
//                   </a>
//                 </div>
//               )}
//             </div>
//             <div>
//               <p className="c1-c">{t("A9Mca7S")}</p>
//               <ul>
//                 <li>{t("AtgjyCM")}</li>
//                 <li>{t("A5d11WZ")}</li>
//                 <li>{t("AIIHmli")}</li>
//                 <li>{t("A3cQKRh")}</li>
//                 <li>
//                   <a
//                     href="https://research.dorahacks.io/2022/04/30/light-weight-maci-anonymization/"
//                     target="_blank"
//                     className="c1-c fx-centered fx-start-h"
//                   >
//                     {t("ASifSKs")}
//                     <div
//                       className="share-icon"
//                       style={{ minHeight: "12px", minHeight: "12px" }}
//                     ></div>
//                   </a>
//                 </li>
//               </ul>
//             </div>

//             <div
//               className="fit-container fx-centered fx-col"
//               style={
//                 vcBalance === 0
//                   ? {
//                       opacity: 0.7,
//                       cursor: "not-allowed",
//                       pointerEvents: "none",
//                     }
//                   : {}
//               }
//             >
//               <div className="fit-container fx-scattered">
//                 <div style={{ width: "85%" }}>
//                   <p className="gray-c p-medium">{t("A5DDopE")}</p>
//                 </div>
//                 {/* <div style={{ width: "15%" }}>
//                   <p className="gray-c p-medium">{t("A0BxU3E")}</p>
//                 </div> */}
//               </div>
//               {poll.voteOptionMap.map((option, index) => {
//                 let isSelected = selectedOptions.find((_) => _.idx == index);
//                 return (
//                   <div
//                     className={`box-pad-h-m box-pad-v-s sc-s-18 fx-centered fx-start-h fit-container pointer`}
//                     style={{
//                       position: "relative",
//                       backgroundColor: isSelected ? "var(--orange-side)" : "",
//                       borderColor: isSelected ? "var(--orange-main)" : "",
//                     }}
//                     key={index}
//                     onClick={() => handleSelectedOptions(index, isSelected)}
//                   >
//                     <p>{option || "[OPTION]"}</p>
//                     {/* <label
//                       style={{
//                         position: "relative",
//                         borderColor: isSelected ? "var(--orange-main)" : "",
//                       }}
//                       className={`box-pad-h-m box-pad-v-s sc-s-18 fx-centered fx-start-h fit-container`}
//                       htmlFor={`opt-${index}`}
//                     >
//                       <input
//                         type="checkbox"
//                         name={`opt-${index}`}
//                         id={`opt-${index}`}
//                         onChange={() => handleSelectedOptions(index)}
//                       />
//                       <p>{option || "[OPTION]"}</p>
//                     </label> */}
//                     {/* <div style={{ width: "15%" }}>
//                       <input
//                         type="number"
//                         className={`if ifs-full ${
//                           isSelected ? "" : "if-disabled"
//                         }`}
//                         placeholder="vc"
//                         min={0}
//                         style={{ height: "var(--40)" }}
//                         onChange={(e) => handleVC(index, e.target.value)}
//                         value={
//                           isSelected
//                             ? isSelected.vc.toString().replace(/^0+(\d)/, "$1")
//                             : 0
//                         }
//                         disabled={!isSelected}
//                       />
//                     </div> */}
//                   </div>
//                 );
//               })}
//               <button
//                 className={`btn btn-full ${
//                   vcBalanceConsumed > 0 && vcBalanceConsumed <= vcBalance
//                     ? "btn-normal"
//                     : "btn-disabled"
//                 }`}
//                 onClick={pollVote}
//                 disabled={
//                   vcBalanceConsumed === 0 ||
//                   vcBalanceConsumed > vcBalance ||
//                   vcBalance === 0
//                 }
//               >
//                 {isVotingLoading ? <LoadingDots /> : t("A0hPAcy")}
//               </button>
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

const MACIPollVote = ({ poll, exit, onVoteSuccess }) => {
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(true);
  const [isVotingLoading, setIsVotingLoading] = useState(false);
  const [vcBalance, setVcBalance] = useState(0);
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [ecosystem, setEcosystem] = useState("doravota");
  const [userConfig, setUserConfig] = useState(false);
  const [isGasStationForVote, setIsGasStationForVote] = useState(false);
  const vcBalanceConsumed = useMemo(() => {
    return selectedOptions.reduce(
      (acc, curr) =>
        acc + (poll.circuitName === "MACI-1p1v" ? curr.vc : curr.vc * curr.vc),
      0
    );
  }, [vcBalance, selectedOptions]);

  useEffect(() => {
    const init = async () => {
      try {
        if (poll.roundBalance < 2) {
          setIsLoading(false);
          setIsGasStationForVote(true);
          return;
        }
        let { signer, address } = await getKeplrSigner();
        const client = new MaciClient({
          network: process.env.REACT_APP_NETWORK,
          signer,
        });
        let vcBalance_ = false;
        const maciKeypair = await getMaciAccount(client, address);

        let stateIdx = await client.getStateIdxByPubKey({
          contractAddress: poll.id,
          pubKey: maciKeypair.pubKey,
        });

        if (stateIdx === -1) {
          if (poll.roundBalance < 6) {
            setIsLoading(false);
            return;
          }

          const oracleClient = await client.oracleMaciClient({
            signer: signer,
            contractAddress: poll.id,
          });
          const oracleConfig = await oracleClient.queryOracleWhitelistConfig();
          if (oracleConfig?.ecosystem) setEcosystem(oracleConfig.ecosystem);
          const certificate = await client.maci.requestOracleCertificate({
            signer,
            ecosystem: oracleConfig?.ecosystem || "doravota",
            address,
            contractAddress: poll.id,
          });
          vcBalance_ = await oracleClient.whiteBalanceOf({
            amount: certificate.amount,
            certificate: certificate.signature,
            sender: address,
          });

          if (vcBalance_ == 0) {
            setIsLoading(false);
            return;
          }

          let allowance = await client.maci.feegrantAllowance({
            address,
            contractAddress: poll.id,
          });
          allowance = allowance.spend_limit.length > 0 ? true : false;

          while (!allowance) {
            allowance = await client.maci.feegrantAllowance({
              address,
              contractAddress: poll.id,
            });
            allowance = allowance.spend_limit.length > 0 ? true : false;
            await sleepTimer(1000);
          }

          const signupResponse = await client.signup({
            signer,
            address,
            maciKeypair,
            contractAddress: poll.id,
            oracleCertificate: {
              amount: certificate.amount,
              signature: certificate.signature,
            },
            gasStation: true,
          });

          await sleepTimer(7000);
          stateIdx = await client.maci.getStateIdxByPubKey({
            contractAddress: poll.id,
            pubKey: maciKeypair.pubKey,
          });
        }

        if (vcBalance_ === false)
          vcBalance_ = await client.maci.getVoiceCreditBalance({
            signer,
            contractAddress: poll.id,
            stateIdx,
          });
        let config = {
          client,
          signer,
          address,
          stateIdx,
          maciKeypair,
        };
        setUserConfig(config);
        setVcBalance(parseInt(vcBalance_) > 0 ? 1 : 0);
        setIsLoading(false);
      } catch (err) {
        console.log(err);
        setIsLoading(false);
      }
    };
    init();
  }, []);

  const getMaciAccount = async (client, address) => {
    try {
      const stringToBigInt = (ma) => {
        let tempMa = {
          // eslint-disable-next-line no-undef
          formatedPrivKey: BigInt(ma.formatedPrivKey),
          // eslint-disable-next-line no-undef
          privKey: BigInt(ma.privKey),
          // eslint-disable-next-line no-undef
          pubKey: [BigInt(ma.pubKey[0]), BigInt(ma.pubKey[1])],
        };
        return tempMa;
      };

      let maciAccount = localStorage.getItem(`maciAccount-${address}`);
      maciAccount = maciAccount
        ? stringToBigInt(JSON.parse(maciAccount))
        : await createMaciAccount(address);
      setMaciAccount(address, maciAccount);
      return maciAccount;
    } catch (err) {
      console.log(err);
    }
  };

  const createMaciAccount = async (address) => {
    try {
      const sig = await window.keplr.signArbitrary(
        DORA_CONFIG[process.env.REACT_APP_NETWORK].chainId,
        address,
        "Generate_MACI_Private_Key"
      );
      let keypair = genKeypair(
        // eslint-disable-next-line no-undef
        BigInt("0x" + Buffer.from(sig.signature, "base64").toString("hex"))
      );
      return keypair;
    } catch (err) {
      console.log(err);
      return false;
    }
  };

  const setMaciAccount = (address, maciAccount) => {
    try {
      let tempMaciAccount = {
        formatedPrivKey: maciAccount.formatedPrivKey.toString(),
        privKey: maciAccount.privKey.toString(),
        pubKey: [
          maciAccount.pubKey[0].toString(),
          maciAccount.pubKey[1].toString(),
        ],
      };
      localStorage.setItem(
        `maciAccount-${address}`,
        JSON.stringify(tempMaciAccount)
      );
    } catch (err) {
      console.log(err);
    }
  };

  const handleSelectedOptions = (index, isSelected) => {
    setSelectedOptions(isSelected ? [] : [{ idx: index, vc: 1 }]);
  };

  const pollVote = async () => {
    if (
      vcBalanceConsumed === 0 ||
      vcBalanceConsumed > vcBalance ||
      vcBalance === 0
    )
      return;
    try {
      setIsVotingLoading(true);
      let rejectionCount = 0;
      let { client, signer, address, stateIdx, maciKeypair } = userConfig;
      let gasStationEnable = await client.maci.queryRoundGasStation({
        contractAddress: poll.id,
      });

      while (!gasStationEnable) {
        if (rejectionCount > 5) {
          setIsVotingLoading(false);
          dispatch(
            setToast({
              type: 3,
              desc: "Gas station was not enabled, please try again later",
            })
          );
          return;
        }
        await sleepTimer(1000);
        gasStationEnable = await client.maci.queryRoundGasStation({
          contractAddress: poll.id,
        });
        rejectionCount++;
      }

      const voteResponse = await client.maci.vote({
        signer,
        address,
        stateIdx,
        maciKeypair,
        contractAddress: poll.id,
        selectedOptions: selectedOptions,
        operatorCoordPubKey: [
          // eslint-disable-next-line no-undef
          BigInt(poll.coordinatorPubkeyX),
          // eslint-disable-next-line no-undef
          BigInt(poll.coordinatorPubkeyY),
        ],
        gasStation: true,
      });
      dispatch(
        setToast({
          type: 1,
          desc: "Your vote was cast successfully",
        })
      );
      let chosenOptionsToSave = Object.fromEntries(
        selectedOptions
          .map((_) => {
            return {
              [_.idx]: _.vc,
            };
          })
          .flatMap(Object.entries)
      );
      setSelectedVoteOptionsToCache(poll.id, chosenOptionsToSave);
      onVoteSuccess && onVoteSuccess(chosenOptionsToSave);
      setIsVotingLoading(false);
    } catch (err) {
      console.log(err);
      dispatch(
        setToast({
          type: 3,
          desc: "An error occurred while processing your vote, please try again later",
        })
      );
      setIsVotingLoading(false);
    }
  };

  if (!isLoading && isGasStationForVote)
    return (
      <div className="fixed-container fx-centered box-pad-h">
        <div
          className="sc-s-18 bg-sp box-pad-h box-pad-v fx-centered"
          style={{
            width: "min(100%, 400px)",
            height: "auto",
            position: "relative",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="close" onClick={exit}>
            <div></div>
          </div>
          <div className="fit-container fx-centered fx-col">
            <div
              className="info-tt-24"
              style={{ minWidth: "48px", minHeight: "48px" }}
            ></div>
            <h4>Unable to vote</h4>
            <p className="gray-c p-centered box-pad-h">
              {`"This round's gas fees are below 2 DORA, this prevents voting. Please wait for the creator to add more gas.",`}
            </p>
          </div>
        </div>
      </div>
    );
  if (!isLoading && vcBalance === 0 && poll.roundBalance < 6)
    return (
      <div className="fixed-container fx-centered box-pad-h">
        <div
          className="sc-s-18 bg-sp box-pad-h box-pad-v fx-centered"
          style={{
            width: "min(100%, 400px)",
            height: "auto",
            position: "relative",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="close" onClick={exit}>
            <div></div>
          </div>
          <div className="fit-container fx-centered fx-col">
            <div
              className="info-tt-24"
              style={{ minWidth: "48px", minHeight: "48px" }}
            ></div>
            <h4>Unable to signup and vote</h4>
            <p className="gray-c p-centered box-pad-h">
              This round's gas fees are below 6 DORA, this prevents signup and
              voting. Please wait for the creator to add more gas.
            </p>
          </div>
        </div>
      </div>
    );
  return (
    <div
      className="fixed-container fx-centered box-pad-h"
      onClick={(e) => {
        e.stopPropagation();
        exit(e);
      }}
    >
      <div
        className="sc-s-18 bg-sp box-pad-h box-pad-v fx-centered"
        style={{
          minWidth: "min(100%, 500px)",
          height: isLoading ? "30vh" : "auto",
          position: "relative",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="close" onClick={exit}>
          <div></div>
        </div>
        {isLoading && <LoadingDots />}
        {!isLoading && (
          <div
            className="fit-container fx-centered fx-start-v fx-col"
            style={{ gap: "16px" }}
          >
            <div className="fx-centered fx-col fx-start-v">
              <p className="gray-c">Voice credit</p>
              <div className="fx-centered">
                {vcBalance === 0 && selectedOptions.length === 0 && (
                  <h2 className="red-c">0</h2>
                )}
                {vcBalance !== 0 && (
                  <h2>
                    <span className="gray-c">{selectedOptions.length}</span>
                    /1
                  </h2>
                )}
              </div>
              {vcBalance === 0 && selectedOptions.length === 0 && (
                <div className="fx-centered">
                  <p className="gray-c p-medium">Low voice credit balance</p>
                  <a
                    target="_blank"
                    href={
                      ecosystem === "doravota"
                        ? "https://vota-explorer.dorafactory.org/doravota/staking/doravaloper1gerunjnh6umehq6zm0gphrc87u37veuv5y9dkw"
                        : "https://wallet.keplr.app/chains/cosmos-hub?modal=validator&chain=cosmoshub-4&validator_address=cosmosvaloper17w8wc8y2jg2fjnkfxfw8z7a84qtuvyrgd89hm4"
                    }
                    className="c1-c p-medium fx-centered"
                  >
                    Please stake here
                    <div
                      className="share-icon"
                      style={{ minWidth: "12px", minHeight: "12px" }}
                    ></div>
                  </a>
                </div>
              )}
            </div>
            <div>
              <p className="c1-c">Tips</p>
              <ul>
                <li>Select a voting option from the list below.</li>
                <li>Only one voice credit is required to vote.</li>
                <li>You can submit multiple times.</li>
                <li>Only the last submission will be valid.</li>
                <li>
                  <a
                    href="https://research.dorahacks.io/2022/04/30/light-weight-maci-anonymization/"
                    target="_blank"
                    className="c1-c fx-centered fx-start-h"
                  >
                    Learn more about MACI
                    <div
                      className="share-icon"
                      style={{ minHeight: "12px", minHeight: "12px" }}
                    ></div>
                  </a>
                </li>
              </ul>
            </div>

            <div
              className="fit-container fx-centered fx-col"
              style={
                vcBalance === 0
                  ? {
                      opacity: 0.7,
                      cursor: "not-allowed",
                      pointerEvents: "none",
                    }
                  : {}
              }
            >
              <div className="fit-container fx-scattered">
                <div style={{ width: "85%" }}>
                  <p className="gray-c p-medium">Options</p>
                </div>
              </div>
              {poll.voteOptionMap.map((option, index) => {
                let isSelected = selectedOptions.find((_) => _.idx == index);
                return (
                  <div
                    className={`box-pad-h-m box-pad-v-s sc-s-18 fx-centered fx-start-h fit-container pointer`}
                    style={{
                      position: "relative",
                      backgroundColor: isSelected ? "var(--orange-side)" : "",
                      borderColor: isSelected ? "var(--orange-main)" : "",
                    }}
                    key={index}
                    onClick={() => handleSelectedOptions(index, isSelected)}
                  >
                    <p>{option || "[OPTION]"}</p>
                  </div>
                );
              })}
              <button
                className={`btn btn-full ${
                  vcBalanceConsumed > 0 && vcBalanceConsumed <= vcBalance
                    ? "btn-normal"
                    : "btn-disabled"
                }`}
                onClick={pollVote}
                disabled={
                  vcBalanceConsumed === 0 ||
                  vcBalanceConsumed > vcBalance ||
                  vcBalance === 0
                }
              >
                {isVotingLoading ? <LoadingDots /> : "Submit"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
