import React, { useEffect, useState } from "react";
import { getSubData } from "@/Helpers/Controlers";
import { bytesTohex, encodeBase64URL } from "@/Helpers/Encryptions";
import { finalizeEvent, generateSecretKey } from "nostr-tools";
import axios from "axios";
import Carousel from "@/Components/Carousel";

export default function Gallery({ imgs, pubkey }) {
  const [carouselItems, setCarouselItems] = useState(imgs);
  const [currentImg, setCurrentImg] = useState(0);
  const [showCarousel, setShowCarousel] = useState(false);

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

  return (
    <>
      {showCarousel && (
        <Carousel
          imgs={carouselItems}
          selectedImage={currentImg}
          back={(e) => {
            e.stopPropagation();
            setShowCarousel(false);
          }}
        />
      )}
      {carouselItems.length === 1 && (
        <div className="image-grid">
          <img
            onClick={(e) => {
              e.stopPropagation();
              setCurrentImg(0);
              setShowCarousel(true);
            }}
            className="sc-s-18"
            style={{
              margin: ".5rem 0 .5rem 0",
              cursor: "zoom-in",
              maxWidth: "95%",
              objectFit: "fit",
              maxHeight: "600px",
            }}
            src={carouselItems[0]}
            alt="el"
            loading="lazy"
          />
        </div>
      )}
      {carouselItems.length > 1 && (
        <div
          className="fx-centered fx-start-h fx-wrap fit-container sc-s-18"
          style={{
            overflow: "hidden",
            marginTop: ".5rem",
            gap: "4px",
            border: "none",
          }}
        >
          {carouselItems.map((item, index) => {
            if (index < 5)
              return (
                <div
                  key={typeof item === "string" ? item : item.fileName || index}
                  className={`bg-img cover-bg pointer fit-height `}
                  style={{
                    backgroundImage: `url(${item})`,
                    flex: "1 1 170px",
                    border: "none",
                    aspectRatio: "16/9",
                    position: "relative",
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentImg(index);
                    setShowCarousel(true);
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
                      <h2 style={{ color: "white" }}>+{carouselItems.length - 5}</h2>
                    </div>
                  )}
                </div>
              );
          })}
        </div>
      )}
    </>
  );
}

// const CarouselItems = ({ imgs, selectedImage, back }) => {
//   const [currentImg, setCurrentImg] = useState(selectedImage);

//   return (
//     <div
//       className="fixed-container fx-centered box-pad-h-s fx-col slide-up"
//       onClick={back}
//       style={{ zIndex: 99999999 }}
//     >
//       <div className="close">
//         <div></div>
//       </div>
//       <div className="fit-container fx-centered">
//         {imgs.length > 1 && (
//           <div
//             className="pointer"
//             style={{
//               position: "fixed",
//               left: "10px",
//               top: "45%",
//               zIndex: 100,
//               border: "none",
//               filter: "drop-shadow(0px 0px 2px rgba(0,0,0,1))",
//             }}
//             onClick={(e) => {
//               e.stopPropagation();
//               currentImg > 0 && setCurrentImg(currentImg - 1);
//             }}
//           >
//             <div
//               className="arrow-24"
//               style={{
//                 transform: "rotate(90deg)",
//                 minHeight: "38px",
//                 minWidth: "38px",
//               }}
//             ></div>
//           </div>
//         )}
//         <div className="fit-height fit-container slide-up">
//           <div
//             className="fit-container fit-height"
//             style={{ overflow: "hidden" }}
//           >
//             <div
//               className="fit-container fit-height fx-scattered fx-start-h"
//               style={{
//                 transform: `translateX(-${currentImg * 100}%)`,
//                 transition: ".3s ease-in-out",
//                 zIndex: 0,
//                 position: "relative",
//                 columnGap: 0,
//               }}
//             >
//               {imgs.map((item, index) => {
//                 return (
//                   <div
//                     key={index}
//                     className="fit-container fx-centered fx-shrink bg-img contained-bg"
//                     style={{
//                       height: "100vh",
//                     }}
//                   >
//                     <img
//                       src={item}
//                       style={{ objectFit: "contain" }}
//                       className="fit-container fit-height"
//                     />
//                   </div>
//                 );
//               })}
//             </div>
//           </div>
//         </div>
//         {imgs.length > 1 && (
//           <div
//             className="pointer "
//             onClick={(e) => {
//               e.stopPropagation();
//               currentImg + 1 < imgs.length && setCurrentImg(currentImg + 1);
//             }}
//             style={{
//               position: "fixed",
//               right: "10px",
//               top: "45%",
//               border: "none",
//               filter: "drop-shadow(0px 0px 2px rgba(0,0,0,1))",
//             }}
//           >
//             <div
//               className="arrow-24"
//               style={{
//                 transform: "rotate(-90deg)",
//                 minHeight: "38px",
//                 minWidth: "38px",
//               }}
//             ></div>
//           </div>
//         )}
//       </div>
//       {imgs.length > 1 && (
//         <div
//           className="fit-container fx-centered box-pad-v-s slide-down"
//           style={{ position: "fixed", left: 0, bottom: 0 }}
//         >
//           <div
//             style={{
//               width: "min(100%, 400px)",
//               backgroundColor: "var(--white-transparent)",
//               border: "none",
//             }}
//             className="fx-centered box-pad-h-m box-pad-v-s sc-s"
//           >
//             <p style={{ minWidth: "max-content" }}>
//               {currentImg + 1} / <span className="gray-c">{imgs.length}</span>
//             </p>
//             <ProgressBar
//               current={currentImg + 1}
//               total={imgs.length}
//               full={true}
//             />
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };
// const CarouselItems = ({ imgs, selectedImage, back }) => {
//   const [currentImg, setCurrentImg] = useState(selectedImage);

