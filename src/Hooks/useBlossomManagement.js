import { generateAuthorizationHeaderForBlossomServer } from "@/Helpers/Helpers";
import axios from "axios";
import React, { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { YAKI_BLOSSOM } from "@/Content/Blossom";

export default function useBlossomManagement() {
  const userKeys = useSelector((state) => state.userKeys);
  const userBlossomServers = useSelector((state) => state.userBlossomServers);
  const [blobs, setBlobs] = useState([]);
  const [allBlobs, setAllBlobs] = useState([]);
  const [isBlobsLoading, setIsBlobsLoading] = useState(true);
  const [authHeader, setAuthHeader] = useState(null);
  const [timestamp, setTimeStamp] = useState(null);
  const [yakiUsage, setYakiUsage] = useState(null);
  const [isYakiUsageLoading, setIsYakiUsageLoading] = useState(true);
  const blossomColors = useMemo(() => {
    return userBlossomServers.map((_, index) => {
      return `hsl(${index * 30}, 70%, 60%)`;
    });
  }, [userBlossomServers]);

  useEffect(() => {
    setYakiUsage(null);
  }, [userKeys?.pub]);

  useEffect(() => {
    if (!userKeys?.pub) {
      setIsYakiUsageLoading(false);
      return;
    }
    let cancelled = false;
    const fetchYakiUsage = async () => {
      setIsYakiUsageLoading(true);
      try {
        let token = null;
        try {
          token = await Promise.race([
            generateAuthorizationHeaderForBlossomServer({
              servers: [YAKI_BLOSSOM],
              tTag: "list",
            }),
            new Promise((resolve) => setTimeout(() => resolve(null), 8000)),
          ]);
        } catch (err) {
          token = null;
        }
        if (cancelled) return;
        const { data } = await axios.get(
          `${YAKI_BLOSSOM}/list/${userKeys.pub}`,
          {
            timeout: 15000,
            headers:
              typeof token === "string" && token
                ? { Authorization: `Nostr ${token}` }
                : undefined,
          },
        );
        if (cancelled) return;
        setYakiUsage(
          Array.isArray(data)
            ? data.reduce((sum, blob) => sum + (blob.size || 0), 0)
            : 0,
        );
      } catch (err) {
        if (!cancelled) setYakiUsage(null);
      } finally {
        if (!cancelled) setIsYakiUsageLoading(false);
      }
    };
    fetchYakiUsage();
    return () => {
      cancelled = true;
    };
  }, [userKeys?.pub, timestamp]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        let token = authHeader;
        if (!token) {
          token = await generateAuthorizationHeaderForBlossomServer({
            servers: userBlossomServers,
            tTag: "list",
          });
          setAuthHeader(token);
        }
        let response = await Promise.allSettled(
          userBlossomServers.map((_, index) => {
            return axios.get(`${_}/list/${userKeys.pub}`, {
              headers: {
                Authorization: `Nostr ${token}`,
              },
            });
          }),
        );
        response = response.map((_, index) => {
          if (_.status === "fulfilled" && Array.isArray(_.value.data))
            return {
              url: userBlossomServers[index],
              blobs: _.value.data.sort((a, b) => b.uploaded - a.uploaded),
            };
          else return { url: userBlossomServers[index], blobs: [] };
        });
        const allBlobsMap = new Map();
        response.forEach((serverData, serverIndex) => {
          serverData.blobs.forEach((blob) => {
            if (allBlobsMap.has(blob.sha256)) {
              allBlobsMap.get(blob.sha256).seen = [
                ...new Set([...allBlobsMap.get(blob.sha256).seen, serverIndex]),
              ];
            } else {
              allBlobsMap.set(blob.sha256, { ...blob, seen: [serverIndex] });
            }
          });
        });
        let b = {};
        response.forEach((serverData) => {
          b[serverData.url] = serverData.blobs;
        });
        setBlobs(b);
        setAllBlobs(Array.from(allBlobsMap.values()));
        setIsBlobsLoading(false);
      } catch (err) {
        console.log(err);
        setIsBlobsLoading(false);
      }
    };
    if (userKeys && userBlossomServers.length > 0) fetchData();
    else if (blobs.length > 0) {
      setIsBlobsLoading(false);
      setBlobs([]);
      setAllBlobs([]);
    }
  }, [userKeys, userBlossomServers, timestamp]);

  const refreshLists = () => {
    setTimeStamp(Date.now());
  };

  return {
    userBlossomServers,
    blobs,
    allBlobs,
    isBlobsLoading,
    blossomColors,
    refreshLists,
    yakiUsage,
    isYakiUsageLoading,
  };
}
