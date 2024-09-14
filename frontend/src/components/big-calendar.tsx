import { CalendarApi } from "@fullcalendar/core/index.js";
import dayGridPlugin from "@fullcalendar/daygrid"; // a plugin!
import listPlugin from "@fullcalendar/list";
import FullCalendar from "@fullcalendar/react";
import timeGridPlugin from "@fullcalendar/timegrid";
import { useRef, useState } from "react";

type View = "dayGridDay" | "dayGridMonth" | "dayGridWeek" | "listDay";

export default function Calendar() {
  const ref = useRef<FullCalendar>(null);

  function changeView(view: View) {
    if (!ref.current) return;
    const api: CalendarApi = ref.current.getApi();
    api.changeView(view);
  }

  return (
    <div>
      <div className="mb-4 flex gap-2">
        <button onClick={() => changeView("dayGridMonth")}>Month</button>
        <button onClick={() => changeView("dayGridWeek")}>Week</button>
        <button onClick={() => changeView("dayGridDay")}>Day</button>
        <button onClick={() => changeView("listDay")}>Agenda</button>
      </div>

      <FullCalendar
        ref={ref}
        plugins={[dayGridPlugin, listPlugin, timeGridPlugin]}
        viewClassNames={"w-full"}
        events={[
          { title: "event 1", date: "2024-08-01", id: "1" },
          { title: "event 2", date: "2024-08-02", id: "2" },
        ]}
        eventClick={(info) => console.log(info.event.id)}
        headerToolbar={{
          left: "prev,next",
          center: "title",
          right: ""
        }}
      />
    </div>
  );
}
