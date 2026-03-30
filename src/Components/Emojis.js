import EmojiPicker from "emoji-picker-react";
import { useTheme } from "next-themes";
import React, { useEffect, useRef, useState } from "react";
import Icon from "@/Components/Icon";

export default function Emojis({ setEmoji, position = "left" }) {
  // const isDarkMode = useSelector((state) => state.isDarkMode);
  const { resolvedTheme } = useTheme();
  const isDarkMode = ["dark", "gray", "system"].includes(resolvedTheme);
  const [showEmoji, setShowEmoji] = useState(false);
  const optionsRef = useRef(null);

  useEffect(() => {
    const handleOffClick = (e) => {
      e.stopPropagation();
      if (optionsRef.current && !optionsRef.current.contains(e.target))
        setShowEmoji(false);
    };
    document.addEventListener("mousedown", handleOffClick);
    return () => {
      document.removeEventListener("mousedown", handleOffClick);
    };
  }, [optionsRef]);

  return (
    <div style={{ position: "relative" }} ref={optionsRef}>
      <div className="pointer" onClick={() => setShowEmoji(!showEmoji)}>
        <Icon name="emoji" size={24} />
      </div>
      {showEmoji && (
        <div
          className={`${position === "left" ? "drop-down-r" : "drop-down"}`}
          style={{
            position: "absolute",
            bottom: "calc(100% + 5px)",
            zIndex: 102,
          }}
        >
          <EmojiPicker
            reactionsDefaultOpen={true}
            theme={isDarkMode ? "dark" : "light"}
            previewConfig={{ showPreview: false }}
            skinTonesDisabled={true}
            searchDisabled={false}
            height={300}
            onEmojiClick={(data) => setEmoji(data.emoji)}
          />
        </div>
      )}
    </div>
  );
}
