import useUserProfile from "@/Hooks/useUsersProfile";
import React from "react";
import UserProfilePic from "../UserProfilePic";
import RatingPreview from "./RatingPreview";
import Date_ from "../Date_";

export default function RelayReviewCard({ review }) {
  const { userProfile } = useUserProfile(review.pubkey);
  return (
    <div
      className="fx-centered fx-col fx-start-h fx-start-v sc-s-18 bg-sp box-pad-h-m box-pad-v-m fit-height"
      style={{ width: "400px" }}
    >
      <div className="fit-container fx-scattered">
        <div className="fx-centered">
          <div>
            <UserProfilePic
              user_id={userProfile.pubkey}
              img={userProfile.picture}
              size={48}
            />
          </div>
          <div>
            <p className="gray-c p-medium" style={{ margin: 0 }}>
              <Date_
                toConvert={new Date(review.created_at * 1000)}
                time={true}
              />
            </p>
            <p>{userProfile.display_name || userProfile.name}</p>
          </div>
        </div>
        <div>
          <RatingPreview rating={review.rating} small={true} />
        </div>
      </div>
      <p>{review.content}</p>
    </div>
  );
}
