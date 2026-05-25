import { prisma } from "../lib/prisma.js";
/**W
 * Advanced Normalization:
 * - Lowercases and trims.
 * - Strips punctuation EXCEPT hyphens and apostrophes (critical for
 *   Hiligaynon words like "adlaw-adlaw" or "wala'y").
 * - Collapses multiple spaces.
 */
const normalize = (text) => {
    return text
        .toLowerCase()
        .trim()
        .replace(/[.,/#!$%^&*;:{}=\_`~()]/g, "") // Removed ' and - from the strip list
        .replace(/\s{2,}/g, " ");
};
// 2. Explicit Return Types & Transactions
export const getAllSentences = async (params = {}) => {
    const { skip = 0, take = 50, search } = params;
    // Build a dynamic search query if a search term is provided
    const where = search
        ? {
            OR: [
                { normalizedEnglish: { contains: normalize(search) } },
                { normalizedHiligaynon: { contains: normalize(search) } }
            ]
        }
        : {};
    // 3. The $transaction pattern: Fetches data AND total count concurrently
    const [sentences, totalCount] = await prisma.$transaction([
        prisma.sentence.findMany({
            where,
            skip,
            take,
            orderBy: { createdAt: "desc" },
        }),
        prisma.sentence.count({ where }) // Required for frontend pagination!
    ]);
    return {
        items: sentences,
        meta: { total: totalCount, skip, take }
    };
};
// 4. Return types (Promise<Sentence | null>) make TypeScript strictly enforce your code
export const getSentenceById = async (id) => {
    return prisma.sentence.findUnique({
        where: { id },
        include: { tokens: true } // Usually, you want the tokens when viewing one sentence
    });
};
export const createSentence = async (data) => {
    return prisma.sentence.create({
        data: {
            english: data.english,
            hiligaynon: data.hiligaynon,
            normalizedEnglish: normalize(data.english),
            normalizedHiligaynon: normalize(data.hiligaynon)
        }
    });
};
export const deleteSentence = async (id) => {
    return prisma.sentence.delete({
        where: { id }
    });
};
