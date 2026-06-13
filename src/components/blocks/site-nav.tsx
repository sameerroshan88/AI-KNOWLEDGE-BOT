"use client"

import {
  Home,
  Sparkles,
  HelpCircle,
  LifeBuoy,
  Shield,
} from "lucide-react"
import { NavBar } from "@/components/ui/tubelight-navbar"

export function SiteNav() {
  const navItems = [
    { name: "Home", url: "#hero", icon: Home },
    { name: "Features", url: "#features", icon: Sparkles },
    { name: "FAQ", url: "#faq", icon: HelpCircle },
    { name: "Support", url: "#support", icon: LifeBuoy },
    { name: "Privacy Policy", url: "#privacy-policy", icon: Shield },
  ]

  return <NavBar items={navItems} />
}
