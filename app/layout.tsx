import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { GeistMono } from 'geist/font/mono'
import './globals.css'
import { SITE_URL } from '@/lib/site'
import SitedioPinLoader from '@/components/SitedioPinLoader'
import SiteHeader from '@/components/site/SiteHeader'
import SiteFooter from '@/components/site/SiteFooter'

const geistMono = GeistMono
const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'Client Site Template',
    template: '%s | Client Site Template',
  },
  description: 'Brand-neutral foundation for tenant-scoped website projects.',
  alternates: {
    canonical: '/',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${geistMono.variable} ${inter.variable}`}>
      <body className="font-mono">
        <SitedioPinLoader />
        <div className="site-shell-bg min-h-[100svh] overflow-x-clip text-stone-100 md:min-h-[100dvh]">
          <div className="mx-auto flex w-full max-w-6xl flex-col px-6 pb-20 pt-8">
            <SiteHeader />
            <main>{children}</main>
            <SiteFooter />
          </div>
        </div>
      </body>
    </html>
  )
}
