import Image from "next/image";
import Link from "next/link";

export function BrandLogo() {
  return (
    <Link href="/" aria-label="Tcharize home" className="flex items-center gap-2.5">
      <span className="relative h-11 w-11 overflow-hidden rounded-[28%]">
        <Image src="/brand/tcharize-icon.png" fill sizes="44px" alt="" priority />
      </span>
      <span className="font-display text-3xl leading-none tracking-tight text-ink">tcharize</span>
    </Link>
  );
}

