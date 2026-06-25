"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { WavePath } from "@/components/ui/wave-path"

export interface HeroAction {
  label: string
  href?: string
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
  onClick?: () => void
}

export interface HeroProps extends Omit<React.HTMLAttributes<HTMLElement>, 'title'> {
  gradient?: boolean
  blur?: boolean
  title: React.ReactNode
  subtitle?: React.ReactNode
  afterRope?: React.ReactNode
  aiPanel?: React.ReactNode
  actions?: HeroAction[]
  titleClassName?: string
  subtitleClassName?: string
  actionsClassName?: string
}

const Hero = React.forwardRef<HTMLElement, HeroProps>(
  (
    {
      className,
      gradient = true,
      blur = true,
      title,
      subtitle,
      afterRope,
      aiPanel,
      actions,
      titleClassName,
      subtitleClassName,
      actionsClassName,
      ...props
    },
    ref,
  ) => {
    const [isPreloaderDone, setIsPreloaderDone] = React.useState(false)

    React.useEffect(() => {
      if (typeof window !== "undefined") {
        if ((window as any).__aikbPreloaderDone) {
          setIsPreloaderDone(true)
        } else {
          const handleDone = () => setIsPreloaderDone(true)
          window.addEventListener("aikb:preloader:done", handleDone)
          return () => window.removeEventListener("aikb:preloader:done", handleDone)
        }
      }
    }, [])

    return (
      <section
        ref={ref}
        className={cn(
          "relative z-0 flex min-h-screen w-full flex-col items-center justify-center overflow-hidden rounded-md bg-background",
          className,
        )}
        {...props}
      >
        {gradient && (
          <div className="absolute top-0 isolate z-0 flex w-screen flex-1 items-start justify-center">
            {blur && (
              <div className="absolute top-0 z-50 h-48 w-screen bg-transparent opacity-10 backdrop-blur-md" />
            )}

            {/* Main glow */}
            <div className="absolute inset-auto z-50 h-36 w-[28rem] -translate-y-[-30%] rounded-full bg-primary/60 opacity-80 blur-3xl" />

            {/* Lamp effect */}
            <motion.div
              initial={{ width: "8rem" }}
              animate={isPreloaderDone ? { width: "16rem" } : { width: "8rem" }}
              transition={{ ease: "easeInOut", delay: 0.3, duration: 0.8 }}
              className="absolute top-0 z-30 h-36 -translate-y-[20%] rounded-full bg-primary/60 blur-2xl"
            />

            {/* Top line */}
            <motion.div
              initial={{ width: "15rem" }}
              animate={isPreloaderDone ? { width: "30rem" } : { width: "15rem" }}
              transition={{ ease: "easeInOut", delay: 0.3, duration: 0.8 }}
              className="absolute inset-auto z-50 h-0.5 -translate-y-[-10%] bg-primary/60"
            />

            {/* Left gradient cone */}
            <motion.div
              initial={{ opacity: 0.5, width: "15rem" }}
              animate={isPreloaderDone ? { opacity: 1, width: "30rem" } : { opacity: 0.5, width: "15rem" }}
              transition={{
                delay: 0.3,
                duration: 0.8,
                ease: "easeInOut",
              }}
              style={{
                backgroundImage: `conic-gradient(var(--conic-position), var(--tw-gradient-stops))`,
              }}
              className="absolute inset-auto right-1/2 h-56 overflow-visible w-[30rem] bg-gradient-conic from-primary/60 via-transparent to-transparent [--conic-position:from_70deg_at_center_top]"
            >
              <div className="absolute w-[100%] left-0 bg-background h-40 bottom-0 z-20 [mask-image:linear-gradient(to_top,white,transparent)]" />
              <div className="absolute w-40 h-[100%] left-0 bg-background bottom-0 z-20 [mask-image:linear-gradient(to_right,white,transparent)]" />
            </motion.div>

            {/* Right gradient cone */}
            <motion.div
              initial={{ opacity: 0.5, width: "15rem" }}
              animate={isPreloaderDone ? { opacity: 1, width: "30rem" } : { opacity: 0.5, width: "15rem" }}
              transition={{
                delay: 0.3,
                duration: 0.8,
                ease: "easeInOut",
              }}
              style={{
                backgroundImage: `conic-gradient(var(--conic-position), var(--tw-gradient-stops))`,
              }}
              className="absolute inset-auto left-1/2 h-56 w-[30rem] bg-gradient-conic from-transparent via-transparent to-primary/60 [--conic-position:from_290deg_at_center_top]"
            >
              <div className="absolute w-40 h-[100%] right-0 bg-background bottom-0 z-20 [mask-image:linear-gradient(to_left,white,transparent)]" />
              <div className="absolute w-[100%] right-0 bg-background h-40 bottom-0 z-20 [mask-image:linear-gradient(to_top,white,transparent)]" />
            </motion.div>
          </div>
        )}

        <motion.div
          initial={{ y: 100, opacity: 0.5 }}
          animate={isPreloaderDone ? { y: 0, opacity: 1 } : { y: 100, opacity: 0.5 }}
          transition={{ ease: "easeInOut", delay: 0.3, duration: 0.8 }}
          className="relative z-50 container flex justify-center flex-1 flex-col px-5 md:px-10 gap-4"
        >
          <div className="flex flex-col items-center text-center space-y-4">
            <h1
              className={cn(
                "text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight",
                titleClassName,
              )}
            >
              {title}
            </h1>
            {subtitle && (
              <>
                <p
                  className={cn(
                    "text-xl text-muted-foreground",
                    subtitleClassName,
                  )}
                >
                  {subtitle}
                </p>
                <WavePath className="my-6 text-primary/30" />
              </>
            )}
            {aiPanel && (
              <div className="mt-12">
                {aiPanel}
              </div>
            )}
            {afterRope && (
              <div className="max-w-3xl text-center text-base text-muted-foreground sm:text-lg">
                {afterRope}
              </div>
            )}
            {actions && actions.length > 0 && (
              <div className={cn("flex gap-4", actionsClassName)}>
                {actions.map((action, index) => {
                  const content = action.label
                  if (action.onClick) {
                    return (
                      <Button
                        key={index}
                        variant={action.variant || "default"}
                        onClick={action.onClick}
                        type="button"
                      >
                        {content}
                      </Button>
                    )
                  }
                  return (
                    <Button
                      key={index}
                      variant={action.variant || "default"}
                      asChild
                    >
                      <Link href={action.href || "#"}>{content}</Link>
                    </Button>
                  )
                })}
              </div>
            )}
          </div>
        </motion.div>
      </section>
    )
  },
)
Hero.displayName = "Hero"

export { Hero }
