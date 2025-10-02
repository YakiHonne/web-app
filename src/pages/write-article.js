import dynamic from 'next/dynamic'
import React from 'react'
import HeadMetadata from '@/Components/HeadMetadata';

const ClientComponent = dynamic(() => import("@/(PagesComponents)/WriteArticle"), {
  ssr: false,
});

export default function index() {
  let data = {
    path: "write-article",
    title: "Write Article",
    description: "Create and publish long-form articles on the decentralized web. Share your thoughts with complete editorial freedom.",
    image: "https://yakihonne.s3.ap-east-1.amazonaws.com/media/images/thumbnail.png",
  }
  return (
    <div>
      <HeadMetadata data={data} />
      <ClientComponent />
    </div>
  );
}