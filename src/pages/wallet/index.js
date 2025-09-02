import dynamic from 'next/dynamic'
import React from 'react'
import HeadMetadata from '@/Components/HeadMetadata';

const ClientComponent = dynamic(() => import("@/(PagesComponents)/Wallet"), {
  ssr: false,
});

export default function index() {
  let data = {
    path: "wallet",
    title: "Yakihonne | Wallet",
    description: "Manage your Bitcoin Lightning wallet and transactions. Send and receive payments seamlessly within the platform.",
    image: "https://yakihonne.s3.ap-east-1.amazonaws.com/media/images/thumbnail.png",
  };
  return (
    <div>
      <HeadMetadata data={data} />
      <ClientComponent />
    </div>
   
  )
}