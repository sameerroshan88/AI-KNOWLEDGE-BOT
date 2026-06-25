"use client"

import { useState, useEffect } from "react"
import { Home, Sparkles, HelpCircle, LifeBuoy, Shield } from "lucide-react"
import { NavBar } from "@/components/ui/tubelight-navbar"

interface SiteNavProps {
  onItemClick?: (item: { name: string; url: string }) => void
}

export function SiteNav({ onItemClick }: SiteNavProps) {
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  useEffect(() => {
    setIsLoggedIn(!!localStorage.getItem("user"))
  }, [])

  const navItems = [
    { name: "Home", url: "#hero", icon: Home },
    { name: "Features", url: "#features", icon: Sparkles },
    { name: "FAQ", url: "#faq", icon: HelpCircle },
    { name: "Support", url: "#footer", icon: LifeBuoy },
    { name: "Privacy Policy", url: "#footer", icon: Shield },
  ]

  return <NavBar items={navItems} onItemClick={onItemClick} />
}
