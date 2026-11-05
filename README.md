# Ofrenda

**Ghost in the Machine** — a digital ofrenda (remembrance altar) powered by open-weight **Qwen 3.8-27B** on [Cerebras](https://cloud.cerebras.ai).

You bring a name and a memory. Qwen crafts a remembrance, symbolic offerings, and one quiet whisper. Candles you keep stay in your browser (`localStorage`) — private by default.

Built for the Hacktoberfest / DevChangeMakers makeathon track (Figma Make → Cursor → open-weight inference).

## Why open innovation

Closed chat apps lock family stories and grief inside a vendor’s cloud. Ofrenda runs on an **open-weight** model you can swap, and keeps the altar wall **on-device**. The model is the craftsperson; your memory stays yours.

## Quick start

Needs **Node.js 20.6+**. Cerebras API key is entered **in the UI** (paste or upload a `.txt` / `.env` file). Optional `.env` fallback also works.

```powershell
cd ofrenda
npm install
Copy-Item .env.example .env
npm run dev
```

Open http://localhost:3001 → paste/upload your key from [cloud.cerebras.ai](https://cloud.cerebras.ai) → dedicate an ofrenda.

## Deploy on Vercel

1. Open [vercel.com/new](https://vercel.com/new)
2. Import **Sabbir-Shihab/Octborfest** (Continue with GitHub)
3. Deploy — no env vars required (API key is entered in the UI)
4. Open the `*.vercel.app` URL

Repo already includes `api/index.js` + `vercel.json` rewrites.

## Stack

| Piece | Role |
|---|---|
| Figma Make–style UI | Night sky, marigold, candlelight (hand-built from the brief) |
| Cursor | Code generation & iteration |
| Qwen 3.8-27B on Cerebras | Remembrance, offerings, whisper (~fast inference) |

## Challenge posting

When you share on X / DEV:

- Tag `@mitul_shahriyar` & `@devchangemakers`
- Hashtags: `#figma` `#hacktoberfest` `#makeathon`
- Mention open-weight Qwen + why the altar stays local

## Project layout

```
ofrenda/
├─ server.js
├─ src/cerebras.js
├─ src/ofrenda.js
├─ public/          # UI
└─ scripts/check-keys.js
```
