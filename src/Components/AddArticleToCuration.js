
import React, { useEffect, useState } from "react";
import { getParsedRepEvent } from "@/Helpers/Encryptions";
import AddCuration from "@/Components/AddCuration";
import { setToPublish } from "@/Store/Slides/Publishers";
import { useDispatch, useSelector } from "react-redux";
import { ndkInstance } from "@/Helpers/NDKInstance";
import { useTranslation } from "react-i18next";

export default function AddArticleToCuration({ kind = 30004, d, exit }) {
  const dispatch = useDispatch();
  const userKeys = useSelector((state) => state.userKeys);
  const userMetadata = useSelector((state) => state.userMetadata);

  const { t } = useTranslation();
  const [curations, setCurations] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [showAddCuration, setShowAddCuration] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        let sub = ndkInstance.subscribe(
          [{ kinds: [kind], authors: [userKeys.pub] }],
          { closeOnEose: true, cacheUsage: "CACHE_FIRST" }
        );

        sub.on("event", (curation) => {
          let parsedCuration = getParsedRepEvent(curation);
          setCurations((prev) => {
            let index = prev.findIndex((item) => item.d === parsedCuration.d);
            let tempArray = Array.from(prev);
            if (index !== -1) {
              tempArray.splice(index, 1);
              return [parsedCuration, ...tempArray];
            }
            return [...tempArray, parsedCuration];
          });

          setIsLoaded(true);
        });
        sub.on("eose", () => {
          setIsLoaded(true);
        });
      } catch (err) {
        console.log(err);
      }
    };
    if (userKeys && userMetadata) {
      fetchData();
      return;
    }
    if (!userKeys && userMetadata) {
      setIsLoaded(true);
    }
  }, [userKeys, userMetadata]);

  const checkArticleInCuration = (list) => {
    return list.find((item) => item === d);
  };

  const saveUpdate = async (curation, selectedRelays) => {
    let tempTags = [
      [
        "client",
        "Yakihonne",
        "31990:20986fb83e775d96d188ca5c9df10ce6d613e0eb7e5768a0f0b12b37cdac21b3:1700732875747",
      ],
    ];
    let is_published_at = curation.tags.find(
      (item) => item[0] === "published_at"
    );
    let published_at = is_published_at
      ? is_published_at[1]
      : `${Math.floor(Date.now() / 1000)}`;
    tempTags.push(["d", curation.tags.find((item) => item[0] === "d")[1]]);
    tempTags.push([
      "title",
      curation.tags.find((item) => item[0] === "title")[1],
    ]);
    tempTags.push(["published_at", published_at]);
    tempTags.push([
      "description",
      curation.tags.find((item) => item[0] === "description")[1],
    ]);
    tempTags.push([
      "image",
      curation.tags.find((item) => item[0] === "image")[1],
    ]);
    for (let art of curation.items) tempTags.push(["a", art, ""]);
    tempTags.push(["a", d, ""]);

    dispatch(
      setToPublish({
        userKeys: userKeys,
        kind: kind,
        content: "",
        tags: tempTags,
        allRelays: selectedRelays,
      })
    );
    exit();
  };

  return (
    <>
      {showAddCuration && (
        <AddCuration
          exit={() => setShowAddCuration(false)}
          mandatoryKind={kind}
        />
      )}
      <div
        className="fixed-container fx-centered box-pad-h"
        onClick={(e) => {
          e.stopPropagation();
          exit();
        }}
      >
        <section
          className="sc-s-18 bg-sp box-pad-h box-pad-v fx-centered"
          style={{ width: "min(100%, 500px)", position: "relative" }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="close" onClick={exit}>
            <div></div>
          </div>
          <div className="fx-centered fx-col fit-container">
            <h4 className="box-marg-s">Add to curation</h4>
            <div
              className="fx-centered fx-col fit-container fx-start-h "
              style={{
                maxHeight: "60vh",
                overflow: "scroll",
                overflowX: "hidden",
              }}
            >
              {isLoaded && curations.length === 0 && (
                <div className="fx-centered" style={{ marginTop: "1rem" }}>
                  <p className="gray-c">{t("AAUycZW")}</p>
                </div>
              )}
              {!isLoaded && (
                <div
                  className="box-pad-h fx-centered skeleton-container if fit-container"
                  style={{
                    marginTop: "1rem",
                    backgroundColor: "var(--dim-gray)",
                    border: "none",
                  }}
                ></div>
              )}
              {curations.map((curation) => {
                let status = checkArticleInCuration(curation.items);
                return (
                  <div
                    key={curation.id}
                    className={`fit-container fx-scattered box-pad-h-s box-pad-v-s sc-s-18 bg-sp fx-shrink pointer`}
                    onClick={
                      status
                        ? null
                        : () => {
                            saveUpdate(curation, curation.seenOn);
                          }
                    }
                    style={{ opacity: status ? ".7" : "1" }}
                  >
                    <div
                      className="fx-centered fx-start-h "
                      style={{ width: "calc(100% - 45px)" }}
                    >
                      <div
                        className="bg-img cover-bg"
                        style={{
                          aspectRatio: "1/1",
                          minWidth: "40px",
                          borderRadius: "var(--border-r-50)",
                          backgroundImage: `url(${curation.image})`,
                          backgroundColor: "var(--dim-gray)",
                        }}
                      ></div>
                      <div>
                        <p className="p-one-line">{curation.title}</p>
                        <div className="fx-centered fx-start-h">
                          <p className="gray-c p-medium">
                            {t("A04okTg", { count: curation.items.length })}
                          </p>
                          {status && (
                            <p className="p-medium orange-c">
                              ({t("Aw0t3W3")})
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                    {!status && (
                      <div
                        style={{
                          minWidth: "30px",
                          aspectRatio: "1/1",
                        }}
                        className="fx-centered"
                      >
                        <p className="gray-c p-big">&#xFF0B;</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            {/* <div
              className="sc-s-d fit-container if pointer fx-centered"
              onClick={() => setShowAddCuration(true)}
            >
              {" "}
              <p className="gray-c">{t("AL8U8hq")}</p>{" "}
              <p className="gray-c p-big">&#xFF0B;</p>
            </div> */}
          </div>
        </section>
      </div>
    </>
  );
}
