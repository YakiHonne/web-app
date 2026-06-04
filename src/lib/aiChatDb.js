import Dexie from "dexie";

const aiChatDb = new Dexie("yakihonne_ai_chat");

aiChatDb.version(1).stores({
  sessions: "sessionId, updatedAt",
});

aiChatDb.version(2).stores({
  sessions: "sessionId, updatedAt",
  secondReaderReactions: "personaId, updatedAt",
});

export default aiChatDb;
