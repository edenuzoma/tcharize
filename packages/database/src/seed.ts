import { PrismaClient } from "@prisma/client";
import { createHash } from "node:crypto";

const prisma = new PrismaClient();

function hashPassword(password: string): string {
  return createHash("sha256").update(password).digest("hex");
}

async function main() {
  const email = "9jakartltd@gmail.com";
  const password = "vS28jc7YjSr9mc2";
  const passwordHash = hashPassword(password);

  console.log(`Ensuring account for ${email}...`);

  const user = await prisma.user.upsert({
    where: { email },
    update: {
      displayName: "9ja",
      passwordHash,
    },
    create: {
      email,
      displayName: "9ja",
      passwordHash,
    },
  });

  console.log(`User created or updated: ${user.id}`);

  // Find or create organization
  const org = await prisma.organization.upsert({
    where: { slug: "9ja-workspace" },
    update: {
      name: "9ja Workspace",
    },
    create: {
      id: "org_AK034DqDDV6h38tCTjpb",
      name: "9ja Workspace",
      slug: "9ja-workspace",
    },
  });

  // Ensure membership
  await prisma.membership.upsert({
    where: {
      userId_organizationId: {
        userId: user.id,
        organizationId: org.id,
      },
    },
    update: { role: "OWNER" },
    create: {
      userId: user.id,
      organizationId: org.id,
      role: "OWNER",
    },
  });

  // Ensure default project
  await prisma.project.upsert({
    where: {
      organizationId_slug: {
        organizationId: org.id,
        slug: "default-project",
      },
    },
    update: { name: "Default Localization Project" },
    create: {
      organizationId: org.id,
      name: "Default Localization Project",
      slug: "default-project",
      sourceLanguage: "en",
    },
  });

  // Ensure active subscription with plenty of word credits
  await prisma.subscription.upsert({
    where: { organizationId: org.id },
    update: {
      plan: "BUILDER",
      status: "ACTIVE",
      wordLimit: 250000,
      wordsUsed: 3420,
    },
    create: {
      organizationId: org.id,
      plan: "BUILDER",
      status: "ACTIVE",
      wordLimit: 250000,
      wordsUsed: 3420,
      currentPeriodEnd: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
    },
  });

  console.log(`Setup complete for 9jakartltd@gmail.com with organization ${org.slug}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
