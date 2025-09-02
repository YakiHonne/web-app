import dynamic from 'next/dynamic'
import React from 'react'
import HeadMetadata from '@/Components/HeadMetadata';

const ClientComponent = dynamic(() => import("@/(PagesComponents)/Messages"), {
  ssr: false,
});

export default function index() {
  let data = {
    path: "messages",
    title: "Yakihonne | Direct Messages",
    description: "Secure, encrypted direct messaging on the Nostr protocol. Private conversations that respect your digital sovereignty.",
    image: "https://yakihonne.s3.ap-east-1.amazonaws.com/media/images/thumbnail.png",
  }
  return (
   <div>
     <HeadMetadata data={data} />
     <ClientComponent />
   </div>
  )
}