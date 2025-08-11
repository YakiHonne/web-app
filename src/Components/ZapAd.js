import React, { useEffect, useMemo, useState } from "react";
import UserProfilePic from "@/Components/UserProfilePic";
import NumberShrink from "@/Components/NumberShrink";
import { useSelector } from "react-redux";
import { checkForLUDS, getEmptyuserMetadata } from "@/Helpers/Encryptions";
import { getUser } from "@/Helpers/Controlers";
import { saveUsers } from "@/Helpers/DB";
import OptionsDropdown from "@/Components/OptionsDropdown";
import ZapTip from "@/Components/ZapTip";
import InitiConvo from "@/Components/InitConvo";

const getZaps = (zappers, pubkey) => {
  let sats = zappers.reduce(
    (total, item) =>
      item.pubkey === pubkey ? (total += item.amount) : (total = total),
    0
  );
  let content = zappers
    .filter((_) => _.pubkey === pubkey)
    .find((_) => _.content);
  return { amount: Math.floor(sats), content: content?.content || "" };
};

const sortZappers = (zappers) => {
  let pubkeys = [...new Set(zappers.map((_) => _.pubkey))];

  let stats = pubkeys.map((_) => {
    let stats = getZaps(zappers, _);
    return { pubkey: _, ...stats };
  });

  return stats.sort((a, b) => b.amount - a.amount);
};

export default function ZapAd({
  zappers = [],
  onClick = () => null,
  margin = true,
}) {
  const sortedZappers = useMemo(() => {
    return sortZappers(zappers);
  }, [zappers]);
  let highest = sortedZappers[0];

  let rankedZappers = useMemo(() => {
    let tempArray = structuredClone(sortedZappers);
    return tempArray.splice(1, 4) || [];
  }, []);

  useEffect(() => {
    let tempArray = structuredClone(sortedZappers);
    let sorted = tempArray.splice(0, 4) || [];
    if (sorted.length > 0) {
      let pubkeys = [...new Set(sorted.map((_) => _.pubkey))];
      saveUsers(pubkeys);
    }
  }, []);

  return (
    <div
      className="fit-container fx-scattered"
      style={{
        marginTop: margin ? "1rem" : 0,
        position: "relative",
        zIndex: 1,
      }}
    >
      <HighestZapper data={highest} onClick={onClick} />
      {rankedZappers.length > 0 && (
        <RankedZappers users={rankedZappers} onClick={onClick} />
      )}
    </div>
  );
}

const HighestZapper = ({ data, onClick }) => {
  const userKeys = useSelector((state) => state.userKeys);
  const nostrAuthors = useSelector((state) => state.nostrAuthors);
  const [author, setAuthor] = useState(getEmptyuserMetadata(data.pubkey));
  const [initConv, setInitConv] = useState(false);

  useEffect(() => {
    let auth = getUser(data.pubkey);
    if (auth) setAuthor(auth);
  }, [nostrAuthors]);

  return (
    <>
      {initConv && (
        <InitiConvo exit={() => setInitConv(false)} receiver={author.pubkey} />
      )}

      <div className="fx-centered pointer" onClick={onClick}>
        <div
          className="fx-centered"
          style={{ position: "relative", zIndex: 1, gap: 0 }}
        >
          <UserProfilePic
            img={author.picture}
            user_id={data.pubkey}
            allowPropagation={true}
            size={30}
            allowClick={false}
          />
          <div className="fx-centered" style={{ width: "8px" }}>
            <hr style={{ borderBottom: " 3px solid var(--pale-gray)" }} />
            <hr />
          </div>
          <div
            style={{
              height: "30px",
              borderRadius: "20px",
              cursor: "inherit",
              border: "none",
              backgroundColor: "var(--dim-gray)",
              overflow: "visible",
              gap: 0,
            }}
            className="box-pad-h-s box-pad-v-s sc-s fx-centered"
          >
            <div
              className="fx-centered"
              style={{
                position: "relative",
                zIndex: 3,
                minHeight: "30px",
                borderRadius: "32px",
              }}
            >
              <div className="fx-centered">
                <div className="bolt-bold"></div>
                <div style={{ border: "none" }}>
                  <p className="c1-c" style={{ minWidth: "max-content" }}>
                    <NumberShrink value={data.amount} />
                  </p>
                </div>
              </div>
              {data.content && <p className="p-one-line">{data.content}</p>}
            </div>
            <div onClick={(e) => e.stopPropagation()}>
              <OptionsDropdown
                vertical={false}
                options={[
                  <div key="zap-options" style={{ position: "relative" }} className="fx-centered">
                    <div
                      className="round-icon-small round-icon-tooltip"
                      data-tooltip={"Message"}
                      style={{ borderColor: "var(--gray)", border: "none" }}
                      onClick={() => setInitConv(true)}
                    >
                      <div className="env"></div>
                    </div>
                    <div
                      className="round-icon-small"
                      style={{ borderColor: "var(--gray)", border: "none" }}
                    >
                      <ZapTip
                        recipientLNURL={checkForLUDS(
                          author.lud16,
                          author.lud06
                        )}
                        recipientPubkey={author.pubkey}
                        senderPubkey={userKeys.pub}
                        recipientInfo={author}
                        smallIcon={true}
                      />
                    </div>
                  </div>,
                ]}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

const RankedZappers = ({ users, onClick }) => {
  const nostrAuthors = useSelector((state) => state.nostrAuthors);
  const ranked = useMemo(() => {
    return users.map((_) => {
      let metadata = getUser(_.pubkey) || getEmptyuserMetadata(_.pubkey);
      return metadata;
    });
  }, [nostrAuthors]);

  return (
    <div className="fx-centered fx-end-h slide-right" onClick={onClick}>
      <div className="fx-centered" style={{ gap: 0 }}>
        {ranked.map((user, index) => {
          return (
            <div
              key={index}
              style={{
                transform: `translateX(${8 * (ranked.length - 1 - index)}px)`,
                outline: "2px solid var(--white)",
                borderRadius: "50%",
              }}
            >
              <UserProfilePic
                user_id={user?.pubkey}
                size={25}
                mainAccountUser={false}
                allowPropagation={true}
                img={user.picture}
                allowClick={false}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};
