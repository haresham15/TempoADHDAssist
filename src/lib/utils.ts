export function parseJsonFromLLM(content: string) {
  try {
    // Strip markdown formatting if present
    const cleanContent = content.replace(/```json\n?|```/g, '').trim();
    return JSON.parse(cleanContent);
  } catch (error) {
    console.error("Failed to parse JSON from LLM content:", content, error);
    throw error;
  }
}
