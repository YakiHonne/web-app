import React, { useState } from "react";
import { Widget } from "smart-widget-previewer";
import { customHistory } from "@/Helpers/History";
import { useSelector } from "react-redux";
import MiniApp from "@/Components/MiniApp";
import PaymentGateway from "@/Components/PaymentGateway";

export default function SWCard({ widget, onNextWidget }) {
  const userKeys = useSelector((state) => state.userKeys);
  const [triggerMiniApp, setTriggerMiniApp] = useState("");
  const [triggerZap, setTriggerZap] = useState("");
  return (
    <>
      {triggerZap && (
        <PaymentGateway
          recipientAddr={triggerZap}
          recipientPubkey={widget.pubkey}
          exit={() => setTriggerZap(false)}
        />
      )}
      {triggerMiniApp && (
        <MiniApp url={triggerMiniApp} exit={() => setTriggerMiniApp(false)} />
      )}
      <Widget
        userHexPubkey={userKeys.pub}
        event={widget}
        onZapButton={setTriggerZap}
        onNostrButton={(addr) => customHistory(`/${addr}`)}
        onNextWidget={onNextWidget}
        onActionWidget={(data) => setTriggerMiniApp(data)}
        widgetBorderColor="var(--pale-gray)"
      />
    </>
  );
}

//   recipientLNURL,
//   recipientPubkey,
//   callback,
//   recipientInfo,
//   aTag,
//   eTag,
//   exit,
//   forContent,
//   lnbcAmount,
//   setReceivedEvent,
// }) => {
//   const dispatch = useDispatch();
//   const userKeys = useSelector((state) => state.userKeys);
//   const userMetadata = useSelector((state) => state.userMetadata);
//   const { t } = useTranslation();
//   const [amount, setAmount] = useState(
//     lnbcAmount ? parseInt(lnbcAmount.value) / 1000 : 1
//   );
//   const [message, setMessage] = useState("");
//   const [isLoading, setIsLoading] = useState(false);
//   const [invoice, setInvoice] = useState("");
//   const [wallets, setWallets] = useState(getWallets());
//   const [selectedWallet, setSelectedWallet] = useState(
//     wallets.find((wallet) => wallet.active)
//   );
//   const [confirmation, setConfirmation] = useState("initiated");
//   const [onlyInvoice, setOnlyInvoice] = useState(false);
//   const [showWalletsList, setShowWalletList] = useState(false);
//   const walletListRef = useRef(null);

//   useEffect(() => {
//     let handleOffClick = (e) => {
//       if (walletListRef.current && !walletListRef.current.contains(e.target)) {
//         setShowWalletList(false);
//       }
//     };

//     document.addEventListener("mousedown", handleOffClick);
//     return () => {
//       document.removeEventListener("mousedown", handleOffClick);
//     };
//   }, [walletListRef]);

//   const predefined_amounts = [
//     { amount: 500, entitle: "500" },
//     { amount: 1000, entitle: "1k" },
//     { amount: 3000, entitle: "3k" },
//     { amount: 5000, entitle: "5k" },
//   ];

//   const onConfirmation = async (generateOnlyInvoice) => {
//     try {
//       if (!userKeys || !amount) {
//         dispatch(
//           setToast({
//             type: 2,
//             desc: t("AbnA22A"),
//           })
//         );
//         return;
//       }
//       setIsLoading(true);
//       let lnbcInvoice = lnbcAmount ? recipientLNURL : "";
//       let eventCreatedAt = Math.floor(Date.now() / 1000);
//       let eventToPublish = null;
//       if (!lnbcAmount) {
//         let sats = amount * 1000;
//         let tags = [
//           ["relays", ...relaysOnPlatform],
//           ["amount", sats.toString()],
//           ["lnurl", recipientLNURL],
//           ["p", recipientPubkey],
//         ];
//         const event = await getZapEventRequest(
//           userKeys,
//           message,
//           tags,
//           eventCreatedAt
//         );
//         if (!event) {
//           setIsLoading(false);
//           return;
//         }
//         eventToPublish = event;
//         let tempRecipientLNURL = recipientLNURL.includes("@")
//           ? encodeLud06(decodeUrlOrAddress(recipientLNURL))
//           : recipientLNURL;
//         try {
//           const res = await axios(
//             `${callback}${
//               callback.includes("?") ? "&" : "?"
//             }amount=${sats}&nostr=${event}&lnurl=${tempRecipientLNURL}`
//           );
//           if (res.data.status === "ERROR") {
//             setIsLoading(false);
//             dispatch(
//               setToast({
//                 type: 2,
//                 desc: t("AZ43zpG"),
//               })
//             );
//             return;
//           }
//           lnbcInvoice = res.data.pr;
//         } catch (err) {
//           setIsLoading(false);
//           dispatch(
//             setToast({
//               type: 2,
//               desc: t("AgCBh6S"),
//             })
//           );
//           return;
//         }
//       }
//       setInvoice(lnbcInvoice);
//       setConfirmation("in_progress");

