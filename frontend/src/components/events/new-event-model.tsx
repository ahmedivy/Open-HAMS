import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { AutoComplete } from "antd";

import { Button } from "@/components/ui/button";

import { Plus } from "lucide-react";
import { useState } from "react";
import { DatePickerWithRange } from "../dashboard/data-range-picker";
import { Avatar, AvatarImage } from "../ui/avatar";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Switch } from "../ui/switch";
import { Textarea } from "../ui/textarea";
import { TimePicker } from "../ui/time-picker/time-picker-12h";

import { EventSchema, eventSchema } from "@/api/schemas/event";
import { useEventType } from "@/queries/roles";
import { useAnimal, useZoos } from "@/queries/zoo";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
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
import { useQuery } from "react-query";

export function NewEventModel() {
  const [date, setDate] = useState(new Date());
  const { data: eventTypes, isLoading: isLoadingEventTypes } = useEventType();

  const { data: zoos, isLoading: isLoadingZoos } = useZoos();

  const form = useForm<EventSchema>({
    resolver: zodResolver(eventSchema),
    defaultValues: {},
  });

  const onSubmit = (values: EventSchema) => {
    console.log(values);
  };

  return (
    <Dialog>
      <DialogTrigger>
        <Button className="ml-auto">
          <Plus className="mr-2 size-4" />
          Create New Event
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-fit">
        <DialogTitle className="mb-3 text-center">Create New Event</DialogTitle>
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
                <HandlerSelect />
                <div className="grid gap-2">
                  <Label className="text-sm">Animals</Label>
                  <div className="flex items-center gap-2">
                    <Plus className="size-4" />
                    {/* <Avatar className="size-5">
                    <AvatarImage src="https://avatar.vercel.sh/ahmedivy.png" />
                    </Avatar>
                    <Avatar className="size-5">
                    <AvatarImage src="https://avatar.vercel.sh/ahmedivy.png" />
                    </Avatar>
                    <Avatar className="size-5">
                    <AvatarImage src="https://avatar.vercel.sh/ahmedivy.png" />
                    </Avatar> */}
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <Label className="text-sm">Check out immediately</Label>
                  <Switch />
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
                      defaultValue={field.value as any as string}
                    >
                      <FormControl>
                        <SelectTrigger className="w-40">
                          <SelectValue placeholder="Select Event Type" />
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
                      defaultValue={field.value as any as string}
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
              <div className="my-2 flex justify-end">
                <Button>Create</Button>
              </div>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

function HandlerSelect() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedHandlers, setSelectedHandlers] = useState<string[]>([]);
  const [value, setValue] = useState("");

  const {data: animals, isLoading} = useQuery({
    queryKey: ["animals", "statuses"]
  })

  const options = [
    { value: "control mode", label: "Control Mode" },
    { value: "manual mode", label: "Manual Mode" },
    { value: "auto mode", label: "Auto Mode" },
  ];

  const onSelect = (value: string) => {
    setSelectedHandlers([...selectedHandlers, value]);
    setValue("");
  };

  return (
    <div className="grid gap-2">
      <Label className="text-sm">Handler</Label>
      <div className="flex items-center gap-2">
        {isOpen ? (
          <>
            <AutoComplete
              value={value}
              options={options}
              style={{ width: 200 }}
              onSelect={onSelect}
              onSearch={() => {}}
              onChange={(value) => setValue(value)}
              placeholder="control mode"
            />
          </>
        ) : (
          <>
            <Plus
              className="size-5 cursor-pointer"
              onClick={() => setIsOpen(true)}
            />
            <Avatar className="size-6">
              <AvatarImage src="https://avatar.vercel.sh/ahmedivy.png" />
            </Avatar>
          </>
        )}
      </div>
    </div>
  );
}
