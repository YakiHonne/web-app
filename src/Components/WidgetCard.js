import React, { useEffect, useState } from "react";
import { nip19 } from "nostr-tools";
import OptionsDropdown from "@/Components/OptionsDropdown";
import Link from "next/link";
import ShareLink from "@/Components/ShareLink";
import PreviewWidget from "@/Components/SmartWidget/PreviewWidget";
import AuthorPreview from "@/Components/AuthorPreview";
import { useDispatch, useSelector } from "react-redux";
import { setToast } from "@/Store/Slides/Publishers";
import { getUser } from "@/Helpers/Controlers";
import PostAsNote from "@/Components/PostAsNote";
import { useTranslation } from "react-i18next";

export default function WidgetCard({ widget, deleteWidget, options = true }) {
  const dispatch = useDispatch();
  const nostrAuthors = useSelector((state) => state.nostrAuthors);
  const userKeys = useSelector((state) => state.userKeys);
  const [authorData, setAuthorData] = useState(widget.author);
  const [postNoteWithWidgets, setPostNoteWithWidget] = useState(false);
  const { t } = useTranslation();

  useEffect(() => {
    const fetchData = async () => {
      try {
        let auth = getUser(widget.author.pubkey);

        if (auth) {
          setAuthorData(auth);
        }
        return;
      } catch (err) {
        console.log(err);
      }
    };
    fetchData();
  }, [nostrAuthors]);

  const copyNaddr = () => {
    let naddr = nip19.naddrEncode({
      pubkey: widget.pubkey,
      identifier: widget.d,
      kind: widget.kind,
    });
    navigator?.clipboard?.writeText(naddr);
    dispatch(
      setToast({
        type: 1,
        desc: `${t("AHAP58g")} 👏`,
      })
    );
  };

  return (
    <>
      {postNoteWithWidgets && (
        <PostAsNote
          content={`https://yakihonne.com/smart-widget-checker?naddr=${widget.naddr}`}
          exit={() => setPostNoteWithWidget(false)}
        />
      )}

      <div
        className="box-pad-h-m box-pad-v-m sc-s-18 fx-centered fx-col fit-container fx-start-h fx-start-v"
        style={{ overflow: "visible" }}
      >
        <div className="fit-container fx-scattered">
          <AuthorPreview author={authorData} />
          {options && (
            <OptionsDropdown
              options={[
                <div
                  className="fit-container"
                  onClick={() => setPostNoteWithWidget(true)}
                >
                  <p>{t("AB8DnjO")}</p>
                </div>,
                <div className="fit-container" onClick={copyNaddr}>
                  <p>{t("ApPw14o", { item: "naddr" })}</p>
                </div>,
                <Link
                  className="fit-container"
                  href={"/smart-widget-builder"}
                  state={{ ops: "clone", metadata: { ...widget } }}
                >
                  <p>{t("AyWVBDx")}</p>
                </Link>,
                <Link
                  className="fit-container"
                  href={`/smart-widget-checker?naddr=${nip19.naddrEncode({
                    pubkey: widget.pubkey,
                    identifier: widget.d,
                    kind: widget.kind,
                  })}`}
                >
                  <p>{t("AavUrQj")}</p>
                </Link>,
                deleteWidget && userKeys.pub === widget.pubkey && (
                  <Link
                    className="fit-container"
                    href={"/smart-widget-builder"}
                    state={{ ops: "edit", metadata: { ...widget } }}
                  >
                    <p>{t("AsXohpb")}</p>
                  </Link>
                ),
                deleteWidget && userKeys.pub === widget.pubkey && (
                  <div className="fit-container" onClick={deleteWidget}>
                    <p className="red-c">{t("Almq94P")}</p>
                  </div>
                ),
                <ShareLink
                  label={t("AGB5vpj")}
                  path={`/${nip19.naddrEncode({
                    pubkey: widget.pubkey,
                    identifier: widget.d,
                    kind: widget.kind,
                  })}`}
                  title={widget.title || widget.description}
                  description={widget.description || widget.title}
                />,
              ]}
            />
          )}
        </div>
        <PreviewWidget widget={widget.metadata} pubkey={widget.pubkey} />
        {(widget.title || widget.description) && (
          <div
            className="fx-centered fx-col fx-start-h fx-start-v fit-container "
            style={{ rowGap: 0 }}
          >
            <p>{widget.title || t("AMvUjqZ")}</p>
            {widget.description && (
              <p className="gray-c p-medium">{widget.description}</p>
            )}
            {!widget.description && (
              <p className="gray-c p-italic p-medium">No description</p>
            )}
          </div>
        )}
      </div>
    </>
  );
}
