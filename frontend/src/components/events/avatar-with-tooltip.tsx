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
}: {
  src: string;
  children: React.ReactNode;
}) {
  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Avatar className="size-8">
            <AvatarImage src={src} />
          </Avatar>
        </TooltipTrigger>
        <TooltipContent className="min-w-[200px] border bg-background shadow-lg">
          {children}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
