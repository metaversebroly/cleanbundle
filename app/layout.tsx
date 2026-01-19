import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'CleanBundle - Solana Bundle Health Checker',
  description: 'Automated bundle health checker for Solana token launches. Stop getting flagged. Launch with confidence.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body>{children}</body>
    </html>
  )
}
