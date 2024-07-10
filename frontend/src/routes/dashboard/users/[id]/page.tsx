import { getUser } from "@/api/user";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Loading } from "@/routes/loading";
import { capitalize, cn } from "@/utils";
import { useQuery } from "react-query";
import { useParams } from "react-router-dom";

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
      <section className="flex w-full gap-4 px-12 pb-4 pt-8 lg:gap-8">
        <div className="flex h-full w-1/3 flex-col justify-between gap-4 rounded-md bg-white p-6 shadow-sm">
          <Avatar className="mx-auto size-28">
            <AvatarImage src="/placeholder-avatar.png" />
          </Avatar>
          <h1 className="text-center text-2xl text-black">{user?.username}</h1>
          <div className="flex flex-col gap-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <Feature
                title="Full Name"
                details={`${user?.first_name} ${user?.last_name}`}
              />
              <Feature title="Email" details={user?.email!} />
            </div>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <Feature
                title="Created At"
                details={new Date(user?.created_at!).toLocaleDateString()}
              />
              <Feature
                title="Updated At"
                details={new Date(user?.updated_at!).toLocaleDateString()}
              />
            </div>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <Feature title="Zoo ID - Belong To" details="Hoggle Zoo" />
            </div>
          </div>
        </div>
        <div className="flex w-2/3 flex-col">
          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardHeading>User Role</CardHeading>
              <CardDetails className="text-2xl">
                {capitalize(user?.role?.name!)}
              </CardDetails>
            </Card>
            <Card>
              <CardHeading>Tier Level</CardHeading>
              <CardDetails className="text-2xl">{user?.tier}</CardDetails>
            </Card>
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
