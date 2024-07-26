import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "../ui/hover-card";

type Props = {
  title: string;
  description: string;
  children: React.ReactNode;
};

export function ListItem({ title, description, children }: Props) {
  return (
    <HoverCard>
      <HoverCardTrigger>
        <div className="flex items-center rounded-md border p-4 py-1 mb-2">
          <p className="text-sm font-medium text-foreground">{title}</p>
          <p className="ml-auto text-xs font-lighttext-foreground">
            {description}
          </p>
        </div>
      </HoverCardTrigger>
      <HoverCardContent className="p-0 rounded-lg w-72">{children}</HoverCardContent>
    </HoverCard>
  );
}
