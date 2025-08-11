import axiosInstance from "./HTTP_Client";
import { InitEvent } from "./Controlers";

const getZapEventRequest = async (userKeys, content, tags = [], created_at) => {
  let event = {
    kind: 9734,
    content,
    created_at: created_at || Math.floor(Date.now() / 1000),
    tags,
  };
  let eventInitEx = await InitEvent(
    event.kind,
    event.content,
    event.tags,
    event.created_at
  );
  if (!eventInitEx) return;
  return encodeURI(JSON.stringify(eventInitEx));
};

const uploadToS3 = async (img, pubkey) => {
  if (img) {
    try {
      let fd = new FormData();
      fd.append("file", img);
      fd.append("pubkey", pubkey);
      let data = await axiosInstance.post("/api/v1/file-upload", fd, {
        headers: { "Content-Type": "multipart/formdata" },
      });
      return data.data.image_path;
    } catch {
      return false;
    }
  }
};

const deleteFromS3 = async (img) => {
  if (img.includes("daorayaki-fs-bucket")) {
    let data = await axiosInstance.delete("/api/v1/file-upload", {
      params: { image_path: img },
    });
    return true;
  }
  return false;
};

export { uploadToS3, deleteFromS3, getZapEventRequest };
