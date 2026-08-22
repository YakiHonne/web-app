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
import {
    massageURL,
    hostOf,
    openPopup,
    awaitPopupMessage,
    authenticateWithGoogle,
    getAccount,
    findExistingSetup,
    deleteAccount,
} from '@/Helpers/Pomegranate'
import { userLogout } from '@/Helpers/Controlers'

const bigintTo32Bytes = (n) => {
    const hex = n.toString(16).padStart(64, '0')
    const bytes = new Uint8Array(32)
    for (let i = 0; i < 32; i++) bytes[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16)
    return bytes
}

const downloadNsec = (nsec) => {
    const content = ['Important: Store this information securely.', '---', `Private key: ${nsec}`].join('\n')
    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'nostr-private-key.txt'
    a.click()
    URL.revokeObjectURL(url)
}

const useKeyRecovery = () => {
    const { t } = useTranslation()
    const userKeys = useSelector(state => state.userKeys)

    const [config, setConfig] = useState(null)
    const [loadingConfig, setLoadingConfig] = useState(true)
    const [configError, setConfigError] = useState('')
    const [needsCentralLookup, setNeedsCentralLookup] = useState(false)

    const loadConfigFromCentral = async () => {
        if (!userKeys?.central) return
        setConfigError('')
        setLoadingConfig(true)
        try {
            const central = massageURL(userKeys.central)
            const token = await authenticateWithGoogle(central)
            const account = await getAccount(central, token)
            if (account?.operators?.length) {
                setConfig({
                    operators: account.operators.map(massageURL),
                    threshold:
                        account.threshold ||
                        Math.ceil((account.operators.length * 7) / 12),
                })
                setNeedsCentralLookup(false)
            } else {
                setConfigError(t('AQsq0aG'))
            }
        } catch (err) {
            if (err.message !== 'POPUP_CLOSED') {
                setConfigError(err.message || t('AEH0z9N'))
            }
        } finally {
            setLoadingConfig(false)
        }
    }

    const loadConfig = React.useCallback(async () => {
        if (!userKeys?.email) {
            setLoadingConfig(false)
            return
        }
        setConfigError('')
        setLoadingConfig(true)
        try {
            const setup = await findExistingSetup(userKeys.email)
            if (setup?.operators?.length) {
                setConfig({
                    operators: setup.operators.map(massageURL),
                    threshold:
                        setup.threshold ||
                        Math.ceil((setup.operators.length * 7) / 12),
                })
            } else {
                setNeedsCentralLookup(true)
            }
        } catch (err) {
            setConfigError(err.message || t('AEH0z9N'))
        } finally {
            setLoadingConfig(false)
        }
    }, [userKeys?.email, t])

    React.useEffect(() => { loadConfig() }, [loadConfig])

    const operators = config?.operators ?? []
    const threshold = config?.threshold ?? 0

    const [shards, setShards] = useState({})
    const [recovering, setRecovering] = useState({})
    const [errors, setErrors] = useState({})
    const [recoveredNsec, setRecoveredNsec] = useState(null)

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
                setRecoveredNsec(nip19.nsecEncode(secretKey))
            }
        } catch (err) {
            if (err.message !== 'POPUP_CLOSED') {
                setErrors(prev => ({ ...prev, [operatorUrl]: err.message || t('AEH0z9N') }))
            }
        } finally {
            setRecovering(prev => ({ ...prev, [operatorUrl]: false }))
        }
    }

    return {
        operators,
        threshold,
        shards,
        recovering,
        errors,
        recoveredNsec,
        handleRecover,
        collectedCount: Object.keys(shards).length,
        config,
        loadConfig,
        loadConfigFromCentral,
        needsCentralLookup,
        loadingConfig,
        configError,
    }
}

