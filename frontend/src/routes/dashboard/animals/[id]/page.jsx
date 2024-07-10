import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/utils";
import { useParams } from "react-router-dom";

export function AnimalDetailsPage() {
  const { id } = useParams();

  console.log(id);

  return (
    <main>
      <section className="flex w-full gap-4 px-12 pb-4 pt-8 lg:gap-8">
        <div className="flex h-full w-1/3 flex-col justify-between gap-4 rounded-md bg-white p-6 shadow-sm">
          <Avatar className="mx-auto size-28">
            <AvatarImage src="/placeholder-avatar.png" />
          </Avatar>
          <h1 className="text-center text-2xl text-black">Max the Dog</h1>
          <div className="flex flex-col gap-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <Feature title="Kind" details="Dog" />
              <Feature title="Species" details="Canine" />
            </div>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <Feature title="Created At" details="03-03-2024" />
              <Feature title="Updated At" details="03-03-2024" />
            </div>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <Feature title="Zoo ID - Belong To" details="Hoggle Zoo" />
            </div>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <Feature
                title="Description"
                details="Meet Max the Dog, the friendly and energetic Labrador Retriever! With his playful nature and boundless enthusiasm, Max brings joy to everyone he meets. His loyalty and obedience make him a beloved member of any family or community."
              />
            </div>
          </div>
        </div>
        <div className="flex w-2/3 flex-col">
          <div className="grid grid-cols-2 gap-4">
            <Card>
              <div className="flex w-full items-center justify-between gap-2">
                <CardHeading>Event Status</CardHeading>
                <Badge variant={"outline"} className="rounded-full">
                  Available
                </Badge>
              </div>
              <CardDetails className="text-green-400">Active</CardDetails>
            </Card>
            <Card>
              <CardHeading>Post-Event Rest Time</CardHeading>
              <CardDetails className="flex items-center gap-1">
                <span className="text-2xl">6</span>
                <span className="text-sm font-light">hours</span>
              </CardDetails>
            </Card>
            <Card>
              <CardHeading>Max Daily Checkouts</CardHeading>
              <CardDetails className="text-2xl">2</CardDetails>
            </Card>
            <Card>
              <CardHeading>Max Checkout Hours</CardHeading>
              <CardDetails className="text-2xl">8</CardDetails>
            </Card>
          </div>
        </div>
      </section>
      <section className="px-12 py-2">
        <Tabs defaultValue="audit-log" className="mt-6">
          <TabsList className="bg-inherit">
            <TabsTrigger
              value="audit-log"
              className="px-4 data-[state=active]:border-2  data-[state=active]:border-primary data-[state=active]:bg-inherit data-[state=active]:shadow-none"
            >
              Audit Log
            </TabsTrigger>
            <TabsTrigger
              value="health-log"
              className="px-4 data-[state=active]:border-2  data-[state=active]:border-primary data-[state=active]:bg-inherit data-[state=active]:shadow-none"
            >
              Health Log
            </TabsTrigger>
          </TabsList>
          <TabsContent value="audit-log">
            {/* <div className="mt-10 w-full max-w-[900px] rounded-lg border bg-white p-8 shadow-sm">
            <h2 className="mb-4 text-2xl font-semibold">User Management</h2>
            <DataTable
              data={userData}
              columns={userManagementColumns}
              toolbar={UserManagementToolbar}
            />
          </div> */}
          </TabsContent>
          <TabsContent value="health-log">
            {/* <div className="mt-10 w-full max-w-[900px] rounded-lg border bg-white p-8 shadow-sm">
            <div className="flex w-full items-center justify-between">
              <h2 className="mb-4 text-2xl font-semibold">
                Event Type Management
              </h2>
              <NewEventTypeModel />
            </div>
            <DataTable
              data={eventTypeData}
              columns={eventTypesColumns}
              toolbar={"none"}
            />
          </div> */}
          </TabsContent>
        </Tabs>
      </section>
    </main>
  );
}

function Feature({ title, details }) {
  return (
    <div className="flex flex-col gap-2">
      <h2 className="text-xs font-extralight text-muted-foreground">{title}</h2>
      <p className="text-xs leading-relaxed">{details}</p>
    </div>
  );
}

function Card({ children }) {
  return (
    <div className="flex flex-col gap-8 rounded-md bg-white p-6 shadow-sm">
      {children}
    </div>
  );
}

function CardHeading({ children }) {
  return (
    <h2 className="font-extralight leading-relaxed text-muted-foreground">
      {children}
    </h2>
  );
}

function CardDetails({ className = "", children }) {
  return (
    <p className={cn("text-xl font-bold leading-relaxed", className)}>
      {children}
    </p>
  );
}
