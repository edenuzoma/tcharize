import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
  NotFoundException,
} from "@nestjs/common";
import {
  batchTranslateRequestSchema,
  glossaryEntrySchema,
  translateRequestSchema,
  type BatchTranslateResponse,
  type TranslateResponse,
} from "@tcharize/contracts";
import { DatabaseService } from "../../infrastructure/database/database.service";
import { NatlasAdapter } from "./adapters/natlas.adapter";

@Injectable()
export class LocalizationService {
  private readonly logger = new Logger(LocalizationService.name);

  constructor(
    private readonly natlas: NatlasAdapter,
    private readonly db: DatabaseService,
  ) {}

  async translatePage(
    texts: string[],
    targetLanguage: string,
    organizationId?: string,
    mode: "fast" | "quality" = "quality",
  ) {
    const wordCount = texts.reduce((total, text) => total + countWords(text), 0);
    const subscription = organizationId
      ? await this.getActiveSubscription(organizationId, wordCount)
      : undefined;
    const translations = await this.natlas.translatePage(texts, targetLanguage, mode);
    if (organizationId && subscription) {
      await this.chargeUsage(organizationId, subscription.wordLimit, wordCount);
    }
    return translations;
  }

  async chargeExternalUsage(organizationId: string, texts: string[]) {
    const wordCount = texts.reduce((total, text) => total + countWords(text), 0);
    const subscription = await this.getActiveSubscription(organizationId, wordCount);
    await this.chargeUsage(organizationId, subscription.wordLimit, wordCount);
  }

  async translate(input: unknown, organizationId?: string): Promise<TranslateResponse> {
    const parsed = translateRequestSchema.safeParse(input);
    if (!parsed.success) {
      throw new BadRequestException(
        parsed.error.issues.map((issue) => issue.message).join(" "),
      );
    }

    const { text, sourceLanguage, targetLanguage, explain, projectId } = parsed.data;
    const wordCount = countWords(text);
    let chargeLimit: number | undefined;

    if (organizationId) {
      const subscription = await this.db.subscription.findUnique({ where: { organizationId } });
      if (!subscription || subscription.status !== "ACTIVE" || subscription.currentPeriodEnd <= new Date()) {
        throw new HttpException("Your plan is not active. Open billing to continue.", HttpStatus.PAYMENT_REQUIRED);
      }
      if (subscription.wordsUsed + wordCount > subscription.wordLimit) {
        throw new HttpException("Your word limit is used up. Choose a new plan to continue.", HttpStatus.PAYMENT_REQUIRED);
      }
      chargeLimit = subscription.wordLimit;
    }

    // Check project glossary if a projectId is provided
    let textToTranslate = text;
    if (projectId) {
      const glossaries = await this.db.glossaryEntry.findMany({
        where: { projectId, sourceLanguage, targetLanguage },
      });
      for (const entry of glossaries) {
        const regex = new RegExp(`\\b${escapeRegExp(entry.sourceTerm)}\\b`, "gi");
        textToTranslate = textToTranslate.replace(regex, entry.targetTerm);
      }
    }

    const result = await this.natlas.translate({
      text: textToTranslate,
      sourceLanguage,
      targetLanguage,
      explain,
      projectId,
    });

    if (organizationId && chargeLimit !== undefined) {
      const charged = await this.db.subscription.updateMany({
        where: {
          organizationId,
          status: "ACTIVE",
          wordsUsed: { lte: Math.max(0, chargeLimit - wordCount) },
        },
        data: { wordsUsed: { increment: wordCount } },
      });
      if (charged.count !== 1) {
        throw new HttpException("Your word limit is used up. Choose a new plan to continue.", HttpStatus.PAYMENT_REQUIRED);
      }
    }

    // Persist translation job in PostgreSQL
    try {
      await this.db.translationJob.create({
        data: {
          projectId: projectId ?? null,
          sourceLanguage,
          targetLanguage,
          sourceText: text,
          translatedText: result.translation,
          explanation: result.explanation ?? null,
          provider: result.provider,
          model: result.model,
          status: "COMPLETED",
          qualityScore: null,
        },
      });
    } catch (err) {
      this.logger.warn(`Could not persist translation job: ${err instanceof Error ? err.message : String(err)}`);
    }

    return result;
  }

