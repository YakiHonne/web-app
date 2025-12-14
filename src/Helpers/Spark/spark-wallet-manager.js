/**
 * SparkWalletManager - Centralized wallet manager for Spark wallet
 *
 * This manager coordinates between:
 * - Spark services (SDK, storage, backup)
 * - Redux state
 * - UI components
 *
 * It provides a clean API for wallet operations while handling
 * state management and error handling automatically.
 */

import sparkService from './spark.service.js'
import sparkStorage from './spark-storage.service.js'
import sparkBackup from './spark-backup.service.js'
import { generateMnemonic } from '@scure/bip39'
import { wordlist } from '@scure/bip39/wordlists/english.js'
import { store } from '@/Store/Store'
import {
  setSparkConnected,
  setSparkConnecting,
  setSparkBalance,
  setSparkLightningAddress,
  setSparkWalletInfo,
  setSparkLastSync,
  setSparkPayments,
} from '@/Store/Slides/SparkWallet'
import { getWallets, updateWallets } from '@/Helpers/ClientHelpers'

class SparkWalletManager {
  static instance

  constructor() {
    if (!SparkWalletManager.instance) {
      SparkWalletManager.instance = this
      this.setupEventListeners()
    }
    return SparkWalletManager.instance
  }

  /**
   * Setup SDK event listeners to auto-update Redux state
   */
  setupEventListeners() {
    sparkService.onEvent((event) => {
      console.log('[SparkWalletManager] SDK Event:', event.type)

      // Handle different event types
      switch (event.type) {
        case 'paymentSucceeded':
        case 'paymentFailed':
          // Refresh payments list
          this.refreshPayments()
          break

        case 'synced':
          // Update balance and sync time
          this.refreshWalletState()
          break
      }
    })
  }

  /**
   * Get current user's public key from Redux
   * @param required - If true, throws error when not logged in (default: true)
   */
  getUserPubkey(required = true) {
    const userKeys = store.getState().userKeys
    if (!userKeys || !userKeys.pub) {
      if (required) {
        throw new Error('User not logged in')
      }
      return null
    }
    return userKeys.pub
  }

  /**
   * Check if Spark wallet is connected
   */
  isConnected() {
    return store.getState().sparkConnected
  }

  /**
   * Add Spark wallet to Yakihonne's wallet list
   */
  addToWalletList() {
    try {
      const lightningAddress = store.getState().sparkLightningAddress

      const sparkWallet = {
        id: Date.now(),
        kind: 4, // Spark wallet type
        entitle: lightningAddress || 'Spark Wallet',
        active: true,
        data: 'spark-self-custodial'
      }

      let wallets = getWallets() || []

      // Check if Spark wallet already exists
      const existingSparkIndex = wallets.findIndex(w => w.kind === 4)

      if (existingSparkIndex !== -1) {
        // Update existing Spark wallet
        wallets[existingSparkIndex] = { ...wallets[existingSparkIndex], ...sparkWallet }
      } else {
        // Deactivate other wallets
        wallets = wallets.map(w => ({ ...w, active: false }))
        // Add new Spark wallet
        wallets.push(sparkWallet)
      }

      updateWallets(wallets)
      console.log('[SparkWalletManager] Added to wallet list')
    } catch (error) {
      console.error('[SparkWalletManager] Failed to add to wallet list:', error)
    }
  }

  /**
   * Remove Spark wallet from Yakihonne's wallet list
   */
  removeFromWalletList() {
    try {
      const pubkey = this.getUserPubkey(false) // Don't require login
      if (!pubkey) {
        console.warn('[SparkWalletManager] Cannot remove from wallet list: no pubkey')
        return
      }

      let wallets = getWallets() || []

      // Remove Spark wallet
      wallets = wallets.filter(w => w.kind !== 4)

      // Activate first wallet if available
      if (wallets.length > 0) {
        wallets[0].active = true
      }

      updateWallets(wallets, pubkey)
      console.log('[SparkWalletManager] Removed from wallet list')
    } catch (error) {
      console.error('[SparkWalletManager] Failed to remove from wallet list:', error)
    }
  }

