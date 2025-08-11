import React from "react";

export default function PlayPauseButton({ isPlaying, onClick, loading }) {
  return (
    <div className={`playpause-btn`} onClick={loading ? () => {} : onClick} style={{ position: 'relative' }}>
      {loading ? (
        <svg
          className="playpause-spinner"
          width="40"
          height="40"
          viewBox="0 0  60 60"
          style={{ position: 'relative', zIndex: 2 }}
        >
          <circle
            className="spinner-circle"
            cx="30"
            cy="30"
            r="24"
            fill="none"
            stroke="var(--gray, #ccc)"
            strokeWidth="3"
            strokeDasharray={Math.PI * 2 * 24 * 0.75}
            strokeDashoffset={Math.PI * 2 * 24 * 0.125}
            strokeLinecap="round"
          />
        </svg>
      ) : (
        <svg viewBox="0 0 60 60" width="60" height="60" fill="none" style={{ position: 'relative', zIndex: 3 }}>
          <g className="icon">
            <polygon
              className="play-shape"
              points="24,18 24,42 42,30"
              style={{ opacity: isPlaying ? 0 : 1, transition: "opacity 0.2s" }}
            />
            <g
              className="pause-shape"
              style={{ opacity: isPlaying ? 1 : 0, transition: "opacity 0.2s" }}
            >
              <rect x="23" y="18" width="5" height="24" rx="2" />
              <rect x="32" y="18" width="5" height="24" rx="2" />
            </g>
          </g>
        </svg>
      )}
    </div>
  );
}

