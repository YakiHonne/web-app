import { Node, mergeAttributes, ReactNodeViewRenderer, NodeViewWrapper } from "@tiptap/react";
import React from "react";
import Nip19Parsing from "@/Components/Nip19Parsing";

function NostrEntityView({ node, selected }) {
  const { addr } = node.attrs;
  return (
    <NodeViewWrapper
      contentEditable={false}
      data-drag-handle
      style={{
        outline: selected ? "2px solid var(--color-primary-accent)" : "none",
        outlineOffset: 2,
        borderRadius: 10,
        margin: "6px 0",
        display: "block",
        userSelect: "none",
      }}
    >
      <Nip19Parsing addr={addr} />
    </NodeViewWrapper>
  );
}

const NostrEntityExtension = Node.create({
  name: "nostrEntity",
  group: "block",
  atom: true,
  draggable: true,
  selectable: true,
  isolating: false,

  addAttributes() {
    return {
      addr: { default: "" },
    };
  },

  parseHTML() {
    return [{ tag: "div[data-nostr-entity]" }];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "div",
      mergeAttributes({ "data-nostr-entity": HTMLAttributes.addr }, HTMLAttributes),
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(NostrEntityView);
  },

  addCommands() {
    return {
      insertNostrEntity:
        (attrs) =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs,
          });
        },
    };
  },

  addStorage() {
    return {
      markdown: {
        serialize(state, node) {
          state.write(`nostr:${node.attrs.addr}`);
          state.closeBlock(node);
        },
        parse: {
          updateDOM(element) {
            element.querySelectorAll("p").forEach((p) => {
              const text = p.textContent.trim();
              const match = text.match(
                /^(?:nostr:)?((?:naddr1|note1|nevent1|npub1|nprofile1)[a-zA-Z0-9]+)$/,
              );
              if (match) {
                const div = document.createElement("div");
                div.setAttribute("data-nostr-entity", match[1]);
                div.setAttribute("addr", match[1]);
                p.replaceWith(div);
              }
            });
          },
        },
      },
    };
  },

  addInputRules() {
    return [
      {
        find: /(?:^|\s)nostr:(naddr1|note1|nevent1|npub1|nprofile1)[a-zA-Z0-9]+$/,
        handler({ range, match, chain }) {
          const addr = match[0].trim().replace("nostr:", "");
          chain().deleteRange(range).insertContent({ type: "nostrEntity", attrs: { addr } }).run();
        },
      },
      {
        find: /(?:^|\s)(naddr1|note1|nevent1|npub1|nprofile1)[a-zA-Z0-9]+$/,
        handler({ range, match, chain }) {
          const addr = match[0].trim();
          chain().deleteRange(range).insertContent({ type: "nostrEntity", attrs: { addr } }).run();
        },
      },
    ];
  },

  addPasteRules() {
    return [
      {
        find: /(?:nostr:)?(naddr1|note1|nevent1|npub1|nprofile1)[a-zA-Z0-9]+/g,
        handler({ range, match, chain }) {
          const raw = match[0];
          const addr = raw.startsWith("nostr:") ? raw.slice(6) : raw;
          chain().deleteRange(range).insertContent({ type: "nostrEntity", attrs: { addr } }).run();
        },
      },
    ];
  },
});

export default NostrEntityExtension;