//       if (generateOnlyInvoice) {
//         setIsLoading(false);
//         setOnlyInvoice(true);
//         return;
//       }

//       await sendPayment(lnbcInvoice);

//       if (eventToPublish) {
//         let sub = ndkInstance.subscribe(
//           [
//             {
//               kinds: [9735],
//               "#p": [recipientPubkey],
//               since: eventCreatedAt - 1,
//             },
//           ],
//           { groupable: false, cacheUsage: "ONLY_RELAY" }
//         );
//         sub.on("event", (event) => {
//           setReceivedEvent(event.rawEvent());
//           setConfirmation("confirmed");
//           updateYakiChest();
//           setIsLoading(false);
//           sub.stop();
//         });
//       } else {
//         setConfirmation("confirmed");
//         updateYakiChest();
//         setIsLoading(false);
//       }
//     } catch (err) {
//       console.log(err);
//     }
//   };

//   const sendPayment = async (addr) => {
//     if (selectedWallet.kind === 1) await sendWithWebLN(addr);
//     if (selectedWallet.kind === 2) {
//       let checkTokens = await checkAlbyToken(wallets, selectedWallet);
//       setWallets(checkTokens.wallets);
//       sendWithAlby(addr, checkTokens.activeWallet.data.access_token);
//     }
//     if (selectedWallet.kind === 3) await sendWithNWC(addr);
//   };

//   const sendWithWebLN = async (addr_) => {
//     try {
//       await window.webln?.enable();
//       let res = await window.webln.sendPayment(addr_);
//       return;
//     } catch (err) {
//       setIsLoading(false);
//       if (err.includes("User rejected")) return;
//       dispatch(
//         setToast({
//           type: 2,
//           desc: t("Acr4Slu"),
//         })
//       );
//     }
//   };
//   const sendWithNWC = async (addr_) => {
//     try {
//       const nwc = new webln.NWC({ nostrWalletConnectUrl: selectedWallet.data });
//       await nwc.enable();
//       const res = await nwc.sendPayment(addr_);
//       nwc.close();
//       return;
//     } catch (err) {
//       console.log(err);
//       setIsLoading(false);
//       dispatch(
//         setToast({
//           type: 2,
//           desc: t("Acr4Slu"),
//         })
//       );
//     }
//   };
//   const sendWithAlby = async (addr_, code) => {
//     try {
//       const data = await axios.post(
//         "https://api.getalby.com/payments/bolt11",
//         { invoice: addr_ },
//         {
//           headers: {
//             Authorization: `Bearer ${code}`,
//           },
//         }
//       );
//       return;
//     } catch (err) {
//       setIsLoading(false);
//       console.log(err);
//     }
//   };

//   const copyKey = (key) => {
//     navigator.clipboard.writeText(key);
//     dispatch(
//       setToast({
//         type: 1,
//         desc: `${t("AS0m8W5")} 👏`,
//       })
//     );
//   };

//   const updateYakiChest = async () => {
//     try {
//       let action_key = getActionKey();
//       if (action_key) {
//         let data = await axiosInstance.post("/api/v1/yaki-chest", {
//           action_key,
//         });

//         let { user_stats, is_updated } = data.data;

//         if (is_updated) {
//           dispatch(setUpdatedActionFromYakiChest(is_updated));
//           updateYakiChestStats(user_stats);
//         }
//       }
//     } catch (err) {
//       console.log(err);
//     }
//   };

//   const getActionKey = () => {
//     if (amount > 0 && amount <= 20) return "zap-1";
//     if (amount <= 60) return "zap-20";
//     if (amount <= 100) return "zap-60";
//     if (amount > 100) return "zap-100";
//     return false;
//   };

//   const handleSelectWallet = (walletID) => {
//     // let walletID = e.target.value;
//     let index = wallets.findIndex((wallet) => wallet.id == walletID);

//     let tempWallets = Array.from(wallets);
//     tempWallets = tempWallets.map((wallet) => {
//       let w = { ...wallet };
//       w.active = false;
//       return w;
//     });
//     tempWallets[index].active = true;
//     setSelectedWallet(wallets[index]);
//     setWallets(tempWallets);
//     setShowWalletList(false);
//   };

