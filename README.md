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
