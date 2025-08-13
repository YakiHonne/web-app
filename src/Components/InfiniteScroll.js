import React, { useEffect } from "react";

export default function InfiniteScroll({ children, events, onRefresh }) {
  useEffect(() => {
    const contentArea = document.querySelector(".infinite-scroll");

    if (!contentArea) {
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && events?.length > 0) {
            const lastEvent = events[events.length - 1];
            if (lastEvent?.created_at) {
              onRefresh(lastEvent.created_at - 1);
            }
          }
        });
      },
      {
        rootMargin: "400px 0px 400px 0px",
        threshold: 0,
      }
    );

    const lastChild = contentArea.lastElementChild;
    if (lastChild) {
      observer.observe(lastChild);
    }

    return () => {
      observer.disconnect();
    };
  }, [events]);
  return <div className="infinite-scroll">{children}</div>;
}
