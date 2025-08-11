import React, { useState, useEffect, Fragment } from "react";
import { verifyEvent } from "@/Helpers/Helpers";
import { useTranslation } from "react-i18next";

export default function SWEventStructure({ widget }) {
  const { t } = useTranslation();
  const [event, setEvent] = useState(widget ? verifyEvent(widget) : false);

  useEffect(() => {
    if (widget) setEvent(verifyEvent(widget));
  }, [widget]);

  return (
    <div>
      {!widget && (
        <div className="fit-container fit-height fx-centered fx-col">
          <h4>{t("AzpYkqp")}</h4>
          <p className="gray-c">{t("AbEJdOl")}</p>
        </div>
      )}
      {!event && widget && (
        <div
          className="fit-container fit-height fx-centered fx-col"
          style={{ height: "60vh" }}
        >
          <h4>{t("ATiRh0z")}</h4>
          <p className="gray-c">{t("AbEJdOl")}</p>
        </div>
      )}
      {event && widget && <EventStructure event={event} />}
    </div>
  );
}

const EventStructure = ({ event }) => {
  const { t } = useTranslation();
  return (
    <div className=" fx-centered fx-col fx-start-h fx-start-v">
      <div>
        <p>{t("AqTI7Iu")}</p>
        <h4>{event.content || "N/A"}</h4>
      </div>

      <hr />
      <div>
        <p>{t("AdVoc9X")}</p>
        <p className="gray-c">{event.identifier || "N/A"}</p>
      </div>
      <hr />
      <div>
        <p>{t("AA4MGb0")}</p>
        <p className="gray-c">{event.pubkey || "N/A"}</p>
      </div>
      <hr />
      <div>
        <p>{t("ARyebOH", { kind: "" })}</p>
        <p className="gray-c">{event.kind || "N/A"}</p>
      </div>
      <hr />
      <div>
        <p>{t("AAOFuOo")}</p>
        <div className="box-pad-h box-pad-v-s fx-centered fx-col fx-start-h fx-start-v">
          <div className="fit-container fx-scattered fx-start-v">
            <div>
              <p>image</p>
              <p className="gray-c p-three-lines">{event.image || "N/A"}</p>
            </div>
            {event.image_status && <div className="checkmark-tt-24"></div>}
            {!event.image_status && <div className="crossmark-tt-24"></div>}
          </div>
          <hr />
          {event.input && (
            <>
              <div className="fit-container fx-scattered fx-start-v">
                <div>
                  <p>input</p>
                  <p className="gray-c">{event.input || "N/A"}</p>
                </div>
                <div className="checkmark-tt-24"></div>
              </div>
              <hr />
            </>
          )}
          {event.buttons.map((btn, index) => {
            return (
              <Fragment key={index}>
                <div>
                  <p>Button {index + 1}</p>
                  <div
                    className="box-pad-v-s fx-centered fx-col fx-start-h fx-start-v"
                    style={{ paddingLeft: "1rem" }}
                  >
                    <div className="fit-container fx-scattered fx-start-v">
                      <div className="fit-container fx-centered fx-start-h fx-start-v">
                        <p className="c1-c" style={{ minWidth: "50px" }}>
                          label
                        </p>
                        <p className="gray-c">{btn.label || "N/A"}</p>
                      </div>
                      {btn.label && <div className="checkmark-tt-24"></div>}
                      {!btn.label && <div className="crossmark-tt-24"></div>}
                    </div>
                    <hr />
                    <div className="fit-container fx-scattered fx-start-v">
                      <div className="fit-container fx-centered fx-start-h fx-start-v">
                        <p className="c1-c" style={{ minWidth: "50px" }}>
                          type
                        </p>
                        <p className="gray-c">{btn.type || "N/A"}</p>
                      </div>
                      {btn.type_status && (
                        <div className="checkmark-tt-24"></div>
                      )}
                      {!btn.type_status && (
                        <div className="crossmark-tt-24"></div>
                      )}
                    </div>
                    <hr />
                    <div className="fit-container fx-scattered fx-start-v">
                      <div className="fit-container fx-centered fx-start-h fx-start-v">
                        <p className="c1-c" style={{ minWidth: "50px" }}>
                          url
                        </p>
                        <p className="gray-c p-three-lines">
                          {btn.url || "N/A"}
                        </p>
                      </div>
                      {btn.url_status && (
                        <div className="checkmark-tt-24"></div>
                      )}
                      {!btn.url_status && (
                        <div className="crossmark-tt-24"></div>
                      )}
                    </div>
                  </div>
                </div>
                <hr />
              </Fragment>
            );
          })}
        </div>
      </div>
    </div>
  );
};