  async batchTranslate(input: unknown, organizationId: string): Promise<BatchTranslateResponse> {
    const parsed = batchTranslateRequestSchema.safeParse(input);
    if (!parsed.success) {
      throw new BadRequestException(
        parsed.error.issues.map((issue) => issue.message).join(" "),
      );
    }

    const { texts, sourceLanguage, targetLanguage, explain, projectId } = parsed.data;
    const wordCount = texts.reduce((total, text) => total + countWords(text), 0);
    const subscription = await this.db.subscription.findUnique({ where: { organizationId } });
    if (!subscription || subscription.status !== "ACTIVE" || subscription.currentPeriodEnd <= new Date()) {
      throw new HttpException("Your plan is not active. Open billing to continue.", HttpStatus.PAYMENT_REQUIRED);
    }
    if (subscription.wordsUsed + wordCount > subscription.wordLimit) {
      throw new HttpException("Your word limit is used up. Choose a new plan to continue.", HttpStatus.PAYMENT_REQUIRED);
    }

    // Fetch project glossary
    const glossaries = projectId
      ? await this.db.glossaryEntry.findMany({
          where: { projectId, sourceLanguage, targetLanguage },
        })
      : [];

    const translations: TranslateResponse[] = [];

    // Translate each text item (in parallel batches of 5)
    for (let i = 0; i < texts.length; i += 5) {
      const chunk = texts.slice(i, i + 5);
      const chunkResults = await Promise.all(
        chunk.map(async (rawText) => {
          let prepared = rawText;
          for (const g of glossaries) {
            const regex = new RegExp(`\\b${escapeRegExp(g.sourceTerm)}\\b`, "gi");
            prepared = prepared.replace(regex, g.targetTerm);
          }
          return this.natlas.translate({
            text: prepared,
            sourceLanguage,
            targetLanguage,
            explain,
            projectId,
          });
        }),
      );

      // Persist jobs
      for (let j = 0; j < chunk.length; j++) {
        const itemResult = chunkResults[j];
        const rawSource = chunk[j];
        if (!itemResult || !rawSource) continue;

        translations.push(itemResult);

        try {
          await this.db.translationJob.create({
            data: {
              projectId: projectId ?? null,
              sourceLanguage,
              targetLanguage,
              sourceText: rawSource,
              translatedText: itemResult.translation,
              explanation: itemResult.explanation ?? null,
              provider: itemResult.provider,
              model: itemResult.model,
              status: "COMPLETED",
              qualityScore: null,
            },
          });
        } catch (err) {
          this.logger.warn(`Failed persisting batch job: ${err instanceof Error ? err.message : String(err)}`);
        }
      }
    }

    const charged = await this.db.subscription.updateMany({
      where: {
        organizationId,
        status: "ACTIVE",
        wordsUsed: { lte: Math.max(0, subscription.wordLimit - wordCount) },
      },
      data: { wordsUsed: { increment: wordCount } },
    });
    if (charged.count !== 1) {
      throw new HttpException("Your word limit is used up. Choose a new plan to continue.", HttpStatus.PAYMENT_REQUIRED);
    }

    return {
      translations,
      totalChanged: translations.length,
      targetLanguage,
    };
  }

  private async getActiveSubscription(organizationId: string, wordCount: number) {
    const subscription = await this.db.subscription.findUnique({ where: { organizationId } });
    if (!subscription || subscription.status !== "ACTIVE" || subscription.currentPeriodEnd <= new Date()) {
      throw new HttpException("Your plan is not active. Open billing to continue.", HttpStatus.PAYMENT_REQUIRED);
    }
    if (subscription.wordsUsed + wordCount > subscription.wordLimit) {
      throw new HttpException("Your word limit is used up. Choose a new plan to continue.", HttpStatus.PAYMENT_REQUIRED);
    }
    return subscription;
  }

  private async chargeUsage(organizationId: string, wordLimit: number, wordCount: number) {
    const charged = await this.db.subscription.updateMany({
      where: {
        organizationId,
        status: "ACTIVE",
        wordsUsed: { lte: Math.max(0, wordLimit - wordCount) },
      },
      data: { wordsUsed: { increment: wordCount } },
    });
    if (charged.count !== 1) {
      throw new HttpException("Your word limit is used up. Choose a new plan to continue.", HttpStatus.PAYMENT_REQUIRED);
    }
  }

  async listJobs(projectId?: string, limit = 50) {
    return this.db.translationJob.findMany({
      where: projectId ? { projectId } : undefined,
      orderBy: { createdAt: "desc" },
      take: limit,
    });
  }

  async listGlossary(projectId: string) {
    const proj = await this.db.project.findFirst({
      where: { OR: [{ id: projectId }, { slug: projectId }] },
    });
    return this.db.glossaryEntry.findMany({
      where: { projectId: proj?.id ?? projectId },
      orderBy: { sourceTerm: "asc" },
    });
  }

  async addGlossary(input: unknown) {
    const parsed = glossaryEntrySchema.safeParse(input);
    if (!parsed.success) {
      throw new BadRequestException(
        parsed.error.issues.map((i) => i.message).join(" "),
      );
    }
    const { projectId, sourceLanguage, targetLanguage, sourceTerm, targetTerm, notes } = parsed.data;

    let targetProjectId = projectId;
    const existingProj = await this.db.project.findFirst({
      where: { OR: [{ id: projectId }, { slug: projectId }] },
    });

    if (existingProj) {
      targetProjectId = existingProj.id;
    } else {
      let firstProj = await this.db.project.findFirst();
      if (!firstProj) {
        const org = await this.db.organization.create({
          data: { name: "Default Workspace", slug: "default-workspace" },
        });
        firstProj = await this.db.project.create({
          data: { name: "Default Project", slug: "default-project", organizationId: org.id },
        });
      }
      targetProjectId = firstProj.id;
    }

    return this.db.glossaryEntry.upsert({
      where: {
        projectId_sourceLanguage_targetLanguage_sourceTerm: {
          projectId: targetProjectId,
          sourceLanguage,
          targetLanguage,
          sourceTerm,
        },
      },
      update: { targetTerm, notes },
      create: {
        projectId: targetProjectId,
        sourceLanguage,
        targetLanguage,
        sourceTerm,
        targetTerm,
        notes,
      },
    });
  }

  async deleteGlossary(id: string) {
    const existing = await this.db.glossaryEntry.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException("Glossary term not found");
    return this.db.glossaryEntry.delete({ where: { id } });
  }
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function countWords(value: string) {
  return value.trim().split(/\s+/u).filter(Boolean).length;
}
