import { Button } from "@/components/ui/button";

import { ScrollArea } from "@/components/ui/scroll-area";
import { ArrowRight } from "lucide-react";

type Props = {
  title: string;
  children: React.ReactNode;
};

export function ScrollList({ title, children }: Props) {
  return (
    <div className="w-full overflow-clip rounded-xl bg-white">
      <h2 className="flex items-center px-4 py-3 text-[18px] font-bold text-foreground">
        {title}
        <Button size="icon" className="ml-auto size-6 rounded-2xl">
          <ArrowRight className="size-4 text-white" />
        </Button>
      </h2>
      <ScrollArea className="flex h-[162px] flex-col gap-2 p-2">
        {children}
      </ScrollArea>
    </div>
  );
}
