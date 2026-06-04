import { Extension } from "@tiptap/core";
import { diffMarkdownBlocks } from "@/lib/markdownDiff";

function buildFinalMarkdown(hunks) {
  return hunks
    .map((h) => {
      if (h.type === "unchanged") return h.original;
      if (h.status === "rejected") return h.original;
      if (h.type === "removed") return h.status === "accepted" ? "" : h.original;
      return h.proposed;
    })
    .filter((b) => b !== "")
    .join("\n\n");
}

function allResolved(hunks) {
  return hunks
    .filter((h) => h.type !== "unchanged")
    .every((h) => h.status === "accepted" || h.status === "rejected");
}

export const AIDiffExtension = Extension.create({
  name: "aiDiff",

  addOptions() {
    return {
      onDiffStart: () => {},
      onHunkUpdate: () => {},
      onDiffEnd: () => {},
    };
  },

  addStorage() {
    return {
      active: false,
      hunks: [],
      originalMd: "",
    };
  },

  addCommands() {
    return {
      startDiff:
        (proposedMd, originalMd) =>
        ({ editor }) => {
          const hunks = diffMarkdownBlocks(originalMd, proposedMd).map((h) => ({
            ...h,
            status: null,
          }));

          editor.storage.aiDiff.active = true;
          editor.storage.aiDiff.hunks = hunks;
          editor.storage.aiDiff.originalMd = originalMd;

          editor.options.extensions
            .find((e) => e.name === "aiDiff")
            ?.options.onDiffStart(hunks);

          return true;
        },

      acceptHunk:
        (hunkId) =>
        ({ editor }) => {
          const storage = editor.storage.aiDiff;
          storage.hunks = storage.hunks.map((h) =>
            h.id === hunkId ? { ...h, status: "accepted" } : h,
          );

          const ext = editor.options.extensions.find((e) => e.name === "aiDiff");
          ext?.options.onHunkUpdate([...storage.hunks]);

          if (allResolved(storage.hunks)) {
            const finalMd = buildFinalMarkdown(storage.hunks);
            storage.active = false;
            storage.hunks = [];
            storage.originalMd = "";
            ext?.options.onDiffEnd(finalMd);
          }

          return true;
        },

      rejectHunk:
        (hunkId) =>
        ({ editor }) => {
          const storage = editor.storage.aiDiff;
          storage.hunks = storage.hunks.map((h) =>
            h.id === hunkId ? { ...h, status: "rejected" } : h,
          );

          const ext = editor.options.extensions.find((e) => e.name === "aiDiff");
          ext?.options.onHunkUpdate([...storage.hunks]);

          if (allResolved(storage.hunks)) {
            const finalMd = buildFinalMarkdown(storage.hunks);
            storage.active = false;
            storage.hunks = [];
            storage.originalMd = "";
            ext?.options.onDiffEnd(finalMd);
          }

          return true;
        },
    };
  },
});
