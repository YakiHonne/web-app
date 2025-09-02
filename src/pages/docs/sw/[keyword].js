import { swContent } from "@/(PagesComponents)/Docs/SW/content";
import HeadMetadata from "@/Components/HeadMetadata";
import dynamic from "next/dynamic";
import React from "react";

const ClientComponent = dynamic(
  () => import("@/(PagesComponents)/Docs/SW/Home"),
  {
    ssr: true,
  }
);

export default function index({ keyword }) {
  let data = {
    path: `docs/sw/${keyword}`,
    title: swContent[keyword].title,
    description: swContent[keyword].title,
    image:
      "https://yakihonne.s3.ap-east-1.amazonaws.com/media/images/thumbnail.png",
  };
  return (
    <div>
      <HeadMetadata data={data} />
      <ClientComponent keyword={keyword} />
    </div>
  );
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
      { params: { keyword: "smart-widget-handler" } },
    ],
    fallback: "blocking",
  };
}
