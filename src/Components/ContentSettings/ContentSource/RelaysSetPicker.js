import React from "react";

export default function RelaysSetPicker() {
  return (
    <div
      style={{ position: "relative" }}
      className="fit-container fx-centered fx-start-h if ifs-full"
      ref={optionsRef}
      onClick={() => setShowList(true)}
    >
      <div className="search"> </div>
      <input
        placeholder={t("ALPrAZz")}
        className="if if-no-border ifs-full"
        style={{ height: "var(--40)", paddingLeft: "0" }}
        value={searchedRelay}
        onChange={handleOnChange}
      />
      {showMessage && (
        <div className="box-pad-v-s box-pad-h-s">
          <p className="gray-c p-medium">{t("A2wrBnY")}</p>
        </div>
      )}
    </div>
  );
}
