import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu } from "lucide-react";

import { useEventsWithDetails, useUser } from "@/api/queries";
import { NewEventModel } from "@/components/events/new-event-model";
import { LoadingDots } from "@/components/icons";
import { Sidebar } from "@/components/sidebar";
import { eventTableColumns } from "@/components/tables/events-table/col";
import { EventTableToolbar } from "@/components/tables/events-table/toolbar";
import { DataTable } from "@/components/tables/table-commons/data-table";
import { Loading } from "@/routes/loading";
import { hasPermission } from "@/utils";

export function EventsPage() {
  const { data: events, isLoading } = useEventsWithDetails();
  const user = useUser();

  if (isLoading) return <Loading />;

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
        {user.isLoading && <LoadingDots className="ml-auto" />}
        {hasPermission(user.data!, "create_events") && <NewEventModel />}
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