const OperatorsList = ({ recovery }) => {
    const { t } = useTranslation()
    const {
        operators, shards, recovering, errors, threshold, collectedCount,
        handleRecover: onRecover, config, loadConfig, loadConfigFromCentral,
        needsCentralLookup, loadingConfig, configError,
    } = recovery

    if (loadingConfig) {
        return (
            <div className='login-google-busy fx-centered fx-col'>
                <Spinner size={24} />
                <p className='gray-c'>{t('AQZNHiW')}</p>
            </div>
        )
    }

    if (!config) {
        return (
            <>
                <p className={needsCentralLookup && !configError ? 'gray-c' : 'red-c'}>
                    {configError || (needsCentralLookup ? t('AKUiSRk') : t('AQsq0aG'))}
                </p>
                <button
                    className='btn btn-normal btn-full fx-centered'
                    onClick={needsCentralLookup ? loadConfigFromCentral : loadConfig}
                >
                    {needsCentralLookup ? t('AIK8LaE') : t('AhOnn0t')}
                </button>
            </>
        )
    }

    return (
        <>
            <p className='gray-c'>
                {collectedCount}/{threshold} {t('Apom014').toLowerCase()}
            </p>
            <div className='login-convo-options' style={{ marginTop: 0 }}>
                {operators.map((op, i) => {
                    const hasShard = !!shards[op]
                    const isLoading = !!recovering[op]
                    const error = errors[op]
                    return (
                        <div
                            key={op}
                            className='login-convo-option '
                            style={{ '--stagger-i': i, cursor: 'default' }}
                        >
                            <span className='login-convo-option-copy'>
                                <b>{hostOf(op)}</b>
                                {error && <span className='red-c'>{error}</span>}
                            </span>
                            {hasShard ? (
                                <span className='login-convo-option-go'>
                                    <Icon name='check_big' v={2} size={18} isBoldThemeColor />
                                </span>
                            ) : (
                                <button
                                    className='btn btn-normal btn-small btn-gray fx-centered bg-dropdown'
                                    onClick={() => onRecover(op)}
                                    disabled={isLoading}
                                    style={{ minWidth: 90 }}
                                >
                                    {isLoading ? <Spinner /> : t('AlsXwwk')}
                                </button>
                            )}
                        </div>
                    )
                })}
            </div>
        </>
    )
}

const KeyReveal = ({ nsec }) => {
    const { t } = useTranslation()
    const [copied, setCopied] = useState(false)
    const handleCopy = () => {
        copyText(nsec, t('AStACDI'))
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }
    return (
        <div className='login-google-key-field'>
            <p className='p-bold'>{t('Apom008')}</p>
            <div className='login-google-key-row'>
                <input
                    type='text'
                    className='if ifs-full'
                    value={nsec}
                    readOnly
                    onClick={(e) => e.target.select()}
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
    )
}

export default function RecoverPrivateKeyGoogleMethod() {
    const [showOverlay, setShowOverLay] = useState(false)
    const [showUnlink, setShowUnlink] = useState(false)
    const { t } = useTranslation()
    return (
        <>
            {showOverlay && <RecoverKeys exit={() => setShowOverLay(false)} />}
            {showUnlink && <UnlinkGoogleAccount exit={() => setShowUnlink(false)} />}
            <div className='fit-container fx-col fx-centered fx-start-v box-pad-v-m'>
                <div className='fx-scattered pointer fit-container'>
                    <div>
                        <p>{t('AlLGnJJ')}</p>
                        <p className='gray-c p-medium'>{t('ABVa6rQ')}</p>
                    </div>
                    <button className='btn btn-normal' onClick={() => setShowOverLay(true)}>{t('AlsXwwk')}</button>
                </div>
                <div className='fx-scattered pointer fit-container'>
                    <div>
                        <p>{t('AghS7tM')}</p>
                        <p className='gray-c p-medium'>{t('AITGqC6')}</p>
                    </div>
                    <button className='btn btn-red' onClick={() => setShowUnlink(true)}>{t('AehE9EV')}</button>
                </div>
            </div>
        </>
    )
}

const RecoverKeys = ({ exit }) => {
    const { t } = useTranslation()
    const dispatch = useDispatch()
    const recovery = useKeyRecovery()
    const isComplete = recovery.recoveredNsec !== null

    const handleDownload = () => {
        downloadNsec(recovery.recoveredNsec)
        dispatch(setToast({ type: 1, desc: t('Apom010') }))
    }

    return (
        <Overlay exit={exit} width={460}>
            <div className='login-google-overlay box-pad-h box-pad-v bg-dropdown-t'>
                <div className='close' onClick={exit}><div></div></div>

                <div className='login-google-head'>
                    <h4 className='p-big'>{t('AlLGnJJ')}</h4>
                    <p className='gray-c'>{t('Apom012')}</p>
                </div>

                {!isComplete && (
                    <OperatorsList recovery={recovery} />
                )}

                {isComplete && (
                    <>
                        <KeyReveal nsec={recovery.recoveredNsec} />
                        <button className='btn btn-gst btn-full' onClick={handleDownload}>
                            {t('Apom016')}
                        </button>
                    </>
                )}
            </div>
        </Overlay>
    )
}

