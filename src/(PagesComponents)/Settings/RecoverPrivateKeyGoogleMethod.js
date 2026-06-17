import Overlay from '@/Components/Overlay'
import Icon from '@/Components/Icon'
import Spinner from '@/Components/Spinner'
import { aggregateSecretKeyShards, keyShardFromHex } from '@fiatjaf/promenade-trusted-dealer'
import { nip19 } from 'nostr-tools'
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'
import { useDispatch } from 'react-redux'
import { setToast } from '@/Store/Slides/Publishers'
import { copyText } from '@/Helpers/Helpers'
import { OPERATOR_URLS } from '@/Content/pomegrenate'

const massageURL = (input) => {
    let url = input.trim()
    if (!url.startsWith('http')) url = 'https://' + url
    return new URL(url).origin
}

const openPopup = (url, name) => {
    const width = 600
    const height = 700
    const left = window.screenX + Math.max(0, (window.outerWidth - width) / 2)
    const top = window.screenY + Math.max(0, (window.outerHeight - height) / 2)
    return window.open(url, name, `popup=yes,width=${width},height=${height},left=${left},top=${top}`)
}

const awaitPopupMessage = (popup, expectedOrigin, extract) => {
    return new Promise((resolve, reject) => {
        const TIMEOUT = 5 * 60 * 1000
        const cleanup = () => {
            window.removeEventListener('message', onMessage)
            clearInterval(monitor)
            clearTimeout(timer)
        }
        const onMessage = (event) => {
            if (event.origin !== expectedOrigin || event.source !== popup) return
            const value = extract(event.data)
            if (value === undefined) return
            cleanup()
            popup.close()
            resolve(value)
        }
        const monitor = setInterval(() => {
            if (popup.closed) { cleanup(); reject(new Error('POPUP_CLOSED')) }
        }, 300)
        const timer = setTimeout(() => {
            cleanup()
            popup.close()
            reject(new Error('Timed out'))
        }, TIMEOUT)
        window.addEventListener('message', onMessage)
    })
}

const bigintTo32Bytes = (n) => {
    const hex = n.toString(16).padStart(64, '0')
    const bytes = new Uint8Array(32)
    for (let i = 0; i < 32; i++) bytes[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16)
    return bytes
}

export default function RecoverPrivateKeyGoogleMethod() {
    const [showOverlay, setShowOverLay] = useState(false)
    const { t } = useTranslation()
    return (
        <>
            {showOverlay && <RecoverKeys exit={() => setShowOverLay(false)} />}
            <div className='fit-container fx-col fx-centered fx-start-v box-pad-v-m'>
                <div className='fx-scattered pointer fit-container'>
                    <div>
                        <p>{t('AlLGnJJ')}</p>
                        <p className='gray-c p-medium'>{t('ABVa6rQ')}</p>
                    </div>
                    <button className='btn btn-normal' onClick={() => setShowOverLay(true)}>{t('AlsXwwk')}</button>
                </div>
            </div>
        </>
    )
}

