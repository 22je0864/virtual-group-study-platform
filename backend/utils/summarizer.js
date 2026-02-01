//backend/utils/summarizer.js
function splitSentences(text) {
  return text
    .replace(/\s+/g, " ")
    .split(/(?<=[.!?])\s+/)
    .map(s => s.trim())
    .filter(s => s.length > 30);
}

function getWordFreq(text) {
  const stop = new Set([
    "the","is","are","a","an","and","or","to","of","in","on","for","with","as","by","at",
    "this","that","it","be","was","were","from","but","not","have","has","had","you","we",
    "they","i","he","she","them","his","her","our","your","their"
  ]);

  const freq = {};
  const words = text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter(w => w && w.length > 2 && !stop.has(w));

  for (const w of words) freq[w] = (freq[w] || 0) + 1;
  return freq;
}

function scoreSentence(sentence, freq) {
  const words = sentence
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter(Boolean);

  let score = 0;
  for (const w of words) score += (freq[w] || 0);
  return score / Math.max(words.length, 1);
}

function summarizeText(text, maxSentences = 6) {
  if (!text || text.trim().length < 80) {
    return "Not enough content to summarize.";
  }

  const sentences = splitSentences(text);
  if (sentences.length === 0) return "Not enough content to summarize.";

  const freq = getWordFreq(text);

  const scored = sentences.map((s, idx) => ({
    idx,
    s,
    score: scoreSentence(s, freq)
  }));

  scored.sort((a, b) => b.score - a.score);

  const top = scored.slice(0, Math.min(maxSentences, scored.length));
  top.sort((a, b) => a.idx - b.idx);

  return top.map(x => x.s).join(" ");
}

module.exports = { summarizeText };
