"use client";

import React, { useEffect, useId, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export type SocialOption = {
  label: string;
  url: string;
};

interface SocialDropdownProps extends React.HTMLAttributes<HTMLDivElement> {
  iconSrc?: string;
  icon?: React.ReactNode;
  alt?: string;
  options: SocialOption[];
  imgClassName?: string;
}

// Simple cross-instance opener so only one dropdown is open at a time.
const OPEN_EVENT = "social-dropdown-open";

export default function SocialDropdown({
  iconSrc,
  icon,
  alt = "social",
  options,
  imgClassName = "h-5 w-5",
  className,
  ...props
}: SocialDropdownProps) {
  const id = useId();
  const ref = useRef<HTMLDivElement | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const onOpen = (e: Event) => {
      const detail = (e as CustomEvent).detail as { id?: string } | undefined;
      if (!detail) return;
      if (detail.id !== id) setOpen(false);
    };

    window.addEventListener(OPEN_EVENT, onOpen as EventListener);
    return () => window.removeEventListener(OPEN_EVENT, onOpen as EventListener);
  }, [id]);

  useEffect(() => {
    const handleDoc = (e: MouseEvent) => {
      const el = ref.current;
      if (!el) return;
      if (e.target instanceof Node && !el.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleDoc);
    return () => document.removeEventListener("mousedown", handleDoc);
  }, []);

  const toggle = (evt?: React.MouseEvent) => {
    evt?.preventDefault();
    const next = !open;
    setOpen(next);
    if (next && typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent(OPEN_EVENT, { detail: { id } }));
    }
  };

  return (
    <div ref={ref} className={`relative inline-block ${className || ""}`} {...props}>
      <button
        onClick={toggle}
        aria-haspopup="menu"
        aria-expanded={open}
        className="inline-flex items-center justify-center rounded-full bg-white/5 p-1"
      >
        {icon ? (
          <span className="flex items-center justify-center">{icon}</span>
        ) : (
          iconSrc && <img src={iconSrc} alt={alt} className={`${imgClassName} object-contain`} />
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.98 }}
            transition={{ duration: 0.18 }}
            className="absolute bottom-full left-1/2 z-30 -translate-x-1/2 mb-2 w-60 max-w-[90vw]"
          >
            <div className="footer-glass-pill px-2 py-2 rounded-lg shadow-lg">
              <div className="flex flex-col gap-2">
                {options.map((o, idx) => (
                  <a
                    key={idx}
                    href={o.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between gap-2 rounded px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-white/3 transition-colors"
                  >
                    <span className="truncate">{o.label}</span>
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-muted-foreground shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h6m0 0v6m0-6L10 16" />
                    </svg>
                  </a>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
