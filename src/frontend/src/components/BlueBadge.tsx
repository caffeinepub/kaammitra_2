import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface Props {
  size?: "sm" | "md" | "lg";
}

export function BlueBadge({ size = "md" }: Props) {
  const dim =
    size === "sm"
      ? "w-3.5 h-3.5"
      : size === "lg"
        ? "w-6 h-6"
        : "w-[18px] h-[18px]";
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span
            data-ocid="blue_badge.icon"
            className={`inline-flex items-center justify-center ${dim} rounded-full bg-blue-500 shrink-0 cursor-default`}
          >
            <svg
              viewBox="0 0 12 12"
              fill="none"
              className="w-[60%] h-[60%]"
              aria-hidden="true"
              role="presentation"
            >
              <path
                d="M2 6l2.5 2.5L10 3.5"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
        </TooltipTrigger>
        <TooltipContent>
          <p>Verified Worker</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
