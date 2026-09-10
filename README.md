# Client Site Template Foundation

Brand-neutral starter frontend for client website projects that connect to an xTerminal workspace.

## Purpose

Use the latest `main` of this repository as the scaffold for every new client site:

- Start from this clean, debranded structure
- Apply the client extraction package on top (match the brief, do not reinterpret)
- Keep runtime and lead-capture wiring consistent across projects
- Connect to the xTerminal workspace backend when env is set

Do not put product-agent or bot names in site copy or placeholders. Requests, Delivery, and worker UI stay in the xTerminal app, not in this template.

## Site to xTerminal contract

Client sites talk to xTerminal through two paths:

1. **Contact (writes):** the browser POSTs same-origin to `/api/contact`. The server proxy forwards to `XT_BACKEND_CONTACT_ENDPOINT` (`https://app.xterminal.dev/api/contact`) with header `x-xt-tenant-slug`. The live handler is `Windborne-Creative/xterminal` `app/api/contact/route.ts`. It inserts `contact_submissions` via `parseContactLeadFields` in `lib/contact-attribution.ts`.
2. **Runtime (reads):** `lib/runtime-api.ts` calls `NEXT_PUBLIC_XT_API_BASE_URL` `/api/public/v1/tenants/{slug}/...` with an optional public API key.

Canonical API origin for env examples is `https://app.xterminal.dev` (see xTerminal `docs/CLIENT_SITE_SETUP.md` and `lib/client-env-copy-origin.ts`).

### Attribution

`middleware.ts` stores first-party `xt_*` cookies (90 days, `httpOnly`, `SameSite=lax`). The contact proxy injects cookie values into the JSON body when the form omitted them. Body wins when both are present.

| Field | Cookie behavior |
| --- | --- |
| `gclid`, `gbraid`, `wbraid`, `fbclid` | Write-once per key. Never fold `gbraid` or `wbraid` into `gclid`. |
| `utm_source`, `utm_medium`, `utm_campaign`, `utm_term`, `utm_content` | Last value wins when a new query param arrives. |
| `landing_page`, `referrer`, `first_touch_at` | Write-once on the first document request. |
| `last_touch_at` | Set on first visit; updated when a tracked query param arrives. |

`phone`, `source`, and any other JSON keys pass through. Extra keys land in `custom_fields` on the backend.

### Contact QA

Do not treat HTTP 200 as proof the lead landed. Confirm the `contact_submissions` row in the tenant Inbox or Postgres (name, email, tenant, attribution fields).

## What This Template Includes

- Next.js + TypeScript + Tailwind foundation
- Generic marketing shell (header, footer, page sections)
- Runtime API adapter (`lib/runtime-api.ts`)
- Same-origin contact proxy (`app/api/contact/route.ts`)
- Attribution cookies + proxy injection (`lib/click-ids.ts`, `middleware.ts`)
- `/go` noindex campaign landing stub (omitted from the sitemap)
- `app/sitemap.ts` and `app/robots.ts`
- Neutral env contract for tenant-scoped runtime wiring

## What This Template Does NOT Include

- xTerminal-specific branding, copy, domains, or assets
- Client-specific design system tokens
- Backend secrets
- Requests, Delivery, or worker admin UI

## Local Development

1. Install dependencies:

```bash
npm install
```

2. Create local env file:

```bash
cp .env.example .env.local
```

3. Start dev server:

```bash
npm run dev
```

## Environment Variables

Set these on the **client site** host (Vercel project for this repo), not on the xTerminal app.

