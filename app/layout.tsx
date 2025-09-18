import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import { Suspense } from "react"
import "./globals.css"

export const metadata: Metadata = {
  title: "あること□ないこと",
  description: "COMING SOON | 11月13日（木）〜17日（月）｜11:00 - 19:00｜東京大学 □ 本郷キャンパス",
  generator: "v0.app",
  icons: {
    icon: "/favicon.svg",
  },
  openGraph: {
    title: "あること□ないこと",
    description: "COMING SOON | 11月13日（木）〜17日（月）｜11:00 - 19:00｜東京大学 □ 本郷キャンパス",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "あること□ないこと",
    description: "COMING SOON | 11月13日（木）〜17日（月）｜11:00 - 19:00｜東京大学 □ 本郷キャンパス",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
      </head>
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
        <Suspense fallback={null}>{children}</Suspense>
        <Analytics />
      </body>
    </html>
  )
}
