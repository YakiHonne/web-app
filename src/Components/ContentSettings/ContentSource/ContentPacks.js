import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import AddPack from "./AddPack";
import usePacks from "@/Hooks/usePacks";
import ToDeleteGeneral from "@/Components/ToDeleteGeneral";

export default function ContentPacks({ exit, type }) {
  let kind = type === 3 ? 39092 : 39089;
  const { t } = useTranslation();
  const [showAddPack, setShowAddPack] = useState(false);
  const { userStarterPacksSimplified, userMediaPacksSimplified, removePack } =
    usePacks();
  const [toEdit, setToEdit] = useState(null);
  const [initDeletion, setInitDeletion] = useState(false);

  const handleRefreshAfterDeletion = (id) => {
    removePack(id, kind === 39089 ? "s" : "m");
    setInitDeletion(false);
  };

  return (
    <>
      {showAddPack && (
        <AddPack
          exit={() => {
            setShowAddPack(false);
            setToEdit(false);
          }}
          kind={kind}
          toEdit={toEdit}
        />
      )}
      {initDeletion && (
        <ToDeleteGeneral
          title={initDeletion.title}
          description={t("AQtOsjy")}
          aTag={initDeletion.aTag}
          eventId={initDeletion.id}
          refresh={handleRefreshAfterDeletion}
          cancel={() => setInitDeletion(false)}
        />
      )}
      <div className="fit-container fx-centered fx-start-h fx-start-v fx-col box-pad-h box-pad-v">
        <div className="fit-container fx-scattered">
          <div>
            <p className="c1-c">{t("AVzZUeP")}</p>
          </div>
          <div className="fx-centered">
            <button
              className="btn btn-normal btn-small"
              onClick={() => setShowAddPack(true)}
            >
              {t("ABk34pX")}
            </button>
          </div>
        </div>
        <div className="fit-container fx-centered fx-col">
          {[
            ...(kind === 39089
              ? userStarterPacksSimplified
              : userMediaPacksSimplified),
          ].map((pack) => {
            return (
              <div className="fit-container fx-scattered sc-s bg-sp box-pad-h-m box-pad-v-m">
                <div className="fx-centered">
                  <div
                    style={{
                      backgroundImage: `url(${pack.image})`,
                      backgroundColor: "var(--pale-gray)",
                      minWidth: "58px",
                      minHeight: "58px",
                      borderRadius: "50%",
                    }}
                    className="bg-img cover-bg"
                  ></div>
                  <div>
                    <p className="p-maj p-big">{pack.title}</p>
                    <p className={"gray-c"}>
                      {t("AO5wH7I", { usersCount: pack.pCount })}
                    </p>
                  </div>
                </div>
                <div className="fx-centered">
                  <button
                    className="btn btn-small btn-gray"
                    onClick={() => {
                      setShowAddPack(true);
                      setToEdit(pack);
                    }}
                  >
                    {t("AsXohpb")}
                  </button>
                  <div
                    className="trash-24"
                    onClick={() => setInitDeletion(pack)}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>

        {((userStarterPacksSimplified.length === 0 && kind === 39089) ||
          (userMediaPacksSimplified.length === 0 && kind === 39092)) && (
          <div
            className="fit-container fx-centered"
            style={{ height: "150px" }}
          >
            <div className="fx-centered fx-col box-pad-h box-pad-v">
              <p>{t("AyFwASq")}</p>
              <p className="gray-c p-centered box-pad-h">{t("AkndLSD")}</p>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
