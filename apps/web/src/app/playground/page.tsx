import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { TranslationPlayground } from "@/components/translation-playground";

export default function PlaygroundPage() {
  return <main className="min-h-screen px-5 py-8 lg:px-8"><div className="mx-auto max-w-6xl"><Link href="/" className="inline-flex items-center gap-2 font-bold text-secondary"><ArrowLeft size={17} /> Back home</Link><div className="mt-12 max-w-2xl"><p className="font-bold text-secondary">Translation playground</p><h1 className="mt-2 font-display text-5xl sm:text-7xl">Say it your way.</h1><p className="mt-4 text-lg text-ink/65">Type a message. Pick a language. We will translate it and explain the choice in simple words.</p></div><TranslationPlayground /></div></main>;
}

