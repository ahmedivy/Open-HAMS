import { useState } from "react";
import { z } from "zod";
import { Comment } from "../icons";
import { Avatar, AvatarImage } from "../ui/avatar";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { ScrollArea } from "../ui/scroll-area";

export function EventCard() {
  return (
    <Card className="w-full rounded-none border-b p-4 shadow-lg">
      <div className="grid gap-2">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold">Event Name</h3>
          <Badge variant={"outline"}>Event Type</Badge>
        </div>
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            June 7th, 2021 - June 8th, 2021
          </p>
          <p className="text-sm text-muted-foreground">
            Start Time: <span className="font-semibold">10:00 AM</span> - End
            Time: <span className="font-semibold">12:00 PM</span>
          </p>
        </div>
        <div className="mt-2 grid grid-cols-2 gap-2">
          <div className="grid w-full gap-2 rounded-lg bg-model p-4">
            <Label className="text-sm font-light">Description</Label>
            <p className="text-sm">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
              eiusmod tempor incididunt ut labore et dolore magna aliqua.
            </p>
          </div>
          <div className="grid w-full gap-2 rounded-lg bg-model p-4">
            <Label>Description</Label>
            <p className="text-sm text-muted-foreground">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
              eiusmod tempor incididunt ut labore et dolore magna aliqua.
            </p>
          </div>
        </div>
        <CommentsBox />
      </div>
    </Card>
  );
}

export function CommentsBox() {
  const [isOpen, setIsOpen] = useState(false);
  const [comment, setComment] = useState("");

  const commentSchema = z.object({
    comment: z.string({ message: "Please enter a comment" }),
  });

  const onClick = (e: any) => {
    e.preventDefault();
    
    if (isOpen && comment.length > 0) {
      console.log(comment);

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
          >
            {isOpen && comment ? "Submit" : isOpen ? "Cancel" : "Comment"}
            <Comment className="ml-2 size-5" />
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
        <CommentEntry />
        <CommentEntry />
        <CommentEntry />
      </div>
    </ScrollArea>
  );
}

export function CommentEntry() {
  return (
    <div className="flex items-center gap-4">
      <Avatar className="size-12">
        <AvatarImage src="/placeholder-avatar.png" />
      </Avatar>
      <div className="grid gap-1">
        <div className="flex items-center gap-2 text-xs">
          <p>John Doe</p>
          <span className="font-extralight">June 7th, 2021</span>
        </div>
        <p className="text-sm font-normal">
          Simba was a hit at the event! He interacted with the guests and seemed
          to enjoy the attention.
        </p>
      </div>
    </div>
  );
}
