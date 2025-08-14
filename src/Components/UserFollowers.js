import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { getUserFollowers } from "@/Helpers/WSInstance";
import { getuserMetadata } from "@/Helpers/Encryptions";
import { getSubData } from "@/Helpers/Controlers";
import ShowPeople from "@/Components/ShowPeople";
import NumberShrink from "@/Components/NumberShrink";

export default function UserFollowers({
  id,
  followersCount,
  expand = false,
  exit,
}) {
  const { t } = useTranslation();
  const [followers, setFollowers] = useState([]);
  const [showPeople, setShowPeople] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
      if (!isLoading) setIsLoading(true);
      let userFollowers = await getUserFollowers(id);
      if (userFollowers) {
        userFollowers = userFollowers
          .filter((_) => _.kind === 0)
          .map((_) => {
            return getuserMetadata(_);
          });
        setFollowers(userFollowers);
      } else {
        let data = await getSubData([{ kinds: [3], "#p": [id] }], 50);

        let users = await getSubData([
          { kinds: [0], authors: [...new Set(data.pubkeys)] },
          50,
        ]);

        userFollowers = users.data
          .filter((user, index, arr) => {
            if (arr.findIndex((_) => _.pubkey === user.pubkey) === index)
              return user;
          })
          .map((_) => {
            return getuserMetadata(_);
          });
        setFollowers(userFollowers);
      }
    };
    if (showPeople || expand) fetchData();
  }, [showPeople]);

  useEffect(() => {
    setShowPeople(false);
  }, [id]);

  if (expand)
    return <ShowPeople exit={exit} list={followers} type={"followers"} />;

  return (
    <>
      {showPeople === "followers" && (
        <ShowPeople
          exit={() => setShowPeople(false)}
          list={followers}
          type={showPeople}
        />
      )}
      <div className="pointer" onClick={() => setShowPeople("followers")}>
        <p>
          <NumberShrink value={followersCount} />{" "}
          <span className="gray-c">{t("A6huCnT")}</span>
        </p>
      </div>
    </>
  );
}
