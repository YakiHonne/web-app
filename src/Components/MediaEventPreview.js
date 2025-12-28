import useUserProfile from "@/Hooks/useUsersProfile";
import React from "react";
import Date_ from "./Date_";
import UserProfilePic from "./UserProfilePic";
import { getLinkFromAddr } from "@/Helpers/Helpers";
import Link from "next/link";

export default function MediaEventPreview({ event }) {
  const { userProfile, isNip05Verified } = useUserProfile(event.pubkey);
  let url = getLinkFromAddr(event.naddr || event.nEvent, event.kind);
  return (
    <Link href={url} onClick={(e) => e.stopPropagation()}>
      <div
        style={{
          width: "60%",
          aspectRatio: "9/11",
          backgroundImage: `url(${event.image || event.url})`,
        }}
        className="sc-s-18 bg-img cover-bg fx-centered fx-end-v container-fade-vb"
      >
        <div className="fit-container fx-scattered box-pad-h-m box-pad-v-m">
          <div className="fit-container fx-centered fx-start-h fx-start-v ">
            <div>
              <UserProfilePic
                size={30}
                mainAccountUser={false}
                user_id={userProfile.pubkey}
                img={userProfile.picture}
              />
            </div>
            <div
              className={
                "fit-container fx-centered fx-start-h fx-start-v fx-col"
              }
              style={{ gap: "6px" }}
            >
              <div className="fx-scattered fit-container">
                <div className="fx-centered" style={{ gap: "3px" }}>
                  <div className="fx-centered" style={{ gap: "3px" }}>
                    <p className="p-bold p-one-line" style={{ margin: 0 }}>
                      {userProfile.display_name || userProfile.name}
                    </p>
                    {isNip05Verified && <div className="checkmark-c1"></div>}
                  </div>
                  <p className="gray-c p-medium" style={{ margin: 0 }}>
                    &#8226;
                  </p>
                  <p className="gray-c p-medium" style={{ margin: 0 }}>
                    <Date_
                      toConvert={new Date(event.created_at * 1000)}
                      time={true}
                    />
                  </p>
                </div>
              </div>
              {event.description && (
                <p className="gray-c p-medium p-one-line">{event.description}</p>
              )}
            </div>
          </div>
          {event.kind !== 20 && (
            <svg
              aria-label="Reel"
              fill="white"
              height="24"
              role="img"
              viewBox="0 0 24 24"
              width="24"
              style={{
                boxShadow: "0 0 5px rgba(0, 0, 0, 0.55)",
                borderRadius: "10px",
                backgroundColor: "#888",
              }}
            >
              <path d="M22.942 7.464c-.062-1.36-.306-2.143-.511-2.671a5.366 5.366 0 0 0-1.272-1.952 5.364 5.364 0 0 0-1.951-1.27c-.53-.207-1.312-.45-2.673-.513-1.2-.054-1.557-.066-4.535-.066s-3.336.012-4.536.066c-1.36.062-2.143.306-2.672.511-.769.3-1.371.692-1.951 1.272s-.973 1.182-1.27 1.951c-.207.53-.45 1.312-.513 2.673C1.004 8.665.992 9.022.992 12s.012 3.336.066 4.536c.062 1.36.306 2.143.511 2.671.298.77.69 1.373 1.272 1.952.58.581 1.182.974 1.951 1.27.53.207 1.311.45 2.673.513 1.199.054 1.557.066 4.535.066s3.336-.012 4.536-.066c1.36-.062 2.143-.306 2.671-.511a5.368 5.368 0 0 0 1.953-1.273c.58-.58.972-1.181 1.27-1.95.206-.53.45-1.312.512-2.673.054-1.2.066-1.557.066-4.535s-.012-3.336-.066-4.536Zm-7.085 6.055-5.25 3c-1.167.667-2.619-.175-2.619-1.519V9c0-1.344 1.452-2.186 2.619-1.52l5.25 3c1.175.672 1.175 2.368 0 3.04Z"></path>
            </svg>
          )}
        </div>
      </div>
    </Link>
  );
}
