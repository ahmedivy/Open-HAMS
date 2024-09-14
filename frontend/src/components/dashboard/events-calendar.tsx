import { useRef, useState } from "react";

import { useEvents, useEventsDetails } from "@/api/queries";
import { CalendarApi, EventSourceInput } from "@fullcalendar/core/index.js";
import dayGridPlugin from "@fullcalendar/daygrid"; // a plugin!
import listPlugin from "@fullcalendar/list";
import FullCalendar from "@fullcalendar/react";
import timeGridPlugin from "@fullcalendar/timegrid";
import { cva } from "class-variance-authority";
import { EventCard } from "../events/event-card";
import { LoadingDots } from "../icons";
import { Tabs, TabsList, TabsTrigger } from "../ui/tabs";

export function EventsCalendar() {
  const events = useEvents();
  const [selectedEvent, setSelectedEvent] = useState<string | null>(null);
  const ref = useRef<FullCalendar>(null);

  if (events.isLoading) {
    return <LoadingDots />;
  }

  const eventsData: EventSourceInput | undefined = events.data?.map((event) => ({
    title: event.name,
    start: event.start_at,
    end: event.end_at,
    // allDay: false,
    id: event.id.toString(),
    startEditable: false,
    durationEditable: false,
  }));

  function changeView(view: string) {
    if (!ref.current) return;
    const api: CalendarApi = ref.current.getApi();
    api.changeView(view);
  }

  const viewsClassNames = cva("border-none rounded-lg", {
    variants: {
      view: {
        month: "",
        week: "",
        day: "",
        list: "",
      },
    },
    defaultVariants: {
      view: "month",
    },
  });

  return (
    <div className="col-span-3 grid gap-1 rounded-lg bg-white px-2 py-2 shadow-sm md:grid-cols-2">
      <div className="grid gap-2">
        <Tabs
          defaultValue="dayGridMonth"
          className="mt-6"
          onValueChange={changeView}
        >
          <TabsList className="mx-auto flex justify-center gap-2 bg-inherit">
            <TabsTrigger
              value="dayGridMonth"
              className="p-1 text-xs data-[state=active]:border-2 data-[state=active]:border-primary data-[state=active]:bg-inherit data-[state=active]:shadow-none"
            >
              Month
            </TabsTrigger>
            <TabsTrigger
              value="dayGridWeek"
              className="p-1 text-xs data-[state=active]:border-2 data-[state=active]:border-primary data-[state=active]:bg-inherit data-[state=active]:shadow-none"
            >
              Week
            </TabsTrigger>
            <TabsTrigger
              value="dayGridDay"
              className="p-1 text-xs data-[state=active]:border-2 data-[state=active]:border-primary data-[state=active]:bg-inherit data-[state=active]:shadow-none"
            >
              Day
            </TabsTrigger>
            <TabsTrigger
              value="listDay"
              className="p-1 text-xs data-[state=active]:border-2 data-[state=active]:border-primary data-[state=active]:bg-inherit data-[state=active]:shadow-none"
            >
              Agenda
            </TabsTrigger>
          </TabsList>
          <div className="flex flex-col">
            <FullCalendar
              ref={ref}
              plugins={[dayGridPlugin, listPlugin, timeGridPlugin]}
              viewClassNames={viewsClassNames({ view: "month" })}
              events={eventsData}
              eventClick={(info) => setSelectedEvent(info.event.id)}
              headerToolbar={{
                left: "prev",
                center: "title",
                right: "next",
              }}
              buttonIcons={{
                prev: "chevron-left",
                next: "chevron-right",
              }}
              eventTextColor="#49535E"
              eventClassNames={
                "rounded-sm px-1 bg-primary border-0 text-primary-foreground"
              }
              dayCellClassNames={"rounded-md"}
              eventTimeFormat={{
                hour: "numeric",
                minute: "2-digit",
                omitZeroMinute: false,
                meridiem: "short",
              }}
              allDayText="All Day"
            />
          </div>
        </Tabs>
      </div>

      <div className="h-full w-full">
        {!selectedEvent ? (
          <div className="flex h-[450px] w-full flex-col items-center justify-center">
            <p className="text-center text-sm text-muted-foreground">
              No event selected
            </p>
          </div>
        ) : (
          <EventsView id={selectedEvent} />
        )}
      </div>
    </div>
  );
}

export function EventsView({ id }: { id: string }) {
  const { data: eventDetails, isLoading } = useEventsDetails(id);

  if (isLoading) {
    return (
      <div className="flex h-[450px] w-full flex-col items-center justify-center">
        <p className="text-center text-sm text-foreground">
          <LoadingDots />
        </p>
      </div>
    );
  }

  return <EventCard data={eventDetails!} compact className="shadow-none border-b-0" />;
}
