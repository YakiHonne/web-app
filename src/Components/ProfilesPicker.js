import React, { useEffect, useRef, useState } from "react";
import { getConnectedAccounts } from "@/Helpers/ClientHelpers";
import { useSelector } from "react-redux";
import UserProfilePic from "@/Components/UserProfilePic";

export default function ProfilesPicker({ setSelectedProfile }) {
  const userKeys = useSelector((state) => state.userKeys);
  const connectedAccounts = getConnectedAccounts();
  const [chosenAccount, setChosenAccount] = useState(false);
  const [showconnectedAccounts, setShowConnectedAccounts] = useState(false);

  const containerRef = useRef(null);

  useEffect(() => {
    const handleOffClick = (e) => {
      e.stopPropagation();
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setShowConnectedAccounts(false);
      }
    };
    document.addEventListener("mousedown", handleOffClick);
    return () => {
      document.removeEventListener("mousedown", handleOffClick);
    };
  }, [containerRef]);

  const handleChosenAccount = (account) => {
    setChosenAccount(account);
    setShowConnectedAccounts(false);
    if (account?.userKeys) setSelectedProfile(account?.userKeys);
  };
  return (
    <div style={{ position: "relative" }} ref={containerRef}>
      <div
        onClick={() =>
          connectedAccounts.length > 1
            ? setShowConnectedAccounts(!showconnectedAccounts)
            : null
        }
      >
        <UserProfilePic
          size={34}
          mainAccountUser={!chosenAccount}
          allowClick={false}
          allowPropagation={true}
          img={chosenAccount ? chosenAccount.picture : ""}
        />
      </div>
      {connectedAccounts.length > 1 && (
        <div
          style={{
            position: "absolute",
            top: showconnectedAccounts ? "42px" : "34px",
            left: showconnectedAccounts ? "-25%" : 0,
            borderRadius: "18px"
          }}
          className={showconnectedAccounts ? "box-pad-h-s sc-s" : ""}
        >
          <div
            className="fx-centered fx-col box-pad-v-s"
            style={{ borderTop: "1px solid var(-gray)", minWidth: "34px" }}
          >
            {showconnectedAccounts &&
              connectedAccounts.map((user, index) => {
                if (
                  (!chosenAccount && user.pubkey !== userKeys.pub) ||
                  (chosenAccount && user.pubkey !== chosenAccount.pubkey)
                )
                  return (
                    <div
                      key={user.pubkey}
                      className="slide-down"
                      style={{ animationDelay: `calc(0s + 0.0${index - 1}s)` }}
                      onClick={() => handleChosenAccount(user)}
                    >
                      <UserProfilePic
                        size={34}
                        mainAccountUser={false}
                        allowClick={false}
                        allowPropagation={true}
                        img={user.picture}
                      />
                    </div>
                  );
              })}
            <div
              onClick={() => setShowConnectedAccounts(!showconnectedAccounts)}
            >
              {!showconnectedAccounts && <div className="arrow slide-up"></div>}
              {showconnectedAccounts && (
                <div className="round-icon-small">
                  <div
                    className="arrow slide-down"
                    style={{
                      animationDelay: `calc(0.01s * ${connectedAccounts.length} + 0.01s)`,
                      rotate: "180deg",
                    }}
                  ></div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
