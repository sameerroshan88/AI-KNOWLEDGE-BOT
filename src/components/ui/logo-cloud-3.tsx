import { InfiniteSlider } from "@/components/ui/infinite-slider"
import { cn } from "@/lib/utils"

type Logo = {
  src: string
  alt: string
  width?: number
  height?: number
  className?: string
}

type LogoCloudProps = React.ComponentProps<"div"> & {
  logos: Logo[]
}

export function LogoCloud({ className, logos, ...props }: LogoCloudProps) {
  return (
    <div
      {...props}
      className={cn(
        "overflow-hidden py-4 [mask-image:linear-gradient(to_right,transparent,black,transparent)]",
        className
      )}
    >
      <InfiniteSlider gap={42} reverse duration={80} durationOnHover={25}>
        {logos.map((logo, index) => (
          <img
            alt={logo.alt}
            className={cn("pointer-events-none select-none", logo.className || "h-4 md:h-5")}
            height={logo.height || "auto"}
            key={`logo-${logo.alt}-${index}`}
            loading="lazy"
            src={logo.src}
            width={logo.width || "auto"}
          />
        ))}
      </InfiniteSlider>
    </div>
  )
}