  /**
   * Create new wallet with generated mnemonic
   * @param syncToNostr - Whether to backup to Nostr relays (default: true)
   * @returns Object with mnemonic and SDK instance
   */
  async createWallet(syncToNostr = true) {
    try {
      store.dispatch(setSparkConnecting(true))

      const pubkey = this.getUserPubkey(false) // Don't require login (for onboarding)
      const apiKey = process.env.NEXT_PUBLIC_BREEZ_SPARK_API_KEY

      if (!apiKey) {
        throw new Error('Breez API key not configured. Please add NEXT_PUBLIC_BREEZ_SPARK_API_KEY to your .env file')
      }

      // Generate 12-word mnemonic
      console.log('[SparkWalletManager] Generating new mnemonic...')
      const mnemonic = generateMnemonic(wordlist, 128) // 128 bits = 12 words

      // Connect to Spark SDK
      console.log('[SparkWalletManager] Connecting to Spark SDK...')
      const { sdk } = await sparkService.connect(apiKey, mnemonic)

      // Save encrypted mnemonic only if user is logged in
      if (pubkey) {
        console.log('[SparkWalletManager] Saving encrypted mnemonic...')
        await sparkStorage.saveMnemonic(pubkey, mnemonic, syncToNostr)
      } else {
        console.log('[SparkWalletManager] Skipping backup - user not logged in yet (onboarding)')
      }

      // Update state
      await this.refreshWalletState()
      store.dispatch(setSparkConnected(true))
      store.dispatch(setSparkConnecting(false))

      // Add to Yakihonne wallet list only if logged in
      if (pubkey) {
        this.addToWalletList()
      }

      console.log('[SparkWalletManager] ✅ Wallet created successfully')
      return { mnemonic, sdk }
    } catch (error) {
      console.error('[SparkWalletManager] Failed to create wallet:', error)
      store.dispatch(setSparkConnecting(false))
      store.dispatch(setSparkConnected(false))
      throw error
    }
  }

  /**
   * Check if a wallet backup exists (local or Nostr)
   * @returns {Promise<boolean>} true if backup exists
   */
  async hasBackup() {
    try {
      const pubkey = this.getUserPubkey()
      const mnemonic = await sparkStorage.loadMnemonic(pubkey)
      return !!mnemonic
    } catch (error) {
      console.error('[SparkWalletManager] Error checking for backup:', error)
      return false
    }
  }

  /**
   * Restore wallet from saved mnemonic (local or Nostr)
   * Automatically checks both sources
   */
  async restoreWallet() {
    try {
      store.dispatch(setSparkConnecting(true))

      const pubkey = this.getUserPubkey()
      const apiKey = process.env.NEXT_PUBLIC_BREEZ_SPARK_API_KEY

      if (!apiKey) {
        throw new Error('Breez API key not configured')
      }

      // Load mnemonic (checks local first, then Nostr)
      console.log('[SparkWalletManager] Loading encrypted mnemonic...')
      const rawMnemonic = await sparkStorage.loadMnemonic(pubkey)

      if (!rawMnemonic) {
        throw new Error('No wallet backup found. Please create a new wallet or restore from seed phrase.')
      }

      // Clean the mnemonic (same as restoreFromSeed) to prevent encoding issues
      const mnemonic = rawMnemonic
        .trim()
        .toLowerCase()
        .replace(/\s+/g, ' ')
        .replace(/[^\x00-\x7F]/g, '') // Remove non-ASCII characters

      const wordCount = mnemonic.split(' ').length
      console.log(`[SparkWalletManager] Loaded ${wordCount}-word mnemonic from storage`)

      // Connect to Spark SDK
      console.log('[SparkWalletManager] Connecting to Spark SDK...')
      const { sdk } = await sparkService.connect(apiKey, mnemonic)

      // Update state
      await this.refreshWalletState()
      store.dispatch(setSparkConnected(true))
      store.dispatch(setSparkConnecting(false))

      // Add to Yakihonne wallet list
      this.addToWalletList()

      console.log('[SparkWalletManager] ✅ Wallet restored successfully')
      return { sdk }
    } catch (error) {
      console.error('[SparkWalletManager] Failed to restore wallet:', error)
      store.dispatch(setSparkConnecting(false))
      store.dispatch(setSparkConnected(false))
      throw error
    }
  }

