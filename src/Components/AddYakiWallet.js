'use client';
import axios from "axios";
import React, { useState } from "react";
import { setToast } from "@/Store/Slides/Publishers";
import { useDispatch, useSelector } from "react-redux";
import { getWallets, updateWallets } from "@/Helpers/ClientHelpers";
import LoadingDots from "@/Components/LoadingDots";
import { useTranslation } from "react-i18next";
import { downloadAsFile } from "@/Helpers/Encryptions";

export default function AddYakiWallet({ refresh }) {
  const dispatch = useDispatch();
  const userMetadata = useSelector((state) => state.userMetadata);
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  const [showMore, setShowMore] = useState(false);
  const [showErrorMessage, setShowMessageError] = useState(false);
  const [showEmptyUNMessage, setShowMessageEmtpyUN] = useState(false);
  const [showInvalidMessage, setShowInvalidMessage] = useState(false);
  const [userName, setUserName] = useState(
    userMetadata?.display_name || userMetadata?.name || ""
  );

  const handleCreateWallet = async (e) => {
    try {
      e.stopPropagation();
      if (isLoading || showInvalidMessage) return;
      if (!userName) {
        setShowMessageEmtpyUN(true);
        return;
      }
      setIsLoading(true);
      let url = await axios.post("https://wallet.yakihonne.com/api/wallets", {
        username: userName?.toLowerCase(),
      });
      let toSave = [
        "Important: Store this information securely. If you lose it, recovery may not be possible. Keep it private and protected at all times",
        "---",
        `Address: ${url.data.lightningAddress}`,
        `NWC secret: ${url.data.connectionSecret}`,
      ];
      downloadAsFile(
        toSave.join("\n"),
        "text/plain",
        `${url.data.lightningAddress}-NWC.txt`,
        t("AIzBCBb"),
        false
      );
      setIsLoading(false);
      let wallet = {
        secret: url.data.connectionSecret,
        addr: url.data.lightningAddress,
      };
      let nwcNode = {
        id: Date.now(),
        kind: 3,
        entitle: wallet.addr,
        active: true,
        data: wallet.secret,
      };
      let oldVersion = getWallets();
      if (oldVersion) {
        try {
          oldVersion = oldVersion.map((item) => {
            let updated_item = { ...item };
            updated_item.active = false;
            return updated_item;
          });
          oldVersion.push(nwcNode);
          updateWallets(oldVersion);
          refresh();
          return;
        } catch (err) {
          updateWallets([nwcNode]);
          refresh();
          return;
        }
      }
      updateWallets([nwcNode]);
      refresh();
    } catch (err) {
      console.log(err)
      setIsLoading(false);
      if (err.response?.status) {
        setShowMessageError(true);
      } else {
        dispatch(
          setToast({
            type: 3,
            desc: t("AQ12OQz"),
          })
        );
      }
    }
  };

  const handleInputField = (e) => {
    let value = e.target.value;
    let isValid = /^[a-zA-Z0-9]+$/.test(value);
    if (showErrorMessage) setShowMessageError(false);
    if (showEmptyUNMessage) setShowMessageEmtpyUN(false);
    if (!value || (isValid && showInvalidMessage)) setShowInvalidMessage(false);
    if (value && !isValid && !showInvalidMessage) setShowInvalidMessage(true);
    setUserName(value);
  };

  return (
    <div
      className={`fit-container fx-scattered sc-s-18 fx-col box-pad-h-s box-pad-v-s pointer ${
        showMore ? "" : "option"
      }`}
      style={{ backgroundColor: "transparent" }}
      onClick={(e) => e.stopPropagation()}
    >
      <div
        className="fx-scattered fit-container"
        onClick={(e) => {
          e.stopPropagation();
          setShowMore(!showMore);
        }}
      >
        <div className="fx-centered">
          <div
            className="yaki-logomark"
            style={{ width: "48px", height: "48px" }}
          ></div>

          <div>
            <p>{t("AXj1AXD")}</p>
            <p className="gray-c p-medium">{t("AzefMgD")}</p>
          </div>
        </div>
        <div className="box-pad-h-s">
          <div
            className="plus-sign"
            style={{ rotate: showMore ? "45deg" : "0deg" }}
          ></div>
        </div>
      </div>
      {showMore && (
        <div className="fit-container fx-centered fx-col slide-up">
          <hr />
          <div className="fit-container fx-centered">
            <input
              type="text"
              className="ifs-full if"
              placeholder={t("ALCpv2S")}
              value={userName}
              onChange={handleInputField}
              style={{
                borderColor:
                  showErrorMessage || showEmptyUNMessage || showInvalidMessage
                    ? "var(--red-main)"
                    : "",
              }}
            />
            <p className="gray-c p-big" style={{ minWidth: "max-content" }}>
              @wallet.yakihonne.com
            </p>
          </div>
          {showErrorMessage && (
            <div className="fit-container box-pad-h-m">
              <p className="red-c p-medium">{t("AgrHddv")}</p>
            </div>
          )}
          {showEmptyUNMessage && (
            <div className="fit-container box-pad-h-m">
              <p className="red-c p-medium">{t("AhQtS0K")}</p>
            </div>
          )}
          {showInvalidMessage && (
            <div className="fit-container box-pad-h-m">
              <p className="red-c p-medium">{t("AqSxggD")}</p>
            </div>
          )}
          <button
            className="btn btn-normal btn-full"
            onClick={handleCreateWallet}
          >
            {/* {!isLoading && <>{userName ? t("AvjCl1G") : t("AhQtS0K")}</>} */}
            {isLoading ? <LoadingDots /> : t("AvjCl1G")}
          </button>
        </div>
      )}
    </div>
  );
}
