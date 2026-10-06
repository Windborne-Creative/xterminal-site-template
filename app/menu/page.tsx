import { getEntities } from '@/lib/runtime-api'
import { getInitialMenuItems, getInitialMenuSections } from '@/lib/initial-menu'
import MenuView from '@/components/site/MenuView'

export const dynamic = 'force-dynamic'

export default async function MenuPage() {
  // Two feeds per docs/MENU_ENTITY_CONTRACT.md. Both return active records sorted
  // by sort_order; the renderer groups items by `category` into `menu_section`s.
  const [sections, items] = await Promise.all([
    getEntities('menu_section'),
    getEntities('menu_item'),
  ])

  // Before the site is connected/populated in Sitedio, fall back to the
  // as-built menu in lib/initial-menu.ts so the page renders its real design.
  // Live admin data takes over the moment Sitedio returns any records.
  const finalSections = sections.length > 0 ? sections : getInitialMenuSections()
  const finalItems = items.length > 0 ? items : getInitialMenuItems()

  return <MenuView sections={finalSections} items={finalItems} />
}
