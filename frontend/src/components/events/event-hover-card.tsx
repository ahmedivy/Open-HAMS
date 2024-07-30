import {
  checkinAnimals,
  checkoutAnimals,
  reAssignAnimalsToEvent,
} from "@/api/event";
import { useAnimalStatus } from "@/api/queries";
import { arraysEqual, formatDate, formatTime } from "@/utils";
import {
  AnimalEventWithDetails,
  EventWithDetailsAndComments,
} from "@/utils/types";
import { CheckCircle, ChevronRight, Minus, XCircle } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { LoadingDots } from "../icons";
import { Avatar, AvatarImage } from "../ui/avatar";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { Label } from "../ui/label";
import { AnimalsSelect } from "./animals-select";
import { AvatarWithTooltip } from "./avatar-with-tooltip";
import { CommentsBox } from "./comments-box";

export function EventHoverCard({
  data,
  title,
}: {
  data: EventWithDetailsAndComments;
  title?: string;
  compact?: boolean;
}) {
  const [selectedAnimals, setSelectedAnimals] = useState<string[]>(
    data.animals.map(({ animal }) => animal.id.toString()),
  );

  const [animalView, setAnimalView] = useState<
    "assign" | "check_in" | "check_out"
  >("assign");
  const [isLoading, setIsLoading] = useState(false);

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

  const isEventStarted = new Date(data.event.start_at) < new Date();

  return (
    <Card className="w-full rounded-md border-b bg-model px-3 py-2 shadow-lg">
      <div className="grid gap-2">
        <div className="flex w-full justify-between gap-2">
          {animalView === "assign" && (
            <>
              <AnimalsSelect
                selectedAnimals={selectedAnimals}
                setSelectedAnimals={setSelectedAnimals}
                animalsDetails={data.animals}
                title={title || "Animals"}
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
                      setAnimalView(isEventStarted ? "check_in" : "check_out")
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
        <CommentsBox
          eventId={data.event.id.toString()}
          comments={data.comments}
          className="h-[120px] overflow-auto px-0"
          compact
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
            className="size-5 cursor-pointer text-red-500"
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
