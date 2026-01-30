import dynamic from 'next/dynamic'
import React from 'react'
import HeadMetadata from '@/Components/HeadMetadata';

const ClientComponent = dynamic(() => import("@/(PagesComponents)/WalletAlby"), {
  ssr: false,
});

export default function index() {
  let data =   {
    path: "wallet/alby",
    title: "Alby Wallet",
    description: "Connect your Alby wallet for seamless Bitcoin Lightning transactions. Easy integration with your existing wallet.",
    image: "https://yakihonne.s3.ap-east-1.amazonaws.com/media/images/thumbnail.png",
  }
  return (
    <div>
      <HeadMetadata data={data} />
      <ClientComponent />
    </div>
   
  )
}