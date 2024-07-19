import { addComment } from "@/api/event";
import { formatDate } from "@/utils";
import { Comment, EventWithDetailsAndComments } from "@/utils/types";
import { useState, useTransition } from "react";
import { useQueryClient } from "react-query";
import { toast } from "sonner";
import { Comment as CommentIcon, Spinner } from "../icons";
import { Avatar, AvatarImage } from "../ui/avatar";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { ScrollArea } from "../ui/scroll-area";

export function EventCard({ data }: { data: EventWithDetailsAndComments }) {
  return (
    <Card className="w-full rounded-none border-b p-4 shadow-lg">
      <div className="grid gap-2">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold">{data.event.name}</h3>
          <Badge variant={"outline"}>{data.event_type.name}</Badge>
        </div>
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {formatDate(data.event.start_at)} - {formatDate(data.event.end_at)}
          </p>
          <p className="text-sm text-muted-foreground">
            Start Time:{" "}
            <span className="font-semibold">
              {new Date(data.event.start_at).toLocaleTimeString()}
            </span>{" "}
            - End Time:{" "}
            <span className="font-semibold">
              {new Date(data.event.end_at).toLocaleTimeString()}
            </span>
          </p>
        </div>
        <div className="mt-2 grid grid-cols-2 gap-2">
          <div className="grid w-full gap-2 rounded-lg bg-model p-4">
            <Label className="text-sm font-light">Description</Label>
            <p className="text-sm">{data.event.description}</p>
          </div>
          <div className="grid w-full gap-2 rounded-lg bg-model p-4">
            <Label>Description</Label>
            <p className="text-sm text-muted-foreground">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
              eiusmod tempor incididunt ut labore et dolore magna aliqua.
            </p>
          </div>
        </div>
        <CommentsBox
          eventId={data.event.id.toString()}
          comments={data.comments}
        />
      </div>
    </Card>
  );
}

export function CommentsBox({
  eventId,
  comments,
}: {
  eventId: string;
  comments: Comment[];
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [comment, setComment] = useState("");
  const [isLoading, startTransition] = useTransition();
  const queryClient = useQueryClient();

  const onClick = (e: any) => {
    e.preventDefault();

    if (isOpen && comment.length > 0) {
      startTransition(() => {
        addComment(eventId, comment).then((res) => {
          if (res.status === 200) {
            toast.success("Comment added successfully");
          } else {
            toast.error(res.data.detail);
          }
        });
        setIsOpen(false);
        setComment("");
        queryClient.invalidateQueries({ queryKey: ["event", eventId] });
      });
      return;
    }
    setIsOpen((prev) => !prev);
  };

  return (
    <ScrollArea className=" grid h-[180px] w-full gap-2 rounded-lg bg-model px-4 py-2">
      <form className="grid gap-2">
        <div className="flex items-center justify-between">
          <Label className="font-light">Comment</Label>
          <Button
            variant="ghost"
            size="xs"
            className="font-extralight"
            onClick={onClick}
            disabled={isLoading}
          >
            {isOpen && comment ? "Submit" : isOpen ? "Cancel" : "Comment"}
            {isLoading ? (
              <Spinner className="ml-2 size-5" />
            ) : (
              <CommentIcon className="ml-2 size-5" />
            )}
          </Button>
        </div>
        {isOpen && (
          <div className="mr-2 flex items-center gap-3">
            <Avatar className="size-12">
              <AvatarImage src="/placeholder-avatar.png" />
            </Avatar>
            <Input
              placeholder="Add a comment..."
              required
              className="h-12 w-full"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
          </div>
        )}
      </form>

      <div className="mt-4 grid gap-3">
        {comments.map((comment) => (
          <CommentEntry key={comment.comment.id} comment={comment} />
        ))}
      </div>
    </ScrollArea>
  );
}

export function CommentEntry({ comment }: { comment: Comment }) {
  return (
    <div className="flex items-center gap-4">
      <Avatar className="size-12">
        <AvatarImage src="/placeholder-avatar.png" />
      </Avatar>
      <div className="grid gap-1">
        <div className="flex items-center gap-2 text-xs">
          <p>
            {comment.user.first_name} {comment.user.last_name}
          </p>
          <span className="font-extralight">
            {formatDate(comment.comment.created_at)}
          </span>
        </div>
        <p className="text-sm font-normal">{comment.comment.comment}</p>
      </div>
    </div>
  );
}
