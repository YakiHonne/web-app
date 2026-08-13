import Dexie from "dexie";

const aiChatDb = new Dexie("yakihonne_ai_chat");

aiChatDb.version(1).stores({
  sessions: "sessionId, updatedAt",
});

aiChatDb.version(2).stores({
  sessions: "sessionId, updatedAt",
  secondReaderReactions: "personaId, updatedAt",
});

aiChatDb.version(3).stores({
  sessions: "sessionId, pubkey, updatedAt",
  secondReaderReactions: "personaId, pubkey, updatedAt",
}).upgrade(async (tx) => {
  await tx.table("sessions").clear();
  await tx.table("secondReaderReactions").clear();
});

export const ANON_SCOPE = "anon";

export const scopeKey = (pubkey, key) => `${pubkey || ANON_SCOPE}::${key}`;

export default aiChatDb;
