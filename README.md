# Solat Today

Prayer times for Muslims in Malaysia at [solat.today](https://solat.today). The app finds your JAKIM zone from your device location and shows the day's prayer times with a countdown to the next one, the Hijri and Gregorian dates, a qibla compass and the nearest mosques.

## Features

- Prayer times for your JAKIM zone, found from your device location
- Countdown to the next prayer
- Hijri and Gregorian dates, with navigation across the month
- Qibla compass with a map
- Nearest mosques from the JAKIM e-Solat directory
- Copy or share the day's times to WhatsApp
- Last zone saved on the device, so the times still show offline

## How it works

- Zone lookup runs on the server against a GeoJSON of the 170 JAKIM zones (`lib/solat/zonJakim.json`) with `polygon-lookup`.
- Monthly prayer times for the zone come from `api.waktusolat.app` (JAKIM e-Solat data).
- Nearest mosques come from JAKIM e-Solat directly, which receives the coordinates.
- Qibla bearing per zone is a static table (`lib/solat/bearing.json`).
- Mosque text can be translated from Malay to English through OpenAI (`OPENAI_API_KEY`).

## Stack

Next.js 16 (app router) with React 19, TypeScript, Tailwind CSS 4 and shadcn/ui, on Node 24. Package manager is pnpm.

## Develop

```bash
pnpm install
pnpm dev
```

Open http://localhost:3000. Geolocation needs HTTPS or localhost.

## Deploy

Railway builds `main` from this repository (service `solat-today-2025`, project `solat-today`). The domain `solat.today` is on Cloudflare and points at the Railway service.

| Variable | Purpose |
| --- | --- |
| `OPENAI_API_KEY` | Malay to English translation of mosque details |
