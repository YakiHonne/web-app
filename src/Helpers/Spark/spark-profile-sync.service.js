// TODO: Update this import to match Yakihonne's project structure
// import { createProfileDraftEvent } from '@/lib/draft-event'

/**
 * SparkProfileSyncService - Syncs Spark Lightning address to Nostr profile
 *
 * Automatically updates the user's Nostr profile (kind 0) with their
 * Spark wallet Lightning address (lud16 field) when the wallet connects.
 */
class SparkProfileSyncService {
  static instance

  constructor() {
    if (!SparkProfileSyncService.instance) {
      SparkProfileSyncService.instance = this
    }
    return SparkProfileSyncService.instance
  }

  /**
   * Update the user's Nostr profile with their Spark Lightning address
   * @param lightningAddress - The Lightning address from Spark wallet (e.g., user@breez.lol)
   * @param currentProfileEvent - The user's current profile event (kind 0)
   * @param publish - Function to publish the updated profile event
   * @param updateProfileEvent - Function to update local profile cache
   */
  async syncLightningAddressToProfile(
    lightningAddress,
    currentProfileEvent,
    publish,
    updateProfileEvent
  ) {
    try {
      // Safety check - don't publish if we don't have existing profile data
      if (!currentProfileEvent) {
        console.warn('[SparkProfileSync] No existing profile event - skipping sync to avoid data loss')
        return
      }

      const oldProfileContent = currentProfileEvent ? JSON.parse(currentProfileEvent.content) : {}

      // Check if Lightning address is already set to this value
      if (oldProfileContent.lud16 === lightningAddress) {
        console.log('[SparkProfileSync] Lightning address already up to date:', lightningAddress)
        return
      }

      console.log('[SparkProfileSync] Old profile content:', oldProfileContent)
      console.log('[SparkProfileSync] Updating profile with Lightning address:', lightningAddress)

      // Create updated profile content with new Lightning address
      const newProfileContent = {
        ...oldProfileContent,
        lud16: lightningAddress
      }

      console.log('[SparkProfileSync] New profile content:', newProfileContent)

      // Verify we're not losing data
      const oldKeys = Object.keys(oldProfileContent).length
      const newKeys = Object.keys(newProfileContent).length
      if (newKeys < oldKeys) {
        console.error('[SparkProfileSync] Data loss detected! Old keys:', oldKeys, 'New keys:', newKeys)
        throw new Error('Profile update would lose data - aborting')
      }

      // TODO: Replace this with Yakihonne's method of creating a profile event
      // The createProfileDraftEvent function should create a kind 0 event
      // with the given content and tags
      const profileDraftEvent = {
        kind: 0,
        content: JSON.stringify(newProfileContent),
        tags: currentProfileEvent?.tags || [],
        created_at: Math.floor(Date.now() / 1000)
      }

      // Publish to relays
      const newProfileEvent = await publish(profileDraftEvent)

      // Update local cache
      await updateProfileEvent(newProfileEvent)

      console.log('[SparkProfileSync] Profile updated successfully with Lightning address')
    } catch (error) {
      console.error('[SparkProfileSync] Failed to sync Lightning address to profile:', error)
      throw error // Re-throw so caller can handle it
    }
  }
}

const instance = new SparkProfileSyncService()
export default instance
