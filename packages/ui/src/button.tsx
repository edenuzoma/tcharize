import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import type { ButtonHTMLAttributes } from "react";
import { cn } from "./utils";

export const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-full text-sm font-bold transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/30 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary: "bg-primary px-5 py-3 text-ink shadow-[0_5px_0_#4e8f00] hover:-translate-y-0.5 hover:shadow-[0_7px_0_#4e8f00] active:translate-y-1 active:shadow-none",
        secondary: "bg-secondary px-5 py-3 text-white shadow-[0_5px_0_#4a079d] hover:-translate-y-0.5 active:translate-y-1 active:shadow-none",
        outline: "border-2 border-ink/15 bg-surface px-5 py-3 text-ink hover:border-secondary/50",
        ghost: "px-4 py-2 text-ink hover:bg-ink/5",
      },
    },
    defaultVariants: { variant: "primary" },
  },
);

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export function Button({ asChild, className, variant, ...props }: ButtonProps) {
  const Component = asChild ? Slot : "button";
  return <Component className={cn(buttonVariants({ variant }), className)} {...props} />;
}

