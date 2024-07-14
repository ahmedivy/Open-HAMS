import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAnimal } from "@/queries/zoo";
import { Loading } from "@/routes/loading";
import { cn } from "@/utils";
import { useParams } from "react-router-dom";

export function AnimalDetailsPage() {
  const { id } = useParams();
  if (!id) return null;

  const { data: animal, isLoading } = useAnimal(id);
  if (isLoading) return <Loading />;
  if (!animal) throw new Error("Animal not found");

  return (
    <main>
      <section className="flex w-full gap-4 px-12 pb-4 pt-8 lg:gap-8">
        <div className="flex h-full w-1/3 flex-col justify-between gap-4 rounded-md bg-white p-6 shadow-sm">
          <Avatar className="mx-auto size-28">
            <AvatarImage src={animal?.image!} />
          </Avatar>
          <h1 className="text-center text-2xl text-black">{animal.name}</h1>
          <div className="flex flex-col gap-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <Feature title="Kind" details={animal.kind} />
              <Feature title="Species" details={animal.species} />
            </div>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <Feature
                title="Created At"
                details={new Date(animal.created_at).toLocaleDateString()}
              />
              <Feature
                title="Updated At"
                details={new Date(animal.updated_at).toLocaleDateString()}
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
            <Card>
              <div className="flex w-full items-center justify-between gap-2">
                <CardHeading>Event Status</CardHeading>
                <Badge variant={"outline"} className="rounded-full">
                  Available
                </Badge>
              </div>
              <CardDetails className="text-green-400 font-semibold">Checked In</CardDetails>
            </Card>
            <Card>
              <CardHeading>Weekly Event Acitivity</CardHeading>
              <CardDetails className="flex flex-col gap-1">
                <span className="text-2xl">{4.5}</span>
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

function Feature(props: { title: string; details: string }) {
  return (
    <div className="flex flex-col gap-2">
      <h2 className="text-sm font-extralight text-muted-foreground">
        {props.title}
      </h2>
      <p className="text-sm leading-relaxed">{props.details}</p>
    </div>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-4 rounded-md bg-white p-6 shadow-sm">
      {children}
    </div>
  );
}

function CardHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="font-extralight leading-relaxed text-muted-foreground">
      {children}
    </h2>
  );
}

function CardDetails({
  className = "",
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <p className={cn("text-xl font-bold leading-relaxed", className)}>
      {children}
    </p>
  );
}
