import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { userManagementColumns } from "../tables/user-management/user-management-cols";

import { getUsers } from "@/api/user";
import { useEventType } from "@/api/queries";
import { Loading } from "@/routes/loading";
import { User } from "@/utils/types";
import { useQuery } from "react-query";
import { EventTypeModel } from "../models/event-type-model";
import { NewGroupModel } from "../models/new-group";
import { eventTypesColumns } from "../tables/event-type/event-type-cols";
import { EventTypeDataTable } from "../tables/event-type/event-type-data-table";
import { DataTable } from "../tables/table-commons/data-table";
import { Button } from "../ui/button";

export function AdminSettings() {
  const { data: users, isLoading } = useQuery<User[]>({
    queryFn: getUsers,
    queryKey: ["users"],
  });

  const { data: eventTypes, isLoading: eventTypesLoading } = useEventType();

  // const { isLoading: rolesLoading } = useRoles();

  if (isLoading || eventTypesLoading) {
    return <Loading />;
  }

  return (
    <section className="mt-8 w-full rounded-md bg-white p-8 shadow-sm">
      <Tabs defaultValue="user-management" className="mt-6">
        <TabsList className="bg-inherit">
          <TabsTrigger
            value="user-management"
            className="px-4 data-[state=active]:border-2  data-[state=active]:border-primary data-[state=active]:bg-inherit data-[state=active]:shadow-none"
          >
            User Management
          </TabsTrigger>
          <TabsTrigger
            value="eventTypes"
            className="px-4 data-[state=active]:border-2  data-[state=active]:border-primary data-[state=active]:bg-inherit data-[state=active]:shadow-none"
          >
            Event Types
          </TabsTrigger>
        </TabsList>
        <TabsContent value="user-management">
          <div className="mt-10 w-full max-w-[900px] rounded-lg border bg-white p-8 shadow-sm">
            <div className="mb-6 flex items-center justify-between gap-2">
              <h2 className="mb-4 text-2xl font-semibold">User Management</h2>
              <NewGroupModel />
            </div>
            <DataTable data={users!} columns={userManagementColumns} />
          </div>
        </TabsContent>
        <TabsContent value="eventTypes">
          <div className="mt-10 w-full max-w-[900px] rounded-lg border bg-white p-8 shadow-sm">
            <div className="mb-6 flex w-full items-center justify-between">
              <h2 className="mb-4 text-2xl font-semibold">
                Event Type Management
              </h2>
              <EventTypeModel mode="add">
                <Button>Add Event Type</Button>
              </EventTypeModel>
            </div>
            <EventTypeDataTable
              data={eventTypes!}
              columns={eventTypesColumns}
            />
          </div>
        </TabsContent>
      </Tabs>
    </section>
  );
}
