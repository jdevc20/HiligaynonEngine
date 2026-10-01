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
