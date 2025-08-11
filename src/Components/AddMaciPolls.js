'use client';
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import Select from "@/Components/Select";
import {
  MaciCertSystemType,
  MaciCircuitType,
  MaciClient,
} from "@dorafactory/maci-sdk";
import { GasPrice, calculateFee } from '@cosmjs/stargate';

import LoadingDots from "@/Components/LoadingDots";
import { getKeplrSigner } from "@/Helpers/Encryptions";
import axios from "axios";
import { useDispatch } from "react-redux";
import { setToast } from "@/Store/Slides/Publishers";
import { makeReadableNumber } from "@/Helpers/Helpers";

export default function AddMaciPolls({ setPollAddr, exit }) {
  const { t } = useTranslation();
  const [pollType, setPollType] = useState(0);

  const MACIPollTypes = [
    {
      display_name: "Oracle MACI",
      value: 0,
    },
    {
      display_name: "Classic MACI",
      value: 1,
    },
    {
      display_name: "Anonymous MACI",
      value: 2,
    },
  ];

  return (
    <div
      className="fit-container sc-s-18 bg-sp "
      style={{ maxHeight: "90vh", overflow: "scroll" }}
    >
      {/* <div
        className="fit-container fx-scattered box-pad-h-m box-pad-v-m"
        style={{ borderBottom: "1px solid var(--pale-gray)" }}
      >
        <p className="p-big">MACI poll type</p>
        <Select
          options={MACIPollTypes}
          value={pollType}
          setSelectedValue={setPollType}
        />
      </div> */}
      <OracleMACIPoll setPollAddr={setPollAddr} exit={exit} />
      {/* {pollType === 1 && <MACIPoll setPollAddr={setPollAddr}/>} */}
    </div>
  );
}

