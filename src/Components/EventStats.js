import React from 'react'
import Icon from './Icon'
import { iconsNames } from '@/Content/IconV2URL'
import Overlay from './Overlay'
import { useTranslation } from 'react-i18next'
import { SelectTabs } from './SelectTabs'
import { getSubData } from '@/Helpers/Controlers'
import { getParsedAuthor } from '@/Helpers/Encryptions'
import UserProfilePic from './UserProfilePic'
import Follow from './Follow'
import NumberShrink from './NumberShrink'
import EmojiImg from './EmojiImg'
import Spinner from './Spinner'
import { useTheme } from 'next-themes'

const BATCH_SIZE = 20

const REACTION_SERIES = [
    { key: 'likes', color: '#FF4A4A', labelKey: 'Alz0E9Y' },
    { key: 'reposts', color: '#00C04D', labelKey: 'Aai65RJ' },
    { key: 'quotes', color: '#8b5cf6', labelKey: 'AWmDftG' },
    { key: 'replies', color: '#1d9bf0', labelKey: 'AENEcn9' },
    { key: 'zaps', color: '#ee7700', labelKey: 'AVDZ5cJ' },
]

const BUCKET_COUNT = 8

const getSeriesItems = (postActions, key) => {
    if (!postActions) return []
    return postActions[key]?.[key] || []
}

const buildChartBuckets = (postActions) => {
    const all = []
    for (const series of REACTION_SERIES) {
        for (const item of getSeriesItems(postActions, series.key)) {
            if (item?.created_at) all.push({ created_at: item.created_at, key: series.key })
        }
    }
    if (all.length === 0) return null

    let min = Infinity
    let max = -Infinity
    for (const a of all) {
        if (a.created_at < min) min = a.created_at
        if (a.created_at > max) max = a.created_at
    }

    // Guard against a single point in time (all reactions at once)
    const span = max - min || 1
    const step = span / BUCKET_COUNT

    const buckets = Array.from({ length: BUCKET_COUNT }, (_, i) => {
        const start = min + i * step
        return {
            start,
            end: min + (i + 1) * step,
            counts: REACTION_SERIES.reduce((acc, s) => ({ ...acc, [s.key]: 0 }), {}),
        }
    })

    for (const a of all) {
        let idx = Math.floor((a.created_at - min) / step)
        if (idx < 0) idx = 0
        if (idx >= BUCKET_COUNT) idx = BUCKET_COUNT - 1
        buckets[idx].counts[a.key] += 1
    }

    let maxCount = 0
    for (const b of buckets) {
        for (const s of REACTION_SERIES) {
            if (b.counts[s.key] > maxCount) maxCount = b.counts[s.key]
        }
    }

    return { buckets, maxCount, min, max }
}

const formatBucketDate = (seconds) => {
    try {
        return new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric' }).format(new Date(seconds * 1000))
    } catch {
        return ''
    }
}