const UnlinkGoogleAccount = ({ exit }) => {
    const { t } = useTranslation()
    const dispatch = useDispatch()
    const userKeys = useSelector(state => state.userKeys)
    const recovery = useKeyRecovery()

    const [acknowledged, setAcknowledged] = useState(false)
    const [confirming, setConfirming] = useState(false)
    const [unlinking, setUnlinking] = useState(false)
    const [downloaded, setDownloaded] = useState(false)

    const isComplete = recovery.recoveredNsec !== null

    React.useEffect(() => {
        if (isComplete && !downloaded) {
            downloadNsec(recovery.recoveredNsec)
            dispatch(setToast({ type: 1, desc: t('Apom010') }))
            setDownloaded(true)
        }
    }, [isComplete, downloaded, recovery.recoveredNsec, dispatch, t])

    const handleUnlink = async () => {
        setUnlinking(true)
        try {
            if (userKeys?.central) {
                try {
                    const token = await authenticateWithGoogle(userKeys.central)
                    await deleteAccount(userKeys.central, token)
                } catch (err) {
                    console.log(err)
                }
            }
            await userLogout(userKeys.pub)
            dispatch(setToast({ type: 1, desc: t('ANijoRU') }))
            exit()
        } catch (err) {
            console.log(err)
            setUnlinking(false)
        }
    }

    if (confirming) {
        return (
            <Overlay exit={() => setConfirming(false)} width={420}>
                <div className='login-google-overlay box-pad-h box-pad-v bg-dropdown-t'>
                    <div className='close' onClick={() => setConfirming(false)}><div></div></div>
                    <div className='login-google-head'>
                        <div className='pom-warning-badge fx-centered'>
                            <Icon name='circle_warning' size={26} v={2} />
                        </div>
                        <h4 className='p-big'>{t('AWYc8dX')}</h4>
                        <p className='gray-c'>{t('Alcl7QN')}</p>
                    </div>
                    <div className='pom-confirm-actions'>
                        <button
                            className='btn btn-gst'
                            onClick={() => setConfirming(false)}
                            disabled={unlinking}
                        >
                            {t('AB4BSCe')}
                        </button>
                        <button
                            className='btn btn-red fx-centered'
                            onClick={handleUnlink}
                            disabled={unlinking}
                        >
                            {unlinking ? <Spinner /> : t('AehE9EV')}
                        </button>
                    </div>
                </div>
            </Overlay>
        )
    }

    return (
        <Overlay exit={exit} width={460}>
            <div className='login-google-overlay box-pad-h box-pad-v bg-dropdown-t'>
                <div className='close' onClick={exit}><div></div></div>

                <div className='login-google-head'>
                    <h4 className='p-big'>{t('AghS7tM')}</h4>
                    <p className='gray-c'>{t('AGkQ5uY')}</p>
                </div>

                {!isComplete && (
                    <OperatorsList recovery={recovery} />
                )}

                {isComplete && (
                    <>
                        <KeyReveal nsec={recovery.recoveredNsec} />

                        <label className='pom-consent-row fit-container'>
                            <input
                                className='pom-checkbox-input'
                                type='checkbox'
                                checked={acknowledged}
                                onChange={(e) => setAcknowledged(e.target.checked)}
                            />
                            <span className={`pom-checkbox${acknowledged ? ' pom-checkbox-on' : ''}`}>
                                {acknowledged && <Icon name='check' size={13} v={2} isColored />}
                            </span>
                            <span className='pom-consent-label'>{t('AbzNUW8')}</span>
                        </label>

                        <button
                            className='btn btn-red btn-full'
                            onClick={() => setConfirming(true)}
                            disabled={!acknowledged}
                        >
                            {t('AehE9EV')}
                        </button>
                    </>
                )}
            </div>
        </Overlay>
    )
}
