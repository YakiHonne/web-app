import { useState, useRef, useEffect } from "react";

export default function useLastEditedParagraph(editor, debounceMs = 9000) {
  const [lastEdited, setLastEdited] = useState(null);
  const timerRef = useRef(null);
  const lastIndexRef = useRef(-1);

  useEffect(() => {
    if (!editor) return;

    const handleUpdate = () => {
      const { state } = editor;
      const { selection, doc } = state;

      let foundIndex = -1;
      let foundText = "";
      let beforeText = "";
      let afterText = "";

      doc.forEach((node, offset, index) => {
        const nodeStart = offset;
        const nodeEnd = offset + node.nodeSize;
        if (
          selection.from >= nodeStart &&
          selection.from <= nodeEnd &&
          foundIndex === -1
        ) {
          foundIndex = index;
          foundText = node.textContent;

          const texts = [];
          doc.forEach((n) => texts.push(n.textContent));
          beforeText = texts.slice(Math.max(0, index - 2), index).join("\n\n");
          afterText = texts.slice(index + 1, index + 3).join("\n\n");
        }
      });

      if (foundIndex === -1 || !foundText.trim()) return;

      if (foundIndex !== lastIndexRef.current) {
        clearTimeout(timerRef.current);
        lastIndexRef.current = foundIndex;
      }

      clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        setLastEdited({
          index: foundIndex,
          text: foundText,
          before: beforeText,
          after: afterText,
        });
      }, debounceMs);
    };

    editor.on("update", handleUpdate);
    return () => {
      editor.off("update", handleUpdate);
      clearTimeout(timerRef.current);
    };
  }, [editor, debounceMs]);

  return lastEdited;
}
