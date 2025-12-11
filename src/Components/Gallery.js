import React, { useEffect, useState } from "react";
import { getSubData } from "@/Helpers/Controlers";
import { bytesTohex, encodeBase64URL } from "@/Helpers/Encryptions";
import { finalizeEvent, generateSecretKey } from "nostr-tools";
import axios from "axios";
import Carousel from "@/Components/Carousel";
import useToBlurMedia from "@/Hooks/useToBlurMedia";
import BlurredContentDesc from "./BlurredContentDesc";

export default function Gallery({ imgs, pubkey, noBlur = false }) {
  const [carouselItems, setCarouselItems] = useState(imgs);
  const [currentImg, setCurrentImg] = useState(0);
  const [showCarousel, setShowCarousel] = useState(false);
  const { toBlur, setIsOpened } = useToBlurMedia({ pubkey, noBlur });
  useEffect(() => {
    const checkImages = async () => {
      if (imgs.length > 0 && pubkey) {
        const imagePromises = imgs.map((img, index) => {
          return new Promise((resolve, reject) => {
            const imgElement = new Image();
            let fileName = img.split("/").pop();
            fileName = fileName.split(".")[0];
            let toCheck = isValidSha256(fileName);
            if (toCheck) {
              imgElement.src = img;
              imgElement.onload = () => resolve(img);
              imgElement.onerror = () =>
                resolve({
                  img,
                  index,
                  status: false,
                  toCheck: isValidSha256(fileName),
                  fileName,
                });
            } else resolve(img);
          });
        });

        try {
          let res = await Promise.all(imagePromises);
          res = res.filter((_) => _.status === false && _.toCheck === true);
          if (res.length > 0) {
            let serversEvent = await getSubData([
              {
                kinds: [10063],
                authors: [pubkey],
              },
            ]);
            if (serversEvent.data.length > 0) {
              let servers = serversEvent.data[0].tags
                .filter((_) => _[0] === "server")
                .map((_) => _[1]);
              if (servers && servers.length > 0) {
                let fetchedImgs = await Promise.allSettled(
                  res.map(async (item) => {
                    let encodeB64 = authorizationEvent(item.fileName);
                    let images = await Promise.allSettled(
                      servers.map(async (server) => {
                        try {
                          let imageURL = await axios.get(
                            `${server}/${item.fileName}`,
                            {
                              responseType: "arraybuffer",
                              headers: {
                                Authorization: `Nostr ${encodeB64}`,
                              },
                            }
                          );
                          const mimeType = imageURL.headers["content-type"];
                          const base64 = btoa(
                            new Uint8Array(imageURL.data).reduce(
                              (data, byte) => data + String.fromCharCode(byte),
                              ""
                            )
                          );

                          return `data:${mimeType};base64,${base64}`;
                        } catch (err) {
                          console.log(err);
                          return "";
                        }
                      })
                    );
                    images = images
                      .filter((_) => _.status === "fulfilled")
                      .map((_) => _.value);
                    return {
                      ...item,
                      newImg: images.length > 0 ? images[0] : "",
                    };
                  })
                );
                fetchedImgs = fetchedImgs
                  .filter((_) => _.status === "fulfilled")
                  .map((_) => _.value);
                setCarouselItems((prev) =>
                  prev.map((item, index) => {
                    let isThere = fetchedImgs.find((el) => el.index === index);
                    if (isThere) {
                      return isThere.newImg ? isThere.newImg : item;
                    }
                    return item;
                  })
                );
              }
            }
          }
        } catch (error) {
          console.error("Error loading images:", error);
        }
      }
    };

    checkImages();
  }, []);

  const isValidSha256 = (hash) => {
    if (typeof hash !== "string" || hash.length !== 64) {
      return false;
    }

    const hexRegex = /^[0-9a-fA-F]{64}$/;
    return hexRegex.test(hash);
  };

  const authorizationEvent = (fileName) => {
    const secKey = bytesTohex(generateSecretKey());
    let expiration = `${Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7}`;
    let event = {
      kind: 24242,
      content: "Get image",
      created_at: 1708771927,
      tags: [
        ["t", "get"],
        ["expiration", expiration],
        ["x", fileName],
      ],
    };
    event = finalizeEvent(event, secKey);
    let encodeB64 = encodeBase64URL(JSON.stringify(event));

    return encodeB64;
  };

  const handleUnblur = (e) => {
    e.stopPropagation();
    // setIsOpened(true);
  };
  const handleOpenImage = (e, index) => {
    e.stopPropagation();
    e.preventDefault();
    setCurrentImg(index);
    setShowCarousel(true);
  };
  return (
    <>
      {showCarousel && (
        <Carousel
          imgs={carouselItems}
          selectedImage={currentImg}
          back={(e) => {
            e.stopPropagation();
            e.preventDefault();
            setShowCarousel(false);
          }}
        />
      )}
      {carouselItems.length === 1 && (
        <div
          className="image-grid blur-box"
          style={{ margin: ".5rem 0 .5rem 0", maxWidth: "95%", opacity: 1 }}
          // onClick={handleUnblur}
          onClick={(e) => {
            e.preventDefault();
            handleOpenImage(e, 0);
          }}
        >
          <img
            onClick={(e) => {
              handleOpenImage(e, 0);
            }}
            className={!toBlur ? "sc-s-18" : "blurred sc-s-18"}
            style={{
              cursor: "zoom-in",
              maxWidth: "100%",
              objectFit: "fit",
              maxHeight: "600px",
              // pointerEvents: toBlur ? "none" : "auto",
            }}
            src={carouselItems[0]}
            alt="el"
            // loading="lazy"
          />

          <BlurredContentDesc toBlur={toBlur} />
        </div>
      )}
      {carouselItems.length > 1 && (
        <div
          className="fx-centered fx-start-h fx-wrap fit-container sc-s-18 bg-sp"
          style={{
            overflow: "hidden",
            marginTop: ".5rem",
            gap: "4px",
            border: "none",
          }}
          // onClick={handleUnblur}
        >
          {carouselItems.map((item, index) => {
            if (index < 5)
              return (
                <div
                  className="blur-box"
                  style={{
                    flex: "1 1 250px",
                    border: "none",
                    aspectRatio: "16/9",
                    position: "relative",
                    // pointerEvents: toBlur ? "none" : "auto",
                  }}
                  onClick={(e) => {
                    handleOpenImage(e, index);
                  }}
                >
                  <div
                    key={
                      typeof item === "string" ? item : item.fileName || index
                    }
                    className={`bg-img cover-bg pointer fit-container fit-height ${
                      !toBlur ? "" : "blurred"
                    }`}
                    style={{
                      backgroundImage: `url(${item})`,
                    }}
                  >
                    {index === 4 && carouselItems.length > 5 && (
                      <div
                        style={{
                          position: "absolute",
                          left: 0,
                          top: 0,
                          width: "100%",
                          height: "100%",
                          zIndex: 1,
                          backgroundColor: "rgba(0,0,0,.8)",
                        }}
                        className="fx-centered"
                      >
                        <h2 style={{ color: "white" }}>
                          +{carouselItems.length - 5}
                        </h2>
                      </div>
                    )}
                  </div>
                  <BlurredContentDesc toBlur={toBlur} label={false} />
                </div>
              );
          })}
        </div>
      )}
    </>
  );
}
