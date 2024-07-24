import { cn, getInitials } from "@/utils";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";

export function AvatarWithTooltip({
  src,
  children,
  name,
  onClick,
  isSelected,
  className,
}: {
  src: string;
  children: React.ReactNode;
  name?: string;
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
            <AvatarFallback>{getInitials(name!)}</AvatarFallback>
          </Avatar>
        </TooltipTrigger>
        <TooltipContent className="grid min-w-[200px] gap-2 border bg-background shadow-lg">
          {children}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
