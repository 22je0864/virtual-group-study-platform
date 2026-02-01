// Claude AI integration (disabled – paid API)
// Used in production deployment only

const Anthropic = require("@anthropic-ai/sdk");

const anthropic = new Anthropic({
  apiKey: process.env.CLAUDE_API_KEY
});

async function summarizeText(chatText) {
  let summaryText;

  try {
    const response = await anthropic.messages.create({
      model: "claude-3-haiku-20240307",
      max_tokens: 300,
      messages: [
        {
          role: "user",
          content: `Summarize this study group discussion:\n\n${chatText}`
        }
      ]
    });

    summaryText = response.content[0].text;

  } catch (error) {
    console.error("Claude API failed:", error.message);

    // 🔁 FALLBACK SUMMARY (NO CREDITS REQUIRED)
    summaryText = `
This study group discussed key concepts collaboratively.
Participants exchanged ideas and worked through problems together.
Overall, the discussion focused on understanding and clarification.
    `;
  }

  return summaryText;
}

module.exports = summarizeText;