const StatsBarChart = ({ postActions }) => {
    const { t } = useTranslation()
    const { resolvedTheme } = useTheme()
    const isLight = resolvedTheme === 'light' || resolvedTheme === 'white' || resolvedTheme === 'creamy'
    const gridColor = isLight ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.07)'
    const [hovered, setHovered] = React.useState(null)

    const chart = React.useMemo(() => buildChartBuckets(postActions), [postActions])

    if (!chart) return null

    const { buckets, maxCount, min, max } = chart
    // When there are only a few periods, cap each group's width so they stay
    // clustered in the center instead of stretching across the row.
    const groupMaxWidth = buckets.length <= 4 ? '64px' : 'none'
    const hoveredBucket = hovered != null ? buckets[hovered] : null

    return (
        <div className="fit-container fx-centered fx-col" style={{ rowGap: '12px', paddingBottom: '4px' }}>
            <div className="fx-centered fx-wrap" style={{ columnGap: '16px', rowGap: '6px', justifyContent: 'center' }}>
                {REACTION_SERIES.map(s => (
                    <div className="fx-centered" style={{ columnGap: '6px' }} key={s.key}>
                        <span style={{ width: '10px', height: '10px', borderRadius: '3px', backgroundColor: s.color, flexShrink: 0 }} />
                        <p className="gray-c p-medium">{t(s.labelKey)}</p>
                    </div>
                ))}
            </div>
            <div
                className="fit-container fx-centered fx-col"
                style={{ rowGap: '6px', position: 'relative' }}
            >
                <div
                    className="fx-centered fit-container"
                    style={{
                        minHeight: '32px',
                        transition: 'opacity .15s ease',
                        opacity: hoveredBucket ? 1 : 0,
                        pointerEvents: 'none',
                    }}
                >
                    {hoveredBucket && (
                        <div
                            className="sc-s-18 fx-centered fx-wrap"
                            style={{
                                columnGap: '2px',
                                rowGap: '4px',
                                padding: '6px 12px',
                                backgroundColor: isLight ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.06)',
                                border: 'none',
                                justifyContent: 'center',
                            }}
                        >
                            <p className="p-medium" style={{ fontWeight: 600 }}>
                                {formatBucketDate(hoveredBucket.start)}
                            </p>
                            {REACTION_SERIES.map(s => (
                                <div className="fx-centered" style={{ columnGap: '4px' }} key={s.key}>
                                    <span style={{ width: '8px', height: '8px', borderRadius: '2px', backgroundColor: s.color, flexShrink: 0 }} />
                                    <p className="p-medium">{hoveredBucket.counts[s.key]}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
                <div
                    className="fit-container fx-centered fx-even"
                    style={{
                        height: '120px',
                        columnGap: '10px',
                        alignItems: 'flex-end',
                        justifyContent: 'center',
                        borderBottom: `1px solid ${gridColor}`,
                        paddingTop: '8px',
                    }}
                >
                    {buckets.map((b, i) => {
                        const isHovered = hovered === i
                        return (
                            <div
                                key={i}
                                className="fx-centered fx-end-v pointer"
                                onMouseEnter={() => setHovered(i)}
                                onMouseLeave={() => setHovered(prev => (prev === i ? null : prev))}
                                style={{
                                    flex: 1,
                                    maxWidth: groupMaxWidth,
                                    height: '100%',
                                    columnGap: '2px',
                                    alignItems: 'flex-end',
                                    justifyContent: 'center',
                                    minWidth: 0,
                                    opacity: hovered == null || isHovered ? 1 : 0.4,
                                    transition: 'opacity .15s ease',
                                }}
                            >
                                {REACTION_SERIES.map(s => {
                                    const c = b.counts[s.key]
                                    const heightPct = maxCount ? (c / maxCount) * 100 : 0
                                    return (
                                        <div
                                            key={s.key}
                                            style={{
                                                flex: 1,
                                                minWidth: 0,
                                                maxWidth: '4px',
                                                height: `${heightPct}%`,
                                                // Empty periods still show a faint sliver instead of nothing.
                                                minHeight: '3px',
                                                backgroundColor: s.color,
                                                opacity: c > 0 ? 1 : 0.25,
                                                borderRadius: '3px 3px 0 0',
                                                transition: 'height .25s ease, opacity .15s ease',
                                            }}
                                        />
                                    )
                                })}
                            </div>
                        )
                    })}
                </div>
            </div>
            <div className="fx-scattered fit-container">
                {(() => {
                    const seen = new Set()
                    const labels = []
                    for (let i = 0; i < 5; i++) {
                        const label = formatBucketDate(min + ((max - min) * i) / 4)
                        if (label && !seen.has(label)) {
                            seen.add(label)
                            labels.push(label)
                        }
                    }
                    const single = labels.length === 1
                    return labels.map((label, i) => (
                        <p
                            className="gray-c p-medium"
                            key={label}
                            style={{
                                flex: 1,
                                textAlign: single
                                    ? 'center'
                                    : i === 0
                                        ? 'left'
                                        : i === labels.length - 1
                                            ? 'right'
                                            : 'center',
                                whiteSpace: 'nowrap',
                            }}
                        >
                            {label}
                        </p>
                    ))
                })()}
            </div>
        </div>
    )
}

export default function EventStats({ postActions }) {
    const [showStats, setShowStats] = React.useState(false)
    return (
        <>
            {showStats && <StatsOverlay postActions={postActions} exit={() => setShowStats(false)} />}
            <Icon v={2} name={iconsNames.chart_bar_vertical_01} size={20} opacity='.5' onClick={() => setShowStats(true)} />
        </>
    )
}

const getItemsForTab = (postActions, tabIndex) => {
    if (!postActions) return []
    switch (tabIndex) {
        case 0: return postActions.likes?.likes || []
        case 1: return postActions.reposts?.reposts || []
        case 2: return postActions.quotes?.quotes || []
        case 3: return postActions.zaps?.zaps || []
        default: return []
    }
}

const PeopleList = ({ items, tab, cache, setCache }) => {
    const { t } = useTranslation()
    const cached = cache[tab]
    const [people, setPeople] = React.useState(cached?.people || [])
    const [page, setPage] = React.useState(cached?.page || 0)
    const [isLoading, setIsLoading] = React.useState(false)
    const [hasMore, setHasMore] = React.useState(cached ? cached.hasMore : true)
    const sentinelRef = React.useRef(null)
    const [bulkList, setBulkList] = React.useState([])

    const pubkeys = React.useMemo(() => items.map(i => i.pubkey), [items])

    const fetchBatch = React.useCallback(async (pageIndex) => {
        const batch = pubkeys.slice(pageIndex * BATCH_SIZE, (pageIndex + 1) * BATCH_SIZE)
        if (batch.length === 0) {
            setHasMore(false)
            setCache(prev => ({ ...prev, [tab]: { ...(prev[tab] || {}), people: prev[tab]?.people || [], page: pageIndex, hasMore: false } }))
            return
        }
        setIsLoading(true)
        try {
            const sub = await getSubData([{ kinds: [0], authors: batch }], 250)
            const parsed = sub.data
                .map(e => getParsedAuthor(e))
                .filter((item, index, arr) => arr.findIndex(x => x.pubkey === item.pubkey) === index)
            setPeople(prev => {
                const combined = [...prev, ...parsed]
                const deduped = combined.filter((item, index, arr) => arr.findIndex(x => x.pubkey === item.pubkey) === index)
                const stillHasMore = batch.length >= BATCH_SIZE
                setCache(prevCache => ({ ...prevCache, [tab]: { people: deduped, page: pageIndex, hasMore: stillHasMore } }))
                return deduped
            })
            if (batch.length < BATCH_SIZE) setHasMore(false)
        } catch (err) {
            console.log(err)
        } finally {
            setIsLoading(false)
        }
    }, [pubkeys, tab, setCache])

    const skipInitialFetch = React.useRef(!!cached)
    const fetchBatchRef = React.useRef(fetchBatch)
    fetchBatchRef.current = fetchBatch

    React.useEffect(() => {
        if (skipInitialFetch.current) {
            skipInitialFetch.current = false
            return
        }
        fetchBatchRef.current(page)
    }, [page])

    const hasMoreRef = React.useRef(hasMore)
    hasMoreRef.current = hasMore
    const isLoadingRef = React.useRef(isLoading)
    isLoadingRef.current = isLoading

    React.useEffect(() => {
        if (!sentinelRef.current) return
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && hasMoreRef.current && !isLoadingRef.current) {
                    setPage(prev => prev + 1)
                }
            },
            { rootMargin: '200px' }
        )
        observer.observe(sentinelRef.current)
        return () => observer.disconnect()
    }, [])

    if (pubkeys.length === 0) {
        return (
            <div className="fx-centered fit-container box-pad-v" style={{ opacity: 0.4 }}>
                <p>{t("AdrUBOU")}</p>
            </div>
        )
    }

    return (
        <div className="fit-container fx-centered fx-col fx-start-v box-pad-v-m box-pad-h-m" style={{ rowGap: '24px' }}>
            {people.map(item => {
                const actionData = items.find(i => i.pubkey === item.pubkey)
                const zapMessage = tab === 3 ? actionData?.content : null
                return (
                    <div className="fx-scattered fit-container" key={item.pubkey}>
                        <div className="fit-container fx-centered fx-start-h" style={{ columnGap: '16px', minWidth: 0, flex: 1 }}>
                            <UserProfilePic size={48} img={item.picture} user_id={item.pubkey} />
                            <div className="fx-centered fx-col fx-start-v" style={{ minWidth: 0 }}>
                                <p>{item.display_name}</p>
                                {zapMessage && (
                                    <p className="gray-c p-medium" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '100%' }}>
                                        {zapMessage}
                                    </p>
                                )}
                            </div>
                        </div>
                        <div className="fx-centered" style={{ columnGap: '12px', flexShrink: 0 }}>
                            {tab === 0 && actionData?.content && (
                                <EmojiImg content={actionData.content} />
                            )}
                            {tab === 3 && actionData?.amount != null && (
                                <div className="fx-centered" style={{ columnGap: '4px' }}>
                                    <NumberShrink value={actionData.amount} />
                                    <p className="gray-c p-medium">sats</p>
                                </div>
                            )}
                            <Follow
                                toFollowKey={item.pubkey}
                                toFollowName={item.display_name}
                                bulk={true}
                                bulkList={bulkList}
                                setBulkList={setBulkList}
                                icon={false}
                                size="small"
                            />
                        </div>
                    </div>
                )
            })}
            {isLoading && (
                <div className="fx-centered fit-container box-pad-v">
                    <Spinner />
                </div>
            )}
            {hasMore && <div ref={sentinelRef} style={{ height: '1px' }} />}
        </div>
    )
}

