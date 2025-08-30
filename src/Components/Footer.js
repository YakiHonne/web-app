import dynamic from 'next/dynamic'
import React from 'react'

const ClientComponent = dynamic(() => import("@/Components/FooterWrapper"), {
  ssr: false,
});

export default function Footer() {
  return (
   <ClientComponent />
  )
}