  /**
   * Restore wallet from manual seed phrase entry
   * @param mnemonic - 12 or 24 word seed phrase
   * @param saveBackup - Whether to save backup (default: true)
   */
  async restoreFromSeed(mnemonic, saveBackup = true) {
    try {
      store.dispatch(setSparkConnecting(true))

      const pubkey = this.getUserPubkey()
      const apiKey = process.env.NEXT_PUBLIC_BREEZ_SPARK_API_KEY

      if (!apiKey) {
        throw new Error('Breez API key not configured')
      }

      // Validate mnemonic
      const cleanMnemonic = mnemonic.trim().toLowerCase().replace(/\s+/g, ' ')
      const wordCount = cleanMnemonic.split(' ').length

      if (wordCount !== 12 && wordCount !== 24) {
        throw new Error(`Invalid mnemonic: expected 12 or 24 words, got ${wordCount}`)
      }

      // Connect to Spark SDK
      console.log('[SparkWalletManager] Connecting to Spark SDK with provided seed...')
      const { sdk } = await sparkService.connect(apiKey, cleanMnemonic)

      // Always save to local storage for wallet to persist
      // Only sync to Nostr if requested (to avoid relay auth errors during onboarding)
      console.log('[SparkWalletManager] Saving encrypted backup locally...')
      await sparkStorage.saveMnemonic(pubkey, cleanMnemonic, saveBackup)

      // Update state
      await this.refreshWalletState()
      store.dispatch(setSparkConnected(true))
      store.dispatch(setSparkConnecting(false))

      // Add to Yakihonne wallet list
      this.addToWalletList()

      console.log('[SparkWalletManager] ✅ Wallet restored from seed successfully')
      return { sdk }
    } catch (error) {
      console.error('[SparkWalletManager] Failed to restore from seed:', error)
      store.dispatch(setSparkConnecting(false))
      store.dispatch(setSparkConnected(false))
      throw error
    }
  }

  /**
   * Restore wallet from Nostr backup file
   * @param file - Encrypted backup file
   */
  async restoreFromFile(file) {
    try {
      store.dispatch(setSparkConnecting(true))

      const pubkey = this.getUserPubkey()
      const apiKey = process.env.NEXT_PUBLIC_BREEZ_SPARK_API_KEY

      if (!apiKey) {
        throw new Error('Breez API key not configured')
      }

      // Read and decrypt file
      console.log('[SparkWalletManager] Reading backup file...')
      const rawMnemonic = await sparkBackup.restoreFromSelectedFile(file, pubkey)

      // Clean the mnemonic to prevent encoding issues
      const mnemonic = rawMnemonic
        .trim()
        .toLowerCase()
        .replace(/\s+/g, ' ')
        .replace(/[^\x00-\x7F]/g, '') // Remove non-ASCII characters

      // Connect to Spark SDK
      console.log('[SparkWalletManager] Connecting to Spark SDK...')
      const { sdk } = await sparkService.connect(apiKey, mnemonic)

      // Save cleaned mnemonic to local storage for future auto-restore
      console.log('[SparkWalletManager] Saving cleaned mnemonic to local storage...')
      await sparkStorage.saveMnemonic(pubkey, mnemonic, false) // Already have Nostr backup

      // Update state
      await this.refreshWalletState()
      store.dispatch(setSparkConnected(true))
      store.dispatch(setSparkConnecting(false))

      // Add to Yakihonne wallet list
      this.addToWalletList()

      console.log('[SparkWalletManager] ✅ Wallet restored from file successfully')
      return { sdk }
    } catch (error) {
      console.warn('[SparkWalletManager] Failed to restore from file (handled):', error)
      store.dispatch(setSparkConnecting(false))
      store.dispatch(setSparkConnected(false))
      throw error
    }
  }

