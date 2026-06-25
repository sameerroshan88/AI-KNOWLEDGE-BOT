'use client';

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { GLSLHills } from "@/components/ui/glsl-hills";

function TubeLight({ active }: { active: boolean }) {
  return (
    <div className="pointer-events-none absolute inset-0 flex items-start justify-center">
      <div className="absolute top-0 isolate z-0 flex w-screen flex-1 items-start justify-center">
        <div className="absolute top-0 z-50 h-36 w-[28rem] -translate-y-[30%] rounded-full bg-primary/60 opacity-80 blur-3xl" />

        <motion.div
          initial={{ width: "8rem" }}
          animate={active ? { width: "16rem" } : { width: "8rem" }}
          transition={{ ease: "easeInOut", delay: 0.2, duration: 0.8 }}
          className="absolute top-10 z-30 h-36 -translate-y-[20%] rounded-full bg-primary/60 blur-2xl"
        />

        <motion.div
          initial={{ width: "15rem" }}
          animate={active ? { width: "30rem" } : { width: "15rem" }}
          transition={{ ease: "easeInOut", delay: 0.2, duration: 0.8 }}
          className="absolute inset-auto z-50 h-0.5 -translate-y-[-10%] bg-primary/60"
        />

        <motion.div
          initial={{ opacity: 0.5, width: "15rem" }}
          animate={active ? { opacity: 1, width: "30rem" } : { opacity: 0.5, width: "15rem" }}
          transition={{ delay: 0.2, duration: 0.8, ease: "easeInOut" }}
          style={{
            backgroundImage: `conic-gradient(var(--conic-position), var(--tw-gradient-stops))`,
          }}
          className="absolute inset-auto right-1/2 h-56 overflow-visible w-[30rem] bg-gradient-conic from-primary/60 via-transparent to-transparent [--conic-position:from_70deg_at_center_top]"
        >
          <div className="absolute w-[100%] left-0 bg-background h-40 bottom-0 z-20 [mask-image:linear-gradient(to_top,white,transparent)]" />
          <div className="absolute w-40 h-[100%] left-0 bg-background bottom-0 z-20 [mask-image:linear-gradient(to_right,white,transparent)]" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0.5, width: "15rem" }}
          animate={active ? { opacity: 1, width: "30rem" } : { opacity: 0.5, width: "15rem" }}
          transition={{ delay: 0.2, duration: 0.8, ease: "easeInOut" }}
          style={{
            backgroundImage: `conic-gradient(var(--conic-position), var(--tw-gradient-stops))`,
          }}
          className="absolute inset-auto left-1/2 h-56 w-[30rem] bg-gradient-conic from-transparent via-transparent to-primary/60 [--conic-position:from_290deg_at_center_top]"
        >
          <div className="absolute w-40 h-[100%] right-0 bg-background bottom-0 z-20 [mask-image:linear-gradient(to_left,white,transparent)]" />
          <div className="absolute w-[100%] right-0 bg-background h-40 bottom-0 z-20 [mask-image:linear-gradient(to_top,white,transparent)]" />
        </motion.div>
      </div>
    </div>
  );
}

export default function DemoOne() {
  const [isPreloaderDone, setIsPreloaderDone] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    if ((window as any).__aikbPreloaderDone) {
      setIsPreloaderDone(true);
      return;
    }

    const handlePreloaderDone = () => setIsPreloaderDone(true);
    window.addEventListener("aikb:preloader:done", handlePreloaderDone);
    return () => window.removeEventListener("aikb:preloader:done", handlePreloaderDone);
  }, []);

  return (
    <div className="relative flex h-full w-full flex-col items-center justify-center overflow-hidden ">
      <GLSLHills />
      <TubeLight active={isPreloaderDone} />
      <div className="space-y-6 pointer-events-none z-10 text-center absolute">
        <h1 className="font-semibold text-7xl whitespace-pre-wrap">
          Your Documents.<br />
          Instant Answers.
        </h1>
        <p className="text-sm text-primary/60">
          Upload any PDF, SOP, or policy -<br />
          and get accurate answers in seconds. No searching. No waiting.
        </p>
      </div>
    </div>
  );
}