const StatsOverlay = ({ postActions, exit }) => {
    const { t } = useTranslation()
    const [selectedTab, setSelectedTab] = React.useState(0)
    const [peopleCache, setPeopleCache] = React.useState({})

    const counts = [
        postActions.likes?.likes?.length || 0,
        postActions.reposts?.reposts?.length || 0,
        postActions.quotes?.quotes?.length || 0,
        postActions.zaps?.zaps?.length || 0,
    ]

    const tabs = React.useMemo(() => [
        `${t("Alz0E9Y")} (${counts[0]})`,
        `${t("Aai65RJ")} (${counts[1]})`,
        `${t("AWmDftG")} (${counts[2]})`,
        `${t("AVDZ5cJ")} (${counts[3]})`,
    ], [t, counts[0], counts[1], counts[2], counts[3]])

    const items = React.useMemo(() => getItemsForTab(postActions, selectedTab), [postActions, selectedTab])

    return (
        <Overlay exit={exit} width={600}>
            <div className="fx-centered fx-col fx-start-h fit-container box-pad-v-m box-pad-h-m" style={{ rowGap: '16px' }}>
                <StatsBarChart postActions={postActions} />
                <SelectTabs selectedTab={selectedTab} setSelectedTab={setSelectedTab} tabs={tabs} />
                <PeopleList key={selectedTab} items={items} tab={selectedTab} cache={peopleCache} setCache={setPeopleCache} />
            </div>
        </Overlay>
    )
}
