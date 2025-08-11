import React from 'react'

export default function Toggle({ status, setStatus }) {
    return (
        <div
          className={`toggle ${!status ? "toggle-dim-gray" : ""} ${
            status ? "toggle-c1" : "toggle-dim-gray"
          }`}
          onClick={() => setStatus(!status)}
        ></div>
      );
}
