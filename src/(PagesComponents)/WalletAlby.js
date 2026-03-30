import axios from "axios";
import React, { useEffect, useState } from "react";
import { Link } from "next/link";
import { getWallets, updateWallets } from "@/Helpers/ClientHelpers";
import { customHistory } from "@/Helpers/History";
import { useTranslation } from "react-i18next";

export default function WalletAlby() {
  const location = window.location;

  const { t } = useTranslation();
  const [code, setCode] = useState(false);

  useEffect(() => {
    const getMeData = async () => {
      try {
        let code = new URLSearchParams(location.search).get("code");
        if (!code) {
          setCode("");
          return;
        }
        let fd = new FormData();
        fd.append("code", code);
        fd.append("grant_type", "authorization_code");
        fd.append("redirect_uri", process.env.NEXT_PUBLIC_ALBY_REDIRECT_URL);
        const access_token = await axios.post(
          "https://api.getalby.com/oauth/token",
          fd,
          {
            auth: {
              username: process.env.NEXT_PUBLIC_ALBY_CLIENT_ID,
              password: process.env.NEXT_PUBLIC_ALBY_SECRET_ID,
            },
            headers: {
              "Content-Type": "application/x-www-form-urlencoded",
            },
          },
        );
        const data = await axios.get("https://api.getalby.com/user/me", {
          headers: {
            Authorization: `Bearer ${access_token.data.access_token}`,
          },
        });

        let alby = {
          id: Date.now(),
          kind: 2,
          entitle: data.data.lightning_address,
          active: true,
          data: {
            ...access_token.data,
            created_at: Math.floor(Date.now() / 1000),
          },
        };
        console.log(alby);
        let oldVersion = getWallets();
        if (oldVersion) {
          try {
            oldVersion = oldVersion.map((item) => {
              let updated_item = { ...item };
              updated_item.active = false;
              return updated_item;
            });
            oldVersion.push(alby);
            updateWallets(oldVersion);
            customHistory("/lightning-wallet");
            return;
          } catch (err) {
            updateWallets([alby]);
            customHistory("/lightning-wallet");
            return;
          }
        }
        updateWallets([alby]);
        customHistory("/lightning-wallet");
      } catch (err) {
        console.log(err);
        customHistory("/lightning-wallet");
      }
    };
    getMeData();
  }, []);

  if (code === false) return;
  if (code === "")
    return (
      <div className="fixed-container fx-centered fx-col">
        <h4>{t("Ao1YlmX")} :(</h4>
        <p className="gray-c p-centered" style={{ maxWidth: "300px" }}>
          {t("AWq8fUG")}
        </p>
        <Link href={"/"}>
          <button className="btn btn-normal btn-small">{t("AWroZQj")}</button>
        </Link>
      </div>
    );
}
