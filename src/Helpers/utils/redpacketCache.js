const redpacketCache = new Map();

export function getRedPacket(preimage) {
  const redpacket = redpacketCache.get(preimage);
  if (!redpacket) return null;

  const { isRedeemed, isExpired, created_at } = redpacket;
  const deadline = created_at + 3 * 24 * 60 * 60; // 3 days in seconds
  const now = Math.floor(Date.now() / 1000);

  // return the redpacket if isRedeemed is true or isExpired is true, or if isExpired is false and the created_at + 3 days hasent yet reached the deadline, in this order
  if (isRedeemed || isExpired) {
    return redpacket;
  }

  if (now < deadline) {
    return redpacket;
  } else {
    // return null and remove it from the cache if the isExpired is false and the created_at + 3 days is reached the deadline
    redpacketCache.delete(preimage);
    return null;
  }
}

export function setRedPacket(preimage, data) {
  redpacketCache.set(preimage, {
    ...data,
    preimage,
  });

  if (redpacketCache.size > 200) {
    const firstKey = redpacketCache.keys().next().value;
    redpacketCache.delete(firstKey);
  }
}

export function getAllRedPackets() {
  return Array.from(redpacketCache.values());
}
