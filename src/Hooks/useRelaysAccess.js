import React, { useEffect, useState } from "react";
import useRelaysMetadata from "./useRelaysMetadata";
import { getSubData, InitEvent } from "@/Helpers/Controlers";
import { useSelector } from "react-redux";
import { NDKEvent, NDKRelay } from "@nostr-dev-kit/ndk";
import { ndkInstance } from "@/Helpers/NDKInstance";
import { setToast } from "@/Store/Slides/Publishers";
import { useDispatch } from "react-redux";

export default function useRelaysAccess({ relay }) {
  const dispatch = useDispatch();
  const { relayMetadata } = useRelaysMetadata(relay);
  const [isMembershipRequired, setIsMembershipRequired] = useState(false);
  const [isMember, setIsMember] = useState(false);
  const [isRelayAccessLoading, setIsRelayAccessLoading] = useState(false);
  const [requestCode, setRequestCode] = useState(false);
  const userKeys = useSelector((state) => state.userKeys);

  useEffect(() => {
    if (relayMetadata.self && userKeys) {
      let isLocked = relayMetadata.supported_nips.includes(43);
      if (isLocked) {
        setIsMembershipRequired(true);
        getSubData(
          [
            {
              kinds: [8000, 8001],
              authors: [relayMetadata.self],
              "#p": [userKeys.pub],
            },
          ],
          50,
          [relay],
        ).then((data) => {
          if (data.data.length > 0) {
            let isRemoved = data.data[0].kind === 8001;
            if (!isRemoved) {
              setIsMember(true);
            } else setIsMember(false);
          }
        });
      }
    } else {
      setIsMember(isMember);
    }
  }, [relayMetadata, userKeys]);

  const handleJoinRequest = async (code) => {
    setIsRelayAccessLoading(true);
    let event = {
      kind: 28934,
      tags: [["-"], ["claim", code]],
    };
    let eventInitEx = await InitEvent(event.kind, "", event.tags);
    if (!eventInitEx) {
      setIsRelayAccessLoading(false);
      return;
    }
    let status = await publishToRelay({ event: eventInitEx, relay });
    if (status) setIsMember(true);
  };

  const publishToRelay = async ({ event }) => {
    return new Promise(async (resolve) => {
      let relayInstance = ndkInstance.pool.getRelay(relay);
      let eventInstance = new NDKEvent(ndkInstance, event);
      await relayInstance.connect();

      let publish = () => {
        relayInstance
          .publish(eventInstance)
          .then((data) => {
            console.log(data);
            setIsRelayAccessLoading(false);
            resolve(true);
          })
          .catch((err) => {
            console.log(err);
            if (err.toString().includes("auth-required")) {
              relayInstance.authPolicy = ndkInstance.relayAuthDefaultPolicy;
              relayInstance.on("authed", () => {
                console.log("authenticated");
                publish();
              });
            } else {
              dispatch(setToast({ type: 2, desc: err.message }));
              setIsRelayAccessLoading(false);
            }
          });
      };
      publish();
    });
  };

  const handleRequestCode = async () => {
    setIsRelayAccessLoading(true);
    let data = await getSubData(
      [
        {
          kinds: [28935],
          authors: [relayMetadata.self],
        },
      ],
      50,
      [relay],
    );
    if (data.data.length > 0) {
      let code = data.data[0].tags.find((tag) => tag[0] === "claim");
      if (code) {
        setRequestCode(code[1]);
      }
    }
    setIsRelayAccessLoading(false);
  };

  const handleLeaveRely = async () => {
    setIsRelayAccessLoading(true);
    let event = {
      kind: 28936,
      tags: [["-"]],
    };
    let eventInitEx = await InitEvent(event.kind, "", event.tags);
    if (!eventInitEx) {
      setIsRelayAccessLoading(false);
      return;
    }
    let status = await publishToRelay({ event: eventInitEx, relay });
    if (status) setIsMember(false);
  };

  return {
    isMembershipRequired,
    handleJoinRequest,
    handleRequestCode,
    handleLeaveRely,
    requestCode,
    setRequestCode,
    isMember,
    isRelayAccessLoading,
  };
}