const RecoverKeys = ({ exit }) => {
    const userKeys = useSelector(state => state.userKeys)
    const dispatch = useDispatch()
    const { t } = useTranslation()

    const operators = OPERATOR_URLS.map(massageURL)
    const threshold = Math.ceil((operators.length * 7) / 12)

    const [shards, setShards] = useState({})
    const [recovering, setRecovering] = useState({})
    const [errors, setErrors] = useState({})
    const [recoveredNsec, setRecoveredNsec] = useState(null)
    const [copied, setCopied] = useState(false)

    const collectedShards = Object.values(shards)
    const isComplete = recoveredNsec !== null

    const handleRecover = async (operatorUrl) => {
        setRecovering(prev => ({ ...prev, [operatorUrl]: true }))
        setErrors(prev => ({ ...prev, [operatorUrl]: null }))
        try {
            const popup = openPopup(`${operatorUrl}/po/recover/google`, 'PomegranateRecover')
            if (!popup) throw new Error('POPUP_BLOCKED')
            const shard = await awaitPopupMessage(popup, operatorUrl, (data) =>
                typeof data === 'string' ? data : undefined
            )
            const newShards = { ...shards, [operatorUrl]: shard }
            setShards(newShards)

            const collected = Object.values(newShards)
            if (collected.length >= threshold) {
                const keyShards = collected.map(keyShardFromHex)
                const secret = aggregateSecretKeyShards(keyShards)
                const secretKey = bigintTo32Bytes(secret)
                const nsec = nip19.nsecEncode(secretKey)
                setRecoveredNsec(nsec)
            }
        } catch (err) {
            if (err.message !== 'POPUP_CLOSED') {
                setErrors(prev => ({ ...prev, [operatorUrl]: err.message || t('AEH0z9N') }))
            }
        } finally {
            setRecovering(prev => ({ ...prev, [operatorUrl]: false }))
        }
    }

    const handleCopy = () => {
        copyText(recoveredNsec, t('AStACDI'))
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    const handleDownload = () => {
        const content = ['Important: Store this information securely.', '---', `Private key: ${recoveredNsec}`].join('\n')
        const blob = new Blob([content], { type: 'text/plain' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = 'nostr-private-key.txt'
        a.click()
        URL.revokeObjectURL(url)
        dispatch(setToast({ type: 1, desc: t('Apom010') }))
    }

    return (
        <Overlay exit={exit} width={460}>
            <div className='login-google-overlay box-pad-h box-pad-v bg-dropdown-t'>
                <div className='close' onClick={exit}><div></div></div>

                <div className='login-google-head'>
                    <h4 className='login-card-title' style={{ fontSize: '1.2rem' }}>{t('AlLGnJJ')}</h4>
                    <p className='gray-c p-medium'>{t('Apom012')}</p>
                </div>

                {!isComplete && (
                    <>
                        <p className='gray-c'>
                            {collectedShards.length}/{threshold} {t('Apom014').toLowerCase()}
                        </p>
                        <div className='login-convo-options' style={{ marginTop: 0 }}>
                            {operators.map((op, i) => {
                                const hasShard = !!shards[op]
                                const isLoading = !!recovering[op]
                                const error = errors[op]
                                const host = new URL(op).host
                                return (
                                    <div
                                        key={op}
                                        className='login-convo-option '
                                        style={{ '--stagger-i': i, cursor: 'default' }}
                                    >
                                        <span className='login-convo-option-copy'>
                                            <b>{host}</b>
                                            {error && <span className='red-c'>{error}</span>}
                                        </span>
                                        {hasShard ? (
                                            <span className='login-convo-option-go'>
                                                <Icon name='check_big' v={2} size={18} isBoldThemeColor />
                                            </span>
                                        ) : (
                                            <button
                                                className='btn btn-normal btn-small btn-gray fx-centered bg-dropdown'
                                                onClick={() => handleRecover(op)}
                                                disabled={isLoading}
                                                style={{ minWidth: 90 }}
                                            >
                                                {isLoading
                                                    ? <Spinner />
                                                    : t('AlsXwwk')}
                                            </button>
                                        )}
                                    </div>
                                )
                            })}
                        </div>
                    </>
                )}

                {isComplete && (
                    <>
                        <div className='login-google-key-field'>
                            <p className='p-medium p-bold'>{t('Apom008')}</p>
                            <div className='login-google-key-row'>
                                <input
                                    type='text'
                                    className='if ifs-full'
                                    value={recoveredNsec}
                                    readOnly
                                    onClick={(e) => e.target.select()}
                                    style={{ fontFamily: 'monospace', fontSize: '0.75rem' }}
                                />
                                <button
                                    className='btn btn-normal btn-gray fx-centered bg-dropdown'
                                    onClick={handleCopy}
                                    style={{ padding: "0 1rem", borderRadius: "50%", aspectRatio: "1/1", width: "44px", height: "44px" }}

                                >
                                    <Icon name={copied ? 'check_big' : 'copy'} size={16} v={copied ? 2 : 1} />
                                </button>
                            </div>
                        </div>
                        <button className='btn btn-gst btn-full' onClick={handleDownload}>
                            {t('Apom016')}
                        </button>
                    </>
                )}
            </div>
        </Overlay>
    )
}
