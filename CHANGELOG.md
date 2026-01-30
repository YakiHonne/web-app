# (v5.6.0) 29/01/2026

- ECash support: swipe tokens, deposit, send Nutzups, and restore wallets.
- Copy note text for easy sharing.
- Fixed mobile layout issues when using RTL languages.
- Fixed external URLs with trailing characters.
- Delete notes directly from the note options menu.
- Redesigned video controllers for a cleaner experience.
- Fixed fullscreen video playback in the home feed.
- General bug fixes and improvements.

# (v5.5.0) 25/12/2025

- Media support for images and videos across the app, including dashboard, notifications, note previews, relay feeds, search, and user profiles.
- Display of pinned notes on user profiles.
- Ability to pin and unpin notes.
- Added a dedicated mentions section to user profiles.
- Muting state for videos is now properly saved across media views.
- Media publishing now supports images and videos with filtering, trimming, and additional controls.
- Replaced the loading screen with a minimal loading bar for a smoother experience.
- Comment inputs now auto-adjust height based on content.
- Relay encodings are now included in notification URLs for more accurate routing.
- Articles can now be browsed on a standalone page.
- Automatic language direction detection in the article editor (LTR/RTL).
- Fixed incorrect hashtag parsing.
- Fixed markdown link syntax issues when selecting text.
- Improved markdown link parsing in the previewer.
- Added helpful hints to the link toolbar for better usability and clarity.
- Added support for displaying QuickTime videos.
- Fixed timestamp randomization issues related to NIP-17.
- Updated default image placeholders for profile pictures and thumbnails.
- Fixed message decryption issues to prevent multiple parallel popups when using extension signers.

# (v5.4.0) 03/12/2025

- Relays feed now supports relay sets, allowing you to browse content from your preferred relay groups.
- A newly optimized notifications core for significantly faster loading and smoother access.
- Added the ability to mark notifications as read or unread.
- A wider middle layout provides improved visibility and a more comfortable browsing experience.
- Option added to hide mentions in notifications when a note includes many tagged users.
- Added Russian language support.
- Autosave is now disabled for empty widgets, articles, and notes to prevent unwanted drafts.
- Improved real-time content fetching for more accurate and consistent updates.
- Added in-memory caching to multiple areas of the app (notes, notifications, replies, etc.) for reduced loading times.
- Performance improvements across long lists — including notes (home, profile, relay feeds, search), other content types, notifications, and messages.
- Faster message decryption for users signing in with a private key, now non-blocking and more efficient.
- General bug fixes and improvements.

# (v5.3.0) 17/11/2025

- Ability to choose a primary color for the interface.
- Muting note threads now prevents all unwanted replies, reposts, and notifications from that thread.
- Arrow-key navigation added for selecting tagged users in the mentions list.
- Cmd/Ctrl + Enter support for quick publishing in the editor.
- Added NIP-50 search support for enhanced discovery.
- Added Search Relays set.
- Added a hard-refresh mechanism to ensure notifications always stay up-to-date.
- Bookmark improvements: redesigned cards, added covers, added tags/URLs display and filtering, fixed missing notes in filters, and resolved floating message overlay issues.
- Toggle link previews on or off as needed.
- Redesigned the muting list in settings.
- NIP-71 videos now fall back to secondary URLs if the main source fails.
- Removed the warning box that appeared when selecting text outside the comment field.
- Videos are now parsed correctly from URLs inside articles.
- Optimized the relay list picker for smoother interaction.
- Improved the emoji picker with a faster and larger window.
- Page titles now set correctly in SSR for better SEO and link previews.
- Fixed comment sections not closing after posting in articles, curations, and videos.
- Fixed draft articles not publishing when using “publish with deletion.”
- Fixed reply previews when the main post is an article, curation, or video.
- Fixed Relay Orbit becoming stuck when no data is returned.

# (v5.2.0) 02/11/2025

- Expanded sats-to-fiat conversion to support more currencies
- Added real-time note updates in Relay Orbits
- Added curations tab to Relay Orbit feeds
- Included relay data in note address encoding for more accurate fetching
- Fixed icon color issues when using the system theme
- Settings footer repositioned to the right on desktop view
- Added support for parsing nostr:-prefixed lnbc invoices
- Fixed missing reaction stats in notes
- Fixed issues with republishing events
- Events in the manager are now sorted by actual publish time
- Fixed home feed timeline fetching
- Fixed parsed URLs with the nostr: schema
- Improved self-profile search and general search accuracy
- Fixed relay metadata display in Relay Orbits
- Added “Favored By” stats across all Relay Orbit tabs
- Added Web of Trust explanation to Settings
- Notes can now be opened in separate tabs
- Fixed inconsistent article previews before and after publishing
- Fixed relay list overflow in Relay Feeds settings
- General improvements