| Variable | Example | Purpose |
| --- | --- | --- |
| `NEXT_PUBLIC_SITE_URL` | `https://example-client-site.com` | Canonical origin for this frontend (sitemap, robots, metadata). |
| `NEXT_PUBLIC_APP_BASE_URL` | `https://app.xterminal.dev` | xTerminal app origin for admin login and signup links. |
| `XT_BACKEND_CONTACT_ENDPOINT` | `https://app.xterminal.dev/api/contact` | Server-only proxy target. Browsers never call this URL directly. |
| `NEXT_PUBLIC_MARKETING_ASSET_BASE_URL` | `https://app.xterminal.dev` | Optional remote media origin. |
| `NEXT_PUBLIC_XT_API_BASE_URL` | `https://app.xterminal.dev` | xTerminal public API origin for runtime reads. |
| `NEXT_PUBLIC_XT_TENANT_SLUG` | `your-tenant-slug` | Workspace slug. Sent as `x-xt-tenant-slug` on contact POSTs. |
| `NEXT_PUBLIC_XT_PUBLIC_API_KEY` | (empty until minted) | Optional tenant public runtime key for blog and entity reads. |

`XT_TENANT_SLUG` is an optional server-only override for the contact proxy. The xTerminal developer wizard copies `NEXT_PUBLIC_XT_TENANT_SLUG`.

## Standard Build Flow Per Client

1. Duplicate the latest `main` of this project into a new repo.
2. Apply the client extraction package. Match names, services, and IA. Do not reinterpret.
3. Replace site identity (name, logo, copy, color system, typography). Keep agent brand names out of copy.
4. Build custom pages and components while preserving runtime adapter and contact contracts.
5. Configure workspace domain, tenant slug, and public key in xTerminal.
6. Set project env vars and deploy.
7. Run launch QA:
   - runtime page reads
   - contact submission exists as a `contact_submissions` row in the correct workspace Inbox
   - `/go` stays noindex and absent from `/sitemap.xml`
   - admin preview points to the custom domain

## Workspace Entities (Custom Content Types)

The runtime API adapter includes `getEntities(type)` for fetching workspace entity data (team members, testimonials, services, etc.) managed through the xTerminal admin dashboard.

### Usage

```typescript
import { getEntities } from '@/lib/runtime-api'
import type { EntityItem } from '@/lib/runtime-api'

const members = await getEntities('team_member')
// members[].data contains: name, title, bio, photo_url, email, etc.
```

### Available Entity Types

| Type | Key | Fields |
|------|-----|--------|
| Team Members | `team_member` | name, title, bio, photo_url, email, phone, linkedin_url, show_email, show_phone, show_linkedin |
| Menu Items | `menu_item` | category, name, description, gluten_free, vegetarian, vegan, spicy, on_lunch, on_dinner, market_price, price_lunch, price_dinner, options_lunch, options_dinner |
| Menu Sections | `menu_section` | slug, label, note_lunch, note_dinner |

> **Menu (restaurant) is an Advanced-tier feature.** `menu_item` and `menu_section`
> are activated together via **+ Add content type → Menu Control** in the admin.
> The data contract, fixed section slugs, and rendering rules are defined in
> `docs/MENU_ENTITY_CONTRACT.md` in the xTerminal platform repo. Match the field
> keys and category/slug semantics exactly. Only presentation (fonts, colors,
> spacing) should vary per restaurant.

### Sample Pages

- `/team`: team members page (see `app/team/page.tsx`)
- `/menu`: restaurant menu with Lunch/Dinner tabs (see `app/menu/page.tsx` + `components/site/MenuView.tsx`)
- `/go`: noindex campaign landing stub (see `app/(campaigns)/go/page.tsx`)

Entity data is sorted by `sort_order` and only active entities are returned by the public API. Toggle fields (e.g. `show_email`) control which contact details are exposed. Respect them in your templates.

## Agent-Friendly Rules

- Scaffold from latest `main` of this repo, then apply the extraction package.
- Keep structure developer-owned (pages, routes, components) and content client-editable.
- Do not hardcode workspace-specific secrets.
- Preserve tenant-scoped runtime headers and slug wiring.
- Keep contact form browser requests same-origin and forward server-side.
- Verify contact by reading the Inbox row, not by trusting HTTP 200.
- Treat this repo as baseline infrastructure. Client repos own branding and UX.
