import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import dynamic from "next/dynamic";
import Slider from "@/Components/Slider";

const RedPacketEnv = dynamic(() => import("../RedPacketEnv"), { ssr: false });

export default function RedPacketEnvPicker({ setStep, img, setImg }) {
  const { t } = useTranslation();
  const covers = [
    "",
    "https://yakihonne.s3.ap-east-1.amazonaws.com/redpacket/cover-1.jpg",
    "https://yakihonne.s3.ap-east-1.amazonaws.com/redpacket/cover-7.jpg",
    "https://yakihonne.s3.ap-east-1.amazonaws.com/redpacket/cover-2.jpg",
    "https://yakihonne.s3.ap-east-1.amazonaws.com/redpacket/cover-8.jpg",
    "https://yakihonne.s3.ap-east-1.amazonaws.com/redpacket/cover-3.jpg",
    "https://yakihonne.s3.ap-east-1.amazonaws.com/redpacket/cover-9.jpg",
    "https://yakihonne.s3.ap-east-1.amazonaws.com/redpacket/cover-4.jpg",
    "https://yakihonne.s3.ap-east-1.amazonaws.com/redpacket/cover-5.jpg",
    "https://yakihonne.s3.ap-east-1.amazonaws.com/redpacket/cover-10.jpg",
    "https://yakihonne.s3.ap-east-1.amazonaws.com/redpacket/cover-6.jpg",
  ];
  const items = useMemo(() => {
    return covers.map((item, index) => {
      return (
        <div
          key={index}
          className="fit-container bg-img cover-bg sc-s-18 pointer"
          style={{
            backgroundImage: `url(${item})`,
            width: "80px",
            aspectRatio: "9/16",
          }}
          onClick={() => setImg(item)}
        ></div>
      );
    });
  }, []);
  return (
    <div className="fit-container">
      <div className="fit-container fx-centered fx-col box-pad-v-m">
        <p className="c1-c">{t("AgMtdxy")}</p>
        <RedPacketEnv data={{ img }} preview={true} />
      </div>
      <div className="fit-container box-pad-v">
        <Slider items={items} slideBy={80} />
      </div>
      <button className="btn btn-normal btn-full" onClick={() => setStep(1)}>
        {t("AgGi8rh")}
      </button>
    </div>
  );
}
