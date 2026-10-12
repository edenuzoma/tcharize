import type { HTMLAttributes } from "react";
import { cn } from "./utils";

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-[2rem] border border-ink/10 bg-surface p-6 shadow-[0_18px_60px_rgba(38,16,61,0.12)]",
        className,
      )}
      {...props}
    />
  );
}

