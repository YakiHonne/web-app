import dynamic from 'next/dynamic'
import React from 'react'
import HeadMetadata from '@/Components/HeadMetadata';

const ClientComponent = dynamic(() => import("@/(PagesComponents)/WalletNWC"), {
  ssr: false,
});

export default function index() {
  let data =  {
    path: "wallet/nwc",
    title: "NWC Wallet",
    description: "Use Nostr Wallet Connect for secure Bitcoin Lightning payments. Connect any compatible wallet service.",
    image: "https://yakihonne.s3.ap-east-1.amazonaws.com/media/images/thumbnail.png",
  }
  return (
    <div>
      <HeadMetadata data={data} />
      <ClientComponent />
    </div>
   
  )
}