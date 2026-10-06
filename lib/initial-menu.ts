import type { EntityItem } from '@/lib/runtime-api'

/**
 * As-built menu (single source of truth for a restaurant launch).
 *
 * Fill INITIAL_MENU_SECTIONS / INITIAL_MENU_ITEMS with this site's menu when you
 * build it. The same data serves two purposes:
 *   1. Pre-connection fallback — the /menu page renders these before the site is
 *      wired to Sitedio (or before the client has entered any items), so the
 *      design is testable immediately.
 *   2. Seed source — copy these into the platform seed migration
 *      (supabase/migrations/0XX_seed_<tenant>_menu.sql) to populate Sitedio.
 *
 * Once Sitedio returns menu records, live admin data takes over automatically
 * (see app/menu/page.tsx). Keep the field keys + category slugs exactly as below —
 * they are the fixed menu data contract. Only presentation may vary per site.
 *
 * Fixed section slugs: soups | starters | salads | sandwiches | plates_bowls
 */

export interface MenuItemData {
  category?: string
  name?: string
  description?: string
  gluten_free?: boolean
  vegetarian?: boolean
  vegan?: boolean
  spicy?: boolean
  on_lunch?: boolean
  on_dinner?: boolean
  market_price?: boolean
  price_lunch?: string
  price_dinner?: string
  options_lunch?: string
  options_dinner?: string
}

export interface MenuSectionData {
  slug?: string
  label?: string
  note_lunch?: string
  note_dinner?: string
}

interface SeedRecord<T> {
  sort_order: number
  data: T
}

// Empty by default. Populate per site at launch.
export const INITIAL_MENU_SECTIONS: SeedRecord<MenuSectionData>[] = []
export const INITIAL_MENU_ITEMS: SeedRecord<MenuItemData>[] = []

function toEntityItems<T>(records: SeedRecord<T>[], entityType: string): EntityItem[] {
  return records.map((rec, i) => ({
    id: `seed-${entityType}-${i}`,
    entity_type: entityType,
    data: rec.data as unknown as Record<string, unknown>,
    sort_order: rec.sort_order,
    created_at: '',
    updated_at: '',
  }))
}

/** Fallback sections as EntityItem[], for the menu page when the API is empty. */
export function getInitialMenuSections(): EntityItem[] {
  return toEntityItems(INITIAL_MENU_SECTIONS, 'menu_section')
}

/** Fallback items as EntityItem[], for the menu page when the API is empty. */
export function getInitialMenuItems(): EntityItem[] {
  return toEntityItems(INITIAL_MENU_ITEMS, 'menu_item')
}
