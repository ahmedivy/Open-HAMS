import { useAnimal } from "@/api/queries";
import { EventCard } from "@/components/events/event-card";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardDetails, CardHeading } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loading } from "@/routes/loading";
import { cn, formatDate } from "@/utils";
import { useParams } from "react-router-dom";

export function AnimalDetailsPage() {
  const { id } = useParams();
  if (!id) return null;

  const { data: animal, isLoading } = useAnimal(id);
  if (isLoading) return <Loading />;
  if (!animal) throw new Error("Animal not found");

  return (
    <main>
      <section className="flex h-full w-full gap-4 px-12 pb-4 pt-8 lg:gap-8">
        <div className="flex min-h-full w-1/3 flex-col gap-4 rounded-md bg-white p-6 pt-16 shadow-sm">
          <Avatar className="mx-auto size-32">
            <AvatarImage src={"/placeholder-avatar.png"} />
          </Avatar>
          <h1 className="text-center text-2xl text-black">{animal.name}</h1>
          <div className="my-auto flex flex-col gap-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <Feature title="Species" details={animal.species} />
              <Feature
                title="Last Check-in at"
                details={formatDate(animal.last_checkin_time!)}
                className="text-end"
              />
            </div>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <Feature
                title="Created At"
                details={formatDate(animal.created_at)}
              />
              <Feature
                title="Updated At"
                details={formatDate(animal.updated_at)}
                className="text-end"
              />
            </div>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <Feature title="Zoo ID - Belong To" details="Hoggle Zoo" />
            </div>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <Feature title="Description" details={animal.description!} />
            </div>
          </div>
        </div>
        <div className="flex w-2/3 flex-col">
          <div className="grid grid-cols-2 gap-4">
            <Card className="gap-2">
              <div className="flex w-full items-center justify-between gap-0">
                <CardHeading>Event Status</CardHeading>
                <Badge variant={"outline"} className="rounded-full">
                  Available
                </Badge>
              </div>
              <CardDetails className="font-semibold text-green-400">
                Checked In
              </CardDetails>
            </Card>
            <Card className="gap-2">
              <CardHeading>Weekly Event Acitivity</CardHeading>
              <CardDetails className="flex flex-col gap-0 text-black">
                <span className="text-2xl">{4.5}</span>
                <span className="text-sm font-light">hours</span>
              </CardDetails>
            </Card>
            <Card className="gap-2">
              <CardHeading className="flex items-center justify-between">
                <span>Max Checkout Hours</span>
                <span className="text-2xl font-bold text-black">
                  {animal.max_daily_checkout_hours}
                </span>
              </CardHeading>
              <CardHeading className="flex items-center justify-between">
                <span>Event Rest Hours</span>
                <span className="text-2xl font-bold text-black">
                  {animal.rest_time}
                </span>
              </CardHeading>
            </Card>
            <Card>
              <CardHeading>Daily Event Count</CardHeading>
              <CardDetails className="text-2xl text-black">4 / 5</CardDetails>
            </Card>
          </div>
          <div className="mt-6">
            <Tabs defaultValue="currentEvents">
              <TabsList className="bg-model">
                <TabsTrigger
                  value="currentEvents"
                  className=" px-3 text-sm data-[state=active]:bg-primary"
                >
                  Current Events
                </TabsTrigger>
                <TabsTrigger
                  value="upcomingEvents"
                  className=" px-3 text-sm data-[state=active]:bg-primary"
                >
                  Upcoming Events
                </TabsTrigger>
                <TabsTrigger
                  value="pastEvents"
                  className=" px-3 text-sm data-[state=active]:bg-primary"
                >
                  Past Events
                </TabsTrigger>
              </TabsList>
              <TabsContent value="currentEvents">
                <ScrollArea className="flex flex-col gap-2 h-[435px] bg-blueish rounded-lg shadow-md">
                  <EventCard />
                  <EventCard />
                  <EventCard />
                </ScrollArea>
              </TabsContent>
              <TabsContent value="upcomingEvents"></TabsContent>
              <TabsContent value="pastEvents"></TabsContent>
            </Tabs>
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

function Feature(props: {
  title: string;
  details: string;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-2", props.className)}>
      <h2 className="text-sm font-extralight text-muted-foreground">
        {props.title}
      </h2>
      <p className="text-sm leading-relaxed">{props.details}</p>
    </div>
  );
}
