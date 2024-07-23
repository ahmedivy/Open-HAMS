import {
  addComment,
  checkinAnimals,
  checkoutAnimals,
  reAssignAnimalsToEvent,
  reAssignHandlersToEvent,
} from "@/api/event";
import { useAnimalStatus } from "@/api/queries";
import { arraysEqual, formatDate, formatTime } from "@/utils";
import {
  AnimalEventWithDetails,
  Comment,
  EventWithDetailsAndComments,
} from "@/utils/types";
import { CheckCircle, ChevronRight, Minus, XCircle } from "lucide-react";
import { useState, useTransition } from "react";
import { useQueryClient } from "react-query";
import { toast } from "sonner";
import { Comment as CommentIcon, LoadingDots, Spinner } from "../icons";
import { Avatar, AvatarImage } from "../ui/avatar";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { ScrollArea } from "../ui/scroll-area";
import { AnimalsSelect } from "./animals-select";
import { AvatarWithTooltip } from "./avatar-with-tooltip";
import { HandlerSelect } from "./handlers-select";

export function EventCard({ data }: { data: EventWithDetailsAndComments }) {
  const [selectedHandlers, setSelectedHandlers] = useState<string[]>(
    data.users.map(({ user }) => user.id.toString()),
  );
  const [selectedAnimals, setSelectedAnimals] = useState<string[]>(
    data.animals.map(({ animal }) => animal.id.toString()),
  );

  const [animalView, setAnimalView] = useState<
    "assign" | "check_in" | "check_out"
  >("assign");
  const [isLoading, setIsLoading] = useState(false);

  const handlers = data.users.map(({ user }) => user.id.toString());
  const animals = data.animals.map(({ animal }) => animal.id.toString());

  async function reAssignAnimals() {
    const animalIds = selectedAnimals.map((id) => parseInt(id));

    setIsLoading(true);
    const res = await reAssignAnimalsToEvent(
      data.event.id.toString(),
      animalIds.map((id) => id.toString()),
    );

    if (res.status === 200) {
      toast.success(res.data.message);
    } else {
      toast.error(res.data.detail);
    }
    setIsLoading(false);
  }

  async function reAssignHandlers() {
    const handlerIds = selectedHandlers.map((id) => parseInt(id));

    setIsLoading(true);
    const res = await reAssignHandlersToEvent(
      data.event.id.toString(),
      handlerIds.map((id) => id.toString()),
    );

    if (res.status === 200) {
      toast.success(res.data.message);
    } else {
      toast.error(res.data.detail);
    }
    setIsLoading(false);
  }

  const isEventStarted = new Date(data.event.start_at) < new Date();

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
          <div className="grid h-full w-full gap-2 overflow-auto rounded-lg bg-model p-4">
            <div className="flex w-full items-end justify-between gap-3">
              <HandlerSelect
                selectedHandlers={selectedHandlers}
                setSelectedHandlers={setSelectedHandlers}
              />
              {
                // if selected handlers changed show save button
                !arraysEqual(selectedHandlers, handlers) ? (
                  <Button size="xs" className="py-0">
                    Save
                  </Button>
                ) : null
              }
            </div>
            <div className="flex w-full items-end justify-between gap-3">
              {animalView === "assign" && (
                <>
                  <AnimalsSelect
                    selectedAnimals={selectedAnimals}
                    setSelectedAnimals={setSelectedAnimals}
                    animalsDetails={data.animals}
                  />
                  {
                    // if selected animals changed show save button
                    !arraysEqual(selectedAnimals, animals) ? (
                      <Button size="xs" className="py-0 font-light">
                        Save
                      </Button>
                    ) : (
                      <Button
                        size="xs"
                        className="leading-0 justify-between py-0"
                        onClick={() =>
                          setAnimalView(
                            isEventStarted ? "check_in" : "check_out",
                          )
                        }
                      >
                        {isEventStarted ? "Check In" : "Check Out"}
                        <ChevronRight className="ml-2 size-4" />
                      </Button>
                    )
                  }
                </>
              )}
              {animalView === "check_in" && (
                <>
                  <AnimalCheckInOut
                    eventId={data.event.id.toString()}
                    mode="check_in"
                    animalsDetails={data.animals}
                    setView={setAnimalView}
                  />
                </>
              )}
              {animalView === "check_out" && (
                <>
                  <AnimalCheckInOut
                    eventId={data.event.id.toString()}
                    mode="check_out"
                    animalsDetails={data.animals}
                    setView={setAnimalView}
                  />
                </>
              )}
            </div>
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

function AnimalCheckInOut(props: {
  eventId: string;
  mode: "check_in" | "check_out";
  animalsDetails: AnimalEventWithDetails[];
  setView?: (view: "assign" | "check_in" | "check_out") => void;
}) {
  const [selected, setSelected] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const { data: animalsStatus, isLoading } = useAnimalStatus();
  if (isLoading) return <LoadingDots className="size-4" />;

  async function handleSubmit() {
    setLoading(true);

    var res;
    if (props.mode === "check_in") {
      res = await checkinAnimals(props.eventId, selected);
    } else {
      res = await checkoutAnimals(props.eventId, selected);
    }

    if (res.status === 200) {
      toast.success(res.data.message);
    } else {
      toast.error(res.data.detail);
    }
    setLoading(false);
  }

  return (
    <div className="flex w-full items-end justify-between gap-3">
      <div className="grid">
        <Label className="text-sm font-light">Animals</Label>
        <div className="flex h-12 flex-wrap items-center gap-2">
          <Minus className="size-5 text-red-500" />
          {props.animalsDetails.map((animalDetails) => {
            const animalStatus = animalsStatus?.find(
              (status) => status.animal.id === animalDetails.animal.id,
            );

            return (
              <AvatarWithTooltip
                key={animalDetails.animal.id}
                src="/placeholder-avatar.png"
                className="cursor-pointer"
                isSelected={selected.includes(
                  animalDetails.animal.id.toString(),
                )}
                onClick={() =>
                  setSelected(
                    selected.includes(animalDetails.animal.id.toString())
                      ? selected.filter(
                          (id) => id !== animalDetails.animal.id.toString(),
                        )
                      : [...selected, animalDetails.animal.id.toString()],
                  )
                }
              >
                <div className="flex items-center gap-2">
                  <Avatar className="size-8">
                    <AvatarImage src="/placeholder-avatar.png" />
                  </Avatar>
                  <span className="text-md font-semibold">
                    {animalDetails?.animal.name}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-2">
                  <Label className="text-xs font-light">
                    Checkout for Event:
                  </Label>
                  {animalDetails.animal_event.checked_out ? (
                    <p>
                      {formatDate(animalDetails.animal_event.checked_out)} -
                      {formatTime(animalDetails.animal_event.checked_out)}
                    </p>
                  ) : (
                    <p>N/A</p>
                  )}
                </div>

                <div className="flex items-center justify-between gap-2">
                  <Label className="text-xs font-light">
                    Checkin for Event:
                  </Label>
                  {animalDetails.animal_event.checked_in ? (
                    <p>
                      {`${formatDate(animalDetails.animal_event.checked_in)}`}-
                      {formatTime(animalDetails.animal_event.checked_in)}
                    </p>
                  ) : (
                    <p>N/A</p>
                  )}
                </div>

                <div className="my-2">
                  {animalStatus?.status === "available" ? (
                    <div className="grid gap-2">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="size-4 text-green-500" />
                        <span className="text-sm">Available</span>
                      </div>
                      <p>{animalStatus?.status_description}</p>
                    </div>
                  ) : animalStatus?.status === "unavailable" ? (
                    <div className="grid gap-2">
                      <div className="flex items-center gap-2">
                        <XCircle className="size-4 text-red-500" />
                        <span className="text-sm">Unavailable</span>
                      </div>
                      <p>{animalStatus?.status_description}</p>
                    </div>
                  ) : (
                    <div className="grid gap-2">
                      <div className="flex items-center gap-2">
                        <XCircle className="size-4" />
                        <span className="text-sm">Checked Out</span>
                      </div>
                      <p>{animalStatus?.status_description}</p>
                    </div>
                  )}
                </div>
              </AvatarWithTooltip>
            );
          })}
        </div>
      </div>
      {selected.length > 0 ? (
        <Button
          size="xs"
          className="py-0"
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading
            ? "Loading..."
            : props.mode === "check_in"
              ? "Check In"
              : "Check Out"}
        </Button>
      ) : (
        <Button
          size="xs"
          className="py-0"
          onClick={() => props.setView?.("assign")}
        >
          Cancel
        </Button>
      )}
    </div>
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
