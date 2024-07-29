import { useState } from "react";

import { Calendar } from "../ui/calendar";

import { useEventsDetails } from "@/api/queries";
import { EventCard } from "../events/event-card";
import { ScrollArea } from "../ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { formatDate } from "@/utils";

export function EventsCalendar() {
  const [selected, setSelected] = useState<Date>(new Date());

  return (
    <div className="col-span-3 grid gap-1 rounded-lg bg-white px-2 py-2 shadow-sm md:grid-cols-2">
      <div className="grid place-content-center gap-2">
        <Tabs defaultValue="month" className="mt-6">
          <TabsList className="mx-auto flex justify-center gap-2 bg-inherit">
            <TabsTrigger
              value="month"
              className="p-1 text-xs data-[state=active]:border-2 data-[state=active]:border-primary data-[state=active]:bg-inherit data-[state=active]:shadow-none"
            >
              Month
            </TabsTrigger>
            <TabsTrigger
              value="week"
              className="p-1 text-xs data-[state=active]:border-2 data-[state=active]:border-primary data-[state=active]:bg-inherit data-[state=active]:shadow-none"
            >
              Week
            </TabsTrigger>
            <TabsTrigger
              value="day"
              className="p-1 text-xs data-[state=active]:border-2 data-[state=active]:border-primary data-[state=active]:bg-inherit data-[state=active]:shadow-none"
            >
              Day
            </TabsTrigger>
            <TabsTrigger
              value="agenda"
              className="p-1 text-xs data-[state=active]:border-2 data-[state=active]:border-primary data-[state=active]:bg-inherit data-[state=active]:shadow-none"
            >
              Agenda
            </TabsTrigger>
          </TabsList>
          <TabsContent value="month" className="flex flex-col">
            <Calendar
              mode="single"
              selected={selected}
              onSelect={setSelected as any}
              className="mx-auto items-center justify-center p-6 px-6"
            />
          </TabsContent>
          <TabsContent value="week">
            <Calendar
              mode="single"
              selected={selected}
              onSelect={setSelected as any}
              className="mx-auto items-center justify-center"
            />
          </TabsContent>
          <TabsContent value="day" className="flex flex-col">
            <Calendar
              mode="single"
              selected={selected}
              onSelect={setSelected as any}
              className="mx-auto items-center justify-center p-6 px-6"
            />
          </TabsContent>
          <TabsContent value="agenda">
            <Calendar
              mode="single"
              selected={selected}
              onSelect={setSelected as any}
              className="mx-auto items-center justify-center"
            />
          </TabsContent>
        </Tabs>
      </div>

      <div className="h-full w-full">
        <EventsView date={selected} />
      </div>
    </div>
  );
}

export function EventsView({ date }: { date: Date }) {
  const { data: eventsDetails, isLoading } = useEventsDetails(date);

  if (isLoading) {
    return (
      <div className="flex h-[450px] w-full items-center justify-center flex-col">
        <p className="text-center text-sm text-foreground">No events found</p>
      </div>
    );
  }

  console.log(date);

  return eventsDetails?.length === 0 ? (
    <div className="flex h-[450px] w-full items-center justify-center flex-col">
      <p className="text-center text-sm text-muted-foreground">No events on {formatDate(date.toString())}</p>
    </div>
  ) : (
    <ScrollArea className="flex h-[450px] w-full flex-col bg-green-300">
      {eventsDetails?.map((event) => (
        <EventCard key={event.event.id} data={event} compact />
      ))}
    </ScrollArea>
  );
}
