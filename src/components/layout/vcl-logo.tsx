import Image from "next/image";
import { cn } from "@/lib/utils";

const sizes = {
  sm: "h-7",
  md: "h-8",
} as const;

export function VclLogo({
  size = "md",
  className,
}: {
  size?: keyof typeof sizes;
  className?: string;
}) {
  return (
    <Image
      src="/vcl_logo_white.png"
      alt="VCL"
      width={64}
      height={64}
      className={cn("w-auto shrink-0 object-contain", sizes[size], className)}
    />
  );
}
