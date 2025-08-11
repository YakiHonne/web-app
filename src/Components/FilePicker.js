import { nanoid } from "nanoid";
import React from "react";

export function FilePicker({ element, kind = "image/*", setFile }) {
  let id = nanoid();
  const Upload = async (e) => {
    let file = e.target.files[0];
    let url = URL.createObjectURL(file);
    if (file) {
      setFile({ file, url });
      return;
    }
  };
  return (
    <label htmlFor={id} style={{ position: "relative" }}>
      {element}
      <input
        id={id}
        name={id}
        type="file"
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          opacity: 0,
          zIndex: -1,
        }}
        accept={kind}
        onChange={Upload}
      ></input>
    </label>
  );
}
