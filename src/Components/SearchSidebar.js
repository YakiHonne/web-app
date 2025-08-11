import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import SearchNetwork from "@/Components/SearchNetwork";

export default function SearchSidebar() {
  const { t } = useTranslation();
  const [showSearchPage, setSearchPage] = useState(false);
  return (
    <>
      {showSearchPage && <SearchNetwork exit={() => setSearchPage(false)} />}
      <div
        onClick={() => setSearchPage(true)}
        className={`pointer fit-container fx-start-h fx-centered box-pad-h-s box-pad-v-s inactive-link`}
      >
        <div className={"search-24"}></div>
        <div className="link-label">{t("Ap6NR3x")}</div>
      </div>
    </>
  );
}
