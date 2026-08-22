const GB = 1024 * 1024 * 1024;
const MB = 1024 * 1024;

export const YAKI_BLOSSOM = "https://blossom.yakihonne.com";

export const PLAN_QUOTAS = {
  free: 500 * MB,
  trial: 500 * MB,
  basic: 50 * GB,
  premium: 100 * GB,
};

export const formatBytes = (bytes) => {
  if (!bytes) return "0 B";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < MB) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < GB) return `${(bytes / MB).toFixed(1)} MB`;
  return `${(bytes / GB).toFixed(2)} GB`;
};
