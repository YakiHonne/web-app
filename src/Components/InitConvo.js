import React, { useState } from "react";
import {
  nip44,
  getEventHash,
  generateSecretKey,
  finalizeEvent,
} from "nostr-tools";
import { bytesTohex, encrypt04, encrypt44 } from "@/Helpers/Encryptions";
import LoadingDots from "@/Components/LoadingDots";
import NProfilePreviewer from "@/Components/NProfilePreviewer";
import UserSearchBar from "@/Components/UserSearchBar";
import axiosInstance from "@/Helpers/HTTP_Client";
import { useDispatch, useSelector } from "react-redux";
import { InitEvent, updateYakiChestStats } from "@/Helpers/Controlers";
import { setToast, setToPublish } from "@/Store/Slides/Publishers";
import { setUpdatedActionFromYakiChest } from "@/Store/Slides/YakiChest";
import { ndkInstance } from "@/Helpers/NDKInstance";
import { NDKEvent, NDKRelay, NDKRelaySet } from "@nostr-dev-kit/ndk";
import { useTranslation } from "react-i18next";
import { getInboxRelaysForUser } from "@/Helpers/DB";
import relaysOnPlatform from "@/Content/Relays";

export default function InitiConvo({ exit, receiver = false }) {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const userKeys = useSelector((state) => state.userKeys);
  const userInboxRelays = useSelector((state) => state.userInboxRelays);
  const [selectedPerson, setSelectedPerson] = useState(receiver || "");
  const [message, setMessage] = useState("");
  const [legacy, setLegacy] = useState(
    userKeys.sec || window?.nostr?.nip44
      ? localStorage.getItem("legacy-dm")
      : true
  );
  const [isLoading, setIsLoading] = useState(false);

  const handleSendMessage = async () => {
    if (
      !message ||
      !userKeys ||
      !selectedPerson ||
      (userKeys && !(userKeys.ext || userKeys.sec || userKeys.bunker))
    )
      return;
    let otherPartyRelays = await getInboxRelaysForUser(selectedPerson);
    let relaysToPublish = [
      ...new Set([
        ...userInboxRelays,
        ...relaysOnPlatform,
        ...otherPartyRelays,
      ]),
    ];

    if (legacy) {
      setIsLoading(true);
      let encryptedMessage = await encrypt04(userKeys, selectedPerson, message);
      if (!encryptedMessage) {
        setIsLoading(false);
        return;
      }
      let tags = [];
      tags.push(["p", selectedPerson]);

      let created_at = Math.floor(Date.now() / 1000);
      let tempEvent = {
        created_at,
        kind: 4,
        content: encryptedMessage,
        tags,
      };
      tempEvent = await InitEvent(
        tempEvent.kind,
        tempEvent.content,
        tempEvent.tags,
        tempEvent.created_at
      );
      if (!tempEvent) return;
      dispatch(
        setToPublish({
          eventInitEx: tempEvent,
          allRelays: relaysToPublish,
        })
      );
      setIsLoading(false);
      exit();
    }
    if (!legacy) {
      let { sender_event, receiver_event } = await getGiftWrap();
      setIsLoading(true);
      let response = await initPublishing(
        relaysToPublish,
        sender_event,
        receiver_event
      );
      if (response) {
        let action_key =
          selectedPerson ===
          "20986fb83e775d96d188ca5c9df10ce6d613e0eb7e5768a0f0b12b37cdac21b3"
            ? "dms-10"
            : "dms-5";
        updateYakiChest(action_key);
        setIsLoading(false);
        exit();
      } else {
        setIsLoading(false);
      }
    }
  };

  const updateYakiChest = async (action_key) => {
    try {
      let data = await axiosInstance.post("/api/v1/yaki-chest", {
        action_key,
      });
      let { user_stats, is_updated } = data.data;

      if (is_updated) {
        dispatch(setUpdatedActionFromYakiChest(is_updated));
        updateYakiChestStats(user_stats);
      }
      exit();
    } catch (err) {
      console.log(err);
      exit();
    }
  };

  const getGiftWrap = async () => {
    let g_sk_1 = bytesTohex(generateSecretKey());
    let g_sk_2 = bytesTohex(generateSecretKey());

    let [signedKind13_1, signedKind13_2] = await Promise.all([
      getEventKind13(selectedPerson),
      getEventKind13(userKeys.pub),
    ]);

    let content_1 = nip44.v2.encrypt(
      JSON.stringify(signedKind13_1),
      nip44.v2.utils.getConversationKey(g_sk_1, selectedPerson)
    );
    let content_2 = nip44.v2.encrypt(
      JSON.stringify(signedKind13_2),
      nip44.v2.utils.getConversationKey(g_sk_2, userKeys.pub)
    );
    let event_1 = {
      created_at: Math.floor(Date.now() / 1000) - 432000,
      kind: 1059,
      tags: [["p", selectedPerson]],
      content: content_1,
    };
    let event_2 = {
      created_at: Math.floor(Date.now() / 1000) - 432000,
      kind: 1059,
      tags: [["p", userKeys.pub]],
      content: content_2,
    };
    event_1 = finalizeEvent(event_1, g_sk_1);
    event_2 = finalizeEvent(event_2, g_sk_2);
    return { sender_event: event_2, receiver_event: event_1 };
  };

  const getEventKind14 = () => {
    let event = {
      pubkey: userKeys.pub,
      created_at: Math.floor(Date.now() / 1000),
      kind: 14,
      tags: [
        ["p", selectedPerson],
        ["p", userKeys.pub],
      ],
      content: message,
    };

    event.id = getEventHash(event);
    return event;
  };

  const getEventKind13 = async (pubkey) => {
    let unsignedKind14 = getEventKind14();
    let content = await encrypt44(
      userKeys,
      pubkey,
      JSON.stringify(unsignedKind14)
    );

    let event = {
      created_at: Math.floor(Date.now() / 1000) - 172800,
      kind: 13,
      tags: [],
      content,
    };
    event = await InitEvent(
      event.kind,
      event.content,
      event.tags,
      event.created_at
    );
    return event;
  };

  const initPublishing = async (relays, event1, event2) => {
    try {
      let ev1 = new NDKEvent(ndkInstance, event1);
      let ev2 = new NDKEvent(ndkInstance, event2);
      const ndkRelays = relays.map((_) => {
        return new NDKRelay(_, undefined, ndkInstance);
      });
      const ndkRelaysSet = new NDKRelaySet(ndkRelays, ndkInstance);
      let [res1, res2] = await Promise.race([
        ev1.publish(ndkRelaysSet),
        ev2.publish(ndkRelaysSet),
      ]);

      dispatch(
        setToast({
          type: 1,
          desc: t("Ax4F7eu"),
        })
      );

      return true;
    } catch (err) {
      console.log(err);
      dispatch(
        setToast({
          type: 2,
          desc: t("A4cCSy5"),
        })
      );
      return false;
    }
  };

  const handleLegacyDMs = () => {
    if (legacy) {
      localStorage.removeItem("legacy-dm");
      setLegacy(false);
    } else {
      localStorage.setItem("legacy-dm", `${Date.now()}`);
      setLegacy(true);
    }
  };

  return (
    <div className="fixed-container fx-centered box-pad-h">
      <div
        className="box-pad-h box-pad-v sc-s-18 bg-sp"
        style={{
          position: "relative",
          width: "min(100%, 500px)",
          borderColor: !legacy ? "var(--green-main)" : "",
          transition: ".2s ease-in-out",
        }}
      >
        <div className="close" onClick={exit}>
          <div></div>
        </div>
        <h4 className="box-marg-s">{t("AuUoz1R")}</h4>
        <div
          className="fx-centered fx-col fit-container"
          style={{ pointerEvents: isLoading ? "none" : "auto" }}
        >
          {!selectedPerson && <UserSearchBar onClick={setSelectedPerson} />}
          {selectedPerson && (
            <NProfilePreviewer
              pubkey={selectedPerson}
              margin={false}
              close={receiver ? false : true}
              onClose={() => setSelectedPerson("")}
            />
          )}
          <textarea
            className="txt-area ifs-full"
            placeholder={t("ATjclmk")}
            style={{ height: "200px" }}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            disabled={isLoading}
          ></textarea>

          <div className="fit-container fx-scattered">
            <button
              className="btn btn-normal"
              onClick={handleSendMessage}
              disabled={isLoading}
            >
              {isLoading ? <LoadingDots /> : t("AsEtDNy")}
            </button>
            {(userKeys.sec || window?.nostr?.nip44) && (
              <div
                className="fx-centered round-icon-tooltip"
                data-tooltip={legacy ? t("Al6NH4U") : t("AfN9sMV")}
              >
                {/* {!legacy && ( */}
                <p className="p-medium slide-left">{t("ATta6yb")}</p>
                {/* // )} */}
                {/* {legacy && (
                  <p className="p-medium gray-c slide-right">Legacy encryption</p>
                )} */}
                <div
                  className={`toggle ${legacy ? "toggle-dim-gray" : ""} ${
                    !legacy ? "toggle-green" : "toggle-dim-gray"
                  }`}
                  onClick={handleLegacyDMs}
                ></div>
              </div>
            )}
          </div>
          {legacy && (
            <div className="box-pad-h-m box-pad-v-m fx-centered fx-start-h fit-container sc-s-18">
              <div className="info-tt-24"></div>
              <div>
                <p className="c1-c p-medium">{t("AakbxOk")}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
