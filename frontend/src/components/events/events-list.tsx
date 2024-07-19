import { EventWithDetailsAndComments } from "@/utils/types";
import { ScrollArea } from "../ui/scroll-area";
import { EventCard } from "./event-card";

export function EventsList({
  events,
  emptyMessage,
}: {
  events: EventWithDetailsAndComments[];
  emptyMessage?: string;
}) {
  return events.length === 0 ? (
    <div className="flex h-[435px] flex-col items-center justify-center">
      <h1 className="text-xl font-semibold text-muted-foreground">
        {emptyMessage || "No Events"}
      </h1>
    </div>
  ) : (
    <ScrollArea className="flex max-h-[435px] flex-col gap-2 rounded-lg bg-blueish shadow-md">
      {events.map((event) => (
        <EventCard key={event.event.id} data={event} />
      ))}
    </ScrollArea>
  );
}
