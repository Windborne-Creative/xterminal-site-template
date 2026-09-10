# Agent Guide: Client Site Template Foundation

This guide is for developers and coding agents who scaffold a new client website from this template.

## Core Objective

Build custom frontend UI and UX while preserving the site to xTerminal runtime and lead-capture contract.

## Scaffold a new client site

1. Start from the latest `main` of this repository (`Windborne-Creative/xterminal-site-template`). Do not scaffold from an older snapshot or a previous client repo.
2. Apply the client extraction package on top (brand, IA, copy, imagery). Match the extraction. Do not reinterpret, invent, or "improve" positioning.
3. Copy `.env.example` to `.env.local` and set the workspace slug plus the canonical xTerminal origin `https://app.xterminal.dev`.
4. Replace placeholder content and brand identity. Do not put product-agent or bot names in site copy, alt text, or form placeholders.
5. Keep Requests, Delivery, and worker UI out of this site. Those live in the xTerminal app, not the marketing site.

## Site to xTerminal contract

Live backend handler: `Windborne-Creative/xterminal` `app/api/contact/route.ts`.
Lead fields: `parseContactLeadFields` in `lib/contact-attribution.ts`.
Client env origin: `docs/CLIENT_SITE_SETUP.md` and `lib/client-env-copy-origin.ts` (`https://app.xterminal.dev`).

Preserve these contracts:

1. Browser contact submits stay same-origin (`POST /api/contact`).
2. The server proxy forwards to `XT_BACKEND_CONTACT_ENDPOINT` (example: `https://app.xterminal.dev/api/contact`).
3. The proxy sends tenant scope as header `x-xt-tenant-slug` from `XT_TENANT_SLUG` or `NEXT_PUBLIC_XT_TENANT_SLUG`.
4. `middleware.ts` writes first-party `xt_*` cookies. The contact proxy injects those values into the JSON body when the form omitted them. A non-empty body field wins over the cookie.
5. Click IDs (`gclid`, `gbraid`, `wbraid`, `fbclid`) are write-once per key. Do not map `gbraid` or `wbraid` into `gclid`.
6. UTMs overwrite when a new value arrives. `landing_page`, `referrer`, and `first_touch_at` are write-once on first visit. `last_touch_at` updates on first visit and on later tracked query params.
7. Keep runtime adapter endpoint shape in `lib/runtime-api.ts`.
8. Keep env variable names unchanged unless you migrate all docs and deployment configs.
9. `/go` is a noindex campaign landing stub and must stay out of `app/sitemap.ts`.

## Contact QA (verify by row)

An HTTP 200 from `/api/contact` is not enough. Open the tenant Inbox in xTerminal, or read the `contact_submissions` row in Postgres, and confirm the lead exists for the correct tenant with the expected message and attribution fields.

## Allowed Customization

- Full component and page redesign
- Typography, color, and token changes
- Route architecture expansion
- Content model changes on the frontend
- Campaign landings under `/go` (keep noindex, keep out of the sitemap)

## Disallowed by Default

- Hardcoding workspace secrets in source
- Removing tenant slug wiring from contact or runtime requests
- Converting proxy contact submits to direct browser cross-origin calls
- Stripping attribution middleware or proxy injection
- Writing `gbraid` or `wbraid` into the `gclid` field
- Adding Requests, Delivery, or worker admin UI to this site

## New Client Bootstrap

1. Clone the latest `main` of this template into a new repo.
2. Set `.env.local` from `.env.example`.
3. Configure tenant slug and optional public key for the target workspace.
4. Apply the extraction package. Match, do not reinterpret.
5. Run QA:
   - `npm run dev`
   - submit contact, then confirm the `contact_submissions` row in the tenant Inbox or Postgres
   - runtime API reads resolve for the target tenant
