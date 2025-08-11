import React, { useEffect, useState } from "react";
import { marked } from "marked";

const ChatBubble = ({ text, animateOnDemand = false }) => {
  const [displayedContent, setDisplayedContent] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  // Parse Markdown and prepare content for animation
  const parseMarkdown = (markdownText) => {
    marked.setOptions({
      breaks: true,
      gfm: true,
    });

    const tokens = marked.lexer(markdownText);
    const elements = [];

    tokens.forEach((token) => {
      if (token.type === "space") {
        return;
      }
      if (token.type === "paragraph" || token.type === "heading") {
        // Parse inline Markdown (e.g., bold, italic) within the text
        const inlineHtml = marked.parseInline(token.text);
        const words = inlineHtml.split(/\s+/).filter(Boolean);
        if (words.length > 0) {
          elements.push({
            type: "text",
            tag: token.type === "heading" ? `h${token.depth}` : "p",
            words,
            rawText: token.text, // Store raw text for word splitting
          });
        }
      } else if (token.type === "code") {
        elements.push({
          type: "code",
          content: token.text,
          lang: token.lang || "",
        });
      } else if (token.type === "list") {
        const items = token.items
          .map((item) => {
            const inlineHtml = marked.parseInline(item.text);
            const words = inlineHtml.split(/\s+/).filter(Boolean);
            if (words.length === 0) return null;
            return {
              type: "list_item",
              words,
              rawText: item.text,
            };
          })
          .filter(Boolean);
        if (items.length > 0) {
          elements.push({ type: "list", items });
        }
      } else if (token.type === "text") {
        const inlineHtml = marked.parseInline(token.text);
        const words = inlineHtml.split(/\s+/).filter(Boolean);
        if (words.length > 0) {
          elements.push({ type: "text", tag: "p", words, rawText: token.text });
        }
      }
    });

    return elements;
  };

  useEffect(() => {
    const elements = parseMarkdown(text);
    const allItems = [];

    elements.forEach((element) => {
      if (!element) return;
      if (element.type === "text" && element.words) {
        // Split rawText into words to preserve the original word boundaries
        const rawWords = element.rawText.split(/\s+/).filter(Boolean);
        allItems.push(
          ...element.words.map((word, idx) => ({
            type: "word",
            content: word,
            rawContent: rawWords[idx], // Store the raw word for rendering
            tag: element.tag,
          })),
          { type: "space" }
        );
      } else if (element.type === "code") {
        allItems.push({ type: "code", content: element.content, lang: element.lang });
        allItems.push({ type: "space" });
      } else if (element.type === "list" && element.items) {
        element.items.forEach((item, index) => {
          if (item && item.words) {
            const rawWords = item.rawText.split(/\s+/).filter(Boolean);
            allItems.push(
              ...item.words.map((word, idx) => ({
                type: "word",
                content: word,
                rawContent: rawWords[idx],
                tag: "li",
                listIndex: index,
              })),
              { type: "space" }
            );
          }
        });
      }
    });

    if (animateOnDemand) {
      setDisplayedContent([]);
      setCurrentIndex(0);
      setIsAnimating(true);

      let itemIndex = 0;
      const interval = setInterval(() => {
        if (itemIndex < allItems.length) {
          setDisplayedContent((prev) => [...prev, allItems[itemIndex]]);
          setCurrentIndex(itemIndex + 1);
          itemIndex++;
        } else {
          clearInterval(interval);
          setIsAnimating(false);
        }
      }, 100);

      return () => clearInterval(interval);
    } else {
      setDisplayedContent(allItems);
      setCurrentIndex(allItems.length);
      setIsAnimating(false);
    }
  }, [text, animateOnDemand]);

  const renderContent = () => {
    let currentListIndex = -1;
    let listOpen = false;

    return displayedContent.map((item, index) => {
      if (!item) return null;
      if (item.type === "word") {
        const Tag = item.tag || "span";
        if (item.tag === "li") {
          if (item.listIndex !== currentListIndex) {
            const prevListClose = listOpen ? "</ul>" : "";
            currentListIndex = item.listIndex;
            listOpen = true;
            return (
              <React.Fragment key={index}>
                {prevListClose && <div dangerouslySetInnerHTML={{ __html: prevListClose }} />}
                <ul>
                  <li>
                    <span
                      className="word"
                      dangerouslySetInnerHTML={{ __html: item.content }}
                    />
                  </li>
                </ul>
              </React.Fragment>
            );
          }
          return (
            <span
              key={index}
              className="word"
              dangerouslySetInnerHTML={{ __html: item.content }}
            />
          );
        }
        return (
          <Tag key={index}>
            <span
              className="word"
              dangerouslySetInnerHTML={{ __html: item.content }}
            />
          </Tag>
        );
      } else if (item.type === "code") {
        return (
          <pre key={index} className="code-block">
            <code>{item.content}</code>
          </pre>
        );
      } else if (item.type === "space") {
        const listClose = listOpen ? "</ul>" : "";
        listOpen = false;
        return (
          <React.Fragment key={index}>
            {listClose && <div dangerouslySetInnerHTML={{ __html: listClose }} />}
            <br />
          </React.Fragment>
        );
      }
      return null;
    });
  };

  return (
    <div className="chat-bubble-container">
      <div className="chat-bubble">
        {renderContent()}
        {isAnimating && currentIndex < displayedContent.length && (
          <span className="cursor">|</span>
        )}
      </div>
    </div>
  );
};

export default ChatBubble;