//   return (
//     <div
//       className="fixed-container fx-centered box-pad-h-s fx-col"
//       cl
//       onClick={back}
//     >
//       <div className="close">
//         <div></div>
//       </div>
//       <div className="fit-container fx-centered">
//         <div
//           className="pointer round-icon"
//           style={{ position: "relative", zIndex: 100 }}
//           onClick={(e) => {
//             e.stopPropagation();
//             currentImg > 0 && setCurrentImg(currentImg - 1);
//           }}
//         >
//           <div className="arrow" style={{ transform: "rotate(90deg)" }}></div>
//         </div>
//         <div className="fit-height carousel-width">
//           <div
//             className="fit-container fit-height"
//             style={{ overflow: "hidden" }}
//           >
//             <div
//               className="fit-container fit-height fx-scattered fx-start-h"
//               style={{
//                 transform: `translateX(-${currentImg * 100}%)`,
//                 transition: ".3s ease-in-out",
//                 zIndex: 0,
//                 position: "relative",
//                 columnGap: 0,
//                 // scrollSnapType: "x mandatory",
//                 // overflow: 'scroll'
//               }}
//             >
//               {imgs.map((item, index) => {
//                 return (
//                   <div
//                     key={index}
//                     className="fit-container fx-centered fx-shrink box-pad-h-s box-pad-v-s"
//                     style={{
//                       height: "95vh",
//                     }}
//                   >
//                     <img
//                       src={item}
//                       // className="bg-img contained-bg "
//                       // style={{
//                       //   // backgroundImage: `url(${item})`,
//                       //   // backgroundColor: "var(--primary)",
//                       //   width: "100%",
//                       //   height: "100%",
//                       //   // border: "none",
//                       // }}
//                       style={{
//                         // width: "100%",
//                         maxWidth: "100%",
//                         maxHeight: "100%",
//                         objectFit: "object-contain",
//                       }}
//                       className="sc-s-18"
//                     ></img>
//                   </div>
//                 );
//               })}
//             </div>
//           </div>
//         </div>
//         <div
//           className="pointer round-icon"
//           onClick={(e) => {
//             e.stopPropagation();
//             currentImg + 1 < imgs.length && setCurrentImg(currentImg + 1);
//           }}
//         >
//           <div className="arrow" style={{ transform: "rotate(-90deg)" }}></div>
//         </div>
//       </div>
//       <div className="fit-container fx-centered box-pad-h">
//         <div style={{ width: "min(100%, 1000px)" }}>
//           <ProgressBar
//             current={currentImg + 1}
//             total={imgs.length}
//             full={true}
//           />
//         </div>
//       </div>
//     </div>
//   );
// };