//   return (
//     <div
//       className="fixed-container fx-centered box-pad-h"
//       onClick={(e) => {
//         e.stopPropagation();
//         exit();
//       }}
//     >
//       <section
//         onClick={(e) => {
//           e.stopPropagation();
//         }}
//         className="sc-s-18 bg-sp box-pad-h box-pad-v"
//         style={{
//           width: "min(100%, 500px)",
//           position: "relative",
//           overflow: "visible",
//         }}
//       >
//         <div
//           className="close"
//           onClick={(e) => {
//             e.stopPropagation();
//             exit();
//           }}
//         >
//           <div></div>
//         </div>
//         <div className="fx-centered box-marg-s">
//           <div className="fx-centered fx-col">
//             <UserProfilePic size={54} mainAccountUser={true} />
//             <p className="gray-c p-medium">{userMetadata.name}</p>
//           </div>
//           {recipientInfo && (
//             <>
//               <div style={{ position: "relative", width: "30%" }}>
//                 {confirmation === "confirmed" && (
//                   <div
//                     className="checkmark slide-left"
//                     style={{ scale: "3" }}
//                   ></div>
//                 )}
//                 {confirmation !== "confirmed" && (
//                   <div className="arrows-animated">
//                     <span></span>
//                     <span></span>
//                     <span></span>
//                   </div>
//                 )}
//               </div>
//               <div className="fx-centered fx-col">
//                 <UserProfilePic
//                   size={54}
//                   img={recipientInfo.img || recipientInfo.picture}
//                   mainAccountUser={false}
//                 />
//                 <p className="gray-c p-medium">{recipientInfo.name}</p>
//               </div>
//             </>
//           )}
//         </div>

//         {/* <hr style={{ margin: "1rem auto" }} /> */}
//         {confirmation === "initiated" && (
//           <div className="fx-centered fx-col fit-container fx-start-v">
//             {forContent && (
//               <div className="fit-container sc-s-18 box-pad-h-m box-pad-v-m">
//                 <p>
//                   <span className="gray-c">{t("AKndAJd")} </span>
//                   {forContent}
//                 </p>
//               </div>
//             )}
//             <div
//               style={{ position: "relative" }}
//               className="fit-container"
//               ref={walletListRef}
//             >
//               {selectedWallet && (
//                 <div
//                   className="if fx-scattered option pointer fit-container"
//                   onClick={() => setShowWalletList(!showWalletsList)}
//                 >
//                   <div>
//                     <p className="gray-c p-medium">{t("A7r9XS1")}</p>
//                     <p>{selectedWallet.entitle}</p>
//                   </div>
//                   <div className="arrow"></div>
//                 </div>
//               )}
//               {showWalletsList && (
//                 <div
//                   className="fx-centered fx-col sc-s-18  box-pad-v-s fx-start-v fx-start-h fit-container"
//                   style={{
//                     // width: "400px",
//                     backgroundColor: "var(--c1-side)",
//                     position: "absolute",
//                     right: "0",
//                     top: "calc(100% + 5px)",
//                     rowGap: 0,
//                     overflow: "scroll",
//                     maxHeight: "300px",
//                     zIndex: 100,
//                   }}
//                 >
//                   <p className="p-medium gray-c box-pad-h-m box-pad-v-s">
//                     {t("AnXYtQy")}
//                   </p>
//                   {wallets.map((wallet) => {
//                     return (
//                       <div
//                         key={wallet.id}
//                         className="option-no-scale fit-container fx-scattered sc-s-18 pointer box-pad-h-m box-pad-v-s"
//                         onClick={(e) => {
//                           e.stopPropagation();
//                           handleSelectWallet(wallet.id);
//                         }}
//                         style={{
//                           border: "none",
//                           overflow: "visible",
//                         }}
//                       >
//                         <div className="fx-centered">
//                           {wallet.active && (
//                             <div
//                               style={{
//                                 minWidth: "8px",
//                                 aspectRatio: "1/1",
//                                 backgroundColor: "var(--green-main)",
//                                 borderRadius: "var(--border-r-50)",
//                               }}
//                             ></div>
//                           )}
//                           <p className={wallet.active ? "green-c" : ""}>
//                             {wallet.entitle}
//                           </p>
//                         </div>
//                       </div>
//                     );
//                   })}
//                 </div>
//               )}
//             </div>
//             {!lnbcAmount && (
//               <>
//                 <div className="fit-container" style={{ position: "relative" }}>
//                   <input
//                     type="number"
//                     className="if ifs-full"
//                     placeholder={t("AcDgXKI")}
//                     value={amount}
//                     onChange={(e) => setAmount(parseInt(e.target.value))}
//                   />
//                   <div
//                     className="fx-centered"
//                     style={{ position: "absolute", right: "16px", top: "16px" }}
//                   >
//                     <p className="gray-c">sats</p>
//                   </div>
//                 </div>
//                 <div className="fit-container fx-scattered">
//                   {predefined_amounts.map((item, index) => {
//                     return (
//                       <button
//                         className={`fx  btn sc-s-18 `}
//                         key={index}
//                         style={{
//                           borderColor:
//                             amount === item.amount ? "var(--black)" : "",
//                           color: "var(--black)",
//                         }}
//                         onClick={() => setAmount(item.amount)}
//                       >
//                         {item.entitle}
//                       </button>
//                     );
//                   })}
//                 </div>
//                 <input
//                   type="text"
//                   className="if ifs-full"
//                   value={message}
//                   onChange={(e) => setMessage(e.target.value)}
//                   placeholder={t("Ark6BLW")}
//                 />
//               </>
//             )}
//             <div className="fx-centered fit-container">
//               <button
//                 className="btn btn-gst btn-full"
//                 onClick={() => {
//                   onConfirmation(true);
//                 }}
//                 disabled={isLoading}
//               >
//                 {isLoading ? <LoadingDots /> : t("AWADEEz")}
//               </button>
//               <button
//                 className="btn btn-normal btn-full fx-centered"
//                 onClick={() => onConfirmation(false)}
//                 disabled={isLoading}
//               >
//                 {isLoading ? (
//                   <LoadingDots />
//                 ) : (
//                   <>
//                     {lnbcAmount ? (
//                       t("AloNXcI", { amount: amount })
//                     ) : (
//                       <>
//                         <div className="bolt"></div> Zap
//                       </>
//                     )}
//                   </>
//                 )}
//               </button>
//             </div>
//           </div>
//         )}
//         {confirmation === "in_progress" && (
//           <div className="fx-centered fx-col fit-container">
//             <QRCode
//               style={{ width: "100%", aspectRatio: "1/1" }}
//               size={400}
//               value={invoice}
//             />
//             <div
//               className="fx-scattered if pointer dashed-onH fit-container"
//               style={{ borderStyle: "dashed" }}
//               onClick={() => copyKey(invoice)}
//             >
//               <p>{shortenKey(invoice)}</p>
//               <div className="copy-24"></div>
//             </div>
//             {!onlyInvoice && (
//               <div className="fit-container fx-centered box-pad-v-s">
//                 <p className="gray-c p-medium">{t("A1ufjMM")}</p>
//                 <LoadingDots />
//               </div>
//             )}
//             {onlyInvoice && (
//               <div className="fit-container fx-centered">
//                 <button
//                   className="btn btn-normal btn-full"
//                   onClick={() => {
//                     exit();
//                   }}
//                 >
//                   {t("AI67awJ")}
//                 </button>
//               </div>
//             )}
//           </div>
//         )}
//         {confirmation === "confirmed" && (
//           <div
//             className="fx-centered fx-col fit-container"
//             style={{ height: "16vh" }}
//           >
//             <div className="box-pad-v-s"></div>
//             <h4>{t("ACDUO1d")}</h4>
//             <p className="gray-c box-pad-v-s">
//               {t("ALEgwqA")} <span className="orange-c">{amount} sats</span>
//             </p>
//             <button className="btn btn-normal" onClick={exit}>
//               {t("Acglhzb")}
//             </button>
//           </div>
//         )}
//       </section>
//     </div>
//   );
// };