const OracleMACIPoll = ({ setPollAddr, exit }) => {
  const { t } = useTranslation();
  const [circuitType, setCircuitType] = useState("0");
  const [ecosystemType, setEcosystemType] = useState("doravota");
  const [roundName, setRoundName] = useState("");
  const [roundDescription, setRoundDescription] = useState("");
  const [votersNumber, setVotersNumber] = useState("");
  const [optionsNumber, setOptionsNumber] = useState("");
  const [voteStart, setVoteStart] = useState("");
  const [voteEnd, setVoteEnd] = useState("");
  const [options, setOptions] = useState([]);
  const [tempOption, setTempOption] = useState("");
  const [snapshotHeight, setSnapshotHeight] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirmationBox, setShowConfirmationBox] = useState(false);
  const [circuitEM, setCircuitEM] = useState(false);
  const [ecosystemEM, setEcosystemEM] = useState(false);
  const [roundNameEM, setRoundNameEM] = useState(false);
  const [roundDescriptionEM, setRoundDescriptionEM] = useState(false);
  const [votersNumberEM, setVotersNumberEM] = useState(false);
  const [optionsNumberEM, setOptionsNumberEM] = useState(false);
  const [gasFee, setGasFee] = useState("");
  const [snapshotHeightEM, setSnapshotHeightEM] = useState(false);
  const [voteStartEM, setVoteStartEM] = useState(false);
  const [voteEndEM, setVoteEndEM] = useState(false);
  const [optionsEM, setOptionsEM] = useState(false);
  const [ecosystemsInfo, setEcosystemsInfo] = useState(false);
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
  const snapshotHeightInfo = useMemo(() => {
    if (ecosystemType && ecosystemsInfo) {
      return (
        ecosystemsInfo.find((_) => _.name === ecosystemType)
          ?.snapshotHeightInfo || { lowestHeight: 0, latestHeight: 0 }
      );
    } else return { lowestHeight: 0, latestHeight: 0 };
  }, [ecosystemType, ecosystemsInfo]);

  const circuitTypes = [
    {
      display_name: "MACI-1p1v",
      value: MaciCircuitType.IP1V,
    },
    {
      display_name: "MACI-QV",
      value: MaciCircuitType.QV,
    },
  ];
  const ecosystemTypes = [
    {
      display_name: "Cosmos Hub",
      value: "cosmoshub",
    },
    {
      display_name: "Dora Vota",
      value: "doravota",
    },
  ];

  useEffect(() => {
    const fetchEcosystemInfo = async () => {
      try {
        let data = await axios.get(
          "https://vota-certificate-api.dorafactory.org/api/v1/list"
        );
        if (data) setEcosystemsInfo(data?.data?.ecosystems);
      } catch (err) {
        console.log(err);
      }
    };
    fetchEcosystemInfo();
  }, []);

  const handleAddOption = () => {
    if (
      !tempOption &&
      !(optionsNumber > 0 && options.length + 1 <= optionsNumber)
    )
      return;
    setOptions((prev) => [...prev, tempOption]);
    setOptionsEM(false);
    setTempOption("");
  };
  const handleEditOption = (value, index) => {
    if (!value) {
      handleDeleteOption(index);
      return;
    }
    let tempArray = Array.from(options);
    tempArray[index] = value;
    setOptions(tempArray);
  };
  const handleDeleteOption = (index) => {
    let tempArray = Array.from(options);
    tempArray.splice(index, 1);
    setOptions(tempArray);
  };
  // const handleMaxOptions = (e) => {
  //   if (options.length > 0) {
  //     setShowConfirmationBox(true);
  //     return;
  //   }
  //   let value = parseInt(e.target.value);
  //   setOptionsNumberEM(false);
  //   setOptionsNumber(value);
  // };
  const handleConfirmationBox = () => {
    setOptions([]);
    setOptionsNumber("");
    setTempOption("");
    setShowConfirmationBox(false);
  };
  const deployPoll = async () => {
    try {
      if (isLoading) return;
      let isInputValid = checkInputs();
      if (!isInputValid) return;
      setIsLoading(true);
      const client = new MaciClient({
        network: process.env.REACT_APP_NETWORK,
      });
      let { signer } = await getKeplrSigner();

    const gasPrice = GasPrice.fromString('100000000000peaka');
    const fee = calculateFee(20000000, gasPrice);
    console.log("oracleCodeId",client.oracleCodeId)
    console.log("contract.oracleCodeId",client.contract.oracleCodeId)
      let poll = await client.createOracleMaciRound({
        signer: signer,
        operatorPubkey: process.env.REACT_APP_OP_PUBKEY,
        startVoting: new Date(voteStart),
        endVoting: new Date(voteEnd),
        title: roundName,
        description: roundDescription,
        circuitType,
        link: "",
        whitelistEcosystem: ecosystemType,
        whitelistSnapshotHeight: snapshotHeight || "0",
        whitelistVotingPowerArgs: {
          mode: "threshold",
          slope:
            ecosystemType === "cosmoshub" ? "10000000" : "10000000000000000000",
          threshold:
            ecosystemType === "cosmoshub" ? "10000000" : "10000000000000000000",
        },
        voteOptionMap: [...options, tempOption].filter((_) => _),
        fee
      });

      setGasFee({ signer, pollID: poll.contractAddress });
      // let amount = parseInt(gasFee)
      // const oracleMaciClient = await client.oracleMaciClient({
      //   signer,
      //   contractAddress: poll.contractAddress,
      // });
      // amount = amount * 10 ** 18;
      // await oracleMaciClient.bond(undefined, undefined, [
      //   {
      //     denom: "peaka",
      //     amount: amount.toString(),
      //   },
      // ]);
      // const oracleClient = await client.oracleMaciClient({
      //   signer,
      //   contractAddress: poll.contractAddress,
      // });
      // const response = await oracleClient.setVoteOptionsMap({
      //   voteOptionMap: options,
      // });
      setIsLoading(false);
      // setPollAddr(poll.contractAddress);
    } catch (err) {
      console.log(err);
      setIsLoading(false);
    }
  };
  const checkInputs = () => {
    let isValid = true;
    if (!circuitType) {
      setCircuitEM(true);
      isValid = false;
    }
    if (!ecosystemType) {
      setEcosystemEM(true);
      isValid = false;
    }
    if (!roundName) {
      setRoundNameEM(true);
      isValid = false;
    }
    if (!roundName) {
      setRoundDescriptionEM(true);
      isValid = false;
    }
    if (options.length < 2 && !tempOption) {
      setOptionsEM(true);
      isValid = false;
    }
    if (!voteStart || new Date(voteStart).getTime() <= new Date().getTime()) {
      setVoteStartEM(true);
      isValid = false;
    }
    if (
      !voteEnd ||
      new Date(voteEnd).getTime() < new Date(voteStart).getTime()
    ) {
      setVoteEndEM(true);
      isValid = false;
    }

    return isValid;
  };

  const handleSnapshotHeight = (e) => {
    let value = parseInt(e.target.value) || "";
    setSnapshotHeightEM(false);
    setSnapshotHeight(value.toString());
    if (!value) return;
    if (
      !(
        value >= parseInt(snapshotHeightInfo.lowestHeight) &&
        value <= parseInt(snapshotHeightInfo.latestHeight)
      )
    )
      setSnapshotHeightEM(true);
  };

  return (
    <>
      {gasFee && (
        <PollGasStation
          poll={gasFee.pollID}
          signer={gasFee.signer}
          exit={() => setPollAddr(gasFee.pollID)}
        />
      )}
      {showConfirmationBox && (
        <ComfirmationBox
          exit={() => setShowConfirmationBox(false)}
          handleClick={handleConfirmationBox}
        />
      )}
      {!gasFee && (
        <div
          className="fx-centered fx-col fx-start-h fx-start-v fit-container box-pad-h-m box-pad-v-m slide-down"
          style={{ position: "relative" }}
        >
          {exit && (
            <div className="close" onClick={exit}>
              <div></div>
            </div>
          )}
          <div className="fit-container fx-centered box-marg-s fx-col">
            <h4>{t("AXDHAmt")}</h4>
            <div className="fx-centered">
              <p className="gray-c">
                ({t("ANM6MSY", { ecosystem: ecosystemType?.toUpperCase() })})
              </p>
              {/* <MACIPollSteps /> */}
            </div>
          </div>
          <div className="fit-container sc-s-18 box-pad-v-s box-pad-h-m">
            <p className="c1-c">{t("A9Mca7S")}</p>
            <ul>
              <li>{t("Ab39qCG")}</li>
              <li>{t("A13Btcr")}</li>
              <li>{t("AZa1vyS")}</li>
              <li>{t("AroLe58")}</li>
            </ul>
          </div>
          <input
            type="text"
            placeholder={t("AIGU9F2")}
            className="if ifs-full"
            value={roundName}
            onChange={(e) => {
              setRoundNameEM(false);
              setRoundName(e.target.value);
            }}
          />
          {roundNameEM && <ErrorMessage message={t("ADkLtbf")} />}
          <textarea
            placeholder={t("AM6TPts")}
            className="txt-area ifs-full"
            value={roundDescription}
            onChange={(e) => {
              setRoundDescriptionEM(false);
              setRoundDescription(e.target.value);
            }}
          />
          {roundDescriptionEM && <ErrorMessage message={t("AlDNugm")} />}
          <p className="gray-c">{t("A9tbS18")}</p>
          <input
            type="datetime-local"
            className="if ifs-full pointer"
            placeholder={t("ATAnXen")}
            min={new Date().toISOString()}
            value={voteStart}
            onChange={(e) => {
              setVoteStartEM(false);
              setVoteStart(e.target.value);
            }}
          />
          {voteStartEM && <ErrorMessage message={t("ALpO7FU")} />}
          <p className="gray-c">{t("Ad8yNh4")}</p>
          <input
            type="datetime-local"
            className="if ifs-full pointer"
            placeholder={t("ATAnXen")}
            min={new Date().toISOString()}
            value={voteEnd}
            onChange={(e) => {
              setVoteEndEM(false);
              setVoteEnd(e.target.value);
            }}
          />
          {voteEndEM && <ErrorMessage message={t("A2wt07D")} />}
          <p className="gray-c">{t("A5DDopE")}</p>
          {!optionsNumber && <p>-</p>}
          <div className="fit-container fx-centered fx-col fx-start-v">
            {options.map((option, index) => {
              return (
                <div className="fit-container fx-centered" key={index}>
                  <input
                    type="text"
                    className="if ifs-full"
                    placeholder={t("AI4ia0I")}
                    value={option}
                    onChange={(e) => handleEditOption(e.target.value, index)}
                  />
                  <div
                    className="round-icon round-icon-tooltip"
                    data-tooltip={t("Almq94P")}
                    onClick={() => handleDeleteOption(index)}
                  >
                    <div className="trash"></div>
                  </div>
                </div>
              );
            })}

            <div className="fit-container fx-scattered">
              <input
                type="text"
                className={`if ifs-full`}
                placeholder={t("AI4ia0I")}
                value={tempOption}
                onChange={(e) => setTempOption(e.target.value)}
              />
              <div
                className={`round-icon round-icon-tooltip ${
                  tempOption ? "pointer" : "if-disabled"
                }`}
                data-tooltip={t("AI4ia0I")}
                onClick={handleAddOption}
              >
                <div className="plus-sign" style={{ cursor: "unset" }}></div>
              </div>
            </div>

            {optionsEM && <ErrorMessage message={t("AXgvwkq")} />}
          </div>
          <div
            className="fit-container fx-centered pointer"
            onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
          >
            <p className="btn-text-gray">{t("ApXyTFX")}</p>
            <div
              className="arrow"
              style={{ rotate: showAdvancedOptions ? "180deg" : "0deg" }}
            ></div>
          </div>
          {showAdvancedOptions && (
            <div className="fit-container fx-centered fx-col slide-down">
              <Select
                options={ecosystemTypes}
                value={ecosystemType}
                setSelectedValue={(data) => {
                  setEcosystemEM(false);
                  setEcosystemType(data);
                }}
                defaultLabel={t("APi769z")}
                fullWidth={true}
              />
              {ecosystemEM && <ErrorMessage message={t("ATGTz9Q")} />}
              <input
                type="number"
                placeholder={t("AnMoqCK")}
                className={`if ifs-full ${!ecosystemType ? "if-disabled" : ""}`}
                min={0}
                value={snapshotHeight}
                onChange={handleSnapshotHeight}
                disabled={!ecosystemType}
              />
              {snapshotHeightEM && (
                <ErrorMessage
                  message={t("AeyQzqu", {
                    lAmount: makeReadableNumber(
                      snapshotHeightInfo.lowestHeight
                    ),
                    hAmount: makeReadableNumber(
                      snapshotHeightInfo.latestHeight
                    ),
                  })}
                />
              )}
            </div>
          )}
          <div className="fit-container">
            <button
              className="btn btn-normal btn-full"
              disabled={isLoading}
              onClick={deployPoll}
            >
              {isLoading ? <LoadingDots /> : t("A2fvUtP")}
            </button>
          </div>
          <p className="gray-c p-centered box-pad-h">{t("ATKheVa")}</p>
        </div>
      )}
    </>
  );
};

