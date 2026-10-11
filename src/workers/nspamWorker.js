import { NSpamModel } from "./nspam/nspam";

let model = null;

onmessage = async (e) => {
  const { requestId, type, modelUrl, notesByAuthor } = e.data;
  try {
    if (type === "init") {
      model = await NSpamModel.load(modelUrl);
      postMessage({ requestId });
      return;
    }
    if (type === "score") {
      if (!model) throw new Error("The nspam model is not loaded.");
      let scores = {};
      for (const [pubkey, notes] of Object.entries(notesByAuthor || {})) {
        scores[pubkey] = model.score(notes);
      }
      postMessage({ requestId, scores });
    }
  } catch (err) {
    postMessage({ requestId, error: err?.message || `${err}` });
  }
};
