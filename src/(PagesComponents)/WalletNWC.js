import React, { useState } from "react";
import { webln } from "@getalby/sdk";
import LoadingDots from "@/Components/LoadingDots";
import { getWallets, updateWallets } from "@/Helpers/ClientHelpers";
import { useDispatch } from "react-redux";
import { setToast } from "@/Store/Slides/Publishers";
import { customHistory } from "@/Helpers/History";
import { useTranslation } from "react-i18next";
import Link from "next/link";

export default function WalletNWC() {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const [url, setUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const addNWC = async () => {
    try {
      if (isLoading) return;
      setIsLoading(true);
      const nwc = new webln.NWC({ nostrWalletConnectUrl: url });
      await nwc.enable();
      // const balanceResponse = await nwc.getBalance();

      let walletPubkey = nwc.client.walletPubkey;
      let relayUrl = nwc.client.relayUrl;
      let relayDomain = relayUrl.split("//")[1].split(".");
      relayDomain =
        relayDomain[relayDomain.length - 2] +
        "." +
        relayDomain[relayDomain.length - 1];
      let tempAddr = walletPubkey.slice(-10) + "-" + relayDomain;

      let addr = new URLSearchParams(url).get("lud16");

      if (!(addr || tempAddr)) {
        setIsLoading(false);
        dispatch(
          setToast({
            type: 2,
            desc: t("A4FVHJa"),
          })
        );
        return;
      }

      let nwcNode = {
        id: Date.now(),
        kind: 3,
        entitle: addr || tempAddr,
        active: true,
        data: url,
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
          customHistory("/wallet");
          return;
        } catch (err) {
          updateWallets([nwcNode]);
          customHistory("/wallet");
          return;
        }
      }
      updateWallets([nwcNode]);

      nwc.close();
      setIsLoading(false);
      customHistory("/wallet");
    } catch (err) {
      console.log(err);
      setIsLoading(false);
      dispatch(
        setToast({
          type: 2,
          desc: t("AhM21RA"),
        })
      );
    }
  };

  return (
    <div>
      <div className="fx-centered fit-container fx-start-h fx-start-v ">
        <div
          style={{ width: "min(100%, 600px)" }}
          className="box-pad-h-m box-pad-v"
        >
          <div className="fit-container fx-col fx-centered">
            <Link
              className="fx-centered fx-start-h fit-container"
              href={"/wallet"}
            >
              <div className="round-icon">
                <div className="arrow" style={{ rotate: "90deg" }}></div>
              </div>
            </Link>
            <div className="fx-centered fx-col fx-start-h box-pad-v-m">
              <h4>{t("AO3Hd2n")}</h4>
              <p className="gray-c">{t("Aq8tvve")}</p>
            </div>
            <input
              type="text"
              className="if ifs-full"
              placeholder="nostr+walletconnect:<pubkey>?relay=<relay>&secret=<secret>"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
            <p className="gray-c">
              {t("ARihsdt")}{" "}
              <a
                href="https://nwc.getalby.com"
                className="c1-c"
                style={{ textDecoration: "underline" }}
                target="_blank"
              >
                {t("ArGP8uD")}
              </a>
            </p>
            <button
              className="btn btn-normal btn-full"
              onClick={addNWC}
              disabled={isLoading}
            >
              {isLoading ? <LoadingDots /> : t("Azb0lto")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
