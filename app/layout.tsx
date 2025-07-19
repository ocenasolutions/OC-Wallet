import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'OC-Wallet',
  description: 'OC-Wallet',
  generator: 'OC-Wallet',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
