import React from 'react'
import { usePWAInstallPrompt } from '@/Hooks/usePWAInstallPrompt'

export default function PWAPrompt() {
    const { canInstall, installApp } = usePWAInstallPrompt();

  return (
    <div className='fixed-container fx-centered box-pad-h' style={{zIndex: 99999999999}}>
        <div className='fx-centered fx-col sc-s bg-sp box-pad-h box-pad-v' style={{position: "relative"}}>
            <div className="close">
                <div></div>
            </div>
            <h4>Install YakiHonne</h4>
            <p className='gray-c p-medium'>Add YakiHonne to your home screen for a faster and more secure experience.</p>
            <button className='btn btn-orange' onClick={installApp}>Install</button>
        </div>
    </div>
  )
}
