import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setToast } from "@/Store/Slides/Publishers";

export default function ToastMessages() {
  const dispatch = useDispatch();
  const toast = useSelector((state) => state.toast);
  const { desc, type } = toast || {};

  const [timer, setTimer] = useState(null);

  useEffect(() => {
    if (!desc) return;

    if (timer) {
      clearTimeout(timer);
    }

    const newTimer = setTimeout(() => {
      dispatch(setToast(false));
    }, 4000);

    setTimer(newTimer);

    return () => {
      if (newTimer) {
        clearTimeout(newTimer);
      }
    };
  }, [desc, dispatch]);

  const close = () => {
    if (timer) clearTimeout(timer);
    dispatch(setToast(false));
  };

  if (!desc) return null;
  if (type === 1)
    return (
      <div
        className={`toast-message success-toast fx-scattered slide-up-down`}
        style={{ animationDuration: "4s" }}
      >
        <div className="fx-centered">
          <div className="icon">
            <div className="success"></div>
          </div>
          <p className="p-medium">{desc}</p>
        </div>
        <div className="close-toast" onClick={close}>
          <p>&#10005;</p>
        </div>
      </div>
    );
  if (type === 2)
    return (
      <div
        className={`toast-message warning-toast fx-scattered slide-up-down`}
        style={{ animationDuration: "4s" }}
      >
        <div className="fx-centered">
          <div className="icon">
            <div className="warning"></div>
          </div>
          <p className="p-medium">{desc}</p>
        </div>
        <div className="close-toast" onClick={close}>
          <p>&#10005;</p>
        </div>
      </div>
    );
  if (type === 3)
    return (
      <div
        className={`toast-message warning-toast fx-scattered slide-up-down`}
        style={{ animationDuration: "4s" }}
      >
        <div className="fx-centered">
          <div className="icon">
            <div className="warning"></div>
          </div>
          <p className="p-medium">{desc}</p>
        </div>
        <div className="close-toast" onClick={close}>
          <p>&#10005;</p>
        </div>
      </div>
    );
}