# (v5.1.0) 21/10/2025

- Customize your post actions — reorder, enable, or disable them to match your style
- Media blur for posts from non-followed users (enabled by default, adjustable in settings)
- Post directly within Relay Orbits for each relay
- Redesigned hashtags for a fresher look
- Fixed layout issues on mobile devices
- Fixed authentication errors when publishing protected events
- Fixed YouTube Shorts not displaying properly
- Fixed wallet switch crashes
- Fixed occasional “Error 500” when browsing posts
- Added support for Indian languages
- General performance and stability improvements

# (v5.0.0) 06/10/2025

- Core migration to SSR for faster performance, improved SEO, and smarter link previews for bots.
- New Relay Orbits page to explore content beyond your network.
- Fresh redesign across the app — including the note editor, parsing, dropdowns, popups, and more.
- Floating chatbox lets you keep conversations going while browsing.
- Scroll and page state restoration for smooth, uninterrupted navigation.
- Seamlessly manage content sources — add favorite relays and switch between them easily.
- Protected event publishing (NIP-70) now supported.
- Republish events to specific relays for better targeting.
- Clickable relay URLs directly within content.
- Instant zaps — paste your LNURL and let others zap you right from your note.
- Customization upgrades — redesigned settings with long-press actions, one-tap reactions, and default reaction preferences.
- New curated themes for a pleasant experience: Noir, Graphite, Neige, and Ivory.
- General bug fixes and performance improvements.

# (v4.8.0) 02/08/2025

- Content source choices are now saved in both Home and Discover for a more consistent browsing experience.
- More event options added, including copying the pubkey, viewing raw events, and more.
- Curation and video content can now be edited after publishing.
- Improved notes rendering for faster and smoother performance.
- Link previews are now available for better content visibility.
- Redesigned audio player with a cleaner and more user-friendly interface.
- Automatic language direction detection when editing and displaying content, supporting both LTR and RTL languages.
- General improvements and bug fix

# (v4.7.0) 11/07/2025

- Secure login with remote signers (nSec Bunkers) is now available for safer account management.
- BLOSSOM is now supported, allowing you to upload, mirror, and access mirrored files—with easy server setup in settings.
- The zapping window has a brand-new design—quick wallet switching, recipient previews, and a bigger, more user-friendly layout make sending zaps easier than ever.
- Favorite relays support lets you easily access and manage your go-to relay sources when browsing content.
- Smart Widget AI Assistant is live! Developers can now get real-time help to build and use smart widgets more easily.
- Lightning payments through miniapps are now supported, letting developers securely trigger payments via smart widgets.
- Web of Trust is now everywhere, helping improve post stats, notifications, and messaging based on who you trust.
- Set your own trust score threshold in settings to fine-tune what you see and who you interact with.
- Custom messaging relays let you send and receive DMs through the relays you choose.
- Relay settings got a fresh redesign for a cleaner, more intuitive experience.
- Notifications now load faster, giving you a smoother experience all around.
- Search is faster and smarter—across spotlight, the main search page, and mentions in notes.
- Refined dashboard layout for a smoother and more intuitive user experience.
- See signer types at a glance in the side menu to better understand each connected account.
- Interest list added to both the search page and spotlight for quicker content discovery.
- Arabic and French language support has been added for a more
  inclusive experience.
- Removing selected filter now stick—your choices are remembered even after refreshing the page.
- General improvements and bug fix

# (v4.6.0) 05/06/2025

- Content customization now supports multiple source types—from your Nostr network and global feed to Data Vending Machine servers and custom or algorithmic relays.
- Advanced content filtering lets you fine-tune your experience by setting time ranges, filtering by keywords, showing posts from favorite users, and more.
- Seamless multi-account publishing enables fast switching between connected accounts for posting notes, comments, and articles—without ending your current session.
- Reposts are now grouped to keep your home feed clean and focused.
- Interact quickly with articles, videos, and curations while viewing key stats at a glance.
- Smart Widget types are now organized into separate tabs for a clearer and more intuitive browsing experience.
- General improvements and bug fixes for a more polished experience.

