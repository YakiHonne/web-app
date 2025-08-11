import React, { useEffect, useState } from "react";

export default function Counter({ date, onClick }) {
  const EndOfTimer = new Date(date * 1000).getTime() + 300000;
  const [timer, setTimer] = useState(EndOfTimer - new Date().getTime());
  const [time, setTime] = useState({
    min: new Date(timer).getMinutes(),
    sec: new Date(timer).getSeconds(),
  });
  
  useEffect(() => {
    let intervalID = setInterval(() => {
      if (timer <= 0) {
        clearInterval(intervalID);
        onClick();
        return;
      }
      setTimer(EndOfTimer - new Date().getTime());
    }, 1000);
    return () => {
      clearInterval(intervalID);
    };
  }, []);

  useEffect(() => {
    let temp = new Date(timer).toISOString();
    let t = temp.split("T")[1].split(".")[0];

    setTime({
      min: t.split(":")[1],
      sec: t.split(":")[2],
    });
  }, [timer]);

  if (EndOfTimer - new Date().getTime() <= 0) return onClick();
  return (
    <>
      {" "}
      {time.min}:{time.sec}{" "}
    </>
  );
}
