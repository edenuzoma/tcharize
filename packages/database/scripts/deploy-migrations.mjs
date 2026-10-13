import { spawnSync } from "node:child_process";

const schema = "prisma/schema.prisma";
const recoverableMigration = "20261012120000_verified_signup";
const pnpm = process.platform === "win32" ? "pnpm.cmd" : "pnpm";

function runPrisma(args) {
  const result = spawnSync(pnpm, ["exec", "prisma", ...args], {
    cwd: process.cwd(),
    encoding: "utf8",
    env: process.env,
  });

  if (result.stdout) process.stdout.write(result.stdout);
  if (result.stderr) process.stderr.write(result.stderr);
  return result;
}

let deploy = runPrisma(["migrate", "deploy", "--schema", schema]);
if (deploy.status === 0) process.exit(0);

const output = `${deploy.stdout ?? ""}\n${deploy.stderr ?? ""}`;
const canRecover = output.includes("P3009") && output.includes(recoverableMigration);
if (!canRecover) process.exit(deploy.status ?? 1);

process.stderr.write("Recovering the known failed initial migration, then retrying once.\n");
const resolved = runPrisma([
  "migrate",
  "resolve",
  "--rolled-back",
  recoverableMigration,
  "--schema",
  schema,
]);
if (resolved.status !== 0) process.exit(resolved.status ?? 1);

deploy = runPrisma(["migrate", "deploy", "--schema", schema]);
process.exit(deploy.status ?? 1);