  /**
   * Disconnect wallet (keeps backups)
   */
  async disconnect() {
    try {
      await sparkService.disconnect()

      // Clear state
      store.dispatch(setSparkConnected(false))
      store.dispatch(setSparkConnecting(false))
      store.dispatch(setSparkBalance(null))
      store.dispatch(setSparkLightningAddress(null))
      store.dispatch(setSparkWalletInfo(null))
      store.dispatch(setSparkPayments([]))

      console.log('[SparkWalletManager] Wallet disconnected')
    } catch (error) {
      // Suppress sync errors during disconnect - SDK may try to sync during cleanup
      const errorMsg = error?.message || String(error)
      if (errorMsg.includes('RecvError') || errorMsg.includes('sync trigger failed')) {
        console.log('[SparkWalletManager] Suppressed sync error during disconnect (harmless)')
        // Still clear state even if disconnect had an error
        store.dispatch(setSparkConnected(false))
        store.dispatch(setSparkConnecting(false))
      } else {
        console.error('[SparkWalletManager] Error during disconnect:', error)
        throw error
      }
    }
  }

  /**
   * Delete wallet (removes all backups)
   * @param deleteBackups - Whether to delete Nostr backups (default: true)
   */
  async deleteWallet(deleteBackups = true) {
    try {
      const pubkey = this.getUserPubkey()

      // Disconnect first
      await this.disconnect()

      // Delete backups
      console.log('[SparkWalletManager] Deleting wallet backups...')
      await sparkStorage.deleteMnemonic(pubkey, deleteBackups)

      // Remove from Yakihonne wallet list
      this.removeFromWalletList()

      console.log('[SparkWalletManager] ✅ Wallet deleted successfully')
    } catch (error) {
      // Suppress sync errors - SDK may try to sync during disconnect
      const errorMsg = error?.message || String(error)
      if (errorMsg.includes('RecvError') || errorMsg.includes('sync trigger failed')) {
        console.log('[SparkWalletManager] Wallet deleted (suppressed harmless sync error)')
        return // Success despite error
      }
      console.error('[SparkWalletManager] Error deleting wallet:', error)
      throw error
    }
  }

  /**
   * Refresh wallet state (balance, Lightning address, etc.)
   */
  async refreshWalletState() {
    try {
      if (!sparkService.isConnected()) {
        console.warn('[SparkWalletManager] Cannot refresh: wallet not connected')
        return
      }

      console.log('[SparkWalletManager] Refreshing wallet state...')

      // Get wallet info (no need to sync again - already synced during connection)
      const info = await sparkService.getInfo(false) // ensureSynced = false
      console.log('[SparkWalletManager] Got wallet info:', {
        balanceSats: info.balanceSats,
        pendingSendSats: info.pendingSendSats,
        pendingReceiveSats: info.pendingReceiveSats,
        totalInfo: info
      })

      // Get Lightning address
      const lightningAddressInfo = await sparkService.getLightningAddress()
      console.log('[SparkWalletManager] Lightning address:', lightningAddressInfo?.lightningAddress)

      // Update Redux state
      store.dispatch(setSparkWalletInfo(info))
      store.dispatch(setSparkBalance(info.balanceSats))
      store.dispatch(setSparkLightningAddress(lightningAddressInfo?.lightningAddress || null))
      store.dispatch(setSparkLastSync(Date.now()))

      console.log('[SparkWalletManager] ✅ Wallet state refreshed - Balance:', info.balanceSats, 'sats')
    } catch (error) {
      console.error('[SparkWalletManager] Failed to refresh wallet state:', error)
      throw error
    }
  }

