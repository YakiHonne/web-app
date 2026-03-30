import React, { useState } from "react";
import Link from "next/link";
import MenuMobile from "@/Components/MenuMobile";
import { useSelector } from "react-redux";
import { redirectToLogin } from "@/Helpers/Helpers";
import UserProfilePic from "@/Components/UserProfilePic";
import SearchNetwork from "@/Components/SearchNetwork";
import { useRouter } from "next/router";
import Icon from "@/Components/Icon";

export default function Navbar() {
  const userKeys = useSelector((state) => state.userKeys);
  const router = useRouter();
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
      "/m/maci-poll",
      "/docs/sw/[keyword]",
    ].includes(router.pathname)
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
          <Icon name="yakihonne-logo" width={100} height={50} />
        </Link>
        <div className="fx-centered">
          <div
            className="menu-toggle"
            onClick={() => setShowSearchMobile(!showSearchMobile)}
          >
            <Icon name="search" size={24} />
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
              <Icon name="menu" size={24} />
            )}
          </div>
        </div>
      </div>
    </>
  );
}
