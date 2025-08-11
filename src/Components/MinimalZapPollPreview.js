import React from "react";

export default function MinimalZapPollPreview({ event }) {
  let options = event.tags
    .filter((tag) => tag[0] === "poll_option")
    .map((tag) => tag[2]);
  const poll = { options, content: event.content, ...event };
  return (
    <div className="fit-container fx-centered fx-col">
      <p className="fit-container p-five-lines">{poll.content}</p>
      <div className="fx-col fx-centered fit-container">
        {poll.options.map((option, index) => {
          return (
            <div
              key={index}
              className="box-pad-h-m box-pad-v-s sc-s fit-container"
            >
              <p>{option}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