# (v4.5.0) 25/04/2025

- Introducing Smart Widgets v2 – now dynamic and programmable. Learn more at ~[yakihonne.com/docs/sw/intro](https://yakihonne.com/docs/sw/intro)~.
- New Tools Smart Widgets section in note creation for advanced content editing.
- Curations, videos, and polls are now Tools Smart Widgets, enabling quick creation and seamless embedding in notes.
- Zap advertisements added—top zappers can now appear below notes.
- Note translation button has been relocated next to the note options for easier access.
- Follower and following lists are now visible directly on the dashboard home page.
- General improvements and bug fixes for a smoother experience.

# (v4.4.0) 30/03/2025

- Custom reactions are here! Choose your preferred emoji to react to notes and other content.
- Improved profile organization with notes and replies now displayed separately.
- Adding the ability to zap notes directly from the notifications center.
- Enhanced DM filtering by time, allowing you to view only recent messages or browse further back.
- Manual cache clearing from settings to optimize web app performance.
- Resolved issue preventing users from removing custom media uploader servers.
- Expanded export data, including more relevant details in credential and wallet files.
- General bug fixes and performance improvements.

# (v4.3.1) 22/02/2025

- Zap polls can now be added directly from the list or created instantly within notes and comments.
- Muting users is now more reliable.
- Users can download and export their NWC secret for wallets.
- Wallets and account credentials are automatically saved upon signup and logout.
- Faster login and signup when interacting with Yakihonne while logged out.
- Bug fixes and performance optimizations for improved reliability.

# (v4.3.0) 23/01/2025

- Yakihonne wallet name customization for newly created wallets.
- Option to toggle between collapsed or expanded notes in the feed for a personalized experience.
- Notification preferences can now be managed directly from the settings page.
- Quick access to your profile with the newly added profile button.
- Native poll rendering and voting functionality within notes.
- Bug fixes and performance optimizations for improved reliability.

# (v4.2.2) 08/01/2025

- Added support for uploading multiple images or videos in notes, comments, and messages.
- Refined the search mechanism for better accuracy and performance.
- General bug fixes and improvements.

# (v4.2.1) 07/01/2025

- Added language support for Spanish, Portuguese, Thai, Japanese, and Italian.
- Enabled support for processing invoice payments in notes.
- General bug fixes and improvements.

# (v4.2.0) 31/12/2024

- Yakihonne is now multilingual! Enjoy the app in English and Chinese, with more languages coming soon, including Spanish, Portuguese, Thai, Arabic, Japanese, and Italian.
- Added support for translating notes and articles into the app's selected language.
- Copy-paste images to upload seamlessly across the app.
- Resolved issues with secure DMs when logging in using a private key.
- General bug fixes and improvements.

# (v4.1.1) 03/12/2024

- Addressing the issue where articles are malformed
- Fixing the issue regarding the notes preview
- Adding emojis and GIFs in the DM
- Full support of the NWC secret that are created outside of Alby wallet.
- General bug fix.

# (v4.1.0) 28/11/2024

- An upgraded note editor with new tools like GIFs and emojis, plus real-time previews.
- Support for additional media uploaders, including options to add custom servers.
- Expanded search capabilities, allowing users to find more content on the search page.
- New browsing suggestions for notes, media, users, and more.
- General improvements.
- Bug fixes and optimizations.

# (v4.0.0) 01/11/2024

- An entirely enhanced app core for a faster, reliable and solid interaction with the Nostr network.
- A redesigned UI/UX for more content visibility and usage friendly experience including new color palette, a modern typeface and a wide new looking content cards.
- A refreshed On-bording page to make it logging in or creating new accounts faster and more welcoming.
- The new Discover page are now the place where all media content articles, videos and curations for an easy access to what people are recently posting and sharing.
- A redesigned Notifications page to stay updated with your followings activities and what people say about your published content.
- Welcoming Dashboard, the home where you manage all your published content in one place in a fast and easy way.
- Users without a wallet now can create one directly from Yakihonne to start send and receive zaps to and from your favorite people.
- The Search feature is now faster where you can paste any kind of Nostr scheme or search for users or content right in your sidebar.
- Your published events are now saved in your browser for a later management if failed to relaunch when relays are failed the first time.
- Uncensored Notes page now is called Verify Notes, keeping all its features we love as before.
