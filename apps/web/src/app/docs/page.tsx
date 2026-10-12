import { Braces, Chrome, Headphones, Languages, BookA, ShieldCheck } from "lucide-react";
import { Card } from "@tcharize/ui";
import { PageShell } from "@/components/marketing/page-shell";
import { DocsSearch } from "@/components/docs/docs-search";

const docs = [
  {
    id: "overview",
    Icon: Languages,
    title: "Overview",
    description: "Tcharize localizes product text and websites for Nigerian languages: Hausa, Igbo, Yoruba, and Nigerian Pidgin. We preserve brand voice and formatting.",
  },
  {
    id: "api",
    Icon: Braces,
    title: "Translate API",
    description: "Send single strings or batches to our localization endpoints. Receive culturally accurate translations with plain-language explanations.",
  },
  {
    id: "extension",
    Icon: Chrome,
    title: "Browser Extension",
    description: "Translate live web pages non-destructively. Passwords, inputs, and code are automatically ignored, and any page can be restored with one click.",
  },
  {
    id: "voice",
    Icon: Headphones,
    title: "Voice Studio",
    description: "Hear translations with a language-specific research voice for Yoruba, Igbo, Hausa, and Nigerian Pidgin.",
  },
  {
    id: "glossary",
    Icon: BookA,
    title: "Brand Glossary",
    description: "Protect terms that should never be translated, such as company names, currencies, and technical jargon.",
  },
  {
    id: "security",
    Icon: ShieldCheck,
    title: "Security & Keys",
    description: "Hashed API keys, Brevo OTP authentication, and integer kobo pricing via Paystack maintain security and data integrity.",
  },
];

export default function DocsPage() {
  return (
    <PageShell
      eyebrow="Documentation"
      title="Build for people, not language codes."
      intro="Small examples, plain words, and clear errors help every developer ship safely."
    >
      <DocsSearch />

      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {docs.map(({ id, Icon, title, description }) => (
          <Card
            id={id}
            key={id}
            className="border-2 border-ink/10 p-7 transition hover:border-secondary hover:shadow-[6px_6px_0_#9eff1f]"
          >
            <div className="inline-flex rounded-xl bg-secondary/10 p-3 text-secondary">
              <Icon size={24} />
            </div>
            <h2 className="mt-5 font-display text-2xl">{title}</h2>
            <p className="mt-2 text-sm leading-6 text-ink/70">{description}</p>
          </Card>
        ))}
      </div>

      <div className="mt-12 space-y-6">
        <div>
          <h3 className="font-display text-2xl">Quick Example: Translate a String</h3>
          <p className="mt-1 text-sm text-ink/60">
            Make a POST request to translate text from English into Yoruba with an explanation:
          </p>
        </div>
        <pre
          id="api-example"
          className="overflow-x-auto rounded-[2rem] bg-[#1d1427] p-7 font-mono text-sm leading-7 text-white"
        >
          <code>{`POST /api/v1/localization/translate
Content-Type: application/json
Authorization: Bearer tch_live_your_key_here

{
  "text": "Welcome to our platform",
  "sourceLanguage": "en",
  "targetLanguage": "yo",
  "explain": true
}

// Response:
{
  "translation": "Ẹ káàbọ̀ sí orí pẹpẹ wa",
  "explanation": "Culturally warm greeting welcoming visitors to your service.",
  "provider": "n-atlas",
  "model": "NCAIR1/N-ATLaS"
}`}</code>
        </pre>
      </div>
    </PageShell>
  );
}
