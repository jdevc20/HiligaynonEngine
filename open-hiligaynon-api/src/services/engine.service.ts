import { Prisma } from "@prisma/client";
import { prisma } from "../lib/prisma.js";
import { normalizeText } from "../utils/normalize.js";

export const searchDictionary = async (
  query: string,
  languageCode = "hil",
  limit = 25
) => {
  const normalized = normalizeText(query);

  const entries = await prisma.lexeme.findMany({
    where: {
      language: {
        is: {
          code: languageCode,
        },
      },
      OR: [
        {
          normalizedLemma: {
            contains: normalized,
          },
        },
        {
          senses: {
            some: {
              OR: [
                { definition: { contains: query, mode: "insensitive" } },
                { gloss: { contains: query, mode: "insensitive" } },
              ],
            },
          },
        },
      ],
    },
    take: Math.min(Math.max(limit, 1), 100),
    orderBy: {
      lemma: "asc",
    },
    include: {
      language: true,
      senses: true,
      outgoingTranslations: {
        include: {
          targetLexeme: {
            include: {
              language: true,
              senses: true,
            },
          },
        },
      },
      incomingTranslations: {
        include: {
          sourceLexeme: {
            include: {
              language: true,
              senses: true,
            },
          },
        },
      },
    },
  });

  return {
    query,
    language: languageCode,
    count: entries.length,
    items: entries,
  };
};

export const getTextAnalysis = async (id: string) => {
  return prisma.textUnit.findUnique({
    where: { id },
    include: {
      language: true,
      annotation: true,
      tokens: {
        orderBy: {
          tokenOrder: "asc",
        },
        include: {
          lexeme: {
            include: {
              senses: true,
            },
          },
        },
      },
      grammarAnnotations: {
        orderBy: {
          createdAt: "asc",
        },
      },
      sources: {
        include: {
          source: true,
        },
      },
      sourceTranslations: {
        include: {
          targetText: {
            include: {
              language: true,
            },
          },
        },
      },
      targetTranslations: {
        include: {
          sourceText: {
            include: {
              language: true,
            },
          },
        },
      },
    },
  });
};

export const exportDataset = async (
  datasetId: string,
  split?: string
) => {
  const dataset = await prisma.dataset.findUnique({
    where: { id: datasetId },
  });

  if (!dataset) return null;

  const where: Prisma.DatasetItemWhereInput = {
    datasetId,
    ...(split ? { split } : {}),
  };

  const items = await prisma.datasetItem.findMany({
    where,
    orderBy: {
      createdAt: "asc",
    },
    include: {
      translation: {
        include: {
          sourceText: {
            include: {
              language: true,
              annotation: true,
            },
          },
          targetText: {
            include: {
              language: true,
              annotation: true,
              tokens: {
                orderBy: {
                  tokenOrder: "asc",
                },
                include: {
                  lexeme: true,
                },
              },
              grammarAnnotations: true,
            },
          },
          sources: {
            include: {
              source: true,
            },
          },
        },
      },
    },
  });

  return {
    dataset: {
      id: dataset.id,
      name: dataset.name,
      version: dataset.version,
      description: dataset.description,
      license: dataset.license,
    },
    split: split ?? "all",
    count: items.length,
    items: items.map((item) => ({
      id: item.id,
      split: item.split,
      weight: item.weight,
      labels: item.labels,
      translationId: item.translationId,
      source: {
        language: item.translation.sourceText.language.code,
        text: item.translation.sourceText.text,
        annotation: item.translation.sourceText.annotation,
      },
      target: {
        language: item.translation.targetText.language.code,
        text: item.translation.targetText.text,
        annotation: item.translation.targetText.annotation,
        tokens: item.translation.targetText.tokens,
        grammar: item.translation.targetText.grammarAnnotations,
      },
      translationType: item.translation.translationType,
      confidence: item.translation.confidence,
      status: item.translation.status,
      provenance: item.translation.sources.map((link) => link.source),
    })),
  };
};


