import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Toaster } from "@/components/ui/toaster"
import { Analytics } from "@vercel/analytics/next"
import Script from "next/script"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "AI Description Generator - Professional eBay Listings",
  description:
    "Create professional, SEO-optimized eBay product descriptions in seconds with our AI-powered tool. Save time and boost sales with compelling listings.",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-3785282145645278"
          crossOrigin="anonymous"
        />
      </head>
      <body className={inter.className}>
        {children}
        <Toaster />
        <Analytics />
      </body>
    </html>
  )
}
