import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu } from "lucide-react";

import { useEvents } from "@/api/queries";
import { NewEventModel } from "@/components/events/new-event-model";
import { LoadingDots } from "@/components/icons";
import { Sidebar } from "@/components/sidebar";
import { EventTableToolbar } from "@/components/tables/events-table/toolbar";
import { eventTableColumns } from "@/components/tables/events-table/col";
import { DataTable } from "@/components/tables/table-commons/data-table";

export function EventsPage() {
  const { data: events, isLoading } = useEvents();

  if (isLoading) return <LoadingDots />;

  return (
    <>
      <header className="flex items-center justify-between px-2 lg:justify-end lg:px-4">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="lg:hidden">
              <Menu />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="m-0 w-56 p-0">
            <Sidebar />
          </SheetContent>
        </Sheet>
        <NewEventModel />
      </header>
      <div className="mt-10 w-full rounded-lg border bg-white p-8 shadow-sm">
        <h2 className="mb-4 text-2xl font-semibold">All Events</h2>
        <DataTable
          data={events!}
          columns={eventTableColumns}
          // @ts-ignore
          Toolbar={EventTableToolbar}
        />
      </div>
    </>
  );
}
