# What is YakiHonne?

A decentralized social payment client on `Nostr` & `Bitcoin`. Check it out at [yakihonne.com](https://yakihonne.com)

YakiHonne also runs its own relays under [nostr-01.yakihonne.com](https://nostr-01.yakihonne.com) and [nostr-02.yakihonne.com](https://nostr-02.yakihonne.com) for creators to publish their content, it is free of charge. The relay is based on [strfry](https://github.com/hoytech/strfry) and written in cpp if you would like to check it out.


# Gallery

| <img src="https://github.com/user-attachments/assets/9bf2f6fe-6449-4376-acb0-bb31209d01e6" alt="screen-2" width="320"/> | <img src="https://github.com/user-attachments/assets/e615b20f-2b75-4e51-8d6b-7e5ae1f804e1" alt="screen-3" width="320"/> | <img src="https://github.com/user-attachments/assets/73f5ab22-dc20-4fea-bbad-5bba82a520f7" alt="screen-4" width="320"/> |
|---|---|---|
| <img src="https://github.com/user-attachments/assets/c38f377a-eba7-42e9-9b69-b073cd2caff8" alt="screen-5" width="320"/> | <img src="https://github.com/user-attachments/assets/1d357c0f-7f50-4d47-8ed1-67d4dadb266c" alt="screen-6" width="320"/> | <img src="https://github.com/user-attachments/assets/4c4690f0-7983-405d-8602-f0a78e8fbcae" alt="screen-7" width="320"/> |
| <img src="https://github.com/user-attachments/assets/77ec6919-aa9f-45a8-a47c-392056c316f1" alt="screen-8" width="320"/> | <img src="https://github.com/user-attachments/assets/b242a381-2371-421e-acf7-68f0e12ceae3" alt="screen-9" width="320"/> | <img src="https://github.com/user-attachments/assets/3f4971a8-6f89-49ed-8d37-6baa7bda9e87" alt="screen-10" width="320"/> |
| <img src="https://github.com/user-attachments/assets/78694e2c-26a0-4a34-a49b-7c9e8f4cc955" alt="screen-11" width="320"/> | <img src="https://github.com/user-attachments/assets/8ec258bf-e7d4-4111-8001-90e46e0e68fb" alt="screen-12" width="320"/> | <img src="https://github.com/user-attachments/assets/8567c974-5c20-4198-a0fa-1dab303b2b55" alt="screen-13" width="320"/> |
| <img src="https://github.com/user-attachments/assets/8576feb7-ab77-45e6-b48e-4624ef970ad8" alt="screen-14" width="320"/> |  |  |

# 1. Features

## 1.1 Accounts & sign-in

- [x] Private key sign-in: `nsec` or raw hex (NIP-19)
- [x] Browser extension signing (NIP-07)
- [x] Remote signer / bunker support (NIP-46)
- [x] Google sign-in, with FROST threshold key recovery — the key is split into shards across signer relays, so no server ever holds the whole key
- [x] On-the-go account creation
- [x] Multi-account switching, with keys encrypted at rest in local storage

## 1.2 Content

| Type | Route | Kinds |
|---|---|---|
| Notes | `/note/[nevent]` | 1 |
| Long-form articles | `/article/[naddr]`, `/write-article` | 30023, 30024 (drafts) |
| Videos | `/video/[naddr]` | 21, 22, 34235, 34236 |
| Images | `/image/[nevent]` | 20 |
| Curations | `/curation/[naddr]` | 30004, 30005 |
| Smart widgets | `/smart-widgets`, `/smart-widget-builder` | 30033 |
| Flash news | — | 11 |
| Starter & media packs | `/pack/s`, `/pack/m` | — |

- [x] Feeds: home, `/discover`, `/explore`, `/media`, plus DVM-backed content feeds
- [x] Paid notes — surfaced in the home feed for free and basic plan users
- [x] Direct messages (NIP-04 and NIP-44), notifications, and event/note statistics
- [x] Event scheduling via DVM (NIP-90), gift-wrapped (NIP-59)

## 1.3 Article editor (v2)

- [x] TipTap-based WYSIWYG that serializes to markdown
- [x] Mentions and Nostr entity embeds (`nevent`, `naddr`, `npub`, `note`, `nprofile`)
- [x] Tables, math (KaTeX), syntax-highlighted code blocks, text alignment, images
- [x] PDF-to-Markdown import
- [x] AI writing assistant and a Second Reader with selectable personas (paid plans)
- [x] Drafts, autosave, publish modal and article preview

## 1.4 Wallets & payments

- [x] Built-in Yaki wallet, auto-provisioned over NWC
- [x] Nostr Wallet Connect (NIP-47) and Alby
- [x] WebLN
- [x] Cashu / eCash wallet with nutzaps (NIP-60, NIP-61)
- [x] Lightning zaps via QR or connected wallet (NIP-57)
- [x] YakiHonne premium plans — free / basic / premium, plus a trial. Payable by card (hosted checkout, handled server-side) or Lightning
- [x] Creator subscriptions, so fans can subscribe directly to a creator
- [x] Yaki Points: earn, spend, and redeem for rewards

## 1.5 Media & relays

- [x] Blossom media servers for uploads, with a management UI at `/blossom`
- [x] Relay management and Relay Orbits at `/relay-orbits`
- [x] Relay list metadata and outbox model (NIP-65)
- [x] Relay authentication (NIP-42)
- [x] Premium relays for paid plans

## 1.6 Smart widgets

- [x] Builder, checker, and playground (`/smart-widget-builder`, `/smart-widget-checker`, `/sw-playground`)
- [x] AI-assisted widget generation (`/sw-ai`)
- [x] Developer docs under `/docs/sw`

## 1.7 Interface

- [x] 12 interface languages: Arabic, Chinese, English, French, Hindi, Hungarian, Italian, Japanese, Portuguese, Russian, Spanish, Thai
- [x] Separate content language preference for post translation, with pluggable translation services
- [x] Light and dark themes
- [x] Mobile-oriented layout with bottom sheets
- [x] Guided navbar tour and in-app changelog
- [x] Installable as a PWA

## 1.8 Supported NIPs

NIP-01, NIP-02, NIP-04, NIP-05, NIP-07, NIP-09, NIP-17, NIP-18, NIP-19, NIP-21, NIP-23, NIP-25, NIP-30, NIP-42, NIP-44, NIP-46, NIP-47, NIP-51, NIP-57, NIP-58, NIP-59, NIP-60, NIP-61, NIP-65, NIP-68, NIP-71, NIP-78, NIP-89, NIP-90, NIP-94, NIP-98.

Media uploads additionally implement the [Blossom](https://github.com/hzrd149/blossom) (BUD) spec, which is not a NIP.

## 1.9 Relay

[nostr-01.yakihonne.com](https://nostr-01.yakihonne.com) and [nostr-02.yakihonne.com](https://nostr-02.yakihonne.com) are fully based on the [strfry](https://github.com/hoytech/strfry) implementation.

# 2. Tech stack

- [Next.js](https://nextjs.org) 15 (pages router) with React 19
- [NDK](https://github.com/nostr-dev-kit/ndk) for Nostr, with a Dexie/IndexedDB cache adapter
- Redux Toolkit for state
- i18next + react-i18next, locales fetched at runtime from `public/locales/{lng}/common.json`
- TipTap 3 for the article editor
- Plain CSS in `src/styles/`, themed with `next-themes`
- `next-pwa` for the service worker
- A custom ISR cache handler (`cache-handler.cjs`) that hashes over-long cache keys

# 3. Getting started

Requires [pnpm](https://pnpm.io).

```bash
pnpm install
cp .env.example .env.local   # then fill in the values
pnpm dev
```

The dev server runs on [http://localhost:3400](http://localhost:3400).

```bash
pnpm build   # production build
pnpm start   # serve the production build
pnpm lint
```

Pages live in `src/pages`, shared components in `src/Components`, page-level components in `src/(PagesComponents)`, and Nostr/helper logic in `src/Helpers`.
