import axios from "axios";
import React, { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";

export default function useBlossomManagement() {
  const userKeys = useSelector((state) => state.userKeys);
  const userBlossomServers = useSelector((state) => state.userBlossomServers);
  const [blobs, setBlobs] = useState([]);
  const [allBlobs, setAllBlobs] = useState([]);
  const [isBlobsLoading, setIsBlobsLoading] = useState(true);
  const blossomColors = useMemo(() => {
    return userBlossomServers.map((_, index) => {
      return `hsl(${index * 30}, 70%, 60%)`;
    });
  }, [userBlossomServers]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        let response = await Promise.allSettled(
          userBlossomServers.map((_) => {
            return axios.get(`${_}/list/${userKeys.pub}`);
          }),
        );
        response = response.map((_, index) => {
          if (_.status === "fulfilled" && Array.isArray(_.value.data))
            return { url: userBlossomServers[index], blobs: _.value.data };
          else return { url: userBlossomServers[index], blobs: [] };
        });
        const allBlobsMap = new Map();
        response.forEach((serverData, serverIndex) => {
          serverData.blobs.forEach((blob) => {
            if (allBlobsMap.has(blob.sha256)) {
              allBlobsMap.get(blob.sha256).seen.push(serverIndex);
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
  }, [userKeys, userBlossomServers]);

  return { userBlossomServers, blobs, allBlobs, isBlobsLoading, blossomColors };
}