const MACIPollSteps = () => {
  const { t } = useTranslation();
  const [showTooltip, setShowTooltip] = useState(false);

  const listRef = useRef(null);

  useEffect(() => {
    const handleOffClick = (e) => {
      e.stopPropagation();
      if (listRef.current && !listRef.current.contains(e.target))
        setShowTooltip(false);
    };
    document.addEventListener("mousedown", handleOffClick);
    return () => {
      document.removeEventListener("mousedown", handleOffClick);
    };
  }, [listRef]);
  return (
    <div style={{ position: "relative" }} ref={listRef}>
      <div
        className="info"
        style={{ minWidth: "18px", minHeight: "18px" }}
        onClick={(e) => {
          e.stopPropagation();
          setShowTooltip(!showTooltip);
        }}
      ></div>
      {showTooltip && (
        <div
          className="sc-s-18 box-pad-v-m box-pad-h-m"
          style={{
            width: "300px",
            position: "absolute",
            right: 0,
            top: "100%",
          }}
        >
          <p className="gray-c">{t("A9Mca7S")}</p>
          <ul>
            <li>{t("AuMrZaK")}</li>
            <li>{t("Ab39qCG")}</li>
            <li>{t("AZa1vyS")}</li>
            <li>
              <a
                href="https://research.dorahacks.io/2022/04/30/light-weight-maci-anonymization/"
                target="_blank"
                className="c1-c fx-centered fx-start-h"
              >
                {t("ASifSKs")}
                <div
                  className="share-icon"
                  style={{ minHeight: "12px", minHeight: "12px" }}
                ></div>
              </a>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
};

const PollGasStation = ({ poll, signer, exit }) => {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const [gasFee, setGasFee] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errMsg, setErrMsg] = useState(false);

  const addGasFees = async () => {
    try {
      setIsLoading(true);
      let amount = parseInt(gasFee) || 0;
      if (amount < 8) {
        setIsLoading(false);
        setErrMsg(true);
        return;
      }

      const client = new MaciClient({
        network: process.env.REACT_APP_NETWORK,
      });

      const oracleMaciClient = await client.oracleMaciClient({
        signer,
        contractAddress: poll,
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
            width: "min(100%, 450px)",
            height: "auto",
            position: "relative",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="fit-container fx-centered fx-col">
            <h4>{t("A6rbQWS")}</h4>
            <p className="gray-c p-centered box-pad-h">{t("AmWSJ4C")}</p>
            <input
              type="number"
              placeholder={`${t("AcDgXKI")}`}
              value={gasFee}
              onChange={(e) => {
                setErrMsg(false);
                setGasFee(e.target.value);
              }}
              style={{ borderColor: errMsg ? "var(--red-main)" : "" }}
              className="if ifs-full"
            />
            {errMsg && <ErrorMessage message={t("A8OlKXj")} />}
            <button className="btn btn-normal btn-full" onClick={addGasFees}>
              {isLoading ? <LoadingDots /> : t("AKU6Qm4")}
            </button>
            <p>{t("Ax46s4g")}</p>
            <button className="btn btn-gst btn-full" onClick={exit}>
              {isLoading ? <LoadingDots /> : t("AuhJ2Uy")}
            </button>
            <p className="c1-c p-medium">{t("ALNQpDw")}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

const MACIPoll = ({ setPollAddr }) => {
  const { t } = useTranslation();
  const [circuitType, setCircuitType] = useState("");
  const [proofSystem, setProofSystem] = useState("");
  const [roundName, setRoundName] = useState("");
  const [roundDescription, setRoundDescription] = useState("");
  const [votersNumber, setVotersNumber] = useState("");
  const [optionsNumber, setOptionsNumber] = useState("");
  const [voteStart, setVoteStart] = useState("");
  const [voteEnd, setVoteEnd] = useState("");
  const [options, setOptions] = useState([]);
  const [tempOption, setTempOption] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const circuitTypes = [
    {
      display_name: "MACI-1p1v",
      value: MaciCircuitType.IP1V,
    },
    {
      display_name: "MACI-QV",
      value: MaciCircuitType.QV,
    },
  ];

  const proofSystems = [
    {
      display_name: "Groth16",
      value: MaciCertSystemType.GROTH16,
    },
    {
      display_name: "Plonk",
      value: MaciCertSystemType.PLONK,
    },
  ];

  const handleAddOption = () => {
    if (!tempOption) return;
    setOptions((prev) => [...prev, tempOption]);
    setTempOption("");
  };
  const handleEditOption = (value, index) => {
    let tempArray = Array.from(options);
    tempArray[index] = value;
    setOptions(tempArray);
  };
  const handleDeleteOption = (index) => {
    let tempArray = Array.from(options);
    tempArray.splice(index, 1);
    setOptions(tempArray);
  };

  const deployPoll = async () => {
    try {
      if (isLoading) return;
      setIsLoading(true);
      const client = new MaciClient({
        network: process.env.REACT_APP_NETWORK,
      });
      let signer = await getKeplrSigner();
      let poll = await client.contract.createMaciRound({
        signer,
        operatorPubkey: process.env.REACT_APP_OP_PUBKEY,
        startVoting: new Date(voteStart),
        endVoting: new Date(voteEnd),
        title: roundName,
        description: roundDescription,
        maxVoter: votersNumber,
        maxOption: optionsNumber,
        circuitType,
        certSystemType: proofSystem,
        link: "",
      });
      const oracleClient = await client.oracleMaciClient({
        signer,
        contractAddress: poll.contractAddress,
      });
      const response = await oracleClient.setVoteOptionsMap({
        voteOptionMap: options,
      });
      setIsLoading(false);
      setPollAddr(poll.contractAddress);
    } catch (err) {
      console.log(err);
      setIsLoading(false);
    }
  };

  return (
    <div className="fx-centered fx-col fx-start-h fx-start-v fit-container box-pad-h-m box-pad-v-m slide-up">
      <h4>Configure your MACI round</h4>
      <p className="gray-c">
        If this is your first time deploying a MACI round, you are recommended
        to read{" "}
        <a
          href="https://docs.dorafactory.org/docs/vota"
          className="c1-c"
          target="_blank"
        >
          the Dora Vota Operator Manual.
        </a>
      </p>
      <Select
        options={circuitTypes}
        value={circuitType}
        setSelectedValue={setCircuitType}
        defaultLabel="Select a circuit"
        fullWidth={true}
      />
      <Select
        options={proofSystems}
        value={proofSystem}
        setSelectedValue={setProofSystem}
        defaultLabel="Select a proof system"
        fullWidth={true}
      />
      <p className="gray-c">
        The circuit and proof system you choose will determine the mechanism of
        your round.{" "}
        <a
          href="https://vota.dorafactory.org/circuits"
          className="c1-c"
          target="_blank"
        >
          View all circuits.
        </a>
      </p>
      <input
        type="text"
        placeholder="Name"
        className="if ifs-full"
        value={roundName}
        onChange={(e) => setRoundName(e.target.value)}
      />
      <textarea
        placeholder="Description"
        className="txt-area ifs-full"
        value={roundDescription}
        onChange={(e) => setRoundDescription(e.target.value)}
      />
      <div className="fit-container fx-centered">
        <input
          type="number"
          placeholder="Max number of voters"
          className="if ifs-full"
          min={1}
          value={votersNumber}
          onChange={(e) => setVotersNumber(e.target.value)}
        />
        <input
          type="number"
          placeholder="Max number of options"
          className="if ifs-full"
          min={1}
          value={optionsNumber}
          onChange={(e) => setOptionsNumber(e.target.value)}
        />
      </div>
      <p className="gray-c">Sart time</p>
      <input
        type="datetime-local"
        className="if ifs-full pointer"
        placeholder={t("ATAnXen")}
        min={new Date().toISOString()}
        value={voteStart}
        onChange={(e) => setVoteStart(e.target.value)}
      />
      <p className="gray-c">End time</p>
      <input
        type="datetime-local"
        className="if ifs-full pointer"
        placeholder={t("ATAnXen")}
        min={new Date().toISOString()}
        value={voteEnd}
        onChange={(e) => setVoteEnd(e.target.value)}
      />
      <p className="gray-c">{t("A5DDopE")}</p>
      <div className="fit-container fx-centered fx-col fx-start-v">
        {options.map((option, index) => {
          return (
            <div className="fit-container fx-centered" key={index}>
              <input
                type="text"
                className="if ifs-full"
                placeholder="Option"
                value={option}
                onChange={(e) => handleEditOption(e.target.value, index)}
              />
              <div
                className="round-icon round-icon-tooltip"
                data-tooltip={t("Almq94P")}
                onClick={() => handleDeleteOption(index)}
              >
                <div className="trash"></div>
              </div>
            </div>
          );
        })}
        <div className="fit-container fx-scattered">
          <input
            type="text"
            className="if ifs-full"
            placeholder="Add option"
            value={tempOption}
            onChange={(e) => setTempOption(e.target.value)}
          />
          <div
            className={`round-icon round-icon-tooltip ${
              tempOption ? "pointer" : "if-disabled"
            }`}
            data-tooltip={t("AI4ia0I")}
            onClick={handleAddOption}
          >
            <div className="plus-sign" style={{ cursor: "unset" }}></div>
          </div>
        </div>
      </div>
      <div className="fit-container">
        <button
          className="btn btn-normal btn-full"
          disabled={isLoading}
          onClick={deployPoll}
        >
          {isLoading ? <LoadingDots /> : "Deploy poll"}
        </button>
      </div>
      <p className="gray-c p-centered box-pad-h">
        The information above cannot be changed after the round is deployed.
        Please confirm the accuracy before proceeding.
      </p>
    </div>
  );
};
const AMACIPoll = ({ setPollAddr }) => {
  const { t } = useTranslation();
  const [circuitType, setCircuitType] = useState("");
  const [roundName, setRoundName] = useState("");
  const [roundDescription, setRoundDescription] = useState("");
  const [votersNumber, setVotersNumber] = useState("");
  const [optionsNumber, setOptionsNumber] = useState("");
  const [vcNumber, setVCNumber] = useState("");
  const [voteStart, setVoteStart] = useState("");
  const [voteEnd, setVoteEnd] = useState("");
  const [options, setOptions] = useState([]);
  const [tempOption, setTempOption] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const circuitTypes = [
    {
      display_name: "aMACI-1p1v",
      value: MaciCircuitType.IP1V,
    },
    {
      display_name: "aMACI-QV",
      value: MaciCircuitType.QV,
    },
  ];

  const handleAddOption = () => {
    if (!tempOption) return;
    setOptions((prev) => [...prev, tempOption]);
    setTempOption("");
  };
  const handleEditOption = (value, index) => {
    let tempArray = Array.from(options);
    tempArray[index] = value;
    setOptions(tempArray);
  };
  const handleDeleteOption = (index) => {
    let tempArray = Array.from(options);
    tempArray.splice(index, 1);
    setOptions(tempArray);
  };

  const deployPoll = async () => {
    try {
      if (isLoading) return;
      setIsLoading(true);
      const client = new MaciClient({
        network: process.env.REACT_APP_NETWORK,
      });
      let signer = await getKeplrSigner();
      let poll = await client.createAMaciRound({
        signer,
        operator: process.env.REACT_APP_OP_PUBKEY,
        startVoting: new Date(voteStart),
        endVoting: new Date(voteEnd),
        title: roundName?.trim(),
        description: roundDescription?.trim(),
        maxVoter: votersNumber,
        maxOption: optionsNumber,
        voiceCreditAmount: vcNumber,
        circuitType,
        link: "",
      });
      const oracleClient = await client.oracleMaciClient({
        signer,
        contractAddress: poll.contractAddress,
      });
      const response = await oracleClient.setVoteOptionsMap({
        voteOptionMap: options,
      });
      setIsLoading(false);
      setPollAddr(poll.contractAddress);
    } catch (err) {
      console.log(err);
      setIsLoading(false);
    }
  };

  return (
    <div className="fx-centered fx-col fx-start-h fx-start-v fit-container box-pad-h-m box-pad-v-m slide-down">
      <h4>Configure your aMACI round</h4>
      <p className="gray-c">
        If this is your first time deploying an aMACI round, you are recommended
        to read{" "}
        <a
          href="https://docs.dorafactory.org/docs/vota-amaci"
          className="c1-c"
          target="_blank"
        >
          the Dora Vota aMACI Manual.
        </a>
      </p>
      <Select
        options={circuitTypes}
        value={circuitType}
        setSelectedValue={setCircuitType}
        defaultLabel="Select a circuit"
        fullWidth={true}
      />
      <input
        type="text"
        placeholder="Name"
        className="if ifs-full"
        value={roundName}
        onChange={(e) => setRoundName(e.target.value)}
      />
      <textarea
        placeholder="Description"
        className="txt-area ifs-full"
        value={roundDescription}
        onChange={(e) => setRoundDescription(e.target.value)}
      />
      <div className="fit-container fx-centered">
        <input
          type="number"
          placeholder="Max number of voters"
          className="if ifs-full"
          min={1}
          value={votersNumber}
          onChange={(e) => setVotersNumber(e.target.value)}
        />
        <input
          type="number"
          placeholder="Max number of options"
          className="if ifs-full"
          min={1}
          value={optionsNumber}
          onChange={(e) => setOptionsNumber(e.target.value)}
        />
      </div>
      <input
        type="number"
        placeholder="Number of voice credits"
        className="if ifs-full"
        min={1}
        value={vcNumber}
        onChange={(e) => setVCNumber(e.target.value)}
      />
      <p className="gray-c">Sart time</p>
      <input
        type="datetime-local"
        className="if ifs-full pointer"
        placeholder={t("ATAnXen")}
        min={new Date().toISOString()}
        value={voteStart}
        onChange={(e) => setVoteStart(e.target.value)}
      />
      <p className="gray-c">End time</p>
      <input
        type="datetime-local"
        className="if ifs-full pointer"
        placeholder={t("ATAnXen")}
        min={new Date().toISOString()}
        value={voteEnd}
        onChange={(e) => setVoteEnd(e.target.value)}
      />
      <p className="gray-c">{t("A5DDopE")}</p>
      <div className="fit-container fx-centered fx-col fx-start-v">
        {options.map((option, index) => {
          return (
            <div className="fit-container fx-centered" key={index}>
              <input
                type="text"
                className="if ifs-full"
                placeholder="Option"
                value={option}
                onChange={(e) => handleEditOption(e.target.value, index)}
              />
              <div
                className="round-icon round-icon-tooltip"
                data-tooltip={t("Almq94P")}
                onClick={() => handleDeleteOption(index)}
              >
                <div className="trash"></div>
              </div>
            </div>
          );
        })}
        <div className="fit-container fx-scattered">
          <input
            type="text"
            className="if ifs-full"
            placeholder="Add option"
            value={tempOption}
            onChange={(e) => setTempOption(e.target.value)}
          />
          <div
            className={`round-icon round-icon-tooltip ${
              tempOption ? "pointer" : "if-disabled"
            }`}
            data-tooltip={t("AI4ia0I")}
            onClick={handleAddOption}
          >
            <div className="plus-sign" style={{ cursor: "unset" }}></div>
          </div>
        </div>
      </div>
      <div className="fit-container">
        <button
          className="btn btn-normal btn-full"
          disabled={isLoading}
          onClick={deployPoll}
        >
          {isLoading ? <LoadingDots /> : "Deploy poll"}
        </button>
      </div>
      <p className="gray-c p-centered box-pad-h">
        The information above cannot be changed after the round is deployed.
        Please confirm the accuracy before proceeding.
      </p>
    </div>
  );
};

const ComfirmationBox = ({ exit, handleClick }) => {
  const { t } = useTranslation();

  return (
    <section className="fixed-container fx-centered box-pad-h">
      <section
        className="fx-centered fx-col sc-s-18 bg-sp box-pad-h box-pad-v"
        style={{ width: "450px" }}
      >
        <div
          className="fx-centered box-marg-s"
          style={{
            minWidth: "54px",
            minHeight: "54px",
            borderRadius: "var(--border-r-50)",
            backgroundColor: "var(--red-main)",
          }}
        >
          <div className="warning"></div>
        </div>
        <h3 className="p-centered">{t("APW25Bv")}</h3>
        <p className="p-centered gray-c box-pad-v-m">{t("AficTB0")}</p>
        <div className="fx-centered fit-container">
          <button className="fx btn btn-gst-red" onClick={handleClick}>
            {t("AFfwJMh")}
          </button>
          <button className="fx btn btn-red" onClick={exit}>
            {t("AB4BSCe")}
          </button>
        </div>
      </section>
    </section>
  );
};

const ErrorMessage = ({ message }) => {
  return (
    <div className="fit-container">
      <p className="red-c">{message}</p>
    </div>
  );
};

// import React from "react";
// import { MaciClient, MaciCircuitType } from "@dorafactory/maci-sdk";
// import { SigningStargateClient } from "@cosmjs/stargate";
// import { DORA_CONFIG } from "@/Content/MACI";

// const getKeplrKey = async () => {
//   if (!window.keplr) {
//     console.log("Please install keplr extension");
//     return false;
//   } else {
//     const chainId = DORA_CONFIG[process.env.REACT_APP_NETWORK].chainId;

//     await window.keplr.enable(chainId);

//     const offlineSigner = window.keplr.getOfflineSigner(chainId);

//     const accounts = await offlineSigner.getAccounts();

//     return accounts[0];
//   }
// };

// export default function AddMaciPolls() {
//   const addMaciPoll = async () => {
//     try {
// const client = new MaciClient({
//   network: process.env.REACT_APP_NETWORK,
// });

//       let signer = await getKeplrSigner();
// const newRound = await client.contract.createOracleMaciRound({
//         signer: signer,
//         operatorPubkey: process.env.REACT_APP_OP_PUBKEY,
//         startVoting: new Date(),
//         endVoting: new Date(new Date().getTime() + 1 * 60 * 1000),
//         title: "MaciPollTest",
//         description: "MaciPollTest",
//         link: "MaciPollTest",
//         maxVoter: "5",
//         maxOption: "5",
//         circuitType: MaciCircuitType.IP1V,
//         whitelistEcosystem: "cosmoshub",
//         whitelistSnapshotHeight: "0",
//         whitelistVotingPowerArgs: {
//           mode: "slope",
//           slope: "1000000",
//           threshold: "1000000",
//         },
//       });
//       console.log("newRound:", newRound);
//     } catch (err) {
//       console.log(err);
//     }
//   };

//   const getKeplrSigner = async () => {
//     try {
//       const chainId = DORA_CONFIG[process.env.REACT_APP_NETWORK].chainId;
//       const rpc = DORA_CONFIG[process.env.REACT_APP_NETWORK].rpc;
//       await window.keplr.experimentalSuggestChain(
//         DORA_CONFIG[process.env.REACT_APP_NETWORK]
//       );

//       await window.keplr.enable(chainId);

//       const offlineSigner = window.getOfflineSigner(chainId);

//       const client = await SigningStargateClient.connectWithSigner(
//         rpc,
//         offlineSigner
//       );

//       return client.signer;
//     } catch (err) {
//       console.log(err);
//       return false;
//     }
//   };

//   const getPoll = async () => {
//     try {
//       const client = new MaciClient({
//         network: process.env.REACT_APP_NETWORK,
//       });
//       let poll = await client.getRoundById(
//         "dora1695vj3dd72pklzcpaezvhw847txe057as9ttuf5ray9ze6zvacjq685qyk"
//       );
//       console.log(poll);
//     } catch (err) {
//       console.log(err);
//     }
//   };
//   const getRonuds = async () => {
//     try {
//       const client = new MaciClient({
//         network: "testnet",
//       });
//       let poll = await client.getRounds(
//         "WyJ0aW1lc3RhbXBfZGVzYyIsWyIxNzM3NTI2NzUyMzI5IiwiMjA1OGI2MzEtYjcyNi00ZjdiLTkxY2QtNzllZWE3NzlmMmYzIl1d",
//         10
//       );
//       console.log(poll);
//     } catch (err) {
//       console.log(err);
//     }
//   };

//   return (
//     <div className="btn btn-normal" onClick={getRonuds}>
//       AddMaciPolls
//     </div>
//   );
// }
