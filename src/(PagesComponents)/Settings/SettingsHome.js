import React, { useState } from "react";
import PagePlaceholder from "@/Components/PagePlaceholder";
import { useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import KeysManagement from "./KeysManagement";
import RelaysManagement from "./RelaysManagement";
import LanguagesManagement from "./LanguagesManagement";
import ContentModerationManagement from "./ContentModerationManagement";
import WalletsManagement from "./WalletsManagement";
import CustomizationManagement from "./CustomizationManagement";
import CacheManagement from "./CacheManagement";
import ThemeManagement from "./ThemeManagement";
import SettingsFooter from "./SettingsFooter";
import { useTranslation } from "react-i18next";
import SettingsHeader from "./SettingsHeader";
import YakiChestManagement from "./YakiChestManagement";
import UserLogout from "./UserLogout";
import { useRouter } from "next/router";

export default function SettingsHome() {
  const router = useRouter();
  const { query } = router;
  const { t } = useTranslation();
  const userMetadata = useSelector((state) => state.userMetadata);
  const userKeys = useSelector((state) => state.userKeys);
  const [selectedTab, setSelectedTab] = useState(query.tab || "");

  return (
    <>
      <div>
        {/* <Helmet>
        <title>Yakihonne | Settings</title>
        <meta
          name="description"
          content={"Customize your Yakihonne experience with powerful privacy and interface options. Take control of your digital presence on the Nostr network.."}
        />
        <meta
          property="og:description"
          content={"Customize your Yakihonne experience with powerful privacy and interface options. Take control of your digital presence on the Nostr network.."}
        />
        <meta
          property="og:image"
          content="https://yakihonne.s3.ap-east-1.amazonaws.com/media/images/thumbnail.png"
        />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="700" />
        <meta property="og:url" content={`https://yakihonne.com/settings`} />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="Yakihonne" />
        <meta property="og:title" content="Yakihonne | Settings" />
        <meta property="twitter:title" content="Yakihonne | Settings" />
        <meta
          property="twitter:description"
          content={"Customize your Yakihonne experience with powerful privacy and interface options. Take control of your digital presence on the Nostr network.."}
        />
        <meta
          property="twitter:image"
          content="https://yakihonne.s3.ap-east-1.amazonaws.com/media/images/thumbnail.png"
        />
        </Helmet> */}

        <div className="fx-centered fit-container  fx-start-v ">
          <div className="main-middle">
            {userMetadata &&
              (userKeys.sec || userKeys.ext || userKeys.bunker) && (
                <>
                  <h3 className="box-pad-h box-pad-v-m">{t("ABtsLBp")}</h3>
                  <SettingsHeader userKeys={userKeys} />
                  <div
                    className="fit-container fx-centered fx-col"
                    style={{ gap: 0 }}
                  >
                    <KeysManagement
                      selectedTab={selectedTab}
                      setSelectedTab={setSelectedTab}
                      userKeys={userKeys}
                    />
                    <RelaysManagement
                      selectedTab={selectedTab}
                      setSelectedTab={setSelectedTab}
                    />
                    <LanguagesManagement
                      selectedTab={selectedTab}
                      setSelectedTab={setSelectedTab}
                      userKeys={userKeys}
                    />
                    <ContentModerationManagement
                      selectedTab={selectedTab}
                      setSelectedTab={setSelectedTab}
                      userKeys={userKeys}
                    />
                    <WalletsManagement
                      selectedTab={selectedTab}
                      setSelectedTab={setSelectedTab}
                      userKeys={userKeys}
                    />
                    <CustomizationManagement
                      selectedTab={selectedTab}
                      setSelectedTab={setSelectedTab}
                      userKeys={userKeys}
                      state={query}
                    />
                    <CacheManagement
                      selectedTab={selectedTab}
                      setSelectedTab={setSelectedTab}
                    />
                    <ThemeManagement
                      selectedTab={selectedTab}
                      setSelectedTab={setSelectedTab}
                    />
                    <YakiChestManagement />
                    <UserLogout />
                    <SettingsFooter userKeys={userKeys} />
                  </div>
                </>
              )}
            {userMetadata &&
              !userKeys.sec &&
              !userKeys.ext &&
              !userKeys.bunker && (
                <PagePlaceholder page={"nostr-unauthorized"} />
              )}
            {!userMetadata && <PagePlaceholder page={"nostr-not-connected"} />}
          </div>
        </div>
      </div>
    </>
  );
}
