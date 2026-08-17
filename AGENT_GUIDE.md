# Agent Guide: Client Site Template Foundation

This guide is for developer agents and developers who clone this template for new client website builds.

## Core Objective

Build custom frontend UI/UX while preserving the runtime and tenant-scoped wiring contract.

## Preserve These Contracts

1. Keep contact form browser submits same-origin (`/api/contact`).
2. Keep server-side proxy forwarding to `XT_BACKEND_CONTACT_ENDPOINT`.
3. Keep tenant scoping header on proxy requests (`x-xt-tenant-slug`).
4. Keep click-identifier cookies (`xt_gclid` / `xt_gbraid` / `xt_wbraid`) set by `middleware.ts` and injected by the contact proxy. Do not map `gbraid` or `wbraid` into `gclid`.
5. Keep runtime adapter endpoint shape in `lib/runtime-api.ts`.
6. Keep env variable names unchanged unless you migrate all docs and deployment configs.

## Allowed Customization

- Full component and page redesign
- Typography/color/token changes
- Route architecture expansion
- Content model changes on frontend

## Disallowed by Default

- Hardcoding workspace secrets in source
- Removing tenant slug wiring from contact/runtime requests
- Converting proxy contact submits to direct browser cross-origin calls
- Stripping click-identifier middleware or proxy injection, or writing `gbraid`/`wbraid` into the `gclid` field

## New Client Bootstrap

1. Clone this template into a new repo.
2. Set `.env.local` from `.env.example`.
3. Configure tenant slug + public key for the target workspace.
4. Replace placeholder content and brand identity.
5. Run QA:
   - `npm run dev`
   - contact submission appears in target workspace
   - runtime API reads resolve for target tenant
