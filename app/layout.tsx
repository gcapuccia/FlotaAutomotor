import type { Metadata } from 'next'
import { Rajdhani, IBM_Plex_Sans } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'

const rajdhani = Rajdhani({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-display',
})

const ibmPlex = IBM_Plex_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  variable: '--font-body',
})

export const metadata: Metadata = {
  title: 'FlotaGo — Gestión de Flota',
  description: 'Sistema de seguimiento y gestión de flota vehicular',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es" suppressHydrationWarning className={`${rajdhani.variable} ${ibmPlex.variable}`}>
      <body className="font-body antialiased bg-slate-50 text-slate-950 dark:bg-slate-950 dark:text-slate-100">
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
