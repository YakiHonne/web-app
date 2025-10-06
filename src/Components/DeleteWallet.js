import React from 'react'
import { useDispatch } from 'react-redux'
import { useTranslation } from 'react-i18next'
import { setToast } from '@/Store/Slides/Publishers'
import { shortenKey } from '@/Helpers/Encryptions'

export default function DeleteWallet({ exit, handleDelete, wallet }) {
    const { t } = useTranslation();
    const dispatch = useDispatch();
  
    const copyText = (keyType, key) => {
      navigator.clipboard.writeText(key);
      dispatch(
        setToast({
          type: 1,
          desc: `${keyType} 👏`,
        })
      );
    };
    return (
      <section className="fixed-container fx-centered box-pad-h">
        <section
          className="fx-centered fx-col sc-s-18 bg-sp box-pad-h box-pad-v"
          style={{ width: "450px" }}
        >
          <div
            className="fx-centered box-marg-s"
            style={{
              minWidth: "54px",
              minHeight: "54px",
              borderRadius: "var(--border-r-50)",
              backgroundColor: "var(--red-main)",
            }}
          >
            <div className="warning"></div>
          </div>
          <h3 className="p-centered">{t("APJU882")}</h3>
          <p className="p-centered gray-c box-pad-v-m">{t("AOlHR1d")}</p>
          <div
            className={"fx-scattered if pointer fit-container dashed-onH"}
            style={{ borderStyle: "dashed" }}
            onClick={() => copyText(t("A6Pj02S"), wallet.data)}
          >
            <p>{shortenKey(wallet.data, 15)}</p>
            <div className="copy-24"></div>
          </div>
          <p className="c1-c p-medium p-centered box-pad-h-m">{t("AshEtUl")}</p>
          <div className="fx-centered fit-container">
            <button className="fx btn btn-gst-red" onClick={handleDelete}>
              {t("Almq94P")}
            </button>
            <button className="fx btn btn-red" onClick={exit}>
              {t("AB4BSCe")}
            </button>
          </div>
        </section>
      </section>
    );
  };
  