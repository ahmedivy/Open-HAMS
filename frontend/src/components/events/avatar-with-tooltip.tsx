import { cn } from "@/utils";
import { Avatar, AvatarImage } from "../ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";

export function AvatarWithTooltip({
  src,
  children,
  onClick,
  isSelected,
  className,
}: {
  src: string;
  children: React.ReactNode;
  isSelected?: boolean;
  onClick?: () => void;
  className?: string;
}) {
  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Avatar
            className={cn(
              "size-8",
              isSelected === true
                ? "ring-2 ring-green-500"
                : isSelected === undefined
                  ? ""
                  : "opacity-30",
              className,
            )}
            onClick={onClick}
          >
            <AvatarImage src={src} />
          </Avatar>
        </TooltipTrigger>
        <TooltipContent className="min-w-[200px] border bg-background shadow-lg grid gap-2">
          {children}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
