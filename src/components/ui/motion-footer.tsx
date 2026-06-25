"use client";

import * as React from "react";
import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { cn } from "@/lib/utils";
import SocialDropdown from "@/components/ui/social-dropdown";
import { Sheet, SheetTrigger, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { SUPPORT_EMAILS } from "@/lib/constants";
// Social logos rendered directly in footer

// Register ScrollTrigger safely for React
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

// -------------------------------------------------------------------------
// 1. THEME-ADAPTIVE INLINE STYLES
// -------------------------------------------------------------------------
const STYLES = `
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800;900&display=swap');
@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&display=swap');

.cinematic-footer-wrapper {
  font-family: 'Plus Jakarta Sans', sans-serif;
  -webkit-font-smoothing: antialiased;
  
  /* Dynamic Variables using standard shadcn/tailwind v4 tokens */
  --pill-bg-1: color-mix(in oklch, var(--foreground) 3%, transparent);
  --pill-bg-2: color-mix(in oklch, var(--foreground) 1%, transparent);
  --pill-shadow: color-mix(in oklch, var(--background) 50%, transparent);
  --pill-highlight: color-mix(in oklch, var(--foreground) 10%, transparent);
  --pill-inset-shadow: color-mix(in oklch, var(--background) 80%, transparent);
  --pill-border: color-mix(in oklch, var(--foreground) 8%, transparent);
  
  --pill-bg-1-hover: color-mix(in oklch, var(--foreground) 8%, transparent);
  --pill-bg-2-hover: color-mix(in oklch, var(--foreground) 2%, transparent);
  --pill-border-hover: color-mix(in oklch, var(--foreground) 20%, transparent);
  --pill-shadow-hover: color-mix(in oklch, var(--background) 70%, transparent);
  --pill-highlight-hover: color-mix(in oklch, var(--foreground) 20%, transparent);
}

@keyframes footer-breathe {
  0% { transform: translate(-50%, -50%) scale(1); opacity: 0.6; }
  100% { transform: translate(-50%, -50%) scale(1.1); opacity: 1; }
}

@keyframes footer-scroll-marquee {
  from { transform: translateX(0); }
  to { transform: translateX(-50%); }
}

@keyframes footer-heartbeat {
  0%, 100% { transform: scale(1); filter: drop-shadow(0 0 5px color-mix(in oklch, var(--destructive) 50%, transparent)); }
  15%, 45% { transform: scale(1.2); filter: drop-shadow(0 0 10px color-mix(in oklch, var(--destructive) 80%, transparent)); }
  30% { transform: scale(1); }
}

.animate-footer-breathe {
  animation: footer-breathe 8s ease-in-out infinite alternate;
}

.animate-footer-scroll-marquee {
  animation: footer-scroll-marquee 40s linear infinite;
}

.animate-footer-heartbeat {
  animation: footer-heartbeat 2s cubic-bezier(0.25, 1, 0.5, 1) infinite;
}

@keyframes gmail-blink {
  0%, 100% { transform: scale(1); opacity: 1; filter: drop-shadow(0 0 5px rgba(234, 67, 53, 0.5)); }
  50% { transform: scale(1.2); opacity: 1; filter: drop-shadow(0 0 15px rgba(234, 67, 53, 0.9)); }
}

.animate-gmail-blink {
  animation: gmail-blink 0.6s ease-in-out 3;
}

@keyframes auth-blink {
  0%, 100% { transform: scale(1); box-shadow: 0 0 12px rgba(255,255,255,0.35); }
  50% { transform: scale(1.08); box-shadow: 0 0 24px rgba(255,255,255,0.85); }
}

.auth-button-blink {
  animation: auth-blink 0.5s ease-in-out 2;
}

/* Theme-adaptive Grid Background */
.footer-bg-grid {
  background-size: 60px 60px;
  background-image: 
    linear-gradient(to right, color-mix(in oklch, var(--foreground) 3%, transparent) 1px, transparent 1px),
    linear-gradient(to bottom, color-mix(in oklch, var(--foreground) 3%, transparent) 1px, transparent 1px);
  mask-image: linear-gradient(to bottom, transparent, black 30%, black 70%, transparent);
  -webkit-mask-image: linear-gradient(to bottom, transparent, black 30%, black 70%, transparent);
}

/* Theme-adaptive Aurora Glow */
.footer-aurora {
  background: radial-gradient(
    circle at 50% 50%, 
    color-mix(in oklch, var(--primary) 15%, transparent) 0%, 
    color-mix(in oklch, var(--secondary) 15%, transparent) 40%, 
    transparent 70%
  );
}

/* Glass Pill Theming */
.footer-glass-pill {
  background: linear-gradient(145deg, var(--pill-bg-1) 0%, var(--pill-bg-2) 100%);
  box-shadow: 
      0 10px 30px -10px var(--pill-shadow), 
      inset 0 1px 1px var(--pill-highlight), 
      inset 0 -1px 2px var(--pill-inset-shadow);
  border: 1px solid var(--pill-border);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

.footer-glass-pill:hover {
  background: linear-gradient(145deg, var(--pill-bg-1-hover) 0%, var(--pill-bg-2-hover) 100%);
  border-color: var(--pill-border-hover);
  box-shadow: 
      0 20px 40px -10px var(--pill-shadow-hover), 
      inset 0 1px 1px var(--pill-highlight-hover);
  color: var(--foreground);
}

/* Giant Background Text Masking */
.footer-giant-bg-text {
  font-size: 26vw;
  line-height: 0.75;
  font-weight: 900;
  letter-spacing: -0.05em;
  color: transparent;
  -webkit-text-stroke: 1px color-mix(in oklch, var(--foreground) 5%, transparent);
  background: linear-gradient(180deg, color-mix(in oklch, var(--foreground) 10%, transparent) 0%, transparent 60%);
  -webkit-background-clip: text;
  background-clip: text;
}

/* Metallic Text Glow */
.footer-text-glow {
  background: linear-gradient(180deg, var(--foreground) 0%, color-mix(in oklch, var(--foreground) 40%, transparent) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  filter: drop-shadow(0px 0px 20px color-mix(in oklch, var(--foreground) 15%, transparent));
}

/* Tactic Sans Style - Bold Extended Italic */
.footer-heading-font {
  font-family: 'Bebas Neue', 'Tactic Sans', sans-serif;
  font-weight: 900;
  font-style: italic;
  letter-spacing: 0.35em;
  word-spacing: 0.5em;
  transform: scaleX(1.2);
  transform-origin: center;
}
`;

// -------------------------------------------------------------------------
// 2. MAGNETIC BUTTON PRIMITIVE (Zero Dependency)
// -------------------------------------------------------------------------
export type MagneticButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> &
  React.AnchorHTMLAttributes<HTMLAnchorElement> & {
    as?: React.ElementType;
  };

const MagneticButton = React.forwardRef<HTMLElement, MagneticButtonProps>(
  ({ className, children, as: Component = "button", ...props }, forwardedRef) => {
    const localRef = useRef<HTMLElement>(null);

    useEffect(() => {
      if (typeof window === "undefined") return;
      const element = localRef.current;
      if (!element) return;

      const ctx = gsap.context(() => {
        const handleMouseMove = (e: MouseEvent) => {
          const rect = element.getBoundingClientRect();
          const h = rect.width / 2;
          const w = rect.height / 2;
          const x = e.clientX - rect.left - h;
          const y = e.clientY - rect.top - w;

          gsap.to(element, {
            x: x * 0.4,
            y: y * 0.4,
            rotationX: -y * 0.15,
            rotationY: x * 0.15,
            scale: 1.05,
            ease: "power2.out",
            duration: 0.4,
          });
        };

        const handleMouseLeave = () => {
          gsap.to(element, {
            x: 0,
            y: 0,
            rotationX: 0,
            rotationY: 0,
            scale: 1,
            ease: "elastic.out(1, 0.3)",
            duration: 1.2,
          });
        };

        element.addEventListener("mousemove", handleMouseMove as any);
        element.addEventListener("mouseleave", handleMouseLeave);

        return () => {
          element.removeEventListener("mousemove", handleMouseMove as any);
          element.removeEventListener("mouseleave", handleMouseLeave);
        };
      }, element);

      return () => ctx.revert();
    }, []);

    return (
      <Component
        ref={(node: HTMLElement) => {
          (localRef as any).current = node;
          if (typeof forwardedRef === "function") forwardedRef(node);
          else if (forwardedRef) (forwardedRef as any).current = node;
        }}
        className={cn("cursor-pointer", className)}
        {...props}
      >
        {children}
      </Component>
    );
  }
);
MagneticButton.displayName = "MagneticButton";

// -------------------------------------------------------------------------
// 3. MAIN COMPONENT
// -------------------------------------------------------------------------
const MarqueeItem = () => (
  <div className="flex items-center space-x-12 px-6">
    <span>INSTANT ANSWERS</span> <span className="text-primary/60">✦</span>
    <span>CITED SOURCES</span> <span className="text-secondary/60">✦</span>
    <span>MULTI-LANGUAGE</span> <span className="text-primary/60">✦</span>
    <span>RAG ARCHITECTURE</span> <span className="text-secondary/60">✦</span>
    <span>24×7 SUPPORT</span> <span className="text-primary/60">✦</span>
    <span>DOCUMENT UPLOAD</span> <span className="text-secondary/60">✦</span>
    <span>SECURE ACCESS</span> <span className="text-primary/60">✦</span>
    <span>GEMINI AI</span> <span className="text-secondary/60">✦</span>
    <span>API INTEGRATION</span>
  </div>
);

export function CinematicFooter() {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const giantTextRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const linksRef = useRef<HTMLDivElement>(null);
  const gmailIconsRef = useRef<HTMLDivElement>(null);
  const [openSheet, setOpenSheet] = React.useState<string | null>(null);

  // Handle browser back button for modals
  useEffect(() => {
    const handlePopState = () => {
      if (openSheet) {
        setOpenSheet(null);
      } else {
        window.history.back();
      }
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [openSheet]);

  // Push history when opening sheet
  const handleSheetOpenChange = (sheetId: string, isOpen: boolean) => {
    if (isOpen) {
      setOpenSheet(sheetId);
      window.history.pushState({ sheetOpen: sheetId }, "", window.location.href);
    } else {
      setOpenSheet(null);
    }
  };

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!wrapperRef.current) return;

    // React strict mode compatible GSAP context cleanup
    const ctx = gsap.context(() => {
      // Background Parallax
      gsap.fromTo(
        giantTextRef.current,
        { y: "10vh", scale: 0.8, opacity: 0 },
        {
          y: "0vh",
          scale: 1,
          opacity: 1,
          ease: "power1.out",
          scrollTrigger: {
            trigger: wrapperRef.current,
            start: "top 80%",
            end: "bottom bottom",
            scrub: 1,
          },
        }
      );

      // Staggered Content Reveal
      gsap.fromTo(
        [headingRef.current, linksRef.current],
        { y: 50, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          stagger: 0.15,
          ease: "power3.out",
          scrollTrigger: {
            trigger: wrapperRef.current,
            start: "top 40%",
            end: "bottom bottom",
            scrub: 1,
          },
        }
      );
    }, wrapperRef);

    return () => ctx.revert();
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const blinkAuthButtons = () => {
    const signInBtn = document.getElementById("signin-button");
    const signUpBtn = document.getElementById("signup-button");
    [signInBtn, signUpBtn].forEach((btn) => {
      if (!btn) return;
      btn.classList.remove("auth-button-blink");
      void btn.offsetWidth;
      btn.classList.add("auth-button-blink");
    });
  };

  const blinkAuthButtonsAfterHeroVisible = () => {
    const heroSection = document.getElementById("hero");
    if (!heroSection) return;

    const observer = new IntersectionObserver(
      (entries, obs) => {
        if (entries.some((entry) => entry.isIntersecting && entry.intersectionRatio >= 0.5)) {
          blinkAuthButtons();
          obs.disconnect();
        }
      },
      {
        root: null,
        threshold: 0.5,
      }
    );

    observer.observe(heroSection);
  };

  const handleFooterHeroClick = (event: React.MouseEvent<HTMLElement>) => {
    event.preventDefault();
    const heroSection = document.getElementById("hero");
    heroSection?.scrollIntoView({ behavior: "smooth" });
    blinkAuthButtonsAfterHeroVisible();
  };

  const handleFooterFeaturesClick = (event: React.MouseEvent<HTMLElement>) => {
    event.preventDefault();
    const featuresSection = document.getElementById("features");
    featuresSection?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSupportClick = () => {
    if (gmailIconsRef.current) {
      gmailIconsRef.current.classList.remove('animate-gmail-blink');
      void gmailIconsRef.current.offsetWidth;
      gmailIconsRef.current.classList.add('animate-gmail-blink');
    }
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: STYLES }} />

      {/* 
        The "Curtain Reveal" Wrapper:
        It sits in standard flow. Because it has clip-path, its contents
        are ONLY visible within its bounding box. 
      */}
      <div
        ref={wrapperRef}
        className="relative h-screen w-full"
        style={{ clipPath: "polygon(0% 0, 100% 0%, 100% 100%, 0 100%)" }}
      >
        {/* The actual footer stays fixed to the viewport underneath everything */}
<footer id="footer" className="fixed bottom-0 left-0 flex h-screen w-full flex-col justify-between overflow-hidden bg-background text-foreground cinematic-footer-wrapper z-20">

          {/* Ambient Light & Grid Background */}
          <div className="footer-aurora absolute left-1/2 top-1/2 h-[60vh] w-[80vw] -translate-x-1/2 -translate-y-1/2 animate-footer-breathe rounded-[50%] blur-[80px] pointer-events-none z-0" />
          <div className="footer-bg-grid absolute inset-0 z-0 pointer-events-none" />

          {/* Giant background text */}
          <div
            ref={giantTextRef}
            className="footer-giant-bg-text absolute -bottom-[5vh] left-1/2 -translate-x-1/2 whitespace-nowrap z-0 pointer-events-none select-none"
          >
            AI KB
          </div>

          {/* 1. Diagonal Sleek Marquee (Top of footer) */}
          <div className="absolute top-12 left-0 w-full overflow-hidden border-y border-border/50 bg-background/60 backdrop-blur-md py-4 z-10 -rotate-2 scale-110 shadow-2xl">
            <div className="flex w-max animate-footer-scroll-marquee text-xs md:text-sm font-bold tracking-[0.3em] text-muted-foreground uppercase">
              <MarqueeItem />
              <MarqueeItem />
            </div>
          </div>

          {/* 2. Main Center Content */}
          <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-6 mt-20 w-full max-w-5xl mx-auto">
            <div
              ref={headingRef}
              className="mb-12 text-center w-full flex justify-center"
            >
              <img
                src="/brand-name-transparent.png"
                alt="AI Knowledge Base Bot"
                className="max-w-4xl w-full h-auto drop-shadow-[0_0_20px_rgba(0,0,0,0.3)]"
              />
            </div>

            {/* Interactive Magnetic Pills Layout */}
            <div ref={linksRef} className="flex flex-col items-center gap-6 w-full">
              {/* App Store Links (Primary) */}
              <div className="flex flex-wrap justify-center gap-4 w-full">
                <MagneticButton as="a" href="#hero" onClick={handleFooterHeroClick} className="footer-glass-pill px-10 py-5 rounded-full text-foreground font-bold text-sm md:text-base flex items-center justify-center group">
                  Get Started Free
                </MagneticButton>

                <MagneticButton as="a" href="#features" onClick={handleFooterFeaturesClick} className="footer-glass-pill px-10 py-5 rounded-full text-foreground font-bold text-sm md:text-base flex items-center gap-3 group">
                  <svg className="w-6 h-6 text-muted-foreground group-hover:text-foreground transition-colors" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.523 15.3414c-.5511 0-.9993-.4486-.9993-.9997s.4482-.9993.9993-.9993c.5511 0 .9993.4482.9993.9993.0004.5511-.4482.9997-.9993.9997m-11.046 0c-.5511 0-.9993-.4486-.9993-.9997s.4482-.9993.9993-.9993c.5511 0 .9993.4482.9993.9993.0004.5511-.4482.9997-.9993.9997m11.4045-6.02l1.9973-3.4592a.416.416 0 00-.1521-.5676.416.416 0 00-.5676.1521l-2.0222 3.503C15.5902 8.242 13.8533 7.85 12 7.85c-1.8533 0-3.5902.392-5.1369 1.1004L4.841 5.4475a.416.416 0 00-.5676-.1521.416.416 0 00-.1521.5676l1.9973 3.4592C2.6889 11.1867.3432 14.6589 0 18.761h24c-.3436-4.1021-2.6893-7.5743-6.1185-9.4396" />
                  </svg>
                  View Features
                </MagneticButton>
              </div>

              {/* Secondary Text Links */}
              <div id="privacy-policy" className="flex flex-wrap justify-center gap-3 md:gap-6 w-full mt-2 scroll-mt-28">
                <Sheet open={openSheet === 'privacy'} onOpenChange={(isOpen) => handleSheetOpenChange('privacy', isOpen)}>
                  <SheetTrigger asChild>
                    <MagneticButton className="footer-glass-pill px-6 py-3 rounded-full text-muted-foreground font-medium text-xs md:text-sm hover:text-foreground">
                      Privacy Policy
                    </MagneticButton>
                  </SheetTrigger>
                  <SheetContent side="top" className="!inset-0 h-screen w-screen max-w-none overflow-auto bg-[#000000] flex flex-col">
                    <SheetTitle className="absolute -top-full">Privacy Policy</SheetTitle>
                    <div className="mx-auto max-w-[720px] px-4 py-8 w-full">
                      <h1 className="text-2xl font-bold text-white">Privacy Policy</h1>
                      <div className="mt-2 text-sm text-[#9CA3AF]">Last updated: [Date]</div>
                      <section className="mt-6 text-[#A0A0A0]">
                        <h2 className="text-xl font-medium text-white">1. Introduction</h2>
                        <p className="mt-2">AIKB Bot ("we," "our," "us") is an AI-powered knowledge base assistant built for Vidyashilp University and TechQRT. This policy explains what information we collect, how we use it, and your rights regarding it.</p>
                      </section>
                      <section className="mt-6">
                        <h2 className="text-xl font-medium text-white">2. Information We Collect</h2>
                        <ul className="mt-2 list-disc list-inside space-y-1 text-[#A0A0A0]">
                          <li><strong>Account information</strong>: name, email address, and login credentials</li>
                          <li><strong>Uploaded documents</strong>: PDFs and files you upload for the bot to process</li>
                          <li><strong>Conversation data</strong>: questions you ask and the bot's responses, stored as chat history</li>
                          <li><strong>Usage data</strong>: pages visited, features used, timestamps, and basic device/browser information</li>
                        </ul>
                      </section>
                      <section className="mt-6">
                        <h2 className="text-xl font-medium text-white">3. How We Use Your Information</h2>
                        <p className="mt-2 text-[#A0A0A0]">To process your uploaded documents and generate AI responses via Google's Gemini API</p>
                        <p className="mt-2 text-[#A0A0A0]">To maintain your chat history so you can return to previous conversations</p>
                        <p className="mt-2 text-[#A0A0A0]">To improve the accuracy and performance of the knowledge base bot</p>
                        <p className="mt-2 text-[#A0A0A0]">To provide support and respond to inquiries</p>
                      </section>
                      <section className="mt-6">
                        <h2 className="text-xl font-medium text-white">4. Third-Party Services</h2>
                        <p className="mt-2 text-[#A0A0A0]">We use the following third-party services to operate AIKB Bot:</p>
                        <ul className="mt-2 list-disc list-inside space-y-1 text-[#A0A0A0]">
                          <li><strong>Google Gemini API</strong> — processes document content and generates AI responses</li>
                          <li><strong>Hosting provider</strong> (e.g. Vercel) — hosts the application</li>
                          <li><strong>Database providers</strong> — store account data, chat history, and vector embeddings of uploaded documents</li>
                        </ul>
                        <p className="mt-2 text-[#A0A0A0]">These providers process data on our behalf and are bound by their own privacy and security commitments.</p>
                      </section>
                      <section className="mt-6">
                        <h2 className="text-xl font-medium text-white">5. Data Storage & Security</h2>
                        <p className="mt-2 text-[#A0A0A0]">Uploaded documents are converted into vector embeddings (via ChromaDB) for retrieval-based AI responses. We apply reasonable technical safeguards to protect your data, but no system is 100% secure.</p>
                      </section>
                      <section className="mt-6">
                        <h2 className="text-xl font-medium text-white">6. Data Retention</h2>
                        <p className="mt-2 text-[#A0A0A0]">We retain uploaded documents and chat history for as long as your account remains active, or until you delete them. You may request deletion of your data at any time (see Section 7).</p>
                      </section>
                      <section className="mt-6">
                        <h2 className="text-xl font-medium text-white">7. Your Rights</h2>
                        <ul className="mt-2 list-disc list-inside space-y-1 text-[#A0A0A0]">
                          <li>Request a copy of your data</li>
                          <li>Request correction of inaccurate data</li>
                          <li>Request deletion of your account, documents, and chat history</li>
                          <li>Withdraw consent for data processing where applicable</li>
                        </ul>
                        <p className="mt-2 text-[#A0A0A0]">To exercise these rights, contact us at [contact email].</p>
                      </section>
                      <section className="mt-6">
                        <h2 className="text-xl font-medium text-white">8. Cookies</h2>
                        <p className="mt-2 text-[#A0A0A0]">We use cookies/local storage to keep you logged in and remember basic preferences (e.g. sidebar state, theme).</p>
                      </section>
                      <section className="mt-6">
                        <h2 className="text-xl font-medium text-white">9. Children's Privacy</h2>
                        <p className="mt-2 text-[#A0A0A0]">AIKB Bot is intended for university students, faculty, and staff. It is not directed at children under 13.</p>
                      </section>
                      <section className="mt-6">
                        <h2 className="text-xl font-medium text-white">10. Changes to This Policy</h2>
                        <p className="mt-2 text-[#A0A0A0]">We may update this policy periodically. Continued use of AIKB Bot after changes constitutes acceptance of the revised policy.</p>
                      </section>
                      <section className="mt-6">
                        <h2 className="text-xl font-medium text-white">11. Contact Us</h2>
                        <p className="mt-2 text-[#A0A0A0]">
                          Questions about this policy? Contact us at{' '}
                          <strong>
                            {SUPPORT_EMAILS.map((support, index) => (
                              <span key={support.organization}>
                                {support.email}
                                {index < SUPPORT_EMAILS.length - 1 ? " and " : ""}
                              </span>
                            ))}
                          </strong>
                        </p>
                      </section>
                    </div>
                  </SheetContent>
                </Sheet>

                <Sheet open={openSheet === 'terms'} onOpenChange={(isOpen) => handleSheetOpenChange('terms', isOpen)}>
                  <SheetTrigger asChild>
                    <MagneticButton className="footer-glass-pill px-6 py-3 rounded-full text-muted-foreground font-medium text-xs md:text-sm hover:text-foreground">
                      Terms of Service
                    </MagneticButton>
                  </SheetTrigger>
                  <SheetContent side="top" className="!inset-0 h-screen w-screen max-w-none overflow-auto bg-[#000000] flex flex-col">
                    <SheetTitle className="absolute -top-full">Terms of Service</SheetTitle>
                    <div className="mx-auto max-w-[720px] px-4 py-8 w-full">
                      <h1 className="text-2xl font-bold text-white">Terms of Service</h1>
                      <div className="mt-2 text-sm text-[#9CA3AF]">Last updated: [Date]</div>
                      <section className="mt-6 text-[#A0A0A0]">
                        <h2 className="text-xl font-medium text-white">1. Acceptance of Terms</h2>
                        <p className="mt-2">By accessing or using AIKB Bot, you agree to these Terms of Service. If you do not agree, please do not use the service.</p>
                      </section>
                      <section className="mt-6">
                        <h2 className="text-xl font-medium text-white">2. Description of Service</h2>
                        <p className="mt-2 text-[#A0A0A0]">AIKB Bot is an AI-powered chatbot that allows users to upload documents (PDFs, SOPs, manuals, FAQs) and ask questions about their content, using retrieval-augmented generation (RAG) technology.</p>
                      </section>
                      <section className="mt-6">
                        <h2 className="text-xl font-medium text-white">3. User Accounts</h2>
                        <ul className="mt-2 list-disc list-inside space-y-1 text-[#A0A0A0]">
                          <li>You are responsible for maintaining the confidentiality of your account credentials</li>
                          <li>You agree to provide accurate information when creating an account</li>
                          <li>You are responsible for all activity under your account</li>
                        </ul>
                      </section>
                      <section className="mt-6">
                        <h2 className="text-xl font-medium text-white">4. Acceptable Use</h2>
                        <p className="mt-2 text-[#A0A0A0]">You agree not to:</p>
                        <ul className="mt-2 list-disc list-inside space-y-1 text-[#A0A0A0]">
                          <li>Upload content you do not have the legal right to share</li>
                          <li>Upload illegal, harmful, or infringing material</li>
                          <li>Use the service to generate harmful, abusive, or misleading content</li>
                          <li>Attempt to reverse-engineer, disrupt, or overload the service</li>
                        </ul>
                      </section>
                      <section className="mt-6">
                        <h2 className="text-xl font-medium text-white">5. User Content & Intellectual Property</h2>
                        <p className="mt-2 text-[#A0A0A0]">You retain ownership of any documents you upload. By uploading content, you grant AIKB Bot a limited license to process that content solely to provide the chatbot service to you.</p>
                      </section>
                      <section className="mt-6">
                        <h2 className="text-xl font-medium text-white">6. AI-Generated Content Disclaimer</h2>
                        <p className="mt-2 text-[#A0A0A0]">Responses generated by AIKB Bot are produced by AI and may be inaccurate, incomplete, or outdated. AIKB Bot is not a substitute for professional, legal, academic, or administrative advice. Always verify important information independently.</p>
                      </section>
                      <section className="mt-6">
                        <h2 className="text-xl font-medium text-white">7. Service Availability</h2>
                        <p className="mt-2 text-[#A0A0A0]">We aim to keep AIKB Bot available and reliable but do not guarantee uninterrupted access. The service may be modified, suspended, or discontinued at any time.</p>
                      </section>
                      <section className="mt-6">
                        <h2 className="text-xl font-medium text-white">8. Limitation of Liability</h2>
                        <p className="mt-2 text-[#A0A0A0]">AIKB Bot, Vidyashilp University, and TechQRT shall not be liable for any indirect, incidental, or consequential damages arising from use of the service, including reliance on AI-generated responses.</p>
                      </section>
                      <section className="mt-6">
                        <h2 className="text-xl font-medium text-white">9. Termination</h2>
                        <p className="mt-2 text-[#A0A0A0]">We reserve the right to suspend or terminate accounts that violate these terms.</p>
                      </section>
                      <section className="mt-6">
                        <h2 className="text-xl font-medium text-white">10. Governing Law</h2>
                        <p className="mt-2 text-[#A0A0A0]">These terms are governed by the laws of India.</p>
                      </section>
                      <section className="mt-6">
                        <h2 className="text-xl font-medium text-white">11. Changes to These Terms</h2>
                        <p className="mt-2 text-[#A0A0A0]">We may revise these terms from time to time. Continued use of the service after changes constitutes acceptance.</p>
                      </section>
                      <section className="mt-6">
                        <h2 className="text-xl font-medium text-white">12. Contact Us</h2>
                        <p className="mt-2 text-[#A0A0A0]">
                          Questions about these terms? Contact us at{' '}
                          <strong>
                            {SUPPORT_EMAILS.map((support, index) => (
                              <span key={support.organization}>
                                {support.email}
                                {index < SUPPORT_EMAILS.length - 1 ? " and " : ""}
                              </span>
                            ))}
                          </strong>
                        </p>
                      </section>
                    </div>
                  </SheetContent>
                </Sheet>

                <MagneticButton as="button" onClick={handleSupportClick} className="footer-glass-pill px-6 py-3 rounded-full text-muted-foreground font-medium text-xs md:text-sm hover:text-foreground">
                  Support
                </MagneticButton>
              </div>
            </div>
          </div>

          {/* 3. Bottom Bar / Credits */}
          <div className="relative z-20 w-full pb-8 px-6 md:px-12">
            <div className="flex flex-col md:flex-row items-start justify-between gap-4 md:gap-6 max-w-6xl mx-auto w-full">
              <div className="text-left">
                <p className="text-muted-foreground text-[10px] md:text-[11px] leading-relaxed">
                  © 2026 AI Knowledge Base Bot. All rights reserved.
                </p>
                <div className="mt-3 flex items-center gap-3" ref={gmailIconsRef}>
                  <SocialDropdown
                    iconSrc="https://www.gstatic.com/images/branding/product/1x/gmail_2020q4_48dp.png"
                    alt="Gmail"
                    options={SUPPORT_EMAILS.map((support) => ({
                      label: support.organization,
                      url: `mailto:${support.email}`,
                    }))}
                  />

                  <SocialDropdown
                    iconSrc="https://upload.wikimedia.org/wikipedia/commons/a/a5/Instagram_icon.png"
                    alt="Instagram"
                    options={[
                      { label: "Vidyashilp University", url: "https://www.instagram.com/vidyashilpuniversity/" },
                      { label: "TechQRT", url: "https://www.instagram.com/techqrt" },
                    ]}
                  />

                  <SocialDropdown
                    iconSrc="https://upload.wikimedia.org/wikipedia/commons/c/ca/LinkedIn_logo_initials.png"
                    alt="LinkedIn"
                    options={[
                      { label: "Vidyashilp University", url: "https://www.linkedin.com/company/vidyashilp-university/" },
                      { label: "TechQRT", url: "https://linkedin.com/company/techqrt-pvt-ltd" },
                    ]}
                  />

                  <SocialDropdown
                    iconSrc="https://upload.wikimedia.org/wikipedia/commons/b/b8/YouTube_Logo_2017.svg"
                    alt="YouTube"
                    options={[
                      { label: "Vidyashilp University", url: "https://www.youtube.com/channel/UCdq2LUWHTAtBBnxtJl6Mgwg" },
                    ]}
                  />

                  <SocialDropdown
                    iconSrc="https://upload.wikimedia.org/wikipedia/commons/0/05/Facebook_Logo_%282019%29.png"
                    alt="Facebook"
                    options={[
                      { label: "Vidyashilp University", url: "https://www.facebook.com/people/Vidyashilp-University/61553277992675/" },
                      { label: "TechQRT", url: "http://facebook.com/TechQRT/" },
                    ]}
                  />

                  <SocialDropdown
                    icon={
                      <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5 text-white">
                        <path d="M22.46 6c-.77.35-1.6.58-2.46.69a4.26 4.26 0 0 0 1.88-2.35 8.48 8.48 0 0 1-2.69 1.03 4.24 4.24 0 0 0-7.23 3.86A12.02 12.02 0 0 1 3.15 4.6a4.24 4.24 0 0 0 1.31 5.66c-.66-.02-1.28-.2-1.82-.5v.05c0 2.04 1.45 3.74 3.37 4.13a4.24 4.24 0 0 1-1.92.07 4.25 4.25 0 0 0 3.96 2.95A8.5 8.5 0 0 1 2 19.54a12 12 0 0 0 6.52 1.91c7.83 0 12.12-6.48 12.12-12.1v-.55A8.6 8.6 0 0 0 24 5.1a8.3 8.3 0 0 1-2.39.66z" />
                      </svg>
                    }
                    alt="X"
                    options={[{ label: "TechQRT", url: "https://x.com/techqrt" }]}
                  />
                </div>
              </div>
              <div className="hidden sm:flex items-center gap-2 order-3 md:order-3 ml-auto">
                <MagneticButton
                  as="button"
                  onClick={scrollToTop}
                  className="w-12 h-12 rounded-full footer-glass-pill flex items-center justify-center text-muted-foreground hover:text-foreground group shrink-0"
                >
                  <svg className="w-5 h-5 transform group-hover:-translate-y-1.5 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 10l7-7m0 0l7 7m-7-7v18"></path>
                  </svg>
                </MagneticButton>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
