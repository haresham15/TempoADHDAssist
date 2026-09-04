export function parseJsonFromLLM<T = any>(content: string): T {
  try {
    // 1. Strip markdown code fences if present
    const cleanContent = content.replace(/```json\n?|```/g, '').trim();
    
    // 2. Direct attempt
    try {
      return JSON.parse(cleanContent) as T;
    } catch {
      // Fall through to boundary extraction
    }

    // 3. Extract boundary between first '{' and last '}' (or '[' and ']')
    const firstBrace = cleanContent.indexOf('{');
    const lastBrace = cleanContent.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      const jsonCandidate = cleanContent.substring(firstBrace, lastBrace + 1);
      return JSON.parse(jsonCandidate);
    }

    const firstBracket = cleanContent.indexOf('[');
    const lastBracket = cleanContent.lastIndexOf(']');
    if (firstBracket !== -1 && lastBracket !== -1 && lastBracket > firstBracket) {
      const jsonCandidate = cleanContent.substring(firstBracket, lastBracket + 1);
      return JSON.parse(jsonCandidate);
    }

    throw new Error("No valid JSON structure found in LLM response.");
  } catch (error) {
    console.error("Failed to parse JSON from LLM content:", content, error);
    throw error;
  }
}
