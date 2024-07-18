import { DialogTitle } from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";

import { useState } from "react";
import { DatePickerWithRange } from "../dashboard/data-range-picker";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Switch } from "../ui/switch";
import { Textarea } from "../ui/textarea";
import { TimePicker } from "../ui/time-picker/time-picker-12h";

import { deleteEvent, updateEvent } from "@/api/event";
import {
  useAnimalStatus,
  useEvent,
  useEventType,
  useHandlers,
  useZoos,
} from "@/api/queries";
import {
  EventSchema,
  eventSchema,
  transformEventSchema,
} from "@/api/schemas/event";
import { EventWithDetails } from "@/utils/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useQueryClient } from "react-query";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { LoadingDots, Spinner } from "../icons";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../ui/alert-dialog";
import { Avatar, AvatarImage } from "../ui/avatar";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";
import { CustomSelect } from "./custom-select";

export function EditEventFormWrapper({ eventId }: { eventId: string }) {
  const eventDetails = useEvent(eventId);
  if (eventDetails.isLoading) return <LoadingDots className="size-4" />;

  return <EditEventForm eventDetails={eventDetails.data!} />;
}

export function EditEventForm({
  eventDetails,
}: {
  eventDetails: EventWithDetails;
}) {
  const form = useForm<EventSchema>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      name: eventDetails.event.name,
      description: eventDetails.event.description,
      date: {
        from: new Date(eventDetails.event.start_at),
        to: new Date(eventDetails.event.end_at),
      },
      startTime: new Date(eventDetails.event.start_at),
      endTime: new Date(eventDetails.event.end_at),
      event_type_id: eventDetails.event_type.id.toString(),
      zoo_id: eventDetails.event.zoo_id.toString(),
    },
  });

  const { data: eventTypes, isLoading: isLoadingEventTypes } = useEventType();
  const { data: zoos, isLoading: isLoadingZoos } = useZoos();
  const { data: handlers, isLoading: isLoadingHandlers } = useHandlers();
  const { data: animals, isLoading: isLoadingAnimals } = useAnimalStatus();

  const navigate = useNavigate();

  const queryClient = useQueryClient();

  const [selectedAnimals, setSelectedAnimals] = useState<string[]>(
    eventDetails.animals.map((animal) => animal.id.toString()) ?? [],
  );
  const [selectedHandlers, setSelectedHandlers] = useState<string[]>(
    eventDetails.users.map((user) => user.id.toString()) ?? [],
  );
  const [checkoutImmediately, setCheckoutImmediately] =
    useState<boolean>(false);

  if (
    isLoadingEventTypes ||
    isLoadingZoos ||
    isLoadingHandlers ||
    isLoadingAnimals
  ) {
    return <LoadingDots className="size-4" />;
  }

  const onSubmit = async (values: EventSchema) => {
    const eventData = transformEventSchema(values);
    const data = {
      event: eventData,
      animal_ids: selectedAnimals,
      user_ids: selectedHandlers,
      checkout_immediately: checkoutImmediately,
    };

    console.log(data);

    const res = await updateEvent(data, eventDetails.event.id.toString());
    if (res.status === 200) {
      toast.success("Event updated successfully");
      queryClient.invalidateQueries({
        queryKey: ["events", eventDetails.event.id],
      });
      queryClient.invalidateQueries({
        queryKey: ["events"],
      });
    } else {
      toast.error(res.data.detail);
    }
  };

  return (
    <>
      <DialogTitle className="mb-3 text-center">Edit Event</DialogTitle>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex gap-8">
          <div className="grid w-80 gap-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Enter event name" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date</FormLabel>
                  <FormControl>
                    <DatePickerWithRange
                      className="w-full"
                      date={field.value}
                      setDate={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* <div className="flex items-center justify-between gap-8"> */}
            <FormField
              control={form.control}
              name="startTime"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Start Time</FormLabel>
                  <FormControl>
                    <TimePicker date={field.value} setDate={field.onChange} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="endTime"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>End Time</FormLabel>
                  <FormControl>
                    <TimePicker date={field.value} setDate={field.onChange} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Enter event description"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="flex flex-col gap-4">
            <div className="grid w-72 gap-4 rounded-lg bg-[#E5EEF5] p-4">
              <div className="grid gap-2">
                <CustomSelect
                  label="Handlers"
                  placeholder="Search handlers"
                  options={handlers!.map((handler) => ({
                    value: handler.id.toString(),
                    label: `${handler.first_name} ${handler.last_name}`,
                    toRender: (
                      <>
                        <Avatar className="size-5">
                          <AvatarImage src="/placeholder-avatar.png" />
                        </Avatar>
                        <span className="text-xs font-light text-foreground">
                          {handler.first_name} {handler.last_name}
                        </span>
                      </>
                    ),
                  }))}
                  selected={selectedHandlers}
                  setSelected={setSelectedHandlers}
                  listElement={({ value }: { value: string }) => {
                    const handler = handlers!.find(
                      (handler) => handler.id.toString() === value,
                    );
                    return (
                      <AvatarWithTooltip src="/placeholder-avatar.png">
                        <div className="flex items-center gap-2">
                          <Avatar className="size-8">
                            <AvatarImage src="/placeholder-avatar.png" />
                          </Avatar>
                          <span className="text-md font-semibold">
                            {handler?.first_name} {handler?.last_name}
                          </span>
                          <Button
                            className="ml-auto"
                            size={"xs"}
                            onClick={(e) => {
                              e.preventDefault();

                              setSelectedHandlers((prev) =>
                                prev.filter((id) => id !== value),
                              );
                            }}
                          >
                            Remove
                          </Button>
                        </div>
                        <div className="mt-2 flex items-center gap-2">
                          <Label className="text-xs font-semibold">
                            Email:
                          </Label>
                          <span className="text-xs">{handler?.email}</span>
                        </div>
                        <div className="mt-2 flex items-center gap-2">
                          <Label className="text-xs font-semibold">Zoo:</Label>
                          <span className="text-xs">{handler?.zoo?.name}</span>
                        </div>
                      </AvatarWithTooltip>
                    );
                  }}
                />
                <CustomSelect
                  label="Animals"
                  placeholder="Search animals"
                  options={animals!.map((animal_info) => ({
                    value: animal_info.animal.id.toString(),
                    label: animal_info.animal.name,
                    toRender: (
                      <>
                        <Avatar className="size-5">
                          <AvatarImage src="/placeholder-avatar.png" />
                        </Avatar>
                        <span className="font-extralightlight text-xs text-foreground">
                          {animal_info.animal.name}
                        </span>
                        <span className="ml-auto">
                          {animal_info.status === "available" ? (
                            <div className="flex items-center gap-2">
                              <span className="text-green-400">Available</span>
                            </div>
                          ) : animal_info.status === "unavailable" ? (
                            <div className="flex items-center">
                              <span>Unavailable</span>
                              <span className="w-[30px] text-wrap text-start text-[8px] leading-tight">
                                {animal_info.status_description}
                              </span>
                            </div>
                          ) : (
                            <span className="">Checked Out</span>
                          )}
                        </span>
                      </>
                    ),
                  }))}
                  selected={selectedAnimals}
                  setSelected={setSelectedAnimals}
                  listElement={({ value }: { value: string }) => {
                    const animal = animals!.find(
                      (animal_info) =>
                        animal_info.animal.id.toString() === value,
                    );
                    return (
                      <AvatarWithTooltip src="/placeholder-avatar.png">
                        <div className="flex items-center gap-2">
                          <Avatar className="size-8">
                            <AvatarImage src="/placeholder-avatar.png" />
                          </Avatar>
                          <span className="text-md font-semibold">
                            {animal?.animal.name}
                          </span>
                          <Button
                            className="ml-auto"
                            size={"xs"}
                            onClick={(e) => {
                              e.preventDefault();

                              setSelectedAnimals((prev) =>
                                prev.filter((id) => id !== value),
                              );
                            }}
                          >
                            Remove
                          </Button>
                        </div>

                        <div className="mt-2 flex items-center gap-2">
                          <Label className="text-xs font-semibold">
                            Status:
                          </Label>
                          <span className="text-xs">
                            {animal?.status_description}
                          </span>
                        </div>
                      </AvatarWithTooltip>
                    );
                  }}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label className="text-sm">Check out immediately</Label>
                <Switch
                  checked={checkoutImmediately}
                  onCheckedChange={setCheckoutImmediately}
                />
              </div>
            </div>
            <FormField
              control={form.control}
              name="event_type_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Event Type</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="w-40">
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {eventTypes?.map((eventType) => (
                        <SelectItem
                          key={eventType.id}
                          value={eventType.id.toString()}
                        >
                          {eventType.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="zoo_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Zoo</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="w-40">
                        <SelectValue placeholder="Select Zoo" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {zoos?.map((zoo) => (
                        <SelectItem key={zoo.id} value={zoo.id.toString()}>
                          {zoo.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="my-4 flex w-full items-center justify-start">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant={"destructive"} size="sm" className="">
                    Delete Event
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>
                      Are you absolutely sure?
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete
                      event <strong>{eventDetails.event.name}</strong>.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <Button
                      onClick={async () => {
                        console.log("Cancel");

                        const res = await deleteEvent(
                          eventDetails.event.id.toString(),
                        );
                        if (res.status === 200) {
                          toast.success("Event deleted successfully");
                          queryClient.invalidateQueries({
                            queryKey: ["events"],
                          });
                          navigate(0);
                        } else {
                          toast.error(res.data.detail);
                        }
                      }}
                      variant={"destructive"}
                    >
                      Delete
                    </Button>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
            <div className="mt-auto flex justify-end">
              <Button disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? (
                  <Spinner className="mr-2 size-4" />
                ) : null}
                Save
              </Button>
            </div>
          </div>
        </form>
      </Form>
    </>
  );
}

function AvatarWithTooltip({
  src,
  children,
}: {
  src: string;
  children: React.ReactNode;
}) {
  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Avatar className="size-8">
            <AvatarImage src={src} />
          </Avatar>
        </TooltipTrigger>
        <TooltipContent className="min-w-[200px] border bg-background shadow-lg">
          {children}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
