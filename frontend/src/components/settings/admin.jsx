import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DataTable } from "./tables/data-table";
import { eventTypesColumns } from "./tables/event-types-col";
import { userManagementColumns } from "./tables/user-management-col";
import { UserManagementToolbar } from "./tables/user-management-toolbar";

import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { Button } from "../ui/button";
import { groupColumns } from "./tables/groups-col";

function getDummyUserData() {
  return Array.from({ length: 5 }).map(() => ({
    image: "/placeholder-avatar.png",
    name: `Max`,
    role: `Admin`,
    group: "group-2",
  }));
}

function getDummyEventTypeData() {
  return Array.from({ length: 5 }).map(() => ({
    image: "/placeholder-avatar.png",
    eventTypeName: `Event Type`,
    group: "group-2",
  }));
}

function getDummyGroupData() {
  return Array.from({ length: 5 }).map(() => ({
    image: "/placeholder-avatar.png",
    name: `Max`,
    role: `Admin`,
    group: "group-2",
  }));
}

export function AdminSettings() {
  const userData = getDummyUserData();
  const eventTypeData = getDummyEventTypeData();
  const groupData = getDummyGroupData();

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
          <TabsTrigger
            value="groups"
            className="px-4 data-[state=active]:border-2  data-[state=active]:border-primary data-[state=active]:bg-inherit data-[state=active]:shadow-none"
          >
            Groups
          </TabsTrigger>
        </TabsList>
        <TabsContent value="user-management">
          <div className="mt-10 w-full max-w-[900px] rounded-lg border bg-white p-8 shadow-sm">
            <h2 className="mb-4 text-2xl font-semibold">User Management</h2>
            <DataTable
              data={userData}
              columns={userManagementColumns}
              toolbar={UserManagementToolbar}
            />
          </div>
        </TabsContent>
        <TabsContent value="eventTypes">
          <div className="mt-10 w-full max-w-[900px] rounded-lg border bg-white p-8 shadow-sm">
            <div className="flex w-full items-center justify-between">
              <h2 className="mb-4 text-2xl font-semibold">
                Event Type Management
              </h2>
              <Dialog>
                <DialogTrigger>
                  <Button>Add Event Type</Button>
                </DialogTrigger>
                <DialogContent>
                  <div className="grid gap-4">
                    <div className="flex items-center justify-between">
                      <DialogTitle>New Event Type</DialogTitle>
                      <Button>Submit</Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
            <DataTable
              data={eventTypeData}
              columns={eventTypesColumns}
              toolbar={"none"}
            />
          </div>
        </TabsContent>
        <TabsContent value="groups">
          <div className="mt-10 w-full max-w-[900px] rounded-lg border bg-white p-8 shadow-sm">
            <div className="flex w-full items-center justify-between">
              <h2 className="mb-4 text-2xl font-semibold">Group Management</h2>
              <Button>Add Group</Button>
            </div>
            <DataTable
              data={groupData}
              columns={groupColumns}
              toolbar={"none"}
            />
          </div>
        </TabsContent>
      </Tabs>
    </section>
  );
}
