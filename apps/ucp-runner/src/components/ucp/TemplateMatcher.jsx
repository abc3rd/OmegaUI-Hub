// Simple fuzzy template matching using token-based similarity

export const tokenize = (text) => {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(t => t.length > 2);
};

export const calculateSimilarity = (query, template) => {
  const queryTokens = tokenize(query);
  const targetText = `${template.name} ${template.intent} ${template.embeddingHint || ''}`;
  const targetTokens = tokenize(targetText);
  
  if (queryTokens.length === 0 || targetTokens.length === 0) return 0;

  // Count matching tokens
  const targetSet = new Set(targetTokens);
  let matches = 0;
  
  for (const qToken of queryTokens) {
    // Check exact match
    if (targetSet.has(qToken)) {
      matches += 1;
    } else {
      // Check partial match
      for (const tToken of targetTokens) {
        if (tToken.includes(qToken) || qToken.includes(tToken)) {
          matches += 0.5;
          break;
        }
      }
    }
  }

  // Jaccard-like score
  const union = new Set([...queryTokens, ...targetTokens]).size;
  const score = (matches / union) * 100;
  
  return Math.min(100, Math.round(score));
};

export const findMatchingTemplates = (query, templates, minScore = 10) => {
  const results = templates.map(template => ({
    template,
    score: calculateSimilarity(query, template)
  }));

  return results
    .filter(r => r.score >= minScore)
    .sort((a, b) => b.score - a.score);
};

export default { tokenize, calculateSimilarity, findMatchingTemplates };