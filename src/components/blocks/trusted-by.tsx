import { LogoCloud } from "@/components/ui/logo-cloud-3"

const logos = [
  { src: "/vidyashilp.png", alt: "Vidyashilp", className: "h-20 md:h-24 mx-4 object-contain" },
  { src: "/techqrt.png", alt: "Techqrt", className: "h-14 md:h-16 mx-4 object-contain" },
  { src: "/vidyashilp.png", alt: "Vidyashilp", className: "h-20 md:h-24 mx-4 object-contain" },
  { src: "/techqrt.png", alt: "Techqrt", className: "h-14 md:h-16 mx-4 object-contain" },
  { src: "/vidyashilp.png", alt: "Vidyashilp", className: "h-20 md:h-24 mx-4 object-contain" },
  { src: "/techqrt.png", alt: "Techqrt", className: "h-14 md:h-16 mx-4 object-contain" },
]

export function TrustedBy() {
  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4 max-w-4xl">
        <h2 className="mb-5 text-center font-medium text-foreground text-xl tracking-tight md:text-2xl">
          <span className="text-muted-foreground">Trusted by millions.</span>
          <br />
          <span className="font-semibold">Used by students and professionals worldwide.</span>
        </h2>
        <div className="mx-auto my-5 h-px max-w-sm bg-border [mask-image:linear-gradient(to_right,transparent,black,transparent)]" />
        <LogoCloud logos={logos} />
        <div className="mt-5 h-px bg-border [mask-image:linear-gradient(to_right,transparent,black,transparent)]" />
      </div>
    </section>
  )
}
