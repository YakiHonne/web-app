import React from "react";
let id = "file-selector-" + Math.random().toString(36).substring(2, 9);

export default function FileSelectorWrapper({
  onChange,
  children,
  accept,
  multiple,
}) {
  const handleOnChange = (e) => {
    let file = e.target.files[0];
    onChange(file);
  };
  return (
    <label htmlFor={id} className="pointer">
      {children}
      <input
        type="file"
        accept={accept || "image/*"}
        multiple={multiple || false}
        id={id}
        name={id}
        onChange={handleOnChange}
      />
    </label>
  );
}
