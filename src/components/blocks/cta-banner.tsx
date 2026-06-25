"use client"

import { useEffect, useState } from "react"

export function CtaBanner() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  useEffect(() => {
    setIsLoggedIn(!!localStorage.getItem("user"))
  }, [])

  return (
    <section className="py-20 bg-primary text-white">
      <div className="container mx-auto px-4 max-w-3xl text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-4">
          Ready to chat with your PDFs?
        </h2>
        <p className="text-primary-foreground/80 text-lg mb-8">
          Stop searching through PDFs. Start getting answers instantly — 24×7, in your language.
        </p>
        <a
          href={isLoggedIn ? "/dashboard" : "#hero"}
          className="inline-flex items-center justify-center rounded-full bg-white text-primary px-8 py-3 text-sm font-semibold hover:bg-white/90 transition-colors"
        >
          {isLoggedIn ? "Go to Dashboard" : "Try AI Knowledge Base Bot"}
        </a>
      </div>
    </section>
  )
}
