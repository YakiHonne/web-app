import dynamic from 'next/dynamic'
import React from 'react'

const ClientComponent = dynamic(() => import("@/(PagesComponents)/Playground"), {
  ssr: false,
});

export default function index() {
  return (
   <ClientComponent />
  )
}