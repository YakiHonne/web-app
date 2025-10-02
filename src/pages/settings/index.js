import dynamic from 'next/dynamic'
import React from 'react'
import HeadMetadata from '@/Components/HeadMetadata';

const ClientComponent = dynamic(() => import("@/(PagesComponents)/Settings/SettingsHome"), {
  ssr: false,
});

export default function index() {
  let data = {
    path: "settings",
    title: "Settings",
    description: "Configure your Yakihonne experience. Manage your account preferences, privacy settings, content filters, and customize your decentralized social media platform.",
    image:
      "https://yakihonne.s3.ap-east-1.amazonaws.com/media/images/thumbnail.png",
  };
  return (
    <div>
      <HeadMetadata data={data} />
      <ClientComponent />
    </div>
  )
}