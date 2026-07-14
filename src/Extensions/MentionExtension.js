import { Node, mergeAttributes, ReactNodeViewRenderer, NodeViewWrapper } from "@tiptap/react";
import { Plugin, PluginKey } from "@tiptap/pm/state";
import React from "react";
import Nip19Parsing from "@/Components/Nip19Parsing";

function MentionView({ node }) {
  const { addr } = node.attrs;
  return (
    <NodeViewWrapper as="span" contentEditable={false} style={{ display: "inline-block" }}>
      <Nip19Parsing addr={addr} minimal={true} />
    </NodeViewWrapper>
  );
}

export const mentionPluginKey = new PluginKey("mentionSuggestion");

const MentionExtension = Node.create({
  name: "mention",
  group: "inline",
  inline: true,
  atom: true,
  selectable: true,
  draggable: false,

  addAttributes() {
    return {
      addr: { default: "" },
    };
  },

  parseHTML() {
    return [{ tag: "span[data-mention]" }];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "span",
      mergeAttributes({ "data-mention": HTMLAttributes.addr }, HTMLAttributes),
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(MentionView);
  },

  addCommands() {
    return {
      insertMention:
        (attrs) =>
        ({ commands }) => {
          return commands.insertContent([
            { type: this.name, attrs },
            { type: "text", text: " " },
          ]);
        },
    };
  },

  addStorage() {
    return {
      handlers: {
        onArrowDown: null,
        onArrowUp: null,
        onEnter: null,
        onEscape: null,
      },
      markdown: {
        serialize(state, node) {
          state.write(`nostr:${node.attrs.addr}`);
        },
        parse: {
          updateDOM(element) {
            const regex = /nostr:(nprofile1[a-zA-Z0-9]+|npub1[a-zA-Z0-9]+)/g;
            element.querySelectorAll("p").forEach((p) => {
              const textNodes = [];
              const walker = document.createTreeWalker(p, NodeFilter.SHOW_TEXT);
              let n;
              while ((n = walker.nextNode())) textNodes.push(n);

              textNodes.forEach((textNode) => {
                const text = textNode.textContent;
                regex.lastIndex = 0;
                if (!regex.test(text)) return;
                regex.lastIndex = 0;

                const frag = document.createDocumentFragment();
                let lastIndex = 0;
                let match;
                while ((match = regex.exec(text))) {
                  frag.appendChild(document.createTextNode(text.slice(lastIndex, match.index)));
                  const span = document.createElement("span");
                  span.setAttribute("data-mention", match[1]);
                  span.setAttribute("addr", match[1]);
                  frag.appendChild(span);
                  lastIndex = match.index + match[0].length;
                }
                frag.appendChild(document.createTextNode(text.slice(lastIndex)));
                textNode.replaceWith(frag);
              });
            });
          },
        },
      },
    };
  },

  addKeyboardShortcuts() {
    const isActive = () => mentionPluginKey.getState(this.editor.state)?.active;
    const runHandler = (name) => {
      if (!isActive()) return false;
      const handler = this.storage.handlers[name];
      if (!handler) return false;
      return handler() !== false;
    };
    return {
      ArrowDown: () => runHandler("onArrowDown"),
      ArrowUp: () => runHandler("onArrowUp"),
      Enter: () => runHandler("onEnter"),
      Escape: () => runHandler("onEscape"),
    };
  },

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: mentionPluginKey,
        state: {
          init() {
            return { active: false, query: "", from: 0, to: 0 };
          },
          apply(tr, prev) {
            const meta = tr.getMeta(mentionPluginKey);
            if (meta) return meta;
            if (!tr.docChanged && !tr.selectionSet) return prev;

            const { selection } = tr;
            if (!selection.empty) return { active: false, query: "", from: 0, to: 0 };

            const { $from } = selection;
            const textBefore = $from.parent.textBetween(
              Math.max(0, $from.parentOffset - 200),
              $from.parentOffset,
              undefined,
              "￼",
            );
            const match = textBefore.match(/(?:^|\s)@(\w*)$/);
            if (!match) return { active: false, query: "", from: 0, to: 0 };

            const from = $from.pos - match[1].length - 1;
            return { active: true, query: match[1], from, to: $from.pos };
          },
        },
      }),
    ];
  },
});

export default MentionExtension;
