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

  it("escapes names and includes the creator and social links", () => {
    const email = renderWelcomeEmail("<Eden>", "https://tcharize.up.railway.app/");
    expect(email.html).toContain("&lt;Eden&gt;");
    expect(email.html).not.toContain("Welcome, <Eden>");
    expect(email.html).toContain("Eden Uzoma");
    expect(email.html).toContain("Teacher Rise");
    expect(email.html).toContain("linkedin.com/in/edenuzoma");
    expect(email.html).toContain("twitter.com/edenuzoma");
    expect(email.html).toContain("https://tcharize.up.railway.app/dashboard");
  });
});
