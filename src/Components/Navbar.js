import React, { useState } from "react";
import Link from "next/link";
import MenuMobile from "@/Components/MenuMobile";
import { useSelector } from "react-redux";
import { redirectToLogin } from "@/Helpers/Helpers";
import UserProfilePic from "@/Components/UserProfilePic";
import SearchNetwork from "@/Components/SearchNetwork";

export default function Navbar() {
  const userKeys = useSelector((state) => state.userKeys);
  const [showSearchMobile, setShowSearchMobile] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  if (
    [
      "/yakihonne-mobile-app",
      "/yakihonne-paid-notes",
      "/yakihonne-smart-widgets",
      "/privacy",
      "/terms",
      "/login",
      "/points-system",
      "/write-article",
      "/m/maci-poll",
    ].includes(window.location.pathname) || window.location.pathname.includes("/docs/sw")
  )
    return;
  return (
    <>
      {showMobileMenu && (
        <MenuMobile
          toggleLogin={() => {
            setShowMobileMenu(false);
            redirectToLogin();
          }}
          exit={() => {
            setShowMobileMenu(false);
          }}
        />
      )}
      {showSearchMobile && (
        <SearchNetwork exit={() => setShowSearchMobile(false)} />
      )}
      <div
        className={`fit-container fx-scattered  navbar-mobile box-pad-h-m box-pad-v-m`}
        style={{ borderBottom: "1px solid var(--very-dim-gray)" }}
      >
        <Link href={"/"}>
          <div
            className="yakihonne-logo"
            style={{
              width: "100px",
              height: "50px",
            }}
          ></div>
        </Link>
        <div className="fx-centered">
          <div
            className="menu-toggle"
            onClick={() => setShowSearchMobile(!showSearchMobile)}
          >
            <div className="search-24"></div>
          </div>
          <div
            className={"menu-toggle"}
            onClick={() => setShowMobileMenu(!showMobileMenu)}
          >
            {userKeys ? (
              <UserProfilePic
                allowClick={false}
                mainAccountUser={true}
                allowPropagation={true}
                size={38}
              />
            ) : (
              <div className="menu-24"></div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
