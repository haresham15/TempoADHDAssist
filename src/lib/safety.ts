/**
 * Deterministic Crisis Language Detection
 * 
 * This module runs a fast, regex-based check against known crisis-language markers.
 * It is deliberately kept outside the LLM call path and dependency-free to guarantee
 * that crisis detection is fast, deterministic, non-bypassable, and never dependent
 * on model interpretation or availability.
 */

const CRISIS_PATTERNS: RegExp[] = [
  // Direct suicide expressions & ideation
  /\b(?:commit(?:ting)?\s+suicide|suicidal(?:\s+(?:thoughts?|ideation|urges?))?)\b/i,
  /\b(?:want to|wanna|going to|gonna|plan to|planning to|thinking (?:about|of)|feel like)\s+(?:die|dying|kill myself|killing myself|end my life|ending my life|end it all|ending it all|hang myself)\b/i,
  /\b(?:kill|killing|end|ending|take|taking)\s+(?:my\s+own\s+life|my\s+life|myself)\b/i,
  
  // Hopelessness / desire not to exist
  /\b(?:better off dead|wish I (?:were|was) dead|wish I (?:were|was) not alive)\b/i,
  /\b(?:don't|do not)\s+want to\s+(?:live|exist|wake up|be here)(?:\s+anymore)?\b/i,
  /\b(?:no reason to live|nothing to live for|can't go on living)\b/i,
  
  // Explicit self-harm & lethal means
  /\b(?:cut(?:ting)?\s+myself|harm(?:ing)?\s+myself|hurt(?:ing)?\s+myself)\b/i,
  /\b(?:slit(?:ting)?\s+(?:my\s+)?wrists?|take\s+all\s+(?:my\s+)?pills|overdos(?:e|ing))\b/i,
  
  // Final goodbye / notes
  /\b(?:my\s+suicide\s+note|writing\s+my\s+goodbye\s+note|this\s+is\s+my\s+final\s+goodbye)\b/i,
];

export interface SafetyCheckResult {
  isCrisis: boolean;
}

/**
 * Checks input text for explicit crisis and self-harm language.
 * Returns { isCrisis: true } if any marker matches.
 */
export function checkSafety(text: string): SafetyCheckResult {
  if (!text || typeof text !== "string") {
    return { isCrisis: false };
  }

  const normalized = text.trim();
  if (!normalized) {
    return { isCrisis: false };
  }

  for (const pattern of CRISIS_PATTERNS) {
    if (pattern.test(normalized)) {
      return { isCrisis: true };
    }
  }

  return { isCrisis: false };
}
