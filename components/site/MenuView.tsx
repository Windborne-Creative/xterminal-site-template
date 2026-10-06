'use client'

import { useState } from 'react'
import type { EntityItem } from '@/lib/runtime-api'

/**
 * Restaurant menu renderer. Conforms to docs/MENU_ENTITY_CONTRACT.md in the
 * Sitedio platform repo (Windborne-Creative/xterminal): two feeds (`menu_section`, `menu_item`), Lunch/Dinner
 * service tabs, fixed structure, themeable presentation. Restyle freely via the
 * stone tokens below — do NOT change the field keys or category/slug semantics.
 */

type Service = 'lunch' | 'dinner'

interface MenuItemData {
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

interface MenuSectionData {
  slug?: string
  label?: string
  note_lunch?: string
  note_dinner?: string
}

// Fallback order if no `menu_section` records exist (matches the contract's fixed slugs).
const DEFAULT_SECTION_ORDER = ['soups', 'starters', 'salads', 'sandwiches', 'plates_bowls']

function humanizeSlug(slug: string): string {
  return slug
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

function DietaryBadges({ d }: { d: MenuItemData }) {
  const badges: string[] = []
  if (d.gluten_free) badges.push('GF')
  if (d.vegetarian) badges.push('V')
  if (d.vegan) badges.push('VG')
  if (d.spicy) badges.push('Spicy')
  if (badges.length === 0) return null
  return (
    <div className="mt-1.5 flex flex-wrap gap-1.5">
      {badges.map((b) => (
        <span
          key={b}
          className="border border-stone-700 px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wider text-stone-400"
        >
          {b}
        </span>
      ))}
    </div>
  )
}

function MenuItemRow({ item, service }: { item: EntityItem; service: Service }) {
  const d = item.data as MenuItemData
  const price = d.market_price ? 'MP' : service === 'lunch' ? d.price_lunch : d.price_dinner
  const options = service === 'lunch' ? d.options_lunch : d.options_dinner

  return (
    <div className="border-b border-stone-800/70 pb-4">
      <div className="flex items-baseline justify-between gap-3">
        <h3 className="font-sans text-base font-semibold text-white">{d.name || 'Item'}</h3>
        {price ? (
          <span className="shrink-0 font-mono text-sm text-stone-300">{price}</span>
        ) : null}
      </div>
      {d.description ? (
        <p className="mt-1 text-sm leading-relaxed text-stone-400">{d.description}</p>
      ) : null}
      {options ? (
        <p className="mt-1.5 text-[13px] font-semibold text-stone-300">{options}</p>
      ) : null}
      <DietaryBadges d={d} />
    </div>
  )
}

export default function MenuView({
  sections,
  items,
}: {
  sections: EntityItem[]
  items: EntityItem[]
}) {
  const [service, setService] = useState<Service>('lunch')

  // Build the slug → section map and the render order.
  const sectionMap = new Map<string, MenuSectionData>()
  for (const s of sections) {
    const data = s.data as MenuSectionData
    if (data.slug) sectionMap.set(data.slug, data)
  }

  const orderedSlugs =
    sections.length > 0
      ? sections
          .map((s) => (s.data as MenuSectionData).slug)
          .filter((slug): slug is string => Boolean(slug))
      : [...DEFAULT_SECTION_ORDER]

  // Include any item categories that lack a matching section record (appended last).
  const seen = new Set(orderedSlugs)
  for (const item of items) {
    const cat = (item.data as MenuItemData).category
    if (cat && !seen.has(cat)) {
      orderedSlugs.push(cat)
      seen.add(cat)
    }
  }

  const isOnService = (item: EntityItem) => {
    const d = item.data as MenuItemData
    return service === 'lunch' ? Boolean(d.on_lunch) : Boolean(d.on_dinner)
  }

  const visibleSections = orderedSlugs
    .map((slug) => {
      const sectionItems = items.filter(
        (item) => (item.data as MenuItemData).category === slug && isOnService(item)
      )
      const meta = sectionMap.get(slug)
      const note = service === 'lunch' ? meta?.note_lunch : meta?.note_dinner
      return {
        slug,
        label: meta?.label || humanizeSlug(slug),
        note,
        items: sectionItems,
      }
    })
    .filter((section) => section.items.length > 0)

  return (
    <section className="mb-20 sm:mb-24 md:mb-32 lg:mb-36">
      <div className="border border-stone-800 bg-stone-950/80 p-6 mb-8">
        <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-stone-400">Menu</p>
        <h1 className="mt-2 font-sans text-3xl font-semibold tracking-tight text-white">Our Menu</h1>

        {/* Service switch */}
        <div className="mt-5 inline-flex border border-stone-800">
          {(['lunch', 'dinner'] as Service[]).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setService(s)}
              className={`px-5 py-2 font-mono text-[12px] uppercase tracking-[0.18em] transition-colors ${
                service === s
                  ? 'bg-white text-black'
                  : 'bg-transparent text-stone-400 hover:text-white'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {visibleSections.length === 0 ? (
        <div className="border border-stone-800 bg-stone-950/80 p-12 text-center">
          <p className="text-sm text-stone-500">No items on the {service} menu yet.</p>
        </div>
      ) : (
        <div className="space-y-12">
          {visibleSections.map((section) => (
            <div key={section.slug}>
              <div className="mb-5">
                <h2 className="font-sans text-xl font-semibold tracking-tight text-white">
                  {section.label}
                </h2>
                <div className="mt-2 h-px w-12 bg-stone-600" />
                {section.note ? (
                  <p className="mt-2 text-[13px] italic text-stone-400">{section.note}</p>
                ) : null}
              </div>
              <div className="grid grid-cols-1 gap-x-10 gap-y-5 md:grid-cols-2">
                {section.items.map((item) => (
                  <MenuItemRow key={item.id} item={item} service={service} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
