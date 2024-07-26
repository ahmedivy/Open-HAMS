import { addComment } from "@/api/event";
import { useUser } from "@/api/queries";
import { cn, formatDate, getInitials } from "@/utils";
import { Comment } from "@/utils/types";
import { Label } from "@radix-ui/react-label";
import { ScrollArea } from "@radix-ui/react-scroll-area";
import { useState, useTransition } from "react";
import { useQueryClient } from "react-query";
import { toast } from "sonner";
import { Comment as CommentIcon, Spinner } from "../icons";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Button } from "../ui/button";
import { Input } from "../ui/input";

export function CommentsBox({
  eventId,
  animalId,
  comments,
  className,
  compact = false,
}: {
  eventId: string;
  animalId?: string;
  comments: Comment[];
  className?: string;
  compact?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [comment, setComment] = useState("");
  const [isLoading, startTransition] = useTransition();
  const { data: user, isLoading: isUserLoading } = useUser();
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
        if (animalId) {
          queryClient.invalidateQueries({
            queryKey: ["animal_details", animalId],
          });
        }
        queryClient.invalidateQueries({
          queryKey: ["upcomingLiveEvents"],
        });
      });
      return;
    }
    setIsOpen((prev) => !prev);
  };

  return (
    <ScrollArea
      className={cn(
        "flex h-[200px] w-full flex-col rounded-lg bg-model px-2 py-2",
        className,
      )}
    >
      <form className="flex flex-col gap-1">
        <div className="flex items-center justify-between">
          <Label className="font-light">Comment</Label>
          {compact ? (
            <Button
              variant="ghost"
              size="icon"
              onClick={onClick}
              disabled={isLoading}
            >
              <CommentIcon className="size-5" />
            </Button>
          ) : (
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
          )}
        </div>
        {isOpen && (
          <div className="my-2 mr-2 flex items-center gap-3">
            {!compact && (
              <Avatar className="size-12 bg-secondary">
                <AvatarImage src={user?.image!} />
                <AvatarFallback className="mx-auto self-center text-xl">
                  {getInitials(user?.first_name!, user?.last_name)}
                </AvatarFallback>
              </Avatar>
            )}
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

      <div className="flex flex-col gap-2">
        {comments.map((comment) => (
          <CommentEntry
            key={comment.comment.id}
            comment={comment}
            compact={compact}
          />
        ))}
        {comments.length === 0 && (
          <div className="flex items-center justify-center font-light text-sm text-muted-foreground h-12">
            No comments yet
          </div>
        )}
      </div>
    </ScrollArea>
  );
}

export function CommentEntry({
  comment,
  compact,
}: {
  comment: Comment;
  compact?: boolean;
}) {
  return (
    <div className="flex items-center gap-4">
      {!compact && (
        <Avatar className="size-12">
          <AvatarImage src={comment.user.image!} />
          <AvatarFallback className="mx-auto self-center text-xl">
            {getInitials(comment.user.first_name!, comment.user.last_name)}
          </AvatarFallback>
        </Avatar>
      )}
      <div className="grid gap-1">
        <div className="flex items-center gap-4 text-xs">
          <p>
            {comment.user.first_name} {comment.user.last_name}
          </p>
          <span className="font-extralight text-muted-foreground">
            {formatDate(comment.comment.created_at)}
          </span>
        </div>
        <p className="text-sm font-light">{comment.comment.comment}</p>
      </div>
    </div>
  );
}
