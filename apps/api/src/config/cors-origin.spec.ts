import { createCorsOriginValidator } from "./cors-origin";

function check(origin?: string) {
  return new Promise<boolean>((resolve, reject) => {
    createCorsOriginValidator("https://tcharize.up.railway.app,http://localhost:3000")(
      origin,
      (error, allowed) => error ? reject(error) : resolve(Boolean(allowed)),
    );
  });
}

describe("createCorsOriginValidator", () => {
  it("allows configured web origins", async () => {
    await expect(check("https://tcharize.up.railway.app")).resolves.toBe(true);
  });

  it("allows browser extension origins", async () => {
    await expect(check("chrome-extension://abcdefghijklmnopqrstuvwxyzabcdef")).resolves.toBe(true);
  });

  it("rejects unknown website origins", async () => {
    await expect(check("https://example.com")).rejects.toThrow("not allowed");
  });
});
