import type { Metadata } from "next";
import { Bree_Serif, Lora, Geist } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme/theme-provider";
import { LanguageProvider } from "@/components/i18n/language-context";
import { PageTranslator } from "@/components/i18n/page-translator";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

const breeSerif = Bree_Serif({ subsets: ["latin"], weight: "400", variable: "--font-bree-serif" });
const lora = Lora({ subsets: ["latin"], variable: "--font-lora" });

export const metadata: Metadata = {
  title: "Tcharize — Your words, in our languages",
  description: "Translate websites and apps into Yoruba, Hausa, Igbo, and Nigerian Pidgin with explainable voice AI.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning className={cn("font-sans", geist.variable)}>
      <body className={`${breeSerif.variable} ${lora.variable} font-body antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <LanguageProvider>
            <PageTranslator />
            {children}
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

