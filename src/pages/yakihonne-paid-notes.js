import dynamic from 'next/dynamic'
import React from 'react'

const ClientComponent = dynamic(() => import("@/(PagesComponents)/YakiFN"), {
  ssr: true,
});

export default function index() {
  return (
   <ClientComponent />
  )
}