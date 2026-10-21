import { generateSecretKey, getPublicKey, nip44 } from "nostr-tools";
import { bytesToHex, hexToBytes } from "nostr-tools/utils";
import { db } from "@/Helpers/DB";

// Last known plan of an account, kept so a reload does not start as free while
// the backend is being asked. The value is NIP-44 encrypted with a throwaway
// key that is regenerated on every write, and both records sit under names
// that say nothing about what they hold. Any record that is missing, edited or
// belongs to another account fails to decrypt and is dropped, which leaves the
// account on the free plan until the backend answers.
const TABLE = "layoutHints";
const seedKey = (pubkey) => `rv_${pubkey}`;
const blobKey = (pubkey) => `rs_${pubkey}`;

let queue = Promise.resolve();
const enqueue = (task) => {
  queue = queue.then(task, task);
  return queue;
};

const table = () => (db ? db.table(TABLE) : null);

const remove = async (pubkey) => {
  try {
    await table()?.bulkDelete([seedKey(pubkey), blobKey(pubkey)]);
  } catch {}
};

export const getCachedSubscription = (pubkey) =>
  enqueue(async () => {
    if (!pubkey || !table()) return null;
    try {
      const [seed, blob] = await table().bulkGet([
        seedKey(pubkey),
        blobKey(pubkey),
      ]);
      if (!seed && !blob) return null;
      const secret = hexToBytes(seed);
      const payload = JSON.parse(
        nip44.v2.decrypt(
          blob,
          nip44.v2.utils.getConversationKey(secret, getPublicKey(secret)),
        ),
      );
      if (payload?.p !== pubkey || !payload.f) throw new Error("mismatch");
      return payload.f;
    } catch {
      await remove(pubkey);
      return null;
    }
  });

export const saveCachedSubscription = (pubkey, fields) =>
  enqueue(async () => {
    if (!pubkey || !fields || !table()) return;
    try {
      const secret = generateSecretKey();
      const blob = nip44.v2.encrypt(
        JSON.stringify({ p: pubkey, f: fields }),
        nip44.v2.utils.getConversationKey(secret, getPublicKey(secret)),
      );
      await db.transaction("rw", table(), async () => {
        await table().bulkPut(
          [bytesToHex(secret), blob],
          [seedKey(pubkey), blobKey(pubkey)],
        );
      });
    } catch {}
  });

export const clearCachedSubscription = (pubkey) =>
  enqueue(async () => {
    if (!pubkey || !table()) return;
    await remove(pubkey);
  });

// Earlier builds kept this in localStorage in plain text.
if (typeof window !== "undefined") {
  try {
    localStorage.removeItem("yaki-sub-status");
  } catch {}
}