  /**
   * Refresh payments list
   * @param {number} offset - Starting index for pagination
   * @param {number} limit - Number of payments to fetch
   * @param {boolean} append - If true, append to existing payments instead of replacing
   */
  async refreshPayments(offset = 0, limit = 20, append = false) {
    try {
      if (!sparkService.isConnected()) {
        console.warn('[SparkWalletManager] Cannot refresh payments: wallet not connected')
        return []
      }

      const newPayments = await sparkService.listPayments(offset, limit)

      if (append) {
        // Append new payments to existing ones
        const currentPayments = store.getState().sparkPayments || []
        const allPayments = [...currentPayments, ...newPayments]
        store.dispatch(setSparkPayments(allPayments))
      } else {
        // Replace with new payments
        store.dispatch(setSparkPayments(newPayments))
      }

      console.log('[SparkWalletManager] Payments refreshed:', newPayments.length, 'total:', store.getState().sparkPayments.length)
      return newPayments
    } catch (error) {
      console.error('[SparkWalletManager] Failed to refresh payments:', error)
      throw error
    }
  }

  /**
   * Sync wallet with network
   */
  async syncWallet() {
    try {
      await sparkService.syncWallet()
      await this.refreshWalletState()
    } catch (error) {
      console.error('[SparkWalletManager] Failed to sync wallet:', error)
      throw error
    }
  }

  /**
   * Register Lightning address
   * @param username - Desired username (will be @breez.tips)
   */
  async registerLightningAddress(username) {
    try {
      const result = await sparkService.registerLightningAddress(username)
      store.dispatch(setSparkLightningAddress(result.lightningAddress))

      // Update wallet list with new lightning address
      this.addToWalletList()

      console.log('[SparkWalletManager] Lightning address registered:', result.lightningAddress)
      return result
    } catch (error) {
      console.error('[SparkWalletManager] Failed to register Lightning address:', error)
      throw error
    }
  }

  /**
   * Delete Lightning address
   */
  async deleteLightningAddress() {
    try {
      await sparkService.deleteLightningAddress()
      store.dispatch(setSparkLightningAddress(null))

      // Update wallet list to remove lightning address
      this.addToWalletList()

      console.log('[SparkWalletManager] Lightning address deleted')
    } catch (error) {
      console.error('[SparkWalletManager] Failed to delete Lightning address:', error)
      throw error
    }
  }

  /**
   * Check if Lightning address username is available
   */
  async checkLightningAddressAvailable(username) {
    return await sparkService.checkLightningAddressAvailable(username)
  }

  /**
   * Suggest available username based on preferred name
   */
  async suggestAvailableUsername(preferredName) {
    return await sparkService.suggestAvailableUsername(preferredName)
  }

  /**
   * Check if wallet backup exists (local or Nostr)
   */
  async hasBackup() {
    try {
      const pubkey = this.getUserPubkey()

      // Check local first (faster)
      if (sparkStorage.hasMnemonic(pubkey)) {
        return true
      }

      // Check Nostr
      return await sparkBackup.hasBackupOnNostr()
    } catch (error) {
      console.error('[SparkWalletManager] Error checking backup:', error)
      return false
    }
  }

  /**
   * Download encrypted backup file
   * @param {boolean} requireConnected - If true, requires wallet to be connected. Default true for user-initiated downloads.
   */
  async downloadBackup(requireConnected = true) {
    const pubkey = this.getUserPubkey(false)

    // Check if user is logged in
    if (!pubkey) {
      throw new Error('Please log in to download backup')
    }

    // For user-initiated downloads, require wallet to be connected
    // For auto-exports (e.g., logout), check if backup exists in storage
    if (requireConnected) {
      const sparkConnected = store.getState().sparkConnected
      if (!sparkConnected) {
        throw new Error('Spark wallet is not connected. Please set up your wallet first.')
      }
    } else {
      // Check if backup exists in storage
      const hasBackup = await this.hasBackup()
      if (!hasBackup) {
        console.log('[SparkWalletManager] No backup found to download during auto-export')
        return // Silently skip if no backup exists
      }
    }

    await sparkBackup.downloadEncryptedBackup(pubkey)
    console.log('[SparkWalletManager] Backup downloaded')
  }
}

const instance = new SparkWalletManager()
export default instance
