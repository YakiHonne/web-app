import dynamic from 'next/dynamic'
import React from 'react'

const ClientComponent = dynamic(() => import("@/(PagesComponents)/404"), {
  ssr: false,
});

export default function index() {
  return (
   <ClientComponent />
  )
}