import { BadGatewayException, BadRequestException, Body, Controller, Post, Req } from "@nestjs/common";
import type { Request } from "express";
import { z } from "zod";
import { BrevoEmailService } from "../../infrastructure/email/brevo-email.service";
import { RateLimitService } from "../../infrastructure/redis/rate-limit.service";

const contactSchema = z.object({
  fullName: z.string().trim().min(2).max(100),
  email: z.string().trim().toLowerCase().email().max(254),
  company: z.string().trim().min(2).max(120),
  projectType: z.enum(["web-localization", "voice-tts", "dedicated-natlas", "browser-plugin", "glossary-consulting"]),
  budget: z.enum(["starter", "builder", "enterprise"]),
  message: z.string().trim().min(10).max(5_000),
  website: z.string().max(0).optional(),
});

const serviceNames = {
  "web-localization": "Web and app localization",
  "voice-tts": "Nigerian-language speech",
  "dedicated-natlas": "Private N-ATLaS inference",
  "browser-plugin": "Browser extension deployment",
  "glossary-consulting": "Glossary engineering",
} as const;

const budgetNames = {
  starter: "Starter: under 50,000 words each month",
  builder: "Builder: 50,000 to 500,000 words each month",
  enterprise: "Enterprise: 1,000,000+ words or a custom SLA",
} as const;

@Controller("contact")
export class ContactController {
  constructor(
    private readonly email: BrevoEmailService,
    private readonly rateLimit: RateLimitService,
  ) {}

  @Post()
  async submit(@Body() body: unknown, @Req() request: Request) {
    const parsed = contactSchema.safeParse(body);
    if (!parsed.success) throw new BadRequestException("Check the form, then try again.");

    const identity = request.ip ?? request.socket.remoteAddress ?? "unknown";
    await this.rateLimit.consume("contact", identity, 5, 60 * 60);

    const inquiry = parsed.data;
    const recipient = process.env.CONTACT_RECIPIENT_EMAIL ?? "rivetalsglobal@gmail.com";
    const service = serviceNames[inquiry.projectType];
    const budget = budgetNames[inquiry.budget];
    const sent = await this.email.send(recipient, {
      senderName: "Tcharize inquiries",
      subject: `New Tcharize inquiry: ${service}`,
      text: [
        `Name: ${inquiry.fullName}`,
        `Email: ${inquiry.email}`,
        `Company: ${inquiry.company}`,
        `Service: ${service}`,
        `Volume: ${budget}`,
        "",
        inquiry.message,
      ].join("\n"),
      html: renderInquiryEmail({
        fullName: inquiry.fullName,
        email: inquiry.email,
        company: inquiry.company,
        message: inquiry.message,
        service,
        budget,
      }),
    });

    if (!sent) throw new BadGatewayException("We could not send your message. Try again.");
    return { sent: true };
  }
}

function renderInquiryEmail(inquiry: {
  fullName: string;
  email: string;
  company: string;
  message: string;
  service: string;
  budget: string;
}) {
  const row = (label: string, value: string) => `<tr><td style="padding:8px 12px;color:#675f70">${label}</td><td style="padding:8px 12px;font-weight:700">${escapeHtml(value)}</td></tr>`;
  return `<!doctype html><html><body style="margin:0;background:#f6f2fb;color:#1d1427;font-family:Georgia,serif"><div style="max-width:640px;margin:24px auto;background:#fff;border:2px solid #801fff;border-radius:24px;overflow:hidden"><div style="padding:24px;background:#1d1427;color:#fff"><div style="color:#9eff1f;font-weight:700">Tcharize</div><h1 style="margin:8px 0 0;font-size:26px">New project inquiry</h1></div><div style="padding:20px"><table style="width:100%;border-collapse:collapse">${row("Name", inquiry.fullName)}${row("Email", inquiry.email)}${row("Company", inquiry.company)}${row("Service", inquiry.service)}${row("Volume", inquiry.budget)}</table><div style="margin-top:18px;padding:16px;border-radius:16px;background:#f6f2fb;white-space:pre-wrap">${escapeHtml(inquiry.message)}</div><p style="margin:18px 0 0"><a href="mailto:${encodeURIComponent(inquiry.email)}" style="display:inline-block;padding:12px 18px;border-radius:999px;background:#9eff1f;color:#1d1427;font-weight:700;text-decoration:none">Reply to ${escapeHtml(inquiry.fullName)}</a></p></div></div></body></html>`;
}

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" })[character] ?? character);
}
