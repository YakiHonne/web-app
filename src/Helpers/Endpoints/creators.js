import axiosInstance from "../HTTP_Client";

export const getSubscriptionLink = async ({
  creator_pubkey,
  subscriber_pubkey,
  price_id,
}) => {
  try {
    let res = await axiosInstance.post("/api/v1/subscribe", {
      creator_pubkey,
      subscriber_pubkey,
      price_id,
    });
    return res.data;
  } catch (err) {
    console.log(err);
    return false;
  }
};
