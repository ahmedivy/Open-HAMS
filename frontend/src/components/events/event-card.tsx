import { reAssignAnimalsToEvent, reAssignHandlersToEvent } from "@/api/event";
import { useUser } from "@/api/queries";
import {
  arraysEqual,
  cn,
  formatDate,
  formatTime,
  hasPermission,
} from "@/utils";
import { EventWithDetailsAndComments } from "@/utils/types";
import { ChevronRight } from "lucide-react";
import { useState } from "react";
import { useQueryClient } from "react-query";
import { toast } from "sonner";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { Dialog, DialogContent, DialogTrigger } from "../ui/dialog";
import { Label } from "../ui/label";
import { AnimalsSelect } from "./animals-select";
import { AnimalCheckInOut } from "./check-in-out";
import { CommentsBox } from "./comments-box";
import { EditEventFormWrapper } from "./edit-event-model";
import { HandlerSelect } from "./handlers-select";

export function EventCard({
  data,
  compact = false,
  className,
}: {
  data: EventWithDetailsAndComments;
  compact?: boolean;
  className?: string;
}) {
  const [selectedHandlers, setSelectedHandlers] = useState<string[]>(
    data.users.map(({ user }) => user.id.toString()),
  );
  const [selectedAnimals, setSelectedAnimals] = useState<string[]>(
    data.animals.map(({ animal }) => animal.id.toString()),
  );
  const [open, setOpen] = useState(false);
  const user = useUser();
  const queryClient = useQueryClient();

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
      queryClient.resetQueries();
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
      queryClient.resetQueries();
    } else {
      toast.error(res.data.detail);
    }
    setIsLoading(false);
  }

  const isEventStarted = new Date(data.event.start_at) < new Date();

  return (
    <Card className={cn("w-full rounded-none border-b p-4 shadow-lg", className)}>
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
            compact ? "grid-cols-1" : "lg:grid-cols-2",
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
                !user.isLoading &&
                hasPermission(user.data!, "update_events") &&
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
                    !user.isLoading &&
                    hasPermission(user.data!, "update_events") &&
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
                      hasPermission(user.data!, "checkin_animals") && (
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
