import { generateMnemonic } from '@scure/bip39'
import { wordlist } from '@scure/bip39/wordlists/english.js'
import { kinds, nip04 } from 'nostr-tools'
import { ndkInstance } from '@/Helpers/NDKInstance'
import { InitEvent } from '@/Helpers/Controlers'
import { store } from '@/Store/Store'
import { relaysOnPlatform } from '@/Content/Relays'
import { NDKEvent } from '@nostr-dev-kit/ndk'

// Big relay URLs for backup redundancy
const BIG_RELAY_URLS = relaysOnPlatform

/**
 * SparkBackupService - Nostr-based encrypted backup for Spark wallet
 *
 * Uses NIP-78 (Kind 30078) for application-specific data storage
 * Encrypts mnemonic with NIP-04 (self-to-self) for multi-device sync
 *
 * Benefits over local-only storage:
 * - Multi-device wallet access
 * - Automatic cloud backup
 * - Recoverable if device is lost
 */
class SparkBackupService {
  static instance
  BACKUP_D_TAG = 'spark-wallet-backup'
  BACKUP_KIND = 30078 // NIP-78: Application-specific data

  constructor() {
    if (!SparkBackupService.instance) {
      SparkBackupService.instance = this
    }
    return SparkBackupService.instance
  }

  /**
   * Save encrypted mnemonic to Nostr relays
   * Uses NIP-04 self-encryption for privacy
   */
  async saveToNostr(mnemonic) {
    const userKeys = store.getState().userKeys

    if (!userKeys || !userKeys.pub) {
      console.error('[SparkBackup] No user keys available')
      throw new Error('User must be logged in to save backup to Nostr')
    }

    try {
      console.log('[SparkBackup] Step 1: Getting pubkey...')
      const pubkey = userKeys.pub
      console.log('[SparkBackup] Pubkey obtained:', pubkey.substring(0, 8) + '...')

      // Encrypt mnemonic to self using NIP-04
      console.log('[SparkBackup] Step 2: Encrypting mnemonic with NIP-04...')
      let encryptedContent

      if (userKeys.ext) {
        // Use browser extension for encryption
        encryptedContent = await window.nostr.nip04.encrypt(pubkey, mnemonic)
      } else if (userKeys.sec) {
        // Use nostr-tools for encryption
        encryptedContent = await nip04.encrypt(userKeys.sec, pubkey, mnemonic)
      } else {
        throw new Error('No valid signing method available')
      }

      console.log('[SparkBackup] Mnemonic encrypted successfully')

      // Create NIP-78 event
      console.log('[SparkBackup] Step 3: Signing backup event...')
      const event = await InitEvent(
        this.BACKUP_KIND,
        encryptedContent,
        [
          ['d', this.BACKUP_D_TAG], // Addressable event identifier
          ['client', 'Yakihonne'],
          ['description', 'Encrypted Spark wallet backup']
        ],
        Math.floor(Date.now() / 1000)
      )

      if (!event) {
        throw new Error('Failed to sign event')
      }

      console.log('[SparkBackup] Event signed successfully, id:', event.id.substring(0, 8) + '...')

      // Publish to user's write relays + platform relays
      console.log('[SparkBackup] Step 4: Getting relay list...')
      const userRelays = store.getState().userRelays || []
      const writeRelays = userRelays
        .filter(relay => relay.write)
        .map(relay => relay.url)
        .slice(0, 5)

      const relays = [...new Set([...writeRelays, ...BIG_RELAY_URLS])]
      console.log('[SparkBackup] Publishing to relays:', relays)

      console.log('[SparkBackup] Step 5: Publishing event to relays...')
      const ndkEvent = new NDKEvent(ndkInstance, event)

      // Add error handlers to prevent uncaught authentication errors
      const originalOnError = ndkInstance.pool?.on?.bind(ndkInstance.pool)
      const errorHandler = (error) => {
        const errorMsg = error?.message || String(error)
        if (errorMsg.includes('already authenticated') ||
            errorMsg.includes('user unauthorized') ||
            errorMsg.includes('restricted')) {
          console.warn('[SparkBackup] Relay authentication issue (ignoring):', errorMsg)
          // Silently ignore relay auth errors
          return
        }
        console.error('[SparkBackup] Relay error:', error)
      }

      // Publish with error handling for relay authentication issues
      try {
        // Temporarily suppress relay auth errors
        const publishPromise = ndkEvent.publish()

        // Wrap in a timeout to prevent hanging
        const timeoutPromise = new Promise((resolve) => {
          setTimeout(() => {
            console.log('[SparkBackup] ✅ Backup publish operation completed (or timed out)')
            resolve()
          }, 5000) // 5 second timeout
        })

        await Promise.race([publishPromise, timeoutPromise])
        console.log('[SparkBackup] ✅ Encrypted backup published to Nostr relays')
      } catch (publishError) {
        // Handle specific relay errors that shouldn't fail the backup
        const errorMsg = publishError?.message || String(publishError)
        if (errorMsg.includes('already authenticated') ||
            errorMsg.includes('user unauthorized') ||
            errorMsg.includes('restricted')) {
          console.warn('[SparkBackup] Relay authentication issue (non-critical):', errorMsg)
          // Don't throw - this is a relay-specific issue, local backup still succeeded
        } else {
          // Re-throw other errors
          throw publishError
        }
      }
    } catch (error) {
      console.error('[SparkBackup] ❌ Failed to save backup to Nostr:', error)
      console.error('[SparkBackup] Error type:', error instanceof Error ? error.constructor.name : typeof error)
      console.error('[SparkBackup] Error message:', error instanceof Error ? error.message : String(error))
      console.error('[SparkBackup] Error stack:', error instanceof Error ? error.stack : 'N/A')
      throw new Error(`Failed to save encrypted backup to Nostr relays: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  /**
   * Load encrypted mnemonic from Nostr relays
   * Tries user's read relays + big relays for redundancy
   */
  async loadFromNostr() {
    const userKeys = store.getState().userKeys

    if (!userKeys || !userKeys.pub) {
      console.log('[SparkBackup] User not logged in, cannot load from Nostr')
      return null
    }

    try {
      const pubkey = userKeys.pub

      // Fetch from user's read relays + platform relays
      const userRelays = store.getState().userRelays || []
      const readRelays = userRelays
        .filter(relay => relay.read)
        .map(relay => relay.url)
        .slice(0, 5)

      const relays = [...new Set([...readRelays, ...BIG_RELAY_URLS])]

      // Fetch the backup event (NIP-78 addressable event)
      const subscription = ndkInstance.subscribe(
        {
          kinds: [this.BACKUP_KIND],
          authors: [pubkey],
          '#d': [this.BACKUP_D_TAG]
        },
        {
          closeOnEose: true,
          groupable: false,
          cacheUsage: 'CACHE_FIRST',
          relayUrls: relays
        }
      )

      return new Promise((resolve, reject) => {
        let events = []
        let completed = false

        // Add timeout to prevent hanging on relay issues
        const timeout = setTimeout(() => {
          if (!completed) {
            completed = true
            subscription.stop()
            console.log('[SparkBackup] Timeout waiting for relay response')
            resolve(null)
          }
        }, 10000) // 10 second timeout

        subscription.on('event', (event) => {
          events.push(event.rawEvent())
        })

        subscription.on('eose', async () => {
          if (completed) return
          completed = true
          clearTimeout(timeout)
          subscription.stop()

          if (events.length === 0) {
            console.log('[SparkBackup] No backup found on Nostr relays')
            resolve(null)
            return
          }

          // Use the most recent event
          const backupEvent = events.sort((a, b) => b.created_at - a.created_at)[0]

          try {
            // Decrypt the mnemonic
            let mnemonic

            if (userKeys.ext) {
              // Use browser extension for decryption
              mnemonic = await window.nostr.nip04.decrypt(pubkey, backupEvent.content)
            } else if (userKeys.sec) {
              // Use nostr-tools for decryption
              mnemonic = await nip04.decrypt(userKeys.sec, pubkey, backupEvent.content)
            } else {
              throw new Error('No valid decryption method available')
            }

            console.log('[SparkBackup] Backup loaded and decrypted from Nostr')
            resolve(mnemonic)
          } catch (error) {
            console.error('[SparkBackup] Failed to decrypt backup:', error)
            reject(error)
          }
        })

        // Handle subscription errors (like auth failures)
        subscription.on('error', (error) => {
          console.warn('[SparkBackup] Relay error (ignoring):', error)
          // Don't reject - some relays may fail, others may succeed
        })
      })
    } catch (error) {
      console.error('[SparkBackup] Failed to load backup from Nostr:', error)
      return null
    }
  }

  /**
   * Delete backup from Nostr relays
   * Publishes a deletion event (NIP-09)
   */
  async deleteFromNostr() {
    const userKeys = store.getState().userKeys

    if (!userKeys || !userKeys.pub) {
      throw new Error('User must be logged in to delete backup')
    }

    try {
      const pubkey = userKeys.pub

      // Fetch the backup event to get its ID
      const userRelays = store.getState().userRelays || []
      const readRelays = userRelays
        .filter(relay => relay.read)
        .map(relay => relay.url)
        .slice(0, 5)

      const relays = [...new Set([...readRelays, ...BIG_RELAY_URLS])]

      // Fetch the backup event
      const subscription = ndkInstance.subscribe(
        {
          kinds: [this.BACKUP_KIND],
          authors: [pubkey],
          '#d': [this.BACKUP_D_TAG]
        },
        {
          closeOnEose: true,
          groupable: false,
          cacheUsage: 'CACHE_FIRST',
          relayUrls: relays
        }
      )

      const backupEvent = await new Promise((resolve, reject) => {
        let events = []
        let completed = false

        // Add timeout to prevent hanging on relay issues
        const timeout = setTimeout(() => {
          if (!completed) {
            completed = true
            subscription.stop()
            console.log('[SparkBackup] Timeout waiting for relay response during delete')
            resolve(null)
          }
        }, 10000) // 10 second timeout

        subscription.on('event', (event) => {
          events.push(event.rawEvent())
        })

        subscription.on('eose', () => {
          if (completed) return
          completed = true
          clearTimeout(timeout)
          subscription.stop()

          if (events.length === 0) {
            console.log('[SparkBackup] No backup to delete')
            resolve(null)
            return
          }

          // Use the most recent event
          const event = events.sort((a, b) => b.created_at - a.created_at)[0]
          resolve(event)
        })

        // Handle subscription errors (like auth failures)
        subscription.on('error', (error) => {
          console.warn('[SparkBackup] Relay error during delete (ignoring):', error)
          // Don't reject - some relays may fail, others may succeed
        })
      })

      if (!backupEvent) {
        return
      }

      // Create deletion event (NIP-09)
      const deletionEvent = await InitEvent(
        kinds.EventDeletion,
        'Spark wallet backup deleted',
        [['e', backupEvent.id]],
        Math.floor(Date.now() / 1000)
      )

      if (!deletionEvent) {
        throw new Error('Failed to sign deletion event')
      }

      // Publish deletion event
      const writeRelays = userRelays
        .filter(relay => relay.write)
        .map(relay => relay.url)
        .slice(0, 5)

      const ndkEvent = new NDKEvent(ndkInstance, deletionEvent)
      await ndkEvent.publish()

      console.log('[SparkBackup] Deletion event published')
    } catch (error) {
      console.error('[SparkBackup] Failed to delete backup:', error)
      throw new Error('Failed to delete backup from Nostr relays')
    }
  }

  /**
   * Check if backup exists on Nostr relays
   */
  async hasBackupOnNostr() {
    const userKeys = store.getState().userKeys

    if (!userKeys || !userKeys.pub) {
      return false
    }

    try {
      const pubkey = userKeys.pub
      const userRelays = store.getState().userRelays || []
      const readRelays = userRelays
        .filter(relay => relay.read)
        .map(relay => relay.url)
        .slice(0, 5)

      const relays = [...new Set([...readRelays, ...BIG_RELAY_URLS])]

      const subscription = ndkInstance.subscribe(
        {
          kinds: [this.BACKUP_KIND],
          authors: [pubkey],
          '#d': [this.BACKUP_D_TAG]
        },
        {
          closeOnEose: true,
          groupable: false,
          cacheUsage: 'CACHE_FIRST',
          relayUrls: relays
        }
      )

      return new Promise((resolve) => {
        let hasBackup = false

        subscription.on('event', () => {
          hasBackup = true
        })

        subscription.on('eose', () => {
          subscription.stop()
          resolve(hasBackup)
        })
      })
    } catch (error) {
      console.error('[SparkBackup] Failed to check for backup:', error)
      return false
    }
  }

  /**
   * Check which relays have the backup available
   * Returns a map of relay URL to availability status
   */
  async checkBackupAvailability() {
    const userKeys = store.getState().userKeys

    if (!userKeys || !userKeys.pub) {
      console.error('[SparkBackup] No user keys available')
      throw new Error('User must be logged in to check backup availability')
    }

    try {
      const pubkey = userKeys.pub
      const userRelays = store.getState().userRelays || []
      const writeRelays = userRelays
        .filter(relay => relay.write)
        .map(relay => relay.url)
        .slice(0, 5)

      const relays = Array.from(
        new Set([...writeRelays, ...BIG_RELAY_URLS])
      )

      console.log('[SparkBackup] Checking backup availability on relays:', relays)

      const availabilityMap = {}

      // Check each relay individually with timeout
      await Promise.allSettled(
        relays.map(async (relayUrl) => {
          try {
            const result = await Promise.race([
              new Promise((resolve) => {
                const subscription = ndkInstance.subscribe(
                  {
                    kinds: [this.BACKUP_KIND],
                    authors: [pubkey],
                    '#d': [this.BACKUP_D_TAG]
                  },
                  {
                    closeOnEose: true,
                    groupable: false,
                    relayUrls: [relayUrl]
                  }
                )

                let found = false

                subscription.on('event', () => {
                  found = true
                })

                subscription.on('eose', () => {
                  subscription.stop()
                  resolve(found)
                })
              }),
              new Promise((_, reject) =>
                setTimeout(() => reject(new Error('Timeout')), 5000)
              )
            ])

            availabilityMap[relayUrl] = result
            console.log(`[SparkBackup] ${relayUrl}: ${result ? 'Found' : 'Not found'}`)
          } catch (error) {
            availabilityMap[relayUrl] = false
            console.log(`[SparkBackup] ${relayUrl}: Failed to check (${error instanceof Error ? error.message : 'Unknown error'})`)
          }
        })
      )

      return availabilityMap
    } catch (error) {
      console.error('[SparkBackup] Failed to check backup availability:', error)
      throw new Error('Failed to check backup availability on relays')
    }
  }

  /**
   * Generate a new 12-word BIP39 mnemonic
   */
  generateMnemonic() {
    const mnemonic = generateMnemonic(wordlist, 128) // 128 bits = 12 words
    console.log('[SparkBackup] New mnemonic generated')
    return mnemonic
  }

  /**
   * Download encrypted backup for current user
   * Convenience method that handles encryption automatically
   */
  async downloadEncryptedBackup(pubkey) {
    try {
      const { nip04 } = await import('nostr-tools')
      const { store } = await import('@/Store/Store')

      // Get mnemonic from storage
      const sparkStorage = (await import('./spark-storage.service.js')).default
      const mnemonic = await sparkStorage.loadMnemonic(pubkey)

      if (!mnemonic) {
        throw new Error('No wallet found to backup')
      }

      // Get user keys for encryption
      const userKeys = store.getState().userKeys
      if (!userKeys || !userKeys.pub) {
        throw new Error('User not logged in')
      }

      // Encrypt function
      const encrypt = async (recipientPubkey, plaintext) => {
        if (userKeys.ext && window.nostr?.nip04?.encrypt) {
          return await window.nostr.nip04.encrypt(recipientPubkey, plaintext)
        } else if (userKeys.sec) {
          return await nip04.encrypt(userKeys.sec, recipientPubkey, plaintext)
        } else {
          throw new Error('Backup encryption requires a Nostr extension or secret key. Please use a Nostr extension like Alby or nos2x to download encrypted backups.')
        }
      }

      // Download the backup file
      await this.downloadBackupFile(mnemonic, pubkey, encrypt)

      console.log('[SparkBackup] ✅ Encrypted backup downloaded')
    } catch (error) {
      console.error('[SparkBackup] Failed to download encrypted backup:', error)
      throw error
    }
  }

  /**
   * Create and download encrypted backup file
   * This allows offline backup storage
   */
  async downloadBackupFile(
    mnemonic,
    pubkey,
    encrypt
  ) {
    try {
      // Encrypt the mnemonic
      const encryptedMnemonic = await encrypt(pubkey, mnemonic)

      // Create backup object
      const backup = {
        version: 1,
        type: 'spark-wallet-backup',
        pubkey,
        encryptedMnemonic,
        createdAt: Date.now(),
        createdBy: 'Yakihonne'
      }

      // Convert to JSON
      const backupData = JSON.stringify(backup, null, 2)

      // Create filename with timestamp
      const timestamp = new Date().toISOString().split('T')[0] // YYYY-MM-DD
      const filename = `spark-wallet-backup-${timestamp}.json`

      // Download file
      const blob = new Blob([backupData], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      console.log('[SparkBackup] Encrypted backup file downloaded:', filename)
    } catch (error) {
      console.error('[SparkBackup] Failed to download backup file:', error)
      throw new Error('Failed to create backup file')
    }
  }

  /**
   * Restore wallet from encrypted backup file
   */
  async restoreFromFile(
    pubkey,
    decrypt
  ) {
    return new Promise((resolve, reject) => {
      const input = document.createElement('input')
      input.type = 'file'
      input.accept = '.json'

      let isHandled = false
      let dialogOpened = false

      // Handle file selection cancellation - check when dialog closes
      const handleCancel = () => {
        if (!isHandled) {
          isHandled = true
          console.log('[SparkBackup] File selection cancelled by user')
          reject(new Error('File selection cancelled'))
        }
      }

      // Listen for cancel event (works on some browsers)
      input.addEventListener('cancel', handleCancel)

      // Track when dialog opens and closes
      const handleFocus = () => {
        if (!dialogOpened) {
          // First focus = dialog opened
          dialogOpened = true
          // Re-add listener for when dialog closes
          window.addEventListener('focus', handleFocus, { once: true })
        } else {
          // Second focus = dialog closed
          // Wait a bit to see if file was selected
          setTimeout(() => {
            if (!isHandled && !input.files?.length) {
              handleCancel()
            }
          }, 200)
        }
      }

      window.addEventListener('focus', handleFocus, { once: true })

      input.onchange = async (e) => {
        if (isHandled) return
        isHandled = true

        window.removeEventListener('focus', handleFocus)
        input.removeEventListener('cancel', handleCancel)

        const file = e.target.files?.[0]
        if (!file) {
          reject(new Error('No file selected'))
          return
        }

        const reader = new FileReader()
        reader.onload = async (e) => {
          try {
            const content = e.target?.result
            const backup = JSON.parse(content)

            // Validate backup format
            if (backup.type !== 'spark-wallet-backup') {
              throw new Error('Invalid backup file format')
            }

            if (backup.version !== 1) {
              throw new Error(`Unsupported backup version: ${backup.version}`)
            }

            // Verify backup belongs to this user
            if (backup.pubkey !== pubkey) {
              throw new Error(`WRONG_ACCOUNT:${backup.pubkey}:${pubkey}`)
            }

            // Decrypt mnemonic
            const mnemonic = await decrypt(pubkey, backup.encryptedMnemonic)

            console.log('[SparkBackup] Wallet restored from backup file')
            resolve(mnemonic)
          } catch (error) {
            console.warn('[SparkBackup] Failed to restore from backup file (handled):', error)
            reject(error)
          }
        }

        reader.onerror = () => reject(new Error('Failed to read file'))
        reader.readAsText(file)
      }

      input.click()
    })
  }

  /**
   * Decrypt encrypted mnemonic using NIP-04
   * @param pubkey - User's public key
   * @param encryptedMnemonic - Encrypted mnemonic string
   */
  async decryptMnemonic(pubkey, encryptedMnemonic) {
    const userKeys = store.getState().userKeys

    if (!userKeys || !userKeys.pub) {
      throw new Error('User must be logged in to decrypt backup')
    }

    let mnemonic

    if (userKeys.ext) {
      // Use browser extension for decryption
      mnemonic = await window.nostr.nip04.decrypt(pubkey, encryptedMnemonic)
    } else if (userKeys.sec) {
      // Use nostr-tools for decryption
      mnemonic = await nip04.decrypt(userKeys.sec, pubkey, encryptedMnemonic)
    } else {
      throw new Error('No valid decryption method available')
    }

    return mnemonic
  }

  /**
   * Restore wallet from a pre-selected backup file
   * @param file - The backup file that was already selected by the user
   * @param pubkey - User's public key
   */
  async restoreFromSelectedFile(file, pubkey) {
    try {
      if (!file) {
        throw new Error('No file provided')
      }

      // Read the file
      const content = await new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = (e) => resolve(e.target?.result)
        reader.onerror = () => reject(new Error('Failed to read file'))
        reader.readAsText(file)
      })

      const backup = JSON.parse(content)

      // Validate backup format
      if (backup.type !== 'spark-wallet-backup') {
        throw new Error('Invalid backup file format')
      }

      if (backup.version !== 1) {
        throw new Error(`Unsupported backup version: ${backup.version}`)
      }

      // Verify backup belongs to this user
      if (backup.pubkey !== pubkey) {
        throw new Error(`WRONG_ACCOUNT:${backup.pubkey}:${pubkey}`)
      }

      // Decrypt mnemonic
      const mnemonic = await this.decryptMnemonic(pubkey, backup.encryptedMnemonic)

      console.log('[SparkBackup] Wallet restored from selected backup file')
      return mnemonic
    } catch (error) {
      console.warn('[SparkBackup] Failed to restore from selected file (handled):', error)
      throw error
    }
  }
}

const instance = new SparkBackupService()
export default instance
