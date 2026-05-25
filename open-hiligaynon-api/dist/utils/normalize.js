export const normalizeText = (text) => {
    return text
        .toLowerCase()
        .replace(/\s+/g, " ")
        .trim();
};
