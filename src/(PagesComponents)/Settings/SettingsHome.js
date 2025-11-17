import React, { useEffect, useState } from "react";
import PagePlaceholder from "@/Components/PagePlaceholder";
import { useSelector } from "react-redux";
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
import Notifications from "./Notifications";
import { getSubData } from "@/Helpers/Controlers";

export default function SettingsHome() {
  const router = useRouter();
  const { query } = router;
  const { t } = useTranslation();
  const userMetadata = useSelector((state) => state.userMetadata);
  const userKeys = useSelector((state) => state.userKeys);
  const [selectedTab, setSelectedTab] = useState(query.tab || "");

  useEffect(() => {
    if (query.tab) setSelectedTab(query.tab || "");
  }, [query]);

  return (
    <>
      <div>
        <div
          className="fx-centered fit-container fx-start-v"
          style={{ gap: 0 }}
        >
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
                    <Notifications
                      selectedTab={selectedTab}
                      setSelectedTab={setSelectedTab}
                    />

                    <LanguagesManagement
                      selectedTab={selectedTab}
                      setSelectedTab={setSelectedTab}
                      userKeys={userKeys}
                    />
                    <ThemeManagement
                      selectedTab={selectedTab}
                      setSelectedTab={setSelectedTab}
                    />
                    <CacheManagement
                      selectedTab={selectedTab}
                      setSelectedTab={setSelectedTab}
                    />
                    <YakiChestManagement />
                    <UserLogout />
                    <hr />
                    <div className="box-pad-h-m box-pad-v-m desk-hide-1000 fit-container">
                      <SettingsFooter userKeys={userKeys} />
                    </div>
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
          <div className="extras-homepage">
            <SettingsFooter userKeys={userKeys} />
          </div>
        </div>
      </div>
    </>
  );
}
