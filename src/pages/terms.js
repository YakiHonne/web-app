import dynamic from "next/dynamic";
import React from "react";

const ClientComponent = dynamic(() => import("@/(PagesComponents)/Terms"), {
  ssr: true,
});

export default function index({ keyword }) {
  return <ClientComponent keyword={keyword} />;
}