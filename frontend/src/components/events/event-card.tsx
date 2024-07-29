import {
  checkinAnimals,
  checkoutAnimals,
  reAssignAnimalsToEvent,
  reAssignHandlersToEvent,
} from "@/api/event";
import { useAnimalStatus } from "@/api/queries";
import { arraysEqual, cn, formatDate, formatTime } from "@/utils";
import {
  AnimalEventWithDetails,
  EventWithDetailsAndComments,
} from "@/utils/types";
import { CheckCircle, ChevronRight, Minus, XCircle } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { LoadingDots } from "../icons";
import { Avatar, AvatarImage } from "../ui/avatar";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { Dialog, DialogContent, DialogTrigger } from "../ui/dialog";
import { Label } from "../ui/label";
import { AnimalsSelect } from "./animals-select";
import { AvatarWithTooltip } from "./avatar-with-tooltip";
import { CommentsBox } from "./comments-box";
import { EditEventFormWrapper } from "./edit-event-model";
import { HandlerSelect } from "./handlers-select";

export function EventCard({
  data,
  compact = false,
}: {
  data: EventWithDetailsAndComments;
  compact?: boolean;
}) {
  const [selectedHandlers, setSelectedHandlers] = useState<string[]>(
    data.users.map(({ user }) => user.id.toString()),
  );
  const [selectedAnimals, setSelectedAnimals] = useState<string[]>(
    data.animals.map(({ animal }) => animal.id.toString()),
  );
  const [open, setOpen] = useState(false);

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
          <div className="flex items-center gap-2">
            <Badge variant={"outline"}>{data.event_type.name}</Badge>

            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger>
                <Badge variant="secondary" className="">
                  edit
                </Badge>
              </DialogTrigger>
              <DialogContent className="max-w-fit">
                <EditEventFormWrapper
                  eventId={data.event.id.toString()}
                  setOpen={setOpen}
                />
              </DialogContent>
            </Dialog>
          </div>
        </div>
        <div className="flex flex-wrap items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {formatDate(data.event.start_at)} - {formatDate(data.event.end_at)}
          </p>
          {compact ? (
            <p className="text-sm text-muted-foreground">
              {formatTime(data.event.start_at)} -{" "}
              {formatTime(data.event.end_at)}
            </p>
          ) : (
            <p className="text-sm text-muted-foreground">
              Start Time:{" "}
              <span className="font-semibold">
                {formatTime(data.event.start_at)}
              </span>{" "}
              - End Time:{" "}
              <span className="font-semibold">
                {formatTime(data.event.end_at)}
              </span>
            </p>
          )}
        </div>
        <div
          className={cn(
            "mt-2 grid gap-2",
            compact ? "grid-cols-1" : "grid-cols-2",
          )}
        >
          <div className="grid w-full gap-2 rounded-lg bg-model p-4">
            <Label className="text-sm font-light">Description</Label>
            <p className="text-sm">{data.event.description}</p>
          </div>
          <div className="grid h-full w-full gap-2  rounded-lg bg-model p-4">
            <div className="flex w-full items-end justify-between gap-3">
              <HandlerSelect
                selectedHandlers={selectedHandlers}
                setSelectedHandlers={setSelectedHandlers}
              />
              {
                // if selected handlers changed show save button
                !arraysEqual(selectedHandlers, handlers) ? (
                  <Button size="xs" className="py-0" onClick={reAssignHandlers}>
                    Save
                  </Button>
                ) : null
              }
            </div>
            <div className="flex w-full flex-col justify-between gap-3">
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
                      <Button
                        size="xs"
                        className="ml-auto max-w-fit py-0 font-light"
                        onClick={reAssignAnimals}
                        disabled={isLoading}
                      >
                        Save
                      </Button>
                    ) : (
                      <Button
                        size="xs"
                        className="leading-0 ml-auto max-w-fit justify-between py-0"
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
    <div className="flex w-full flex-col justify-between gap-3">
      <div className="grid">
        <Label className="text-sm font-light">Animals</Label>
        <div className="flex h-12 flex-wrap items-center gap-2">
          <Minus
            className="size-5 text-red-500"
            onClick={() => props.setView?.("assign")}
          />
          {props.animalsDetails.map((animalDetails) => {
            const animalStatus = animalsStatus?.find(
              (status) => status.animal.id === animalDetails.animal.id,
            );

            return (
              <AvatarWithTooltip
                key={animalDetails.animal.id}
                src={animalDetails.animal.image!}
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
                    <AvatarImage src={animalDetails.animal.image!} />
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
          className="ml-auto max-w-fit py-0"
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
          className="ml-auto max-w-fit py-0"
          onClick={() => props.setView?.("assign")}
        >
          Cancel
        </Button>
      )}
    </div>
  );
}
