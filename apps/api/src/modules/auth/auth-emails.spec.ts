import { renderOtpEmail, renderWelcomeEmail } from "./auth-emails";

describe("auth email templates", () => {
  it("renders a clear sign-up code email", () => {
    const email = renderOtpEmail("123456", "SIGNUP");
    expect(email.subject).toContain("sign-up code");
    expect(email.html).toContain("123456");
    expect(email.text).toContain("10 minutes");
  });

  it("renders a distinct password reset email", () => {
    const email = renderOtpEmail("654321", "PASSWORD_RESET");
    expect(email.subject).toContain("password reset");
    expect(email.html).toContain("choose a new password");
  });

  it("escapes names and includes the founder and project lead details", () => {
    const email = renderWelcomeEmail("<Victoria>", "https://tcharize.up.railway.app/");
    expect(email.html).toContain("&lt;Victoria&gt;");
    expect(email.html).not.toContain("Welcome, <Victoria>");
    expect(email.html).toContain("Victoria Luke");
    expect(email.html).toContain("Teacher Rise");
    expect(email.html).toContain("Founder &amp; Project Lead, Tcharize");
    expect(email.html).toContain("victorialuke54@gmail.com");
    expect(email.text).toContain("Victoria Luke");
    expect(email.text).toContain("Founder & Project Lead, Tcharize");
    expect(email.senderName).toBe("Victoria Luke at Tcharize");
    expect(email.html).not.toContain("Eden Uzoma");
    expect(email.html).toContain("https://tcharize.up.railway.app/login");
    expect(email.html).not.toContain("https://tcharize.up.railway.app/dashboard");
  });
});
