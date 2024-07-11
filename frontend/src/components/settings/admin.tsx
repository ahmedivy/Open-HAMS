import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { userManagementColumns } from "../tables/user-management/user-management-cols";

import { getUsers } from "@/api/user";
import { useRoles } from "@/queries/roles";
import { Loading } from "@/routes/loading";
import { User } from "@/utils/types";
import { useQuery } from "react-query";
import { NewEventTypeModel } from "../models/new-event-type";
import { DataTable } from "../tables/table-commons/data-table";
import { Button } from "../ui/button";
import { NewGroupModel } from "../models/new-group";

export function AdminSettings() {
  const { data: users, isLoading } = useQuery<User[]>({
    queryFn: getUsers,
    queryKey: ["users"],
  });

  const { isLoading: rolesLoading } = useRoles();

  if (isLoading || rolesLoading) {
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
            <div className="flex items-center justify-between gap-2 mb-6">
            <h2 className="mb-4 text-2xl font-semibold">User Management</h2>
            <NewGroupModel />
            </div>
            <DataTable data={users!} columns={userManagementColumns} />
          </div>
        </TabsContent>
        <TabsContent value="eventTypes">
          <div className="mt-10 w-full max-w-[900px] rounded-lg border bg-white p-8 shadow-sm">
            <div className="flex w-full items-center justify-between">
              <h2 className="mb-4 text-2xl font-semibold">
                Event Type Management
              </h2>
              <NewEventTypeModel />
            </div>
            {/* <DataTable
              data={eventTypeData}
              columns={eventTypesColumns}
              toolbar={"none"}
            /> */}
          </div>
        </TabsContent>
      </Tabs>
    </section>
  );
}
