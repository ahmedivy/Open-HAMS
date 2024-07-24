import { makeAnimalAvailable, makeAnimalUnavailable } from "@/api/animals";
import {
  useAnimalAuditLog,
  useAnimalDetails,
  useAnimalHealthLog,
  useUser,
} from "@/api/queries";
import { EventsList } from "@/components/events/events-list";
import { NewHealthLogModel } from "@/components/models/health-log-model";
import { animalAuditTableColumns } from "@/components/tables/animal-audit-table/cols";
import { animalHealthLogTableColumns } from "@/components/tables/animal-health-table/cols";
import { DataTable } from "@/components/tables/table-commons/data-table";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardDetails, CardHeading } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loading } from "@/routes/loading";
import { cn, formatDate } from "@/utils";
import { useState } from "react";
import { useQueryClient } from "react-query";
import { useParams } from "react-router-dom";
import { toast } from "sonner";

export function AnimalDetailsPage() {
  const { id } = useParams();
  if (!id) return null;

  const { data: user, isLoading: isUserLoading } = useUser();
  const { data, isLoading } = useAnimalDetails(id);

  if (isLoading || isUserLoading) return <Loading />;
  if (!data) throw new Error("Animal not found");

  return (
    <main>
      <section className="flex h-full w-full gap-4 px-12 pb-4 pt-8 lg:gap-8">
        <div className="flex min-h-full w-1/3 flex-col gap-4 rounded-md bg-white p-6 pt-16 shadow-sm">
          <Avatar className="mx-auto size-32">
            <AvatarImage src={data.animal.image!} />
          </Avatar>
          <h1 className="text-center text-2xl text-black">
            {data.animal.name}
          </h1>
          <div className="my-auto flex flex-col gap-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <Feature title="Species" details={data.animal.species} />
              <Feature
                title="Last Check-in at"
                details={formatDate(data.animal.last_checkin_time!)}
                className="text-end"
              />
            </div>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <Feature
                title="Created At"
                details={formatDate(data.animal.created_at)}
              />
              <Feature
                title="Updated At"
                details={formatDate(data.animal.updated_at)}
                className="text-end"
              />
            </div>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <Feature title="Zoo ID - Belong To" details="Hoggle Zoo" />
              {user?.role?.name === "admin" && (
                <AnimalAvailabilitySwitch
                  status={data.animal.status!}
                  animalId={data.animal.id.toString()}
                />
              )}
            </div>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <Feature title="Description" details={data.animal.description!} />
            </div>
          </div>
        </div>
        <div className="flex w-2/3 flex-col">
          <div className="grid grid-cols-2 gap-4">
            <Card className="gap-2">
              <div className="flex w-full items-center justify-between gap-0">
                <CardHeading>Event Status</CardHeading>
                <Badge variant={"outline"} className="rounded-full">
                  {data.animal.status === "checked_in"
                    ? "Available"
                    : "Not Available"}
                </Badge>
              </div>
              {data.animal.status === "checked_out" ? (
                <CardDetails className="font-semibold">Checked Out</CardDetails>
              ) : data.animal.status === "checked_in" ? (
                <CardDetails className="font-semibold text-green-400">
                  Checked In
                </CardDetails>
              ) : (
                <CardDetails className="font-semibold text-red-400">
                  Not Available
                </CardDetails>
              )}
            </Card>
            <Card className="gap-2">
              <CardHeading>Weekly Event Acitivity</CardHeading>
              <CardDetails className="flex flex-col gap-0 text-black">
                <span className="">{data.daily_checkout_duration.toFixed(2)}</span>
                <span className="text-sm font-light">hours</span>
              </CardDetails>
            </Card>
            <Card className="gap-2">
              <CardHeading className="flex items-center justify-between">
                <span>Max Checkout Hours</span>
                <span className="text-2xl font-bold text-black">
                  {data.animal.max_daily_checkout_hours}
                </span>
              </CardHeading>
              <CardHeading className="flex items-center justify-between">
                <span>Event Rest Hours</span>
                <span className="text-2xl font-bold text-black">
                  {data.animal.rest_time}
                </span>
              </CardHeading>
            </Card>
            <Card>
              <CardHeading>Daily Event Count</CardHeading>
              <CardDetails className="text-2xl text-black">
                {data.daily_checkout_count} / {data.animal.max_daily_checkouts}
              </CardDetails>
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
                <EventsList
                  events={data.current_events}
                  emptyMessage="No Current Events"
                />
              </TabsContent>
              <TabsContent value="upcomingEvents">
                <EventsList
                  events={data.upcoming_events}
                  emptyMessage="No Upcoming Events"
                />
              </TabsContent>
              <TabsContent value="pastEvents">
                <EventsList
                  events={data.past_events}
                  emptyMessage="No Past Events"
                />
              </TabsContent>
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
            <AnimalAuditTable animalId={id} />
          </TabsContent>
          <TabsContent value="health-log">
            <AnimalHealthLogTable animalId={id} />
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

function AnimalAuditTable({ animalId }: { animalId: string }) {
  const { data, isLoading } = useAnimalAuditLog(animalId);
  if (isLoading) return <Loading />;
  if (!data) return <div>No Audit Log</div>;

  return (
    <div className="mt-10 w-full rounded-lg border bg-white p-8 shadow-sm">
      <h2 className="mb-4 text-2xl font-semibold">Animal Audit Log</h2>
      <DataTable data={data} columns={animalAuditTableColumns} />
    </div>
  );
}

function AnimalHealthLogTable({ animalId }: { animalId: string }) {
  const { data, isLoading } = useAnimalHealthLog(animalId);
  if (isLoading) return <Loading />;

  return (
    <div className="mt-10 w-full rounded-lg border bg-white p-8 shadow-sm">
      <div className="flex w-full items-center justify-between gap-2 mb-4">
        <h2 className="mb-4 text-2xl font-semibold">Health Log</h2>
        <NewHealthLogModel animalId={animalId} />
      </div>
      <DataTable data={data!} columns={animalHealthLogTableColumns} />
    </div>
  );
}

function AnimalAvailabilitySwitch({
  status,
  animalId,
}: {
  status: string;
  animalId: string;
}) {
  const [checked, setChecked] = useState(status === "unavailable");
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);
  const handleChange = async (checked: boolean) => {
    setChecked(checked);
    setLoading(true);

    let res;
    if (checked) {
      res = await makeAnimalUnavailable(animalId);
    } else {
      res = await makeAnimalAvailable(animalId);
    }

    if (res.status === 200) {
      toast.success(res.data.message);
    } else {
      toast.error(res.data.detail);
    }

    queryClient.invalidateQueries({ queryKey: ["animal_details", animalId] });
    queryClient.invalidateQueries({ queryKey: ["animal_status"] });
    queryClient.invalidateQueries({ queryKey: ["animal_audit", animalId] });

    setLoading(false);
  };

  return (
    <div className="flex flex-col gap-2">
      <h2 className="text-sm font-extralight text-muted-foreground">
        Mark Unavailable
      </h2>
      <Switch
        onCheckedChange={handleChange}
        checked={checked}
        disabled={loading}
        className="self-end"
      />
    </div>
  );
}
