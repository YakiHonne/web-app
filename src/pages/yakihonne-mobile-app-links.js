import dynamic from 'next/dynamic'
import React from 'react'
import HeadMetadata from '@/Components/HeadMetadata';

const ClientComponent = dynamic(() => import("@/(PagesComponents)/YMARedirection"), {
  ssr: false,
});

export default function index() {
  let data = {
    path: "yakihonne-mobile-app-links",
    title: "YakiHonne Mobile App",
    description: "Download YakiHonne for iOS & iPadOS, Android (phones & tablets), and macOS.",
    image: "https://yakihonne.s3.ap-east-1.amazonaws.com/media/images/mobile-app-download.png",
  }
  return (
    <div>
      <HeadMetadata data={data} />
      <ClientComponent />
    </div>
   )
}