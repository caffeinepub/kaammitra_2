export const CATEGORIES = [
  "JCB Operator",
  "Mason",
  "Electrician",
  "Plumber",
  "Painter",
  "Labour",
  "Driver",
  "Carpenter",
] as const;

export type Category = (typeof CATEGORIES)[number];

export const CATEGORY_COLORS: Record<string, string> = {
  "JCB Operator": "bg-orange-100 text-orange-800",
  Mason: "bg-stone-100 text-stone-800",
  Electrician: "bg-yellow-100 text-yellow-800",
  Plumber: "bg-blue-100 text-blue-800",
  Painter: "bg-purple-100 text-purple-800",
  Labour: "bg-red-100 text-red-800",
  Driver: "bg-green-100 text-green-800",
  Carpenter: "bg-amber-100 text-amber-800",
};

export const CATEGORY_EMOJIS: Record<string, string> = {
  "JCB Operator": "🚜",
  Mason: "🧱",
  Electrician: "⚡",
  Plumber: "🔧",
  Painter: "🎨",
  Labour: "💪",
  Driver: "🚗",
  Carpenter: "🪚",
};
