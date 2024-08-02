import { getUser } from "@/api/user";
import { EventsList } from "@/components/events/events-list";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loading } from "@/routes/loading";
import { capitalize, cn, getInitials } from "@/utils";
import { useQuery } from "react-query";
import { useParams } from "react-router-dom";

import { Sidebar } from "@/components/sidebar";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

import { Menu } from "lucide-react";

export function UserDetailsPage() {
  const { id } = useParams();

  const { data: user, isLoading } = useQuery({
    queryKey: ["user", id],
    queryFn: async () => await getUser(parseInt(id!)),
  });

  if (isLoading) return <Loading />;

  console.log(user);

  return (
    <main>
      <header className="flex items-center justify-between lg:px-4">
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
      </header>
      <section className="flex w-full flex-col gap-4 pb-4 pt-8 lg:flex-row lg:gap-8 lg:px-12">
        <div className="flex h-full w-full flex-col justify-between gap-4 rounded-md bg-white p-6 shadow-sm lg:w-1/3">
          <Avatar className="mx-auto size-16 lg:size-28">
            <AvatarImage src={user?.user.image!} />
            <AvatarFallback className="text-3xl">
              {getInitials(user?.user.first_name!, user?.user.last_name)}
            </AvatarFallback>
          </Avatar>
          <h1 className="text-center text-2xl text-black">
            {user?.user.username}
          </h1>
          <div className="flex flex-col gap-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <Feature
                title="Full Name"
                details={`${user?.user.first_name} ${user?.user.last_name}`}
              />
              <Feature title="Email" details={user?.user.email!} />
            </div>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <Feature
                title="Created At"
                details={new Date(user?.user.created_at!).toLocaleDateString()}
              />
              <Feature
                title="Updated At"
                details={new Date(user?.user.updated_at!).toLocaleDateString()}
              />
            </div>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <Feature
                title="Zoo ID - Belong To"
                details={user?.user.zoo?.name!}
              />
            </div>
          </div>
        </div>
        <div className="flex w-full flex-col lg:w-2/3">
          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeading>User Role</CardHeading>
              <CardDetails className="text-2xl">
                {capitalize(user?.user?.role?.name!)}
              </CardDetails>
            </Card>
            <Card>
              <CardHeading>Tier Level</CardHeading>
              <CardDetails className="text-2xl">{user?.user.tier}</CardDetails>
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
                  events={user?.current_events!}
                  emptyMessage="No Current Events"
                />
              </TabsContent>
              <TabsContent value="upcomingEvents">
                <EventsList
                  events={user?.upcoming_events!}
                  emptyMessage="No Upcoming Events"
                />
              </TabsContent>
              <TabsContent value="pastEvents">
                <EventsList
                  events={user?.past_events!}
                  emptyMessage="No Past Events"
                />
              </TabsContent>
            </Tabs>
          </div>
        </div>
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
