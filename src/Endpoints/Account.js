import axiosInstance from "@/Helpers/HTTP_Client";

export const USERNAME_MIN = 3;
export const USERNAME_MAX = 30;
export const USERNAME_PATTERN = /^[a-z0-9_-]+$/;

export const validateUsername = (value) => {
  const username = (value || "").trim().toLowerCase();
  if (!username) return "empty";
  if (username.length < USERNAME_MIN || username.length > USERNAME_MAX)
    return "length";
  if (!USERNAME_PATTERN.test(username)) return "charset";
  return null;
};

export const normalizeToUsername = (value) => {
  const normalized = (value || "")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "")
    .replace(/[^a-z0-9_-]/g, "")
    .slice(0, USERNAME_MAX);
  return normalized.length >= USERNAME_MIN ? normalized : "";
};

export const checkUsernameAvailability = async (username, config) => {
  const { data } = await axiosInstance.get(
    `/api/v1/user/username-availability/${encodeURIComponent(username)}`,
    config,
  );
  return data;
};

export const checkNip05Availability = async (name, config) => {
  const { data } = await axiosInstance.get(
    `/api/v1/user/nip05-availability/${encodeURIComponent(name)}`,
    config,
  );
  return data;
};

export const checkWalletAvailability = async (name, config) => {
  const { data } = await axiosInstance.get(
    `/api/v1/user/wallet-availability/${encodeURIComponent(name)}`,
    config,
  );
  return data;
};

export const AVAILABILITY_CHECKS = {
  username: checkUsernameAvailability,
  nip05: checkNip05Availability,
  wallet: checkWalletAvailability,
};

export const resolveUsername = async (username) => {
  const { data } = await axiosInstance.get(
    `/api/v1/user/username/${encodeURIComponent(username)}`,
  );
  return data;
};

export const claimUsername = async (username) => {
  const { data } = await axiosInstance.post("/api/v1/user/username", {
    username,
  });
  return data;
};

export const claimNip05 = async ({ name, pubkey }) => {
  const { data } = await axiosInstance.post("/api/v1/user/nip05", {
    name,
    pubkey,
  });
  return data;
};

export const createWallet = async (username) => {
  const { data } = await axiosInstance.post("/api/v1/wallet", { username });
  if (!data?.lightningAddress) {
    const error = new Error(data?.message || "Could not create this wallet.");
    error.response = { status: 409, data: { message: error.message } };
    throw error;
  }
  return data;
};

export const markOnboarded = async () => {
  const { data } = await axiosInstance.post("/api/v1/user/onboarded");
  return data;
};