export interface GenerateDatasetInput {
  name: string;
  version: string;
  description?: string | null;
  license?: string | null;
  domain?: string;
  register?: string;
  minConfidence?: number;
  maxItems: number;
  excludeSarcastic: boolean;
  requireProvenance: boolean;
  trainPercent: number;
  validationPercent: number;
  testPercent: number;
  generatedByIdentityId: string;
}

export const generateDataset = async (input: GenerateDatasetInput) => {
  const targetAnnotationFilter: Prisma.LinguisticAnnotationWhereInput = {};

  if (input.domain) {
    targetAnnotationFilter.domain = input.domain;
  }

  if (input.register) {
    targetAnnotationFilter.register = input.register;
  }

  if (input.excludeSarcastic) {
    targetAnnotationFilter.isSarcastic = false;
  }

  const targetTextFilter: Prisma.TextUnitWhereInput = {
    language: {
      is: {
        code: "hil",
      },
    },
  };

  if (Object.keys(targetAnnotationFilter).length > 0) {
    targetTextFilter.annotation = {
      is: targetAnnotationFilter,
    };
  }

  const eligibleTranslations = await prisma.translation.findMany({
    where: {
      status: "verified",
      sourceText: {
        is: {
          language: {
            is: {
              code: "en",
            },
          },
        },
      },
      targetText: {
        is: targetTextFilter,
      },
      ...(input.minConfidence !== undefined
        ? {
            confidence: {
              gte: input.minConfidence,
            },
          }
        : {}),
      ...(input.requireProvenance
        ? {
            sources: {
              some: {},
            },
          }
        : {}),
    },
    select: {
      id: true,
    },
    orderBy: {
      id: "asc",
    },
    take: input.maxItems,
  });

  if (eligibleTranslations.length === 0) {
    return null;
  }

  const total = eligibleTranslations.length;
  const splitForIndex = (index: number) => {
    const percentile = ((index + 0.5) / total) * 100;

    if (percentile <= input.trainPercent) {
      return "train";
    }

    if (percentile <= input.trainPercent + input.validationPercent) {
      return "validation";
    }

    return "test";
  };

  const itemData = eligibleTranslations.map((translation, index) => ({
    translationId: translation.id,
    split: splitForIndex(index),
    weight: 1,
  }));

  const splitCounts = itemData.reduce(
    (counts, item) => {
      counts[item.split as keyof typeof counts] += 1;
      return counts;
    },
    {
      train: 0,
      validation: 0,
      test: 0,
    }
  );

  const generationConfig = {
    status: "verified",
    sourceLanguage: "en",
    targetLanguage: "hil",
    domain: input.domain ?? null,
    register: input.register ?? null,
    minConfidence: input.minConfidence ?? null,
    maxItems: input.maxItems,
    excludeSarcastic: input.excludeSarcastic,
    requireProvenance: input.requireProvenance,
    splits: {
      train: input.trainPercent,
      validation: input.validationPercent,
      test: input.testPercent,
    },
  };

  const dataset = await prisma.$transaction(async (tx) => {
    const created = await tx.dataset.create({
      data: {
        name: input.name,
        version: input.version,
        description: input.description ?? null,
        license: input.license ?? null,
        generationConfig,
        generatedByIdentityId: input.generatedByIdentityId,
        generatedAt: new Date(),
      },
    });

    await tx.datasetItem.createMany({
      data: itemData.map((item) => ({
        datasetId: created.id,
        translationId: item.translationId,
        split: item.split,
        weight: item.weight,
      })),
    });

    return created;
  });

  return {
    dataset: {
      id: dataset.id,
      name: dataset.name,
      version: dataset.version,
      description: dataset.description,
      license: dataset.license,
      generatedByIdentityId: dataset.generatedByIdentityId,
      generatedAt: dataset.generatedAt,
      generationConfig: dataset.generationConfig,
    },
    count: total,
    splits: splitCounts,
  };
};
