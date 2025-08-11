import React, { useEffect, useState } from "react";
import { getNoteTree } from "@/Helpers/ClientHelpers";
import LinkRepEventPreview from "@/Components/LinkRepEventPreview";
import { useTranslation } from "react-i18next";

export default function NotePreview({
  content,
  linkedEvent,
  viewPort = false,
}) {
  const [parsedContent, setParsedContent] = useState("");
  const { t } = useTranslation();

  useEffect(() => {
    const parseNote = () => {
      try {
        let parsedNote = getNoteTree(content);
        setParsedContent(parsedNote);
      } catch (err) {
        console.log(err);
        setParsedContent("");
      }
    };
    parseNote();
  }, [content]);

  if (!(content || linkedEvent)) return;
  return (
    <div
      className="fit-container box-pad-h-m box-pad-v-m sc-s-18 bg-sp fx-centered fx-col fx-start-h fx-start-v"
      style={{
        maxHeight: viewPort ? `${viewPort}vh` : "50%",
        overflow: "scroll",
      }}
    >
      <h5 className="gray-c">{t("Ao1TlO5")}</h5>
      <div className="fit-container" dir="auto">
        {parsedContent || content}
      </div>
      {linkedEvent && (
        <div className="fit-container">
          <LinkRepEventPreview event={linkedEvent} />
        </div>
      )}
    </div>
  );
}
