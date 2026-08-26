export type HistoryItem = {
  id: string;
  type: "overwhelm" | "trigger" | "vent";
  summary: string;
  timestamp: string;
  content: string;
};

const HISTORY_KEY = "tempo_history";

export function getHistory(): HistoryItem[] {
  if (typeof window === "undefined") return [];
  const stored = localStorage.getItem(HISTORY_KEY);
  if (!stored) return [];
  try {
    return JSON.parse(stored);
  } catch {
    return [];
  }
}

export function addHistory(item: Omit<HistoryItem, "id" | "timestamp">) {
  if (typeof window === "undefined") return;
  const current = getHistory();
  const newItem: HistoryItem = {
    ...item,
    id: crypto.randomUUID(),
    timestamp: new Date().toISOString(),
  };
  localStorage.setItem(HISTORY_KEY, JSON.stringify([newItem, ...current]));
}
