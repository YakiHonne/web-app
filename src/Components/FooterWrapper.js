import React from "react";
import { useTranslation } from "react-i18next";
import Link from "next/link";

export default function FooterWrapper() {
  const { t } = useTranslation();
  return (
    <div className="box-pad-h fx-scattered fx-wrap">
      <div className="fx-centered fx-wrap fx-start-h">
        <Link href={"/privacy"} target="_blank">
          <p className="p-medium gray-c">{t("AH6LUz3")}</p>
        </Link>
        <p className="p-small gray-c">&#9679;</p>
        <Link href={"/terms"} target="_blank">
          <p className="p-medium gray-c">{t("A5LsZ43")}</p>
        </Link>
        <p className="p-small gray-c">&#9679;</p>
        <Link href={"/points-system"} target="_blank">
          <p className="p-medium gray-c">{t("Af8As64")}</p>
        </Link>
        <p className="p-small gray-c">&#9679;</p>
        <Link href={"/yakihonne-smart-widgets"} target="_blank">
          <p className="p-medium gray-c">{t("A2mdxcf")}</p>
        </Link>
        <p className="p-small gray-c">&#9679;</p>
        <Link href={"/yakihonne-paid-notes"} target="_blank">
          <p className="p-medium gray-c">{t("AnI56Th")}</p>
        </Link>
        <p className="p-small gray-c">&#9679;</p>
        <Link href={"/yakihonne-mobile-app"} target="_blank">
          <p className="p-medium gray-c">{t("Ai28b6B")}</p>
        </Link>
      </div>
      <div className="fx-centered fx-wrap fx-start-h">
        <p className="p-medium gray-c">
          {t("Am8bwOh", { year: new Date().getFullYear() })}
        </p>
        <div className="fx-centered fx-wrap">
          <Link
            href={
              "/profile/nprofile1qqszpxr0hql8whvk6xyv5hya7yxwd4snur4hu4mg5rctz2ehekkzrvcpr3mhxue69uhkummnw3ez6vp39eukz6mfdphkumn99e3k7mgpr3mhxue69uhkummnw3ez6vpj9eukz6mfdphkumn99e3k7mgpremhxue69uhkummnw3ez6vpn9ejx7unpveskxar0wfujummjvuq3gamnwvaz7tmjv4kxz7fwv3sk6atn9e5k7qg7waehxw309ahx7um5wgknqv3wv3hhyctxv93hgmmj0yhx7un8h5udgj"
            }
            target="_blank"
          >
            <div className="nostr-icon"></div>
          </Link>
          <p className="p-small gray-c">&#9679;</p>

          <a href="https://t.me/YakiHonne" target="_blank">
            <div className="msg-icon"></div>
          </a>
          <p className="p-small gray-c">&#9679;</p>

          <a href="https://t.me/YakiHonne_Daily_Featured/1" target="_blank">
            <div className="telegram-logo"></div>
          </a>

          <p className="p-small gray-c">&#9679;</p>

          <a href="https://twitter.com/YakiHonne" target="_blank">
            <div className="twitter-logo"></div>
          </a>
        </div>
      </div>
    </div>
  );
}
