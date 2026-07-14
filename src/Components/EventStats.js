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

const BATCH_SIZE = 20

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

    React.useEffect(() => {
        if (skipInitialFetch.current) {
            skipInitialFetch.current = false
            return
        }
        fetchBatch(page)
    }, [page, fetchBatch])

    React.useEffect(() => {
        if (!sentinelRef.current || !hasMore || isLoading) return
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting) setPage(prev => prev + 1)
            },
            { rootMargin: '200px' }
        )
        observer.observe(sentinelRef.current)
        return () => observer.disconnect()
    }, [hasMore, isLoading, people])

    if (pubkeys.length === 0) {
        return (
            <div className="fx-centered fit-container box-pad-v" style={{ opacity: 0.4 }}>
                <p>No one yet</p>
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
                                // <span style={{ fontSize: '1.2rem' }}>{actionData.content}</span>
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
            {hasMore && !isLoading && <div ref={sentinelRef} style={{ height: '1px' }} />}
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

    const tabs = [
        `${t("Alz0E9Y")} (${counts[0]})`,
        `${t("Aai65RJ")} (${counts[1]})`,
        `${t("AWmDftG")} (${counts[2]})`,
        `${t("AVDZ5cJ")} (${counts[3]})`,
    ]

    const items = React.useMemo(() => getItemsForTab(postActions, selectedTab), [postActions, selectedTab])

    return (
        <Overlay exit={exit} width={600}>
            <div className="fx-centered fx-col fx-start-h fit-container box-pad-v-m box-pad-h-m">
                <SelectTabs selectedTab={selectedTab} setSelectedTab={setSelectedTab} tabs={tabs} />
                <PeopleList key={selectedTab} items={items} tab={selectedTab} cache={peopleCache} setCache={setPeopleCache} />
            </div>
        </Overlay>
    )
}
