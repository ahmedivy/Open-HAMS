import { useAnimalFeed } from "@/api/queries";
import { timeSince } from "@/utils";
import { AnimalFeed } from "@/utils/types";
import { LoadingDots } from "../icons";
import { Avatar, AvatarImage } from "../ui/avatar";
import { ScrollArea } from "../ui/scroll-area";

export function LiveFeed() {
  const { data: feed, isLoading } = useAnimalFeed();

  if (isLoading) return <LoadingDots />;

  return (
    <ScrollArea className="col-span-2 h-[480px] rounded-lg bg-white p-4 shadow-sm lg:p-8">
      <h2 className="text-lg font-bold text-foreground">Activity Feed</h2>
      <div className="mb-6 mt-4 space-y-4 lg:max-w-[450px]">
        {feed?.map((feed) => <ActivityItem key={feed.name} feed={feed} />)}
      </div>
      {
        feed?.length === 0 && (
          <div className="flex items-center justify-center flex-col h-96">
            <p className="text-sm text-muted-foreground">No activity feed available</p>
          </div>
        )
      }
    </ScrollArea>
  );
}

function ActivityItem({ feed }: { feed: AnimalFeed }) {
  return (
    <div className="flex items-center gap-4 rounded-sm border p-2 px-4">
      <Avatar className="size-12">
        <AvatarImage src={feed.image!} alt={feed.name} />
      </Avatar>
      <div className="flex w-full flex-col justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-md font-semibold">{feed.description}:</h3>
          <p className="text-sm">{feed.name}</p>
        </div>
        <div className="flex w-full items-center justify-between gap-2 text-sm">
          <p className="text-xs">by {feed.by}</p>
          <p className="">{timeSince(feed.logged_at)}</p>
        </div>
      </div>
    </div>
  );
}
