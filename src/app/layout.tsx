import type { Metadata, Viewport } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import "./globals.css"
import { Providers } from "@/components/providers"
import { PwaRegister } from "@/components/pwa-register"
import { ScrollProgressBar } from "@/components/layout/scroll-progress-bar"
import { SmoothScroll } from "@/components/motion/smooth-scroll"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: {
    template: "%s — Student Help",
    default: "Student Help — Learn Smarter",
  },
  description:
    "AI-powered doubt solving, expert teacher sessions, and personalized learning — all in one seamless platform.",
  manifest: "/manifest.webmanifest",
  icons: [
    { rel: "icon", url: "/icon.svg", type: "image/svg+xml" },
    { rel: "apple-touch-icon", url: "/icon.svg", type: "image/svg+xml" },
  ],
  appleWebApp: {
    capable: true,
    title: "Student Help",
    statusBarStyle: "black-translucent",
  },
  other: {
    "mobile-web-app-capable": "yes",
  },
}

export const viewport: Viewport = {
  themeColor: "#6366f1",
  width: "device-width",
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <meta name="application-name" content="Student Help" />
      </head>
      <body className="min-h-full flex flex-col">
        <Providers>
          <SmoothScroll>
            {children}
          </SmoothScroll>
        </Providers>
        <PwaRegister />
        <ScrollProgressBar />
      </body>
    </html>
  )
}
