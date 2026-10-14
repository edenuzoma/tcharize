export interface AuthEmail {
  subject: string;
  html: string;
  text: string;
  senderName: string;
}

type OtpPurpose = "SIGNUP" | "PASSWORD_RESET";

const purple = "#801fff";
const lime = "#9eff1f";
const ink = "#1d1427";
const mist = "#f6f1fb";

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function shell(preheader: string, content: string) {
  return `<!doctype html>
<html lang="en">
  <head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
  <body style="margin:0;background:${mist};color:${ink};font-family:Georgia,'Times New Roman',serif">
    <div style="display:none;max-height:0;overflow:hidden;opacity:0">${escapeHtml(preheader)}</div>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:${mist};padding:28px 12px">
      <tr><td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px;background:#ffffff;border:1px solid #e6dcef;border-radius:24px;overflow:hidden;box-shadow:0 8px 0 #d9c5ec">
          <tr><td style="padding:24px 28px;background:${ink}">
            <div style="font-family:Georgia,'Times New Roman',serif;font-size:27px;font-weight:700;color:#ffffff">tcharize<span style="color:${lime}">.</span></div>
            <div style="margin-top:4px;font:600 12px Arial,sans-serif;letter-spacing:.08em;color:#d7cce0">YOUR WORDS, IN OUR LANGUAGES</div>
          </td></tr>
          <tr><td style="padding:32px 28px">${content}</td></tr>
          <tr><td style="padding:20px 28px;background:#faf7fc;border-top:1px solid #eee5f4;font:14px/1.6 Arial,sans-serif;color:#6c6174">
            Tcharize helps people and teams translate websites, apps, documents, and product words for Nigeria.
          </td></tr>
        </table>
      </td></tr>
    </table>
  </body>
</html>`;
}

export function renderOtpEmail(code: string, purpose: OtpPurpose): AuthEmail {
  const signup = purpose === "SIGNUP";
  const title = signup ? "Finish making your account" : "Reset your password";
  const instruction = signup
    ? "Use this code to verify your email and finish signing up."
    : "Use this code to choose a new password.";
  const subject = signup ? "Your Tcharize sign-up code" : "Your Tcharize password reset code";
  const text = `${title}\n\n${instruction}\n\nYour code: ${code}\n\nThis code ends in 10 minutes. Do not share it. If you did not ask for this, you can ignore this email.`;
  const html = shell(subject, `
    <p style="margin:0 0 8px;font:700 13px Arial,sans-serif;letter-spacing:.12em;text-transform:uppercase;color:${purple}">${signup ? "Welcome" : "Password help"}</p>
    <h1 style="margin:0 0 14px;font-size:34px;line-height:1.15;color:${ink}">${title}</h1>
    <p style="margin:0 0 24px;font:17px/1.65 Arial,sans-serif;color:#564b5e">${instruction}</p>
    <div style="padding:20px;border:2px solid ${ink};border-radius:18px;background:${lime};text-align:center;box-shadow:0 5px 0 ${ink}">
      <div style="font:800 34px/1 Arial,sans-serif;letter-spacing:8px;color:${ink}">${escapeHtml(code)}</div>
    </div>
    <p style="margin:24px 0 0;font:14px/1.6 Arial,sans-serif;color:#6c6174">This code ends in 10 minutes. Do not share it. If you did not ask for this, you can ignore this email.</p>
  `);
  return { subject, html, text, senderName: "Tcharize" };
}

export function renderWelcomeEmail(displayName: string, webOrigin: string): AuthEmail {
  const safeName = escapeHtml(displayName.trim() || "there");
  const appUrl = `${webOrigin.replace(/\/$/, "")}/dashboard`;
  const subject = "Welcome to Tcharize";
  const text = `Hi ${displayName.trim() || "there"},\n\nI am Eden Uzoma, the creator of Tcharize (say “Teacher Rise”). Tcharize helps you translate and understand websites, apps, documents, and product words in Nigerian languages.\n\nStart here:\n1. Open your workspace.\n2. Add a project.\n3. Pick a language and translate your first words.\n4. Create an API key when you want to connect your product.\n\nOpen Tcharize: ${appUrl}\nLinkedIn: https://linkedin.com/in/edenuzoma\nTwitter: https://twitter.com/edenuzoma\n\nEden Uzoma\nCreator of Tcharize`;
  const html = shell(subject, `
    <p style="margin:0 0 8px;font:700 13px Arial,sans-serif;letter-spacing:.12em;text-transform:uppercase;color:${purple}">You are in</p>
    <h1 style="margin:0 0 14px;font-size:34px;line-height:1.15;color:${ink}">Welcome, ${safeName}.</h1>
    <p style="margin:0 0 18px;font:17px/1.65 Arial,sans-serif;color:#564b5e">I am <strong>Eden Uzoma</strong>, the creator of Tcharize—pronounced <strong>“Teacher Rise.”</strong></p>
    <p style="margin:0 0 24px;font:17px/1.65 Arial,sans-serif;color:#564b5e">Tcharize helps you translate and understand websites, apps, documents, and product words in Nigerian languages.</p>
    <div style="padding:20px;border-radius:18px;background:${mist}">
      <p style="margin:0 0 12px;font:700 17px Arial,sans-serif;color:${ink}">Start in four small steps</p>
      <ol style="margin:0;padding-left:22px;font:15px/1.9 Arial,sans-serif;color:#564b5e">
        <li>Open your workspace.</li><li>Add a project.</li><li>Pick a language and translate your first words.</li><li>Create an API key when you want to connect your product.</li>
      </ol>
    </div>
    <p style="margin:28px 0"><a href="${escapeHtml(appUrl)}" style="display:inline-block;padding:14px 22px;border-radius:999px;background:${lime};box-shadow:0 4px 0 #4e8f00;color:${ink};font:700 16px Arial,sans-serif;text-decoration:none">Open your workspace →</a></p>
    <p style="margin:0;font:16px/1.6 Arial,sans-serif;color:#564b5e">Need help? Reply to this email.</p>
    <p style="margin:22px 0 0;font:16px/1.6 Arial,sans-serif;color:${ink}"><strong>Eden Uzoma</strong><br><span style="color:#6c6174">Creator of Tcharize</span></p>
    <p style="margin:18px 0 0;font:14px Arial,sans-serif"><a href="https://linkedin.com/in/edenuzoma" style="color:${purple};font-weight:700">LinkedIn</a>&nbsp;&nbsp;·&nbsp;&nbsp;<a href="https://twitter.com/edenuzoma" style="color:${purple};font-weight:700">Twitter</a></p>
  `);
  return { subject, html, text, senderName: "Eden Uzoma at Tcharize" };
}
