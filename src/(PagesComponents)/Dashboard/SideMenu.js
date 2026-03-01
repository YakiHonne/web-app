import React from "react";
import SideMenuDesktop from "./SideMenuDesktop";
import SideMenuMobile from "./SideMenuMobile";

export default function SideMenu({ setSelectedTab, selectedTab }) {
  return (
    <>
      <SideMenuDesktop
        setSelectedTab={setSelectedTab}
        selectedTab={selectedTab}
      />
      <SideMenuMobile
        setSelectedTab={setSelectedTab}
        selectedTab={selectedTab}
      />
    </>
  );
}
