import dynamic from "next/dynamic";
import React from "react";

const ClientComponent = dynamic(
  () => import("@/(PagesComponents)/Docs/SW/Home"),
  {
    ssr: true,
  }
);

export default function index({ keyword }) {
  return <ClientComponent keyword={keyword} />;
}

export function getStaticProps({ params }) {
  const { keyword } = params;
  return {
    props: {
      keyword,
    },
  };
}

export function getStaticPaths() {
  return {
    paths: [
      { params: { keyword: "intro" } },
      { params: { keyword: "getting-started" } },
      { params: { keyword: "basic-widgets" } },
      { params: { keyword: "action-tool-widgets" } },
      { params: { keyword: "smart-widget-builder" } },
      { params: { keyword: "smart-widget-previewer" } },
      { params: { keyword: "smart-widget-uploader" } },
      { params: { keyword: "smart-widget-deleter" } },
      { params: { keyword: "smart-widget-updater" } },
      { params: { keyword: "smart-widget-listener" } },
      { params: { keyword: "smart-widget-subscriber" } },
      { params: { keyword: "smart-widget-subscriber" } },
    ],
    fallback: "blocking",
  };
}
