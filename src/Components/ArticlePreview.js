import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import rehypeRaw from "rehype-raw";
import katex from "katex";
import "katex/dist/katex.min.css";
import Nip19Parsing from "@/Components/Nip19Parsing";

// Matches a standalone nostr bech32 URI with or without "nostr:" prefix
const NOSTR_ADDR_RE =
  /^(?:nostr:)?(naddr1|note1|nevent1|npub1|nprofile1)[a-z0-9]+$/;

function walkTree(node, parent, index) {
  if (node.type === "paragraph" && parent != null && index != null) {
    if (node.children.length === 1 && node.children[0].type === "text") {
      const text = node.children[0].value.trim();
      const match = text.match(NOSTR_ADDR_RE);
      if (match) {
        const addr = text.startsWith("nostr:") ? text.slice(6) : text;
        parent.children[index] = {
          type: "nostrEmbed",
          data: {
            hName: "div",
            hProperties: { "data-nostr-addr": addr },
          },
          addr,
          children: [],
        };
        return;
      }
    }
  }
  if (node.children) {
    node.children.forEach((child, i) => walkTree(child, node, i));
  }
}

/**
 * Remark plugin: converts any paragraph whose sole text content is a nostr
 * bech32 token into a custom node that renders as Nip19Parsing.
 * Mirrors YakiPro's NostrEntityExtension parseHTML.updateDOM logic.
 */
function remarkNostrEmbeds() {
  return (tree) => walkTree(tree, null, null);
}

export default function ArticlePreview({ content }) {
  if (!content) return null;

  return (
    <div className="article-preview">
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkNostrEmbeds]}
        rehypePlugins={[rehypeHighlight, rehypeRaw]}
        components={{
          // Custom node rendered by remarkNostrEmbeds → hast div[data-nostr-addr]
          div({ node, ...props }) {
            const addr = node?.properties?.["dataNostrAddr"];
            if (addr) {
              return (
                <div style={{ margin: "0.75rem 0" }}>
                  <Nip19Parsing addr={addr} />
                </div>
              );
            }
            return <div {...props} />;
          },

          // react-markdown v10: distinguish inline vs block via className presence
          code({ className, children, ...props }) {
            const isBlock =
              typeof className === "string" &&
              className.startsWith("language-");
            const txt = Array.isArray(children)
              ? String(children[0] ?? "")
              : String(children ?? "");

            if (!isBlock) {
              if (/^\$\$(.*)\$\$/.test(txt)) {
                const html = katex.renderToString(
                  txt.replace(/^\$\$(.*)\$\$/, "$1"),
                  { throwOnError: false }
                );
                return <code dangerouslySetInnerHTML={{ __html: html }} />;
              }
              return (
                <code className={className} {...props}>
                  {children}
                </code>
              );
            }

            if (/^language-katex/i.test(className)) {
              const html = katex.renderToString(txt, { throwOnError: false });
              return (
                <div className="math-block">
                  <code dangerouslySetInnerHTML={{ __html: html }} />
                </div>
              );
            }

            return (
              <code className={className} {...props}>
                {children}
              </code>
            );
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
