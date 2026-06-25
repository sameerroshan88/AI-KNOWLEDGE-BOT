"use client"

import { useEffect, useState } from "react"
import { SiteNav } from "@/components/blocks/site-nav"
import { HeroSection } from "@/components/blocks/hero-section"
import { Component as LoginPage } from "@/components/ui/animated-characters-login-page"
import { StatsStrip } from "@/components/blocks/stats-strip"
import { TrustedBy } from "@/components/blocks/trusted-by"
import { HowItWorks } from "@/components/blocks/how-it-works"
import { Features } from "@/components/blocks/features"
import { UseCases } from "@/components/blocks/use-cases"
import { Faq3 } from "@/components/ui/faq3"
import { CtaBanner } from "@/components/blocks/cta-banner"
import { CinematicFooter } from "@/components/ui/motion-footer"
import { Sparkles } from "lucide-react"
import Link from "next/link"

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [showLogin, setShowLogin] = useState(false)
  const [initialSignUp, setInitialSignUp] = useState(false)

  useEffect(() => {
    setIsLoggedIn(!!localStorage.getItem("user"))

    const checkHash = () => {
      if (window.location.hash === "#login") {
        setShowLogin(true)
        setInitialSignUp(false)
      } else if (window.location.hash === "#signup") {
        setShowLogin(true)
        setInitialSignUp(true)
      }
    }

    checkHash()

    window.addEventListener("hashchange", checkHash)
    return () => window.removeEventListener("hashchange", checkHash)
  }, [])

  useEffect(() => {
    const handlePopState = () => {
      setShowLogin(false)
    }

    window.addEventListener("popstate", handlePopState)
    return () => window.removeEventListener("popstate", handlePopState)
  }, [])

  const handleNavItemClick = (item: { name: string; url: string }) => {
    if (item.name === "Home") {
      setShowLogin(false)
      window.history.pushState({}, document.title, window.location.pathname + window.location.search)
    }
  }

  const handleSignInClick = () => {
    setInitialSignUp(false)
    setShowLogin(true)
    window.history.pushState({ loginPage: true }, "", window.location.href)
  }

  const handleSignUpClick = () => {
    setInitialSignUp(true)
    setShowLogin(true)
    window.history.pushState({ signupPage: true }, "", window.location.href)
  }

  return (
    <div className="relative w-full bg-background min-h-screen">
      {/* Brand logo at top left */}
      <div
        className="fixed top-6 left-6 z-50 flex items-center gap-2 text-lg font-semibold text-white cursor-pointer select-none"
        onClick={() => {
          setShowLogin(false)
          window.history.pushState({}, document.title, window.location.pathname + window.location.search)
        }}
      >
        <div className="size-8 rounded-lg bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/10">
          <Sparkles className="size-4 text-white" />
        </div>
        <span>AIKB</span>
      </div>

      {!showLogin && <SiteNav onItemClick={handleNavItemClick} />}

      {/* Auth action buttons at top right */}
      <div className="fixed top-6 right-6 z-50 hidden md:flex items-center gap-4">
        <button
          id="signin-button"
          type="button"
          onClick={handleSignInClick}
          className={
            showLogin && !initialSignUp
              ? "inline-flex items-center justify-center rounded-full bg-white text-black px-5 py-2 text-sm font-semibold hover:bg-white/90 shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer"
              : "text-white hover:text-white/80 px-3 py-1.5 text-sm font-semibold transition-all duration-200 cursor-pointer"
          }
        >
          Sign in
        </button>
        <button
          id="signup-button"
          type="button"
          onClick={handleSignUpClick}
          className={
            !showLogin || initialSignUp
              ? "inline-flex items-center justify-center rounded-full bg-white text-black px-5 py-2 text-sm font-semibold hover:bg-white/90 shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer"
              : "text-white hover:text-white/80 px-3 py-1.5 text-sm font-semibold transition-all duration-200 cursor-pointer"
          }
        >
          Sign up
        </button>
      </div>

      <main className="relative z-10 w-full">
        {showLogin ? (
          <LoginPage initialSignUp={initialSignUp} />
        ) : (
          <>
            <HeroSection />
            <StatsStrip />
            <TrustedBy />
            <HowItWorks />
            <Features />
            <UseCases />
            <Faq3
              heading="Frequently asked questions"
              description="Find answers to common questions about AI Knowledge Base Bot. Can't find what you're looking for? Contact our support team."
            />
            <CtaBanner />
            <div id="footer" className="h-px scroll-mt-28" />
            <CinematicFooter />
          </>
        )}
      </main>
    </div>
  )
}