import { Component as LoginPage } from "@/components/ui/animated-characters-login-page"
import Link from "next/link"
import { Sparkles } from "lucide-react"

export default function SignUpPage() {
  return (
    <div className="relative w-full bg-background min-h-screen">
      {/* Brand logo at top left */}
      <Link
        href="/"
        className="fixed top-6 left-6 z-50 flex items-center gap-2 text-lg font-semibold text-white cursor-pointer select-none"
      >
        <div className="size-8 rounded-lg bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/10">
          <Sparkles className="size-4 text-white" />
        </div>
        <span>AIKB</span>
      </Link>

      {/* Auth action buttons at top right */}
      <div className="fixed top-6 right-6 z-50 hidden md:flex items-center gap-4">
        <Link
          href="/#login"
          className="text-white hover:text-white/80 px-3 py-1.5 text-sm font-semibold transition-all duration-200 cursor-pointer"
        >
          Sign in
        </Link>
        <Link
          href="/signup"
          className="inline-flex items-center justify-center rounded-full bg-white text-black px-5 py-2 text-sm font-semibold hover:bg-white/90 shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer"
        >
          Sign up
        </Link>
      </div>

      <main className="relative z-10 w-full">
        <LoginPage initialSignUp />
      </main>
    </div>
  )
}
