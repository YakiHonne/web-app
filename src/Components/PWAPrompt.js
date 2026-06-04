import React from 'react'
import { usePWAInstallPrompt } from '@/Hooks/usePWAInstallPrompt'
import Overlay from "@/Components/Overlay";

export default function PWAPrompt() {
    const { canInstall, installApp } = usePWAInstallPrompt();

  return (
    <Overlay exit={() => {}}>
        <div className='fx-centered fx-col box-pad-h box-pad-v'>
            <div className="close">
                <div></div>
            </div>
            <h4>Install YakiHonne</h4>
            <p className='gray-c p-medium'>Add YakiHonne to your home screen for a faster and more secure experience.</p>
            <button className='btn btn-orange' onClick={installApp}>Install</button>
        </div>
    </Overlay>
  )
}
