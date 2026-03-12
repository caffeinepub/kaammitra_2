import { CATEGORY_COLORS, CATEGORY_EMOJIS } from "../lib/constants";

interface CategoryBadgeProps {
  category: string;
  size?: "sm" | "md";
}

export function CategoryBadge({ category, size = "md" }: CategoryBadgeProps) {
  const colorClass =
    CATEGORY_COLORS[category] ?? "bg-orange-100 text-orange-800";
  const emoji = CATEGORY_EMOJIS[category] ?? "🔨";
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full font-semibold ${
        size === "sm" ? "text-xs px-2 py-0.5" : "text-xs px-2.5 py-1"
      } ${colorClass}`}
    >
      <span>{emoji}</span>
      {category}
    </span>
  );
}
