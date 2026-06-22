import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"

export default auth(() => {
  const response = NextResponse.next()

  response.headers.set(
    "Content-Security-Policy",
    [
      "default-src 'self'",
      "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://*.livekit.cloud https://vercel.live",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' blob: data: https://lh3.googleusercontent.com https://utfs.io https://avatars.githubusercontent.com",
      "font-src 'self' data:",
      "connect-src 'self' https://*.livekit.cloud wss://*.livekit.cloud https://api.openai.com",
      "frame-src 'self' https://*.livekit.cloud",
      "worker-src 'self' blob:",
    ].join("; ")
  )
  response.headers.set("X-Frame-Options", "DENY")
  response.headers.set("X-Content-Type-Options", "nosniff")
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin")
  response.headers.set("X-XSS-Protection", "1; mode=block")

  return response
})

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
}
