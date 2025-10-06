

# What is YakiHonne?

YakiHonne is the 1st Fully Decentralized Social Network on Bitcoin. Connecting 160+ countries globally, YakiHonne attracts 50K+ active Bitcoiners. Check it out at [yakihonne.com](https://yakihonne.com)

Currently, YakiHonne is partnering with BITMAIN, Bitcoin Magazine, and 30+ programs in BTC ecosystems, and even non-BTC programs. YakiHonne received grants/ supports from Gitcoin, Nostr, DoraHacks etc..

YakiHonne also runs its own relays under [nostr-01.yakihonne.com](https://nostr-01.yakihonne.com) and [nostr-02.yakihonne.com](https://nostr-02.yakihonne.com) for creators to publish their content, it is free of charge (atm). The relay is based on [strfry](https://github.com/hoytech/strfry) and written in cpp if you would like to check it out.


### Gallery

| <img src="https://github.com/user-attachments/assets/2ae78bf2-ba6a-42b1-8cf0-1717b8d6f701" alt="screen-2" width="320"/> | <img src="https://github.com/user-attachments/assets/1510bbc8-c3c0-41e5-8647-a10721b1f3fb" alt="screen-3" width="320"/> | <img src="https://github.com/user-attachments/assets/ed6c1700-f65f-42bc-9c24-f4495a4a2b5c" alt="screen-4" width="320"/> |
|---|---|---|
| <img src="https://github.com/user-attachments/assets/a703e035-b5c5-4cb3-95a9-fab94341458a" alt="screen-5" width="320"/> | <img src="https://github.com/user-attachments/assets/1d3964f3-6ebf-4194-9a6e-fac3bb9c8258" alt="screen-6" width="320"/> | <img src="https://github.com/user-attachments/assets/8ad82280-732e-4930-96cb-6051e4e8607f" alt="screen-7" width="320"/> |
| <img src="https://github.com/user-attachments/assets/ea3013e1-9cbc-4f70-b928-496c1ebc3d44" alt="screen-8" width="320"/> | <img src="https://github.com/user-attachments/assets/2d8ec2e0-bdbc-4c9c-900c-075f1803de26" alt="screen-9" width="320"/> | <img src="https://github.com/user-attachments/assets/3af57a0c-87fc-4ad0-9e8f-df7f3d818ba4" alt="screen-10" width="320"/> |
| <img src="https://github.com/user-attachments/assets/58b9df81-90dd-4efc-8261-59b6dba1f130" alt="screen-11" width="320"/> | <img src="https://github.com/user-attachments/assets/4a14fb98-a94b-485e-a8d2-b8ff25d2143f" alt="screen-12" width="320"/> | <img src="https://github.com/user-attachments/assets/b8c639d5-950f-49dc-928d-13fe70f238b8" alt="screen-13" width="320"/> |
| <img src="https://github.com/user-attachments/assets/d2c4545e-53fd-489a-9641-c01c305de78b" alt="screen-14" width="320"/> |  |  |

# 1. Features

## 1.1 Cient

- [x] Login options support: keys, wallet, on-the-go account creation (NIP-01, NIP-07)
- [x] Bech32 encoding support (NIP-19)
- [x] Global Feed based on user all relays
- [x] Custom Feed based on user following
- [x] Top creators list based on all relays/selected relay
- [x] Top curators list based on nostr-01.yaihonne.com relay
- [x] Latest discussed topics based on hashtags
- [x] Home carousel containing latest published curations
- [x] Curations: topic-related curated articles (NIP-51)
- [x] My curations, My articles sections as a space for creators to manage and organize their content
- [x] Rich markdown editor to write and preview long-form content (NIP-23)
- [x] The ability to draft/edit/delete articles (NIP-09, NIP-23)
- [x] Topic-related search using hashtags (NIP-12)
- [x] Users search using pubkeys
- [x] Built-in upload for user profile images and banners within nostr-01.yakikhonne.com
- [x] User profile page: following/followers/zapping/published articles
- [x] URI scheme support (currenly only naddr) (NIP-21)
- [x] Users follow/unfollow (NIP-02)
- [x] Lightning zaps: via QR codes or dedicted wallet (NIP-57)
- [x] Customizable user settings: Keypair, Lightning Addres, relay list
- [x] Relay list metadata support (NIP-65)
- [x] And many others feel free to visit or download YakiHonne to explore 

## 1.2 Relay

[nostr-01.yakihonne.com](https://nostr-01.yakihonne.com) and [nostr-02.yakihonne.com](https://nostr-02.yakihonne.com) relay is fully based on [strfry](https://github.com/hoytech/strfry) implementation and writted in Typescript.

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/pages/api-reference/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `pages/index.js`. The page auto-updates as you edit the file.

[API routes](https://nextjs.org/docs/pages/building-your-application/routing/api-routes) can be accessed on [http://localhost:3000/api/hello](http://localhost:3000/api/hello). This endpoint can be edited in `pages/api/hello.js`.

The `pages/api` directory is mapped to `/api/*`. Files in this directory are treated as [API routes](https://nextjs.org/docs/pages/building-your-application/routing/api-routes) instead of React pages.

This project uses [`next/font`](https://nextjs.org/docs/pages/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.
