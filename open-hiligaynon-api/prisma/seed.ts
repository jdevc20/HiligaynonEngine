import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const normalizeText = (text: string) =>
  text
    .normalize("NFC")
    .toLocaleLowerCase()
    .trim()
    .replace(/[.,/#!$%^&*;:{}=_`~()\[\]?"“”]/g, "")
    .replace(/\s+/g, " ");

const samples = [
  {
    english: "Good morning.",
    hiligaynon: "Maayong aga.",
    sentiment: 2,
    intent: "greeting",
    domain: "daily_life",
  },
  {
    english: "Good afternoon.",
    hiligaynon: "Maayong hapon.",
    sentiment: 2,
    intent: "greeting",
    domain: "daily_life",
  },
  {
    english: "Thank you very much.",
    hiligaynon: "Salamat gid.",
    sentiment: 2,
    intent: "gratitude",
    domain: "daily_life",
  },
  {
    english: "How are you?",
    hiligaynon: "Kamusta ka?",
    sentiment: 1,
    intent: "greeting_question",
    domain: "daily_life",
  },
  {
    english: "Where are you going?",
    hiligaynon: "Diin ka makadto?",
    sentiment: 1,
    intent: "location_question",
    domain: "daily_life",
  },
  {
    english: "I am going home.",
    hiligaynon: "Makadto ako sa balay.",
    sentiment: 1,
    intent: "movement_statement",
    domain: "daily_life",
  },
  {
    english: "I don't know.",
    hiligaynon: "Wala ako kabalo.",
    sentiment: 1,
    intent: "knowledge_denial",
    domain: "daily_life",
  },
  {
    english: "Let's eat first.",
    hiligaynon: "Kaon kita anay.",
    sentiment: 2,
    intent: "invitation",
    domain: "food",
  },
  {
    english: "This is very nice.",
    hiligaynon: "Nami gid ini.",
    sentiment: 2,
    intent: "positive_opinion",
    domain: "daily_life",
  },
  {
    english: "I don't like this.",
    hiligaynon: "Indi ko gusto sini.",
    sentiment: 0,
    intent: "negative_opinion",
    domain: "daily_life",
  },
] as const;

const dictionary = [
  { lemma: "aga", pos: "noun", definition: "The morning or early part of the day.", gloss: "morning" },
  { lemma: "anay", pos: "particle", definition: "Marks doing something first or for the moment.", gloss: "first / for a while" },
  { lemma: "balay", pos: "noun", definition: "A house or home.", gloss: "house / home" },
  { lemma: "diin", pos: "interrogative", definition: "Interrogative word asking about place or location.", gloss: "where" },
  { lemma: "gid", pos: "particle", definition: "An emphatic particle that strengthens the preceding idea.", gloss: "really / indeed / very" },
  { lemma: "indi", pos: "negator", definition: "A negative marker used for no, not, or negation.", gloss: "no / not" },
  { lemma: "kaon", pos: "verb", definition: "To eat or consume food.", gloss: "eat" },
  { lemma: "makadto", pos: "verb", definition: "To go or be going toward a destination.", gloss: "go / will go" },
  { lemma: "nami", pos: "adjective", definition: "Describes something as good, pleasant, nice, or appealing.", gloss: "nice / good" },
  { lemma: "salamat", pos: "expression", definition: "An expression of thanks or gratitude.", gloss: "thank you" },
];

async function getTextUnit(languageId: string, text: string) {
  const normalizedText = normalizeText(text);

  return prisma.textUnit.upsert({
    where: {
      languageId_normalizedText_unitType: {
        languageId,
        normalizedText,
        unitType: "sentence",
      },
    },
    update: { text },
    create: {
      languageId,
      text,
      normalizedText,
      unitType: "sentence",
    },
  });
}

async function main() {
  const english = await prisma.language.upsert({
    where: { code: "en" },
    update: {},
    create: {
      code: "en",
      name: "English",
      nativeName: "English",
    },
  });

  const hiligaynon = await prisma.language.upsert({
    where: { code: "hil" },
    update: {},
    create: {
      code: "hil",
      name: "Hiligaynon",
      nativeName: "Hiligaynon",
    },
  });

  const source = await prisma.sourceRecord.upsert({
    where: { id: "sample-source-v1" },
    update: {},
    create: {
      id: "sample-source-v1",
      title: "Open Hiligaynon Engine sample corpus",
      sourceType: "synthetic-sample",
      citation: "Seed data for local development and schema validation.",
    },
  });

  const dataset = await prisma.dataset.upsert({
    where: { id: "sample-dataset-v1" },
    update: {},
    create: {
      id: "sample-dataset-v1",
      name: "Open Hiligaynon Sample",
      version: "1.0",
      description: "Small development dataset for translation, annotation, dictionary, and export testing.",
    },
  });

  const lexemeByNormalized = new Map<string, string>();

  for (const entry of dictionary) {
    const lexeme = await prisma.lexeme.upsert({
      where: {
        languageId_normalizedLemma: {
          languageId: hiligaynon.id,
          normalizedLemma: normalizeText(entry.lemma),
        },
      },
      update: {
        lemma: entry.lemma,
        partOfSpeech: entry.pos,
      },
      create: {
        languageId: hiligaynon.id,
        lemma: entry.lemma,
        normalizedLemma: normalizeText(entry.lemma),
        partOfSpeech: entry.pos,
      },
    });

    lexemeByNormalized.set(lexeme.normalizedLemma, lexeme.id);

    const existingSense = await prisma.lexemeSense.findFirst({
      where: {
        lexemeId: lexeme.id,
        definition: entry.definition,
      },
    });

    if (!existingSense) {
      await prisma.lexemeSense.create({
        data: {
          lexemeId: lexeme.id,
          definition: entry.definition,
          gloss: entry.gloss,
        },
      });
    }
  }

  for (const [index, sample] of samples.entries()) {
    const sourceText = await getTextUnit(english.id, sample.english);
    const targetText = await getTextUnit(hiligaynon.id, sample.hiligaynon);

    await prisma.linguisticAnnotation.upsert({
      where: { textUnitId: targetText.id },
      update: {
        sentiment: sample.sentiment,
        intent: sample.intent,
        domain: sample.domain,
        isSarcastic: false,
      },
      create: {
        textUnitId: targetText.id,
        sentiment: sample.sentiment,
        intent: sample.intent,
        domain: sample.domain,
        isSarcastic: false,
      },
    });

    const translation = await prisma.translation.upsert({
      where: {
        sourceTextId_targetTextId: {
          sourceTextId: sourceText.id,
          targetTextId: targetText.id,
        },
      },
      update: {
        status: "verified",
        translationType: "natural",
      },
      create: {
        sourceTextId: sourceText.id,
        targetTextId: targetText.id,
        status: "verified",
        translationType: "natural",
      },
    });

    await prisma.translationSource.upsert({
      where: {
        translationId_sourceId: {
          translationId: translation.id,
          sourceId: source.id,
        },
      },
      update: {},
      create: {
        translationId: translation.id,
        sourceId: source.id,
      },
    });

    const split = index < 8 ? "train" : index === 8 ? "validation" : "test";

    await prisma.datasetItem.upsert({
      where: {
        datasetId_translationId: {
          datasetId: dataset.id,
          translationId: translation.id,
        },
      },
      update: { split },
      create: {
        datasetId: dataset.id,
        translationId: translation.id,
        split,
      },
    });

    const rawTokens = sample.hiligaynon.split(/\s+/);

    for (const [tokenOrder, tokenText] of rawTokens.entries()) {
      const normalized = normalizeText(tokenText);
      const lexemeId = lexemeByNormalized.get(normalized);

      await prisma.tokenAnnotation.upsert({
        where: {
          textUnitId_tokenOrder: {
            textUnitId: targetText.id,
            tokenOrder,
          },
        },
        update: {
          text: tokenText,
          normalized,
          lexemeId,
        },
        create: {
          textUnitId: targetText.id,
          tokenOrder,
          text: tokenText,
          normalized,
          lexemeId,
        },
      });
    }
  }

  console.log("Seeded normalized Hiligaynon linguistic sample data.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
