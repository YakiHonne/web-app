import dynamic from 'next/dynamic'
import React from 'react'

const ClientComponent = dynamic(() => import("@/(PagesComponents)/Settings/SettingsHome"), {
  ssr: false,
});

export default function index() {
  return (
   <ClientComponent />
  )
}