// const checkAlbyToken = async (wallets, activeWallet) => {
//   let tokenExpiry = activeWallet.data.created_at + activeWallet.data.expires_in;
//   let currentTime = Math.floor(Date.now() / 1000);
//   if (tokenExpiry > currentTime)
//     return {
//       wallets,
//       activeWallet,
//     };
//   try {
//     let fd = new FormData();
//     fd.append("refresh_token", activeWallet.data.refresh_token);
//     fd.append("grant_type", "refresh_token");
//     const access_token = await axios.post(
//       "https://api.getalby.com/oauth/token",
//       fd,
//       {
//         auth: {
//           username: process.env.REACT_APP_ALBY_CLIENT_ID,
//           password: process.env.REACT_APP_ALBY_SECRET_ID,
//         },
//         headers: {
//           "Content-Type": "multipart/form-data",
//         },
//       }
//     );
//     let tempWallet = { ...activeWallet };
//     tempWallet.data = {
//       ...access_token.data,
//       created_at: Math.floor(Date.now() / 1000),
//     };
//     let tempWallets = Array.from(wallets);
//     let index = wallets.findIndex((item) => item.id === activeWallet.id);
//     tempWallets[index] = tempWallet;
//     updateWallets(tempWallets);
//     return {
//       wallets: tempWallets,
//       activeWallet: tempWallet,
//     };
//   } catch (err) {
//     console.log(err);
//     return {
//       wallets,
//       activeWallet,
//     };
//   }
// };